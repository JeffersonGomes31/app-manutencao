function setTextContent(id, valor) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    return;
  }

  elemento.textContent = valor;
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function salvarChamados() {
  localStorage.setItem(CHAVE_CHAMADOS, JSON.stringify(chamados));
}

function salvarComunicados() {
  localStorage.setItem(CHAVE_COMUNICADOS, JSON.stringify(comunicados));
}

function aplicarFeedbackSucesso(botao, textoSucesso, textoOriginal) {
  if (!botao) {
    return;
  }

  botao.classList.add("button-success");
  botao.textContent = textoSucesso;

  setTimeout(() => {
    botao.classList.remove("button-success");
    botao.textContent = textoOriginal;
  }, 1200);
}

function converterFotoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));

    leitor.readAsDataURL(arquivo);
  });
}

function converterDataBRParaISO(dataBR) {
  if (!dataBR) {
    return new Date().toISOString();
  }

  const partes = String(dataBR).split("/");

  if (partes.length !== 3) {
    return new Date().toISOString();
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);
  const data = new Date(ano, mes, dia, 9, 0, 0);

  if (Number.isNaN(data.getTime())) {
    return new Date().toISOString();
  }

  return data.toISOString();
}

function obterDataValida(dataISO, dataReservaBR) {
  const data = new Date(dataISO || converterDataBRParaISO(dataReservaBR));

  if (Number.isNaN(data.getTime())) {
    return new Date();
  }

  return data;
}

function gerarIdUsuario(email, perfil) {
  return `${perfil}-${email}`
    .toLowerCase()
    .trim()
    .replaceAll(" ", "")
    .replaceAll("@", "-")
    .replaceAll(".", "-");
}

function gerarIniciaisUsuario(nome) {
  if (!nome) {
    return "CO";
  }

  const partes = nome.trim().split(" ").filter(Boolean);

  if (partes.length === 0) {
    return "CO";
  }

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function statusFinalizado(status) {
  return status === "CONCLUÍDO" || status === "CANCELADO";
}

function atualizarPainelSeAberto() {
  const painel = document.getElementById("painel");

  if (painel && painel.classList.contains("active") && typeof renderizarPainelManutencao === "function") {
    renderizarPainelManutencao();
  }
}
