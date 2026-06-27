const fs = require('fs');
const content = fs.readFileSync('.next/server/chunks/471.js', 'utf8');
const snippet = content.substring(21350, 21550);
console.log(snippet);
