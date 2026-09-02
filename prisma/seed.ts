import "dotenv/config";

import { PrismaClient } from "../lib/gerado/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { criarHashDeSenha } from "../lib/auth/senha";
import { paraSlug } from "../lib/servicos/slug";
import {
  albunsDemo,
  avisosSemana,
  horariosMissas,
  noticias,
  pastorais,
} from "../lib/dados";

/**
 * Popula o banco de desenvolvimento.
 *
 * O conteúdo vem de lib/dados.ts — os mesmos horários, pastorais e avisos que
 * o site já exibe hoje fixos no código. Assim o painel abre com o conteúdo
 * real da paróquia, e apagar aquele arquivo passa a ser só uma questão de
 * ligar as telas públicas ao banco.
 *
 * É seguro rodar mais de uma vez: tudo é gravado por uma chave estável.
 */

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL não definida. Copie .env.example para .env e preencha com a " +
      "string de conexão do banco antes de semear."
  );
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

/** Senhas de desenvolvimento. Em produção, criar os usuários pelo painel. */
const ACESSOS = [
  {
    nome: "Administrador da Paróquia",
    email: "admin@santaclara.local",
    senha: "administrador123",
    papel: "SUPER_ADMIN",
  },
  {
    nome: "Secretaria Paroquial",
    email: "secretaria@santaclara.local",
    senha: "secretaria123",
    papel: "SECRETARIA",
  },
];

const DIAS: Record<string, number> = {
  Domingo: 0,
  "Segunda-feira": 1,
  "Terça-feira": 2,
  "Quarta-feira": 3,
  "Quinta-feira": 4,
  "Sexta-feira": 5,
  Sábado: 6,
};

/** "08h00" -> "08:00" */
function paraHora(texto: string): string {
  return texto.replace("h", ":").padEnd(5, "0");
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "4 de outubro de 2026" -> Date */
function paraData(texto: string): Date | null {
  const partes = texto.toLowerCase().match(/(\d{1,2}) de (\S+) de (\d{4})/);
  if (!partes) return null;
  const mes = MESES.indexOf(partes[2]);
  if (mes < 0) return null;
  return new Date(Number(partes[3]), mes, Number(partes[1]), 12);
}

/** "18/01/2026" -> Date */
function paraDataBarra(texto: string): Date | null {
  const partes = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!partes) return null;
  return new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]), 12);
}

