import express from 'express';

import { router } from '@shared/infra/http/routes';

const app = express();

app.use(express.json());

app.use(router);

// app.use((err: Error, _request: Request, response: Response) => {
//   if (err instanceof AppError) {
//     return response.status(err.statusCode).json({
//       message: err.message,
//     });
//   }

//   return response.status(500).json({
//     status: 'error',
//     message: `Internal server error - ${err.message}`,
//   });
// });

export { app };
