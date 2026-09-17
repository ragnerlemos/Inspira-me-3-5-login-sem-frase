const fs = require('fs');
let code = fs.readFileSync('src/app/frases/components/frases-sidebar.tsx', 'utf8');

// For main categories
code = code.replace(
`                                        <Button
                                            variant='ghost'
                                            onClick={() => {
                                                onMainCategorySelect(mainCat);
                                                if (hasSubCats) {
                                                    setExpandedSubCats(prev => ({
                                                        ...prev,
                                                        [expKey]: !prev[expKey]
                                                    }));
                                                }
                                            }}
                                            className={cn(
                                                'flex-1 justify-start text-base font-bold px-3 py-2.5 transition-colors rounded-md hover:bg-muted/50 text-left min-w-0 overflow-hidden',
                                                isSelected && 'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                <Icon className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="capitalize truncate">{mainCat}</span>
                                                {mainCount !== undefined && (
                                                    <div className="text-base font-bold opacity-80 shrink-0">({mainCount})</div>
                                                )}
                                            </div>
                                        </Button>
                                        {hasSubCats && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => toggleExpanded(expKey, e)}
                                                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 ml-1"
                                                title={isExpanded ? "Recolher menu" : "Expandir menu"}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                                )}
                                            </Button>
                                        )}`,
`                                        <Button
                                            variant='ghost'
                                            onClick={() => {
                                                onMainCategorySelect(mainCat);
                                                if (hasSubCats) {
                                                    setExpandedSubCats(prev => ({
                                                        ...prev,
                                                        [expKey]: !prev[expKey]
                                                    }));
                                                }
                                            }}
                                            className={cn(
                                                'w-full flex items-center justify-between text-base font-bold px-3 py-2.5 transition-colors rounded-md hover:bg-muted/50 text-left',
                                                isSelected && 'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                <Icon className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="capitalize truncate">{mainCat}</span>
                                                {mainCount !== undefined && (
                                                    <div className="text-base font-bold opacity-80 shrink-0">({mainCount})</div>
                                                )}
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2" />
                                            )}
                                        </Button>`
);

fs.writeFileSync('src/app/frases/components/frases-sidebar.tsx', code);
