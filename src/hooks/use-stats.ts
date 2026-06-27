import { useEffect, useState } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

const useStats = () => {
    const [shares, setShares] = useState(0);
    const [favorites, setFavorites] = useState(0);
    const [creationCount, setCreationCount] = useState(0);

    useEffect(() => {
        // Assuming fetching initial stats from Firebase
        const fetchStats = async () => {
            // Fetch logic here
        };
        fetchStats();
    }, []);

    const trackShare = () => {
        setShares((prev) => prev + 1);
        logEvent(analytics, 'share');
    };

    const trackFavorite = () => {
        setFavorites((prev) => prev + 1);
        logEvent(analytics, 'favorite');
    };

    const trackCreation = () => {
        setCreationCount((prev) => prev + 1);
        logEvent(analytics, 'create');
    };

    return { shares, favorites, creationCount, trackShare, trackFavorite, trackCreation };
};

export default useStats;