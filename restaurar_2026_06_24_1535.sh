#!/bin/bash

# Exibir banner/aviso para o usuário
echo "=========================================================="
echo "   RESTAURAÇÃO DO PROJETO - INSPIRAME (24/06/2026 15:35)   "
echo "=========================================================="
echo "ATENÇÃO: Este script irá restaurar o estado do seu projeto"
echo "para o ponto de salvamento criado às 15:35 do dia 24/06/2026."
echo ""
read -p "Tem certeza que deseja continuar? (s/N): " confirm

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Restauração cancelada pelo usuário."
    exit 0
fi

echo "Iniciando processo de restauração segura..."

# Definir caminhos
BACKUP_DIR="./backups/backup_2026_06_24_1535"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERRO: Diretório de backup não encontrado em $BACKUP_DIR"
    exit 1
fi

# 1. Limpeza inteligente (mantendo arquivos cruciais)
echo "Limpando arquivos atuais de forma inteligente..."
for item in * .*; do
    # Ignorar referências de diretório especial
    if [[ "$item" == "." || "$item" == ".." ]]; then
        continue
    fi
    
    # Lista de arquivos para preservar intactos na raiz
    if [[ "$item" == ".git" || "$item" == "node_modules" || "$item" == ".next" || "$item" == ".env" || "$item" == "firebase-applet-config.json" || "$item" == ".firebaserc" || "$item" == "firestore.rules" || "$item" == "backups" || "$item" == "restaurar_2026_06_24_1535.sh" || "$item" == "restaurar_2026_06_24_1535.bat" || "$item" == "scripts" ]]; then
        continue
    fi
    
    # Deletar arquivo ou pasta de forma segura
    if [ -d "$item" ]; then
        rm -rf "$item"
    else
        rm -f "$item"
    fi
done

# Deletar de forma segura o conteúdo de ./src
if [ -d "./src" ]; then
    rm -rf "./src"
fi

# 2. Copiar os arquivos do backup de volta para a raiz
echo "Copiando arquivos do ponto de salvamento..."
cp -r "$BACKUP_DIR/src" ./
for config_file in $(ls "$BACKUP_DIR"); do
    if [ "$config_file" != "src" ]; then
        cp -r "$BACKUP_DIR/$config_file" ./
    fi
done

echo ""
echo "=========================================================="
echo "SUCESSO: O projeto foi restaurado para o estado de 15:35!"
echo "=========================================================="
