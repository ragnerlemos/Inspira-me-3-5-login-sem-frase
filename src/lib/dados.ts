
import '@/lib/google-auth-patch';
import { google } from 'googleapis';

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^["']|["']$/g, '');
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
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
    hasId?: boolean;
    intro?: string;
    conclusion?: string;
    description?: string;
    music?: string;
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
    let intro: string | undefined;
    let conclusion: string | undefined;
    let description: string | undefined;
    let music: string | undefined;

    if (isNewStructure) {
        id = `${sheetName}-${index}`;
        date = row[1]?.toString();
        time = row[2]?.toString();
        subCategory = normalizeCellValue(row[3]);
        category = normalizeCellValue(row[4]);
        intro = row[5]?.toString();
        quoteText = row[6]?.toString();
        conclusion = row[7]?.toString();
        description = row[8]?.toString();
        music = row[9]?.toString();
        author = row[10]?.toString();
    } else {
        id = `${sheetName}-${index}`;
        date = row[0]?.toString();
        time = row[1]?.toString();
        subCategory = normalizeCellValue(row[2]);
        category = normalizeCellValue(row[3]);
        intro = row[4]?.toString();
        quoteText = row[5]?.toString();
        conclusion = row[6]?.toString();
        description = row[7]?.toString();
        music = row[8]?.toString();
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
        hasId: true,
        intro: intro?.trim(),
        conclusion: conclusion?.trim(),
        description: description?.trim(),
        music: music?.trim(),
    };
};

async function withTimeout<T>(promise: Promise<T>, ms = 8000, fallbackVal: T): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((resolve) => {
        timer = setTimeout(() => {
            console.warn(`[dados.ts] Operação com Google Sheets excedeu timeout de ${ms}ms. Retornando fallback.`);
            resolve(fallbackVal);
        }, ms);
    });

    return Promise.race([
        promise.then((res) => {
            clearTimeout(timer);
            return res;
        }),
        timeoutPromise,
    ]);
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 800): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.code || err?.response?.status;
            if (i < retries - 1 && (status === 503 || status === 500 || status === 429 || err?.message?.includes('unavailable'))) {
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

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
        const spreadsheetId = process.env.SPREADSHEET_ID?.replace(/^["']|["']$/g, '');
        if (!spreadsheetId) {
            console.error('SPREADSHEET_ID não está definido no ambiente.');
            return cache.cachedSheetNames || [];
        }

        const fetchPromise = retryWithBackoff(() => sheets.spreadsheets.get({
            spreadsheetId
        })).then((spreadsheetMeta) => {
            const ignoredSheetNames = ['modelo', 'diversos', '#dados', 'nvscriptsproperties'];
            const sheetNames = spreadsheetMeta.data.sheets
                ?.map(sheet => sheet.properties?.title)
                .filter((title): title is string => {
                    if (!title) return false;
                    const normalized = title.trim().toLowerCase();
                    return !ignoredSheetNames.includes(normalized);
                });
            
            if (!sheetNames || sheetNames.length === 0) {
                console.warn('Nenhuma aba válida encontrada na planilha.');
                return cache.cachedSheetNames || ['Frases'];
            }
            
            cache.cachedSheetNames = sheetNames;
            cache.lastSheetNamesFetchTime = now;
            return sheetNames;
        });

        return await withTimeout(fetchPromise, 15000, cache.cachedSheetNames || ['Frases']);

    } catch (error) {
        console.error('Erro ao buscar nomes das abas:', error);
        if (cache.cachedSheetNames && cache.cachedSheetNames.length > 0) {
            return cache.cachedSheetNames;
        }
        // Fallback para 'Frases' caso a API falhe, evitando erro 400 com aba inexistente
        return ['Frases'];
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
        const spreadsheetId = process.env.SPREADSHEET_ID?.replace(/^["']|["']$/g, '');
        if (!spreadsheetId) {
            console.error('SPREADSHEET_ID não está definido no ambiente.');
            return cache.cachedQuotes || [];
        }

        const sheetNames = await getAllSheetNames(forceRefresh);
        if (!sheetNames || sheetNames.length === 0) {
            return cache.cachedQuotes || [];
        }

        const ranges = sheetNames.map(name => `'${name}'!A:Z`);
        const fetchQuotesPromise = retryWithBackoff(() => sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges,
        })).then((response) => {
            const valueRanges = response.data.valueRanges;
            if (!valueRanges) {
                return cache.cachedQuotes || [];
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
        });

        return await withTimeout(fetchQuotesPromise, 15000, cache.cachedQuotes || []);

    } catch (error) {
        console.error('Erro ao buscar dados do Google Sheets:', error);
        return cache.cachedQuotes || [];
    }
}

export function buildSheetHierarchy(quotes: QuoteWithAuthor[]): SheetHierarchy {
    const sheetHierarchy: SheetHierarchy = {};

    quotes.forEach(quote => {
        if (!sheetHierarchy[quote.sheetName]) {
            sheetHierarchy[quote.sheetName] = {};
        }

        const sheetCategories = sheetHierarchy[quote.sheetName];

        const cat1 = quote.subCategory?.trim() || 'Geral';
        const cat2 = quote.category?.trim() || '';

        if (!sheetCategories[cat1]) {
            sheetCategories[cat1] = [];
        }

        if (cat2 && !sheetCategories[cat1].includes(cat2)) {
            sheetCategories[cat1].push(cat2);
        }
    });
    
    for (const sheetName in sheetHierarchy) {
        for (const cat1 in sheetHierarchy[sheetName]) {
            sheetHierarchy[sheetName][cat1].sort();
        }
    }

    return sheetHierarchy;
}

export async function getSheetData(forceRefresh = false): Promise<SheetHierarchy> {
    const quotes = await getAllQuotes(forceRefresh);
    return buildSheetHierarchy(quotes);
}
