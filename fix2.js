const fs = require('fs');
let code = fs.readFileSync('src/app/frases/components/frases-sidebar.tsx', 'utf8');

// For globalSubCategories
code = code.replace(
`                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        onSubCategorySelect('Todos', sub.name);
                                                        if (sub.contexts.length > 0) {
                                                            setExpandedSubCats(prev => ({
                                                                ...prev,
                                                                [expKey]: !prev[expKey]
                                                            }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        'flex-1 justify-start text-base font-bold h-10 px-3 transition-colors rounded-md hover:bg-muted/50 text-left min-w-0 overflow-hidden',
                                                        isSubSelected && selectedSubSubCategory === 'Todos'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-foreground/90'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                        <span className="capitalize truncate">{sub.name}</span>
                                                        <div className="text-sm font-bold opacity-80 shrink-0">({sub.totalCount})</div>
                                                    </div>
                                                </Button>

                                                {sub.contexts.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => toggleExpanded(expKey, e)}
                                                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 ml-1"
                                                        title={isExpanded ? "Recolher" : "Expandir"}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                                        )}
                                                    </Button>
                                                )}`,
`                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        onSubCategorySelect('Todos', sub.name);
                                                        if (sub.contexts.length > 0) {
                                                            setExpandedSubCats(prev => ({
                                                                ...prev,
                                                                [expKey]: !prev[expKey]
                                                            }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        'w-full flex items-center justify-between text-base font-bold h-10 px-3 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                        isSubSelected && selectedSubSubCategory === 'Todos'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-foreground/90'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                        <span className="capitalize truncate">{sub.name}</span>
                                                        <div className="text-sm font-bold opacity-80 shrink-0">({sub.totalCount})</div>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                                    )}
                                                </Button>`
);

fs.writeFileSync('src/app/frases/components/frases-sidebar.tsx', code);
