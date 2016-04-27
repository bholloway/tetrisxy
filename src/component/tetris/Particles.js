import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import createFragment                  from 'react-addons-create-fragment';
import requestAnimationFrame           from 'raf';
import performanceNow                  from 'performance-now';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import lengthOf   from '../../svg/length-of';
import rampDist   from '../../math/ramp-distribution';
import * as types from '../../react/prop-types';

import Particle from './Particle';

import styles from './particles.scss';

const SPEED_MODIFIER        = 0.1,
      RATE_MODIFIER         = 1.0,
      ACCELERATION_MODIFIER = 3.0;

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

  @prop(PropTypes.number, 0)
  preload;

  @prop(PropTypes.number, 60)
  fps;

  @state(NaN)
  timestamp;

  componentWillMount() {
    this.memoGeometry = memoizee(Particles.getGeometry, {primitive: true, length: 3, max: 2});

    this.nodeMap = {};
    this.instanceMap = {};
    this.dataMap = {};

    this.nextKey = 0;
    this.meanFramePeriod = 0.1;
    this.quantity = 0.0;
  }

  componentDidMount() {
    let now = performanceNow();

    // pre-load animation up to the current time
    this.timestamp = NaN;
    for (let offset = this.preload || 0.0; offset > 0.0; offset -= 5 / this.fps) {
      this.update(now - offset * 1000);
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
      let isUpdated = this.update(timestamp);
      if (isUpdated) {

        // update each particle position by applying proportional terms to geometry
        this.resolve();

        // trigger render by updating the state
        this.setState({timestamp});
      }

      // call again
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  update(timestamp) {

    // find the time delta since the last update
    let dTime = Math.min(this.meanFramePeriod * 5, (timestamp - this.timestamp) / 1000);

    // limit the frame rate
    var willUpdate = (dTime >= 1 / this.fps);

    // update the timestamp on startup and on update
    if (isNaN(this.timestamp) || willUpdate) {
      this.timestamp = timestamp;
    }

    // rate limited update
    if (willUpdate) {

      // simply IIR filter for average frame period
      this.meanFramePeriod = this.meanFramePeriod * 0.95 + dTime * 0.05;

      // create new list
      //  for a smooth result we need to track fractional value
      //  but obviously we can only create whole numbers
      for (this.quantity += dTime * this.rate * RATE_MODIFIER; this.quantity >= 1; this.quantity--) {
        this.create();
      }

      // update each particle in proportional terms
      this.physics(dTime);
    }

    // indicate whether update occurred
    return willUpdate;
  }

  create(initialConditions) {

    // data for this component
    let key   = `particle${this.nextKey++}`,
        speed = this.speed * SPEED_MODIFIER,
        data  = Object.assign({
          sizeIndex: 2 + (Math.random() < 0.5),
          opacity  : NaN,
          attractor: null,
          position : {
            lateral: rampDist(),
            axial  : 0.0
          },
          velocity : {
            lateral: 0.0,
            axial  : speed
          }
        }, initialConditions);

    this.dataMap[key] = data;

    const register = (instance) => {
      this.instanceMap[key] = instance;
    };

    const unregister = () => {
      delete this.dataMap[key];
      delete this.instanceMap[key];
    };

    // create particle
    this.nodeMap[key] = (
      <Particle className={`size${data.sizeIndex}`} colour={this.colour} isExplosive={this.isExplosive}
                register={register} unregister={unregister}/>
    );
  }

  physics(dTime) {

    // cache geometry from props
    let geom = this.memoGeometry(this.source, this.sink, this.size);

    // process all data, event if the instance is not yet registered
    Object.keys(this.dataMap)
      .forEach((key) => {

        let data      = this.dataMap[key],
            position  = data.position,
            attractor = data.attractor,
            velocity  = data.velocity;

        // check which side of the hypotenuse we were on before update
        let isOutsideBefore = (position.axial > position.lateral);

        // update position
        position.lateral += velocity.lateral * dTime * geom.sine;
        position.axial += velocity.axial * dTime * geom.cosine;

        // check which side of the hypotenuse we were on after update
        let isOutsideAfter = (position.axial > position.lateral);

        // where fade-out has begun
        if (!isNaN(data.opacity)) {

          // update opacity
          let overshoot = position.axial - position.lateral,
              dOpacity  = -overshoot / geom.offset * dTime * geom.cosine;
          data.opacity = Math.max(0.0, data.opacity + dOpacity);

          // remove elements that have faded out
          if (data.opacity < 0.1) {
            this.remove(key);
          }
        }
        // where we have just crossed the hypotenuse
        if (isOutsideAfter !== isOutsideBefore) {

          // explode wher applicable
          if (this.isExplosive) {
            this.explode(key, geom, position);
          }
          // else start fading out
          else {
            data.opacity = 1.0;
          }
        }
        // otherwise accelerate toward the attractor
        else if (attractor) {
          let acceleration = {
            lateral: this.acceleration * ACCELERATION_MODIFIER * (attractor.lateral - position.lateral),
            axial  : this.acceleration * ACCELERATION_MODIFIER * (attractor.axial - position.axial)
          };
          velocity.lateral += acceleration.lateral * dTime * geom.sine;
          velocity.axial += acceleration.axial * dTime * geom.cosine;
        }
      });
  }

  resolve() {

    // cache geometry from props
    let geom = this.memoGeometry(this.source, this.sink, this.size);

    // process all instances that are registered
    Object.keys(this.instanceMap)
      .forEach((key) => {

        let instance = this.instanceMap[key],
            data     = this.dataMap[key];

        let position = data.position,
            lateral  = {
              x: this.source[1].x * position.lateral + this.source[0].x * (1.0 - position.lateral),
              y: this.source[1].y * position.lateral + this.source[0].y * (1.0 - position.lateral)
            },
            axial    = {
              x: (this.sink[1].x - this.source[1].x) * position.axial,
              y: (this.sink[1].y - this.source[1].y) * position.axial
            },
            size     = Math.pow(2, data.sizeIndex - 1) * geom.length.unit;

        instance.setState({
          size    : size,
          position: {
            x: lateral.x + axial.x,
            y: lateral.y + axial.y
          },
          opacity : data.opacity || 1.0
        });
      });
  }

  remove(key) {
    delete this.nodeMap[key];
  }

  explode(key, geom, initialPosition) {

    // remove old particle
    this.remove(key);

    // add a spread of smaller particles (sizeIndex - 1)
    let sizeIndex = this.dataMap[key].sizeIndex;
    if (sizeIndex > 1) {

      let offset      = Math.pow(2, sizeIndex - 2) / 2 * geom.offset,
          coordinates = [
            {lateral: -geom.sine, axial: +geom.cosine},
            {lateral: -geom.sine, axial: -geom.cosine},
            {lateral: +geom.sine, axial: +geom.cosine},
            {lateral: +geom.sine, axial: -geom.cosine}
          ];

      coordinates
        .forEach((coordinate) => {

          let speed    = this.speed * SPEED_MODIFIER,
              position = {
                lateral: offset * coordinate.lateral * geom.cosine + initialPosition.lateral,
                axial  : offset * coordinate.axial * geom.sine + initialPosition.axial
              };

          this.create({
            sizeIndex: sizeIndex - 1,
            attractor: Object.assign({}, position),
            position : Object.assign({}, position),
            velocity : {
              lateral: speed * coordinate.lateral,
              axial  : speed * coordinate.axial
            }
          });
        })
    }
  }

  static getGeometry(source, sink, size) {
    let hypotenuse = lengthOf(sink),
        lateral    = lengthOf(source),
        axial      = Math.pow(Math.pow(hypotenuse, 2) - Math.pow(lateral, 2), 0.5),
        cosine     = lateral / hypotenuse,
        sine       = axial / hypotenuse,
        offset     = Math.min(cosine, sine) * size,
        unit       = offset * hypotenuse;

    return {
      cosine,
      sine,
      offset,
      length: {hypotenuse, lateral, axial, unit}
    };
  }
}