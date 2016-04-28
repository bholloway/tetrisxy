import React, { Component, PropTypes } from 'react';
import createFragment                  from 'react-addons-create-fragment';
import requestAnimationFrame           from 'raf';
import performanceNow                  from 'performance-now';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import lengthOf   from '../../svg/length-of';
import * as types from '../../react/prop-types';

import Particle          from './Particle';
import particlesStrategy from './particles-strategy';

import styles from './particles.scss';

export default class Particles extends Component {

  @prop(types.colour.isRequired)
  colour;

  @prop(PropTypes.bool.isRequired)
  isExplosive;

  @prop(PropTypes.arrayOf(types.point).isRequired)
  source;

  @prop(PropTypes.arrayOf(types.point).isRequired)
  sink;

  @prop(types.fraction, 0.015)
  size;

  @prop(PropTypes.number, 1.0)
  speed;

  @prop(PropTypes.number, 1.0)
  acceleration;

  @prop(PropTypes.number, 1.0)
  rate;

  @prop(PropTypes.number, 60)
  fps;

  @prop(PropTypes.number, 0)
  preload;

  @state(NaN)
  timestamp;

  componentWillMount() {
    this.nodeMap = {};
    this.strategy = particlesStrategy(this.props, this.nodeMap, (size, props) => {
      return (<Particle className={`size${size}`} colour={this.colour} isExplosive={this.isExplosive} {...props}/>)
    });
  }

  componentDidMount() {
    let now = performanceNow();

    // pre-load animation up to the current time
    this.timestamp = NaN;
    for (let offset = this.preload || 0.0; offset > 0.0; offset -= 5 / this.fps) {
      this.strategy.update(now - offset * 1000);
    }

    // begin animating
    this.animate();
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
    this.nodeMap = this.instanceMap = this.dataMap = undefined;
  }

  render() {
    return (
      <div className={styles.main}>
        {createFragment(this.nodeMap)}
      </div>
    );
  }

  animate(timestamp) {

    // until unmounted
    if (this.nodeMap) {

      // create particles and run physics
      let isUpdated = this.strategy.update(timestamp);
      if (isUpdated) {

        // update each particle position by applying proportional terms to geometry
        this.strategy.resolve();

        // trigger render by updating the state
        this.setState({timestamp});
      }

      // call again
      requestAnimationFrame(this.animate.bind(this));
    }
  }
}