import { StateGraph, END, START } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import { AgentState } from './state';
import { SYSTEM_PROMPT } from '../prompts/system';
import { agentConfig } from '../config';
import { allTools } from '../tools';

const model = new ChatOpenAI({
  model: agentConfig.model,
  temperature: agentConfig.temperature,
  maxTokens: agentConfig.maxTokens,
});

const modelWithTools = model.bindTools(allTools);
const toolNodeRunnable = new ToolNode(allTools);

function aiMessageContentToString(msg: AIMessage | undefined): string {
  if (!msg) return 'Lo siento, no pude procesar tu mensaje.';
  const c = msg.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) {
    return c
      .map((block) => {
        if (typeof block === 'string') return block;
        if (block && typeof block === 'object' && 'text' in block) {
          return String((block as { text: string }).text);
        }
        return '';
      })
      .join('');
  }
  return 'Lo siento, no pude procesar tu mensaje.';
}

async function agentNode(state: typeof AgentState.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT);
  const walletContext =
    state.walletAddress.trim().length > 0
      ? new SystemMessage(
          `La wallet activa del usuario (solo referencia, no ejecutes transacciones sin confirmación) es: ${state.walletAddress}`,
        )
      : null;
  const messages = walletContext
    ? [systemMessage, walletContext, ...state.messages]
    : [systemMessage, ...state.messages];

  const response = await modelWithTools.invoke(messages);
  return { messages: [response] };
}

async function toolNode(state: typeof AgentState.State) {
  return toolNodeRunnable.invoke(state);
}

function shouldContinue(state: typeof AgentState.State): typeof END | 'tools' {
  const lastMessage = state.messages[state.messages.length - 1];
  if (
    lastMessage &&
    'tool_calls' in lastMessage &&
    Array.isArray((lastMessage as AIMessage).tool_calls) &&
    (lastMessage as AIMessage).tool_calls!.length > 0
  ) {
    return 'tools';
  }
  return END;
}

export function createAgentGraph() {
  const graph = new StateGraph(AgentState)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addConditionalEdges('agent', shouldContinue, {
      tools: 'tools',
      [END]: END,
    })
    .addEdge('tools', 'agent');

  return graph.compile();
}

export type ProcessMessageResult = {
  content: string;
  toolCalls: NonNullable<AIMessage['tool_calls']>;
};

export async function processMessage(
  message: string,
  walletAddress: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
): Promise<ProcessMessageResult> {
  const graph = createAgentGraph();

  const messages = conversationHistory.map((msg) => {
    if (msg.role === 'user') return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });
  messages.push(new HumanMessage(message));

  const result = await graph.invoke(
    {
      messages,
      walletAddress,
      conversationId: '',
      currentPlan: null,
      awaitingConfirmation: false,
      executionResult: null,
      error: null,
    },
    { recursionLimit: 40 },
  );

  const aiMessages = result.messages.filter((m: BaseMessage) => m.getType() === 'ai');
  const lastAiMessage = aiMessages[aiMessages.length - 1] as AIMessage | undefined;

  return {
    content: aiMessageContentToString(lastAiMessage),
    toolCalls: lastAiMessage?.tool_calls ?? ([] as NonNullable<AIMessage['tool_calls']>),
  };
}
