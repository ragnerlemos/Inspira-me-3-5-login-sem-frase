"use client";

import { SubscriptionPlans } from "@/components/subscription-plans";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PremiumSubscriptionPage() {
  const router = useRouter();

  return (
    <main className="overflow-y-auto">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
            Assinatura Premium
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Desbloqueie recursos exclusivos, ferramentas avançadas e suporte prioritário para elevar sua experiência com o aplicativo.
          </p>
        </div>

        <SubscriptionPlans />
      </div>
    </main>
  );
}
