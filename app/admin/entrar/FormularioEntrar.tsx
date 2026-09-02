"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import Botao from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import { ESTADO_INICIAL } from "@/lib/servicos/resultado";
import { acaoEntrar } from "./acoes";

export default function FormularioEntrar() {
  const [estado, enviar, pendente] = useActionState(acaoEntrar, ESTADO_INICIAL);

  return (
    <form action={enviar} className="space-y-4" noValidate>
      <CampoTexto
        name="email"
        type="email"
        rotulo="E-mail"
        autoComplete="username"
        required
        autoFocus
        defaultValue={estado.valores?.email ?? ""}
        erro={estado.erros?.email?.[0]}
      />

      <CampoTexto
        name="senha"
        type="password"
        rotulo="Senha"
        autoComplete="current-password"
        required
        erro={estado.erros?.senha?.[0]}
      />

      {/* Falha geral (senha errada, acesso desativado): não pertence a um
          campo específico, então aparece acima do botão. */}
      {estado.mensagem && !estado.erros && (
        <p
          role="alert"
          className="rounded-lg bg-perigo-suave px-3 py-2.5 text-sm font-medium text-perigo"
        >
          {estado.mensagem}
        </p>
      )}

      <Botao
        type="submit"
        icone={LogIn}
        pendente={pendente}
        className="w-full justify-center"
      >
        Entrar
      </Botao>
    </form>
  );
}
