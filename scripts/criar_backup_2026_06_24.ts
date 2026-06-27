import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.resolve('./backups/backup_2026_06_24_1535');

const filesToBackup = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.ts',
  'next.config.js',
  'postcss.config.mjs',
  'tailwind.config.ts',
  'components.json',
  'apphosting.yaml',
  'capacitor.config.ts',
  'eslint.config.mjs',
  '.eslintrc.json',
  'index.html',
  'icon.png',
  'iniciar_git.sh',
  'metadata.json'
];

function copyFolderRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name === 'tmp' || entry.name === 'backups') {
        continue;
      }
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function runBackup() {
  console.log('Iniciando a criação do ponto de salvamento físico...');
  
  try {
    // 1. Criar o diretório de backup
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // 2. Copiar a pasta src
    const srcPath = path.resolve('./src');
    const destSrcPath = path.join(BACKUP_DIR, 'src');
    console.log(`Copiando pasta /src para ${destSrcPath}...`);
    copyFolderRecursive(srcPath, destSrcPath);
    
    // 3. Copiar os arquivos de configuração na raiz
    console.log('Copiando arquivos de configuração e dependências...');
    filesToBackup.forEach(file => {
      const srcFilePath = path.resolve(file);
      if (fs.existsSync(srcFilePath)) {
        const destFilePath = path.join(BACKUP_DIR, file);
        const parentDir = path.dirname(destFilePath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.copyFileSync(srcFilePath, destFilePath);
        console.log(`  - ${file} copiado com sucesso.`);
      }
    });

    console.log(`\nPonto de salvamento criado com sucesso em: ${BACKUP_DIR}`);
  } catch (error: any) {
    console.error('Erro ao criar o ponto de salvamento:', error.message);
    process.exit(1);
  }
}

runBackup();
