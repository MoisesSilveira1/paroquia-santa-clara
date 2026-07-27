// Dados de demonstração da paróquia (placeholders realistas — confirmar com a secretaria)

export const paroquia = {
  nome: "Paróquia Santa Clara e São Francisco de Assis",
  endereco:
    "SH Jardim Botânico Condomínio Parque — Jardim Botânico, Brasília - DF, CEP 71680-000",
  telefone: "(61) 3366-0000",
  whatsapp: "5561933660000",
  email: "secretaria@paroquiasantaclarasf.com.br",
  horarioSecretaria: "Terça a sexta, 9h às 18h · Sábado, 9h às 12h",
  mapaEmbedUrl:
    "https://www.google.com/maps?q=Jardim+Bot%C3%A2nico+Condom%C3%ADnio+Parque,+Bras%C3%ADlia+-+DF&output=embed",
};

export type Horario = {
  dia: string;
  atividades: { hora: string; nome: string }[];
};

export const horariosMissas: Horario[] = [
  { dia: "Domingo", atividades: [
    { hora: "08h00", nome: "Santa Missa" },
    { hora: "10h00", nome: "Santa Missa (com catequese infantil)" },
    { hora: "19h00", nome: "Santa Missa" },
  ]},
  { dia: "Terça-feira", atividades: [
    { hora: "19h30", nome: "Santa Missa" },
  ]},
  { dia: "Quarta-feira", atividades: [
    { hora: "19h30", nome: "Santa Missa e Novena de São Francisco" },
  ]},
  { dia: "Quinta-feira", atividades: [
    { hora: "19h00", nome: "Adoração ao Santíssimo" },
    { hora: "20h00", nome: "Santa Missa" },
  ]},
  { dia: "Sexta-feira", atividades: [
    { hora: "19h30", nome: "Santa Missa" },
  ]},
  { dia: "Sábado", atividades: [
    { hora: "16h00", nome: "Confissões" },
    { hora: "18h00", nome: "Santa Missa (dominical antecipada)" },
  ]},
];

export const sacramentos = [
  {
    nome: "Batismo",
    descricao:
      "Preparação dos pais e padrinhos no 2º sábado do mês, às 15h. Celebração no 4º domingo, após a missa das 10h. Inscrições na secretaria.",
  },
  {
    nome: "Confissões",
    descricao:
      "Sábados, das 16h às 17h30, ou mediante agendamento com o pároco pela secretaria.",
  },
  {
    nome: "Catequese (1ª Eucaristia)",
    descricao:
      "Encontros aos domingos, às 9h, para crianças a partir de 8 anos. Matrículas abertas no início de cada semestre.",
  },
  {
    nome: "Crisma",
    descricao:
      "Preparação para jovens a partir de 14 anos e adultos. Encontros aos sábados, às 16h.",
  },
  {
    nome: "Matrimônio",
    descricao:
      "Agendar com pelo menos 6 meses de antecedência na secretaria. Curso de noivos trimestral.",
  },
  {
    nome: "Adoração ao Santíssimo",
    descricao: "Quintas-feiras, às 19h, antes da Santa Missa.",
  },
];

export type Pastoral = {
  nome: string;
  descricao: string;
  contato: string;
  reunioes: string;
};

