import React    from 'react';
import memoizee from 'memoizee';

import rampDist from '../../math/ramp-distribution';
import lengthOf from '../../svg/length-of';

const SCALING = {
  SPEED       : 0.1,
  RATE        : 1.0,
  ACCELERATION: 3.0
};

/**
 * Create a concrete strategy for the opts to update() and resolve() animation of particles.
 *
 * @param {{isExplosive:boolean,source:Array,sink:Array,speed:number,acceleration:number,rate:number,fps:number}} opts
 * @param {object} nodes A hash that new nodes should be written to
 * @param {function(number, object):Component} particleFactory A factory methodto create a new particle
 * @returns {{update:update,resolve:resolve}} A concrete strategy
 */
export default function particlesStrategy(opts, nodes, particleFactory) {

  let memoGeometry    = memoizee(getGeometry, {primitive: true, length: 3, max: 2}),
      lastTime        = NaN,
      meanFramePeriod = 0.1,
      quantity        = 0.0,
      nextKey         = 0,
      instanceMap     = {},
      dataMap         = {};

  // strategy methods
  return {update, resolve};

  /**
   * Update the physical model by creating new particles and moving current ones.
   * Work with proportional coordinates
   * @param timestamp
   * @returns {boolean}
   */
  function update(timestamp) {

    // find the time delta since the last update
    let dTime = Math.min(meanFramePeriod * 5, (timestamp - lastTime) / 1000);

    // limit the frame rate
    var willUpdate = (dTime >= 1 / opts.fps);

    // update the timestamp on startup and on update
    if (isNaN(lastTime) || willUpdate) {
      lastTime = timestamp;
    }

    // rate limited update
    if (willUpdate) {

      // simply IIR filter for average frame period
      meanFramePeriod = meanFramePeriod * 0.95 + dTime * 0.05;

      // create new list
      //  for a smooth result we need to track fractional value
      //  but obviously we can only create whole numbers
      for (quantity += dTime * opts.rate * SCALING.RATE; quantity >= 1; quantity--) {
        create();
      }

      // update each particle in proportional terms
      physics(dTime);
    }

    // indicate whether update occurred
    return willUpdate;
  }

  function resolve() {

    // cache geometry from props
    let geom = memoGeometry(opts.source, opts.sink, opts.size);

    // process all instances that are registered
    Object.keys(instanceMap)
      .forEach((key) => {

        let instance = instanceMap[key],
            data     = dataMap[key];

        let position = data.position,
            lateral  = {
              x: opts.source[1].x * position.lateral + opts.source[0].x * (1.0 - position.lateral),
              y: opts.source[1].y * position.lateral + opts.source[0].y * (1.0 - position.lateral)
            },
            axial    = {
              x: (opts.sink[1].x - opts.source[1].x) * position.axial,
              y: (opts.sink[1].y - opts.source[1].y) * position.axial
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

  function create(initialConditions) {

    // assign data for this particle
    //  do so before it registers in-case we are preloading the animation
    let key  = `particle${nextKey++}`,
        data = Object.assign({
          sizeIndex: 2 + (Math.random() < 0.5),
          opacity  : NaN,
          attractor: null,
          position : {
            lateral: rampDist(),
            axial  : 0.0
          },
          velocity : {
            lateral: 0.0,
            axial  : opts.speed * SCALING.SPEED
          }
        }, initialConditions);

    dataMap[key] = data;

    // apply data updates once the particle registers
    const register = (instance) => {
      instanceMap[key] = instance;
    };

    // cease data updates once the particle unregisters
    const unregister = () => {
      delete dataMap[key];
      delete instanceMap[key];
    };

    // create particle
    nodes[key] = particleFactory(data.sizeIndex, {register, unregister});
  }

  function physics(dTime) {

    // cache geometry from props
    let geom = memoGeometry(opts.source, opts.sink, opts.size);

    // process all data, event if the instance is not yet registered
    Object.keys(dataMap)
      .forEach((key) => {

        let data      = dataMap[key],
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
            remove(key);
          }
        }
        // where we have just crossed the hypotenuse
        if (isOutsideAfter !== isOutsideBefore) {

          // explode wher applicable
          if (opts.isExplosive) {
            explode(key, geom, position);
          }
          // else start fading out
          else {
            data.opacity = 1.0;
          }
        }
        // otherwise accelerate toward the attractor
        else if (attractor) {
          let acceleration = {
            lateral: opts.acceleration * SCALING.ACCELERATION * (attractor.lateral - position.lateral),
            axial  : opts.acceleration * SCALING.ACCELERATION * (attractor.axial - position.axial)
          };
          velocity.lateral += acceleration.lateral * dTime * geom.sine;
          velocity.axial += acceleration.axial * dTime * geom.cosine;
        }
      });
  }

  function remove(key) {
    delete nodes[key];
  }

  function explode(key, geom, initialPosition) {

    // remove old particle
    remove(key);

    // add a spread of smaller particles (sizeIndex - 1)
    let sizeIndex = dataMap[key].sizeIndex;
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

          let position = {
            lateral: offset * coordinate.lateral * geom.cosine + initialPosition.lateral,
            axial  : offset * coordinate.axial * geom.sine + initialPosition.axial
          };

          create({
            sizeIndex: sizeIndex - 1,
            attractor: Object.assign({}, position),
            position : Object.assign({}, position),
            velocity : {
              lateral: opts.speed * SCALING.SPEED * coordinate.lateral,
              axial  : opts.speed * SCALING.SPEED * coordinate.axial
            }
          });
        })
    }
  }
}

function getGeometry(source, sink, size) {
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