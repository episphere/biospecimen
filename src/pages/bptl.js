import {
  validateUser,
  siteFullNames,
  showAnimation,
  hideAnimation,
  errorMessage,
  removeAllErrors,
} from "./../shared.js";
import { kitAssemblyScreen } from "./homeCollection/kitAssembly.js";
import { nonUserNavBar, unAuthorizedUser } from "./../navbar.js";

export const bptlScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  const response = await validateUser();
  hideAnimation();
  if (response.code !== 200 ) {
    document.getElementById("contentBody").innerHTML =
      "Authorization failed you lack permissions to use this dashboard!";
    document.getElementById("navbarNavAltMarkup").innerHTML =
      unAuthorizedUser();
    return;
  }
  else if ( response.data.isBPTLUser === false ) {
    document.getElementById("contentBody").innerHTML =
    "Authorization failed you lack permissions to use this dashboard!";
  document.getElementById("navbarNavAltMarkup").innerHTML =
    unAuthorizedUser();
  return;
  }
  bptlScreenTemplate(name || response.data.email, response.data);
  redirectPageToLocation();
};

const bptlScreenTemplate = (name, data) => {
  let template = "";
  template += `
        <div class="row align-center welcome-screen-div">
            <div class="col"><h3>BPTL Dashboard</h3></div>
        </div>
        <div class="container overflow-hidden">
            <div class="row gx-5">
                <div class="col">
                    <h4>Home Collection</h4>
                    <div class="p-3 border bg-light"><button type="button" href="#kitAssembly" class="btn btn-primary btn-lg" id="kitAssembly">Assemble Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#printLabels" class="btn btn-primary btn-lg" id="printLabels">Print Labels</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#assignKits" class="btn btn-primary btn-lg" id="assignKits">Assign Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitShipment" class="btn btn-primary btn-lg" id="kitShipment">Ship Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitsReceipt" class="btn btn-primary btn-lg" id="kitsReceipt">Kits Receipt</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitsCsv" class="btn btn-primary btn-lg" id="kitsCsv">Create .csv File</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitStatusReports" class="btn btn-primary btn-lg" id="kitStatusReports">Reports</button></div>
                </div>
                <div class="col">
                    <h4>Supplies</h4>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Pending Requests</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Supply Packing</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Supply Shipment</button></div>
                </div>
                <div class="col">
                    <h4>Site Collection</h4>
                    <div class="p-3 border bg-light"><button type="button" href="#packagesInTransit" class="btn btn-primary btn-lg" id="packagesInTransit">Packages in Transit from Sites</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#packageReceipt" class="btn btn-primary btn-lg" id="packageReceipt">Package Receipt</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#csvFileReceipt" class="btn btn-primary btn-lg" id="csvFileReceipt">Create .csv File</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#collectionIdSearch" id="collectionIdSearch" class="btn btn-primary btn-lg">Collection ID Search</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#bptlShipReports" id="bptlShipReports" class="btn btn-primary btn-lg">Shipping Report</button></div>
                </div>
            </div>
        </div>
        `;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name, data.isBPTLUser);
  document.getElementById("contentBody").innerHTML = template;
};

const redirectPageToLocation = () => {
    const redirections = [
        { id: "kitAssembly", hash: "#kitAssembly" },
        { id: "printLabels", hash: "#printLabels" },
        { id: "assignKits", hash: "#assignKits" },
        { id: "kitShipment", hash: "#kitShipment" },
        { id: "kitsReceipt", hash: "#kitsReceipt" },
        { id: "kitsCsv", hash: "#kitsCsv" },
        { id: "kitStatusReports", hash: "#kitStatusReports" },
        { id: "packagesInTransit", hash: "#packagesInTransit" },
        { id: "packageReceipt", hash: "#packageReceipt" },
        { id: "csvFileReceipt", hash: "#csvFileReceipt" },
        { id: "collectionIdSearch", hash: "#collectionIdSearch" },
        { id: "bptlShipReports", hash: "#bptlShipReports" }
    ];

    redirections.forEach(({ id, hash }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", () => {
            location.hash = hash;
            });
        }
    });
};