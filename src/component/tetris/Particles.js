import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import createFragment                  from 'react-addons-create-fragment';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import * as types from '../../react/prop-types';

import Particle from './Particle';

import styles from './particles.scss';

export default class Particles extends Component {

  @prop(PropTypes.arrayOf(types.point).isRequired)
  source;

  @prop(PropTypes.arrayOf(types.point).isRequired)
  sink;

  @state(NaN)
  timestamp;

  componentWillMount() {
    this.memoGeometry = memoizee(Particles.getGeometry, {primitive: true, length: 2, max: 2});
    this.hash = {};
    this.list = [];
    this.nextKey = 0;
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
      let dTime = (timestamp - this.timestamp) / 1000 || 0.0;
      this.setState({timestamp});

      // cache geometry from props
      let geom = this.memoGeometry(this.source, this.sink);

      // create new list
      //  for a smooth result we need to track fractional figures
      this.quantity = this.quantity + dTime * geom.density;
      while (this.quantity >= 1) {
        this.create();
        this.quantity--;
      }

      // update each particle in proportional terms
      this.physics(dTime);

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

  physics(dTime) {

    // loop invariant to allow deletions at cursor and additions to tail
    this.list
      .reduceRight((reduced, instance, index) => {

        let data     = instance.data,
            position = data.position,
            velocity = data.velocity;

        // update position
        position.medial += velocity.medial * dTime;
        position.lateral += velocity.lateral * dTime;

        // explode where overshot the triangular bound
        //  reflect excess medial position
        let overshoot = position.medial - position.lateral;
        if (overshoot >= 0) {
          this.explode(index, {
            medial : position.medial,
            lateral: -overshoot
          });
        }
        // otherwise accelerate
        else {
          velocity.medial += Math.max(0.0, (position.lateral - 0.9) * 10);
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
            medial   = {
              x: (this.sink[0].x - this.source[0].x) * position.medial,
              y: (this.sink[0].y - this.source[0].y) * position.medial
            },
            size     = data.size * geom.length / 100;

        instance.setState({
          size    : size,
          position: {
            x: lateral.x + medial.x,
            y: lateral.y + medial.y
          }
        });
      });
  }

  explode(index, initialPosition) {
    var instance = this.list.splice(index, 1).pop();
    delete this.hash[instance.key];
// TODO create additional list
  }

  create(initialConditions) {

    let createKey = (index) => {
      index = index || this.nextKey++;
      return ('________' + index.toString(32)).slice(-8);
    };

    let register = (instance) => {
      instance.data = Object.assign({
        size    : 3,
        position: {
          lateral: Particles.triangularDistribution(),
          medial : 0.0
        },
        velocity: {
          lateral: 0.0,
          medial : 0.25
        }
      }, initialConditions);

      this.list.push(instance);
    };

    let unregister = (instance) => {
      var index = this.list.indexOf(instance);
      this.list.splice(index, 1);
    };

    let key       = createKey(),
        component = (<Particle key={key} colour="red" register={register} unregister={unregister} opacity={0.5}/>);

    this.hash[key] = component;
  }

  static triangularDistribution() {

    // take n=2 irwin hall distribution and make a single-sided triangular distribution with mean 1.0
    //  https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution
    return 1.0 - Math.abs(Math.random() + Math.random() - 1.0);
  }

  static getGeometry(source, sink) {
    let length  = lengthOf(sink),
        density = lengthOf(source) / length;

    return {density, length};

    function lengthOf(points) {
      return Math.pow(
        Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2),
        0.5
      );
    }
  }
}