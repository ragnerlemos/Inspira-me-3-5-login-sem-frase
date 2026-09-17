const fs = require('fs');
let code = fs.readFileSync('src/app/frases/components/frases-sidebar.tsx', 'utf8');

// For subCategories within mainCategories
code = code.replace(
`                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    onSubCategorySelect(mainCat, subCat);
                                                                    if (hasSubSubCats) {
                                                                        setExpandedSubCats(prev => ({
                                                                            ...prev,
                                                                            [subExpKey]: !prev[subExpKey]
                                                                        }));
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    'flex-1 justify-start text-sm font-bold h-9 px-2.5 transition-colors rounded-md hover:bg-muted/50 text-left min-w-0 overflow-hidden',
                                                                    isSubSelected && selectedSubSubCategory === 'Todos'
                                                                        ? 'bg-primary/15 text-primary'
                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs text-muted-foreground/70 mr-0.5">├─</span>
                                                                    <span className="capitalize truncate">{subCat}</span>
                                                                    {subCount !== undefined && (
                                                                        <div className="text-xs font-bold opacity-75 shrink-0">({subCount})</div>
                                                                    )}
                                                                </div>
                                                            </Button>
                                                            {hasSubSubCats && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => toggleExpanded(subExpKey, e)}
                                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 ml-0.5"
                                                                    title={isSubExpanded ? "Recolher subcategoria" : "Expandir subcategoria"}
                                                                >
                                                                    {isSubExpanded ? (
                                                                        <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200" />
                                                                    ) : (
                                                                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                                                                    )}
                                                                </Button>
                                                            )}`,
`                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    onSubCategorySelect(mainCat, subCat);
                                                                    if (hasSubSubCats) {
                                                                        setExpandedSubCats(prev => ({
                                                                            ...prev,
                                                                            [subExpKey]: !prev[subExpKey]
                                                                        }));
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    'w-full flex items-center justify-between text-sm font-bold h-9 px-2.5 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                                    isSubSelected && selectedSubSubCategory === 'Todos'
                                                                        ? 'bg-primary/15 text-primary'
                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                                    <span className="text-xs text-muted-foreground/70 mr-0.5">├─</span>
                                                                    <span className="capitalize truncate">{subCat}</span>
                                                                    {subCount !== undefined && (
                                                                        <div className="text-xs font-bold opacity-75 shrink-0">({subCount})</div>
                                                                    )}
                                                                </div>
                                                                {isSubExpanded ? (
                                                                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                                ) : (
                                                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                                )}
                                                            </Button>`
);

fs.writeFileSync('src/app/frases/components/frases-sidebar.tsx', code);
