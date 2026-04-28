/* =====================================================
   COMUNICADOS
===================================================== */

function criarComunicado() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode publicar comunicados.");
    return;
  }

  const tituloInput = document.getElementById("tituloComunicado");
  const textoInput = document.getElementById("textoComunicado");
  const origemInput = document.getElementById("origemComunicado");

  if (!tituloInput || !textoInput || !origemInput) {
    alert("Campos do comunicado não encontrados.");
    return;
  }

  const titulo = tituloInput.value.trim();
  const texto = textoInput.value.trim();
  const origem = origemInput.value;

  if (!titulo || !texto || !origem) {
    alert("Preencha título, mensagem e origem do comunicado.");
    return;
  }

  const novoComunicado = {
    id: Date.now(),
    titulo,
    texto,
    origem,
    data: new Date().toLocaleDateString("pt-BR"),
    autor: usuarioAtual.nome
  };

  comunicados.unshift(novoComunicado);

  salvarComunicados();
  renderizarComunicados();
  limparFormularioComunicado(tituloInput, textoInput, origemInput);

  alert("Comunicado publicado com sucesso.");
}

function limparFormularioComunicado(tituloInput, textoInput, origemInput) {
  tituloInput.value = "";
  textoInput.value = "";
  origemInput.value = "Manutenção";
}

function renderizarComunicados() {
  const listaComunicados = document.getElementById("listaComunicados");
  const listaComunicadosInicio = document.getElementById("listaComunicadosInicio");

  if (listaComunicados) {
    listaComunicados.innerHTML = comunicados.length > 0
      ? comunicados.map(comunicado => criarCardComunicado(comunicado, true)).join("")
      : criarMensagemVazia("Nenhum comunicado no momento", "Quando houver avisos importantes, eles aparecerão aqui.");
  }

  if (listaComunicadosInicio) {
    const comunicadosRecentes = comunicados.slice(0, 2);

    listaComunicadosInicio.innerHTML = comunicadosRecentes.length > 0
      ? comunicadosRecentes.map(comunicado => criarCardComunicado(comunicado, false)).join("")
      : criarMensagemVazia("Nenhum comunicado recente", "Os avisos importantes aparecerão aqui.");
  }
}

function criarCardComunicado(comunicado, mostrarAcao) {
  const botaoExcluir = usuarioEhManutencaoAutorizada() && mostrarAcao
    ? `
      <button type="button" class="notice-delete-button" onclick="excluirComunicado(${comunicado.id})">
        Excluir
      </button>
    `
    : "";

  return `
    <div class="notice-card">
      <div class="notice-icon orange-bg">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 14h3l8 4V6l-8 4H4v4Z" stroke="currentColor" stroke-linejoin="round" />
          <path d="M18 9a4 4 0 0 1 0 6M21 7a7 7 0 0 1 0 10" stroke="currentColor" stroke-linecap="round" />
        </svg>
      </div>

      <div class="notice-info">
        <h3>${escaparHTML(comunicado.titulo)}</h3>
        <p>${escaparHTML(comunicado.texto)}</p>
        <small>
          ${escaparHTML(comunicado.data)}
          •
          ${escaparHTML(comunicado.origem)}
        </small>

        ${botaoExcluir}
      </div>

      <div class="arrow">›</div>
    </div>
  `;
}

function excluirComunicado(id) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a equipe de manutenção pode excluir comunicados.");
    return;
  }

  const confirmar = confirm("Deseja excluir este comunicado?");

  if (!confirmar) {
    return;
  }

  comunicados = comunicados.filter(comunicado => Number(comunicado.id) !== Number(id));

  salvarComunicados();
  renderizarComunicados();

  alert("Comunicado excluído com sucesso.");
}
