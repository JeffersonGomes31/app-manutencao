/* =====================================================
   PERFIL E PERMISSÕES
===================================================== */

function usuarioTemPerfilSalvo() {
  return usuarioAtual && usuarioAtual.perfilConfigurado === true;
}

function usuarioEhManutencaoAutorizada() {
  return (
    usuarioAtual &&
    usuarioAtual.perfil === "manutencao" &&
    usuarioAtual.manutencaoAutorizado === true &&
    usuarioAtual.email &&
    usuarioAtual.email.toLowerCase() === EMAIL_MANUTENCAO_AUTORIZADO.toLowerCase()
  );
}

function aplicarPermissoesNaTela() {
  const perfilSalvo = usuarioTemPerfilSalvo();
  const areaNavegacao = obterAreaNavegacao();
  const areaFormularioPerfil = document.getElementById("areaFormularioPerfil");
  const areaPerfilLogado = document.getElementById("areaPerfilLogado");
  const perfilTextoOrientacao = document.getElementById("perfilTextoOrientacao");
  const botaoPainel = document.getElementById("botaoPainelManutencao");
  const areaNovoComunicado = document.getElementById("areaNovoComunicado");

  if (areaNavegacao) {
    areaNavegacao.style.display = perfilSalvo ? "" : "none";
  }

  if (areaFormularioPerfil) {
    areaFormularioPerfil.style.display = perfilSalvo ? "none" : "grid";
  }

  if (areaPerfilLogado) {
    areaPerfilLogado.style.display = perfilSalvo ? "block" : "none";
  }

  if (perfilTextoOrientacao) {
    perfilTextoOrientacao.textContent = perfilSalvo
      ? "Dados do usuário e permissões de acesso."
      : "Informe seus dados para acessar o app.";
  }

  if (botaoPainel) {
    botaoPainel.style.display = usuarioEhManutencaoAutorizada() ? "block" : "none";
  }

  if (areaNovoComunicado) {
    areaNovoComunicado.style.display = usuarioEhManutencaoAutorizada() ? "grid" : "none";
  }

  preencherResumoUsuarioNaTela();

  if (typeof atualizarResumoPerfil === "function") {
    atualizarResumoPerfil();
  }
}

function obterAreaNavegacao() {
  const primeiroItemNavegacao = document.querySelector(".nav-item");
  return primeiroItemNavegacao ? primeiroItemNavegacao.parentElement : null;
}

function preencherResumoUsuarioNaTela() {
  const nome = usuarioAtual.nome || "Colaborador";
  const setor = usuarioAtual.setor || "Solicitante";
  const email = usuarioAtual.email || "Não informado";
  const unidade = usuarioAtual.unidade || "Senac Campo Mourão";
  const perfilTextoFormatado = usuarioAtual.perfil === "manutencao" ? "Manutenção" : "Colaborador";

  setTextContent("perfilAcessoTexto", perfilTextoFormatado);
  setTextContent("perfilAvatar", gerarIniciaisUsuario(nome));
  setTextContent("perfilNomeTitulo", nome);
  setTextContent("perfilSubtitulo", `${perfilTextoFormatado} • ${unidade}`);
  setTextContent("perfilNomeValor", nome);
  setTextContent("perfilSetorValor", setor);
  setTextContent("perfilEmailValor", email);
  setTextContent("perfilUnidadeValor", unidade);
}

function preencherFormularioPerfil() {
  const nomeInput = document.getElementById("loginNomeUsuario");
  const setorInput = document.getElementById("loginSetorUsuario");
  const emailInput = document.getElementById("loginEmailUsuario");
  const unidadeInput = document.getElementById("loginUnidadeUsuario");
  const perfilInput = document.getElementById("loginPerfilUsuario");
  const perfilConfigurado = usuarioTemPerfilSalvo();

  if (nomeInput) {
    nomeInput.value = perfilConfigurado ? usuarioAtual.nome || "" : "";
  }

  if (setorInput) {
    setorInput.value = perfilConfigurado ? usuarioAtual.setor || "" : "";
  }

  if (emailInput) {
    emailInput.value = perfilConfigurado ? usuarioAtual.email || "" : "";
  }

  if (unidadeInput) {
    unidadeInput.value = usuarioAtual.unidade || "Senac Campo Mourão";
  }

  if (perfilInput) {
    perfilInput.value = usuarioAtual.perfil || "colaborador";
  }
}

function salvarPerfilUsuario() {
  const nomeInput = document.getElementById("loginNomeUsuario");
  const setorInput = document.getElementById("loginSetorUsuario");
  const emailInput = document.getElementById("loginEmailUsuario");
  const perfilInput = document.getElementById("loginPerfilUsuario");

  if (!nomeInput || !setorInput || !perfilInput) {
    alert("Campos do perfil não encontrados. Verifique os IDs no HTML.");
    return;
  }

  const nome = nomeInput.value.trim();
  const setor = setorInput.value.trim();
  const email = emailInput ? emailInput.value.trim() : "";
  const perfil = perfilInput.value;

  if (!nome || !setor || !perfil) {
    alert("Preencha nome, setor e perfil de acesso.");
    return;
  }

  const manutencaoAutorizado = validarAcessoManutencao(perfil, email);

  if (manutencaoAutorizado === null) {
    return;
  }

  usuarioAtual = {
    id: gerarIdUsuario(email || `${nome}-${setor}`, perfil),
    nome,
    setor,
    email,
    unidade: "Senac Campo Mourão",
    perfil,
    manutencaoAutorizado,
    perfilConfigurado: true
  };

  localStorage.setItem(CHAVE_USUARIO_ATUAL, JSON.stringify(usuarioAtual));

  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  renderizarChamados();

  if (typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  atualizarPainelSeAberto();
  alert("Perfil salvo com sucesso.");
}

function validarAcessoManutencao(perfil, email) {
  if (perfil !== "manutencao") {
    return false;
  }

  if (!email) {
    alert("Para acessar como manutenção, informe o e-mail autorizado.");
    return null;
  }

  if (email.toLowerCase() !== EMAIL_MANUTENCAO_AUTORIZADO.toLowerCase()) {
    alert("Este e-mail não tem permissão para acessar o perfil de manutenção.");
    return null;
  }

  const senhaInformada = prompt("Informe a senha de acesso da manutenção:");

  if (senhaInformada !== SENHA_MANUTENCAO) {
    alert("Senha incorreta. Acesso à manutenção negado.");
    return null;
  }

  return true;
}

function sairDaConta() {
  localStorage.removeItem(CHAVE_USUARIO_ATUAL);

  usuarioAtual = { ...USUARIO_PADRAO };

  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  renderizarChamados();
  fecharDetalhesChamado();
  openPage("perfil");

  alert("Sessão encerrada. O app voltou para a tela de identificação.");
}

function atualizarResumoPerfil() {
  const totalChamados = chamados.length;
  const meusChamados = chamados.filter(chamado => String(chamado.solicitanteId) === String(usuarioAtual.id)).length;
  const chamadosAbertos = chamados.filter(chamado => !statusFinalizado(chamado.status)).length;
  const chamadosCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;

  setTextContent("perfilTotalChamados", totalChamados);
  setTextContent("perfilMeusChamados", meusChamados);
  setTextContent("perfilChamadosAbertos", chamadosAbertos);
  setTextContent("perfilChamadosCancelados", chamadosCancelados);
}
