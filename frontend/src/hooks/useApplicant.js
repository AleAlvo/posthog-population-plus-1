import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useApplicant() {
  return useQuery({
    queryKey: ['applicant'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/applicant`);
      if (!res.ok) throw new Error('Failed to fetch applicant data');
      const json = await res.json();
      return json.data;
    },
  });
}
