const fs = require('fs');
const file = 'src/app/frases/frases-client.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);

const newLines = `              <div className="flex items-center justify-between text-sm mb-6 bg-secondary/30 p-2 pl-3 rounded-lg">
                <div className="flex items-center">
                  {selectedMainCategory !== 'Todos' ? (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-semibold text-muted-foreground hover:text-primary"
                          >
                            {selectedMainCategory}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleSubCategorySelect(selectedMainCategory, 'Todos')}>
                            Todos em {selectedMainCategory}
                          </DropdownMenuItem>
                          {breadcrumbSubCategories.map(subCat => (
                            <DropdownMenuItem key={subCat} onClick={() => handleSubCategorySelect(selectedMainCategory, subCat)}>
                              {subCat}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedSubCategory !== 'Todos' && (
                        <>
                          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{selectedSubCategory}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="font-semibold text-foreground">Categoria: {selectedSubCategory}</span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => {
                    setSelectedMainCategory('Todos');
                    setSelectedSubCategory('Todos');
                  }}
                >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
              </div>`.split('\n');

const before = lines.slice(0, 1127);
const after = lines.slice(1176);

const finalLines = [...before, ...newLines, ...after];
fs.writeFileSync(file, finalLines.join('\n'));
