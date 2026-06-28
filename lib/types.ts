export type StarElement = 'situation' | 'task' | 'action' | 'result';
export type StarScore = 0 | 1 | 2;

export interface StarCoverage {
  situation: StarScore;
  task: StarScore;
  action: StarScore;
  result: StarScore;
}

export type MoodSetting =
  | 'nervous'
  | 'confident'
  | 'evasive'
  | 'over-talker'
  | 'concise'
  | 'analytical'
  | 'friendly';

export type StarReadiness = 'weak' | 'average' | 'strong';
export type CuriosityLevel = 'low' | 'medium' | 'high';
export type ResponseSensitivity = 'accepting' | 'probing' | 'sceptical';

export type QuestionTopic =
  | 'role_scope'
  | 'team_culture'
  | 'career_path'
  | 'learning_development'
  | 'leadership_style'
  | 'organisation_direction';

export interface JobDescription {
  id: string;
  title: string;
  roleOverview: string;
  keyExpectations: string;
  mustHaveSkills: string[];
  leadershipBehaviours: string[];
  createdAt: string;
  isDefault: boolean;
}

export interface WorkEntry {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface CandidatePersona {
  id: string;
  name: string;
  currentRole: string;
  background: string;
  workHistory: WorkEntry[];
  skills: string[];
  personalityTraits: string[];
  moodSetting: MoodSetting;
  starReadiness: StarReadiness;
  curiosityLevel: CuriosityLevel;
  priorityInterests: QuestionTopic[];
  responseSensitivity: ResponseSensitivity;
  rawCvText?: string;
  createdAt: string;
  isDefault: boolean;
}

export type SessionStatus = 'not_started' | 'in_progress' | 'completed';

export interface ChatMessage {
  id: string;
  role: 'manager' | 'candidate';
  content: string;
  timestamp: string;
  starElementsDetected?: StarElement[];
  isCandidateQuestion?: boolean;
}

export interface CandidateQuestion {
  topic: QuestionTopic;
  questionText: string;
  managerResponse: string;
  personaReaction: 'satisfied' | 'probed_further' | 'hesitant';
}

export interface HireDecision {
  decision: 'hire' | 'no_hire';
  rating: 1 | 2 | 3 | 4 | 5;
  rationale: string;
}

export interface DebriefReport {
  starCoverageScore: number;
  conversationalTechniqueScore: number;
  candidateExperienceScore: number;
  hireDecisionAccuracy: 'aligned' | 'over_rated' | 'under_rated';
  aiHireRecommendation: 'hire' | 'no_hire' | 'borderline';
  aiHireRationale: string;
  developmentalObservations: string[];
  candidateQuestionLog: string;
  missedOpportunityFlag?: string;
  candidateSatisfactionNarrative: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
  overallNarrativeLabel: string;
  generatedAt: string;
}

export interface ParticipantSession {
  id: string;
  participantName: string;
  sessionCode: string;
  jdId: string;
  personaId: string;
  status: SessionStatus;
  messages: ChatMessage[];
  starCoverageByCompetency: Record<string, StarCoverage>;
  competenciesExplored: string[];
  candidateQuestionsOffered: boolean;
  candidateQuestionsAsked: CandidateQuestion[];
  hireDecision?: HireDecision;
  debrief?: DebriefReport;
  startedAt?: string;
  completedAt?: string;
}

export interface FacilitatorConfig {
  pin: string;
  sessionCode: string;
  activeJdId: string;
  activePersonaId: string;
  assignedPersonas: Record<string, string>;
  jds: JobDescription[];
  personas: CandidatePersona[];
  sessions: ParticipantSession[];
}
