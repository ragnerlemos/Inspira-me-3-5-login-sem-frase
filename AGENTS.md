# Protocolo de Segurança para Alterações em Arquivos

Este documento estabelece as regras obrigatórias que o agente de IA deve seguir ao modificar qualquer arquivo neste projeto.

## Diretrizes Fundamentais

1. **Nunca Excluir ou Renomear Arquivos Automaticamente**: É estritamente proibido apagar, renomear ou substituir qualquer arquivo sem autorização explícita.
2. **Apresentação de Plano Prévio**: Antes de realizar qualquer modificação no código, o agente deve apresentar um plano detalhado.
3. **Confirmação Obrigatória**: Aguardar a aprovação expressa do usuário antes de efetuar qualquer alteração estrutural ou lógica nos arquivos.
4. **Preservação da Integridade**: Não apagar arquivos existentes sob pretexto de resolver conflitos e evitar alterações desnecessárias em arquivos não relacionados com a tarefa solicitada.

## Estrutura do Plano de Alterações

Toda proposta de alteração de código deve listar claramente:
- **Arquivos a criar**: Nome e caminho de novos arquivos, se aplicável.
- **Arquivos a modificar**: Nome e caminho dos arquivos existentes que serão alterados.
- **Arquivos a remover**: Somente em caso de necessidade técnica absoluta, com justificativa robusta.
- **Motivo de cada alteração**: Explicação clara do impacto e objetivo de cada modificação.
