import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const APP_STORAGE_FOLDER = 'Downloads/InspireMe';

export type SaveAppFileResult = {
  uri: string;
};

const normalizeFolderSegment = (value?: string): string => {
  const sanitized = value?.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
  return sanitized || 'Geral';
};

export const ensureAppStoragePermission = async (): Promise<boolean> => {
  try {
    const permissions = await Filesystem.requestPermissions();
    return permissions.publicStorage === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de armazenamento:', error);
    return false;
  }
};

export const saveFileToAppFolder = async (
  base64Data: string,
  filename: string,
  category?: string,
  subCategory?: string,
): Promise<SaveAppFileResult> => {
  const directory = Directory.ExternalStorage;
  const folderPath = [
    APP_STORAGE_FOLDER,
    normalizeFolderSegment(category),
    normalizeFolderSegment(subCategory),
  ].join('/');

  try {
    await Filesystem.mkdir({
      path: folderPath,
      directory,
      recursive: true,
    });
  } catch (error) {
    // Ignore if the folder already exists or if the plugin created it automatically.
    console.warn('Não foi possível criar a pasta de download (pode já existir):', error);
  }

  const result = await Filesystem.writeFile({
    path: `${folderPath}/${filename}`,
    data: base64Data,
    directory,
  });

  if (!result.uri) {
    throw new Error('Não foi possível salvar o arquivo na pasta do app.');
  }

  return { uri: result.uri };
};

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();
