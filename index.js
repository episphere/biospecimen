import { firebaseConfig } from "./src/config.js";
import { homeNavBar, userNavBar, adminNavBar, nonUserNavBar } from "./src/navbar.js";
import { validateUser, showAnimation, hideAnimation } from "./src/shared.js";
let userRole = '';
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
    dashboard();
    manageRoutes();
}

window.onhashchange = () => {
    manageRoutes();
}

const manageRoutes = () => {
    const route =  window.location.hash || '#';
    if(route === '#') dashboard();
    else if (userRole && route === '#dashboard') userDashboard();
    else if (route === '#sign_out') signOut();
    else window.location.hash = '#';
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
            document.getElementById('root').innerHTML = '';
            const idTokenResult = await auth.currentUser.getIdTokenResult()
            if(!idTokenResult.claims.role) {
                showAnimation();
                const response = await validateUser();
                hideAnimation();
                if(response.code === 200) {
                    const role = response.data.role;
                    userRole = role;
                    if(role === 'admin') document.getElementById('navbarNavAltMarkup').innerHTML = adminNavBar();
                    else document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar();
                    document.getElementById('root').innerHTML = '';
                }
                else if(response.code === 401) {
                    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar();
                    document.getElementById('root').innerHTML = 'You do not have required permission to access this dashboard';
                    return;
                }
            }
            else {
                const customCLaim = idTokenResult.claims.role;
                showAnimation();
                const response = await validateUser();
                hideAnimation();
                let conflict = false;
                if(response.code === 200) {
                    const role = response.data.role;
                    if(customCLaim !== role) { 
                        conflict = true;
                        signOut();
                    }
                }
                if(conflict) return;
                userRole = customCLaim;
                if(customCLaim === 'admin') document.getElementById('navbarNavAltMarkup').innerHTML = adminNavBar();
                else document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar();
                document.getElementById('root').innerHTML = '';
            }
            window.location.hash = '#dashboard';
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}

const userDashboard = () => {
    auth.onAuthStateChanged(async user => {
        if(user){
            
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
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