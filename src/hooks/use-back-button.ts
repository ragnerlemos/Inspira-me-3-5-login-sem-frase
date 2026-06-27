
"use client";

import { useEffect } from 'react';
import { App, PluginListenerHandle } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';

export const useBackButton = () => {
    const router = useRouter();

    useEffect(() => {
        let listenerHandle: PluginListenerHandle | null = null;

        if (Capacitor.isNativePlatform()) {
            listenerHandle = App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    // Fica na tela atual, como solicitado.
                    console.log("Não há para onde voltar, permanecendo na tela.");
                }
            });
        }

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, []);
};
