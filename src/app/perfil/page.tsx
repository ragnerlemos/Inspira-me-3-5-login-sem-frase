
"use client";

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { ProfileSkeleton } from './components/profile-skeleton';
import { ProfileEditCard } from './components/profile-edit-card';
import { ProfileMemeCard } from './components/profile-meme-card';
import { ProfilePreview } from './components/profile-preview';
import { BrandColorsCard } from './components/brand-colors-card';

import { ProfileHeader } from './components/profile-header';



// Página de Perfil para o usuário editar suas informações.
export default function ProfilePage() {
  const { profile, updateProfile, isLoaded } = useProfile();
  const { toast } = useToast();

  const handleProfileChange = (field: string, value: string | boolean | number) => {
    updateProfile({ [field]: value });
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'logo' | 'logo2') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Arquivo Inválido',
          description: 'Por favor, selecione um arquivo de imagem.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ [field]: reader.result as string });
         toast({
          title: `${field === 'photo' ? 'Foto' : 'Logomarca'} Atualizada!`,
          description: `Sua ${field === 'photo' ? 'foto de perfil' : 'logomarca'} foi alterada com sucesso.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMemeFontSizeChange = (value: number[]) => {
    updateProfile({ memeFontSize: value[0] });
  };
  
  const handleMemeShowLogoChange = (value: boolean) => {
    updateProfile({ memeShowLogo: value });
  }

  const handleMemeLogoScaleChange = (value: number[]) => {
    updateProfile({ memeLogoScale: value[0] });
  }

  if (!isLoaded) {
      return <ProfileSkeleton />;
  }

  return (
    <main className="overflow-y-auto">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <ProfileHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Coluna de Identidade Visual */}
          <div className="space-y-8">
            <ProfileEditCard 
                profile={profile}
                onProfileChange={handleProfileChange as any}
                onFileUpload={handleFileUpload}
            />

            <BrandColorsCard 
                initialColors={profile.brandColors}
                onSave={(colors) => {
                    handleProfileChange('brandColors', colors);
                    toast({ title: "Cores Salvas", description: "Sua paleta de cores foi atualizada." });
                }} 
            />
          </div>
          
          {/* Coluna de Configurações de Marca e Preview */}
          <div className="space-y-8 sticky top-8">
            <ProfilePreview 
                profile={profile}
                onProfileChange={handleProfileChange as any}
            />

            <ProfileMemeCard 
                profile={profile}
                onMemeFontSizeChange={handleMemeFontSizeChange}
                onMemeShowLogoChange={handleMemeShowLogoChange}
                onMemeLogoScaleChange={handleMemeLogoScaleChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

