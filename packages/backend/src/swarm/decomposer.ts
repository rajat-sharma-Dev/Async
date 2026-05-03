import type { Agent, AgentRole, Subtask, Task } from '../agents/types.js';
import type { LLMProvider } from '../llm/provider.js';

function pickRole(description: string, availableRoles: AgentRole[]): AgentRole {
  const text = description.toLowerCase();
  const preference: AgentRole[] = text.includes('code') || text.includes('build')
    ? ['developer', 'researcher', 'critic', 'coordinator']
    : ['researcher', 'developer', 'critic', 'coordinator'];
  return preference.find((role) => availableRoles.includes(role)) || availableRoles[0] || 'coordinator';
}

export async function decomposeTask(task: Task, swarmAgents: Agent[], llm: LLMProvider): Promise<Subtask[]> {
  const availableRoles = swarmAgents.map((agent) => agent.role);
  const prompt = `Break this task into 3 or 4 JSON subtasks for roles ${availableRoles.join(', ')}.
Task: ${task.description}
Budget: ${task.budget}
Return only a JSON array with title, description, assignedRole, dependencies, estimatedCost.`;

  try {
    const raw = await llm.complete(prompt, { responseFormat: { type: 'json_object' }, maxTokens: 900 });
    const parsed = JSON.parse(raw) as Array<Partial<Subtask>>;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 4).map((item, index) => ({
        id: `st-${index + 1}`,
        title: String(item.title || `Subtask ${index + 1}`),
        description: String(item.description || task.description),
        assignedRole: availableRoles.includes(item.assignedRole as AgentRole)
          ? (item.assignedRole as AgentRole)
          : pickRole(String(item.description || task.description), availableRoles),
        assignedAgentId: '',
        dependencies: Array.isArray(item.dependencies) ? item.dependencies.map(String) : index === 0 ? [] : [`st-${index}`],
        estimatedCost: Number(item.estimatedCost || task.budget / 4),
        status: 'pending',
        result: '',
        attempts: 0,
      }));
    }
  } catch {
    // Fall through to deterministic decomposition for demo reliability.
  }

  const isBuild = /build|code|app|frontend|backend|landing|contract/i.test(task.description);
  const templates = isBuild
    ? [
        ['Research implementation context', 'Research requirements, comparable patterns, and constraints.', 'researcher', []],
        ['Plan architecture and assignments', 'Create a practical build plan and assign work to specialists.', 'coordinator', ['st-1']],
        ['Implement core deliverable', 'Produce the main implementation artifact or code plan.', 'developer', ['st-2']],
        ['Review and harden result', 'Review output for quality, missing cases, and demo readiness.', 'critic', ['st-3']],
      ]
    : [
        ['Gather facts', 'Collect relevant context and assumptions.', 'researcher', []],
        ['Decompose approach', 'Create an execution plan and assign specialists.', 'coordinator', ['st-1']],
        ['Produce solution', 'Generate the final task output.', 'developer', ['st-2']],
        ['Validate solution', 'Critique and improve the output.', 'critic', ['st-3']],
      ];

  return templates.map(([title, description, role, dependencies], index) => ({
    id: `st-${index + 1}`,
    title: String(title),
    description: String(description),
    assignedRole: availableRoles.includes(role as AgentRole) ? (role as AgentRole) : pickRole(String(description), availableRoles),
    assignedAgentId: '',
    dependencies: dependencies as string[],
    estimatedCost: Number((task.budget / templates.length).toFixed(2)),
    status: 'pending',
    result: '',
    attempts: 0,
  }));
}
