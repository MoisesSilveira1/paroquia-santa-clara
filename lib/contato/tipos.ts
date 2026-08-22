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
  /** Gravada no painel da secretaria. O aviso por e-mail é um extra. */
  | { estado: "enviado" }
  | { estado: "erro"; mensagem: string };
