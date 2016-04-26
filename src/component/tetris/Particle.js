import React, { Component, PropTypes } from 'react';
import memoizee                        from 'memoizee';

import prop       from '../../decorator/prop';
import state      from '../../decorator/state';
import * as types from '../../react/prop-types';

import styles from './particle.scss';

export default class Particle extends Component {

  @prop(PropTypes.string.isRequired)
  key;

  @prop(types.colour.isRequired)
  colour;

  @prop(types.fraction, 1.0)
  opacity;

  @prop(PropTypes.func.isRequired)
  register;

  @prop(PropTypes.func.isRequired)
  unregister;

  @state(false)
  position;

  @state(false)
  size;

  componentDidMount() {
    this.register(this);
  }

  componentWillUnmount() {
    this.unregister(this);
  }

  render() {

    // where animating
    if (this.position && this.size) {
      var style = {
        left             : `${this.state.position.x}px`,
        top              : `${this.state.position.y}px`,
        width            : `${this.state.size}px`,
        height           : `${this.state.size}px`,
        marginLeft       : `-${this.state.size / 2}px`,
        marginTop        : `-${this.state.size / 2}px`,
        backgroundColor  : this.colour,
        backgroundOpacity: this.opacity
      };

      return (
        <div className={styles.main} style={style}></div>
      );
    }
    // where uninitialised
    else {
      return <div></div>;
    }
  }
}