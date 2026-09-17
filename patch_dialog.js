const fs = require('fs');
let code = fs.readFileSync('src/app/frases/frases-client.tsx', 'utf8');

const target = `      </main>
      
      <ClientOnly>`;

const replacement = `      </main>

      <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Frase</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta frase permanentemente do banco de dados?
              <br/><br/>
              <span className="italic">"{quoteToDelete?.quote}"</span>
              <br/><br/>
              Esta ação não pode ser desfeita e afetará todos os usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeGlobalDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir do banco
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <ClientOnly>`;

if (code.includes('<ClientOnly>')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/app/frases/frases-client.tsx', code);
  console.log('Patch applied for AlertDialog');
} else {
  console.log('Target not found');
}
