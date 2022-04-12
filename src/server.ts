import 'reflect-metadata';
import { SearchAuctionsTask } from '@modules/auctions/tasks/searchAuctionsTask';
import { InsertAuctionsController } from '@modules/auctions/useCases/insertAuctionsUseCase/InsertAuctionsController';
import { Server } from 'socket.io';

const io = new Server();

const insertAuctionsController = new InsertAuctionsController();

io.on('connection', socket => {
  // ....

  socket.on('INSERT_ENDED_AUCTIONS', insertAuctionsController.handle);
});

const auctionsTask = new SearchAuctionsTask(io);

auctionsTask.execute();

io.listen(6060);
