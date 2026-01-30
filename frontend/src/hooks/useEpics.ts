import { useAppContext } from '../context/AppContext';

export const useEpics = () => {
  const {
    state,
    fetchEpics,
    createEpic: contextCreateEpic,
    updateEpic: contextUpdateEpic,
    deleteEpic: contextDeleteEpic,
  } = useAppContext();

  return {
    epics: state.epics,
    loading: state.loading.epics,
    error: state.errors.epics,
    fetchEpics,
    createEpic: contextCreateEpic,
    updateEpic: contextUpdateEpic,
    deleteEpic: contextDeleteEpic,
  };
};