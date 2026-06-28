import { JobDescription, CandidatePersona } from './types';

export const defaultJDs: JobDescription[] = [
  {
    id: 'jd-default-1',
    title: 'Senior Operations Manager',
    roleOverview:
      'Lead operations for a mid-size financial services firm with 120 staff across a regional scope. Responsible for end-to-end operational performance, process governance, and cross-functional alignment.',
    keyExpectations:
      'Optimise process efficiency by 20% in Year 1. Build a high-performance operations culture. Lead cross-functional projects to completion. Deliver against KPIs on cost, quality, and service levels.',
    mustHaveSkills: [
      'Process improvement',
      'P&L management',
      'Stakeholder management',
      'Data-driven decision making',
      'Change management',
    ],
    leadershipBehaviours: [
      'Drives results',
      'Develops people',
      'Leads change',
      'Communicates with impact',
    ],
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'jd-default-2',
    title: 'Head of Sales, SME Segment',
    roleOverview:
      'Lead a team of 15 sales consultants in an insurance company, responsible for new business acquisition and renewals within the SME customer segment.',
    keyExpectations:
      'Achieve 115% of annual sales target. Reduce team attrition below 10%. Build pipeline discipline and weekly forecasting rigour. Develop at least two high-potential team members into senior roles.',
    mustHaveSkills: [
      'Sales leadership',
      'Pipeline management',
      'Coaching',
      'Insurance product knowledge',
      'CRM management',
    ],
    leadershipBehaviours: [
      'Inspires and motivates',
      'Customer focus',
      'Accountability',
      'Strategic thinking',
    ],
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];

export const defaultPersonas: CandidatePersona[] = [
  {
    id: 'persona-default-1',
    name: 'Rashid Kamal',
    currentRole: 'Operations Manager, Logistics',
    background:
      'Rashid has 10 years of progressive experience in operations, most recently as Operations Manager at a large logistics company overseeing 80 staff across three distribution hubs. He holds a degree in Industrial Engineering and an MBA. Known for his structured thinking and delivery focus.',
    workHistory: [
      {
        company: 'FastTrack Logistics Sdn Bhd',
        role: 'Operations Manager',
        duration: '2019 – Present',
        highlights: [
          'Led process re-engineering that reduced order fulfilment time by 18%',
          'Managed P&L for three distribution hubs with combined revenue of RM 45M',
          'Implemented performance dashboard across ops team of 80 staff',
        ],
      },
      {
        company: 'Pacific Supply Chain Solutions',
        role: 'Senior Operations Executive',
        duration: '2016 – 2019',
        highlights: [
          'Streamlined inbound logistics process, reducing processing time by 22%',
          'Coached team of 15 supervisors on SOP compliance',
        ],
      },
    ],
    skills: ['Process optimisation', 'P&L management', 'Team leadership', 'Data analytics', 'Lean methodology'],
    personalityTraits: ['Structured', 'Direct', 'Results-oriented', 'Composed under pressure'],
    moodSetting: 'confident',
    starReadiness: 'strong',
    curiosityLevel: 'medium',
    priorityInterests: ['career_path', 'leadership_style'],
    responseSensitivity: 'probing',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'persona-default-2',
    name: 'Lena Toh',
    currentRole: 'Senior Sales Executive',
    background:
      'Lena has 7 years in sales across insurance and financial services. Strong individual contributor with a consistent track record of exceeding personal targets, but has not yet led a team. Eager to step into a leadership role and keen to prove she is ready. Slightly nervous in formal settings but genuinely enthusiastic.',
    workHistory: [
      {
        company: 'SureGuard Insurance Bhd',
        role: 'Senior Sales Executive',
        duration: '2020 – Present',
        highlights: [
          'Exceeded annual sales target for four consecutive years (118%–135% achievement)',
          'Mentored two junior sales executives informally',
          'Built and managed a client portfolio of 200+ SME accounts',
        ],
      },
      {
        company: 'Meridian Wealth Advisors',
        role: 'Sales Executive',
        duration: '2017 – 2020',
        highlights: [
          'Top 10 performer in a team of 45 for two consecutive years',
          'Developed strong pipeline discipline through weekly self-review',
        ],
      },
    ],
    skills: ['Relationship selling', 'Pipeline management', 'Client retention', 'Needs analysis', 'Negotiation'],
    personalityTraits: ['Eager', 'Optimistic', 'Empathetic', 'Slightly self-doubting'],
    moodSetting: 'nervous',
    starReadiness: 'average',
    curiosityLevel: 'high',
    priorityInterests: ['team_culture', 'career_path', 'learning_development'],
    responseSensitivity: 'sceptical',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'persona-default-3',
    name: 'Marcus Voon',
    currentRole: 'Head of Sales (previous), currently available',
    background:
      'Marcus has 12 years across banking and fintech, including a previous Head of Sales role at a growth-stage fintech startup. Left due to a company restructure, not performance-related. Highly experienced, comfortable in interviews, and occasionally prone to long answers. Polished and assured.',
    workHistory: [
      {
        company: 'NovaPay Fintech',
        role: 'Head of Sales',
        duration: '2021 – 2024',
        highlights: [
          'Built sales function from scratch, growing team from 3 to 22 in 18 months',
          'Delivered 140% of Year 2 revenue target',
          'Left due to company-wide restructure following Series B funding changes',
        ],
      },
      {
        company: 'Mayfield Bank',
        role: 'Regional Sales Manager',
        duration: '2016 – 2021',
        highlights: [
          'Managed 8 branch sales teams across East Malaysia',
          'Drove 112% target achievement across region for three consecutive years',
        ],
      },
    ],
    skills: ['Sales strategy', 'Team building', 'Executive stakeholder management', 'Revenue growth', 'Fintech products'],
    personalityTraits: ['Confident', 'Articulate', 'Comprehensive', 'Sometimes over-explains'],
    moodSetting: 'over-talker',
    starReadiness: 'average',
    curiosityLevel: 'low',
    priorityInterests: ['organisation_direction'],
    responseSensitivity: 'accepting',
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];
