"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { repositorio, type Sessao } from "@/lib/conteudo";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO } from "@/components/ui/estilos";
import SecaoAvisos from "./SecaoAvisos";
import SecaoFotos from "./SecaoFotos";

export default function PainelAdmin() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    repositorio.sessaoAtual().then((atual) => {
      setSessao(atual);
      setCarregando(false);
    });
    return repositorio.observarSessao(setSessao);
  }, []);

  if (carregando) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-dourado" aria-label="Carregando" />
      </div>
    );
  }

  return sessao ? <AreaLogada sessao={sessao} /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    const { erro: falha } = await repositorio.entrar(email, senha);
    setEnviando(false);
    if (falha) setErro(falha);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl text-terracota-escuro">Administração</h1>
      <p className="mt-2 text-center text-sm text-marrom-claro">
        Área restrita à equipe da paróquia.
      </p>

      <form
        className="mt-8 space-y-4 rounded-xl border border-dourado-claro bg-white p-6 shadow-sm"
        onSubmit={aoEnviar}
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            className={CAMPO}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="senha" className="mb-1 block text-sm font-medium">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            autoComplete="current-password"
            className={CAMPO}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {erro && (
          <p role="alert" className="text-sm font-medium text-terracota-escuro">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className={`${BOTAO_PRIMARIO} w-full justify-center`}
        >
          {enviando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-5 w-5" aria-hidden />
          )}
          Entrar
        </button>

        {repositorio.modoDemonstracao && (
          <p className="text-center text-xs text-marrom-claro">
            Modo demonstração: qualquer e-mail e senha entram.
          </p>
        )}
      </form>
    </div>
  );
}

function AreaLogada({ sessao }: { sessao: Sessao }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {repositorio.modoDemonstracao && <AvisoDemonstracao />}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-terracota-escuro">Administração</h1>
          <p className="mt-1 text-sm text-marrom-claro">
            Conectado como {sessao.email}
          </p>
        </div>
        <button
          type="button"
          className={BOTAO_SECUNDARIO}
          onClick={() => repositorio.sair()}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair
        </button>
      </div>

      <SecaoAvisos />
      <SecaoFotos />
    </div>
  );
}

function AvisoDemonstracao() {
  return (
    <div className="rounded-lg border-l-4 border-dourado bg-dourado-claro/40 p-4 text-sm">
      <strong>Modo demonstração:</strong> o painel funciona de verdade, mas as
      alterações não ficam salvas — servem para mostrar como a secretaria vai
      usar o sistema no dia a dia.
    </div>
  );
}
