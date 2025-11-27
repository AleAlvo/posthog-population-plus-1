import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/team`);
      if (!res.ok) throw new Error('Failed to fetch team data');
      const json = await res.json();
      return json.data;
    },
  });
}

export function useTeamMember(id) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/team/${id}`);
      if (!res.ok) throw new Error('Failed to fetch team member');
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
