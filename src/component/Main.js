import React, { Component } from 'react';

import Emitter from './tetris/Emitter.js';
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
    this.animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  animate() {
    if (this.state.progress < 1.0) {
      this.setState({
        progress: Math.min(1.0, this.state.progress + 0.005)
      });
      setTimeout(this.animate.bind(this), 10);
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
        <div className={styles.landing}>
          <Slash className={styles.slash}
                 colour="white"
                 size={size}
                 lineWidth={lineWidth}
                 progress={lineProgress}
          />

          <Emitter className={styles.emitterA}
                   label="Blog"
                   href="javascript:console.log('Blog')"
                   colour="#D0F5AB"
                   isYnotX={false}
                   size={size}
                   offset={lineWidth/2}
                   opacity={emitterFadeIn}
          />

          <Emitter className={styles.emitterB}
                   label="Work"
                   href="javascript:console.log('Work')"
                   colour="#ABC4F5"
                   isYnotX={true}
                   size={size}
                   offset={lineWidth/2}
                   opacity={emitterFadeIn}
          />
        </div>

        <div className={styles.contentX}>
          The quick brown fox
        </div>
        <div className={styles.contentX}>
          The quick brown fox
        </div>
        <div className={styles.contentX}>
          The quick brown fox
        </div>

      </div>
    );
  }
}