async function semear() {
  console.log("Semeando o banco...\n");

  // ----- usuários -----
  const criados = [];
  for (const acesso of ACESSOS) {
    const usuario = await db.usuario.upsert({
      where: { email: acesso.email },
      update: { nome: acesso.nome, papel: acesso.papel, ativo: true },
      create: {
        nome: acesso.nome,
        email: acesso.email,
        papel: acesso.papel,
        senhaHash: await criarHashDeSenha(acesso.senha),
      },
    });
    criados.push(usuario);
  }
  const admin = criados[0];
  console.log(`  ${criados.length} usuários`);

  // ----- avisos -----
  for (const [indice, texto] of avisosSemana.entries()) {
    const existente = await db.aviso.findFirst({ where: { texto } });
    if (existente) {
      await db.aviso.update({
        where: { id: existente.id },
        data: { ordem: indice },
      });
    } else {
      await db.aviso.create({ data: { texto, ordem: indice, ativo: true } });
    }
  }
  console.log(`  ${avisosSemana.length} avisos`);

  // ----- celebrações -----
  let celebracoes = 0;
  for (const dia of horariosMissas) {
    const diaSemana = DIAS[dia.dia];
    if (diaSemana === undefined) continue;

    for (const atividade of dia.atividades) {
      const transmitida = atividade.nome.includes("transmitida ao vivo");
      const local = atividade.nome.includes("Capela Rainha da Paz")
        ? "Capela Rainha da Paz"
        : "Igreja Matriz";
      // O nome no arquivo antigo carrega local e transmissão entre parênteses;
      // no banco eles são colunas próprias, então saem do texto.
      const nome = atividade.nome
        .replace(/\s*\(transmitida ao vivo no YouTube\)/, "")
        .replace(/\s*\((Igreja Matriz|Capela Rainha da Paz)\)/, "")
        .trim();
      const hora = paraHora(atividade.hora);

      const existente = await db.celebracao.findFirst({
        where: { diaSemana, hora, nome },
      });

      if (existente) {
        await db.celebracao.update({
          where: { id: existente.id },
          data: { local, transmitida, ativo: true },
        });
      } else {
        await db.celebracao.create({
          data: { diaSemana, hora, nome, local, transmitida, ativo: true },
        });
      }
      celebracoes++;
    }
  }
  console.log(`  ${celebracoes} celebrações`);

  // ----- pastorais -----
  for (const [indice, pastoral] of pastorais.entries()) {
    const slug = paraSlug(pastoral.nome);
    await db.pastoral.upsert({
      where: { slug },
      update: { ...pastoral, ordem: indice, ativa: true },
      create: { ...pastoral, slug, ordem: indice, ativa: true },
    });
  }
  console.log(`  ${pastorais.length} pastorais`);

  // ----- notícias -----
  for (const noticia of noticias) {
    const dados = {
      titulo: noticia.titulo,
      resumo: noticia.resumo,
      categoria: noticia.categoria === "Evento" ? "EVENTO" : "NOTICIA",
      status: "PUBLICADA",
      publicadaEm: paraData(noticia.data),
      autorId: admin.id,
    };
    await db.noticia.upsert({
      where: { slug: noticia.slug },
      update: dados,
      create: { ...dados, slug: noticia.slug },
    });
  }
  console.log(`  ${noticias.length} notícias`);

  // ----- galeria -----
  let fotos = 0;
  for (const album of albunsDemo) {
    const existente = await db.album.findFirst({
      where: { titulo: album.titulo },
    });
    const registro =
      existente ??
      (await db.album.create({
        data: {
          titulo: album.titulo,
          data: paraDataBarra(album.data),
          publicado: true,
        },
      }));

    for (const [ordem, url] of album.fotos.entries()) {
      const jaTem = await db.foto.findFirst({
        where: { albumId: registro.id, url },
      });
      if (!jaTem) {
        await db.foto.create({ data: { albumId: registro.id, url, ordem } });
        fotos++;
      }
    }
  }
  console.log(`  ${albunsDemo.length} álbuns, ${fotos} fotos novas`);

  // ----- mensagens de exemplo -----
  // Sem estas, a tela de mensagens nasce vazia e não dá para ver a busca, os
  // filtros e os selos de situação funcionando.
  const exemplos = [
    {
      nome: "Maria Aparecida Souza",
      email: "maria.souza@exemplo.com",
      telefone: "(61) 99812-4477",
      assunto: "Batismo do meu neto",
      corpo:
        "Boa tarde! Gostaria de saber quais documentos são necessários para o batismo e quando começa a próxima preparação de pais e padrinhos.",
      status: "NOVA",
    },
    {
      nome: "João Batista Ferreira",
      email: "joao.ferreira@exemplo.com",
      telefone: null,
      assunto: "Curso de noivos",
      corpo:
        "Boa noite. Eu e minha noiva pretendemos casar em 2027. Quando abrem as inscrições para a próxima turma do curso de noivos?",
      status: "NOVA",
    },
    {
      nome: "Rita de Cássia Lima",
      email: "rita.lima@exemplo.com",
      telefone: "(61) 98123-9090",
      assunto: "Doação para o bazar",
      corpo:
        "Tenho roupas e utensílios em bom estado para doar ao bazar da Pastoral da Caridade. Em que horários posso entregar na secretaria?",
      status: "LIDA",
    },
    {
      nome: "Antônio Carlos Pereira",
      email: "antonio.pereira@exemplo.com",
      telefone: "(61) 99433-1122",
      assunto: "Intenção de missa",
      corpo:
        "Gostaria de mandar rezar uma missa em memória da minha esposa no dia 12 do mês que vem. Como faço para agendar?",
      status: "RESPONDIDA",
    },
    {
      nome: "Luciana Martins",
      email: "luciana.martins@exemplo.com",
      telefone: null,
      assunto: "Voluntariado na catequese",
      corpo:
        "Sou professora e gostaria de ajudar na catequese das crianças. Como posso me apresentar à coordenação?",
      status: "ARQUIVADA",
    },
  ];

  let mensagens = 0;
  for (const [indice, exemplo] of exemplos.entries()) {
    const jaTem = await db.mensagem.findFirst({
      where: { email: exemplo.email, assunto: exemplo.assunto },
    });
    if (!jaTem) {
      await db.mensagem.create({
        data: {
          ...exemplo,
          // Espalhadas no tempo, para a ordenação por data ficar visível.
          criadoEm: new Date(Date.now() - indice * 19 * 60 * 60 * 1000),
        },
      });
      mensagens++;
    }
  }
  console.log(`  ${mensagens} mensagens novas\n`);

  console.log("Acessos criados:");
  for (const acesso of ACESSOS) {
    console.log(`  ${acesso.email}  senha: ${acesso.senha}  (${acesso.papel})`);
  }
  console.log("\nTroque essas senhas antes de publicar o site.");
}

semear()
  .catch((erro) => {
    console.error("Falha ao semear:", erro);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
