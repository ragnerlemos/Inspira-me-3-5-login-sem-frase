
import type { ProfileData } from "@/hooks/use-profile";
import type React from "react";

export type ProporcaoTela = "1 / 1" | "9 / 16" | "16 / 9";

export type EstiloTexto = React.CSSProperties;

export type TipoFundo = 'media' | 'solid' | 'gradient';
export type EstiloFundo = {
    type: TipoFundo;
    value: string;
};

export interface EditorState {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    textColor: string;
    textAlign: "left" | "center" | "right";
    textBoxWidth: number;
    textBoxHeight: number;
    textShadowBlur: number;
    textShadowOpacity: number;
    textVerticalPosition: number;
    textStrokeColor: string;
    textStrokeWidth: number;
    textStrokeCornerStyle: 'rounded' | 'square';
    applyEffectsToEmojis: boolean;
    letterSpacing: number;
    lineHeight: number;
    wordSpacing: number;
    backgroundStyle: EstiloFundo;
    filmColor: string;
    filmOpacity: number;
    videoMuted: boolean;
    videoVolume: number;
    aspectRatio: ProporcaoTela;
    activeTemplateId: string | null;
    showProfileSignature: boolean;
    signaturePositionX: number;
    signaturePositionY: number;
    signatureScale: number;
    showSignaturePhoto: boolean;
    showSignatureUsername: boolean;
    showSignatureSocial: boolean;
    showSignatureBackground: boolean;
    signatureBgColor: string;
    signatureBgOpacity: number;
    profileVerticalPosition: number;
    showLogo: boolean;
    logoPositionX: number;
    logoPositionY: number;
    logoScale: number;
    logoOpacity: number;
}

export interface EditorControlState {
  canUndo: boolean;
  undo: () => void;
  canRedo: boolean;
  redo: () => void;
  onSaveAsTemplate: () => Promise<void>;
  onExportJPG: () => void;
  onExportPNG: () => void;
  onExportMP4: () => void;
  isReady: boolean;
}

export interface SavedVideo {
    id: string;
    thumbnail: string;
    editorState: EditorState;
    createdAt: string;
}


export interface VisualizacaoEditorProps {
    aspectRatio: ProporcaoTela;
    backgroundStyle: EstiloFundo;
    filmColor: string;
    filmOpacity: number;
    text: string;
    textVerticalPosition: number;
    showProfileSignature: boolean;
    profile: ProfileData;
    signaturePositionX: number;
    signaturePositionY: number;
    signatureScale: number;
    showSignaturePhoto: boolean;
    showSignatureUsername: boolean;
    showSignatureSocial: boolean;
    showSignatureBackground: boolean;
    signatureBgColor: string;
    signatureBgOpacity: number;
    activeTemplateId: string | null;
    profileVerticalPosition: number;
    showLogo: boolean;
    logoPositionX: number;
    logoPositionY: number;
    logoScale: number;
    logoOpacity: number;
}
