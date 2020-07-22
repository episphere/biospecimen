import { homeNavBar } from "./../navbar.js";

export const signIn = () => {
    const root = document.getElementById('contentBody');
    if(!root) return;
    root.innerHTML = '';
    const signInDiv = document.createElement('div');
    signInDiv.id = 'signInDiv';
    signInDiv.className = 'row';
    root.appendChild(signInDiv);
    
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#signInDiv', signInConfig());
    document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
}

const signInConfig = () => {
    return {
        signInSuccessUrl: '#dashboard',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        credentialHelper: 'none'
    }
}

export const signOut = () => {
    firebase.auth().signOut();
    window.location.hash = '#';
}