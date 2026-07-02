"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

interface CadastroCategoryFieldsProps {
    selectedSheet: string;
    selectedMainCategory: string;
    onMainCategoryChange: (value: string) => void;
    categoriesForSelectedSheet: Record<string, string[]>;
    newMainCategoryInput: string;
    onNewMainCategoryChange: (value: string) => void;
    selectedSubCategory: string;
    onSubCategoryChange: (value: string) => void;
    newSubCategoryInput: string;
    onNewSubCategoryChange: (value: string) => void;
}

export function CadastroCategoryFields({
    selectedSheet,
    selectedMainCategory,
    onMainCategoryChange,
    categoriesForSelectedSheet,
    newMainCategoryInput,
    onNewMainCategoryChange,
    selectedSubCategory,
    onSubCategoryChange,
    newSubCategoryInput,
    onNewSubCategoryChange
}: CadastroCategoryFieldsProps) {
    const isSheetValid = selectedSheet && selectedSheet !== '__new__';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
                <Label htmlFor="category-name" className="text-primary text-sm font-medium">Categoria</Label>
                {isSheetValid ? (
                <>
                    <Select value={selectedMainCategory} onValueChange={onMainCategoryChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione ou crie..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
                        <SelectItem value="__new__">
                            <span className='flex items-center text-primary font-medium'><PlusCircle className="mr-2 h-4 w-4" />Criar nova categoria...</span>
                        </SelectItem>
                        {Object.keys(categoriesForSelectedSheet).sort().map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>

                    {selectedMainCategory === '__new__' && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                        <Input autoFocus value={newMainCategoryInput} onChange={e => onNewMainCategoryChange(e.target.value)} placeholder="Nome da nova categoria..." className="border-primary/50 focus-visible:ring-primary" />
                    </div>
                    )}
                </>
                ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                    Aba pendente
                </div>
                )}
            </div>

            {/* Subcategoria */}
            <div className="space-y-2">
                <Label htmlFor="sub-category-name" className="text-primary text-sm font-medium">Subcategoria (Opcional)</Label>
                {isSheetValid ? (
                <>
                    {selectedMainCategory === '__new__' ? (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Input value={newSubCategoryInput} onChange={e => onNewSubCategoryChange(e.target.value)} placeholder="Nome da nova subcategoria..." className="border-primary/50 focus-visible:ring-primary h-10" />
                        </div>
                    ) : (
                        <>
                            <Select disabled={!selectedMainCategory || selectedMainCategory === '__none__'} value={selectedSubCategory} onValueChange={onSubCategoryChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={!selectedMainCategory || selectedMainCategory === '__none__' ? "Selecione uma categoria primeiro" : "Selecione ou crie..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Nenhuma</SelectItem>
                                    <SelectItem value="__new__">
                                        <span className='flex items-center text-primary font-medium'><PlusCircle className="mr-2 h-4 w-4" />Criar nova subcategoria...</span>
                                    </SelectItem>
                                    {selectedMainCategory && selectedMainCategory !== '__none__' && categoriesForSelectedSheet[selectedMainCategory]?.map(sub => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedSubCategory === '__new__' && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                    <Input autoFocus value={newSubCategoryInput} onChange={e => onNewSubCategoryChange(e.target.value)} placeholder="Nome da nova subcategoria..." className="border-primary/50 focus-visible:ring-primary" />
                                </div>
                            )}
                        </>
                    )}
                </>
                ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                    Aba pendente
                </div>
                )}
            </div>
        </div>
    );
}
