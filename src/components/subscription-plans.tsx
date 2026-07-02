import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Plano Básico",
    price: "R$ 19",
    description: "Ideal para uso pessoal e projetos iniciais.",
    features: ["Recursos essenciais", "Suporte padrão"],
  },
  {
    name: "Plano Pro",
    price: "R$ 49",
    description: "Para criadores que buscam mais recursos.",
    features: ["Tudo do Básico", "Recursos avançados", "Suporte prioritário"],
  },
  {
    name: "Plano Premium",
    price: "R$ 99",
    description: "Experiência completa para profissionais.",
    features: ["Tudo do Pro", "Recursos exclusivos", "Suporte VIP", "Acesso antecipado"],
  },
];

export function SubscriptionPlans() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.name} className="flex flex-col">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-4xl font-bold mb-4">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Assinar</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
