/* =====================================================
   PLANOS PREVENTIVOS / MANUTENÇÃO RECORRENTE
===================================================== */

function renderizarPlanosPreventivos() {
  const lista = document.getElementById("listaPlanosPreventivos");

  if (!lista) {
    return;
  }

  atualizarResumoPreventivas();

  const planosOrdenados = filtrarPlanosPreventivos([...planosPreventivos]).sort((a, b) => {
    const aInativo = a.ativo === false ? 1 : 0;
    const bInativo = b.ativo === false ? 1 : 0;

    if (aInativo !== bInativo) {
      return aInativo - bInativo;
    }

    return obterDataPlanoPreventivo(a.proximaExecucaoISO).getTime() - obterDataPlanoPreventivo(b.proximaExecucaoISO).getTime();
  });

  lista.innerHTML = planosOrdenados.length > 0
    ? planosOrdenados.map(criarCardPlanoPreventivo).join("")
    : criarMensagemVazia("Nenhum plano preventivo encontrado", "Ajuste os filtros ou cadastre uma nova rotina preventiva.");
}

function atualizarResumoPreventivas() {
  const hoje = obterInicioDoDia(new Date());
  const limiteSemana = new Date(hoje);
  limiteSemana.setDate(limiteSemana.getDate() + 7);

  const planosAtivos = planosPreventivos.filter(plano => plano.ativo !== false);
  const inativos = planosPreventivos.filter(plano => plano.ativo === false);
  const vencidos = planosAtivos.filter(plano => obterInicioDoDia(obterDataPlanoPreventivo(plano.proximaExecucaoISO)) < hoje);
  const semana = planosAtivos.filter(plano => {
    const data = obterInicioDoDia(obterDataPlanoPreventivo(plano.proximaExecucaoISO));
    return data >= hoje && data <= limiteSemana;
  });

  setTextContent("totalPlanosPreventivos", planosAtivos.length);
  setTextContent("totalPreventivasVencidas", vencidos.length);
  setTextContent("totalPreventivasSemana", semana.length);
  setTextContent("totalPreventivasInativas", inativos.length);
}

