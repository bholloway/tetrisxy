import React, { Component, PropTypes } from 'react';

import prop           from '../decorator/prop';
import * as types     from '../react/prop-types';
import closedPathData from '../svg/closed-path-data';

import styles from './emitter.scss';

export default class Emitter extends Component {

  @prop(types.classes)
  className;

  @prop(PropTypes.string.isRequired)
  title;

  @prop(types.fraction, 1.0)
  opacity;

  @prop(types.colour.isRequired)
  colour;

  @prop(PropTypes.bool.isRequired)
  isYnotX;

  @prop(types.point.isRequired)
  size;

  @prop(PropTypes.number, 0)
  offset;

  render() {
    var classNames = [styles.main].concat(this.className).filter(Boolean).join(' '),
        viewBox    = [0, 0, this.size.x, this.size.y],
        angle      = Math.atan2(this.size.y, this.size.x),
        delta      = {
          x: this.offset / Math.sin(angle),
          y: this.offset / Math.cos(angle)
        },
        pathData   = this.isYnotX ?
          closedPathData([delta.x, 0], [this.size.x, 0], [this.size.x, this.size.y - delta.y], [delta.x, 0]) :
          closedPathData([0, delta.y], [0, this.size.y], [this.size.x - delta.x, this.size.y], [0, delta.y]),
        spanStyle  = this.isYnotX ? {right: '20%', top: '20%'} : {left: '20%', bottom: '20%'};

    return (
      <div className={classNames} style={{opacity: this.opacity}}>

        <svg viewBox={viewBox} preserveAspectRatio="none"
             xmlns="http://www.w3.org/2000/svg">
          <path fill={this.colour} d={pathData}/>
        </svg>

        <span className={styles.title} style={spanStyle}>{this.title}</span>

      </div>
    );
  }
}
