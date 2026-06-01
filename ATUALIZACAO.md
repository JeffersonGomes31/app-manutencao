# Atualização - Etapa 17

## Permissões simplificadas

Nesta etapa o sistema de perfis foi simplificado para trabalhar somente com dois papéis operacionais:

- Colaborador
- Manutenção

## Ajustes realizados

- Removido o perfil `admin` da centralização de perfis.
- Removidas permissões específicas de administrador como papel separado.
- A manutenção passa a concentrar as permissões avançadas do sistema.
- Atualizado `src/constants/perfis.js`.
- Atualizado `src/constants/permissoes.js`.
- Atualizado `js/auth-permissions.js`.
- Ajustado login para considerar apenas manutenção como perfil técnico autorizado.

## Permissões atuais

### Colaborador

- Abrir OS.
- Ver somente suas OS.
- Cancelar OS própria, se ainda não iniciada.
- Ver comunicados.
- Ver notificações próprias.
- Ver perfil.

### Manutenção

- Ver todas as OS.
- Assumir atendimento.
- Alterar status.
- Finalizar OS.
- Criar preventivas.
- Gerenciar ativos.
- Publicar comunicados.
- Ver painel.
- Ver logs técnicos.
- Gerenciar usuários.
- Exportar dados.
- Ajustar configurações.
- Auditar histórico.

## Firebase

Não houve alteração em coleções nem necessidade de ajuste em `firestore.rules`.

## Commit sugerido

```txt
refactor: simplificar perfis e permissoes
```
