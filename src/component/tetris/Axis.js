import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import onecolor                        from 'onecolor';

import prop           from '../../decorator/prop';
import closedPathData from '../../svg/closed-path-data';
import lengthOf       from '../../svg/length-of';
import * as types     from '../../react/prop-types';

import TriangleMask from '../container/TriangleMask';
import Particles    from './Particles';

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
    this.memoGeometry = memoizee(Axis.getGeometry, {primitive: true, length: 3, max: 2});
  }

  componentWillUnmount() {
    this.memoGeometry.clear();
  }

  render() {

    let classNames = [styles.main].concat(this.className)
      .filter(Boolean)
      .join(' ');

    let geom       = this.memoGeometry(this.size, this.offset, this.isYnotX),
        fillColour = onecolor(this.colour).hex(),
        bgColour   = onecolor(this.colour).alpha(-0.5, true).cssa();

    return (
      <div className={classNames} style={{opacity: this.opacity}} onClick={this.onClick.bind(this)}>

        <svg className={styles.svg} viewBox={geom.viewBox} xmlns="http://www.w3.org/2000/svg">
          <path className={styles.path} fill={fillColour} d={geom.pathData}/>
        </svg>

        <TriangleMask {...this.props}>
          <Particles className={styles.particles} colour={bgColour} size={0.05} speed={0.3} rate={0.15}
                     isExplosive={false} fps={30} source={geom.source} sink={geom.sink}/>
        </TriangleMask>

        <a className={styles[`label${this.isYnotX ? 'Y' : 'X'}`]} href={this.href}>{this.label}</a>

        <Particles className={styles.particles} colour={this.colour} size={0.012} speed={1.0} rate={0.2}
                   isExplosive={true} fps={80} source={geom.source} sink={geom.sink}/>
      </div>
    );
  }

  onClick() {
    if (this.href) {
      window.location.href = this.href;
    }
  }

  static getGeometry(size, offset, isYnotX) {

    // offset distance adjacent to the line decomposed into x, y axes
    let radians = Math.atan2(size.y, size.x),
        delta   = {
          x: offset / Math.sin(radians),
          y: offset / Math.cos(radians)
        };

    // line of emission and line of destruction
    //  the first item is the intersection
    let source = isYnotX ?
      [{x: size.x, y: size.y - delta.y}, {x: size.x, y: 0}] :
      [{x: size.x - delta.x, y: size.y}, {x: 0, y: size.y}];

    let sink = source.slice(0, 1).concat(isYnotX ? {x: delta.x, y: 0} : {x: 0, y: delta.y});

    // create a closed path formed by the emit and sink lines
    //  we also need a view box to stop it form scaling
    let viewBox  = [0, 0, size.x, size.y],
        pathData = closedPathData(source.concat(sink.map(reverse)));

    return {viewBox, pathData, source, sink};

    function reverse(v, i, array) {
      return array[array.length - 1 - i];
    }
  }
}
