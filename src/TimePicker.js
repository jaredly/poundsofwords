import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';

import {input, button, bigButton} from './styles'


const TimePicker = ({value, onChange}) => (
  <div
    className={css(styles.timePicker)}
  >
    <input
      value={value}
      className={css(styles.customNum)}
      onChange={e => {
        let val = parseInt(e.target.value)
        if (!isNaN(val)) {
          onChange(val)
        }
      }}
      type="number"
    />
    {[1,3,5,10].map(n => (
      <div
        key={n}
        onClick={() => onChange(n)}
        className={css(
          styles.numChoice,
          value == n && styles.selected
        )}
      >
        {n}min
      </div>
    ))}
  </div>
)

export default TimePicker

const styles = StyleSheet.create({

  timePicker: {
    flexDirection: 'row',
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  customNum: {
    width: 55,
    fontSize: 16,
    textAlign: 'center',
    marginRight: 10,
    padding: '10px 10px',
    boxSizing: 'border-box',
  },

  numChoice: {
    borderBottom: '5px solid transparent',
    padding: '10px 5px 5px',
    cursor: 'pointer',
    ':hover': {
      borderBottomColor: '#ddd',
    },
  },

  selected: {
    borderBottomColor: '#aaa',
  },
})



/** WEBPACK FOOTER **
 ** ./src/TimePicker.js
 **/