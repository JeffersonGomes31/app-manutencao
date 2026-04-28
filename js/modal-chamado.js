/* =====================================================
   MODAL DE DETALHES DO CHAMADO
===================================================== */

function abrirDetalhesChamado(id) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  chamadoSelecionadoId = chamado.id;

  setTextContent("detalheTitulo", chamado.descricao);
  setTextContent("detalheData", `Aberto em ${chamado.data}`);
  setTextContent("detalheLocal", chamado.local);
  setTextContent("detalheSetor", chamado.setor || "Não informado");
  setTextContent("detalheHorario", chamado.horario || "Não informado");
  setTextContent("detalheAcompanhamento", chamado.precisaAcompanhamento || "Não informado");
  setTextContent("detalheCategoria", chamado.categoria);
  setTextContent("detalhePrioridade", chamado.prioridade);
  setTextContent("detalheDescricao", chamado.descricao);

  preencherFotoDetalhe(chamado);
  preencherStatusDetalhe(chamado);
  preencherSLADetalhe(chamado);
  preencherHistoricoDetalhe(chamado);
  configurarControlesDoModal(chamado);
  resetarFeedbackBotoesModal();

  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.classList.add("active");
  }
}

function preencherFotoDetalhe(chamado) {
  const detalheFoto = document.getElementById("detalheFoto");

  if (detalheFoto) {
    detalheFoto.innerHTML = renderizarFotoDetalhe(chamado);
  }
}

function preencherStatusDetalhe(chamado) {
  const detalheStatus = document.getElementById("detalheStatus");

  if (detalheStatus) {
    detalheStatus.textContent = chamado.status;
    detalheStatus.className = `status ${obterClasseStatus(chamado.status)}`;
  }
}

function preencherSLADetalhe(chamado) {
  const detalheSLA = document.getElementById("detalheSLA");

  if (!detalheSLA) {
    return;
  }

  const sla = calcularSLA(chamado);

  detalheSLA.textContent = chamado.prioridade === "Urgente"
    ? sla.texto
    : `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;
}

function preencherHistoricoDetalhe(chamado) {
  const detalheHistorico = document.getElementById("detalheHistorico");

  if (detalheHistorico) {
    detalheHistorico.innerHTML = renderizarHistorico(chamado.historico || []);
  }
}

function configurarControlesDoModal(chamado) {
  const areaControleColaborador = document.getElementById("areaControleColaborador");

  if (areaControleColaborador) {
    areaControleColaborador.style.display = chamadoPodeSerCancelado(chamado) ? "block" : "none";
  }
}

function resetarFeedbackBotoesModal() {
  const botaoCancelarColaborador = document.getElementById("botaoCancelarChamadoColaborador");

  if (botaoCancelarColaborador) {
    botaoCancelarColaborador.classList.remove("button-success");
    botaoCancelarColaborador.textContent = "Cancelar chamado";
  }
}

function fecharDetalhesChamado() {
  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.classList.remove("active");
  }

  chamadoSelecionadoId = null;
}

function renderizarHistorico(historico) {
  if (!historico || historico.length === 0) {
    return `
      <div class="history-item">
        <strong>Sem histórico</strong>
        <span>-</span>
        <p>Nenhuma movimentação registrada.</p>
      </div>
    `;
  }

  return historico.map(item => `
    <div class="history-item">
      <strong>${escaparHTML(item.acao)}</strong>
      <span>${escaparHTML(item.data)}</span>
      <p>${escaparHTML(item.descricao)}</p>
    </div>
  `).join("");
}

function chamadoPodeSerCancelado(chamado) {
  if (!chamado || statusFinalizado(chamado.status)) {
    return false;
  }

  if (usuarioEhManutencaoAutorizada()) {
    return false;
  }

  if (usuarioAtual.perfil === "colaborador") {
    return idsIguais(chamado.solicitanteId, usuarioAtual.id);
  }

  return false;
}

function obterChamadoSelecionado() {
  return chamados.find(chamado => idsIguais(chamado.id, chamadoSelecionadoId));
}

async function cancelarChamadoAtual(botao) {
  const chamado = obterChamadoSelecionado();

  if (!chamado) {
    alert("Nenhum chamado selecionado para cancelamento.");
    return;
  }

  if (!chamadoPodeSerCancelado(chamado)) {
    alert("Este chamado não pode ser cancelado.");
    return;
  }

  const motivo = prompt("Informe o motivo do cancelamento:");

  if (!motivo || !motivo.trim()) {
    alert("Para cancelar o chamado, é obrigatório informar o motivo.");
    return;
  }

  await executarCancelamentoChamado(chamado.id, motivo.trim(), "Chamado cancelado pelo colaborador", botao);
}

async function cancelarChamadoComMotivo(id, motivo, acaoHistorico) {
  await executarCancelamentoChamado(id, motivo, acaoHistorico, null);
}

async function executarCancelamentoChamado(id, motivo, acaoHistorico, botao) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  const itemHistorico = {
    data: new Date().toLocaleString("pt-BR"),
    acao: acaoHistorico,
    descricao: motivo
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "CANCELADO",
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    if (botao) {
      aplicarFeedbackSucesso(botao, "Cancelado", "Cancelar chamado");
    }

    fecharDetalhesChamado();
    alert("Chamado cancelado com sucesso.");
  } catch (erro) {
    console.error("Erro ao cancelar chamado:", erro);
    alert("Não foi possível cancelar o chamado no Firebase.");
  }

}

function renderizarFotoDetalhe(chamado) {
  const fotoBase64 = chamado.fotoData || chamado.foto || "";
  const nomeFoto = chamado.fotoNome || "Foto anexada";

  if (fotoBase64 && String(fotoBase64).startsWith("data:image")) {
    return `
      <div class="foto-preview-wrapper">
        <a href="${fotoBase64}" target="_blank" rel="noopener noreferrer">
          <img class="foto-preview" src="${fotoBase64}" alt="${escaparHTML(nomeFoto)}" />
        </a>
        <small>${escaparHTML(nomeFoto)}</small>
      </div>
    `;
  }

  if (chamado.fotoNome) {
    return escaparHTML(`${chamado.fotoNome} (prévia indisponível)`);
  }

  return "Nenhuma";
}
