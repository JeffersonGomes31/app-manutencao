# Correção — Código fixo do colaborador

## Objetivo
Evitar que o colaborador perca a visualização das próprias OS quando fizer logout e entrar novamente usando apenas nome + setor.

## Alterações aplicadas

1. Foi criado um código fixo local do colaborador no padrão `COL-XXXX-XXXXXX`.
2. O código fica salvo no `localStorage` e não é apagado no logout comum do colaborador.
3. Cada OS criada pelo colaborador recebe o campo `colaboradorCodigo`.
4. Ao entrar, o app registra o UID anônimo atual dentro do documento `colaboradores/{codigo}`.
5. As consultas de OS do colaborador passaram a buscar também por `colaboradorCodigo`.
6. As regras do Firestore passaram a permitir leitura/cancelamento quando o UID atual estiver autorizado no documento `colaboradores/{codigo}`.

## Limitação consciente
Essa abordagem resolve a continuidade no mesmo navegador/dispositivo. Se o usuário limpar os dados do navegador ou usar outro aparelho, o código local pode ser perdido. Para produção mais robusta, o próximo passo seria transformar esse código em uma identificação recuperável, como matrícula, e-mail institucional, senha ou PIN.

## Atenção
Publique o arquivo `firestore.rules` atualizado no Firebase Console. Sem isso, as permissões novas não serão aplicadas.
