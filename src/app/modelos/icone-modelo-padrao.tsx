// Componente SVG para o ícone do Modelo Padrão

export function IconeModeloPadrao({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g fill="currentColor">
                <rect x="20" y="35" width="60" height="8" rx="4" />
                <rect x="20" y="50" width="60" height="8" rx="4" />
                <rect x="20" y="65" width="60" height="8" rx="4" />
            </g>
        </svg>
    );
}
