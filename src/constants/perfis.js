/* =====================================================
   PERFIS DO SISTEMA
   Centraliza os tipos de usuário aceitos no app.
===================================================== */

const PERFIS_USUARIO = Object.freeze({
  COLABORADOR: "colaborador",
  MANUTENCAO: "manutencao"
});

const PERFIS_USUARIO_LISTA = Object.freeze([
  PERFIS_USUARIO.COLABORADOR,
  PERFIS_USUARIO.MANUTENCAO
]);

const NOMES_PERFIS_USUARIO = Object.freeze({
  [PERFIS_USUARIO.COLABORADOR]: "Colaborador",
  [PERFIS_USUARIO.MANUTENCAO]: "Manutenção"
});

const ALIASES_PERFIS_USUARIO = Object.freeze({
  colaborador: PERFIS_USUARIO.COLABORADOR,
  solicitante: PERFIS_USUARIO.COLABORADOR,
  manutencao: PERFIS_USUARIO.MANUTENCAO,
  manutencao_predial: PERFIS_USUARIO.MANUTENCAO,
  tecnico: PERFIS_USUARIO.MANUTENCAO,
  tecnica: PERFIS_USUARIO.MANUTENCAO,
  responsavel_manutencao: PERFIS_USUARIO.MANUTENCAO
});
