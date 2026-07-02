"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

interface CadastroSheetSelectorProps {
    selectedSheet: string;
    onSheetChange: (value: string) => void;
    filteredSheetNames: string[];
    newSheetNameInput: string;
    onNewSheetNameChange: (value: string) => void;
}

export function CadastroSheetSelector({
    selectedSheet,
    onSheetChange,
    filteredSheetNames,
    newSheetNameInput,
    onNewSheetNameChange
}: CadastroSheetSelectorProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="sheet-select" className="text-primary">Aba da Planilha</Label>
            <div className="flex items-center gap-2">
                <Select value={selectedSheet} onValueChange={onSheetChange}>
                    <SelectTrigger id="sheet-select" className="flex-1">
                        <SelectValue placeholder="Selecione ou crie uma aba..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredSheetNames.map(sheetName => (
                            <SelectItem key={sheetName} value={sheetName}>{sheetName}</SelectItem>
                        ))}
                        <SelectItem value="__new__">
                            <span className='flex items-center'>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Criar nova aba...
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {selectedSheet === '__new__' && (
                <Input 
                    value={newSheetNameInput}
                    onChange={(e) => onNewSheetNameChange(e.target.value)}
                    placeholder="Nome da nova aba"
                    className="mt-2"
                />
            )}
        </div>
    );
}
