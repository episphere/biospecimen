import { inactivityTime, urls } from "./src/shared.js";
import { firebaseConfig as devFirebaseConfig } from "./src/dev/config.js";
import { firebaseConfig as stageFirebaseConfig } from "./src/stage/config.js";
import { firebaseConfig as prodFirebaseConfig } from "./src/prod/config.js";
import { manageUsers } from "./src/pages/users.js";
import { userDashboard } from "./src/pages/dashboard.js";
import { shippingDashboard } from "./src/pages/shipping.js";
import { reportsQuery } from "./src/pages/reportsQuery.js";
import { signIn, signOut } from "./src/pages/signIn.js";
import { welcomeScreen } from "./src/pages/welcome.js";
import { bptlScreen } from "./src/pages/bptl.js";
import { kitAssemblyScreen } from "./src/pages/homeCollection/kitAssembly.js";
import { printAddressesScreen } from "./src/pages/homeCollection/printAddresses.js";
import { allParticipantsScreen } from "./src/pages/homeCollection/allParticipants.js";
import { addressesPrintedScreen } from "./src/pages/homeCollection/assignKit.js";
import { assignedScreen } from "./src/pages/homeCollection/assigned.js";
import { shippedScreen } from "./src/pages/homeCollection/shipped.js";
import { receivedKitsScreen } from "./src/pages/homeCollection/receivedKits.js";
import { kitShipmentScreen } from "./src/pages/homeCollection/kitShipment.js";
import { packagesInTransitScreen } from "./src/pages/receipts/packagesInTransit.js";
import { packageReceiptScreen } from "./src/pages/receipts/packageReceipt.js";
import { csvFileReceiptScreen } from "./src/pages/receipts/csvFileReceipt.js";
import { kitReportsScreen } from "./src/pages/reports/kitReports.js";
import { collecionIdSearchScreen } from "./src/pages/reports/collectionIdSearch.js";


let auth = '';

const datadogConfig = {
  clientToken: 'pub7aa9e5da99946b3a91246ac09af1cc45',
  applicationId: 'd9a6d4bf-1617-4dde-9873-0a7c3eee1388',
  site: 'ddog-gov.com',
  service: 'biospecimen',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
};

const isLocalDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

window.onload = () => {
    if ("serviceWorker" in navigator) {
        try {
            navigator.serviceWorker.register("./serviceWorker.js");
        } catch (error) {
            console.log(error);
        }
    }

    if(location.host === urls.prod) {
        !firebase.apps.length ? firebase.initializeApp(prodFirebaseConfig()) : firebase.app();
        //window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'prod' });
    }
    else if(location.host === urls.stage) {
        !firebase.apps.length ? firebase.initializeApp(stageFirebaseConfig()) : firebase.app();
        window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'stage' });
    }
    else {
        !firebase.apps.length ? firebase.initializeApp(devFirebaseConfig()) : firebase.app();
        !isLocalDev && window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'dev' });
    }

    !isLocalDev && location.host !== urls.prod && window.DD_RUM && window.DD_RUM.startSessionReplayRecording();

    auth = firebase.auth();
    auth.onAuthStateChanged(async user => {
        if(user){
            inactivityTime();
        }
    });
    
    manageRoutes();
};

window.onhashchange = () => {
    manageRoutes();
};

const manageRoutes = async () => {
    const route = window.location.hash || "#";
    if (await userLoggedIn()) {
        if (route === "#dashboard") userDashboard(auth, route);
        else if (route === "#shipping") shippingDashboard(auth, route);
        else if (route === "#welcome") welcomeScreen(auth, route);
        else if (route === "#bptl") bptlScreen(auth, route);
        else if (route === "#kitassembly") kitAssemblyScreen(auth, route);
        else if (route === "#participantselection") printAddressesScreen(auth, route);
        else if (route === "#allParticipants") allParticipantsScreen(auth, route);
        else if (route === "#addressPrinted") addressesPrintedScreen(auth, route);
        else if (route === "#assigned") assignedScreen(auth, route);
        else if (route === "#shipped") shippedScreen(auth, route);
        else if (route === "#received") receivedKitsScreen(auth,route);
        else if (route === "#kitshipment") kitShipmentScreen(auth, route);
        else if (route === "#packagesintransit") packagesInTransitScreen(auth, route);
        else if (route === "#packagereceipt") packageReceiptScreen(auth, route);
        else if (route === "#csvfilereceipt") csvFileReceiptScreen(auth, route);
        else if (route === "#kitreports") kitReportsScreen(auth, route);
        else if (route === "#collectionidsearch") collecionIdSearchScreen(auth, route);
        else if (route === "#reports") reportsQuery(auth, route);
        else if (route === "#manage_users") manageUsers(auth, route);
        else if (route === "#sign_out") signOut();
        else window.location.hash = "#welcome";
    } else {
        if (route === "#") signIn();
        else window.location.hash = "#";
    }
};

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
};
