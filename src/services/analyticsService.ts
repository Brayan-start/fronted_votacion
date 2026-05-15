import api from './api';

export interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  photo_url?: string;
  vote_count: number;
  percentage: number;
}

export interface CategoryResult {
  category_id: string;
  category_name: string;
  total_votes: number;
  candidates: CandidateResult[];
}

export interface ElectionAnalytics {
  election_id: string;
  election_title: string;
  total_votes: number;
  participation_percentage: number;
  results_by_category: CategoryResult[];
}

export interface GlobalStats {
  total_voters: number;
  active_elections: number;
  total_votes_cast: number;
  participation_rate: number;
}

export const analyticsService = {
  getElectionResults: async (electionId: string): Promise<ElectionAnalytics> => {
    const response = await api.get(`/analytics/${electionId}`);
    return response.data;
  },
  
  getGlobalStats: async (): Promise<GlobalStats> => {
    const response = await api.get('/analytics/global-stats');
    return response.data;
  }
};
