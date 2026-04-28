# Regras do Firestore para esta versão

Cole estas regras em **Firestore Database > Regras**.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function estaLogado() {
      return request.auth != null;
    }

    function temCadastro() {
      return estaLogado() && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid));
    }

    function usuarioAtual() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data;
    }

    function estaAtivo() {
      return temCadastro() && usuarioAtual().ativo == true;
    }

    function ehAdmin() {
      return estaAtivo() && usuarioAtual().perfil == "admin";
    }

    function ehManutencao() {
      return estaAtivo() && usuarioAtual().perfil == "manutencao";
    }

    function ehManutencaoOuAdmin() {
      return ehManutencao() || ehAdmin();
    }

    function aguardandoTemJustificativa() {
      return request.resource.data.status != "AGUARDANDO"
        || (
          request.resource.data.justificativaAguardando is string
          && request.resource.data.justificativaAguardando.size() > 0
        );
    }

    match /usuarios/{userId} {
      allow read: if estaAtivo() && (request.auth.uid == userId || ehManutencaoOuAdmin());
      allow create, update, delete: if ehAdmin();
    }

    match /chamados/{chamadoId} {
      allow create: if estaAtivo()
        && request.resource.data.criadoPorUid == request.auth.uid
        && aguardandoTemJustificativa();

      allow read: if estaAtivo()
        && (
          resource.data.criadoPorUid == request.auth.uid
          || ehManutencaoOuAdmin()
        );

      allow update: if estaAtivo()
        && aguardandoTemJustificativa()
        && (
          ehManutencaoOuAdmin()
          || (
            resource.data.criadoPorUid == request.auth.uid
            && resource.data.status == "ABERTO"
            && request.resource.data.status == "CANCELADO"
          )
        );

      allow delete: if ehAdmin();
    }

    match /comunicados/{comunicadoId} {
      allow read: if estaAtivo();
      allow create, update, delete: if ehManutencaoOuAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