export const pastorais: Pastoral[] = [
  {
    nome: "Catequese",
    descricao: "Iniciação cristã de crianças, preparação para a 1ª Eucaristia.",
    contato: "Maria Helena — (61) 99999-0001",
    reunioes: "Domingos, 9h",
  },
  {
    nome: "Crisma",
    descricao: "Formação de jovens e adultos para o sacramento da Confirmação.",
    contato: "João Pedro — (61) 99999-0002",
    reunioes: "Sábados, 16h",
  },
  {
    nome: "Pastoral do Dízimo",
    descricao: "Conscientização sobre a partilha e acolhida dos dizimistas.",
    contato: "Ana Lúcia — (61) 99999-0003",
    reunioes: "1ª segunda do mês, 20h",
  },
  {
    nome: "MESC",
    descricao:
      "Ministros Extraordinários da Sagrada Comunhão — serviço ao altar e aos enfermos.",
    contato: "Carlos Alberto — (61) 99999-0004",
    reunioes: "2ª quinta do mês, 20h30",
  },
  {
    nome: "Liturgia",
    descricao: "Preparação das celebrações, leituras, música e ambientação.",
    contato: "Fernanda — (61) 99999-0005",
    reunioes: "Quartas, 20h30",
  },
  {
    nome: "Pastoral da Caridade",
    descricao:
      "Ação social franciscana: cestas básicas, visitas e campanhas solidárias.",
    contato: "Irmã Regina — (61) 99999-0006",
    reunioes: "Sábados, 9h",
  },
  {
    nome: "Pastoral Familiar",
    descricao: "Acompanhamento de casais, curso de noivos e encontros de famílias.",
    contato: "Rodrigo e Patrícia — (61) 99999-0007",
    reunioes: "3º domingo do mês, 17h",
  },
  {
    nome: "Juventude Franciscana",
    descricao: "Grupo de jovens: oração, formação, missão e convivência.",
    contato: "Beatriz — (61) 99999-0008",
    reunioes: "Sextas, 20h30",
  },
];

export type Noticia = {
  slug: string;
  titulo: string;
  data: string;
  resumo: string;
  categoria: "Notícia" | "Evento";
};

export const noticias: Noticia[] = [
  {
    slug: "festa-sao-francisco-2026",
    titulo: "Festa de São Francisco de Assis 2026",
    data: "4 de outubro de 2026",
    resumo:
      "Novena de 25/09 a 03/10, às 19h30, com missa festiva e quermesse no dia 4 de outubro. Participe com toda a família!",
    categoria: "Evento",
  },
  {
    slug: "festa-santa-clara-2026",
    titulo: "Festa de Santa Clara",
    data: "11 de agosto de 2026",
    resumo:
      "Tríduo de 08 a 10/08 e missa solene no dia 11, às 19h30, em honra à nossa padroeira Santa Clara de Assis.",
    categoria: "Evento",
  },
  {
    slug: "matriculas-catequese",
    titulo: "Matrículas abertas para a Catequese",
    data: "20 de julho de 2026",
    resumo:
      "Estão abertas as matrículas para a catequese infantil e Crisma do 2º semestre. Procure a secretaria paroquial.",
    categoria: "Notícia",
  },
  {
    slug: "bazar-solidario",
    titulo: "Bazar Solidário da Pastoral da Caridade",
    data: "15 de agosto de 2026",
    resumo:
      "Doações de roupas e utensílios podem ser entregues na secretaria. Toda a renda será revertida às famílias assistidas.",
    categoria: "Evento",
  },
  {
    slug: "curso-de-noivos",
    titulo: "Curso de Noivos — turma do 3º trimestre",
    data: "5 de setembro de 2026",
    resumo:
      "Encontro de preparação para o Matrimônio com a Pastoral Familiar. Inscrições pelo WhatsApp da secretaria.",
    categoria: "Notícia",
  },
  {
    slug: "transitus-sao-francisco",
    titulo: "Trânsito de São Francisco",
    data: "3 de outubro de 2026",
    resumo:
      "Celebração do Trânsito de São Francisco às 19h30, memória da páscoa do Pobrezinho de Assis, véspera da festa do padroeiro.",
    categoria: "Evento",
  },
];

export const avisosSemana = [
  "Nesta quinta-feira, Adoração ao Santíssimo às 19h, seguida da Santa Missa.",
  "Matrículas da catequese abertas na secretaria até o fim do mês.",
  "Sábado, às 9h, mutirão da Pastoral da Caridade para montagem de cestas básicas.",
];

export const dizimo = {
  chavePix: "dizimo@paroquiasantaclarasf.com.br",
  banco: "Banco do Brasil",
  agencia: "0000-1",
  conta: "12.345-6",
  titular: "Paróquia Santa Clara e São Francisco de Assis",
  cnpj: "00.000.000/0001-00",
};
