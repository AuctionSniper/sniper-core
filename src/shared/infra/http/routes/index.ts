import { Router } from 'express';

import { testRoutes } from './test.routes';

const router = Router();

router.use('/test', testRoutes);

export { router };
