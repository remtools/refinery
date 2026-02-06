import { useState, useEffect } from 'react';
import { api } from '../services';
import { Status } from '../types/Status';

export const useStatuses = (entityType?: string) => {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const data = entityType
                    ? await api.getStatusesByEntity(entityType)
                    : await api.getStatuses();
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    setStatuses(data);
                } else {
                    console.error('Expected array of statuses, got:', data);
                    setStatuses([]);
                }
            } catch (err) {
                setError('Failed to fetch statuses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses();
    }, [entityType]);

    const getStatusColor = (key: string) => {
        const s = statuses.find(s => s.key === key);
        return s ? s.color : 'bg-gray-100 text-gray-800'; // Default gray
    };

    const isDeletable = (key: string) => {
        const s = statuses.find(s => s.key === key);
        // If status not found, assume not deletable for safety
        return s ? !!s.is_deletable : false;
    };

    const activeStatuses = statuses.filter(s => !s.is_archived);

    return { statuses, activeStatuses, getStatusColor, isDeletable, loading, error };
};