function criarCardPlanoPreventivo(plano) {
  const dataExecucao = obterDataPlanoPreventivo(plano.proximaExecucaoISO);
  const situacao = obterSituacaoPlanoPreventivo(plano);
  const podeGerarOS = usuarioEhManutencaoAutorizada() && plano.ativo !== false;
  const podeInativar = usuarioEhManutencaoAutorizada() && plano.ativo !== false;

  return `
    <div class="preventive-card ${situacao.classe}">
      <div class="preventive-card-header">
        <div>
          <h3>${escaparHTML(plano.nome)}</h3>
          <p>${escaparHTML(plano.ativoCodigo || "Sem ativo vinculado")} • ${escaparHTML(plano.localizacao || "Local não informado")}</p>
        </div>
        <span class="preventive-status">${escaparHTML(situacao.texto)}</span>
      </div>

      <div class="preventive-meta-grid">
        <div class="preventive-meta-item"><span>Categoria</span><strong>${escaparHTML(plano.categoria || "Não informada")}</strong></div>
        <div class="preventive-meta-item"><span>Subcategoria</span><strong>${escaparHTML(plano.subcategoria || "Não informada")}</strong></div>
        <div class="preventive-meta-item"><span>Frequência</span><strong>${escaparHTML(formatarFrequenciaPreventiva(plano))}</strong></div>
        <div class="preventive-meta-item"><span>Próxima execução</span><strong>${escaparHTML(formatarDataPreventiva(dataExecucao))}</strong></div>
        <div class="preventive-meta-item"><span>Responsável</span><strong>${escaparHTML(plano.responsavelPadrao || "Equipe de manutenção")}</strong></div>
      </div>

      ${criarChecklistPreventiva(plano)}
      <p><strong>Observações:</strong> ${escaparHTML(plano.observacoes || "Sem observações")}</p>
      ${plano.ultimaOS ? `<p><strong>Última OS gerada:</strong> ${escaparHTML(plano.ultimaOS)}</p>` : ""}

      <div class="preventive-actions">
        ${podeGerarOS ? `
          <button type="button" class="primary-button" onclick="gerarOSPreventiva(${formatarParametroJS(plano.id)})">
            Gerar OS preventiva
          </button>
        ` : ""}

        ${podeInativar ? `
          <button type="button" class="secondary-button" onclick="inativarPlanoPreventivo(${formatarParametroJS(plano.id)})">
            Inativar plano
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

async function salvarPlanoPreventivo() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção pode cadastrar planos preventivos.");
    return;
  }

  const ativoInput = document.getElementById("ativoPlanoPreventivo");
  const nomeInput = document.getElementById("nomePlanoPreventivo");
  const localInput = document.getElementById("localPlanoPreventivo");
  const categoriaInput = document.getElementById("categoriaPlanoPreventivo");
  const subcategoriaInput = document.getElementById("subcategoriaPlanoPreventivo");
  const checklistInput = document.getElementById("checklistPlanoPreventivo");
  const responsavelInput = document.getElementById("responsavelPlanoPreventivo");
  const quantidadeFrequenciaInput = document.getElementById("quantidadeFrequenciaPlanoPreventivo");
  const unidadeFrequenciaInput = document.getElementById("unidadeFrequenciaPlanoPreventivo");
  const proximaInput = document.getElementById("proximaExecucaoPlanoPreventivo");
  const observacoesInput = document.getElementById("observacoesPlanoPreventivo");

  const ativoCodigo = ativoInput ? ativoInput.value.trim().toUpperCase() : "";
  const nome = nomeInput ? nomeInput.value.trim() : "";
  const localizacao = localInput ? localInput.value.trim() : "";
  const categoria = categoriaInput ? categoriaInput.value : "";
  const subcategoria = subcategoriaInput ? subcategoriaInput.value : "";
  const checklist = checklistInput ? checklistInput.value.split("\n").map(item => item.trim()).filter(Boolean) : [];
  const responsavelPadrao = responsavelInput ? responsavelInput.value.trim() : "";
  const quantidadeFrequencia = quantidadeFrequenciaInput ? Number(quantidadeFrequenciaInput.value) : 0;
  const unidadeFrequencia = unidadeFrequenciaInput ? unidadeFrequenciaInput.value : "dias";
  const frequenciaDias = calcularFrequenciaEmDias(quantidadeFrequencia, unidadeFrequencia);
  const proximaExecucao = proximaInput ? proximaInput.value : "";
  const observacoes = observacoesInput ? observacoesInput.value.trim() : "";

  if (!ativoCodigo || !nome || !localizacao || !categoria || !subcategoria || !proximaExecucao) {
    alert("Informe ativo, nome da rotina, categoria, subcategoria, local e próxima execução.");
    return;
  }

  if (!Number.isFinite(quantidadeFrequencia) || quantidadeFrequencia <= 0 || !frequenciaDias) {
    alert("Informe uma frequência válida para a preventiva.");
    return;
  }

  const dataExecucao = new Date(`${proximaExecucao}T09:00:00`);

  if (Number.isNaN(dataExecucao.getTime())) {
    alert("Informe uma data válida para a próxima execução.");
    return;
  }

  const plano = {
    ativoCodigo,
    nome,
    localizacao,
    categoria,
    subcategoria,
    checklist,
    responsavelPadrao: responsavelPadrao || "Equipe de manutenção",
    quantidadeFrequencia,
    unidadeFrequencia,
    frequenciaDias,
    proximaExecucaoISO: dataExecucao.toISOString(),
    observacoes,
    ativo: true,
    ultimaOS: "",
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome
  };

  try {
    await criarPlanoPreventivoFirebase(plano);
    limparFormularioPlanoPreventivo();
    alert("Plano preventivo cadastrado com sucesso.");
  } catch (erro) {
    console.error("Erro ao cadastrar plano preventivo:", erro);
    alert("Não foi possível cadastrar o plano preventivo no Firebase.");
  }
}

