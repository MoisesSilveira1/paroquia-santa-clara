// Dados da paróquia — fonte: Arquidiocese de Brasília (arqbrasilia.com.br) e canal
// oficial no YouTube, consultados em 27/07/2026. Confirmar com a secretaria antes
// de publicar. Itens marcados como DEMO ainda são fictícios.

export const paroquia = {
  nome: "Paróquia Santa Clara e São Francisco de Assis",
  endereco:
    "SHJBS Etapa III, Av. Dom Bosco, Qd. 01 Lote A — Jardim Botânico, Brasília-DF, CEP 71.680-366",
  telefone: "(61) 3427-3281",
  whatsapp: "5561996218696",
  email: "paroquiasantaclaradeassis@gmail.com",
  horarioSecretaria:
    "Terça a sexta, 9h–12h e 13h–18h · Sábado, 9h–12h e 13h–17h",
  mapaEmbedUrl:
    "https://www.google.com/maps?q=Par%C3%B3quia+Santa+Clara+e+S%C3%A3o+Francisco+de+Assis,+Av.+Dom+Bosco,+Jardim+Bot%C3%A2nico,+Bras%C3%ADlia+-+DF&output=embed",
};

export const youtube = {
  canalId: "UCB14Q-4k6DoG2x3ZHm5m1Hg",
  canalUrl: "https://www.youtube.com/@paroquiasantaclaraesaofran3560",
  // Playlist automática de "uploads" do canal (últimas missas gravadas)
  playlistUploads: "UUB14Q-4k6DoG2x3ZHm5m1Hg",
  horariosTransmissao: [
    "Domingo, 19h — Santa Missa",
    "Quarta-feira, 20h — Missa da Saúde",
  ],
};

export type Horario = {
  dia: string;
  atividades: { hora: string; nome: string }[];
};

export const horariosMissas: Horario[] = [
  { dia: "Domingo", atividades: [
    { hora: "08h00", nome: "Santa Missa" },
    { hora: "11h00", nome: "Santa Missa" },
    { hora: "19h00", nome: "Santa Missa (transmitida ao vivo no YouTube)" },
  ]},
  { dia: "Terça-feira", atividades: [
    { hora: "07h00", nome: "Santa Missa" },
    { hora: "19h30", nome: "Santa Missa, seguida de Adoração ao Santíssimo" },
  ]},
  { dia: "Quarta-feira", atividades: [
    { hora: "07h00", nome: "Santa Missa" },
    { hora: "19h00", nome: "Adoração ao Santíssimo" },
    { hora: "20h00", nome: "Missa da Saúde (transmitida ao vivo no YouTube)" },
  ]},
  { dia: "Quinta-feira", atividades: [
    { hora: "07h00", nome: "Santa Missa" },
    { hora: "18h00", nome: "Confissões (até 19h)" },
    { hora: "19h30", nome: "Santa Missa, seguida de Adoração ao Santíssimo" },
  ]},
  { dia: "Sexta-feira", atividades: [
    { hora: "07h00", nome: "Santa Missa" },
    { hora: "18h00", nome: "Confissões (até 19h)" },
    { hora: "19h30", nome: "Santa Missa, seguida de Adoração ao Santíssimo" },
  ]},
  { dia: "Sábado", atividades: [
    { hora: "17h30", nome: "Santa Missa (Igreja Matriz)" },
    { hora: "19h00", nome: "Confissões (Capela Rainha da Paz)" },
    { hora: "19h30", nome: "Santa Missa (Capela Rainha da Paz)" },
  ]},
];

export const sacramentos = [
  {
    nome: "Confissões",
    descricao:
      "Quinta e sexta-feira, das 18h às 19h, na Igreja Matriz; sábado, às 19h, na Capela Rainha da Paz. Também mediante agendamento na secretaria.",
  },
  {
    nome: "Adoração ao Santíssimo",
    descricao:
      "Terça, quinta e sexta-feira após a missa das 19h30; quarta-feira às 19h.",
  },
  {
    nome: "Batismo",
    descricao:
      "DEMO — Preparação dos pais e padrinhos e agendamento na secretaria paroquial. Confirmar dias e horários.",
  },
  {
    nome: "Catequese (1ª Eucaristia)",
    descricao:
      "DEMO — Encontros semanais para crianças. Matrículas na secretaria no início de cada semestre.",
  },
  {
    nome: "Crisma",
    descricao:
      "DEMO — Preparação para jovens e adultos. Informações na secretaria.",
  },
  {
    nome: "Matrimônio",
    descricao:
      "DEMO — Agendar com antecedência na secretaria. Curso de noivos periódico.",
  },
];

export type Pastoral = {
  nome: string;
  descricao: string;
  contato: string;
  reunioes: string;
};

// DEMO — nomes e contatos fictícios; substituir pelos coordenadores reais
export const pastorais: Pastoral[] = [
  {
    nome: "Catequese",
    descricao: "Iniciação cristã de crianças, preparação para a 1ª Eucaristia.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "Crisma",
    descricao: "Formação de jovens e adultos para o sacramento da Confirmação.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "Pastoral do Dízimo",
    descricao: "Conscientização sobre a partilha e acolhida dos dizimistas.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "MESC",
    descricao:
      "Ministros Extraordinários da Sagrada Comunhão — serviço ao altar e aos enfermos.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "Liturgia",
    descricao: "Preparação das celebrações, leituras, música e ambientação.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "Pastoral da Caridade",
    descricao:
      "Ação social: cestas básicas, visitas e campanhas solidárias.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "Pastoral Familiar",
    descricao: "Acompanhamento de casais, curso de noivos e encontros de famílias.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
  {
    nome: "PASCOM",
    descricao:
      "Pastoral da Comunicação: transmissões das missas, redes sociais e este site.",
    contato: "Secretaria — (61) 3427-3281",
    reunioes: "Consultar secretaria",
  },
];

export type Noticia = {
  slug: string;
  titulo: string;
  data: string;
  resumo: string;
  categoria: "Notícia" | "Evento";
};

// DEMO — mural de exemplo; o conteúdo real virá do painel administrativo
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

// DEMO — os avisos reais virão do painel administrativo (Supabase)
export const avisosSemana = [
  "Quinta e sexta-feira, confissões das 18h às 19h na Igreja Matriz.",
  "Quarta-feira, às 20h, Missa da Saúde — transmitida ao vivo pelo YouTube.",
  "Acompanhe as missas de domingo às 19h também pela nossa página Missa Online.",
];

// Álbuns locais (fotos reais da PASCOM em /public) — usados na galeria e no
// painel enquanto o Supabase não está configurado
export type AlbumDemo = {
  titulo: string;
  data: string;
  fotos: string[];
};

export const albunsDemo: AlbumDemo[] = [
  {
    titulo: "Celebração na Matriz — Janeiro de 2026",
    data: "18/01/2026",
    fotos: [1, 2, 3, 4, 5, 6].map((n) => `/fotos/galeria/jan-2026/foto-${n}.jpg`),
  },
  {
    titulo: "Santa Missa em Família — Dezembro de 2025",
    data: "15/12/2025",
    fotos: [1, 2, 3, 4, 5, 6].map((n) => `/fotos/galeria/dez-2025/foto-${n}.jpg`),
  },
];

// DEMO — substituir pelos dados bancários oficiais antes de publicar
export const dizimo = {
  chavePix: "A CONFIRMAR com a secretaria",
  banco: "A confirmar",
  agencia: "—",
  conta: "—",
  titular: "Paróquia Santa Clara e São Francisco de Assis",
  cnpj: "A confirmar",
};
