"use client";

import { Label } from "@/components/ui/label";
import { ModelItem } from "./model-item";
import type { EditorState } from "../../tipos";

interface ModelSectionProps {
    title: string;
    templates: any[];
    onSelect: (state: EditorState) => void;
}

export function ModelSection({ title, templates, onSelect }: ModelSectionProps) {
    if (templates.length === 0) return null;

    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold block">{title}</Label>
            <div className="grid grid-cols-3 gap-2">
                {templates.map((template) => (
                    <ModelItem 
                        key={template.id} 
                        template={template} 
                        onSelect={onSelect} 
                    />
                ))}
            </div>
        </div>
    );
}
