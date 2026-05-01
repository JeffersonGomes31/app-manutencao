/* =====================================================
   CHAMADOS
===================================================== */

async function criarChamado() {
  const localInput = document.getElementById("localChamado");
  const setorInput = document.getElementById("setorChamado");
  const horarioInput = document.getElementById("horarioChamado");
  const acompanhamentoInput = document.getElementById("precisaAcompanhamento");
  const categoriaInput = document.getElementById("categoriaChamado");
  const prioridadeInput = document.getElementById("prioridadeChamado");
  const descricaoInput = document.getElementById("descricaoChamado");
  const fotoInput = document.getElementById("fotoChamado");

  if (!localInput || !setorInput || !horarioInput || !categoriaInput || !prioridadeInput || !descricaoInput) {
    alert("Erro: alguns campos do formulário não foram encontrados no HTML.");
    return;
  }

  const local = localInput.value.trim();
  const setor = setorInput.value.trim();
  const horario = horarioInput.value;
  const precisaAcompanhamento = acompanhamentoInput ? acompanhamentoInput.value : "Não informado";
  const categoria = categoriaInput.value;
  const prioridade = prioridadeInput.value;
  const descricao = descricaoInput.value.trim();
  const arquivosFotos = obterArquivosFotosChamado(fotoInput);

  if (!local || !setor || !horario || !categoria || !descricao) {
    alert("Preencha local, setor, melhor horário, categoria e descrição do problema.");
    return;
  }

  if (arquivosFotos.length > LIMITE_FOTOS_CHAMADO) {
    alert(`Selecione no máximo ${LIMITE_FOTOS_CHAMADO} imagens por chamado.`);
    return;
  }

  const agora = new Date();
  const dataAtual = agora.toLocaleDateString("pt-BR");
  const resultadoFotos = await converterArquivosFotosChamado(arquivosFotos);
  const fotosAnexadas = resultadoFotos.fotos;
  const fotoPrincipal = fotosAnexadas[0] || null;

  if (resultadoFotos.falhas > 0) {
    alert("Uma ou mais imagens não puderam ser anexadas. O chamado será criado com as imagens válidas.");
  }

  const novoChamado = {
    descricao,
    local,
    setor,
    horario,
    precisaAcompanhamento: precisaAcompanhamento || "Não informado",
    categoria,
    prioridade,
    status: "ABERTO",
    data: dataAtual,
    foto: fotosAnexadas.map(foto => foto.nome).join(", "),
    fotoNome: fotoPrincipal ? fotoPrincipal.nome : "",
    fotoData: fotoPrincipal ? fotoPrincipal.data : "",
    fotos: fotosAnexadas,
    solicitanteId: usuarioAtual.id,
    solicitanteNome: usuarioAtual.nome,
    solicitanteEmail: usuarioAtual.email,
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome,
    criadoPorEmail: usuarioAtual.email,
    justificativaAguardando: "",
    historico: [
      {
        data: dataAtual,
        acao: "Chamado aberto",
        descricao: `Solicitação registrada por ${usuarioAtual.nome}.`
      }
    ]
  };

  try {
    const chamadoId = await criarChamadoFirebase(novoChamado);

    if (typeof registrarNotificacaoNovoChamado === "function") {
      await registrarNotificacaoNovoChamado(chamadoId, novoChamado);
    }

    alert("Chamado enviado com sucesso!");
    limparFormularioChamado();
    prepararAbaChamadosAposEnvio();
    openPage("chamados");
  } catch (erro) {
    console.error("Erro ao enviar chamado:", erro);
    alert("Não foi possível enviar o chamado para o Firebase.");
  }
}

function obterArquivosFotosChamado(fotoInput) {
  if (!fotoInput || !fotoInput.files) {
    return [];
  }

  return Array.from(fotoInput.files).filter(arquivo => {
    return arquivo && String(arquivo.type || "").startsWith("image/");
  });
}

async function converterArquivosFotosChamado(arquivos) {
  const fotos = [];
  let falhas = 0;

  for (const arquivo of arquivos) {
    try {
      const data = await converterFotoParaBase64(arquivo);
      fotos.push({
        nome: arquivo.name,
        data
      });
    } catch (erro) {
      falhas += 1;
      console.warn("Não foi possível converter uma imagem do chamado:", erro);
    }
  }

  return { fotos, falhas };
}


function limparFormularioChamado() {
  const campos = [
    "localChamado",
    "setorChamado",
    "horarioChamado",
    "categoriaChamado",
    "descricaoChamado",
    "fotoChamado"
  ];

  campos.forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  const prioridadeInput = document.getElementById("prioridadeChamado");
  const acompanhamentoInput = document.getElementById("precisaAcompanhamento");

  if (prioridadeInput) {
    prioridadeInput.value = "Baixa";
  }

  if (acompanhamentoInput) {
    acompanhamentoInput.value = "";
  }

  document.querySelectorAll(".category-fast-button").forEach(botao => {
    botao.classList.remove("active");
  });
}

