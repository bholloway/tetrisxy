import preloader from './preloader/preloader';

import '!style!css!normalize.css';
import '!style!css!sass!./index.scss';

preloader('//localhost.charlesproxy.com:3000/main.js', true)  // TODO remove proxy address
  .then(() => {
    require.ensure([], () => require('./main.js'), 'main')
  })
  .catch((e) => consol.error(e));