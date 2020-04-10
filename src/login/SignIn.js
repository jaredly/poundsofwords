import React, { Component } from 'react';

import { Link } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import stateful from '../stateful'

import {title, smallButton, bigButton, input} from '../styles'

const SignIn = ({username, password, error, loading, set, onSwitch, onSignIn}) => {
  const go = () => {
    set('loading', true)
    set('error', null)
    onSignIn(username, password)
    .catch(err => {
      console.log('fail', err)
      set('error', err)
      set('loading', false)
    })
  }
  return (
    <div className={css(styles.SignIn)}>
      <div className={css(styles.signInTitle)}>
        Sign In
      </div>
      {error && <span>{error.description}</span>}
      <input
        placeholder="Email address"
        className={css(styles.input)}
        value={username}
        onChange={e => set('username', e.target.value)}/>
      <input
        placeholder="Password"
        className={css(styles.input)}
        value={password}
        type="password"
        onKeyDown={e => e.keyCode === 13 && go()}
        onChange={e => set('password', e.target.value)}/>
      <button className={css(styles.signInButton)} onClick={() => go()}>
        Sign in
      </button>
      <button className={css(styles.switchToSignUp)} onClick={onSwitch}>
        Create new account
      </button>
    </div>
  )
}

const SignIn$ = stateful({
  username: '',
  password: '',
  loading: false,
  error: null,
}, SignIn);

export default SignIn$

const styles = StyleSheet.create({

  SignIn: {
  },

  signInTitle: {
    ...title,
  },

  signInButton: {
    ...bigButton,
  },

  switchToSignUp: {
    ...smallButton,
  },

  input,
})



/** WEBPACK FOOTER **
 ** ./src/login/SignIn.js
 **/