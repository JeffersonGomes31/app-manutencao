const SENHA_MANUTENCAO = "8059";
const EMAIL_MANUTENCAO_AUTORIZADO = "up";

const CHAVE_USUARIO_ATUAL = "usuarioAtualManutencao";
const CHAVE_CHAMADOS = "chamadosManutencao";
const CHAVE_COMUNICADOS = "comunicadosManutencao";

const USUARIO_PADRAO = {
  id: "colaborador-001",
  nome: "Colaborador",
  setor: "Solicitante",
  email: "usuario@email.com",
  unidade: "Senac Campo Mourão",
  perfil: "colaborador",
  manutencaoAutorizado: false,
  perfilConfigurado: false
};

function lerJSONLocalStorage(chave, valorPadrao) {
  try {
    const valorSalvo = localStorage.getItem(chave);

    if (!valorSalvo) {
      return valorPadrao;
    }

    return JSON.parse(valorSalvo);
  } catch (erro) {
    console.warn("Não foi possível ler os dados salvos:", chave, erro);
    return valorPadrao;
  }
}

let usuarioAtual = lerJSONLocalStorage(CHAVE_USUARIO_ATUAL, { ...USUARIO_PADRAO });
let chamados = lerJSONLocalStorage(CHAVE_CHAMADOS, []);
let comunicados = lerJSONLocalStorage(CHAVE_COMUNICADOS, []);

let filtroStatusAtual = "TODOS";
let chamadoSelecionadoId = null;

let termoBuscaChamados = "";
let termoBuscaPainel = "";
let filtroPainelStatusAtual = "TODOS";
let filtroPainelPrioridadeAtual = "TODAS";
