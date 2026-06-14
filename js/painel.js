/* =====================================================
   PAINEL - FILTROS E RENDERIZAÇÃO PRINCIPAL

   Responsabilidades:
   - controlar busca e filtros do painel;
   - renderizar visão operacional da manutenção/gerência;
   - acionar atualização de indicadores e cards.

   Atenção:
   - não conceder ações operacionais à gerência neste módulo.
===================================================== */


function selecionarAbaFilaPainel(aba) {
  abaFilaPainelAtual = aba === "ENCERRADAS" ? "ENCERRADAS" : "ATIVAS";
  filtroPainelStatusAtual = "TODOS";

  const filtroStatus = document.getElementById("filtroPainelStatus");
  if (filtroStatus) {
    filtroStatus.value = "TODOS";
    filtroStatus.disabled = abaFilaPainelAtual === "ENCERRADAS";
  }

  renderizarPainelManutencao();
}

function atualizarAbasFilaPainel() {
  const totalEncerradas = chamados.filter(chamado => chamado.status === "ENCERRADO").length;
  const totalAtivas = chamados.length - totalEncerradas;
  const abaAtivas = document.getElementById("abaFilaAtivas");
  const abaEncerradas = document.getElementById("abaFilaEncerradas");
  const contadorAtivas = document.getElementById("contadorFilaAtivas");
  const contadorEncerradas = document.getElementById("contadorFilaEncerradas");

  if (contadorAtivas) contadorAtivas.textContent = totalAtivas;
  if (contadorEncerradas) contadorEncerradas.textContent = totalEncerradas;

  if (abaAtivas) {
    const ativa = abaFilaPainelAtual === "ATIVAS";
    abaAtivas.classList.toggle("active", ativa);
    abaAtivas.setAttribute("aria-selected", String(ativa));
  }

  if (abaEncerradas) {
    const ativa = abaFilaPainelAtual === "ENCERRADAS";
    abaEncerradas.classList.toggle("active", ativa);
    abaEncerradas.setAttribute("aria-selected", String(ativa));
  }
}

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
  atualizarAbasFilaPainel();

  const filaFiltrada = obterFilaPainelFiltrada();
  const tituloVazio = abaFilaPainelAtual === "ENCERRADAS"
    ? "Nenhuma OS encerrada encontrada"
    : "Nenhuma OS ativa encontrada";
  const textoVazio = abaFilaPainelAtual === "ENCERRADAS"
    ? "Não há ordens de serviço encerradas para os filtros selecionados."
    : "Não há ordens de serviço ativas para os filtros selecionados.";

  listaPainel.innerHTML = filaFiltrada.length > 0
    ? filaFiltrada.map(criarCardPainel).join("")
    : criarMensagemVazia(tituloVazio, textoVazio);

  // Garante que cada OS da fila sempre seja exibida recolhida após qualquer
  // renderização, troca de aba, busca, filtro ou atualização de status.
  listaPainel.querySelectorAll("details.admin-card-collapsible").forEach(card => {
    card.open = false;
    card.removeAttribute("open");
  });
}


/* Indicadores, cards e fluxo de status foram separados em módulos dedicados. */
