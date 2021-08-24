import { firebaseConfig } from "./src/config.js";
import { manageUsers } from "./src/pages/users.js";
import { userDashboard } from "./src/pages/dashboard.js";
import { shippingDashboard } from "./src/pages/shipping.js"
import {reportsQuery } from "./src/pages/reportsQuery.js"
import { signIn, signOut } from "./src/pages/signIn.js";
import { welcomeScreen } from "./src/pages/welcome.js";
import { bptlScreen } from "./src/pages/bptl.js";
import { kitAssemblyScreen } from "./src/pages/homeCollection/kitAssembly.js";
import { printAddressesScreen } from "./src/pages/homeCollection/printAddresses.js";
import { assignedScreen } from "./src/pages/homeCollection/assigned.js";
import { addressesPrintedScreen } from "./src/pages/homeCollection/addressPrinted.js";
import { kitShipmentScreen } from "./src/pages/homeCollection/kitShipment.js";

let auth = '';

window.onload = () => {
    if('serviceWorker' in navigator){
        try {
            navigator.serviceWorker.register('./serviceWorker.js');
        }
        catch (error) {
            console.log(error);
        }
    };
    !firebase.apps.length ? firebase.initializeApp(firebaseConfig()) : firebase.app();
    auth = firebase.auth();
   // location.hash = '#welcome';
    manageRoutes();
}

window.onhashchange = () => {
    manageRoutes();
}

const manageRoutes = async () => {
    const route =  window.location.hash || '#';
    if(await userLoggedIn()){
        if (route === '#dashboard') userDashboard(auth, route);
        else if(route === "#shipping") shippingDashboard(auth,route);
        else if (route === '#welcome') welcomeScreen(auth, route);
        else if (route === '#bptl') bptlScreen(auth, route);
        else if (route === '#kitassembly') kitAssemblyScreen(auth, route);
        else if (route === '#participantselection') printAddressesScreen(auth, route);
        else if (route === '#addressPrinted') addressesPrintedScreen(auth, route);
        else if (route === '#assigned') assignedScreen(auth, route);
        else if (route === '#kitshipment') kitShipmentScreen(auth, route);
        else if (route === '#manage_users') manageUsers(auth, route);
        else if (route === '#sign_out') signOut();
        else if (route === '#reports') reportsQuery(auth, route);
        else window.location.hash = '#welcome';
    }else{
        if(route === '#') signIn();
        else window.location.hash = '#';
    }
}

const userLoggedIn = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}