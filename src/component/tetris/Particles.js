import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import createFragment                  from 'react-addons-create-fragment';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import * as types from '../../react/prop-types';

import Particle from './Particle';

import styles from './particles.scss';

const SPEED_MODIFIER = 0.1,
      RATE_MODIFIER  = 1.0;

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

  @prop(PropTypes.number, 2.0)
  acceleration;

  @prop(PropTypes.number, 1.0)
  rate;

  @state(NaN)
  timestamp;

  componentWillMount() {
    this.memoGeometry = memoizee(Particles.getGeometry, {primitive: true, length: 3, max: 2});
    this.hash = {};
    this.list = [];
    this.nextKey = 0;
    this.avgFrame = 0.1;
  }

  componentDidMount() {
    this.quantity = 0.0;
    this.animate();
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
    this.hash = this.list = undefined;
  }

  animate(timestamp) {

    // until unmounted
    if (this.hash) {

      // update the state to trigger redraw
      //  add frame rate limiting for when the browser reactivates from being inactive
      let dTime = Math.min(this.avgFrame * 5, (timestamp - this.timestamp) / 1000 || 0.0);
      this.avgFrame = this.avgFrame * 0.9 + dTime * 0.1;
      this.setState({timestamp});

      // cache geometry from props
      let geom = this.memoGeometry(this.source, this.sink, this.size);

      // create new list
      //  for a smooth result we need to track fractional figures
      this.quantity = this.quantity + dTime * this.rate * RATE_MODIFIER;
      while (this.quantity >= 1) {
        this.create();
        this.quantity--;
      }

      // update each particle in proportional terms
      //  adjust for the aspect
      this.physics(geom, dTime);

      // update each particle position by appluing proportional terms to geometry
      this.resolve(geom);

      // call again
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }

  render() {
    return (
      <div className={styles.main}>
        {createFragment(this.hash)}
      </div>
    );
  }

  physics(geom, dTime) {

    // loop invariant to allow deletions at cursor and additions to tail
    this.list
      .reduceRight((reduced, instance) => {

        let data      = instance.data,
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

        // explode where we have crossed the hypotenuse
        if (isOutsideAfter !== isOutsideBefore) {
          this.explode(instance, geom, position);
        }
        // otherwise accelerate broken particles toward the hypotenuse
        else if (attractor) {
          let acceleration = {
            lateral: this.acceleration * (attractor.lateral - position.lateral),
            axial  : this.acceleration * (attractor.axial - position.axial)
          };
          velocity.lateral += acceleration.lateral * dTime * geom.sine;
          velocity.axial += acceleration.axial * dTime * geom.cosine;
        }
      }, null);
  }

  resolve(geom) {

    // doesn't need to be loop invariant as there are no mutations
    this.list
      .forEach((instance) => {

        let data = instance.data;

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
          }
        });
      });
  }

  explode(instance, geom, initialPosition) {

    // always remove old particle
    delete this.hash[instance.uid];

    // where explosive
    if (this.isExplosive) {

      // add a spread of smaller particles (sizeIndex - 1)
      let sizeIndex = instance.data.sizeIndex;
      if (sizeIndex > 1) {

        let offset      = Math.pow(2, sizeIndex - 2) / 2 * geom.offset,
            coordinates = [
              {lateral: -geom.sine, axial: +geom.cosine},
              {lateral: -geom.sine, axial: -geom.cosine},
              {lateral: +geom.sine, axial: +geom.cosine},
              {lateral: +geom.sine, axial: -geom.cosine}
            ];

        coordinates.forEach((coordinate) => {

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
  }

  create(initialConditions) {

    let key   = `particle${this.nextKey++}`,
        speed = this.speed * SPEED_MODIFIER,
        data  = Object.assign({
          sizeIndex: 2 + (Math.random() < 0.5),
          attractor: null,
          position : {
            lateral: Particles.triangularDistribution(),
            axial  : 0.0
          },
          velocity : {
            lateral: 0.0,
            axial  : speed
          }
        }, initialConditions);

    const register = (instance) => {
      instance.data = data;
      this.list.push(instance);
    };

    const unregister = (instance) => {
      let index = this.list.indexOf(instance);
      this.list.splice(index, 1);
    };

    // create particle
    this.hash[key] = (
      <Particle uid={key} className={`size${data.sizeIndex}`} colour={this.colour} isExplosive={this.isExplosive}
                register={register} unregister={unregister}/>
    );
  }

  static triangularDistribution() {

    // take n=2 irwin hall distribution and make a single-sided triangular distribution with mean 1.0
    //  https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution
    return 1.0 - Math.abs(Math.random() + Math.random() - 1.0);
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

    function lengthOf(points) {
      return Math.pow(
        Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2),
        0.5
      );
    }
  }
}