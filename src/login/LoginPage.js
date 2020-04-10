import React, { Component } from 'react';

import { Link } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import { button } from '../styles'
import stateful from '../stateful'
import SignUp$ from './SignUp'
import SignIn$ from './SignIn'

const LoginPage = ({signUp, loading, set, gotUser}) => (
  <div className={css(styles.LoginPage)}>
    {signUp ?
      <SignUp$
        onSwitch={() => set('signUp', false)}
        onCreate={(username, password) => {
          return Kinvey.User.signup({
            username,
            password,
          }).then(user => {
            gotUser(user)
          })
        }}
      /> :
      <SignIn$
        onSwitch={() => set('signUp', true)}
        onSignIn={(username, password) => {
          return Kinvey.User.login(username, password)
            .then(gotUser)
        }}
      />}
  </div>
)

const LoginPage$ = stateful({signUp: false, loading: false}, LoginPage);

export default LoginPage$

const styles = StyleSheet.create({
  LoginPage: {
    padding: 50,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    width: 400,
  },
});



/** WEBPACK FOOTER **
 ** ./src/login/LoginPage.js
 **/