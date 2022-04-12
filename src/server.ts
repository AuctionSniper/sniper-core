import 'reflect-metadata';

import { SearchAuctionsTask } from '@modules/auctions/tasks/searchAuctionsTask';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Server } from 'socket.io';

const io = new Server({});

const rateLimiter = new RateLimiterMemory({
  points: 1,
  duration: 60,
});

io.on('connection', socket => {
  // ....
  console.log(`New connection: ${socket.id}.`);

  socket.on('bcast', async data => {
    try {
      await rateLimiter.consume(socket.handshake.address);

      // May be used to auth later, for now just rate limiting to avoid attacks.
      console.log('data', data);
    } catch (rejRes) {
      socket.emit('blocked', { 'retry-ms': rejRes.msBeforeNext });
    }
  });
});

const auctionsTask = new SearchAuctionsTask(io);

auctionsTask.execute();

io.listen(6060);
