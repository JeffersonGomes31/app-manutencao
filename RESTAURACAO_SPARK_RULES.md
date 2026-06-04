# Restauração do projeto compatível com Firebase Spark

Esta versão restaura o projeto anterior ao fluxo de convite por Cloud Functions.

## Mantido

- Colaborador entra por nome e setor, usando autenticação anônima.
- Manutenção entra por e-mail e senha.
- Gerência entra por e-mail e senha.
- Não há Cloud Functions.
- Não há Resend.
- Não exige plano Blaze.

## Arquivos importantes

- `firestore.rules`: regras corretas para esta versão.
- `firebase.json`: permite publicar Hosting e Rules pelo Firebase CLI sem Functions.
- `service-worker.js`: cache renomeado para forçar o navegador a buscar a versão restaurada.

## Comandos de publicação

Na raiz do projeto:

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Ou tudo junto:

```bash
firebase deploy --only firestore:rules,hosting
```

Não rode:

```bash
firebase deploy --only functions
```

## Configuração dos usuários manuais

### Manutenção

No Firebase Authentication, crie um usuário com e-mail e senha.
No Firestore, crie em `usuarios/{UID_DO_AUTH}`:

```json
{
  "nome": "Manutenção",
  "email": "email-da-manutencao",
  "setor": "Manutenção",
  "perfil": "manutencao",
  "ativo": true,
  "manutencaoAutorizado": true,
  "unidade": "Senac Campo Mourão"
}
```

### Gerência

No Firebase Authentication, crie um usuário com e-mail e senha.
No Firestore, crie em `usuarios/{UID_DO_AUTH}`:

```json
{
  "nome": "Gerência",
  "email": "email-da-gerencia",
  "setor": "Gerência",
  "perfil": "gerencia",
  "ativo": true,
  "unidade": "Senac Campo Mourão"
}
```

## Authentication necessário

Em Authentication > Sign-in method, mantenha habilitado:

- Anonymous
- Email/Password
