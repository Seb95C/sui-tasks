
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Event query endpoints
app.get('/events/deny-list/per-type-config-created', async (req, res) => {
      try {
        const events = await prisma.perTypeConfigCreated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch deny_list-PerTypeConfigCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
