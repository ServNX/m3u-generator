const fs = require('fs');
const Express = require('express');

const app = Express();
const server = app.listen(80, () => console.log('Http server listening on port 80 ...'));
const io = require('socket.io')(server);

// Middlewares
// const socketIo = require('socket.io');
const cors = require('./middlewares/cors');

module.exports = class httpServer {
  constructor() {

  }

  start() {
    app.use(cors);
    io.origins('localhost:32400 127.0.0.1:32400');

    app.use(Express.json());
    app.use(Express.urlencoded({extended: true}));

    const rootRouter = express.Router();
    rootRouter.get('/', (req, res) => {
      res.status(200).json({});
    });

    fs.readdir('./http/routes/', (err, files) => {
      if (err) console.error(err);

      if (files.length <= 0) {
        console.log('Routes not found!');
      }

      files.forEach((file) => {
        if (!file.startsWith('_')) {
          const prefix = file.replace('.js', '')
            .trim();
          const router = require(`./routes/${file}`)();
          app.use(`/${prefix}`, router);
        }
      });
    });
  }
};