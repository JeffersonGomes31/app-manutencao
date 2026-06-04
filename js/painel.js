/* =====================================================
   PAINEL - FILTROS E RENDERIZAÇÃO PRINCIPAL

   Responsabilidades:
   - controlar busca e filtros do painel;
   - renderizar visão operacional da manutenção/gerência;
   - acionar atualização de indicadores e cards.

   Atenção:
   - não conceder ações operacionais à gerência neste módulo.
===================================================== */

function pesquisarPainel(valor) {
  termoBuscaPainel = valor.trim().toLowerCase();
  renderizarPainelManutencao();
}

function filtrarPainelStatus(status) {
  filtroPainelStatusAtual = status;
  renderizarPainelManutencao();
}

function filtrarPainelPrioridade(prioridade) {
  filtroPainelPrioridadeAtual = prioridade;
  renderizarPainelManutencao();
}

function limparFiltrosPainel() {
  termoBuscaPainel = "";
  filtroPainelStatusAtual = "TODOS";
  filtroPainelPrioridadeAtual = "TODAS";

  const buscaPainel = document.getElementById("buscaPainel");
  const filtroStatus = document.getElementById("filtroPainelStatus");
  const filtroPrioridade = document.getElementById("filtroPainelPrioridade");

  if (buscaPainel) {
    buscaPainel.value = "";
  }

  if (filtroStatus) {
    filtroStatus.value = "TODOS";
  }

  if (filtroPrioridade) {
    filtroPrioridade.value = "TODAS";
  }

  renderizarPainelManutencao();
}

function renderizarPainelManutencao() {
  const listaPainel = document.getElementById("listaPainelManutencao");

  if (!listaPainel) {
    return;
  }

  atualizarResumoPainel();

  const filaFiltrada = obterFilaPainelFiltrada();

  listaPainel.innerHTML = filaFiltrada.length > 0
    ? filaFiltrada.map(criarCardPainel).join("")
    : criarMensagemVazia("Nenhum chamado encontrado", "Não há chamados para os filtros selecionados.");
}


/* Indicadores, cards e fluxo de status foram separados em módulos dedicados. */
