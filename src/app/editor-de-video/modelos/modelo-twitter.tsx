
// Componente que simula a aparência de um post no Twitter.
// Usa os dados do perfil do usuário para criar uma visualização de "meme" com a frase.

import type { ProfileData } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Twitter } from "lucide-react";
import type { EditorState, EstiloTexto } from "../tipos";
import { AssinaturaPerfil } from "./assinatura-perfil";
import { ResizableTextBox } from "../components/resizable-text-box";

interface ModeloTwitterProps {
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

export function ModeloTwitter({
    editorState,
    baseTextStyle,
    textEffectsStyle,
    dropShadowStyle,
    profile,
    isTextSelected,
    setIsTextSelected,
    onTextBoxResize,
    onTextChange,
}: ModeloTwitterProps) {
    const { text, textColor, showLogo, logoOpacity, logoScale, logoPositionX, logoPositionY,
        showProfileSignature, signaturePositionX, signaturePositionY, signatureScale,
        showSignaturePhoto, showSignatureUsername, showSignatureSocial, signatureBgColor,
        signatureBgOpacity, showSignatureBackground,
        textBoxWidth, textBoxHeight,
     } = editorState;
    const { showIcon, showDate } = profile;

    // Estilo base do texto, que agora usa a cor do editor e o tamanho da fonte do editor state
    const combinedTextStyle: EstiloTexto = {
      ...baseTextStyle,
      ...textEffectsStyle,
      color: textColor || '#FFFFFF', // Garante que a cor seja aplicada
      textAlign: editorState.textAlign,
      lineHeight: 1.4,
      fontSize: `${editorState.fontSize}rem`
    };

    return (
        <div className="relative w-full h-full p-12 flex items-center justify-center">
            <div className="w-full">
                 <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={profile.photo || ''} alt={profile.username} />
                        <AvatarFallback><User style={{ color: textColor }} /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <p className="font-bold text-base" style={{ color: textColor }}>{profile.username}</p>
                                <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>{profile.social}</p>
                            </div>
                            {showIcon && <Twitter className="h-6 w-6 text-[#1DA1F2] flex-shrink-0" />}
                        </div>
                    </div>
                </div>
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
                        className="mt-3 text-xl break-words"
                        style={{ ...dropShadowStyle }}
                    >
                        <p style={combinedTextStyle}>{text}</p>
                    </div>
                </ResizableTextBox>
                 {showDate && (
                    <div className="mt-4 text-sm flex items-center gap-2" style={{ color: textColor, opacity: 0.7 }}>
                       <p>10:30 AM · 28 de Maio de 2024</p>
                    </div>
                )}
            </div>
            
            {showLogo && profile.logo && (
                <div className="absolute" style={{ zIndex: 2, top: `${logoPositionY}%`, left: `${logoPositionX}%`, transform: 'translate(-50%, -50%)' }}>
                    <div style={{ transform: `scale(${logoScale / 100})`, opacity: logoOpacity / 100 }}>
                        <img src={profile.logo} alt="Logomarca" className="max-w-[150px] max-h-[150px]" />
                    </div>
                </div>
            )}
            
            {showProfileSignature && (
                 <div className="absolute" style={{ zIndex: 2, top: `${signaturePositionY}%`, left: `${signaturePositionX}%`, transform: `translate(-50%, -50%) scale(${signatureScale / 100})`, transformOrigin: 'center center', color: textColor }}>
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