function prepararAbaChamadosAposEnvio() {
  filtroStatusAtual = "TODOS";
  termoBuscaChamados = "";

  const buscaChamados = document.getElementById("buscaChamados");

  if (buscaChamados) {
    buscaChamados.value = "";
  }

  const filtros = document.querySelectorAll("#filtrosChamados .filter");

  filtros.forEach(botao => {
    botao.classList.remove("active");
  });

  if (filtros[0]) {
    filtros[0].classList.add("active");
  }
}

function obterChamadosVisiveis() {
  return chamados;
}

function renderizarChamados() {
  const listaChamados = document.getElementById("listaChamados");
  const listaChamadosInicio = document.getElementById("listaChamadosInicio");
  const chamadosVisiveis = obterChamadosVisiveis();
  const chamadosFiltrados = obterChamadosFiltrados(chamadosVisiveis);

  if (listaChamados) {
    listaChamados.innerHTML = chamadosFiltrados.length > 0
      ? chamadosFiltrados.map(criarCardChamado).join("")
      : criarMensagemVazia("Nenhum chamado encontrado", "Não há chamados para o filtro ou busca selecionada.");
  }

  if (listaChamadosInicio) {
    const chamadosInicio = ordenarChamadosPorPrioridade([...chamadosVisiveis]).slice(0, 3);

    listaChamadosInicio.innerHTML = chamadosInicio.length > 0
      ? chamadosInicio.map(criarCardChamado).join("")
      : criarMensagemVazia("Nenhum chamado recente", "Abra um novo chamado para acompanhar por aqui.");
  }

  if (typeof atualizarResumoPerfil === "function") {
    atualizarResumoPerfil();
  }
}

function obterChamadosFiltrados(lista) {
  let chamadosFiltrados = [...lista];

  if (filtroStatusAtual === "ATRASADOS") {
    chamadosFiltrados = chamadosFiltrados.filter(chamadoEstaAtrasado);
  } else if (filtroStatusAtual !== "TODOS") {
    chamadosFiltrados = chamadosFiltrados.filter(chamado => chamado.status === filtroStatusAtual);
  }

  if (termoBuscaChamados) {
    chamadosFiltrados = chamadosFiltrados.filter(chamado => {
      return montarTextoBuscaChamado(chamado).includes(termoBuscaChamados);
    });
  }

  return ordenarChamadosPorPrioridade(chamadosFiltrados);
}

function montarTextoBuscaChamado(chamado) {
  return [
    chamado.descricao,
    chamado.local,
    chamado.setor,
    chamado.categoria,
    chamado.prioridade,
    chamado.status,
    chamado.solicitanteNome
  ].join(" ").toLowerCase();
}

function criarMensagemVazia(titulo, texto) {
  return `
    <div class="empty-card">
      <h3>${escaparHTML(titulo)}</h3>
      <p>${escaparHTML(texto)}</p>
    </div>
  `;
}

