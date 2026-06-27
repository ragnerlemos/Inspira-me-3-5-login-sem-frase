
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col w-full bg-background font-body text-foreground h-full">
            <div className="flex-1 min-h-0 flex flex-row">
                {/* Skeleton for Sidebar (desktop) */}
                <div className="hidden md:flex flex-col w-[30%] min-w-[25%] max-w-[40%] border-r">
                    <Skeleton className="h-16 w-full border-b" />
                    <div className="flex-1 p-4 space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>

                {/* Skeleton for Main Content */}
                <div className="flex-1">
                    <main className="flex-1 w-full h-full overflow-auto p-4 flex items-center justify-center">
                        <Skeleton className="w-full h-full max-w-md aspect-[9/16]" />
                    </main>
                </div>
            </div>

            {/* Skeleton for Mobile Toolbar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-10 bg-background border-t p-2">
                <Skeleton className="h-14 w-full" />
            </div>
        </div>
    )
}
