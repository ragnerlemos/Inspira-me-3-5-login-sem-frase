

"use client";

import { useState } from "react";
import { Wand2, RectangleHorizontal, RectangleVertical, Square, LayoutTemplate, UserCheck, ImageUp, Paintbrush, Type, CaseSensitive, Pipette, AlignLeft, Bold, MoveVertical, Baseline, Film, UserCheck as UserCheckIcon, SmilePlus, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProfileData } from "@/hooks/use-profile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { EditorState, EstiloFundo } from "../tipos";
import { useRouter } from "next/navigation";
import { useEditor } from "../contexts/editor-context";
import { toggleTextColor } from "../utils/color-utils";
import { ControleModelos } from "./sidebar-modelos";
import { ControleTipoFundo } from "./sidebar-background";
import { SidebarEstiloTexto, type CommonStyleProps } from "./sidebar-estilo-texto";
import { SidebarTexto } from "./sidebar-texto";
import { SidebarCanvas, type AspectRatioOption } from "./sidebar-canvas";
import { SidebarCores } from "./sidebar-cores";
import { SidebarFiltro } from "./sidebar-filtro";
import { SidebarCamadas } from "./sidebar-camadas";
import { ControleAssinatura, type ControleAssinaturaProps } from "./sidebar-assinatura";
import { ControleLogo, type ControleLogoProps } from "./sidebar-logo";
import { BotaoRecurso } from "../botao-recurso";


const aspectRatios = [
    { label: "Story", value: "9 / 16", icon: RectangleVertical },
    { label: "Quadrado", value: "1 / 1", icon: Square },
    { label: "Vídeo", value: "16 / 9", icon: RectangleHorizontal },
];

const PREDEFINED_COLORS = [
  "#FFFFFF", // Branco
  "#F5F5FA", // Off-white
  "#E5E5EA", // Cinza Claro
  "#8E8E93", // Cinza Médio
  "#3A3A3C", // Cinza Escuro
  "#000000", // Preto
  "#FDE1E4", // Rosa Pastel
  "#E2F0CB", // Verde Pastel
  "#C4DEF6", // Azul Pastel
  "#FFECA1", // Amarelo Pastel
  "#DBCDF0", // Lilás Pastel
  "#F5E8C7"  // Bege Pastel
];

interface SidebarProps extends ControleAssinaturaProps, ControleLogoProps, CommonStyleProps {
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    scale: number;
    setScale: (scale: number) => void;
    backgroundStyle: EstiloFundo;
    setBackgroundStyle: (style: EstiloFundo) => void;
    filmColor: string;
    setFilmColor: (color: string) => void;
    filmOpacity: number;
    setFilmOpacity: (opacity: number) => void;
    fgColor: string;
    setFgColor: (color: string) => void;
    activeControl: string | null;
    setActiveControl: (control: string | null) => void;
    text: string;
    setText: (text: string) => void;
    profile: ProfileData;
    updateState: (newState: Partial<EditorState>) => void;
}

