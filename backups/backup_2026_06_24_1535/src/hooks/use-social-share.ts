import { Share } from '@capacitor/share';

const useSocialShare = () => {
    const shareOnWhatsApp = async (message: string, url: string) => {
        await Share.share({
            title: 'Share on WhatsApp',
            text: message,
            url: url,
            dialogTitle: 'Share with WhatsApp'
        });
    };

    const shareOnTelegram = async (message: string, url: string) => {
        await Share.share({
            title: 'Share on Telegram',
            text: message,
            url: url,
            dialogTitle: 'Share with Telegram'
        });
    };

    const shareOnInstagram = async (url: string) => {
        await Share.share({
            url: url,
            dialogTitle: 'Share with Instagram'
        });
    };

    return { shareOnWhatsApp, shareOnTelegram, shareOnInstagram };
};

export default useSocialShare;