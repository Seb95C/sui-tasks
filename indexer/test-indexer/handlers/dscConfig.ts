
import { SuiEvent } from '@mysten/sui/client';
import { prisma, Prisma } from '../db';

export const handleDscConfigEvents = async (events: SuiEvent[], type: string) => {
  const eventsByType = new Map<string, any[]>();
  
  for (const event of events) {
    if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
    const eventData = eventsByType.get(event.type) || [];
    eventData.push(event.parsedJson);
    eventsByType.set(event.type, eventData);
  }

  await Promise.all(
    Array.from(eventsByType.entries()).map(async ([eventType, events]) => {
      const eventName = eventType.split('::').pop() || eventType;
      switch (eventName) {
        case 'CoinAdded':
          // TODO: handle CoinAdded
          await prisma.coinAdded.createMany({
            data: events as Prisma.CoinAddedCreateManyInput[],
          });
          console.log('Created CoinAdded events');
          break;
        case 'OracleHolderChanged':
          // TODO: handle OracleHolderChanged
          await prisma.oracleHolderChanged.createMany({
            data: events as Prisma.OracleHolderChangedCreateManyInput[],
          });
          console.log('Created OracleHolderChanged events');
          break;
        case 'CoinRemoved':
          // TODO: handle CoinRemoved
          await prisma.coinRemoved.createMany({
            data: events as Prisma.CoinRemovedCreateManyInput[],
          });
          console.log('Created CoinRemoved events');
          break;
        case 'PrecisionUpdated':
          // TODO: handle PrecisionUpdated
          await prisma.precisionUpdated.createMany({
            data: events as Prisma.PrecisionUpdatedCreateManyInput[],
          });
          console.log('Created PrecisionUpdated events');
          break;
        case 'LiquidationThresholdUpdated':
          // TODO: handle LiquidationThresholdUpdated
          await prisma.liquidationThresholdUpdated.createMany({
            data: events as Prisma.LiquidationThresholdUpdatedCreateManyInput[],
          });
          console.log('Created LiquidationThresholdUpdated events');
          break;
        case 'MinHealthFactorUpdated':
          // TODO: handle MinHealthFactorUpdated
          await prisma.minHealthFactorUpdated.createMany({
            data: events as Prisma.MinHealthFactorUpdatedCreateManyInput[],
          });
          console.log('Created MinHealthFactorUpdated events');
          break;
        case 'LiquidationBonusUpdated':
          // TODO: handle LiquidationBonusUpdated
          await prisma.liquidationBonusUpdated.createMany({
            data: events as Prisma.LiquidationBonusUpdatedCreateManyInput[],
          });
          console.log('Created LiquidationBonusUpdated events');
          break;
        default:
          console.log('Unknown event type:', eventName);
      }
    }),
  );
};
