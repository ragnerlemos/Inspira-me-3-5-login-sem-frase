
import { ReactNode } from "react";
import MainAppLayout from "../(main)/layout";

// Este layout envolve a página de favoritos e aplica o layout padrão do aplicativo.
export default function FavoritosLayout({ children }: { children: ReactNode }) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
