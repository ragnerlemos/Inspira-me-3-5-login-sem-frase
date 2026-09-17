const fs = require('fs');
let code = fs.readFileSync('src/app/frases/frases-client.tsx', 'utf8');

const target = `  const handleGlobalDelete = async (quote: QuoteWithAuthor) => {
    if (!isAdmin) return;
    
    if (!quote.hasId || !quote.sheetName) {
      toast({
        title: "Erro",
        description: "Esta frase não possui um ID permanente e não pode ser excluída do banco de dados.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(\`Tem certeza que deseja excluir esta frase permanentemente do banco de dados?\\n\\n"\${quote.quote}"\\n\\nIsso afetará todos os usuários.\`)) {
      return;
    }

    try {
      const token = await currentUser?.getIdToken();
      if (!token) throw new Error("Não autenticado");

      const res = await fetchWithBase('/api/admin/delete-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          quoteId: quote.id,
          sheetName: quote.sheetName,
          rowNumber: quote.rowNumber
        })
      });

      if (res.ok) {
        // Exibir notificação de sucesso
        toast({
          title: "Frase excluída com sucesso.",
        });
        
        // Remover imediatamente do estado local
        setAllQuotes(prev => prev.filter(q => q.id !== quote.id));
        
        // Recarregar dados da planilha para garantir sincronização
        await handleRefreshQuotes(true);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir");
      }
    } catch (error: any) {
      console.error(error);
      // Notificação de erro com a mensagem da API
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a frase.",
        variant: "destructive"
      });
    }
  };`;

const replacement = `  const handleGlobalDelete = (quote: QuoteWithAuthor) => {
    if (!isAdmin) return;
    
    if (!quote.hasId || !quote.sheetName) {
      toast({
        title: "Erro",
        description: "Esta frase não possui um ID permanente e não pode ser excluída do banco de dados.",
        variant: "destructive"
      });
      return;
    }

    setQuoteToDelete(quote);
  };

  const executeGlobalDelete = async () => {
    if (!quoteToDelete) return;
    const quote = quoteToDelete;
    setQuoteToDelete(null);

    try {
      const token = await currentUser?.getIdToken();
      if (!token) throw new Error("Não autenticado");

      const res = await fetchWithBase('/api/admin/delete-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          quoteId: quote.id,
          sheetName: quote.sheetName,
          rowNumber: quote.rowNumber
        })
      });

      if (res.ok) {
        // Exibir notificação de sucesso
        toast({
          title: "Frase excluída com sucesso.",
        });
        
        // Remover imediatamente do estado local
        setAllQuotes(prev => prev.filter(q => q.id !== quote.id));
        
        // Recarregar dados da planilha para garantir sincronização
        await handleRefreshQuotes(true);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir");
      }
    } catch (error: any) {
      console.error(error);
      // Notificação de erro com a mensagem da API
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a frase.",
        variant: "destructive"
      });
    }
  };`;

if (code.includes('if (!confirm(`Tem certeza')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/app/frases/frases-client.tsx', code);
  console.log('Patch applied for handleGlobalDelete');
} else {
  console.log('Target not found');
}
