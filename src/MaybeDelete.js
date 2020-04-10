
import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import {input, button, bigButton} from './styles'
import stateful from './stateful'


const MaybeDelete = ({really, set, onDelete}) => (
  really ?
    <div
      className={css(styles.container)}
    >
      <button className={css(styles.neverMind)} onClick={() => set({really: false})}>
        Nevermind
      </button>
      <button className={css(styles.deleteButton)} onClick={onDelete}>
        Really delete
      </button>
    </div> :
    <div
      className={css(styles.container)}
    >
      <button className={css(styles.deleteButton)} onClick={() => set({really: true})}>
        Delete entry
      </button>
    </div>
)

const MaybeDelete$ = stateful({really: false}, MaybeDelete);

export default MaybeDelete$

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  deleteButton: {
    ...button,
    backgroundColor: '#faa',
    border: 'none',
    borderRadius: 2,

    ':hover': {
      backgroundColor: '#f77',
    },
  },

  neverMind: {
    ...button,
    borderRadius: 2,
    border: 'none',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
})



/** WEBPACK FOOTER **
 ** ./src/MaybeDelete.js
 **/