import { getAllQuotes, getSheetData } from '../src/lib/dados';

async function main() {
    console.log('Iniciando teste de busca de frases via src/lib/dados.ts...');
    const quotes = await getAllQuotes(true);
    console.log(`Sucesso! Total de frases encontradas: ${quotes.length}`);
    
    if (quotes.length > 0) {
        console.log('\n--- Exibindo as primeiras 3 frases para verificação ---');
        quotes.slice(0, 3).forEach((q, i) => {
            console.log(`\nFrase [${i + 1}]:`);
            console.log(`  ID: ${q.id}`);
            console.log(`  Texto: "${q.quote}"`);
            console.log(`  Autor: ${q.author || 'Sem autor'}`);
            console.log(`  Categoria: ${q.category || 'Sem categoria'}`);
            console.log(`  Subcategoria: ${q.subCategory || 'Sem subcategoria'}`);
            console.log(`  Nome da Aba: ${q.sheetName}`);
        });
    } else {
        console.warn('Alerta: Nenhuma frase foi encontrada ou processada.');
    }
}

main().catch(error => {
    console.error('Erro executando teste de busca:', error);
});
