import React, { Component } from 'react';

import { Link } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import stateful from '../stateful'

import {title, smallButton, bigButton, input} from '../styles'

const SignUp = ({username, password, pw2, loading, error, set, onSwitch, onCreate}) => (
  <div className={css(styles.SignUp)}>
    <div className={css(styles.signUpTitle)}>
      Sign Up
    </div>
    {error && <span>{error}</span>}
    <input
      placeholder='Email address'
      className={css(styles.input)}
      value={username}
      onChange={e => set('username', e.target.value)}
    />
    <input
      placeholder='Password'
      className={css(styles.input)}
      value={password}
      type="password"
      onChange={e => set('password', e.target.value)}
    />
    <input
      placeholder='Confirm Password'
      className={css(styles.input)}
      value={pw2}
      type="password"
      onChange={e => set('pw2', e.target.value)}
    />
    {loading ?
      'Loading...'
      :
    <button className={css(styles.createAccountButton)} onClick={() => {
      if (password !== pw2) {
        set('error', "Passwords don't match")
      } else {
        onCreate(username, password, pw2)
        .catch(
          err => set('error', 'Unable to sign up: ' + err.message)
        )
      }
    }}>
      Create account
    </button>}
    <button className={css(styles.switchToSignIn)} onClick={onSwitch}>
      Sign in
    </button>
  </div>
)

const SignUp$ = stateful({
  username: '',
  password: '',
  pw2: '',
  loading: false,
  error: null,
}, SignUp);

export default SignUp$

const styles = StyleSheet.create({
  signUpTitle: {
    ...title,
  },


  createAccountButton: {
    ...bigButton,
  },

  switchToSignIn: {
    ...smallButton,
  },

  input,
});



/** WEBPACK FOOTER **
 ** ./src/login/SignUp.js
 **/