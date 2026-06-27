
import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de cadastro e aplica o layout padrão do aplicativo.
export default function CadastroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
