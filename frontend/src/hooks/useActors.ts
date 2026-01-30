import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { actorService } from '../services';

export const useActors = (projectId?: string) => {
    const { state, dispatch } = useAppContext();
    const { actors, loading, errors } = state;

    const fetchActors = useCallback(async (pId?: string) => {
        dispatch({ type: 'SET_LOADING', entity: 'actors', loading: true });
        try {
            const data = await actorService.fetchActors(pId || projectId);
            dispatch({ type: 'SET_ACTORS', actors: data });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', entity: 'actors', error: error.message });
        }
    }, [dispatch, projectId]);

    const createActor = async (data: any) => {
        try {
            const newActor = await actorService.createActor(data);
            dispatch({ type: 'ADD_ACTOR', actor: newActor });
            return newActor;
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', entity: 'actors', error: error.message });
            throw error;
        }
    };

    const updateActor = async (id: string, data: any) => {
        try {
            const updatedActor = await actorService.updateActor(id, data);
            dispatch({ type: 'UPDATE_ACTOR', id, actor: updatedActor });
            return updatedActor;
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', entity: 'actors', error: error.message });
            throw error;
        }
    };

    const deleteActor = async (id: string) => {
        try {
            await actorService.deleteActor(id);
            dispatch({ type: 'DELETE_ACTOR', id });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', entity: 'actors', error: error.message });
            throw error;
        }
    };

    return {
        actors,
        loading: loading.actors,
        error: errors.actors,
        fetchActors,
        createActor,
        updateActor,
        deleteActor,
    };
};
