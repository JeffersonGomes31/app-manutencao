# Correção — erro ao carregar chamados do Firebase

## Sintoma

Ao entrar como Colaborador, o app exibia a mensagem:

> Não foi possível carregar os chamados do Firebase.

## Causa

Depois do endurecimento das regras do Firestore, o colaborador só pode ler chamados próprios, vinculados ao UID autenticado.

O código ainda tentava abrir listeners por `colaboradorChave` e `colaboradorLocalId`. Esses campos são locais do navegador e não comprovam autoria nas regras de segurança. Por isso, o Firestore bloqueava a consulta com `permission-denied`.

## Correção aplicada

No arquivo `js/firebase-service.js`, a função `observarChamadosFirebase()` foi ajustada para o perfil Colaborador consultar apenas:

- `criadoPorUid == usuario.id`
- `solicitanteId == usuario.id`

Isso alinha o código com as regras seguras já publicadas.

## Observação

Chamados antigos sem `criadoPorUid` ou `solicitanteId` vinculados ao UID atual podem não aparecer para o Colaborador. Isso é esperado após a correção de segurança.
