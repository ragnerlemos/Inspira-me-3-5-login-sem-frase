"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

interface SubscriptionStatusCardProps {
    planName?: string;
    status?: "active" | "inactive" | "trial";
}

export function SubscriptionStatusCard({ planName = "Plano Gratuito", status = "active" }: SubscriptionStatusCardProps) {
    return (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-24 h-24" />
            </div>
            
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        Assinatura e Pagamento
                    </CardTitle>
                    <Badge variant={status === 'active' ? 'default' : 'secondary'} className="bg-primary/20 text-primary border-primary/30">
                        {status === 'active' ? 'Ativo' : 'Pendente'}
                    </Badge>
                </div>
                <CardDescription>Gerencie seu plano e cobranças</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                <div className="bg-background/50 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Plano Atual</p>
                            <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                                <Zap className="w-4 h-4 fill-primary" />
                                {planName}
                            </h3>
                        </div>
                        <Link href="/assinatura">
                            <Button size="sm" variant="outline" className="text-xs border-primary/50 text-primary hover:bg-primary/10">
                                Alterar Plano
                            </Button>
                        </Link>
                    </div>
                </div>

                <Link href="/assinatura" className="block">
                    <Button className="w-full justify-between group" variant="ghost">
                        <span className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Ver histórico de faturas
                        </span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
