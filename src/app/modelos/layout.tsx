import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de modelos e aplica o layout padrão do aplicativo.
export default function ModelosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
