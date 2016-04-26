import React, { Component } from 'react';

import Axis from './tetris/Axis.js';
import Slash   from './geometry/Slash.js';

import styles from './main.scss';

export default class Main extends Component {

  constructor() {
    super();
    this.state = {
      progress: 0,
      size    : {
        x: window.innerWidth,
        y: window.innerHeight
      }
    };
  }

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

  animate(timestamp) {

    // where progress is incomplete
    if (this.state.progress < 1.0) {

      // update progress on the state
      var dTime = (timestamp - this.timestamp) / 1000 || 0.0;
      this.setState({
        progress: Math.min(1.0, this.state.progress + dTime / 3)
      });
      this.timestamp = timestamp;

      // call again
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }

  render() {
    var size          = this.state.size,
        diagonal      = Math.pow(Math.pow(size.x, 2) + Math.pow(size.y, 2), 0.5),
        lineWidth     = Math.max(4, diagonal * 0.01),
        bgFadeIn      = Math.min(1.0, this.state.progress * 4),
        lineProgress  = Math.min(1.0, this.state.progress * 2),
        emitterFadeIn = Math.max(0.0, this.state.progress * 2 - 1);

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
                colour="#D0F5AB"
                isYnotX={false}
                size={size}
                offset={lineWidth/2}
                opacity={emitterFadeIn}
          />

          <Axis className={styles.axisY}
                label="Work"
                href="#work"
                colour="#ABC4F5"
                isYnotX={true}
                size={size}
                offset={lineWidth/2}
                opacity={emitterFadeIn}
          />
        </div>
      </div>
    );
  }
}
