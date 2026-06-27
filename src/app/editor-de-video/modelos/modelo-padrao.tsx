
import type { EditorState, EstiloTexto } from '../tipos';
import { AssinaturaPerfil } from './assinatura-perfil';
import { EMOJI_REGEX } from '../utils/text-style-utils';
import type { ProfileData } from '@/hooks/use-profile';
import { ResizableTextBox } from '../components/resizable-text-box';

interface ModeloPadraoProps {
    editorState: EditorState;
    baseTextStyle: EstiloTexto;
    textEffectsStyle: EstiloTexto;
    dropShadowStyle: EstiloTexto;
    profile: ProfileData;
    isTextSelected: boolean;
    setIsTextSelected: (value: boolean) => void;
    onTextBoxResize: (next: { widthPct: number; heightPx: number; fontSize?: number }) => void;
    onTextChange: (text: string) => void;
}

export function ModeloPadrao({
    editorState,
    baseTextStyle,
    textEffectsStyle,
    dropShadowStyle,
    profile,
    isTextSelected,
    setIsTextSelected,
    onTextBoxResize,
    onTextChange,
}: ModeloPadraoProps) {
    const {
        text,
        textColor,
        textVerticalPosition,
        applyEffectsToEmojis,
        showProfileSignature,
        signaturePositionX,
        signaturePositionY,
        signatureScale,
        showSignaturePhoto,
        showSignatureUsername,
        showSignatureSocial,
        showSignatureBackground,
        signatureBgColor,
        signatureBgOpacity,
        showLogo,
        logoPositionX,
        logoPositionY,
        logoScale,
        logoOpacity,
        textBoxWidth,
        textBoxHeight,
    } = editorState;

    const renderTextWithEmojis = () => {
        if (!text) return null;
        const parts = text.split(EMOJI_REGEX);

        return (
            <>
                {parts.map((part, index) => {
                    const isEmoji = EMOJI_REGEX.test(part);
                    if (isEmoji && !applyEffectsToEmojis) {
                        return <span key={index} style={{ textShadow: 'none', filter: 'none' }}>{part}</span>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    const combinedTextStyle: EstiloTexto = {
      ...baseTextStyle,
      ...textEffectsStyle,
      textAlign: editorState.textAlign,
      fontSize: `${editorState.fontSize}rem`,
    };
    
    return (
        <div className="relative w-full h-full">
            <div
                className="absolute w-full px-8"
                style={{
                    top: `${textVerticalPosition}%`,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    ...dropShadowStyle,
                }}
            >
                <ResizableTextBox
                    widthPct={textBoxWidth ?? 80}
                    heightPx={textBoxHeight ?? 0}
                    fontSize={editorState.fontSize}
                    isSelected={isTextSelected}
                    editable
                    text={text}
                    onTextChange={onTextChange}
                    onSelect={() => setIsTextSelected(true)}
                    onResize={onTextBoxResize}
                >
                    <div
                        style={combinedTextStyle}
                        className="break-words relative"
                    >
                        {renderTextWithEmojis()}
                    </div>
                </ResizableTextBox>
            </div>

            {showLogo && profile.logo && (
                <div className="absolute" style={{ zIndex: 2, top: `${logoPositionY}%`, left: `${logoPositionX}%`, transform: 'translate(-50%, -50%)' }}>
                    <div style={{ transform: `scale(${logoScale / 100})`, opacity: logoOpacity / 100 }}>
                        <img src={profile.logo} alt="Logomarca" className="max-w-[150px] max-h-[150px]" />
                    </div>
                </div>
            )}
            {showProfileSignature && (
                <div 
                  className="absolute" 
                  style={{ 
                    zIndex: 2, 
                    top: `${signaturePositionY}%`, 
                    left: `${signaturePositionX}%`, 
                    transform: `translate(-50%, -50%) scale(${signatureScale / 100})`, 
                    transformOrigin: 'center center',
                    color: textColor
                  }}
                >
                    <AssinaturaPerfil 
                        profile={profile} 
                        showPhoto={showSignaturePhoto} 
                        showUsername={showSignatureUsername} 
                        showSocial={showSignatureSocial} 
                        showBackground={showSignatureBackground} 
                        bgColor={signatureBgColor} 
                        bgOpacity={signatureBgOpacity} 
                    />
                </div>
            )}
        </div>
    );
}
