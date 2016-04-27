import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';
import onecolor                        from 'onecolor';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import * as types from '../../react/prop-types';

import styles from './particle.scss';

export default class Particle extends Component {

  @prop(PropTypes.string.isRequired)
  uid;

  @prop(types.classes)
  className;

  @prop(types.colour.isRequired)
  colour;

  @prop(PropTypes.func.isRequired)
  register;

  @prop(PropTypes.func.isRequired)
  unregister;

  @prop(PropTypes.bool.isRequired)
  isExplosive;

  @state(false)
  position;

  @state(false)
  size;

  @state(1.0)
  opacity;

  componentDidMount() {
    this.memoColours = memoizee(Particle.getColours, {primitive: true, length: 1, max: 2});
    this.register(this);
  }

  componentWillUnmount() {
    this.memoColours.clear();
    this.unregister(this);
  }

  render() {

    // where animating
    if (this.position && this.size) {

      let classNames = [styles.main].concat(this.className).concat(this.isExplosive && styles.explosive)
        .filter(Boolean)
        .join(' ');

      let colours = this.memoColours(this.colour);

      let state    = this.state,
          position = state.position,
          size     = state.size;

      let style = {
        left           : `${position.x}px`,
        top            : `${position.y}px`,
        width          : `${size}px`,
        height         : `${size}px`,
        marginLeft     : `-${size / 2}px`,
        marginTop      : `-${size / 2}px`,
        backgroundColor: colours.background,
        borderColor    : colours.border,
        opacity        : this.opacity
      };

      return (
        <div className={classNames} style={style}></div>
      );
    }
    // where uninitialised
    else {
      return <div></div>;
    }
  }

  static getColours(colour) {
    let border     = onecolor(colour).value(-0.15, true).cssa(),
        background = onecolor(colour).value(+0.15, true).alpha(-0.2, true).cssa();

    return {border, background};
  }
}