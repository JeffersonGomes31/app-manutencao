# Implementação — Diagnóstico Inicial da Unidade

## O que foi implementado

Foi integrada ao app uma nova área operacional chamada **Diagnóstico inicial da unidade**, disponível somente para o perfil de manutenção.

A tela permite registrar itens de inspeção antes de abrir OS, separando pendências por local, sistema técnico, tipo de demanda, prioridade P1–P5, status, descrição, risco/impacto, ação recomendada e material necessário.

## Coleção Firestore

A nova funcionalidade usa a coleção:

```txt
diagnosticos
```

As regras do Firestore foram atualizadas para permitir acesso somente ao perfil `manutencao`.

## Arquivos alterados

- `index.html`
- `css/style.css`
- `src/constants/firebase.js`
- `src/constants/permissoes.js`
- `js/state.js`
- `js/firebase-service.js`
- `js/app.js`
- `js/navigation.js`
- `firestore.rules`
- `service-worker.js`

## Arquivos já existentes aproveitados

- `js/diagnostico.js`
- `css/diagnostico.css`

Esses arquivos já estavam no projeto, mas ainda não estavam completamente conectados ao app.

## Como testar

1. Publicar as regras do Firestore:

```bash
firebase deploy --only firestore:rules
```

2. Abrir o app como manutenção.
3. Entrar no **Painel da manutenção**.
4. Clicar em **Abrir diagnóstico inicial**.
5. Registrar um item de teste.
6. Confirmar no Firebase a criação da coleção `diagnosticos`.
7. Clicar em **Gerar OS a partir do item** para validar o pré-preenchimento da tela Nova OS.
8. Entrar como colaborador comum e confirmar que a área não aparece.

## Observação técnica

A geração de OS a partir do diagnóstico não cria a OS automaticamente. Ela abre a tela de Nova OS com os campos principais pré-preenchidos, exigindo revisão manual antes de salvar. Isso reduz o risco de criar OS incompleta ou com prioridade incorreta.
