
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Laptop, FileText, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Página de configurações para o usuário.
export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [defaultDescription, setDefaultDescription] = useState("")
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  // Garante que o componente só será renderizado no cliente após a montagem.
  // Isso evita erros de hidratação com o tema.
  useEffect(() => {
    setMounted(true)
    const savedDesc = localStorage.getItem('inspire_default_description') || ''
    setDefaultDescription(savedDesc)
  }, [])

  const handleSaveDescription = () => {
    localStorage.setItem('inspire_default_description', defaultDescription)
    setSaved(true)
    toast({
      title: "Predefinição salva!",
      description: "A predefinição da descrição foi atualizada com sucesso."
    })
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="overflow-y-auto">
        <div className="container mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                    Configurações
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Ajuste as preferências do aplicativo.
                </p>
            </div>
            <div className="max-w-2xl mx-auto">
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
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Predefinição da Descrição
                    </CardTitle>
                    <CardDescription>
                      Defina o texto padrão que aparecerá inicialmente no campo de Descrição e # ao cadastrar uma frase.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Ex: Siga-nos para mais mensagens inspiradoras... #reflexao #inspiracao"
                      value={defaultDescription}
                      onChange={(e) => setDefaultDescription(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dica: Use <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono">{'{frase}'}</code> no texto para inserir automaticamente a frase principal na descrição.
                    </p>
                    <Button onClick={handleSaveDescription} className="w-full">
                      {saved ? <Check className="mr-2 h-4 w-4" /> : null}
                      {saved ? "Salvo com Sucesso!" : "Salvar Predefinição"}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="mt-8 border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">Assinatura Premium</CardTitle>
                    <CardDescription>
                      Desbloqueie recursos exclusivos e eleve seu conteúdo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/premium">Assinar Agora</Link>
                    </Button>
                  </CardContent>
                </Card>
            </div>
      </div>
    </main>
  )
}
