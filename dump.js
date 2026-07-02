const fs = require('fs');
const content = fs.readFileSync('src/app/frases/frases-client.tsx', 'utf8');
const lines = content.split(/\r?\n/);
for(let i = 1060; i <= 1110; i++) {
  console.log(`${i}: ${lines[i]}`);
}
