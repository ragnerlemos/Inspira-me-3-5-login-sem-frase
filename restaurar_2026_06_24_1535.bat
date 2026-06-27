@echo off
chcp 65001 > nul
echo ==========================================================
echo    RESTAURAÇÃO DO PROJETO - INSPIRAME (24/06/2026 15:35)   
echo ==========================================================
echo ATENÇÃO: Este script irá restaurar o estado do seu projeto
echo para o ponto de salvamento criado às 15:35 do dia 24/06/2026.
echo.
set /p confirm="Tem certeza que deseja continuar? (s/N): "

if /i "%confirm%" neq "s" (
    echo Restauração cancelada pelo usuário.
    goto end
)

echo Iniciando processo de restauração segura...

set BACKUP_DIR=backups\backup_2026_06_24_1535

if not exist %BACKUP_DIR% (
    echo ERRO: Diretório de backup não encontrado em %BACKUP_DIR%
    goto end
)

echo Limpando pasta de código-fonte atual (src)...
if exist src (
    rmdir /s /q src
)

echo Copiando pasta src de volta...
xcopy /e /i /y %BACKUP_DIR%\src src > nul

echo Copiando arquivos de configuração de volta...
for %%f in (package.json package-lock.json tsconfig.json next.config.ts next.config.js postcss.config.mjs tailwind.config.ts components.json apphosting.yaml capacitor.config.ts eslint.config.mjs .eslintrc.json index.html icon.png iniciar_git.sh metadata.json) do (
    if exist %BACKUP_DIR%\%%f (
        copy /y %BACKUP_DIR%\%%f . > nul
        echo   - %%f restaurado.
    )
)

echo.
echo ==========================================================
echo SUCESSO: O projeto foi restaurado para o estado de 15:35!
echo ==========================================================

:end
pause
