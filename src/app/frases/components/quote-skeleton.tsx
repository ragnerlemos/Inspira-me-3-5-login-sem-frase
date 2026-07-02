"use client";

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCardClasses } from '../utils';

export function QuoteSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className={getCardClasses()}>
                    <CardContent className="p-4 pb-0">
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-1/3" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
