import { firebaseConfig } from "./src/config.js";
import { homeNavBar } from "./src/navbar.js";
import { userAuthorization } from "./src/shared.js";
import { manageUsers } from "./src/pages/users.js";
import { userDashboard } from "./src/pages/dashboard.js";
window.onload = () => {
    if('serviceWorker' in navigator){
        try {
            navigator.serviceWorker.register('./serviceWorker.js')
            .then((registration) => {});
        }
        catch (error) {
            console.log(error);
        }
    }
    manageRoutes();
}

window.onhashchange = () => {
    manageRoutes();
}

const manageRoutes = async () => {
    const route =  window.location.hash || '#';
    !firebase.apps.length ? firebase.initializeApp(firebaseConfig()) : firebase.app();
    auth = firebase.auth();
    if(route === '#') signIn(auth);
    else if (route === '#dashboard') userDashboard(auth, route);
    else if (route === '#sign_out') signOut();
    else if (route === '#manage_users') manageUsers(auth, route);
    else window.location.hash = '#';
}

let auth = '';
const signIn = (auth) => {
    const root = document.getElementById('root');
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

const signOut = () => {
    firebase.auth().signOut();
    window.location.hash = '#';
}