async function gerarOSPreventiva(planoId) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção pode gerar OS preventiva.");
    return;
  }

  const plano = planosPreventivos.find(item => idsIguais(item.id, planoId));

  if (!plano) {
    alert("Plano preventivo não encontrado.");
    return;
  }

  const agora = new Date();
  const numeroOS = gerarNumeroOS(agora);
  const proximaExecucao = calcularProximaExecucaoPreventiva(plano, agora);

  const chamadoPreventivo = {
    numeroOS,
    tipoRegistro: "OS",
    etapaFluxo: "Solicitação registrada",
    responsavelManutencao: usuarioAtual.nome || "Manutenção",
    iniciadoEmISO: "",
    concluidoEmISO: "",
    validadoEmISO: "",
    descricao: `Preventiva programada: ${plano.nome}. ${plano.observacoes || ""}`.trim(),
    local: plano.localizacao,
    equipamentoCodigo: plano.ativoCodigo,
    equipamentoNome: plano.nome,
    setor: plano.localizacao,
    horario: "A definir",
    precisaAcompanhamento: "Não informado",
    categoria: plano.categoria || "Preventiva",
    subcategoria: plano.subcategoria || "Preventiva programada",
    tipoManutencao: "Preventiva",
    prioridade: "Média",
    status: "ABERTO",
    data: agora.toLocaleDateString("pt-BR"),
    foto: "",
    fotoNome: "",
    fotoData: "",
    fotos: [],
    fotosFinalizacao: [],
    planoPreventivoId: plano.id,
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome,
    criadoPorEmail: usuarioAtual.email,
    justificativaAguardando: "",
    checklistPreventiva: Array.isArray(plano.checklist) ? plano.checklist : [],
    historico: [
      {
        data: agora.toLocaleDateString("pt-BR"),
        acao: "OS preventiva gerada",
        descricao: `${numeroOS} criada automaticamente a partir do plano preventivo ${plano.nome}.`
      }
    ]
  };

  try {
    const chamadoId = await criarChamadoFirebase(chamadoPreventivo);

    await atualizarPlanoPreventivoFirebase(plano.id, {
      ultimaOS: numeroOS,
      ultimaOSId: chamadoId,
      ultimaExecucaoISO: agora.toISOString(),
      proximaExecucaoISO: proximaExecucao.toISOString()
    });

    alert(`OS preventiva ${numeroOS} gerada com sucesso.`);
    openPage("painel");
  } catch (erro) {
    console.error("Erro ao gerar OS preventiva:", erro);
    alert("Não foi possível gerar a OS preventiva no Firebase.");
  }
}

async function inativarPlanoPreventivo(planoId) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção pode inativar planos preventivos.");
    return;
  }

  if (!confirm("Deseja inativar este plano preventivo?")) {
    return;
  }

  try {
    await atualizarPlanoPreventivoFirebase(planoId, { ativo: false });
    alert("Plano preventivo inativado.");
  } catch (erro) {
    console.error("Erro ao inativar plano preventivo:", erro);
    alert("Não foi possível inativar o plano preventivo.");
  }
}

function limparFormularioPlanoPreventivo() {
  [
    "ativoPlanoPreventivo",
    "nomePlanoPreventivo",
    "localPlanoPreventivo",
    "categoriaPlanoPreventivo",
    "subcategoriaPlanoPreventivo",
    "checklistPlanoPreventivo",
    "responsavelPlanoPreventivo",
    "quantidadeFrequenciaPlanoPreventivo",
    "proximaExecucaoPlanoPreventivo",
    "observacoesPlanoPreventivo"
  ].forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  const unidadeFrequenciaInput = document.getElementById("unidadeFrequenciaPlanoPreventivo");

  if (unidadeFrequenciaInput) {
    unidadeFrequenciaInput.value = "dias";
  }
}

function prepararPlanoPreventivoDoAtivo(codigo) {
  const ativo = encontrarAtivoPorCodigo(codigo);
  const ativoInput = document.getElementById("ativoPlanoPreventivo");
  const localInput = document.getElementById("localPlanoPreventivo");
  const nomeInput = document.getElementById("nomePlanoPreventivo");

  if (ativoInput) {
    ativoInput.value = codigo;
  }

  if (ativo && localInput) {
    localInput.value = ativo.localizacao || "";
  }

  if (ativo && nomeInput && !nomeInput.value) {
    nomeInput.value = `Preventiva - ${ativo.nome}`;
  }

  openPage("preventivas");
}

