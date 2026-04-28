# Relatório de revisão do projeto

## Principais ajustes realizados

- Padronização geral dos arquivos JavaScript com o mesmo estilo de escrita: nomes claros, funções menores, guard clauses, template literals e organização por responsabilidade.
- Correção do `manifest.json`, que estava sem a chave final de fechamento e poderia impedir a instalação correta como PWA.
- Criação do arquivo `index.html` como entrada principal do projeto, mantendo `index-corrigido.html` por compatibilidade.
- Ajuste do `service-worker.js` para usar cache versionado, limpar caches antigos, aceitar apenas requisições GET e incluir `index.html` e `index-corrigido.html` no cache.
- Remoção de código morto dentro de `renderizarHistorico`, que continha uma rotina antiga de atualização de status após um `return`.
- Correção de duplicidades e inconsistências na normalização de chamados.
- Padronização de mensagens vazias, busca, filtros, ordenação, cálculo de SLA e renderização dos cards.
- Melhoria dos controles de permissão para manutenção autorizada em painel, modal e comunicados.
- Correção textual no cabeçalho: “Olá, seja bem-vindo!”.
- Remoção do arquivo `desktop.ini`, que era um artefato do Windows e não faz parte do projeto.

## Validações executadas

- Verificação de sintaxe em todos os arquivos JavaScript com `node --check`.
- Validação do `manifest.json` com `JSON.parse`.
- Conferência das funções chamadas pelos atributos `onclick`, `oninput` e `onchange` do HTML.

## Observação importante

Esta versão depende do Firebase Authentication, da coleção `usuarios` e das regras do Firestore configuradas corretamente para liberar o acesso aos dados online.

## Integração Firebase

- Adicionada conexão com Firebase Authentication e Cloud Firestore.
- Login agora usa e-mail e senha cadastrados no Firebase Authentication.
- O perfil do usuário é carregado da coleção `usuarios` no Firestore.
- Chamados passaram a ser salvos e carregados pela coleção `chamados`.
- Comunicados passaram a ser salvos e carregados pela coleção `comunicados`.
- Removido uso de `localStorage` para login, chamados e comunicados.
- Incluído arquivo `REGRAS_FIRESTORE.md` com regras compatíveis com os status em maiúsculas usados pelo app.
