import preloader from './preloader';

import 'normalize.css';
import './index.scss';

preloader('//localhost.charlesproxy.com:3000/main.js', false)  // TODO remove proxy address
  .then(() => {
    require.ensure([], () => require('./main.js'), 'main')
  })
  .catch((e) => consol.error(e));
