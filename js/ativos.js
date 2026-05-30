/* =====================================================
   ATIVOS / EQUIPAMENTOS / QR CODE
===================================================== */

let qrInicialProcessado = false;

function prepararQRCodeInicial() {
  if (qrInicialProcessado) {
    return;
  }

  qrInicialProcessado = true;
  const parametros = new URLSearchParams(window.location.search);
  const codigo = parametros.get("qr") || parametros.get("equipamento") || parametros.get("eq") || parametros.get("patrimonio");

  if (!codigo) {
    return;
  }

  preencherAtivoNaNovaOS(codigo.trim());
  openPage("novo");
}

function preencherAtivoNaNovaOS(codigo) {
  const equipamentoInput = document.getElementById("equipamentoChamado");
  const nomeEquipamentoInput = document.getElementById("nomeEquipamentoChamado");
  const localInput = document.getElementById("localChamado");
  const ativo = encontrarAtivoPorCodigo(codigo);

  if (equipamentoInput) {
    equipamentoInput.value = codigo;
  }

  if (ativo) {
    if (nomeEquipamentoInput) {
      nomeEquipamentoInput.value = ativo.nome || "";
    }

    if (localInput && !localInput.value) {
      localInput.value = ativo.localizacao || "";
    }
  }
}

function encontrarAtivoPorCodigo(codigo) {
  const codigoNormalizado = normalizarCodigoAtivo(codigo);

  return ativos.find(ativo => {
    return normalizarCodigoAtivo(ativo.codigo) === codigoNormalizado;
  });
}

function normalizarCodigoAtivo(codigo) {
  return String(codigo || "").trim().toUpperCase();
}

async function salvarAtivo() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode cadastrar ativos.");
    return;
  }

  const codigoInput = document.getElementById("codigoAtivo");
  const nomeInput = document.getElementById("nomeAtivo");
  const localInput = document.getElementById("localAtivo");
  const categoriaInput = document.getElementById("categoriaAtivo");

  if (!codigoInput || !nomeInput || !localInput || !categoriaInput) {
    alert("Campos do cadastro de ativo não encontrados.");
    return;
  }

  const codigo = normalizarCodigoAtivo(codigoInput.value);
  const nome = nomeInput.value.trim();
  const localizacao = localInput.value.trim();
  const categoria = categoriaInput.value;

  if (!codigo || !nome || !localizacao) {
    alert("Informe código, nome e localização do ativo.");
    return;
  }

  if (encontrarAtivoPorCodigo(codigo)) {
    alert("Já existe um ativo cadastrado com este código.");
    return;
  }

  const ativo = {
    codigo,
    nome,
    localizacao,
    categoria,
    ativo: true,
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome
  };

  try {
    await criarAtivoFirebase(ativo);
    limparFormularioAtivo();
    alert("Ativo cadastrado com sucesso.");
  } catch (erro) {
    console.error("Erro ao cadastrar ativo:", erro);
    alert("Não foi possível cadastrar o ativo no Firebase.");
  }
}

function limparFormularioAtivo() {
  ["codigoAtivo", "nomeAtivo", "localAtivo"].forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  const categoriaInput = document.getElementById("categoriaAtivo");

  if (categoriaInput) {
    categoriaInput.value = "Equipamento";
  }
}

function renderizarAtivos() {
  const listaAtivos = document.getElementById("listaAtivos");

  if (!listaAtivos) {
    return;
  }

  listaAtivos.innerHTML = ativos.length > 0
    ? ativos.map(criarCardAtivo).join("")
    : criarMensagemVazia("Nenhum ativo cadastrado", "Cadastre equipamentos, ambientes ou patrimônios para gerar histórico por QR Code.");
}

function criarCardAtivo(ativo) {
  const urlQr = `${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(ativo.codigo)}`;
  const totalOS = chamados.filter(chamado => normalizarCodigoAtivo(chamado.equipamentoCodigo) === normalizarCodigoAtivo(ativo.codigo)).length;

  return `
    <div class="asset-card">
      <h3>${escaparHTML(ativo.codigo)} • ${escaparHTML(ativo.nome)}</h3>
      <p><strong>Localização:</strong> ${escaparHTML(ativo.localizacao)}</p>
      <p><strong>Categoria:</strong> ${escaparHTML(ativo.categoria)}</p>
      <p><strong>OS vinculadas:</strong> ${totalOS}</p>
      <span class="asset-qr-link">${escaparHTML(urlQr)}</span>
      <button type="button" class="secondary-button" onclick="prepararOSDoAtivo(${formatarParametroJS(ativo.codigo)})">
        Abrir OS deste ativo
      </button>
      ${usuarioEhManutencaoAutorizada() ? `
        <button type="button" class="secondary-button" onclick="prepararPlanoPreventivoDoAtivo(${formatarParametroJS(ativo.codigo)})">
          Criar preventiva deste ativo
        </button>
      ` : ""}
    </div>
  `;
}

function prepararOSDoAtivo(codigo) {
  preencherAtivoNaNovaOS(codigo);
  openPage("novo");
}
