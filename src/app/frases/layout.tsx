
import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de frases e aplica o layout padrão do aplicativo.
export default function FrasesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
