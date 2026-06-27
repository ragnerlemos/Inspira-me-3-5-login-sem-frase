import MainAppLayout from "../(main)/layout";

// Este layout envolve a página da galeria e aplica o layout padrão do aplicativo.
export default function GaleriaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
