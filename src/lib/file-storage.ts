import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const APP_STORAGE_FOLDER = 'InspiraMe3.0';

export type SaveAppFileResult = {
  uri: string;
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

export const saveFileToAppFolder = async (base64Data: string, filename: string): Promise<SaveAppFileResult> => {
  const directory = Directory.Documents;
  const folderPath = `${APP_STORAGE_FOLDER}`;

  try {
    await Filesystem.mkdir({
      path: folderPath,
      directory,
      recursive: true,
    });
  } catch (error) {
    // Ignore if the folder already exists or if the plugin created it automatically.
    console.warn('Não foi possível criar a pasta do app (pode já existir):', error);
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
