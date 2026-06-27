#!/bin/bash
# Script para salvar, criar uma tag de versão e enviar as alterações para o GitHub

echo "Adicionando todos os arquivos..."
git add .

# Define o fuso horário para Brasília (UTC-3)
export TZ="America/Sao_Paulo"

# Cria um commit com data e hora de Brasília
COMMIT_MESSAGE="Salvo em $(date +'%Y-%m-%d %H:%M:%S')"
echo "Criando commit com a mensagem: $COMMIT_MESSAGE"
# O || true evita que o script pare se não houver nada para commitar
git commit -m "$COMMIT_MESSAGE" || true

# Cria uma tag com a data e hora de Brasília
TAG_NAME="versao_$(date +'%Y-%m-%d_%H%M')"
echo "Criando a etiqueta (tag) de versão: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Versão de $(date +'%Y-%m-%d %H:%M:%S')"

echo "Enviando alterações e a nova etiqueta para o repositório 'main' no GitHub..."
# Usa 'origin', que foi configurado pelo 'iniciar_git.sh'
# O comando também envia todas as tags com --tags.
if git push origin main --tags; then
  echo "✅ Versão salva no GitHub com sucesso com a etiqueta '$TAG_NAME'!"
else
  echo "❌ Falha ao enviar para o GitHub. Verifique suas credenciais de acesso (use o Personal Access Token como senha)."
fi
