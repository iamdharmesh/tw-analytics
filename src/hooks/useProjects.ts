import { useDataStore } from '../stores/dataStore';

export function useProjects() {
	return useDataStore((s) => s.projects);
}
