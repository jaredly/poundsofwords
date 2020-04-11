import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebaseui';

import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const rootEl = document.getElementById('root');

const firebaseConfig = require('../config.js');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.firebase = firebase;

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('loader').style.display = 'none';
        runApp(user);
    } else {
        rootEl.innerHTML = '';
        document.getElementById('loader').style.display = 'block';
        doLogin();
    }
});

const runApp = () => {
    console.log('render');
    ReactDOM.render(
        <AppContainer>
            <App
                user={auth.currentUser}
                auth={auth}
                db={firebase.firestore()}
            />
        </AppContainer>,
        rootEl,
    );
};

const doLogin = () => {
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(auth);

    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                runApp();

                return false;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            },
        },
        signInOptions: [
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: false,
            },
        ],
    };

    // if (ui.isPendingRedirect()) {
    ui.start('#firebaseui-auth-container', uiConfig);
    // }
};

// ui.start('#firebaseui-auth-container', uiConfig);

/** WEBPACK FOOTER **
 ** ./src/index.js
 **/
