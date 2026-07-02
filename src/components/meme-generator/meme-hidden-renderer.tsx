"use client";

import React from 'react';
import { ModeloTwitter } from '@/app/editor-de-video/modelos/modelo-twitter';
import type { EditorState, EstiloTexto } from '@/app/editor-de-video/tipos';
import { useProfile } from '@/hooks/use-profile';

interface MemeHiddenRendererProps {
    memeRef: React.RefObject<HTMLDivElement | null>;
    editorState: EditorState;
    profile: ReturnType<typeof useProfile>['profile'];
    baseTextStyle: EstiloTexto;
    isTextSelected: boolean;
    setIsTextSelected: (selected: boolean) => void;
}

export function MemeHiddenRenderer({
    memeRef,
    editorState,
    profile,
    baseTextStyle,
    isTextSelected,
    setIsTextSelected
}: MemeHiddenRendererProps) {
    const handleTextBoxResize = () => {};
    const handleTextChange = () => {};

    return (
        <div className="fixed top-[-9999px] left-[-9999px]">
            <div 
                ref={memeRef} 
                className="relative overflow-hidden flex flex-col justify-center bg-black"
                style={{ width: '500px', aspectRatio: '9 / 16', backgroundColor: '#000000' }}
            >
                <ModeloTwitter
                    editorState={editorState}
                    profile={profile}
                    baseTextStyle={baseTextStyle}
                    textEffectsStyle={{}}
                    dropShadowStyle={{}}
                    isTextSelected={isTextSelected}
                    setIsTextSelected={setIsTextSelected}
                    onTextBoxResize={handleTextBoxResize}
                    onTextChange={handleTextChange}
                />
            </div>
        </div>
    );
}
