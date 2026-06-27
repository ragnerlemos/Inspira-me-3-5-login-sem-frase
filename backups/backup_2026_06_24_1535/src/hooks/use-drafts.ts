// This custom hook manages draft saving and recovery using localStorage.
// It stores drafts with timestamps for each entry and allows recovery of the latest draft.

import { useEffect, useState } from 'react';

const useDrafts = (key) => {
    const [draft, setDraft] = useState('');

    useEffect(() => {
        // Load the draft on component mount
        const savedDraft = localStorage.getItem(key);
        if (savedDraft) {
            const { content, timestamp } = JSON.parse(savedDraft);
            setDraft(content);
            console.log(`Recovered draft from: ${new Date(timestamp).toUTCString()}`);
        }
    }, [key]);

    const saveDraft = (content) => {
        const timestamp = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify({ content, timestamp }));
        setDraft(content);
        console.log('Draft saved:', { content, timestamp });
    };

    return [draft, saveDraft];
};

export default useDrafts;
