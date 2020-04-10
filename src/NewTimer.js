
import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import {input, button, bigButton} from './styles'
import TimePicker from './TimePicker'

const Buttons = ({options, onChange, selected}) => (
  <div className={css(styles.buttonGroup)}>
    {options.map(option => (
      <div
        className={css(
          styles.buttonOption,
          option[1] === selected && styles.buttonOptionSelected
        )}
        onClick={() => onChange(option[1])}
        key={option[1]}
      >
      {option[0]}
      </div>
    ))}
  </div>
)

export default ({time, speed, saveEntry, onStart}) => (
  <div className={css(styles.startNewSection)}>
    <div className={css(styles.startNewTitle)}>
      Want to start a new timer?
    </div>
    <div className={css(styles.startNewBottom)}>
      <div
        className={css(styles.startNewPickers)}
      >
        <TimePicker
          value={time}
          onChange={time => saveEntry({time})}
        />
        <Buttons
          selected={speed}
          options={[
            ['Take it easy', 'easy'],
            ['Normal', 'normal'],
            ['Speedy', 'speedy'],
          ]}
          onChange={speed => saveEntry({speed})}
        />
      </div>
      <button
        className={css(styles.letsGo)}
        onClick={onStart}
      >
        Set Timer
      </button>
    </div>
  </div>
)

const styles = StyleSheet.create({

  // new entry buttons

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonOption: {
    borderBottom: '5px solid transparent',
    padding: '10px 5px 5px',
    cursor: 'pointer',
    ':hover': {
      borderBottomColor: '#ddd',
    },
  },

  buttonOptionSelected: {
    borderBottomColor: '#aaa',
    // backgroundColor: '#ddd',
  },

  startNewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  startNewSection: {
    marginBottom: 20,
    marginTop: 10,
  },

  letsGo: {
    ...bigButton,
    marginBottom: 0,
    alignSelf: 'center',
    marginLeft: 30,
  },

  startNewBottom: {
    flexDirection: 'row',

  },
})



/** WEBPACK FOOTER **
 ** ./src/NewTimer.js
 **/