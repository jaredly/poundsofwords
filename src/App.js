import React, { Component } from 'react';
import Home from './Home';
import Editor from './Editor'
import LoggedOutView from './login/LoginPage'

import { IndexRoute, Router, Route, Link, browserHistory } from 'react-router'
import { StyleSheet, css } from 'aphrodite';
import config from '../config'
import Settings from './Settings';

const Base = ({location, user, onLogout, children}) => (
  <div style={{flex: 1}}>
    <div className={css(styles.floatingButtons)}>
      <div
        className={css(styles.userName)}
      >
        {user.username}
      </div>
      {location.pathname === '/settings/' ?
        <div
          onClick={() => browserHistory.push('/')}
          className={css(styles.settings)}
        >
          Home
        </div> :
        <div
          onClick={() => {
            browserHistory.push('/settings/');
          }}
          className={css(styles.settings)}
        >
          Settings
        </div>}
      <div
        onClick={() => {
          Kinvey.User.logout()
          onLogout()
        }}
        className={css(styles.logOut)}
      >
        Sign out
      </div>
    </div>
    {children}
  </div>
);

const waitForKinvey = (cb) => {
  if (window.Kinvey) return cb()
  const iv = setInterval(() => {
    if (!window.Kinvey) return
    clearInterval(iv)
    cb();
  }, 100);
}

const kinveyLoad = () => {
  return new Promise((res, rej) => {
    waitForKinvey(() => {
      window.Kinvey.init({
        appKey: config.appKey,
        appSecret: config.appSecret,
      }).then(res, rej);
    });
  });
}

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      loading: true,
    }
  }

  componentWillMount() {
    kinveyLoad().then(user => {
      console.log('user', user);
      this.setState({user, loading: false})
    });
  }

  onLogout() {
    this.setState({user: null})
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    if (!this.state.user) {
      return <LoggedOutView
        gotUser={user => this.setState({user})}
      />
    }

    return (
      <div style={{flex: 1, overflow: 'auto'}}>
        <Router history={browserHistory}>
          <Route path="/" component={
            props => <Base
              user={this.state.user}
              onLogout={() => this.onLogout()}
              {...props}
            />
          }>
            <IndexRoute component={
              props => <Home user={this.state.user} {...props}/>
            }/>
            <Route
              path="/settings/"
              component={Settings}
            />
            <Route
              path="/edit/:id/:name"
              component={Editor}
            />
          </Route>
        </Router>
      </div>
    );
  }
}

// <Route
//    path="/folder/:name"
//    component={Folder}

const button = {
    padding: '10px 15px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#eee',
    },
}

const styles = StyleSheet.create({
  floatingButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  logOut: {
    ...button,
  },
  settings: {
    ...button,
  },
  userName: {
    padding: '10px 5px',
  }
});



/** WEBPACK FOOTER **
 ** ./src/App.js
 **/