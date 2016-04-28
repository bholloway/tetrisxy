import preloader from './preloader/preloader';
import xhrScript from './net/xhr-script';

import '!style!css!normalize.css';
import '!style!css!sass!./index.scss';

let promise = xhrScript('//localhost.charlesproxy.com:3000/main.js');  // TODO remove proxy address

preloader(promise)
  .then(() => {
    require.ensure([], () => require('./main.js'), 'main')
  })
  .catch((e) => console.error(e));