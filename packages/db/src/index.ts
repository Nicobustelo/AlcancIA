export { prisma } from './client';
export type { PrismaClient } from '@prisma/client';
export { Prisma } from '@prisma/client';
// Re-export Prisma-generated model types (type-only under isolatedModules)
export type {
  User,
  Conversation,
  Message,
  ExecutionPlan,
  Remittance,
  Transaction,
  UserSettings,
} from '@prisma/client';
