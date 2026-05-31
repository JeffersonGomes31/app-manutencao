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
