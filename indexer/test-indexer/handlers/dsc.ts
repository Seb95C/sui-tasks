
import { SuiEvent } from '@mysten/sui/client';
import { prisma, Prisma } from '../db';

export const handleDscEvents = async (events: SuiEvent[], type: string) => {
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
        case 'NewPositionCreated':
          // TODO: handle NewPositionCreated
          await prisma.newPositionCreated.createMany({
            data: events as Prisma.NewPositionCreatedCreateManyInput[],
          });
          console.log('Created NewPositionCreated events');
          break;
        case 'NewDepositMade':
          // TODO: handle NewDepositMade
          await prisma.newDepositMade.createMany({
            data: events as Prisma.NewDepositMadeCreateManyInput[],
          });
          console.log('Created NewDepositMade events');
          break;
        case 'CollateralRedeemed':
          // TODO: handle CollateralRedeemed
          await prisma.collateralRedeemed.createMany({
            data: events as Prisma.CollateralRedeemedCreateManyInput[],
          });
          console.log('Created CollateralRedeemed events');
          break;
        case 'CollateralRedeemed':
          // TODO: handle CollateralRedeemed
          await prisma.collateralRedeemed.createMany({
            data: events as Prisma.CollateralRedeemedCreateManyInput[],
          });
          console.log('Created CollateralRedeemed events');
          break;
        case 'DSCBurned':
          // TODO: handle DSCBurned
          await prisma.dSCBurned.createMany({
            data: events as Prisma.DSCBurnedCreateManyInput[],
          });
          console.log('Created DSCBurned events');
          break;
        case 'DSCBurned':
          // TODO: handle DSCBurned
          await prisma.dSCBurned.createMany({
            data: events as Prisma.DSCBurnedCreateManyInput[],
          });
          console.log('Created DSCBurned events');
          break;
        case 'PositionLiquidated':
          // TODO: handle PositionLiquidated
          await prisma.positionLiquidated.createMany({
            data: events as Prisma.PositionLiquidatedCreateManyInput[],
          });
          console.log('Created PositionLiquidated events');
          break;
        case 'CollateralRedeemed':
          // TODO: handle CollateralRedeemed
          await prisma.collateralRedeemed.createMany({
            data: events as Prisma.CollateralRedeemedCreateManyInput[],
          });
          console.log('Created CollateralRedeemed events');
          break;
        default:
          console.log('Unknown event type:', eventName);
      }
    }),
  );
};
