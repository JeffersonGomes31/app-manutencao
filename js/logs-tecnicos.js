
const TECNICO_PADRAO = {
  nome: "Jefferson Gomes",
  funcao: "Oficial de Manutenção",
  setor: "Manutenção",
  telefone: "",
  assinatura: "",
  ativo: true
};

function obterTecnicoResponsavelPadrao() {
  return { ...TECNICO_PADRAO };
}

function gerarLogOS({ acao, descricao, usuario }) {
  const agora = new Date();

  return {
    data: agora.toLocaleDateString("pt-BR"),
    hora: agora.toLocaleTimeString("pt-BR"),
    dataISO: agora.toISOString(),
    acao: acao || "Atualização da OS",
    descricao: descricao || "",
    usuario: usuario || TECNICO_PADRAO.nome
  };
}

function adicionarLogChamado(chamado, log) {
  if (!chamado) return chamado;

  if (!Array.isArray(chamado.logs)) {
    chamado.logs = [];
  }

  chamado.logs.unshift(log);

  if (!Array.isArray(chamado.historico)) {
    chamado.historico = [];
  }

  chamado.historico.unshift({
    data: `${log.data} ${log.hora}`,
    acao: log.acao,
    descricao: log.descricao
  });

  return chamado;
}
