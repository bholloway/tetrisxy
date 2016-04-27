import React, { Component, PropTypes } from 'react';
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

  @state(false)
  position;

  @state(false)
  size;

  componentWillMount() {
    this.borderColour = onecolor(this.colour).value(-0.05, true).hex();
    this.backgroundColour = onecolor(this.colour).value(+0.2, true).alpha(0.5).hex();
  }

  componentDidMount() {
    this.register(this);
  }

  componentWillUnmount() {
    this.unregister(this);
  }

  render() {

    // where animating
    if (this.position && this.size) {

      let classNames = [styles.main].concat(styles[this.className]).filter(Boolean).join(' '),
          style      = {
            left           : `${this.state.position.x}px`,
            top            : `${this.state.position.y}px`,
            width          : `${this.state.size}px`,
            height         : `${this.state.size}px`,
            marginLeft     : `-${this.state.size / 2}px`,
            marginTop      : `-${this.state.size / 2}px`,
            backgroundColor: this.backgroundColour,
            borderColor    : this.borderColour
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
}