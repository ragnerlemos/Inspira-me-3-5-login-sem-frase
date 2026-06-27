
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Laptop, Palette, RefreshCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/use-profile"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

// Página de configurações para o usuário.
export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { profile, updateProfile, isLoaded } = useProfile()
  const [mounted, setMounted] = useState(false)
  const [localColors, setLocalColors] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Garante que o componente só será renderizado no cliente após a montagem.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializa as cores locais quando o perfil for carregado
  useEffect(() => {
    if (isLoaded && profile && !localColors) {
        setLocalColors({
            themeTitleColor: profile.themeTitleColor || "#3b82f6",
            themeSubtitleColor: profile.themeSubtitleColor || "#94a3b8",
            themeSecondaryTextColor: profile.themeSecondaryTextColor || "#64748b",
            themeInterfaceIconColor: profile.themeInterfaceIconColor || "#94a3b8",
            themeMenuIconColor: profile.themeMenuIconColor || "#94a3b8",
            themeFavoriteColor: profile.themeFavoriteColor || "#eab308",
            themeCardTextColor: profile.themeCardTextColor || "#ffffff",
            themeCardBorderColor: profile.themeCardBorderColor || "#1e293b",
            themeCardAlt1Color: profile.themeCardAlt1Color || "#020617",
            themeCardAlt2Color: profile.themeCardAlt2Color || "#0f172a",
            themeCardAlt3Color: profile.themeCardAlt3Color || "#020617",
            themeCardAlt4Color: profile.themeCardAlt4Color || "#0f172a",
        });
    }
  }, [profile, isLoaded, localColors]);

  const applyPreview = (colors: any) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
        // Converte camelCase para kebab-case: themeTitleColor -> --theme-title-color
        const variableName = "--" + key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        root.style.setProperty(variableName, value as string);
    });
  };

  const handleColorChange = (field: string, value: string) => {
    const updated = { ...localColors, [field]: value };
    setLocalColors(updated);
    applyPreview(updated);
  };

  const saveChanges = async () => {
    if (!localColors) return;
    setIsSaving(true);
    try {
        await updateProfile(localColors);
    } finally {
        setIsSaving(false);
    }
  };

  const resetColors = () => {
    const defaultColors = {
        themeTitleColor: "#3b82f6",
        themeSubtitleColor: "#94a3b8",
        themeSecondaryTextColor: "#64748b",
        themeInterfaceIconColor: "#94a3b8",
        themeMenuIconColor: "#94a3b8",
        themeFavoriteColor: "#eab308",
        themeCardTextColor: "#ffffff",
        themeCardBorderColor: "#1e293b",
        themeCardAlt1Color: "#020617",
        themeCardAlt2Color: "#0f172a",
        themeCardAlt3Color: "#020617",
        themeCardAlt4Color: "#0f172a",
    };
    setLocalColors(defaultColors);
    applyPreview(defaultColors);
  };

  const colorFields = [
    { id: 'themeTitleColor', label: 'Cor do Título Principal' },
    { id: 'themeSubtitleColor', label: 'Cor dos Subtítulos' },
    { id: 'themeSecondaryTextColor', label: 'Cor dos Textos Secundários' },
    { id: 'themeInterfaceIconColor', label: 'Cor dos Ícones da Interface' },
    { id: 'themeMenuIconColor', label: 'Cor dos Ícones dos Menus' },
    { id: 'themeFavoriteColor', label: 'Cor dos Favoritos' },
    { id: 'themeCardTextColor', label: 'Cor do Texto dos Cards' },
    { id: 'themeCardBorderColor', label: 'Cor da Borda dos Cards' },
    { id: 'themeCardAlt1Color', label: 'Cor do Card Alternado 1' },
    { id: 'themeCardAlt2Color', label: 'Cor do Card Alternado 2' },
    { id: 'themeCardAlt3Color', label: 'Cor do Card Alternado 3' },
    { id: 'themeCardAlt4Color', label: 'Cor do Card Alternado 4' },
  ];

  return (
    <main className="overflow-y-auto">
        <div className="container mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                    Configurações
                </h1>
                <p className="text-muted-foreground mt-2 text-lg text-[var(--theme-subtitle-color)]">
                    Ajuste as preferências do aplicativo.
                </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Card de Aparência (Tema claro/escuro) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aparência</CardTitle>
                        <CardDescription>
                        Escolha como o InspireMe deve aparecer para você.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mounted ? (
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                            variant={theme === "light" ? "secondary" : "outline"}
                            onClick={() => setTheme("light")}
                            >
                            <Sun className="mr-2 h-4 w-4" />
                            Claro
                            </Button>
                            <Button
                            variant={theme === "dark" ? "secondary" : "outline"}
                            onClick={() => setTheme("dark")}
                            >
                            <Moon className="mr-2 h-4 w-4" />
                            Escuro
                            </Button>
                            <Button
                            variant={theme === "system" ? "secondary" : "outline"}
                            onClick={() => setTheme("system")}
                            >
                            <Laptop className="mr-2 h-4 w-4" />
                            Sistema
                            </Button>
                        </div>
                        ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        )}
                    </CardContent>
                </Card>

                {/* Novo Card de Personalização de Cores */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Personalização de Cores
                            </CardTitle>
                            <CardDescription>
                                Ajuste as cores específicas da interface.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetColors} title="Resetar Cores">
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!localColors ? (
                            <div className="space-y-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {colorFields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id} className="text-sm font-medium">
                                                {field.label}
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id={field.id}
                                                    type="color"
                                                    value={localColors[field.id] || "#000000"}
                                                    onChange={(e) => handleColorChange(field.id, e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    type="text"
                                                    value={localColors[field.id] || ""}
                                                    onChange={(e) => handleColorChange(field.id, e.target.value)}
                                                    className="flex-1 font-mono text-xs"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="pt-4">
                                    <Button 
                                        className="w-full font-bold h-12 text-lg shadow-lg" 
                                        onClick={saveChanges}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            "Salvar Alterações de Cores"
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                        <Separator />
                        <p className="text-xs text-muted-foreground italic">
                            Nota: Algumas alterações podem exigir a atualização da página para serem aplicadas em todos os componentes.
                        </p>
                    </CardContent>
                </Card>
            </div>
      </div>
    </main>
  )
}
