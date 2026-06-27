import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de assinatura e aplica o layout padrão do aplicativo.
export default function AssinaturaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
