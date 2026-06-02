/* =====================================================
   PAINEL - ALTERACAO DE STATUS E FINALIZACAO
===================================================== */

async function salvarStatusPainel(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode alterar o status do chamado.");
    return;
  }

  const selectStatus = document.getElementById(`statusPainel-${id}`);

  if (!selectStatus) {
    alert("Campo de status não encontrado para este chamado.");
    return;
  }

  const novoStatus = selectStatus.value;
  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("Chamado não encontrado.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Este chamado já está finalizado e não pode ser alterado.");
    return;
  }

  if (novoStatus === chamadoAtual.status) {
    alert("O chamado já está com este status.");
    return;
  }

  if (novoStatus === "CANCELADO") {
    await cancelarChamado(id, botao);
    return;
  }

  await alterarStatusPainel(id, novoStatus, botao);
}

async function alterarStatusPainel(id, novoStatus, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode alterar o status do chamado.");
    return;
  }

  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("Chamado não encontrado.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Este chamado já está finalizado e não pode ser alterado.");
    return;
  }

  if (!novoStatus) {
    alert("Selecione um status válido.");
    return;
  }

  if (novoStatus === "CANCELADO") {
    await cancelarChamado(id, botao);
    return;
  }

  const justificativaAguardando = obterJustificativaAguardando(novoStatus);

  if (justificativaAguardando === null) {
    renderizarPainelManutencao();
    return;
  }

  const statusAnterior = chamadoAtual.status;
  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "Movimentação operacional da OS",
    descricao: montarDescricaoAlteracaoStatus(statusAnterior, novoStatus, justificativaAguardando)
  };
  const dadosAtualizacao = {
    status: novoStatus,
    etapaFluxo: obterEtapaFluxoPorStatus(novoStatus),
    justificativaAguardando,
    responsavelManutencao: chamadoAtual.responsavelManutencao && chamadoAtual.responsavelManutencao !== "A definir"
      ? chamadoAtual.responsavelManutencao
      : usuarioAtual.nome,
    historico: adicionarItemArrayFirebase(itemHistorico)
  };

  if (novoStatus === "EM ANDAMENTO" && !chamadoAtual.iniciadoEmISO) {
    dadosAtualizacao.iniciadoEmISO = agora.toISOString();
  }

  if (novoStatus === "CONCLUÍDO") {
    dadosAtualizacao.concluidoEmISO = agora.toISOString();
  }

  try {
    await atualizarChamadoFirebase(id, dadosAtualizacao);

    if (typeof registrarNotificacaoStatusChamado === "function") {
      await registrarNotificacaoStatusChamado(chamadoAtual, novoStatus, justificativaAguardando);
    }

    aplicarFeedbackSucesso(botao, "Status salvo", "Salvar status");
    alert(`Status atualizado para: ${novoStatus}`);
  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    alert("Não foi possível alterar o status no Firebase.");
  }

}

function obterJustificativaAguardando(novoStatus) {
  if (novoStatus !== "AGUARDANDO") {
    return "";
  }

  const justificativa = prompt("Informe a justificativa para deixar o chamado em aguardando:");

  if (!justificativa || !justificativa.trim()) {
    alert("Para deixar o chamado em aguardando, é obrigatório informar a justificativa.");
    return null;
  }

  return justificativa.trim();
}

function montarDescricaoAlteracaoStatus(statusAnterior, novoStatus, justificativaAguardando) {
  const descricaoBase = `Status alterado de ${statusAnterior} para ${novoStatus}. Etapa atual: ${obterEtapaFluxoPorStatus(novoStatus)}.`;

  if (novoStatus !== "AGUARDANDO") {
    return descricaoBase;
  }

  return `${descricaoBase} Justificativa: ${justificativaAguardando}`;
}

async function cancelarChamado(id, botao) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode cancelar chamados pelo painel.");
    return;
  }

  if (statusFinalizado(chamado.status)) {
    alert("Este chamado não pode ser cancelado, pois já está concluído ou cancelado.");
    return;
  }

  const motivo = prompt("Informe o motivo do cancelamento:");

  if (!motivo || !motivo.trim()) {
    alert("Para cancelar o chamado, é obrigatório informar o motivo.");
    return;
  }

  await cancelarChamadoComMotivo(id, motivo.trim(), "OS cancelada pela manutenção");
  aplicarFeedbackSucesso(botao, "Cancelado", "Salvar status");
}

async function validarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode validar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A OS só pode ser validada depois de concluída pela manutenção.");
    return;
  }

  const observacao = prompt("Informe uma observação de validação da OS:") || "Validação registrada sem observação adicional.";
  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "OS validada",
    descricao: `${usuarioAtual.nome} validou a execução. Observação: ${observacao.trim()}`
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "VALIDADO",
      etapaFluxo: "Validação",
      validadoEmISO: agora.toISOString(),
      validadoPorUid: usuarioAtual.id,
      validadoPorNome: usuarioAtual.nome,
      validacaoObservacao: observacao.trim(),
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Validada", "Validar OS");
    alert("OS validada com sucesso.");
  } catch (erro) {
    console.error("Erro ao validar OS:", erro);
    alert("Não foi possível validar a OS no Firebase.");
  }
}

async function encerrarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode encerrar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.");
    return;
  }

  if (chamado.status !== "VALIDADO") {
    alert("A OS só pode ser encerrada depois de validada.");
    return;
  }

  if (!(await appConfirm("Confirmar encerramento definitivo desta OS?", { textoConfirmar: "Encerrar", textoCancelar: "Voltar" }))) {
    return;
  }

  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "OS encerrada",
    descricao: `${usuarioAtual.nome} encerrou a OS após validação da execução.`
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "ENCERRADO",
      etapaFluxo: "Encerrado e auditado",
      encerradoEmISO: agora.toISOString(),
      encerradoPorUid: usuarioAtual.id,
      encerradoPorNome: usuarioAtual.nome,
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Encerrada", "Encerrar OS");
    alert("OS encerrada com sucesso.");
  } catch (erro) {
    console.error("Erro ao encerrar OS:", erro);
    alert("Não foi possível encerrar a OS no Firebase.");
  }
}

async function selecionarFotoFinalizacao(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode incluir foto de finalização.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A foto de finalização só pode ser incluída depois que o chamado estiver concluído.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", async () => {
    const arquivo = input.files && input.files[0];

    if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
      return;
    }

    await anexarFotoFinalizacao(id, arquivo, botao);
  });

  input.click();
}

async function anexarFotoFinalizacao(id, arquivo, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode incluir foto de finalização.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Anexando...";
    }

    const fotoBase64 = await converterFotoParaBase64(arquivo);
    const agora = new Date();
    const fotoFinalizacao = {
      nome: arquivo.name || "Foto de finalização",
      data: fotoBase64,
      adicionadaEm: agora.toISOString()
    };
    const itemHistorico = {
      data: agora.toLocaleString("pt-BR"),
      acao: "Foto de finalização anexada",
      descricao: `Foto anexada pela manutenção: ${fotoFinalizacao.nome}.`
    };

    await atualizarChamadoFirebase(id, {
      fotosFinalizacao: adicionarItemArrayFirebase(fotoFinalizacao),
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Foto anexada", "Adicionar foto final");
    alert("Foto de finalização anexada com sucesso.");
  } catch (erro) {
    console.error("Erro ao anexar foto de finalização:", erro);
    alert("Não foi possível anexar a foto de finalização.");

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Adicionar foto final";
    }
  }
}
