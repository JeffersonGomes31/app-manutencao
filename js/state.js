const USUARIO_PADRAO = {
  id: "",
  nome: "Colaborador",
  setor: "Solicitante",
  email: "",
  unidade: "Senac Campo Mourão",
  perfil: "colaborador",
  manutencaoAutorizado: false,
  perfilConfigurado: false
};

let usuarioAtual = { ...USUARIO_PADRAO };
let chamados = [];
let comunicados = [];
let notificacoes = [];

let filtroStatusAtual = "TODOS";
let chamadoSelecionadoId = null;

let termoBuscaChamados = "";
let termoBuscaPainel = "";
let filtroPainelStatusAtual = "TODOS";
let filtroPainelPrioridadeAtual = "TODAS";

let monitorChamados = null;
let monitorComunicados = null;
let monitorNotificacoes = null;
