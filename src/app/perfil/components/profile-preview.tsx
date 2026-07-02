"use client";

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Eye, EyeOff, Calendar, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/hooks/use-profile';

import Image from 'next/image';

interface ProfilePreviewProps {
    profile: ProfileData;
    onProfileChange: (field: keyof ProfileData, value: string | boolean | number) => void;
}

export function ProfilePreview({ profile, onProfileChange }: ProfilePreviewProps) {
    return (
        <div className="space-y-8">
            <h3 className="text-xl font-headline mb-4 text-center">Pré-visualizações</h3>
            <Card className="max-w-sm mx-auto overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="grid grid-cols-2 bg-muted h-24 relative items-center justify-center">
                    <div className="flex items-center justify-center h-full relative">
                        {profile.logo && (
                            <Image 
                                src={profile.logo} 
                                alt="Pré-visualização da logomarca 1" 
                                fill 
                                className="object-contain p-2" 
                                unoptimized
                                referrerPolicy="no-referrer"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-center h-full border-l relative">
                        {profile.logo2 && (
                            <Image 
                                src={profile.logo2} 
                                alt="Pré-visualização da logomarca 2" 
                                fill 
                                className="object-contain p-2" 
                                unoptimized
                                referrerPolicy="no-referrer"
                            />
                        )}
                    </div>
                </div>
                <CardContent className="relative text-center -mt-14 pt-0">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-card shadow-lg">
                        <AvatarImage src={profile.photo || ''} alt={profile.username} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold mt-4 font-headline">{profile.username}</h2>
                    <p className="text-muted-foreground">{profile.social}</p>

                    <div className="mt-6 border-t pt-4">
                        <Card className="text-left">
                            <CardHeader className="p-4">
                                <div className="flex items-start gap-3">
                                    <Avatar>
                                        <AvatarImage src={profile.photo || ''} alt={profile.username} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{profile.username}</p>
                                                <p className="text-sm text-muted-foreground">{profile.social}</p>
                                            </div>
                                            <div className="flex items-center">
                                                {profile.showIcon && <Twitter className="h-5 w-5 text-[#1DA1F2]" />}
                                                <Button variant="ghost" size="icon" onClick={() => onProfileChange('showIcon', !profile.showIcon)}>
                                                    {profile.showIcon ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-base">"A única maneira de fazer um ótimo trabalho é amar o que você faz."</p>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                                {profile.showDate ? (
                                    <p>10:30 AM · 28 de Maio de 2024</p>
                                ) : <div />}
                                <Button variant="ghost" size="icon" onClick={() => onProfileChange('showDate', !profile.showDate)}>
                                    <Calendar className="h-5 w-5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
