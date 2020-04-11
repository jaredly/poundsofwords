import React, { Component } from 'react';

import { Link, browserHistory } from 'react-router';
import { StyleSheet, css } from 'aphrodite';

import { input, button, bigButton } from './styles';
import stateful from './stateful';

const Settings = ({ loading, error, newpw, newpw2, set }) => {
    const go = () => {
        if (newpw !== newpw2) {
            set({ error: 'Passwords must match' });
            return;
        }
        if (newpw.length < 8) {
            set({ error: 'Password must be at least 8 characters' });
            return;
        }
        set({
            newpw: '',
            newpw2: '',
            loading: true,
            error: '',
        });
        // Kinvey.User.update({
        //   ...Kinvey.getActiveUser(),
        //   password: newpw,
        // }).then(
        // () => set({loading: false, error: ''}),
        //   err => set({loading: false, error: 'Unable to update'}), // umm ?
        // )
    };
    return (
        <div className={css(styles.container)}>
            <div className={css(styles.title)}>Change password</div>
            <input
                placeholder="New Password"
                type="password"
                value={newpw}
                className={css(styles.input)}
                onKeyDown={(e) => e.keyCode === 13 && go()}
                onChange={(e) => set('newpw', e.target.value)}
            />
            <input
                placeholder="Confirm new password"
                type="password"
                value={newpw2}
                className={css(styles.input)}
                onKeyDown={(e) => e.keyCode === 13 && go()}
                onChange={(e) => set('newpw2', e.target.value)}
            />
            {error && <div className={css(styles.error)}>{error}</div>}
            {loading ? (
                'Saving...'
            ) : (
                <button className={css(styles.button)} onClick={go}>
                    Change password
                </button>
            )}
        </div>
    );
};

export default stateful(
    {
        loading: false,
        newpd: '',
        newpw2: '',
        error: '',
    },
    Settings,
);

const styles = StyleSheet.create({
    container: {
        width: 400,
        margin: 50,
        alignSelf: 'center',
        alignItems: 'center',
    },

    title: {
        marginBottom: 10,
        fontSize: 20,
    },

    error: {
        color: 'red',
        marginBottom: 10,
    },

    input: {
        ...input,
    },

    button: {
        ...bigButton,
        border: '1px solid #eee',
        cursor: 'pointer',
        padding: '10px 20px',
    },
});

/** WEBPACK FOOTER **
 ** ./src/Settings.js
 **/
