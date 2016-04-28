import Q                     from 'q';
import requestAnimationFrame from 'raf';

import styles from './preLoader.scss';

const OFFSET           = 0.2,   // proportion of circle radius left when progress is 100%
      MINIMUM_DURATION = 1.5,   // minimum overall duration
      PRECISION        = 0.01,  // may complete where there is this much difference between set-point and display
      SELECTORS        = {
        body     : 'body',
        preloader: '#preloader',
        svg      : '#preloader svg',
        circle   : '#preloader circle',
        digit0   : '#preloader .digit.lsd',
        digit1   : '#preloader .digit.msd',
        progress : '#preloader .progress',
      };

/**
 * Pre-loader display that is attached to the given promise.
 *
 * Highly coupled to the HTML implemenation but with no other framework dependencies
 * Call without arguments to complete immediately and show the animation at maximum rate.
 *
 * @param {Promise} [promise] A promise that emits progres events
 * @returns {Promise} The given promise or one that completes immediately
 */
export default function preloader(promise) {

  let progress     = +!promise,
      displayed    = 0.0,
      time         = NaN,
      meanSlewRate = 1 / MINIMUM_DURATION,
      elements     = Object.keys(SELECTORS)
        .reduce(reduceSelectorToElement.bind(SELECTORS), {});

  elements.progress.setAttribute('class', styles.progress);
  elements.digit0.setAttribute('class', styles.digit);
  elements.digit1.setAttribute('class', styles.digit);

  onAnimationFrame();

  return (promise || Q.when())
    .progress((x) => progress = x)
    .progress(updateDigits)
    .finally(() => progress = 1.0)
    .finally(removeDigits);

  function reduceSelectorToElement(reduced, key) {
    reduced[key] = document.querySelector(this[key]);
    return reduced;
  }

  function updateDigits(value) {
    if (value > 0) {
      let percent = ('00' + Math.round(value * 100)).slice(-2);
      elements.digit1.innerHTML = percent.charAt(0);
      elements.digit0.innerHTML = percent.charAt(1);
    }
  }

  function removeDigits() {
    elements.digit0.parentNode.removeChild(elements.digit0);
    elements.digit1.parentNode.removeChild(elements.digit1);
  }

  function onAnimationFrame(timestamp) {
    let setPoint = (progress === 1.0) ? 1.0 : (1.0 - OFFSET) * progress,
        error    = setPoint - displayed;

    // render tween while the setpoint is incomplete or the error between setpoint and actual is high
    let willRender = (setPoint < 1.0) || (error > PRECISION);
    if (willRender) {

      // get a time delta to implement a maximum rate on the tween
      let dTime = isNaN(time) ? 0.0 : isNaN(timestamp) ? 0.0 : (timestamp - time) / 1000;
      time = timestamp;

      // only on valid time elapsed
      if (dTime) {

        // show the body
        elements.body.setAttribute('style', 'visibility:visible');

        // limit fraction change based on maximum rate
        //  slew rate may accelerate when complete and approaching 1.0
        let maxSlew = Math.min(2 * meanSlewRate, 1 / MINIMUM_DURATION * dTime),
            ease    = Math.pow(error / OFFSET, 1.2),
            dTween  = Math.min(maxSlew, error * ease);
        displayed += dTween;
        meanSlewRate = 0.95 * meanSlewRate + 0.05 * dTween;

        // current size
        let size     = {
              x: window.innerWidth,
              y: window.innerHeight,
            },
            diagonal = Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5),
            viewBox  = [-size.x / 2, -size.y / 2, size.x, size.y].join(' '),
            radius   = (1.0 - displayed) * diagonal / 2;

        // render
        elements.svg.setAttribute('viewBox', viewBox);
        elements.circle.setAttribute('r', Math.max(0, radius));
      }

      // call again
      requestAnimationFrame(onAnimationFrame);
    }
    // complete implies cleanup
    else {
      elements.preloader.parentNode.removeChild(elements.preloader);
      elements = null;
    }
  }
}