
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
  version: 'v4',
  auth: auth,
});

export interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category?: string;
    subCategory?: string;
    sheetName: string;
    date?: string;
    time?: string;
    rowNumber?: number;
}

interface CategoriesHierarchy {
  [mainCategory: string]: string[];
}

export interface SheetHierarchy {
  [sheetName: string]: CategoriesHierarchy;
}


const CACHE_DURATION = 60000; 

interface GlobalCache {
  cachedQuotes: QuoteWithAuthor[] | null;
  lastFetchTime: number;
  cachedSheetNames: string[] | null;
  lastSheetNamesFetchTime: number;
}

const cache = (globalThis as unknown as { __quotesCache?: GlobalCache }).__quotesCache || (() => {
  const newCache: GlobalCache = {
    cachedQuotes: null,
    lastFetchTime: 0,
    cachedSheetNames: null,
    lastSheetNamesFetchTime: 0,
  };
  (globalThis as unknown as { __quotesCache: GlobalCache }).__quotesCache = newCache;
  return newCache;
})();


const normalizeCellValue = (value: any): string | undefined => {
    if (typeof value !== 'string') return undefined;

    const normalized = value.trim();
    if (!normalized) return undefined;

    const lowerValue = normalized.toLowerCase();
    if (lowerValue === 'undefined' || normalized === '$undefined' || lowerValue === 'todos') {
        return undefined;
    }

    return normalized;
};

const mapRowToQuote = (row: any[], index: number, sheetName: string, isNewStructure = false): QuoteWithAuthor | null => {
    let id: string;
    let quoteText: string | undefined;
    let category: string | undefined;
    let subCategory: string | undefined;
    let author: string | undefined;
    let date: string | undefined;
    let time: string | undefined;

    if (isNewStructure) {
        id = row[0]?.toString() || `${sheetName}-${index}`;
        date = row[1]?.toString();
        time = row[2]?.toString();
        subCategory = normalizeCellValue(row[3]);
        category = normalizeCellValue(row[4]);
        quoteText = row[6]?.toString();
        author = row[10]?.toString() || row[9]?.toString();
    } else {
        id = `${sheetName}-${index}`;
        date = row[0]?.toString();
        time = row[1]?.toString();
        subCategory = normalizeCellValue(row[2]);
        category = normalizeCellValue(row[3]);
        quoteText = row[5]?.toString();
        author = row[9]?.toString();
    }

    if (!quoteText) {
        if (isNewStructure && row[5]?.toString().trim()) {
            quoteText = row[5]?.toString();
        } else if (!isNewStructure && row[6]?.toString().trim()) {
            quoteText = row[6]?.toString();
        }
    }

    if (!quoteText || !quoteText.trim()) {
        return null;
    }

    return {
        id: id.toString().trim(),
        quote: quoteText.trim(),
        author: author ? author.trim() : undefined,
        category,
        subCategory,
        sheetName,
        date: date ? date.trim() : undefined,
        time: time ? time.trim() : undefined,
        rowNumber: index,
    };
};

export async function invalidateCache() {
    cache.cachedQuotes = null;
    cache.lastFetchTime = 0;
    cache.cachedSheetNames = null;
    cache.lastSheetNamesFetchTime = 0;
}

export async function getAllSheetNames(forceRefresh = false): Promise<string[]> {
    const now = Date.now();

    if (!forceRefresh && cache.cachedSheetNames && (now - cache.lastSheetNamesFetchTime < CACHE_DURATION)) {
        return cache.cachedSheetNames;
    }

    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        if (!spreadsheetId) {
            console.error('SPREADSHEET_ID não está definido no ambiente.');
            return [];
        }

        const spreadsheetMeta = await sheets.spreadsheets.get({
            spreadsheetId
        });
        
        const sheetNames = spreadsheetMeta.data.sheets
            ?.map(sheet => sheet.properties?.title)
            .filter((title): title is string => !!title);
        
        if (!sheetNames || sheetNames.length === 0) {
            console.warn('Nenhuma aba válida encontrada na planilha.');
            return [];
        }
        
        cache.cachedSheetNames = sheetNames;
        cache.lastSheetNamesFetchTime = now;
        return sheetNames;

    } catch (error) {
        console.error('Erro ao buscar nomes das abas:', error);
        return [];
    }
}


export async function getAllQuotes(forceRefresh = false): Promise<QuoteWithAuthor[]> {
    const now = Date.now();
    if (forceRefresh) {
        await invalidateCache();
    }
    
    if (cache.cachedQuotes && (now - cache.lastFetchTime < CACHE_DURATION) && !forceRefresh) {
        return cache.cachedQuotes;
    }

    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;
        if (!spreadsheetId) {
            console.error('SPREADSHEET_ID não está definido no ambiente.');
            return [];
        }

        const sheetNames = await getAllSheetNames(forceRefresh);
        if (!sheetNames || sheetNames.length === 0) {
            return [];
        }

        const ranges = sheetNames.map(name => `'${name}'!A:Z`);
        const response = await sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges,
        });

        const valueRanges = response.data.valueRanges;
        if (!valueRanges) {
            return [];
        }
        
        const quotes: QuoteWithAuthor[] = [];
        valueRanges.forEach((range) => {
            const sheetNameWithQuotes = range.range?.split('!')[0] || 'Desconhecida';
            const sheetName = sheetNameWithQuotes.replace(/'/g, ''); 
            
            if (range.values && range.values.length > 0) {
                const headers = range.values[0] || [];
                const firstCol = headers[0]?.toString().trim().toLowerCase() || '';
                const isNewStructure = firstCol === 'id' || firstCol === 'código' || firstCol === 'codigo' || firstCol === 'identificador' || firstCol === '#';

                for (let i = 1; i < range.values.length; i++) {
                    const quote = mapRowToQuote(range.values[i], i, sheetName, isNewStructure);
                    if (quote) {
                        quotes.push(quote);
                    }
                }
            }
        });
        
        cache.cachedQuotes = quotes;
        cache.lastFetchTime = now;
        return quotes;

    } catch (error) {
        console.error('Erro ao buscar dados do Google Sheets:', error);
        return [];
    }
}

export async function getSheetData(forceRefresh = false): Promise<SheetHierarchy> {
    const quotes = await getAllQuotes(forceRefresh);
    const sheetHierarchy: SheetHierarchy = {};

    quotes.forEach(quote => {
        if (!sheetHierarchy[quote.sheetName]) {
            sheetHierarchy[quote.sheetName] = {};
        }

        const sheetCategories = sheetHierarchy[quote.sheetName];

        if (quote.category) {
            if (!sheetCategories[quote.category]) {
                sheetCategories[quote.category] = [];
            }
            if (quote.subCategory && !sheetCategories[quote.category].includes(quote.subCategory) && quote.subCategory !== 'Todos') {
                sheetCategories[quote.category].push(quote.subCategory);
            }
        } else if (quote.subCategory && quote.subCategory !== 'Todos') {
            if (!sheetCategories[quote.subCategory]) {
                sheetCategories[quote.subCategory] = [];
            }
        }
    });
    
    for (const sheetName in sheetHierarchy) {
        for (const cat in sheetHierarchy[sheetName]) {
            sheetHierarchy[sheetName][cat].sort();
        }
    }

    return sheetHierarchy;
}
