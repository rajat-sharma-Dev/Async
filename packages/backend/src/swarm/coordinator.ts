import type { Agent, Subtask, Task } from '../agents/types.js';
import type { LLMProvider } from '../llm/provider.js';
import { evaluateRoleMatch } from '../agents/personality.js';

export enum AdaptationStrategy {
  ITERATE = 'ITERATE',
  PIVOT = 'PIVOT',
  DELEGATE = 'DELEGATE',
  SPLIT = 'SPLIT',
  ESCALATE = 'ESCALATE',
  ABANDON = 'ABANDON',
}

export interface DelegationPromptInput {
  task: Task;
  subtask: Subtask;
  coordinator: Agent;
  targetAgent: Agent;
  priorResults: Subtask[];
}

export function assignSubtasks(subtasks: Subtask[], swarmAgents: Agent[], coordinatorAgentId: string): Subtask[] {
  return subtasks.map((subtask) => {
    const directRoleMatch = swarmAgents.find((agent) => agent.role === subtask.assignedRole);
    if (directRoleMatch) return { ...subtask, assignedAgentId: directRoleMatch.id };

    const ranked = [...swarmAgents]
      .map((agent) => ({ agent, score: evaluateRoleMatch(agent.role, subtask.description) }))
      .sort((a, b) => b.score - a.score);

    return { ...subtask, assignedAgentId: ranked[0]?.agent.id || coordinatorAgentId };
  });
}

export function getExecutableSubtasks(subtasks: Subtask[]): Subtask[] {
  return subtasks.filter(
    (subtask) =>
      subtask.status === 'pending' &&
      subtask.dependencies.every((dependencyId) => subtasks.find((candidate) => candidate.id === dependencyId)?.status === 'complete'),
  );
}

export async function createDelegationPrompt(input: DelegationPromptInput, llm: LLMProvider): Promise<string> {
  const priorContext = input.priorResults
    .map((subtask) => `- ${subtask.title}: ${subtask.result.slice(0, 500)}`)
    .join('\n');

  const prompt = `You are ${input.coordinator.name}, a coordinator agent.
Generate a precise task prompt for ${input.targetAgent.name}, a ${input.targetAgent.role} agent.

Overall task:
${input.task.description}

Subtask:
${input.subtask.title}
${input.subtask.description}

Prior completed context:
${priorContext || 'No prior subtasks completed yet.'}

Return only the prompt you would send to the target agent. Include constraints, quality bar, expected output format, and dependencies.`;

  try {
    return await llm.complete(prompt, { maxTokens: 700, temperature: 0.35 });
  } catch {
    return [
      `You are ${input.targetAgent.name}, the ${input.targetAgent.role} agent.`,
      `Complete: ${input.subtask.title}.`,
      input.subtask.description,
      priorContext ? `Use this prior context:\n${priorContext}` : '',
      'Return concrete, demo-ready output with clear decisions and risks.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }
}

export function selectAdaptation(agent: Agent, subtask: Subtask, feedback: string): AdaptationStrategy {
  const text = feedback.toLowerCase();
  if (subtask.attempts >= 3) return AdaptationStrategy.DELEGATE;
  if (text.includes('missing') || text.includes('incomplete') || text.includes('not responsive')) {
    return agent.personality.thoroughness >= 0.7 ? AdaptationStrategy.ITERATE : AdaptationStrategy.ESCALATE;
  }
  if (text.includes('wrong approach') || text.includes('unsafe')) {
    return agent.personality.riskTolerance >= 0.7 ? AdaptationStrategy.PIVOT : AdaptationStrategy.DELEGATE;
  }
  if (text.includes('too broad') || text.includes('large')) return AdaptationStrategy.SPLIT;
  return AdaptationStrategy.ITERATE;
}

export function needsAdaptation(subtask: Subtask, reviewText: string): boolean {
  const lower = reviewText.toLowerCase();
  return (
    subtask.result.length < 120 ||
    lower.includes('issue') ||
    lower.includes('missing') ||
    lower.includes('incomplete') ||
    lower.includes('revise') ||
    lower.includes('fix')
  );
}

export async function reviewSubtaskOutput(
  task: Task,
  subtask: Subtask,
  critic: Agent,
  llm: LLMProvider,
): Promise<string> {
  const prompt = `You are ${critic.name}, a critic agent.
Review this subtask output for the larger task.

Task:
${task.description}

Subtask:
${subtask.title}
${subtask.description}

Output:
${subtask.result}

Return:
- APPROVED if the output is sufficient
- Otherwise list the exact issue and concrete revision needed`;

  try {
    return await llm.complete(prompt, { maxTokens: 500, temperature: 0.2 });
  } catch {
    return subtask.result.length >= 120 ? 'APPROVED' : 'Issue: output is too thin; revise with more concrete detail.';
  }
}
