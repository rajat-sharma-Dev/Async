import dotenv from 'dotenv';
import path from 'path';
import { AgentRuntime } from '../packages/backend/src/agents/runtime.js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const runtime = new AgentRuntime();

runtime.events.on('event', (event) => {
  if (['task:created', 'task:bidReceived', 'swarm:formed', 'task:subtaskComplete', 'task:complete'].includes(event.event)) {
    console.log(`[${event.event}]`, JSON.stringify(event.data));
  }
});

async function main() {
  const task = await runtime.createTask({
    description:
      'Build a responsive landing page for a DeFi yield aggregator. Include hero section, features grid, token stats, and a call-to-action.',
    budget: 5,
    requesterAddress: 'demo-requester',
  });

  while (true) {
    const current = runtime.getTask(task.id);
    if (!current || current.status === 'completed' || current.status === 'failed') {
      console.log('\nFinal status:', current?.status);
      console.log('Result hash:', current?.resultHash);
      console.log(current?.finalResult);
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
