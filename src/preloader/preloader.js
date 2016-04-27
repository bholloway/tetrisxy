import Q from 'q';

import xhrScript from '../net/xhr-script';

import styles from './preloader.scss';

export default function preloader(url, isDisabled) {
  const OFFSET           = 0.2,
        MINIMUM_DURATION = 1.5,
        PRECISION        = 0.01;

  let body      = document.querySelector('body'),
      preloader = body.querySelector('#preloader'),
      svg       = preloader.querySelector('svg'),
      circle    = svg.querySelector('circle'),
      digit0    = preloader.querySelector('.digit.lsd'),
      digit1    = preloader.querySelector('.digit.msd'),
      progress  = +isDisabled,
      displayed = 0.0,
      time      = NaN;

  preloader.querySelector('.progress').setAttribute('class', styles.progress);
  digit0.setAttribute('class', styles.digit);
  digit1.setAttribute('class', styles.digit);

  onAnimationFrame();

  if (isDisabled) {
    return Q.resolve();
  }
  else {
    return xhrScript(url)
      .progress((x) => progress = x)
      .progress(updateDigits)
      .finally(() => progress = 1.0)
      .finally(removeDigits);
  }

  function updateDigits(value) {
    if (value > 0) {
      let percent = ('00' + Math.round(value * 100)).slice(-2);
      digit1.innerHTML = percent.charAt(0);
      digit0.innerHTML = percent.charAt(1);
    }
  }

  function removeDigits() {
    digit0.parentNode.removeChild(digit0);
    digit1.parentNode.removeChild(digit1);
    digit0 = digit1 = null;
  }

  function onAnimationFrame(timestamp) {
    let setPoint = (progress === 1.0) ? 1.0 : (1.0 - OFFSET) * progress,
        error    = setPoint - displayed;

    // tween incomplete implies render
    if ((setPoint < 1.0) || (error > PRECISION)) {

      // get a time delta to implement a maximum rate on the tween
      let dTime = isNaN(time) ? 0.0 : isNaN(timestamp) ? 0.0 : (timestamp - time) / 1000;
      time = timestamp;

      // only on valid time elapsed
      if (dTime) {

        // show the body
        body.setAttribute('style', 'visibility:visible');

        // limit fraction change based on maximum rate
        let maxSlew = 1 / MINIMUM_DURATION * dTime,
            ease    = Math.pow(error / OFFSET, 1.2),
            dTween  = Math.min(maxSlew, error * ease);
        displayed += dTween;

        // current size
        let size     = {
              x: window.innerWidth,
              y: window.innerHeight
            },
            diagonal = Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5),
            viewBox  = [-size.x / 2, -size.y / 2, size.x, size.y].join(' '),
            radius   = (1.0 - displayed) * diagonal / 2;

        // render
        svg.setAttribute('viewBox', viewBox);
        circle.setAttribute('r', Math.max(0, radius));
      }

      // call again
      window.requestAnimationFrame(onAnimationFrame);
    }
    // complete implies cleanup
    else {
      preloader.parentNode.removeChild(preloader);
    }
  }
}
