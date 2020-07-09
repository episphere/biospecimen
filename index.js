import { firebaseConfig } from "./src/config.js";
import { homeNavBar } from "./src/navbar.js";

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
    dashboard()
}
let auth = '';
const dashboard = () => {
    !firebase.apps.length ? firebase.initializeApp(firebaseConfig()) : firebase.app();
    auth = firebase.auth();
    const root = document.getElementById('root');
    root.innerHTML = '';
    const signInDiv = document.createElement('div');
    signInDiv.id = 'signInDiv';
    signInDiv.className = 'row';
    root.appendChild(signInDiv);
    
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#signInDiv', signInConfig());
    auth.onAuthStateChanged(async user => {
        if(user){
            // document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar();
            // toggleCurrentPage(route);
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            // toggleCurrentPageNoUser(route);
        }
    });
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