import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  walletAddress: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  conversationId: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  currentPlan: Annotation<unknown>({ reducer: (_, b) => b, default: () => null }),
  awaitingConfirmation: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  executionResult: Annotation<unknown>({ reducer: (_, b) => b, default: () => null }),
  error: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
});
