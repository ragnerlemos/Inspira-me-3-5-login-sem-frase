import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de configurações e aplica o layout padrão do aplicativo.
export default function ConfiguracoesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
