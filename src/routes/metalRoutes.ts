import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ message: 'Metals endpoint - coming soon' }));
export default router;
