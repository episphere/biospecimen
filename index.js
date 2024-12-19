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
import { packagesInTransitScreen } from "./src/pages/siteCollection/packagesInTransit.js";
import { packageReceiptScreen } from "./src/pages/siteCollection/sitePackageReceipt.js";
import { csvFileReceiptScreen } from "./src/pages/siteCollection/csvFileReceipt.js";
import { collectionIdSearchScreen } from "./src/pages/siteCollection/collectionIdSearch.js";
import { bptlShipReportsScreen } from "./src/pages/siteCollection/shippingReport.js";
import { checkOutReportTemplate } from "./src/pages/checkOutReport.js";
import { dailyReportTemplate } from "./src/pages/dailyReport.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./serviceWorker.js")
      .then((registration) => {
        registration.onupdatefound = () => {
          const sw = registration.installing;
          if (sw) {
            sw.onstatechange = () => sw.state === "activated" && sw.postMessage({ action: "getAppVersion" });
          }
        };
      })
      .catch((err) => {
        console.error("Service worker registration failed.", err);
      });
  
    navigator.serviceWorker.ready.then(() => {
      const sw = navigator.serviceWorker.controller;
      sw && sw.postMessage({ action: "getAppVersion" });
    });
  
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data.action === "sendAppVersion") {
        document.getElementById("appVersion").textContent = event.data.payload;
      }
    });
  }

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
    if(location.host === urls.prod) {
        !firebase.apps.length ? firebase.initializeApp(prodFirebaseConfig()) : firebase.app();
        window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'prod' });
    }
    else if(location.host === urls.stage) {
        !firebase.apps.length ? firebase.initializeApp(stageFirebaseConfig()) : firebase.app();
        window.DD_RUM && window.DD_RUM.init({ ...datadogConfig, env: 'stage' });
    }
    else if (isLocalDev) {
        const { firebaseConfig: localDevFirebaseConfig} = await import("./src/local-dev/config.js");
        if (!localDevFirebaseConfig) {
            console.error('Local development requires a firebaseConfig function defined in src/local-dev/config.js.');
            return;
        }
        !firebase.apps.length ? firebase.initializeApp(localDevFirebaseConfig()) : firebase.app();
    } else {
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

window.addEventListener('hashchange', function(e) { // prevent default smooth scroll behavior for hash change
    e.preventDefault();
    window.scrollTo(0, 0);
});

const manageRoutes = async () => {
    const route = window.location.hash || "#";
    if (await userLoggedIn()) {
        if (route === "#dashboard") userDashboard(auth, route);
        else if (route === "#shipping") shippingDashboard(auth, route);
        else if (route === "#welcome") welcomeScreen(auth, route);
        else if (route === "#bptl") bptlScreen(auth, route);
        else if (route === "#kitAssembly") kitAssemblyScreen(auth, route);
        else if (route === "#printLabels") printLabelsScreen(auth, route);
        else if (route === "#assignKits") assignKitsScreen(auth, route);
        else if (route === "#kitsReceipt") kitsReceiptScreen(auth, route);
        else if (route === "#kitsCsv") kitCsvScreen(auth, route);
        else if (route === "#kitStatusReports") displayKitStatusReportsShippedScreen(auth, route); // Temporarily make kitStatusReports route call displayKitStatusReportsShippedScreen
        else if (route === "#allParticipants") allParticipantsScreen(auth, route);
        else if (route === "#addressPrinted") addressesPrintedScreen(auth, route);
        else if (route === "#assigned") assignedScreen(auth, route);
        else if (route === "#received") receivedKitsScreen(auth,route);
        else if (route === "#kitShipment") kitShipmentScreen(auth, route);
        else if (route === "#packagesInTransit") packagesInTransitScreen(auth, route);
        else if (route === "#sitePackageReceipt") packageReceiptScreen(auth, route);
        else if (route === "#csvFileReceipt") csvFileReceiptScreen(auth, route);
        else if (route === "#collectionIdSearch") collectionIdSearchScreen(auth, route);
        else if (route === "#reports") reportsQuery(auth, route);
        else if (route === "#checkoutReport") checkOutReportTemplate(auth, route);
        else if (route === "#dailyReport") dailyReportTemplate(auth, route);
        else if (route === "#bptlShipReports") bptlShipReportsScreen(auth, route);
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