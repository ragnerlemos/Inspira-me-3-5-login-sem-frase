import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de perfil e aplica o layout padrão do aplicativo.
export default function PerfilLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
