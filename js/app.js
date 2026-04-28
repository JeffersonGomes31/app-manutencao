/* =====================================================
   INICIALIZAÇÃO DO APP
===================================================== */

document.addEventListener("DOMContentLoaded", inicializarAplicacao);

function inicializarAplicacao() {
  normalizarChamados();
  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  renderizarChamados();

  if (typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  configurarEventosGlobais();
  abrirPaginaInicial();
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

function abrirPaginaInicial() {
  if (!usuarioTemPerfilSalvo()) {
    openPage("perfil");
    return;
  }

  openPage("inicio");
}
