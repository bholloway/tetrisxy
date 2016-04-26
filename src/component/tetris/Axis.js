import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';

import prop           from '../../decorator/prop';
import * as types     from '../../react/prop-types';
import closedPathData from '../../svg/closed-path-data';
import Particles      from './Particles';

import styles from './axis.scss';

export default class Axis extends Component {

  @prop(types.classes)
  className;

  @prop(PropTypes.string.isRequired)
  label;

  @prop(PropTypes.string)
  href;

  @prop(types.point.isRequired)
  size;

  @prop(PropTypes.number, 0)
  offset;

  @prop(PropTypes.bool.isRequired)
  isYnotX;

  @prop(types.colour.isRequired)
  colour;

  @prop(types.fraction, 1.0)
  opacity;

  componentWillMount() {
    this.memoGeometry = memoizee(Axis.getGeometry, {primitive: true, length: 4, max: 2});
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
  }

  render() {
    var classNames = [styles.main].concat(this.className).filter(Boolean).join(' '),
        geom       = this.memoGeometry(this.size.x, this.size.y, this.offset, this.isYnotX);

    return (
      <div className={classNames} style={{opacity: this.opacity}} onClick={this.onClick.bind(this)}>

        <Particles className={styles.particles} source={geom.source} sink={geom.sink}/>

        <svg className={styles.svg} viewBox={geom.viewBox} xmlns="http://www.w3.org/2000/svg">
          <path className={styles.path} fill={this.colour} d={geom.pathData}/>
        </svg>

        <a className={styles[`label${this.isYnotX ? 'Y' : 'X'}`]} href={this.href}>{this.label}</a>
      </div>
    );
  }

  onClick() {
    if (this.href) {
      window.location.href = this.href;
    }
  }

  static getGeometry(sizeX, sizeY, offset, isYnotX) {

    // offset distance adjacent to the line decomposed into x, y axes
    var angle = Math.atan2(sizeY, sizeX),
        delta = {
          x: offset / Math.sin(angle),
          y: offset / Math.cos(angle)
        };

    // line of emission and line of destruction
    //  the first item is the intersection
    var source = isYnotX ?
          [{x: sizeX, y: sizeY - delta.y}, {x: sizeX, y: 0}] :
          [{x: sizeX - delta.x, y: sizeY}, {x: 0, y: sizeY}],
        sink   = source.slice(0, 1).concat(isYnotX ? {x: delta.x, y: 0} : {x: 0, y: delta.y});

    // create a closed path formed by the emit and sink lines
    //  we also need a view box to stop it form scaling
    var viewBox  = [0, 0, sizeX, sizeY],
        pathData = closedPathData(source.concat(sink.map(reverse)));

    return {viewBox, pathData, source, sink};
  }
}

function reverse(v, i, array) {
  return array[array.length - 1 - i];
}
