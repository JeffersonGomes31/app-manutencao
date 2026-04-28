/* =====================================================
   INICIALIZAÇÃO DO APP
===================================================== */

document.addEventListener("DOMContentLoaded", inicializarAplicacao);

function inicializarAplicacao() {
  inicializarFirebaseServico();
  configurarEventosGlobais();
  prepararTelaSemSessao();

  observarAutenticacao(async usuarioFirebase => {
    await processarEstadoAutenticacao(usuarioFirebase);
  });
}

function configurarEventosGlobais() {
  document.querySelectorAll(".logout-button").forEach(botao => {
    botao.addEventListener("click", sairDaConta);
  });

  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.addEventListener("click", evento => {
      if (evento.target === modal) {
        fecharDetalhesChamado();
      }
    });
  }
}

function prepararTelaSemSessao() {
  usuarioAtual = { ...USUARIO_PADRAO };
  chamados = [];
  comunicados = [];

  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  renderizarChamados();

  if (typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  openPage("perfil");
}

async function processarEstadoAutenticacao(usuarioFirebase) {
  encerrarMonitoresDeDados();

  if (!usuarioFirebase) {
    prepararTelaSemSessao();
    return;
  }

  try {
    const perfil = await buscarPerfilFirebase(usuarioFirebase.uid);

    if (!perfil) {
      alert("Login realizado, mas este usuário ainda não possui cadastro na coleção usuarios do Firestore.");
      await encerrarSessaoFirebase();
      return;
    }

    if (perfil.ativo !== true) {
      alert("Este usuário está inativo. Procure o administrador do sistema.");
      await encerrarSessaoFirebase();
      return;
    }

    usuarioAtual = normalizarUsuarioLogado(usuarioFirebase, perfil);

    preencherFormularioPerfil();
    aplicarPermissoesNaTela();
    iniciarMonitoresDeDados();
    openPage("inicio");
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
    alert("Não foi possível carregar o perfil do usuário no Firebase.");
    await encerrarSessaoFirebase();
  }
}

function normalizarUsuarioLogado(usuarioFirebase, perfil) {
  const tipoPerfil = perfil.perfil || "colaborador";

  return {
    id: usuarioFirebase.uid,
    nome: perfil.nome || usuarioFirebase.email || "Usuário",
    setor: perfil.setor || "Não informado",
    email: perfil.email || usuarioFirebase.email || "",
    unidade: perfil.unidade || "Senac Campo Mourão",
    perfil: tipoPerfil,
    manutencaoAutorizado: tipoPerfil === "manutencao" || tipoPerfil === "admin",
    perfilConfigurado: true
  };
}

function iniciarMonitoresDeDados() {
  monitorChamados = observarChamadosFirebase(usuarioAtual, lista => {
    chamados = lista;
    renderizarChamados();
    atualizarPainelSeAberto();
  }, erro => {
    console.error("Erro ao carregar chamados:", erro);
    alert("Não foi possível carregar os chamados do Firebase.");
  });

  monitorComunicados = observarComunicadosFirebase(lista => {
    comunicados = lista;

    if (typeof renderizarComunicados === "function") {
      renderizarComunicados();
    }
  }, erro => {
    console.error("Erro ao carregar comunicados:", erro);
    alert("Não foi possível carregar os comunicados do Firebase.");
  });
}

function encerrarMonitoresDeDados() {
  if (typeof monitorChamados === "function") {
    monitorChamados();
    monitorChamados = null;
  }

  if (typeof monitorComunicados === "function") {
    monitorComunicados();
    monitorComunicados = null;
  }
}
