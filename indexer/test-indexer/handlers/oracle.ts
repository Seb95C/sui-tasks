
import { SuiEvent } from '@mysten/sui/client';
import { prisma, Prisma } from '../db';

export const handleOracleEvents = async (events: SuiEvent[], type: string) => {
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
        case 'PriceFetched':
          // TODO: handle PriceFetched
          await prisma.priceFetched.createMany({
            data: events as Prisma.PriceFetchedCreateManyInput[],
          });
          console.log('Created PriceFetched events');
          break;
        case 'PriceFetched':
          // TODO: handle PriceFetched
          await prisma.priceFetched.createMany({
            data: events as Prisma.PriceFetchedCreateManyInput[],
          });
          console.log('Created PriceFetched events');
          break;
        default:
          console.log('Unknown event type:', eventName);
      }
    }),
  );
};
