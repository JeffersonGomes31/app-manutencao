# Atualização - Etapa 19

## Ajuste aplicado

Foi criado um modal visual padrão para feedbacks do app, substituindo os popups nativos do navegador.

## O que mudou

- Criado `js/ui-feedback.js`.
- Adicionado estilo visual em `css/componentes.css`.
- `alert()` nativo foi substituído por modal próprio do app.
- Confirmações críticas passaram a usar `appConfirm()`.
- O cabeçalho do navegador, como `jeffersongomes31.github.io diz`, deixa de aparecer nos feedbacks do app.
- Atualizado cache do PWA para evitar carregamento de JavaScript antigo.

## Firebase

Não precisa alterar Firebase.
Não precisa alterar `firestore.rules`.
Não foi criada nova coleção.

## Commit sugerido

```txt
feat: padronizar modal de feedback do app
```
