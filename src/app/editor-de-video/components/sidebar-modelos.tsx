"use client";

import { useTemplates } from "@/hooks/use-templates";
import { useEditor } from "../contexts/editor-context";
import { ModelSection } from "./modelos/model-section";
import { ModelLoading } from "./modelos/model-loading";

export function ControleModelos() {
    const { templates, isLoaded } = useTemplates();
    const { applyTemplate } = useEditor();

    if (!isLoaded) {
        return <ModelLoading />;
    }

    const defaultTemplates = templates.filter(t => !t.isCustom);
    const customTemplates = templates.filter(t => t.isCustom);

    return (
        <div className="space-y-6">
            <ModelSection 
                title="Padrões" 
                templates={defaultTemplates} 
                onSelect={(state) => applyTemplate(state, 'merge')} 
            />

            <ModelSection 
                title="Meus Modelos" 
                templates={customTemplates} 
                onSelect={(state) => applyTemplate(state, 'merge')} 
            />
        </div>
    );
}
