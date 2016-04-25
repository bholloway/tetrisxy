import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';

import prop           from '../../decorator/prop';
import * as types     from '../../react/prop-types';
import closedPathData from '../../svg/closed-path-data';

import styles from './slash.scss';

export default class Slash extends Component {


  @prop(types.classes)
  className;

  @prop(types.point.isRequired)
  size;

  @prop(PropTypes.number)
  lineWidth;

  @prop(types.fraction, 1.0)
  progress;

  @prop(types.colour.isRequired)
  colour;

  @prop(types.fraction, 1.0)
  opacity;

  componentWillMount() {
    this.memoGeometry = memoizee(Slash.getGeometry, {primitive: true, length: 4});
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
    this.memoGeometry = undefined;
  }

  render() {

    // no progress implies empty
    if (this.progress === 0) {
      return <svg/>;
    }
    // progress implies partial display about the centroid
    else {
      var classNames = [styles.main].concat(this.className).filter(Boolean).join(' '),
          geom       = this.memoGeometry(this.size.x, this.size.y, this.lineWidth, this.progress);

      return (
        <svg className={classNames} style={{opacity: this.opacity}} viewBox={geom.viewBox}
             xmlns="http://www.w3.org/2000/svg">

          {/* diagonal line path */}
          <path fill={this.colour} d={geom.pathData}/>

          {/* circular line endings */}
          <circle fill={this.colour} cx={geom.limits.left} cy={geom.limits.top} r={geom.radius}/>
          <circle fill={this.colour} cx={geom.limits.right} cy={geom.limits.bottom} r={geom.radius}/>

        </svg>
      );
    }
  }

  static getGeometry(sizeX, sizeY, lineWidth, progress) {
    var viewBox  = [0, 0, sizeX, sizeY],
        centroid = {
          x: sizeX / 2,
          y: sizeY / 2
        },
        limits   = {
          left  : centroid.x - centroid.x * progress,
          top   : centroid.y - centroid.y * progress,
          right : centroid.x + centroid.x * progress,
          bottom: centroid.y + centroid.y * progress
        },
        radius   = lineWidth / 2,
        angle    = Math.atan2(sizeY, sizeX),
        delta    = {
          x: radius * Math.sin(angle),
          y: radius * Math.cos(angle)
        },
        pathData = closedPathData(
          [limits.left + delta.x, limits.top - delta.y],
          [limits.right + delta.x, limits.bottom - delta.y],
          [limits.right - delta.x, limits.bottom + delta.y],
          [limits.left - delta.x, limits.top + delta.y],
          [limits.left + delta.x, limits.top - delta.y]
        );

    return {viewBox, limits, radius, pathData}
  }
}