export function Sidebar({
    activeControl,
    setActiveControl,
    text,
    setText,
    aspectRatio,
    setAspectRatio,
    scale,
    setScale,
    backgroundStyle,
    setBackgroundStyle,
    filmColor,
    setFilmColor,
    filmOpacity,
    setFilmOpacity,
    fgColor,
    setFgColor,
    updateState,
    ...props
}: SidebarProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [activeSubControl, setActiveSubControl] = useState<string | null>(null);

    const handleSetControleAtivo = (controle: string | null) => {
        setActiveControl(controle);
        if (controle !== 'estilo') {
            setActiveSubControl(null);
        }
    }
    
    const handleInvertColors = () => {
        const newTextColor = toggleTextColor(fgColor, backgroundStyle);
        updateState({ textColor: newTextColor });
        toast({ title: 'Cor do texto invertida!' });
    };
    
    const renderActiveControl = () => {
        if (!activeControl) {
            return <p className="text-sm text-muted-foreground text-center p-4">Selecione uma ferramenta para editar.</p>;
        }
        switch (activeControl) {
            case 'texto':
                return <SidebarTexto text={text} setText={setText} />;
            case 'canvas':
                return (
                    <SidebarCanvas 
                        aspectRatios={aspectRatios} 
                        aspectRatio={aspectRatio} 
                        setAspectRatio={setAspectRatio} 
                        scale={scale} 
                        setScale={setScale} 
                    />
                );
            case 'cores':
                 return (
                    <SidebarCores 
                        backgroundStyle={backgroundStyle} 
                        setBackgroundStyle={setBackgroundStyle} 
                        fgColor={fgColor} 
                        setFgColor={setFgColor} 
                        predefinedColors={PREDEFINED_COLORS} 
                        onInvertColors={handleInvertColors} 
                    />
                 );
            case 'filtro':
                return <SidebarFiltro filmColor={filmColor} setFilmColor={setFilmColor} filmOpacity={filmOpacity} setFilmOpacity={setFilmOpacity} />;
            case 'camadas':
                return <SidebarCamadas />;
            case 'estilo':
                 return (
                     <div className="w-full flex-1 flex flex-col">
                        <div className="p-4 flex-1 overflow-y-auto">
                            <SidebarEstiloTexto {...props} fgColor={fgColor} onFgColorChange={setFgColor} activeSubControl={activeSubControl} />
                        </div>
                        <ScrollArea className="w-full whitespace-nowrap border-t mt-auto">
                            <div className="flex h-16 items-center w-max space-x-1 bg-background/90 backdrop-blur-sm px-2">
                                <BotaoRecurso icon={Baseline} label="Contorno" onClick={() => setActiveSubControl('contorno')} isActive={activeSubControl === 'contorno'}/>
                                <BotaoRecurso icon={SmilePlus} label="Emoji" onClick={() => setActiveSubControl('emoji')} isActive={activeSubControl === 'emoji'} />
                                <BotaoRecurso icon={Paintbrush} label="Sombra" onClick={() => setActiveSubControl('sombra')} isActive={activeSubControl === 'sombra'}/>
                                <BotaoRecurso icon={Pipette} label="Cor" onClick={() => setActiveSubControl('cor')} isActive={activeSubControl === 'cor'}/>
                                <BotaoRecurso icon={CaseSensitive} label="Tamanho" onClick={() => setActiveSubControl('tamanho')} isActive={activeSubControl === 'tamanho'}/>
                                <BotaoRecurso icon={MoveVertical} label="Posição" onClick={() => setActiveSubControl('posicao')} isActive={activeSubControl === 'posicao'}/>
                                <BotaoRecurso icon={AlignLeft} label="Alinhar" onClick={() => setActiveSubControl('alinhamento')} isActive={activeSubControl === 'alinhamento'}/>
                                <BotaoRecurso icon={Bold} label="Estilo" onClick={() => setActiveSubControl('estilo')} isActive={activeSubControl === 'estilo'}/>
                                <BotaoRecurso icon={Type} label="Fonte" onClick={() => setActiveSubControl('fonte')} isActive={activeSubControl === 'fonte'}/>
                            </div>
                            <ScrollBar orientation="horizontal" className="h-2" />
                        </ScrollArea>
                     </div>
                 );
            case 'fundo':
                return <div className="p-4"><ControleTipoFundo backgroundStyle={backgroundStyle} setBackgroundStyle={setBackgroundStyle} fgColor={fgColor} setFgColor={setFgColor} updateState={updateState} /></div>;
            case 'modelos':
                return <div className="p-4"><ControleModelos /></div>;
            case 'assinatura':
                return <div className="p-4"><ControleAssinatura {...props} /></div>;
            case 'logo':
                return <div className="p-4"><ControleLogo {...props} /></div>;
            default:
                return null;
        }
    }

    const mainToolbar = (
        <ScrollArea className="w-full border-b">
            <div className="flex h-16 items-center justify-around w-full space-x-1 px-2">
                <BotaoRecurso icon={Type} label="Texto" onClick={() => handleSetControleAtivo('texto')} isActive={activeControl === 'texto'}/>
                <BotaoRecurso icon={RectangleHorizontal} label="Canvas" onClick={() => handleSetControleAtivo('canvas')} isActive={activeControl === 'canvas'}/>
                <BotaoRecurso icon={Paintbrush} label="Cores" onClick={() => handleSetControleAtivo('cores')} isActive={activeControl === 'cores'}/>
                <BotaoRecurso icon={Wand2} label="Estilo" onClick={() => handleSetControleAtivo('estilo')} isActive={activeControl === 'estilo'}/>
                <BotaoRecurso icon={LayoutTemplate} label="Fundo" onClick={() => handleSetControleAtivo('fundo')} isActive={activeControl === 'fundo'}/>
                <BotaoRecurso icon={Film} label="Película" onClick={() => handleSetControleAtivo('filtro')} isActive={activeControl === 'filtro'} />
                <BotaoRecurso icon={Layers} label="Camadas" onClick={() => handleSetControleAtivo('camadas')} isActive={activeControl === 'camadas'} />
                <BotaoRecurso icon={LayoutTemplate} label="Modelos" onClick={() => handleSetControleAtivo('modelos')} isActive={activeControl === 'modelos'}/>
                <BotaoRecurso icon={UserCheck} label="Assinatura" onClick={() => handleSetControleAtivo('assinatura')} isActive={activeControl === 'assinatura'}/>
                <BotaoRecurso icon={ImageUp} label="Logo" onClick={() => handleSetControleAtivo('logo')} isActive={activeControl === 'logo'}/>
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    );

    return (
        <aside className="hidden shrink-0 bg-card md:flex md:flex-col md:border-r w-full h-full">
            
            {mainToolbar}

            <div className="flex-1 overflow-y-auto flex flex-col">
                {renderActiveControl()}
            </div>
        </aside>
    );
}
