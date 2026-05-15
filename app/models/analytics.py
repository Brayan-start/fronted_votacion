from pydantic import BaseModel
from typing import List, Optional

class CandidateResult(BaseModel):
    candidate_id: str
    candidate_name: str
    photo_url: Optional[str] = None
    vote_count: int
    percentage: float

class CategoryResult(BaseModel):
    category_id: str
    category_name: str
    total_votes: int
    candidates: List[CandidateResult]

class ElectionAnalytics(BaseModel):
    election_id: str
    election_title: str
    total_votes: int
    participation_percentage: float
    results_by_category: List[CategoryResult]

class GlobalStats(BaseModel):
    total_voters: int
    active_elections: int
    total_votes_cast: int
    participation_rate: float
