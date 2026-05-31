# Atualização

- O andar **Telhado** agora utiliza os mesmos locais vinculados ao **1º ANDAR**.
- Removida a lista específica anterior do Telhado para evitar redundância.
- Mantida a fonte única `locaisPrimeiroAndarManutencao` para facilitar manutenção futura.
- Cache do PWA atualizado para carregar a nova versão.


## Controle técnico e logs automáticos

- Adicionado técnico responsável padrão do sistema.
- Adicionado histórico técnico automático nas OS.
- Inclusão de logs estruturados para rastreabilidade operacional.
- Compatibilidade com OS antigas sem campo de logs.
- Exibição do responsável técnico no modal da OS.

Commit sugerido:
feat: adicionar técnico responsável padrão e logs automáticos nas OS


## Remoção do solicitante manual

- Removido o campo manual **Nome do Solicitante** do formulário de abertura de OS.
- Removida a exibição **Solicitante informado** dos detalhes e do painel.
- A OS agora utiliza somente os dados do usuário autenticado em **Criado por**.
- Ajustadas buscas, notificações, perfil e contagem de chamados para usar `criadoPorUid` e `criadoPorNome`.
- Mantida a estrutura de técnico responsável padrão e logs automáticos.
- Cache do PWA atualizado para carregar esta nova versão.

Commit sugerido:
refactor: remover solicitante manual e usar usuario autenticado como criador da OS


---

## Correção emergencial - envio de OS ao Firebase

- Corrigida a criação de OS após a remoção do campo manual de solicitante.
- Mantido o visual limpo usando apenas **Criado por** na interface.
- Adicionados campos internos de compatibilidade (`solicitanteId`, `solicitanteNome`, `solicitanteEmail`) preenchidos automaticamente com o usuário autenticado, para evitar bloqueio por regras antigas do Firestore.
- Melhorada a mensagem técnica de erro no envio ao Firebase.

### Commit sugerido

```txt
fix: manter compatibilidade com regras do firebase ao criar OS autenticada
```

---

## Organização das coleções Firebase

- Centralizados os nomes das coleções Firebase na constante `COLLECTIONS`.
- Substituídos acessos diretos como `collection("chamados")` por `collection(COLLECTIONS.CHAMADOS)`.
- Incluídas as coleções reais utilizadas pelo app: `chamados`, `planosPreventivos`, `ativos`, `usuarios`, `notificacoes` e `comunicados`.
- Adicionado o arquivo `firestore.rules` na raiz do projeto para versionamento, backup e manutenção das regras do Firestore.
- Cache do PWA atualizado para carregar esta nova versão.

### Commit sugerido

```txt
refactor: centralizar colecoes firebase e versionar regras do firestore
```


- Melhoria visual do histórico técnico das OS com timeline e ícones.
