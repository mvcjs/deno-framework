import MVCjs from './Namespace.mjs';

MVCjs.load().then((modules) => {
  console.log('Namespace:', modules);
  return MVCjs.Handler.create({ test: 12 },this);
}).then((handler) => {
  console.log('Handler:', handler.valueOf());
});
