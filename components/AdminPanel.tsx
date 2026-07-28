"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LogIn,
  LogOut,
  Megaphone,
  Camera,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { supabase, fotoUrl, type Aviso, type Album } from "@/lib/supabase";
import { avisosSemana, albunsDemo } from "@/lib/dados";

const inputCls =
  "w-full rounded-lg border border-creme-escuro bg-creme px-3 py-2.5 text-base outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/40";
const botaoCls =
  "inline-flex items-center gap-2 rounded-lg bg-terracota px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracota-escuro disabled:opacity-50";

export default function AdminPanel() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSessao(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return <AdminDemo />;
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-dourado" aria-label="Carregando" />
      </div>
    );
  }

  return sessao ? <Painel emailUsuario={sessao.user.email ?? ""} /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl text-terracota-escuro">Administração</h1>
      <p className="mt-2 text-center text-sm text-marrom-claro">
        Área restrita à equipe da paróquia.
      </p>
      <form
        className="mt-8 space-y-4 rounded-xl border border-dourado-claro bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setErro("");
          setEnviando(true);
          const { error } = await supabase!.auth.signInWithPassword({
            email,
            password: senha,
          });
          setEnviando(false);
          if (error) setErro("E-mail ou senha incorretos. Tente novamente.");
        }}
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
            className={inputCls}
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
            className={inputCls}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        {erro && (
          <p role="alert" className="text-sm font-medium text-terracota-escuro">
            {erro}
          </p>
        )}
        <button type="submit" disabled={enviando} className={`${botaoCls} w-full justify-center`}>
          {enviando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-5 w-5" aria-hidden />
          )}
          Entrar
        </button>
      </form>
    </div>
  );
}

function Painel({ emailUsuario }: { emailUsuario: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-terracota-escuro">Administração</h1>
          <p className="mt-1 text-sm text-marrom-claro">Conectado como {emailUsuario}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-marrom-claro px-4 py-2 text-sm font-semibold hover:bg-creme-escuro"
          onClick={() => supabase!.auth.signOut()}
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

// ---------- Modo demonstração (sem Supabase): tudo em memória ----------

type AvisoDemo = { id: string; texto: string; ativo: boolean };
type FotoDemo = { id: string; url: string };
type AlbumDemoLocal = { id: string; titulo: string; data: string; fotos: FotoDemo[] };

function AdminDemo() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  if (!logado) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-center text-3xl text-terracota-escuro">Administração</h1>
        <p className="mt-2 text-center text-sm text-marrom-claro">
          Área restrita à equipe da paróquia.
        </p>
        <form
          className="mt-8 space-y-4 rounded-xl border border-dourado-claro bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (email && senha) setLogado(true);
          }}
        >
          <div>
            <label htmlFor="demo-email" className="mb-1 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="demo-email"
              type="email"
              required
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="demo-senha" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <input
              id="demo-senha"
              type="password"
              required
              className={inputCls}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <button type="submit" className={`${botaoCls} w-full justify-center`}>
            <LogIn className="h-5 w-5" aria-hidden />
            Entrar
          </button>
          <p className="text-center text-xs text-marrom-claro">
            Modo demonstração: qualquer e-mail e senha entram.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-lg border-l-4 border-dourado bg-dourado-claro/40 p-4 text-sm">
        <strong>Modo demonstração:</strong> o painel funciona de verdade, mas as
        alterações não ficam salvas — servem para mostrar como a secretaria vai
        usar o sistema no dia a dia.
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-terracota-escuro">Administração</h1>
          <p className="mt-1 text-sm text-marrom-claro">Conectado como {email}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-marrom-claro px-4 py-2 text-sm font-semibold hover:bg-creme-escuro"
          onClick={() => setLogado(false)}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair
        </button>
      </div>
      <SecaoAvisosDemo />
      <SecaoFotosDemo />
    </div>
  );
}

