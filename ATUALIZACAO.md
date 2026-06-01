# Atualização

## Etapa 14 — Persistência das OS por colaborador

- Adicionado identificador local persistente para colaboradores no navegador.
- Novas OS passam a gravar `colaboradorLocalId` junto com `criadoPorUid`, `criadoPorNome` e `criadoPorEmail`.
- A listagem de OS do colaborador agora busca tanto pelo identificador local persistente quanto pelo UID autenticado atual.
- Isso evita que o histórico de OS desapareça quando o acesso anônimo do Firebase muda em um novo acesso.
- Mantida a visão completa para manutenção/admin no painel.
- Mantida a compatibilidade com OS antigas por `criadoPorUid`.
- Atualizado o cache do PWA para forçar carregamento dos novos arquivos JavaScript.
- Não foi criada nova coleção Firebase.
- Não houve necessidade de alteração em `firestore.rules`.

### Observação técnica

As OS antigas que não possuem `colaboradorLocalId` continuam aparecendo quando ainda estiverem vinculadas ao mesmo UID anônimo do Firebase. As novas OS passam a ter vínculo mais estável por navegador/dispositivo.

### Commit sugerido

```txt
feat: persistir historico de OS por colaborador
```
