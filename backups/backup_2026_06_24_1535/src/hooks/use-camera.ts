import { useState, useEffect } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';

const useCamera = () => {
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const takePicture = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri
            });
            setImage(photo.webPath);
        } catch (err) {
            setError('Error capturing photo: ' + (err as Error).message);
        }
    };

    return { image, error, takePicture };
};

export default useCamera;