function SecaoAvisosDemo() {
  const [avisos, setAvisos] = useState<AvisoDemo[]>(
    avisosSemana.map((texto, i) => ({ id: `a${i}`, texto, ativo: true }))
  );
  const [novoTexto, setNovoTexto] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");

  return (
    <section className="mt-10" aria-labelledby="titulo-avisos-demo">
      <h2 id="titulo-avisos-demo" className="flex items-center gap-2 text-2xl text-marrom">
        <Megaphone className="h-6 w-6 text-dourado" aria-hidden />
        Avisos da semana
      </h2>
      <p className="mt-1 text-sm text-marrom-claro">
        Os avisos ativos aparecem na página inicial do site.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!novoTexto.trim()) return;
          setAvisos([
            { id: crypto.randomUUID(), texto: novoTexto.trim(), ativo: true },
            ...avisos,
          ]);
          setNovoTexto("");
        }}
      >
        <label htmlFor="novo-aviso-demo" className="sr-only">
          Novo aviso
        </label>
        <input
          id="novo-aviso-demo"
          type="text"
          placeholder="Escreva um novo aviso…"
          className={inputCls}
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
        />
        <button type="submit" className={botaoCls}>
          <Plus className="h-5 w-5" aria-hidden />
          Adicionar
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className={`flex items-center gap-2 rounded-lg border border-dourado-claro bg-white p-3 ${
              aviso.ativo ? "" : "opacity-60"
            }`}
          >
            {editandoId === aviso.id ? (
              <>
                <label htmlFor={`ed-${aviso.id}`} className="sr-only">
                  Editar aviso
                </label>
                <input
                  id={`ed-${aviso.id}`}
                  className={inputCls}
                  value={textoEdicao}
                  onChange={(e) => setTextoEdicao(e.target.value)}
                />
                <button
                  type="button"
                  className={botaoCls}
                  onClick={() => {
                    setAvisos(avisos.map((a) =>
                      a.id === aviso.id ? { ...a, texto: textoEdicao.trim() } : a
                    ));
                    setEditandoId(null);
                  }}
                >
                  Salvar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{aviso.texto}</span>
                <button
                  type="button"
                  title={aviso.ativo ? "Ocultar do site" : "Mostrar no site"}
                  aria-label={aviso.ativo ? "Ocultar aviso do site" : "Mostrar aviso no site"}
                  className="rounded p-2 text-marrom-claro hover:bg-creme-escuro"
                  onClick={() =>
                    setAvisos(avisos.map((a) =>
                      a.id === aviso.id ? { ...a, ativo: !a.ativo } : a
                    ))
                  }
                >
                  {aviso.ativo ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  title="Editar"
                  aria-label="Editar aviso"
                  className="rounded p-2 text-marrom-claro hover:bg-creme-escuro"
                  onClick={() => {
                    setEditandoId(aviso.id);
                    setTextoEdicao(aviso.texto);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  title="Excluir"
                  aria-label="Excluir aviso"
                  className="rounded p-2 text-terracota-escuro hover:bg-creme-escuro"
                  onClick={() => {
                    if (window.confirm("Excluir este aviso?"))
                      setAvisos(avisos.filter((a) => a.id !== aviso.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SecaoFotosDemo() {
  const [albuns, setAlbuns] = useState<AlbumDemoLocal[]>(
    albunsDemo.map((album, i) => ({
      id: `alb${i}`,
      titulo: album.titulo,
      data: album.data,
      fotos: album.fotos.map((url, j) => ({ id: `f${i}-${j}`, url })),
    }))
  );
  const [novoTitulo, setNovoTitulo] = useState("");

  return (
    <section className="mt-12" aria-labelledby="titulo-fotos-demo">
      <h2 id="titulo-fotos-demo" className="flex items-center gap-2 text-2xl text-marrom">
        <Camera className="h-6 w-6 text-dourado" aria-hidden />
        Fotos de eventos
      </h2>
      <p className="mt-1 text-sm text-marrom-claro">
        Crie um álbum para cada evento e envie as fotos. Elas aparecem na página
        Galeria.
      </p>

      <form
        className="mt-4 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!novoTitulo.trim()) return;
          setAlbuns([
            { id: crypto.randomUUID(), titulo: novoTitulo.trim(), data: "", fotos: [] },
            ...albuns,
          ]);
          setNovoTitulo("");
        }}
      >
        <div className="min-w-48 flex-1">
          <label htmlFor="novo-album-demo" className="mb-1 block text-sm font-medium">
            Nome do evento
          </label>
          <input
            id="novo-album-demo"
            type="text"
            placeholder="Ex.: Festa de Santa Clara 2026"
            className={inputCls}
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
          />
        </div>
        <button type="submit" className={botaoCls}>
          <Plus className="h-5 w-5" aria-hidden />
          Criar álbum
        </button>
      </form>

      <div className="mt-6 space-y-8">
        {albuns.map((album) => (
          <article
            key={album.id}
            className="rounded-xl border border-dourado-claro bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg text-marrom">{album.titulo}</h3>
                <p className="text-xs text-marrom-claro">
                  {album.data || "sem data"} · {album.fotos.length} foto(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className={`${botaoCls} cursor-pointer`}>
                  <ImagePlus className="h-5 w-5" aria-hidden />
                  Enviar fotos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const arquivos = e.target.files;
                      if (!arquivos?.length) return;
                      const novas = Array.from(arquivos).map((arquivo) => ({
                        id: crypto.randomUUID(),
                        url: URL.createObjectURL(arquivo),
                      }));
                      setAlbuns(albuns.map((a) =>
                        a.id === album.id ? { ...a, fotos: [...a.fotos, ...novas] } : a
                      ));
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  title="Excluir álbum"
                  aria-label={`Excluir álbum ${album.titulo}`}
                  className="rounded p-2 text-terracota-escuro hover:bg-creme-escuro"
                  onClick={() => {
                    if (window.confirm(`Excluir o álbum "${album.titulo}"?`))
                      setAlbuns(albuns.filter((a) => a.id !== album.id));
                  }}
                >
                  <Trash2 className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            {album.fotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {album.fotos.map((foto) => (
                  <div key={foto.id} className="group relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.url}
                      alt="Foto do álbum"
                      loading="lazy"
                      className="h-full w-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      title="Excluir foto"
                      aria-label="Excluir foto"
                      className="absolute right-1 top-1 rounded-full bg-marrom/80 p-1.5 text-creme opacity-0 transition-opacity hover:bg-terracota-escuro group-hover:opacity-100"
                      onClick={() => {
                        if (!window.confirm("Excluir esta foto?")) return;
                        setAlbuns(albuns.map((a) =>
                          a.id === album.id
                            ? { ...a, fotos: a.fotos.filter((f) => f.id !== foto.id) }
                            : a
                        ));
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SecaoAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const { data, error } = await supabase!
      .from("avisos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setErro("Não foi possível carregar os avisos.");
    else setAvisos((data as Aviso[]) ?? []);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <section className="mt-10" aria-labelledby="titulo-avisos">
      <h2 id="titulo-avisos" className="flex items-center gap-2 text-2xl text-marrom">
        <Megaphone className="h-6 w-6 text-dourado" aria-hidden />
        Avisos da semana
      </h2>
      <p className="mt-1 text-sm text-marrom-claro">
        Os avisos ativos aparecem na página inicial do site, do mais recente para o mais antigo.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!novoTexto.trim()) return;
          const { error } = await supabase!
            .from("avisos")
            .insert({ texto: novoTexto.trim() });
          if (error) setErro("Não foi possível salvar o aviso.");
          else {
            setNovoTexto("");
            setErro("");
            carregar();
          }
        }}
      >
        <label htmlFor="novo-aviso" className="sr-only">
          Novo aviso
        </label>
        <input
          id="novo-aviso"
          type="text"
          placeholder="Escreva um novo aviso…"
          className={inputCls}
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
        />
        <button type="submit" className={botaoCls}>
          <Plus className="h-5 w-5" aria-hidden />
          Adicionar
        </button>
      </form>
      {erro && (
        <p role="alert" className="mt-2 text-sm font-medium text-terracota-escuro">
          {erro}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className={`flex items-center gap-2 rounded-lg border border-dourado-claro bg-white p-3 ${
              aviso.ativo ? "" : "opacity-60"
            }`}
          >
            {editandoId === aviso.id ? (
              <>
                <label htmlFor={`edicao-${aviso.id}`} className="sr-only">
                  Editar aviso
                </label>
                <input
                  id={`edicao-${aviso.id}`}
                  className={inputCls}
                  value={textoEdicao}
                  onChange={(e) => setTextoEdicao(e.target.value)}
                />
                <button
                  type="button"
                  className={botaoCls}
                  onClick={async () => {
                    await supabase!
                      .from("avisos")
                      .update({ texto: textoEdicao.trim() })
                      .eq("id", aviso.id);
                    setEditandoId(null);
                    carregar();
                  }}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-marrom-claro px-3 py-2.5 text-sm font-semibold hover:bg-creme-escuro"
                  onClick={() => setEditandoId(null)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{aviso.texto}</span>
                <button
                  type="button"
                  title={aviso.ativo ? "Ocultar do site" : "Mostrar no site"}
                  aria-label={aviso.ativo ? "Ocultar aviso do site" : "Mostrar aviso no site"}
                  className="rounded p-2 text-marrom-claro hover:bg-creme-escuro"
                  onClick={async () => {
                    await supabase!
                      .from("avisos")
                      .update({ ativo: !aviso.ativo })
                      .eq("id", aviso.id);
                    carregar();
                  }}
                >
                  {aviso.ativo ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  title="Editar"
                  aria-label="Editar aviso"
                  className="rounded p-2 text-marrom-claro hover:bg-creme-escuro"
                  onClick={() => {
                    setEditandoId(aviso.id);
                    setTextoEdicao(aviso.texto);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  title="Excluir"
                  aria-label="Excluir aviso"
                  className="rounded p-2 text-terracota-escuro hover:bg-creme-escuro"
                  onClick={async () => {
                    if (!window.confirm("Excluir este aviso?")) return;
                    await supabase!.from("avisos").delete().eq("id", aviso.id);
                    carregar();
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
          </li>
        ))}
        {avisos.length === 0 && (
          <li className="text-sm text-marrom-claro">Nenhum aviso cadastrado ainda.</li>
        )}
      </ul>
    </section>
  );
}

function SecaoFotos() {
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData, setNovaData] = useState("");
  const [enviandoAlbum, setEnviandoAlbum] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const { data, error } = await supabase!
      .from("albuns")
      .select("*, fotos(*)")
      .order("data_evento", { ascending: false });
    if (error) setErro("Não foi possível carregar os álbuns.");
    else setAlbuns((data as Album[]) ?? []);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function enviarFotos(albumId: string, arquivos: FileList) {
    setEnviandoAlbum(albumId);
    setErro("");
    for (const arquivo of Array.from(arquivos)) {
      const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${albumId}/${crypto.randomUUID()}.${extensao}`;
      const { error: erroUpload } = await supabase!.storage
        .from("fotos")
        .upload(path, arquivo);
      if (erroUpload) {
        setErro(`Falha ao enviar "${arquivo.name}". Tente novamente.`);
        continue;
      }
      await supabase!.from("fotos").insert({ album_id: albumId, path });
    }
    setEnviandoAlbum(null);
    carregar();
  }

  return (
    <section className="mt-12" aria-labelledby="titulo-fotos">
      <h2 id="titulo-fotos" className="flex items-center gap-2 text-2xl text-marrom">
        <Camera className="h-6 w-6 text-dourado" aria-hidden />
        Fotos de eventos
      </h2>
      <p className="mt-1 text-sm text-marrom-claro">
        Crie um álbum para cada evento e envie as fotos (formatos JPG ou PNG). Elas
        aparecem na página Galeria.
      </p>

      <form
        className="mt-4 flex flex-wrap items-end gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!novoTitulo.trim()) return;
          const { error } = await supabase!.from("albuns").insert({
            titulo: novoTitulo.trim(),
            data_evento: novaData || null,
          });
          if (error) setErro("Não foi possível criar o álbum.");
          else {
            setNovoTitulo("");
            setNovaData("");
            setErro("");
            carregar();
          }
        }}
      >
        <div className="min-w-48 flex-1">
          <label htmlFor="novo-album" className="mb-1 block text-sm font-medium">
            Nome do evento
          </label>
          <input
            id="novo-album"
            type="text"
            placeholder="Ex.: Festa de Santa Clara 2026"
            className={inputCls}
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nova-data" className="mb-1 block text-sm font-medium">
            Data
          </label>
          <input
            id="nova-data"
            type="date"
            className={inputCls}
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
          />
        </div>
        <button type="submit" className={botaoCls}>
          <Plus className="h-5 w-5" aria-hidden />
          Criar álbum
        </button>
      </form>
      {erro && (
        <p role="alert" className="mt-2 text-sm font-medium text-terracota-escuro">
          {erro}
        </p>
      )}

      <div className="mt-6 space-y-8">
        {albuns.map((album) => (
          <article
            key={album.id}
            className="rounded-xl border border-dourado-claro bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg text-marrom">{album.titulo}</h3>
                <p className="text-xs text-marrom-claro">
                  {album.data_evento ?? "sem data"} · {album.fotos.length} foto(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  className={`${botaoCls} cursor-pointer`}
                  aria-disabled={enviandoAlbum === album.id}
                >
                  {enviandoAlbum === album.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : (
                    <ImagePlus className="h-5 w-5" aria-hidden />
                  )}
                  {enviandoAlbum === album.id ? "Enviando…" : "Enviar fotos"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    disabled={enviandoAlbum !== null}
                    onChange={(e) => {
                      if (e.target.files?.length) enviarFotos(album.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  title="Excluir álbum"
                  aria-label={`Excluir álbum ${album.titulo}`}
                  className="rounded p-2 text-terracota-escuro hover:bg-creme-escuro"
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `Excluir o álbum "${album.titulo}" e todas as suas fotos?`
                      )
                    )
                      return;
                    if (album.fotos.length > 0) {
                      await supabase!.storage
                        .from("fotos")
                        .remove(album.fotos.map((f) => f.path));
                    }
                    await supabase!.from("albuns").delete().eq("id", album.id);
                    carregar();
                  }}
                >
                  <Trash2 className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            {album.fotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {album.fotos.map((foto) => (
                  <div key={foto.id} className="group relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoUrl(foto.path)}
                      alt={foto.legenda ?? "Foto do álbum"}
                      loading="lazy"
                      className="h-full w-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      title="Excluir foto"
                      aria-label="Excluir foto"
                      className="absolute right-1 top-1 rounded-full bg-marrom/80 p-1.5 text-creme opacity-0 transition-opacity hover:bg-terracota-escuro group-hover:opacity-100"
                      onClick={async () => {
                        if (!window.confirm("Excluir esta foto?")) return;
                        await supabase!.storage.from("fotos").remove([foto.path]);
                        await supabase!.from("fotos").delete().eq("id", foto.id);
                        carregar();
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
        {albuns.length === 0 && (
          <p className="text-sm text-marrom-claro">Nenhum álbum criado ainda.</p>
        )}
      </div>
    </section>
  );
}
