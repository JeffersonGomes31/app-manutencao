/* =====================================================
   PERFIL E PERMISSÕES
===================================================== */

function usuarioTemPerfilSalvo() {
  return usuarioAtual && usuarioAtual.perfilConfigurado === true;
}

function usuarioEhManutencaoAutorizada() {
  return usuarioTemPerfilSalvo()
    && (usuarioAtual.perfil === "manutencao" || usuarioAtual.perfil === "admin")
    && usuarioAtual.manutencaoAutorizado === true;
}

function usuarioEhAdmin() {
  return usuarioTemPerfilSalvo() && usuarioAtual.perfil === "admin";
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
      : "Entre com o e-mail e senha cadastrados no Firebase.";
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
  const perfilTextoFormatado = obterNomePerfilFormatado(usuarioAtual.perfil);

  setTextContent("perfilAcessoTexto", perfilTextoFormatado);
  setTextContent("perfilAvatar", gerarIniciaisUsuario(nome));
  setTextContent("perfilNomeTitulo", nome);
  setTextContent("perfilSubtitulo", `${perfilTextoFormatado} • ${unidade}`);
  setTextContent("perfilNomeValor", nome);
  setTextContent("perfilSetorValor", setor);
  setTextContent("perfilEmailValor", email);
  setTextContent("perfilUnidadeValor", unidade);
}

function obterNomePerfilFormatado(perfil) {
  const nomes = {
    colaborador: "Colaborador",
    manutencao: "Manutenção",
    admin: "Administrador"
  };

  return nomes[perfil] || "Colaborador";
}

function preencherFormularioPerfil() {
  const emailInput = document.getElementById("loginEmailUsuario");
  const senhaInput = document.getElementById("loginSenhaUsuario");

  if (emailInput) {
    emailInput.value = usuarioTemPerfilSalvo() ? usuarioAtual.email || "" : "";
  }

  if (senhaInput) {
    senhaInput.value = "";
  }
}

async function entrarComFirebase(botao) {
  const emailInput = document.getElementById("loginEmailUsuario");
  const senhaInput = document.getElementById("loginSenhaUsuario");

  if (!emailInput || !senhaInput) {
    alert("Campos de login não encontrados no HTML.");
    return;
  }

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    alert("Informe e-mail e senha para entrar.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Entrando...";
    }

    await autenticarUsuario(email, senha);
  } catch (erro) {
    console.error("Erro de login:", erro);
    alert("Não foi possível entrar. Confira o e-mail e a senha cadastrados no Firebase.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Entrar no app";
    }
  }
}

async function sairDaConta() {
  try {
    await encerrarSessaoFirebase();
    fecharDetalhesChamado();
    alert("Sessão encerrada.");
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Não foi possível sair da conta.");
  }
}

function atualizarResumoPerfil() {
  const totalChamados = chamados.length;
  const meusChamados = chamados.filter(chamado => idsIguais(chamado.solicitanteId, usuarioAtual.id)).length;
  const chamadosAbertos = chamados.filter(chamado => !statusFinalizado(chamado.status)).length;
  const chamadosCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;

  setTextContent("perfilTotalChamados", totalChamados);
  setTextContent("perfilMeusChamados", meusChamados);
  setTextContent("perfilChamadosAbertos", chamadosAbertos);
  setTextContent("perfilChamadosCancelados", chamadosCancelados);
}
