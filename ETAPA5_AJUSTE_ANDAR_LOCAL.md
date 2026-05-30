# Ajuste na OS: Andar → Local do andar

Alteração aplicada sobre a Etapa 5.

## O que mudou

- Removido o seletor antigo de `Bloco / Setor` da abertura de OS.
- Adicionado o fluxo em cascata:
  1. Escolher o andar.
  2. Abrir somente os locais daquele andar.
- A OS passa a salvar:
  - `andar`: andar selecionado;
  - `local`: local selecionado dentro do andar;
  - `setor`: mantido com o valor do andar para compatibilidade com telas e indicadores existentes;
  - `setorSolicitante`: nome/setor informado pelo solicitante.

## Firebase

Não exige nova coleção. O campo `andar` é opcional em novas OS.