function criarCardChamado(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const iconeClasse = obterClasseIcone(chamado.status);
  const sla = calcularSLA(chamado);
  const textoSLA = chamado.prioridade === "Urgente"
    ? sla.texto
    : `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;

  return `
    <div class="ticket" onclick="abrirDetalhesChamado(${formatarParametroJS(chamado.id)})">
      <div class="ticket-icon ${iconeClasse}">
        ${pegarIconeCategoria(chamado.categoria)}
      </div>

      <div class="ticket-info">
        <h3>${escaparHTML(chamado.descricao)}</h3>
        <p>
          ${escaparHTML(chamado.categoria)}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.local)}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.setor || "Setor não informado")}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.data)}
        </p>

        <small class="sla-badge ${sla.classe}">${escaparHTML(textoSLA)}</small>
      </div>

      <span class="status ${statusClasse}">${escaparHTML(chamado.status)}</span>
    </div>
  `;
}

function filtrarChamados(status, botao) {
  filtroStatusAtual = status;

  document.querySelectorAll("#filtrosChamados .filter").forEach(botaoFiltro => {
    botaoFiltro.classList.remove("active");
  });

  if (botao) {
    botao.classList.add("active");
  }

  renderizarChamados();
}

function pesquisarChamados(valor) {
  termoBuscaChamados = valor.trim().toLowerCase();
  renderizarChamados();
}

function obterPesoStatus(chamado) {
  const sla = calcularSLA(chamado);

  if (chamado.status === "CONCLUÍDO") {
    return 90;
  }

  if (chamado.status === "CANCELADO") {
    return 100;
  }

  if (chamado.prioridade === "Urgente") {
    return 1;
  }

  if (sla.texto === "Atrasado") {
    return 2;
  }

  if (sla.texto === "Vence em breve") {
    return 3;
  }

  if (chamado.status === "ABERTO") {
    return 4;
  }

  if (chamado.status === "EM ANDAMENTO") {
    return 5;
  }

  if (chamado.status === "AGUARDANDO") {
    return 6;
  }

  return 50;
}

function obterPesoPrioridade(prioridade) {
  const pesos = {
    Urgente: 1,
    Alta: 2,
    Média: 3,
    Baixa: 4
  };

  return pesos[prioridade] || 4;
}

function ordenarChamadosPorPrioridade(lista) {
  return lista.sort((a, b) => {
    const pesoStatusA = obterPesoStatus(a);
    const pesoStatusB = obterPesoStatus(b);

    if (pesoStatusA !== pesoStatusB) {
      return pesoStatusA - pesoStatusB;
    }

    const pesoPrioridadeA = obterPesoPrioridade(a.prioridade);
    const pesoPrioridadeB = obterPesoPrioridade(b.prioridade);

    if (pesoPrioridadeA !== pesoPrioridadeB) {
      return pesoPrioridadeA - pesoPrioridadeB;
    }

    const dataA = obterDataValida(a.criadoEm, a.data).getTime();
    const dataB = obterDataValida(b.criadoEm, b.data).getTime();

    return dataA - dataB;
  });
}

function obterPrazoHoras(prioridade) {
  const prazos = {
    Urgente: 0,
    Alta: 1,
    Média: 24,
    Baixa: 72
  };

  return prazos[prioridade] ?? 72;
}

function calcularSLA(chamado) {
  if (chamado.status === "CONCLUÍDO") {
    return { texto: "Concluído", classe: "sla-green" };
  }

  if (chamado.status === "CANCELADO") {
    return { texto: "Cancelado", classe: "sla-red" };
  }

  if (chamado.prioridade === "Urgente") {
    return { texto: "Atendimento imediato", classe: "sla-red" };
  }

  const criadoEm = obterDataValida(chamado.criadoEm, chamado.data);
  const prazoHoras = obterPrazoHoras(chamado.prioridade);
  const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);
  const diferencaMs = vencimento - new Date();
  const diferencaHoras = Math.ceil(diferencaMs / (1000 * 60 * 60));

  if (diferencaMs < 0) {
    return { texto: "Atrasado", classe: "sla-red" };
  }

  if (diferencaHoras <= 2) {
    return { texto: "Vence em breve", classe: "sla-orange" };
  }

  return { texto: "No prazo", classe: "sla-blue" };
}

function formatarVencimentoSLA(chamado) {
  if (chamado.prioridade === "Urgente") {
    return "Imediatamente";
  }

  const criadoEm = obterDataValida(chamado.criadoEm, chamado.data);
  const prazoHoras = obterPrazoHoras(chamado.prioridade);
  const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);

  return vencimento.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function chamadoEstaAtrasado(chamado) {
  return calcularSLA(chamado).texto === "Atrasado";
}

function obterClasseStatus(status) {
  if (status === "CONCLUÍDO") {
    return "status-green";
  }

  if (status === "AGUARDANDO") {
    return "status-orange";
  }

  if (status === "CANCELADO") {
    return "status-red";
  }

  return "status-blue";
}

function obterClasseIcone(status) {
  if (status === "CONCLUÍDO") {
    return "green-bg";
  }

  if (status === "AGUARDANDO" || status === "CANCELADO") {
    return "orange-bg";
  }

  return "blue-bg";
}

function pegarIconeCategoria(categoria) {
  if (categoria === "Elétrica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 18h6M10 22h4" stroke="currentColor" stroke-linecap="round" />
        <path d="M8 14a6 6 0 1 1 8 0c-.8.7-1.2 1.5-1.2 2.4H9.2C9.2 15.5 8.8 14.7 8 14Z" stroke="currentColor" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (categoria === "Hidráulica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 10h12a4 4 0 0 1 4 4v1" stroke="currentColor" stroke-linecap="round" />
        <path d="M6 10V6M11 10V6" stroke="currentColor" stroke-linecap="round" />
        <path d="M19 18s-2 2.2-2 3.5a2 2 0 0 0 4 0C21 20.2 19 18 19 18Z" fill="currentColor" />
      </svg>
    `;
  }

  if (categoria === "Alvenaria") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M7 3h9v18H7V3Z" fill="currentColor" opacity=".95" />
        <path d="M16 5h2v16h-2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="13" cy="12" r="1" fill="#fff" />
      </svg>
    `;
  }

  if (categoria === "Pintura") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20h16" stroke="currentColor" stroke-linecap="round" />
        <path d="M6 16 16 6l2 2L8 18H6v-2Z" stroke="currentColor" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (categoria === "Eletrônica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" />
        <path d="M8 21h8M12 16v5" stroke="currentColor" stroke-linecap="round" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-3 3-2.4-2.4 2.4-3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function selecionarCategoriaRapida(categoria, botao) {
  const campoCategoria = document.getElementById("categoriaChamado");

  if (campoCategoria) {
    campoCategoria.value = categoria;
  }

  document.querySelectorAll(".category-fast-button").forEach(item => {
    item.classList.remove("active");
  });

  if (botao) {
    botao.classList.add("active");
  }
}

