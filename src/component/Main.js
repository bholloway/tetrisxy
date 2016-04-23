import React, { Component } from 'react';

import Emitter from './Emitter.js';
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

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.animate();
  }

  animate() {
    if (this.state.progress < 1.0) {
      this.setState({
        progress: Math.min(1.0, this.state.progress + 0.005)
      });
      setTimeout(this.animate.bind(this), 10);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
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

        <Emitter className={styles.emitterA}
                 colour="#D0F5AB"
                 title="Blog"
                 isYnotX={false}
                 size={size}
                 offset={lineWidth/2}
                 opacity={emitterFadeIn}
        />

        <Emitter className={styles.emitterB}
                 colour="#ABC4F5"
                 title="Folio"
                 isYnotX={true}
                 size={size}
                 offset={lineWidth/2}
                 opacity={emitterFadeIn}
        />

        <Slash className={styles.slash} {...this.props}
               colour="white"
               size={size}
               lineWidth={lineWidth}
               progress={lineProgress}
        />
      </div>
    );
  }
}