function atualizarSubcategoriasPlanoPreventivo() {
  const categoriaInput = document.getElementById("categoriaPlanoPreventivo");
  const subcategoriaInput = document.getElementById("subcategoriaPlanoPreventivo");

  if (!categoriaInput || !subcategoriaInput) {
    return;
  }

  const categoria = categoriaInput.value;
  const opcoes = categoriasManutencao[categoria] || [];

  subcategoriaInput.innerHTML = '<option value="">Selecione</option>';
  opcoes.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    subcategoriaInput.appendChild(option);
  });
}

function filtrarPlanosPreventivos(planos) {
  const filtro = document.getElementById("filtroSituacaoPreventiva")?.value || "TODAS";
  const busca = removerAcentos((document.getElementById("buscaPlanoPreventivo")?.value || "").toLowerCase());
  const hoje = obterInicioDoDia(new Date());
  const limiteSemana = new Date(hoje);
  limiteSemana.setDate(limiteSemana.getDate() + 7);

  return planos.filter(plano => {
    const data = obterInicioDoDia(obterDataPlanoPreventivo(plano.proximaExecucaoISO));
    const ativo = plano.ativo !== false;
    const texto = removerAcentos([
      plano.nome,
      plano.ativoCodigo,
      plano.localizacao,
      plano.categoria,
      plano.subcategoria,
      plano.responsavelPadrao
    ].join(" ").toLowerCase());

    const passaBusca = !busca || texto.includes(busca);
    let passaFiltro = true;

    if (filtro === "VENCIDAS") passaFiltro = ativo && data < hoje;
    if (filtro === "SEMANA") passaFiltro = ativo && data >= hoje && data <= limiteSemana;
    if (filtro === "PROGRAMADAS") passaFiltro = ativo && data > limiteSemana;
    if (filtro === "INATIVAS") passaFiltro = !ativo;

    return passaBusca && passaFiltro;
  });
}

function criarChecklistPreventiva(plano) {
  const itens = Array.isArray(plano.checklist) ? plano.checklist : [];

  if (!itens.length) {
    return `<div class="preventive-checklist"><strong>Checklist:</strong><p>Sem checklist cadastrado.</p></div>`;
  }

  return `
    <div class="preventive-checklist">
      <strong>Checklist:</strong>
      <ul>${itens.map(item => `<li>${escaparHTML(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function calcularFrequenciaEmDias(quantidade, unidade) {
  const quantidadeNumerica = Number(quantidade);

  if (!Number.isFinite(quantidadeNumerica) || quantidadeNumerica <= 0) {
    return 0;
  }

  if (unidade === "semanas") {
    return quantidadeNumerica * 7;
  }

  if (unidade === "meses") {
    return quantidadeNumerica * 30;
  }

  return quantidadeNumerica;
}

function formatarFrequenciaPreventiva(plano) {
  const quantidade = Number(plano.quantidadeFrequencia || 0);
  const unidade = plano.unidadeFrequencia || "";

  if (quantidade > 0 && unidade) {
    return `a cada ${quantidade} ${unidade}`;
  }

  return `a cada ${Number(plano.frequenciaDias || 30)} dias`;
}

function obterSituacaoPlanoPreventivo(plano) {
  if (plano.ativo === false) {
    return { texto: "Inativo", classe: "preventive-inactive" };
  }

  const hoje = obterInicioDoDia(new Date());
  const dataExecucao = obterInicioDoDia(obterDataPlanoPreventivo(plano.proximaExecucaoISO));
  const limiteSemana = new Date(hoje);
  limiteSemana.setDate(limiteSemana.getDate() + 7);

  if (dataExecucao < hoje) {
    return { texto: "Vencida", classe: "preventive-overdue" };
  }

  if (dataExecucao <= limiteSemana) {
    return { texto: "Próxima", classe: "preventive-due" };
  }

  return { texto: "Programada", classe: "preventive-ok" };
}

function calcularProximaExecucaoPreventiva(plano, dataBase) {
  const proxima = new Date(dataBase);
  proxima.setDate(proxima.getDate() + Number(plano.frequenciaDias || 30));
  proxima.setHours(9, 0, 0, 0);
  return proxima;
}

function obterDataPlanoPreventivo(valor) {
  const data = new Date(valor || Date.now());
  return Number.isNaN(data.getTime()) ? new Date() : data;
}

function obterInicioDoDia(data) {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function formatarDataPreventiva(data) {
  return data.toLocaleDateString("pt-BR");
}

function removerAcentos(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
