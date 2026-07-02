import { 
    Sun, 
    Moon, 
    Quote, 
    TestTube, 
    CircleDollarSign, 
    Calendar, 
    HeartHandshake, 
    Gift, 
    Egg, 
    PartyPopper, 
    BookOpen,
    type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorState } from '../editor-de-video/tipos';
import { QuoteWithAuthor } from './types';
import type { ProfileData } from '@/hooks/use-profile';

export const getCategoryIcon = (categoryName: string): LucideIcon => {
    const lowerCaseName = categoryName.toLowerCase();

    if (lowerCaseName.includes('bom dia')) return Sun;
    if (lowerCaseName.includes('boa noite')) return Moon;
    if (lowerCaseName.includes('indireta')) return Quote;
    if (lowerCaseName.includes('teste')) return TestTube;
    if (lowerCaseName.includes('fim de mês')) return CircleDollarSign;
    if (['sábado', 'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta'].some(dia => lowerCaseName.includes(dia))) return Calendar;
    if (lowerCaseName.includes('namorados')) return HeartHandshake;
    if (lowerCaseName.includes('pais')) return Gift;
    if (lowerCaseName.includes('páscoa')) return Egg;
    if (lowerCaseName.includes('festa junina')) return PartyPopper;
    if (lowerCaseName.includes('datas comemorativas')) return Calendar;

    return BookOpen;
};

export const getCardClasses = () => {
    return cn(
        'group flex flex-col justify-between transition-shadow duration-300 border border-[var(--theme-card-border-color)]',
        'lg:[&:nth-child(3n+1)]:bg-[var(--theme-card-alt1-color)]',
        'lg:[&:nth-child(3n+2)]:bg-[var(--theme-card-alt2-color)]',
        'lg:[&:nth-child(3n+3)]:bg-[var(--theme-card-alt3-color)]',
        'max-lg:[&:nth-child(4n+1)]:bg-[var(--theme-card-alt1-color)]',
        'max-lg:[&:nth-child(4n+2)]:bg-[var(--theme-card-alt2-color)]',
        'max-lg:[&:nth-child(4n+3)]:bg-[var(--theme-card-alt2-color)]',
        'max-lg:[&:nth-child(4n+4)]:bg-[var(--theme-card-alt1-color)]'
    );
};

export const getMemeEditorState = (quote: QuoteWithAuthor, profile: ProfileData): EditorState => {
    return {
        text: quote.quote,
        fontFamily: "Poppins",
        fontSize: profile.memeFontSize,
        fontWeight: "bold",
        fontStyle: "normal",
        textColor: "#FFFFFF",
        textAlign: "left",
        textShadowBlur: 0,
        textShadowOpacity: 0,
        textVerticalPosition: 50,
        textStrokeColor: "#000000",
        textStrokeWidth: 0,
        textStrokeCornerStyle: 'rounded',
        applyEffectsToEmojis: true,
        applyTextColorToSignature: false,
        letterSpacing: 0,
        lineHeight: 1.4,
        wordSpacing: 0,
        backgroundStyle: { type: 'solid', value: '#000000' },
        filmColor: "#000000",
        filmOpacity: 0,
        aspectRatio: '9 / 16',
        activeTemplateId: 'template-twitter',
        showProfileSignature: false,
        showLogo: profile.memeShowLogo,
        logoPositionX: 50,
        logoPositionY: 95,
        logoScale: profile.memeLogoScale,
        logoOpacity: 80,
        signaturePositionX: 50,
        signaturePositionY: 95,
        signatureScale: 60,
        showSignaturePhoto: false,
        showSignatureUsername: false,
        showSignatureSocial: false,
        showSignatureBackground: false,
        signatureBgColor: '#000000',
        signatureBgOpacity: 50,
        profileVerticalPosition: 50,
    };
};
