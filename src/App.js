import React, { Component } from 'react';
import Home from './Home';
import Editor from './Editor';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';
import config from '../config';
import Settings from './Settings';
import * as firebase from 'firebase/app';

export default class App extends Component {
    onLogout() {
        this.props.auth.signOut();
        window.location.reload();
    }

    render() {
        const { user } = this.props;
        return (
            <div style={{ flex: 1, overflow: 'auto' }}>
                <Router>
                    <div style={{ flex: 1 }}>
                        <div className={css(styles.floatingButtons)}>
                            <div className={css(styles.userName)}>
                                {user.username}
                            </div>
                            <Switch>
                                <Route path="/settings/">
                                    <Link
                                        to="/"
                                        className={css(styles.settings)}
                                    >
                                        Home
                                    </Link>
                                </Route>
                                <Route path="/">
                                    <Link
                                        to="/settings/"
                                        className={css(styles.settings)}
                                    >
                                        Settings
                                    </Link>
                                </Route>
                            </Switch>
                            <div
                                onClick={() => {
                                    firebase.auth().signOut();
                                    this.onLogout();
                                }}
                                className={css(styles.logOut)}
                            >
                                Sign out
                            </div>
                        </div>
                        <Switch>
                            <Route path="/settings/" component={Settings} />
                            <Route
                                path="/edit/:id/:name"
                                component={(props) => (
                                    <Editor
                                        {...props}
                                        db={this.props.db}
                                        user={this.props.user}
                                    />
                                )}
                            />
                            <Route
                                path="/"
                                component={(props) => (
                                    <Home
                                        user={this.props.user}
                                        db={this.props.db}
                                        {...props}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
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
};

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
    },
});

/** WEBPACK FOOTER **
 ** ./src/App.js
 **/
