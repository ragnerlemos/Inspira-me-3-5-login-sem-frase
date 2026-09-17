"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileDescriptionCard() {
  const [defaultDescription, setDefaultDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedDesc = localStorage.getItem('inspire_default_description') || '';
    setDefaultDescription(savedDesc);
  }, []);

  const handleSaveDescription = () => {
    localStorage.setItem('inspire_default_description', defaultDescription);
    setSaved(true);
    toast({
      title: "Predefinição salva!",
      description: "A predefinição da descrição foi atualizada com sucesso."
    });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-slate-800 bg-[#020817]/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
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
  );
}
