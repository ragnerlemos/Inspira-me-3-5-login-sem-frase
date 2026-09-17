const fs = require('fs');
let code = fs.readFileSync('src/components/app-header.tsx', 'utf8');

// 1. Remove SettingsNavigationLinks function entirely
code = code.replace(
`function SettingsNavigationLinks({ onLinkClick }: { onLinkClick?: () => void }) {
    return (
        <>
            <NavLink href="/cadastro" icon={PlusSquare} label="Cadastro" onClick={onLinkClick} />
            <NavLink href="/perfil" icon={UserIcon} label="Central de Marca" onClick={onLinkClick} />
        </>
    )
}

`, '');

// 2. Add them to SettingsDropdown
const dropdownAddition = `
                <DropdownMenuSeparator />
                <Link href="/cadastro" onClick={onLinkClick}>
                    <DropdownMenuItem className="cursor-pointer focus:bg-primary/10">
                        <PlusSquare className="w-4 h-4 mr-2" />
                        <span>Cadastro</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="/perfil" onClick={onLinkClick}>
                    <DropdownMenuItem className="cursor-pointer focus:bg-primary/10">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>Central de Marca</span>
                    </DropdownMenuItem>
                </Link>`;

code = code.replace(
`                <DropdownMenuSeparator />
                <Link href="/assinatura" onClick={onLinkClick}>`,
`${dropdownAddition}
                <DropdownMenuSeparator />
                <Link href="/assinatura" onClick={onLinkClick}>`);

// 3. Remove SettingsNavigationLinks from desktop nav
code = code.replace(
`            <nav className="flex items-center gap-1">
                <SettingsNavigationLinks />
            </nav>
            <Separator orientation="vertical" className="h-8 mx-2" />`, '');

// 4. Remove SettingsNavigationLinks from mobile drawer
code = code.replace(
`                            <MainNavigationLinks onLinkClick={() => setIsSheetOpen(false)} />
                            <Separator className="my-2" />
                            <SettingsNavigationLinks onLinkClick={() => setIsSheetOpen(false)} />`,
`                            <MainNavigationLinks onLinkClick={() => setIsSheetOpen(false)} />`);

fs.writeFileSync('src/components/app-header.tsx', code);
