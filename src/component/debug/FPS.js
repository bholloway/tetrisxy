import React, { Component, PropTypes } from 'react';

import prop  from '../../decorator/prop';
import state from '../../decorator/state';

import styles from './fps.scss';

export default class FPS extends Component {

  @prop(PropTypes.number.isRequired)
  initial;

  @state(NaN)
  timestamp;

  isReady = false;

  componentWillMount() {
    this.avgFrame = 1 / this.initial;
  }

  componentDidMount() {
    this.isReady = true;
    this.animate();
  }

  componentWillUnmount() {
    this.isReady = false;
  }

  render() {
    let fps = ('00' + Math.round(1 / this.avgFrame)).slice(-2);

    return (
      <div className={styles.main}>
        <span>{fps} fps</span>
      </div>
    );
  }

  animate(timestamp) {

    // until unmounted
    if (this.isReady) {

      // update the state to trigger redraw
      //  add frame rate limiting for when the browser reactivates from being inactive
      let dTime = (timestamp - this.timestamp) / 1000 || 0;

      // set timestamp to trigger render
      this.setState({timestamp});

      // simply IIR filter for average frame rate
      this.avgFrame = this.avgFrame * 0.99 + dTime * 0.01;

      // call again
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }

}