import React, { Component }  from 'react';
import requestAnimationFrame from 'raf';

import state from '../decorator/state';

import Axis  from './tetris/Axis';
import Slash from './geometry/Slash';
import FPS   from './debug/FPS';

import styles from './main.scss';

export default class Main extends Component {

  @state(0.0)
  progress;

  @state({
    x: window.innerWidth,
    y: window.innerHeight
  })
  size;

  handleResize() {
    this.setState({
      size: {
        x: window.innerWidth,
        y: window.innerHeight
      }
    });
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentDidMount() {
    this.timestamp = NaN;
    this.animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  render() {

    let size          = this.size,
        diagonal      = Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5),
        lineWidth     = Math.max(4, diagonal * 0.01),
        bgFadeIn      = Math.min(1.0, this.progress * 4),
        lineProgress  = Math.min(1.0, this.progress * 2),
        emitterFadeIn = Math.max(0.0, this.progress * 2 - 1);

    return (
      <div className={styles.main} style={{backgroundOpacity: bgFadeIn}}>
        <div className={styles.tetris}>

          <Slash className={styles.slash}
                 colour="white"
                 size={size}
                 lineWidth={lineWidth}
                 progress={lineProgress}
          />

          <Axis className={styles.axisX}
                label="Blog"
                href="#blog"
                colour="hsv(100, 20%, 95%)"
                isYnotX={false}
                size={size}
                offset={lineWidth/2}
                opacity={emitterFadeIn}
          />

          <Axis className={styles.axisY}
                label="Work"
                href="#work"
                colour="hsv(200, 20%, 95%)"
                isYnotX={true}
                size={size}
                offset={lineWidth/2}
                opacity={emitterFadeIn}
          />

          <FPS initial={60}/>

        </div>
      </div>
    );
  }

  animate(timestamp) {

    // where progress is incomplete
    if (this.progress < 1.0) {

      // update progress on the state
      let dTime = (timestamp - this.timestamp) / 1000 || 0.0;
      this.setState({
        progress: Math.min(1.0, this.progress + dTime / 3)
      });
      this.timestamp = timestamp;

      // call again
      requestAnimationFrame(this.animate.bind(this));
    }
  }
}
