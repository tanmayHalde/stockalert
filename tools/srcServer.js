import http from 'http';
import path from 'path';
import open from 'open';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import webpack from 'webpack';
import config from '../webpack.config.dev';
import Stock from './utils/mongoose/Stock';

// utilities
import * as mongo from './utils/mongoConfig';
import handleSocketEvents from './utils/socketEventHandler';
import handleHttpRequests from './utils/httpRequestHandler';


/* eslint-disable no-console */
const port = 3000;
const app = express();
const compiler = webpack(config);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

/*----DB setup----*/
mongo.start();

/*----Req handling----*/
handleHttpRequests(app);

/*----Socket----*/
let server = http.createServer(app);
let io = require('socket.io')(server);
handleSocketEvents(io);

server.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    open(`http://localhost:${port}`);
  }
});