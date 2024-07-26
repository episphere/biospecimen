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
import { printLabelsScreen } from "./src/pages/homeCollection/printLabels.js";
import { assignKitsScreen } from "./src/pages/homeCollection/assignKits.js";
import { kitsReceiptScreen } from "./src/pages/homeCollection/kitsReceipt.js";
// import { displayKitStatusReportsScreen } from "./src/pages/homeCollection/kitStatusReports.js"; // TODO: This will be added back in once the new kitStatusReports page is created
import { allParticipantsScreen } from "./src/pages/homeCollection/allParticipants.js";
import { addressesPrintedScreen } from "./src/pages/homeCollection/assignKit.js";
import { assignedScreen } from "./src/pages/homeCollection/assigned.js";
import { displayKitStatusReportsShippedScreen } from "./src/pages/homeCollection/kitStatusReportsShipped.js";
import { receivedKitsScreen } from "./src/pages/homeCollection/receivedKits.js";
import { kitCsvScreen } from "./src/pages/homeCollection/kitCSV.js";
import { kitShipmentScreen } from "./src/pages/homeCollection/kitShipment.js";
import { packagesInTransitScreen } from "./src/pages/receipts/packagesInTransit.js";
import { packageReceiptScreen } from "./src/pages/receipts/packageReceipt.js";
import { csvFileReceiptScreen } from "./src/pages/receipts/csvFileReceipt.js";
import { kitReportsScreen } from "./src/pages/reports/kitReports.js";
import { collectionIdSearchScreen } from "./src/pages/reports/collectionIdSearch.js";
import { bptlShipReportsScreen } from "./src/pages/reports/shippingReport.js";
import { checkOutReportTemplate } from "./src/pages/checkOutReport.js";
import { dailyReportTemplate } from "./src/pages/dailyReport.js";

//test

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


window.onload = async () => {
    try {
        await registerServiceWorker();
        await updateVersionDisplay();
    } catch (error) {
        console.log(error);
    }


    if(location.host === urls.prod) {
        !firebase.apps.length ? firebase.initializeApp(prodFirebaseConfig()) : firebase.app();
        window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'prod' });
    }
    else if(location.host === urls.stage) {
        !firebase.apps.length ? firebase.initializeApp(stageFirebaseConfig()) : firebase.app();
        window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'stage' });
    }
    else {
        !firebase.apps.length ? firebase.initializeApp(devFirebaseConfig()) : firebase.app();
        !isLocalDev && window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'dev' });
    }

    !isLocalDev && window.DD_RUM && window.DD_RUM.startSessionReplayRecording();

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
        else if (route === "#printlabels") printLabelsScreen(auth, route);
        else if (route === "#assignkits") assignKitsScreen(auth, route);
        else if (route === "#kitsreceipt") kitsReceiptScreen(auth, route);
        else if (route === "#kitscsv") kitCsvScreen(auth, route);
        else if (route === "#kitStatusReports") displayKitStatusReportsShippedScreen(auth, route); // Temporarily make kitStatusReports route call displayKitStatusReportsShippedScreen
        else if (route === "#allParticipants") allParticipantsScreen(auth, route);
        else if (route === "#addressPrinted") addressesPrintedScreen(auth, route);
        else if (route === "#assigned") assignedScreen(auth, route);
        else if (route === "#status_shipped") kitStatusReportsShipped(auth, route);
        else if (route === "#received") receivedKitsScreen(auth,route);
        else if (route === "#kitshipment") kitShipmentScreen(auth, route);
        else if (route === "#packagesintransit") packagesInTransitScreen(auth, route);
        else if (route === "#packagereceipt") packageReceiptScreen(auth, route);
        else if (route === "#csvfilereceipt") csvFileReceiptScreen(auth, route);
        else if (route === "#kitreports") kitReportsScreen(auth, route);
        else if (route === "#collectionidsearch") collectionIdSearchScreen(auth, route);
        else if (route === "#reports") reportsQuery(auth, route);
        else if (route === "#checkoutreport") checkOutReportTemplate(auth, route);
        else if (route === "#dailyreport") dailyReportTemplate(auth, route);
        else if (route === "#bptlshipreports") bptlShipReportsScreen(auth, route);
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

/**
 * This function is an async function that checks if the service worker is supported by the browser
 * If it is supported, it registers the service worker
 * If the service worker is already installed and there is a new service worker available, it refreshes the page
*/
const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
        const registration = await navigator.serviceWorker.register("./serviceWorker.js");
        console.log('Service Worker registered with scope:', registration.scope);

        registration.addEventListener('updatefound', () => { // This event fires when a new service worker is found
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => { // This event fires when the state of the service worker changes
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                console.log("Refreshing page");
                window.location.reload();
            }
            });
        });
        } catch (error) {
        console.log('Service Worker registration failed:', error);
        }
    }
};

/**
 * Fetches the app version from the cache storage and updates the version display in the footer
*/
const updateVersionDisplay = async () => {
    const versionNumber = await fetchAppVersionFromCache();
    const versionElement = document.getElementById('appVersion');

    if (!versionNumber || !versionElement) return;
    versionElement.textContent = `${versionNumber}`;
    };

const fetchAppVersionFromCache = async () => {
    try {
        const cache = await caches.open('app-version-cache');
        const response = await cache.match('./appVersion.js');

        if (!response) return;

        const appVersionText = await response.text();
        const versionMatch = appVersionText.match(/"versionNumber"\s*:\s*"(v\d+\.\d+\.\d+)"/);       

        if (!versionMatch) return;

        return versionMatch[1];
    } catch (error) {
        console.error('Error fetching app version:', error);
        return 'Error fetching version';
    }
}
