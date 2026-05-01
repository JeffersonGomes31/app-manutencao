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

function formatarParametroJS(valor) {
  const textoSeguro = String(valor)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

  return `'${textoSeguro}'`
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}


function idsIguais(idA, idB) {
  return String(idA) === String(idB);
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

const LIMITE_FOTOS_CHAMADO = 3;
const TAMANHO_MAXIMO_FOTO_CHAMADO = 1280;
const QUALIDADE_FOTO_CHAMADO = 0.74;

function converterFotoParaBase64(arquivo) {
  return converterImagemParaBase64Reduzida(
    arquivo,
    TAMANHO_MAXIMO_FOTO_CHAMADO,
    QUALIDADE_FOTO_CHAMADO
  );
}

function converterImagemParaBase64Reduzida(arquivo, tamanhoMaximo, qualidade) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
      reject(new Error("Arquivo de imagem inválido."));
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const maiorLado = Math.max(imagem.width, imagem.height);
        const escala = maiorLado > tamanhoMaximo ? tamanhoMaximo / maiorLado : 1;
        const largura = Math.max(1, Math.round(imagem.width * escala));
        const altura = Math.max(1, Math.round(imagem.height * escala));
        const canvas = document.createElement("canvas");
        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(new Error("Não foi possível preparar a imagem."));
          return;
        }

        canvas.width = largura;
        canvas.height = altura;
        contexto.drawImage(imagem, 0, 0, largura, altura);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };

      imagem.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
      imagem.src = leitor.result;
    };

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
