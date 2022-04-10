import { Router, Request, Response } from 'express';

const testRoutes = Router();

testRoutes.get('/', (request: Request, response: Response) => {
  return response.status(200).json({ message: 'Hello, World!' });
});

export { testRoutes };
