"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ModelLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
}
