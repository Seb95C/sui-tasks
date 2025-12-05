
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Event query endpoints
app.get('/events/dsc/new-position-created', async (req, res) => {
      try {
        const events = await prisma.newPositionCreated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-NewPositionCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/new-deposit-made', async (req, res) => {
      try {
        const events = await prisma.newDepositMade.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-NewDepositMade:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/collateral-redeemed', async (req, res) => {
      try {
        const events = await prisma.collateralRedeemed.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-CollateralRedeemed:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/collateral-redeemed', async (req, res) => {
      try {
        const events = await prisma.collateralRedeemed.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-CollateralRedeemed:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/d-s-c-burned', async (req, res) => {
      try {
        const events = await prisma.dSCBurned.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-DSCBurned:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/d-s-c-burned', async (req, res) => {
      try {
        const events = await prisma.dSCBurned.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-DSCBurned:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/position-liquidated', async (req, res) => {
      try {
        const events = await prisma.positionLiquidated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-PositionLiquidated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc/collateral-redeemed', async (req, res) => {
      try {
        const events = await prisma.collateralRedeemed.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc-CollateralRedeemed:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/coin-added', async (req, res) => {
      try {
        const events = await prisma.coinAdded.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-CoinAdded:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/oracle-holder-changed', async (req, res) => {
      try {
        const events = await prisma.oracleHolderChanged.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-OracleHolderChanged:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/coin-removed', async (req, res) => {
      try {
        const events = await prisma.coinRemoved.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-CoinRemoved:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/precision-updated', async (req, res) => {
      try {
        const events = await prisma.precisionUpdated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-PrecisionUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/liquidation-threshold-updated', async (req, res) => {
      try {
        const events = await prisma.liquidationThresholdUpdated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-LiquidationThresholdUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/min-health-factor-updated', async (req, res) => {
      try {
        const events = await prisma.minHealthFactorUpdated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-MinHealthFactorUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/dsc-config/liquidation-bonus-updated', async (req, res) => {
      try {
        const events = await prisma.liquidationBonusUpdated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch dsc_config-LiquidationBonusUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/oracle/price-fetched', async (req, res) => {
      try {
        const events = await prisma.priceFetched.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch oracle-PriceFetched:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/oracle/price-fetched', async (req, res) => {
      try {
        const events = await prisma.priceFetched.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch oracle-PriceFetched:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
