import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';

import prop           from '../../decorator/prop';
import * as types     from '../../react/prop-types';
import closedPathData from '../../svg/closed-path-data';

import styles from './emitter.scss';

export default class Emitter extends Component {

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
    this.memoGeometry = memoizee(Emitter.getGeometry, {primitive: true, length: 4});
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
    this.memoGeometry = undefined;
  }

  render() {
    var classNames = [styles.main].concat(this.className).filter(Boolean).join(' '),
        geom       = this.memoGeometry(this.size.x, this.size.y, this.offset, this.isYnotX);

    return (
      <div className={classNames} style={{opacity: this.opacity}} onClick={this.onClick.bind(this)}>

        <svg className={styles.svg}
             viewBox={geom.viewBox}
             xmlns="http://www.w3.org/2000/svg">

          <path className={styles.path}
                fill={this.colour} d={geom.pathData}/>

        </svg>

        <a className={styles[`label${this.isYnotX ? 'Y' : 'X'}`]}
           href={this.href}>
          {this.label}
        </a>
      </div>
    );
  }

  static getGeometry(sizeX, sizeY, offset, isYnotX) {
    var viewBox  = [0, 0, sizeX, sizeY],
        angle    = Math.atan2(sizeY, sizeX),
        delta    = {
          x: offset / Math.sin(angle),
          y: offset / Math.cos(angle)
        },
        pathData = isYnotX ?
          closedPathData([delta.x, 0], [sizeX, 0], [sizeX, sizeY - delta.y], [delta.x, 0]) :
          closedPathData([0, delta.y], [0, sizeY], [sizeX - delta.x, sizeY], [0, delta.y]);

    return {viewBox, pathData};
  }

  onClick() {
    if (this.href) {
      window.location.href = this.href;
    }
  }
}
