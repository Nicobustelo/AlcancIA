import { prisma } from './client';

/** Demo wallet: 0x1234…5678 (40 hex chars after 0x) */
const DEMO_WALLET = '0x1234567890123456789012345678901234565678';

const IDS = {
  user: 'seed_beexo_user_001',
  conversation: 'seed_beexo_conv_001',
  msgUser: 'seed_beexo_msg_user_001',
  msgAssistant: 'seed_beexo_msg_asst_001',
  msgConfirm: 'seed_beexo_msg_user_002',
  plan: 'seed_beexo_plan_001',
  remScheduled: 'seed_beexo_rem_sched_001',
  remExecuted: 'seed_beexo_rem_done_001',
  txDeposit: 'seed_beexo_tx_dep_001',
  txMint: 'seed_beexo_tx_mint_001',
  txSupply: 'seed_beexo_tx_sup_001',
  settings: 'seed_beexo_settings_001',
} as const;

async function main() {
  const user = await prisma.user.upsert({
    where: { walletAddress: DEMO_WALLET },
    create: {
      id: IDS.user,
      walletAddress: DEMO_WALLET,
      displayName: 'Usuario demo',
      localCurrency: 'USD',
    },
    update: {
      displayName: 'Usuario demo',
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { id: IDS.conversation },
    create: {
      id: IDS.conversation,
      userId: user.id,
      title: 'Inversión con el agente',
    },
    update: {
      userId: user.id,
      title: 'Inversión con el agente',
    },
  });

  await prisma.message.upsert({
    where: { id: IDS.msgUser },
    create: {
      id: IDS.msgUser,
      conversationId: conversation.id,
      role: 'user',
      content:
        'Quiero invertir parte de mis fondos en DOC y obtener rendimiento en Tropykus de forma segura.',
    },
    update: {
      conversationId: conversation.id,
      role: 'user',
      content:
        'Quiero invertir parte de mis fondos en DOC y obtener rendimiento en Tropykus de forma segura.',
    },
  });

  await prisma.message.upsert({
    where: { id: IDS.msgAssistant },
    create: {
      id: IDS.msgAssistant,
      conversationId: conversation.id,
      role: 'assistant',
      content:
        'Propongo un plan: depositar RBTC, mintear DOC, y supply de kDOC en Tropykus. Revisá los pasos y confirmá si te parece bien.',
      metadata: { kind: 'plan_proposal' },
    },
    update: {
      conversationId: conversation.id,
      role: 'assistant',
      content:
        'Propongo un plan: depositar RBTC, mintear DOC, y supply de kDOC en Tropykus. Revisá los pasos y confirmá si te parece bien.',
      metadata: { kind: 'plan_proposal' },
    },
  });

  await prisma.message.upsert({
    where: { id: IDS.msgConfirm },
    create: {
      id: IDS.msgConfirm,
      conversationId: conversation.id,
      role: 'user',
      content: 'Confirmado, ejecutá el plan.',
    },
    update: {
      conversationId: conversation.id,
      role: 'user',
      content: 'Confirmado, ejecutá el plan.',
    },
  });

  const planSteps = [
    { order: 1, title: 'Depositar RBTC', description: 'Enviar RBTC al flujo del vault' },
    { order: 2, title: 'Mintear DOC', description: 'Obtener DOC desde colateral' },
    { order: 3, title: 'Supply kDOC en Tropykus', description: 'Depositar kDOC para yield' },
  ];

  const now = new Date();
  await prisma.executionPlan.upsert({
    where: { id: IDS.plan },
    create: {
      id: IDS.plan,
      userId: user.id,
      conversationId: conversation.id,
      intent: 'invest_yield',
      summary: 'Plan completado: depósito, mint de DOC y supply en Tropykus.',
      steps: planSteps,
      warnings: ['Riesgo de mercado y smart contract.'],
      estimates: { apyPct: 5.5, currency: 'USD' },
      status: 'completed',
      confirmedAt: now,
      executedAt: now,
    },
    update: {
      userId: user.id,
      conversationId: conversation.id,
      intent: 'invest_yield',
      summary: 'Plan completado: depósito, mint de DOC y supply en Tropykus.',
      steps: planSteps,
      warnings: ['Riesgo de mercado y smart contract.'],
      estimates: { apyPct: 5.5, currency: 'USD' },
      status: 'completed',
      confirmedAt: now,
      executedAt: now,
    },
  });

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(15);

  await prisma.remittance.upsert({
    where: { id: IDS.remScheduled },
    create: {
      id: IDS.remScheduled,
      userId: user.id,
      recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      recipientLabel: 'Familia',
      amountUsd: 100,
      amountDoc: 100,
      dayOfMonth: 15,
      status: 'scheduled',
      nextExecution: nextMonth,
    },
    update: {
      userId: user.id,
      recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      recipientLabel: 'Familia',
      amountUsd: 100,
      amountDoc: 100,
      dayOfMonth: 15,
      status: 'scheduled',
      nextExecution: nextMonth,
    },
  });

  const executedAt = new Date(now.getTime() - 86_400_000);
  await prisma.remittance.upsert({
    where: { id: IDS.remExecuted },
    create: {
      id: IDS.remExecuted,
      userId: user.id,
      recipientAddress: '0x1111111111111111111111111111111111111111',
      recipientLabel: 'Ahorro',
      amountUsd: 250,
      amountDoc: 250,
      dayOfMonth: 1,
      status: 'executed',
      txHash: '0x' + 'a'.repeat(64),
      onChainId: 1,
      executedAt,
    },
    update: {
      userId: user.id,
      recipientAddress: '0x1111111111111111111111111111111111111111',
      recipientLabel: 'Ahorro',
      amountUsd: 250,
      amountDoc: 250,
      dayOfMonth: 1,
      status: 'executed',
      txHash: '0x' + 'a'.repeat(64),
      onChainId: 1,
      executedAt,
    },
  });

  await prisma.transaction.upsert({
    where: { id: IDS.txDeposit },
    create: {
      id: IDS.txDeposit,
      userId: user.id,
      type: 'deposit',
      amount: 0.05,
      asset: 'RBTC',
      status: 'confirmed',
      txHash: '0x' + 'b'.repeat(64),
      blockNumber: 5_000_000,
      isMock: true,
    },
    update: {
      userId: user.id,
      type: 'deposit',
      amount: 0.05,
      asset: 'RBTC',
      status: 'confirmed',
      txHash: '0x' + 'b'.repeat(64),
      blockNumber: 5_000_000,
      isMock: true,
    },
  });

  await prisma.transaction.upsert({
    where: { id: IDS.txMint },
    create: {
      id: IDS.txMint,
      userId: user.id,
      type: 'mint_doc',
      amount: 500,
      asset: 'DOC',
      status: 'confirmed',
      isMock: true,
      metadata: { protocol: 'MOC' },
    },
    update: {
      userId: user.id,
      type: 'mint_doc',
      amount: 500,
      asset: 'DOC',
      status: 'confirmed',
      isMock: true,
      metadata: { protocol: 'MOC' },
    },
  });

  await prisma.transaction.upsert({
    where: { id: IDS.txSupply },
    create: {
      id: IDS.txSupply,
      userId: user.id,
      type: 'supply_tropykus',
      amount: 500,
      asset: 'kDOC',
      status: 'confirmed',
      isMock: true,
      metadata: { market: 'kDOC' },
    },
    update: {
      userId: user.id,
      type: 'supply_tropykus',
      amount: 500,
      asset: 'kDOC',
      status: 'confirmed',
      isMock: true,
      metadata: { market: 'kDOC' },
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      id: IDS.settings,
      userId: user.id,
      localCurrency: 'ARS',
      localCurrencyRate: 1250,
      displayName: 'Usuario demo',
    },
    update: {
      localCurrency: 'ARS',
      localCurrencyRate: 1250,
      displayName: 'Usuario demo',
    },
  });

  console.log('Seed completed for wallet', DEMO_WALLET);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
