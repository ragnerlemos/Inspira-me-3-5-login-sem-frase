
export interface QuoteWithAuthor {
    id: string;
    quote: string;
    author?: string;
    category: string;
    subCategory?: string;
}

export const quotes: QuoteWithAuthor[] = [
  { id: '1', quote: "A persistência realiza o impossível.", author: "Provérbio Chinês", category: "Motivacional" },
  { id: '2', quote: "O único lugar onde o sucesso vem antes do trabalho é no dicionário.", author: "Albert Einstein", category: "Motivacional", subCategory: "Trabalho" },
  { id: '3', quote: "Acredite que você pode, assim você já está no meio do caminho.", author: "Theodore Roosevelt", category: "Motivacional", subCategory: "Confiança" },
  { id: '4', quote: "A vida é 10% o que acontece a você e 90% como você reage a isso.", author: "Charles R. Swindoll", category: "Reflexão" },
  { id: '5', quote: "Seja a mudança que você deseja ver no mundo.", author: "Mahatma Gandhi", category: "Reflexão", subCategory: "Inspiração" },
  { id: '6', quote: "A felicidade não é algo pronto. Ela vem de suas próprias ações.", author: "Dalai Lama", category: "Felicidade" },
  { id: '7', quote: "A melhor maneira de prever o futuro é criá-lo.", author: "Peter Drucker", category: "Motivacional", subCategory: "Futuro" },
];
