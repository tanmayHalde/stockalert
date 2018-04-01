import mongoose from 'mongoose';

export function start() {
  mongoose.connection.openUri(`mongodb://$(process.env.MONGO_USER):$(process.env.MONGO_PASSCODE)
    @ds231229.mlab.com:31229/th-freecodecamp`);

  mongoose.connection.on('error', err => {
    console.log('FAILED to connect to mongoose');
    console.error(err);
  });

  mongoose.connection.on('connected', () => {
    console.log('connected to mongoose');
  });
}