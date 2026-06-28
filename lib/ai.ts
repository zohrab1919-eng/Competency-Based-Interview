import OpenAI from 'openai';
import {
  CandidatePersona,
  JobDescription,
  ParticipantSession,
  StarCoverage,
  DebriefReport,
} from './types';

const MODEL = 'deepseek-chat';

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });
}

function formatWorkHistory(persona: CandidatePersona): string {
  return persona.workHistory
    .map(
      (w) =>
        `${w.role} at ${w.company} (${w.duration})\n  - ${w.highlights.join('\n  - ')}`
    )
    .join('\n');
}

export function buildPersonaSystemPrompt(
  persona: CandidatePersona,
  jd: JobDescription
): string {
  const maxQuestions =
    persona.curiosityLevel === 'low' ? 1 : persona.curiosityLevel === 'medium' ? 2 : 3;

  return `You are ${persona.name}, a candidate being interviewed for the role of ${jd.title}.

YOUR BACKGROUND:
${persona.background}

Work history:
${formatWorkHistory(persona)}

Skills: ${persona.skills.join(', ')}

YOUR PERSONALITY:
Mood: ${persona.moodSetting} — shape your tone accordingly:
- nervous: shorter answers, occasional hesitations ("um", "I think"), apologetic qualifiers
- confident: direct, structured, uses examples readily
- evasive: gives general answers, pivots away from specifics, needs strong probing
- over-talker: verbose, tangential, needs to be redirected
- concise: brief answers, may need probing to expand
- analytical: data-driven, precise, may come across as dry
- friendly: warm, chatty, builds rapport easily

YOUR STAR READINESS: ${persona.starReadiness}
- weak: you rarely give structured answers. You answer in vague stories. Situation and Task may come through but Action and Result need deep probing.
- average: you can give a partial STAR answer but often skip the Result or generalise the Action.
- strong: you naturally give well-structured examples, but you still wait to be asked — you don't volunteer everything upfront.

CANDIDATE QUESTION BEHAVIOUR:
Your curiosity level is ${persona.curiosityLevel}. You are interested in: ${persona.priorityInterests.join(', ')}.
CRITICAL RULE: You NEVER ask the hiring manager any questions on your own initiative. You only ask if the manager explicitly invites you to ("Do you have any questions?" or similar). If invited, ask 1-${maxQuestions} questions drawn from your priority interests. After the manager answers, your reaction style is ${persona.responseSensitivity}:
- accepting: thank them and move on
- probing: if their answer is vague, ask one follow-up for clarity
- sceptical: if their answer is unconvincing, gently express that you'd want to understand more before committing

IMPORTANT RULES:
- You are the CANDIDATE. You do not interview the manager. You answer questions.
- You only draw on your background as described above. Never invent experiences outside it.
- You do not know you are in a training simulation. Behave as if this is a real interview.
- Keep responses to 3–6 sentences unless your mood setting calls for more or less.
- If the manager asks something vague or unclear, ask for clarification before answering.
- Do not volunteer your STAR answer fully unless pushed. Make the manager work for it.`;
}

export async function generatePersonaResponseStream(
  persona: CandidatePersona,
  jd: JobDescription,
  messages: Array<{ role: 'manager' | 'candidate'; content: string }>,
  newManagerMessage: string
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = buildPersonaSystemPrompt(persona, jd);

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'manager' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    })),
    { role: 'user' as const, content: newManagerMessage },
  ];

  const stream = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    stream: true,
    messages: chatMessages,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

async function callJson<T>(prompt: string, maxTokens = 512): Promise<T> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const text = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text) as T;
}

export async function analyseStarCoverage(
  managerQuestion: string,
  candidateResponse: string,
  competency: string
): Promise<StarCoverage> {
  try {
    return await callJson<StarCoverage>(
      `Given the following interviewer question and candidate response for the competency "${competency}", identify which STAR elements were elicited. Return JSON only: {"situation": 0|1|2, "task": 0|1|2, "action": 0|1|2, "result": 0|1|2} where 0=not present, 1=partially present, 2=fully established.

Interviewer question: ${managerQuestion}

Candidate response: ${candidateResponse}`,
      128
    );
  } catch {
    return { situation: 0, task: 0, action: 0, result: 0 };
  }
}

