import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de projetos e aplica o layout padrão do aplicativo.
export default function ProjetosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
