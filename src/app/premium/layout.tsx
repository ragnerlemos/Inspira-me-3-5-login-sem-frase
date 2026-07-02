import MainAppLayout from "../(main)/layout";

export default function PremiumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainAppLayout>{children}</MainAppLayout>;
}
