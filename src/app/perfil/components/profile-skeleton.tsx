"use client";

import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
             <div className="text-center mb-8">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-5 w-80 mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
                 <div>
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    );
}
