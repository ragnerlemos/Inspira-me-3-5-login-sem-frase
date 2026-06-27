
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Laptop } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Página de configurações para o usuário.
export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Garante que o componente só será renderizado no cliente após a montagem.
  // Isso evita erros de hidratação com o tema.
  useEffect(() => {
    setMounted(true)
  }, [])

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
            </div>
      </div>
    </main>
  )
}