export async function detectCandidateQuestionOpportunity(
  managerMessage: string
): Promise<boolean> {
  try {
    const result = await callJson<{ isInvitation: boolean }>(
      `Does the following message from a hiring manager explicitly invite the candidate to ask questions? Examples of valid invitations: "Do you have any questions?", "Is there anything you'd like to know about the role?", "Before we wrap up, feel free to ask me anything." A pause, a topic transition, or a vague "anything else?" mid-interview does NOT count. Return JSON only: {"isInvitation": true or false}

Manager message: ${managerMessage}`,
      64
    );
    return result.isInvitation === true;
  } catch {
    return false;
  }
}

export async function generateDebrief(
  session: ParticipantSession,
  jd: JobDescription,
  persona: CandidatePersona
): Promise<DebriefReport> {
  const transcript = session.messages
    .map((m) => `${m.role === 'manager' ? 'Manager' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const starData = JSON.stringify(session.starCoverageByCompetency, null, 2);
  const candidateQuestionsOffered = session.candidateQuestionsOffered ? 'Yes' : 'No';
  const questionsAsked =
    session.candidateQuestionsAsked.length > 0
      ? session.candidateQuestionsAsked.map((q) => q.questionText).join('; ')
      : 'None';
  const hireDecisionText = session.hireDecision
    ? `Decision: ${session.hireDecision.decision}, Rating: ${session.hireDecision.rating}/5, Rationale: ${session.hireDecision.rationale}`
    : 'Not provided';

  const parsed = await callJson<DebriefReport>(
    `You are an expert interview coach analysing a competency-based interview practice session.

JOB DESCRIPTION:
Title: ${jd.title}
Overview: ${jd.roleOverview}
Key expectations: ${jd.keyExpectations}
Must-have skills: ${jd.mustHaveSkills.join(', ')}
Leadership behaviours: ${jd.leadershipBehaviours.join(', ')}

CANDIDATE PERSONA:
Name: ${persona.name}
Current role: ${persona.currentRole}
STAR Readiness: ${persona.starReadiness}
Curiosity level: ${persona.curiosityLevel}
Priority interests: ${persona.priorityInterests.join(', ')}
Mood: ${persona.moodSetting}

FULL INTERVIEW TRANSCRIPT:
${transcript}

STAR COVERAGE RECORDED:
${starData}

CANDIDATE QUESTIONS:
- Manager created space for questions: ${candidateQuestionsOffered}
- Questions asked: ${questionsAsked}

HIRE DECISION BY PARTICIPANT:
${hireDecisionText}

Generate a comprehensive debrief. Return a JSON object with exactly these keys:
{
  "starCoverageScore": number 0-100,
  "conversationalTechniqueScore": number 0-100,
  "candidateExperienceScore": number 0-100,
  "hireDecisionAccuracy": "aligned" or "over_rated" or "under_rated",
  "aiHireRecommendation": "hire" or "no_hire" or "borderline",
  "aiHireRationale": "2-3 sentence string",
  "developmentalObservations": ["string","string","string","string"],
  "candidateQuestionLog": "narrative paragraph string",
  "missedOpportunityFlag": "string or null",
  "candidateSatisfactionNarrative": "first-person paragraph from candidate perspective",
  "overallRating": number 1-5,
  "overallNarrativeLabel": "one sentence string"
}`,
    2048
  );

  parsed.generatedAt = new Date().toISOString();
  return parsed;
}

export async function parseCvWithAI(rawText: string): Promise<{
  name: string;
  currentRole: string;
  background: string;
  workHistory: Array<{ company: string; role: string; duration: string; highlights: string[] }>;
  skills: string[];
}> {
  return callJson(
    `Extract structured information from this CV text and return a JSON object with keys: name, currentRole, background, workHistory (array of {company, role, duration, highlights}), skills (string array). Return only valid JSON.\n\nCV TEXT:\n${rawText}`,
    1024
  );
}
