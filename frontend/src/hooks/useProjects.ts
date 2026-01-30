import { useAppContext } from '../context/AppContext';

export const useProjects = () => {
    const {
        state,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
    } = useAppContext();

    return {
        projects: state.projects,
        loading: state.loading.projects,
        error: state.errors.projects,
        loadProjects: fetchProjects,
        createProject,
        updateProject,
        deleteProject,
    };
};
