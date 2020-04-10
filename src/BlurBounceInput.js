import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import {input, button, bigButton} from './styles'
import stateful from './stateful'
import TimePicker from './TimePicker'


export default class BlurBounceInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: props.initial,
      dirty: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initial !== this.props.initial && nextProps.initial !== this.state.text) {
      this.setState({text: nextProps.initial})
    }
  }

  save() {
    if (!this.state.dirty) return
    clearTimeout(this._ti)
    this.props.onChange(this.state.text)
    this.setState({dirty: false})
  }

  onChange(text) {
    this.setState({
      text,
      dirty: this.state.dirty || this.state.text !== text,
    })
    this._ti = setTimeout(() => this.save(), 100)
  }

  render() {
    return (
      <input
      className={this.props.className}
        value={this.state.text}
        onChange={e => this.onChange(e.target.value)}
        onBlur={() => this.save()}
      />
    )
  }
}




/** WEBPACK FOOTER **
 ** ./src/BlurBounceInput.js
 **/