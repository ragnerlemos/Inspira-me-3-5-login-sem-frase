const fs = require('fs');
let code = fs.readFileSync('src/app/cadastro/components/searchable-combobox.tsx', 'utf8');

// Replace ScrollArea with div
code = code.replace(
  '<ScrollArea className="max-h-64 p-1">',
  '<div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">'
);
code = code.replace(
  '</ScrollArea>',
  '</div>'
);

fs.writeFileSync('src/app/cadastro/components/searchable-combobox.tsx', code);
