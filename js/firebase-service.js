/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyC48Vz7xsw8Ikzp3yz3QqVFWWPrvp1D3z4",
  authDomain: "app-manutencao-2169f.firebaseapp.com",
  databaseURL: "https://app-manutencao-2169f-default-rtdb.firebaseio.com",
  projectId: "app-manutencao-2169f",
  storageBucket: "app-manutencao-2169f.firebasestorage.app",
  messagingSenderId: "729718839494",
  appId: "1:729718839494:web:d92add8d24aa1e3fc65fc7"
};

let firebaseAuth = null;
let firebaseDb = null;

function inicializarFirebaseServico() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  firebaseAuth = firebase.auth();
  firebaseDb = firebase.firestore();
}

function observarAutenticacao(callback) {
  return firebaseAuth.onAuthStateChanged(callback);
}

function autenticarUsuario(email, senha) {
  return firebaseAuth.signInWithEmailAndPassword(email, senha);
}

function encerrarSessaoFirebase() {
  return firebaseAuth.signOut();
}

async function buscarPerfilFirebase(uid) {
  const documento = await firebaseDb.collection("usuarios").doc(uid).get();

  if (!documento.exists) {
    return null;
  }

  return {
    id: documento.id,
    ...documento.data()
  };
}

function observarChamadosFirebase(usuario, callback, callbackErro) {
  let consulta = firebaseDb.collection("chamados");

  if (usuario.perfil === "colaborador") {
    consulta = consulta.where("criadoPorUid", "==", usuario.id);
  } else {
    consulta = consulta.orderBy("criadoEm", "desc");
  }

  return consulta.onSnapshot(snapshot => {
    const lista = snapshot.docs.map(documento => normalizarChamadoFirebase(documento));
    callback(ordenarChamadosPorPrioridade(lista));
  }, callbackErro);
}

function observarComunicadosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection("comunicados")
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarComunicadoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarChamadoFirebase(chamado) {
  const agora = new Date();

  await firebaseDb.collection("chamados").add({
    ...chamado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    criadoEmISO: agora.toISOString(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function atualizarChamadoFirebase(id, dados) {
  await firebaseDb.collection("chamados").doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function adicionarItemArrayFirebase(item) {
  return firebase.firestore.FieldValue.arrayUnion(item);
}

async function criarComunicadoFirebase(comunicado) {
  await firebaseDb.collection("comunicados").add({
    ...comunicado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirComunicadoFirebase(id) {
  await firebaseDb.collection("comunicados").doc(String(id)).delete();
}

function normalizarChamadoFirebase(documento) {
  const dados = documento.data();
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date(dados.criadoEmISO || Date.now());
  const historico = Array.isArray(dados.historico) ? dados.historico : [];

  return {
    id: documento.id,
    descricao: dados.descricao || "Sem descrição",
    local: dados.local || "Não informado",
    setor: dados.setor || "Não informado",
    horario: dados.horario || "Não informado",
    precisaAcompanhamento: dados.precisaAcompanhamento || "Não informado",
    categoria: dados.categoria || "Outros",
    prioridade: dados.prioridade || "Baixa",
    status: dados.status || "ABERTO",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    criadoEm: dados.criadoEmISO || criadoEm.toISOString(),
    foto: dados.foto || "",
    fotoNome: dados.fotoNome || dados.foto || "",
    fotoData: dados.fotoData || "",
    solicitanteId: dados.solicitanteId || dados.criadoPorUid || "",
    solicitanteNome: dados.solicitanteNome || dados.criadoPorNome || "Não informado",
    criadoPorUid: dados.criadoPorUid || dados.solicitanteId || "",
    criadoPorNome: dados.criadoPorNome || dados.solicitanteNome || "Não informado",
    justificativaAguardando: dados.justificativaAguardando || "",
    historico
  };
}

function normalizarComunicadoFirebase(documento) {
  const dados = documento.data();
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date();

  return {
    id: documento.id,
    titulo: dados.titulo || "Sem título",
    texto: dados.texto || "",
    origem: dados.origem || "Manutenção",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    autor: dados.autor || "Não informado"
  };
}

function converterTimestampParaData(valor) {
  if (!valor) {
    return null;
  }

  if (typeof valor.toDate === "function") {
    return valor.toDate();
  }

  const data = new Date(valor);

  return Number.isNaN(data.getTime()) ? null : data;
}
