export const ASSUNTOS = [
  "Dúvida geral",
  "Pedido de oração",
  "Sacramentos (Batismo, Matrimônio…)",
  "Dízimo e doações",
  "Pastorais e voluntariado",
] as const;

export type Assunto = (typeof ASSUNTOS)[number];

export type MensagemContato = {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  /** Campo isca: fica escondido e só robôs preenchem. */
  confirmacao: string;
};

export type ResultadoEnvio =
  | { estado: "enviado" }
  /** Sem e-mail configurado: o site avisa em vez de fingir que enviou. */
  | { estado: "demonstracao" }
  | { estado: "erro"; mensagem: string };
