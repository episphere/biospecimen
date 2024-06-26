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
                    <div class="p-3 border bg-light"><button type="button" href="#kitassembly" class="btn btn-primary btn-lg" id="kitAssembly">Assemble Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#printlabels" class="btn btn-primary btn-lg" id="printLabels">Print Labels</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#assignkits" class="btn btn-primary btn-lg" id="assignKits">Assign Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitshipment" class="btn btn-primary btn-lg" id="kitShipment">Ship Kits</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitsreceipt" class="btn btn-primary btn-lg" id="kitsReceipt">Kits Receipt</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitscsv" class="btn btn-primary btn-lg" id="kitsCsv">Create .csv File</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitStatusReports" class="btn btn-primary btn-lg" id="kitStatusReports">Reports</button></div>
                </div>
                <div class="col">
                    <h4>Supplies</h4>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Pending Requests</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Supply Packing</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg" disabled>Supply Shipment</button></div>
                </div>
                <div class="col">
                    <h4>Receipts</h4>
                    <div class="p-3 border bg-light"><button type="button" href="#packagesintransit" class="btn btn-primary btn-lg" id="packagesInTransit">Packages in Transit from Sites</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#packagereceipt" class="btn btn-primary btn-lg" id="packageReceipt">Package Receipt</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#csvfilereceipt" class="btn btn-primary btn-lg" id="csvFileReceipt">Create .csv File</button></div>
                </div>
                <div class="col">
                    <h4>Reports</h4>
                    <div class="p-3 border bg-light"><button type="button" href="#kitreports" id="kitreports" class="btn btn-primary btn-lg" disabled>Reports</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#collectionidsearch" id="collectionIdSearch" class="btn btn-primary btn-lg">Collection ID Search</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#bptlshipreports" id="bptlShipReports" class="btn btn-primary btn-lg">Shipping Report</button></div>
                </div>
            </div>
        </div>
        `;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name, data.isBPTLUser);
  document.getElementById("contentBody").innerHTML = template;
};

const redirectPageToLocation = () => {
  const kitAssemblyRedirection = document.getElementById("kitAssembly");
  kitAssemblyRedirection && kitAssemblyRedirection.addEventListener("click", async () => {
      location.hash = "#kitassembly";
    });
  const printLabelsRedirection = document.getElementById("printLabels");
  printLabelsRedirection && printLabelsRedirection.addEventListener("click", async () => {
      location.hash = "#printlabels";
    });
  const assignKitsRedirection = document.getElementById("assignKits");
  assignKitsRedirection && assignKitsRedirection.addEventListener("click", async () => {
      location.hash = "#assignkits";
    });
  const kitShipmentRedirection = document.getElementById("kitShipment");
  kitShipmentRedirection && kitShipmentRedirection.addEventListener("click", async () => {
      location.hash = "#kitshipment";
    });
  const kitsReceiptRedirection = document.getElementById("kitsReceipt");
  kitsReceiptRedirection && kitsReceiptRedirection.addEventListener("click", async () => {
    location.hash = "#kitsreceipt";
  });
  const kitCSVRedirection = document.getElementById("kitsCsv");
  kitCSVRedirection && kitCSVRedirection.addEventListener("click", async () => {
    location.hash = "#kitscsv";
  });
  const kitStatusReportsRedirection = document.getElementById("kitStatusReports");
  kitStatusReportsRedirection && kitStatusReportsRedirection.addEventListener("click", async () => {
      location.hash = "#kitStatusReports";
    });
  const packagesInTransitRedirection = document.getElementById("packagesInTransit");
  packagesInTransitRedirection && packagesInTransitRedirection.addEventListener("click", async () => {
      location.hash = "#packagesintransit";
    });
  const packageReceiptRedirection = document.getElementById("packageReceipt");
  packageReceiptRedirection && packageReceiptRedirection.addEventListener("click", async () => {
      location.hash = "#packagereceipt";
    });
  const csvFileReceiptRedirection = document.getElementById("csvFileReceipt");
  csvFileReceiptRedirection && csvFileReceiptRedirection.addEventListener("click",async () => {
    location.hash = "#csvfilereceipt";
    });
  const reportsRedirection = document.getElementById("kitreports");
  reportsRedirection && reportsRedirection.addEventListener("click", async () => {
      location.hash = "#kitreports";
    });
  const collectionIdSearchRedirection = document.getElementById("collectionIdSearch");
  collectionIdSearchRedirection && collectionIdSearchRedirection.addEventListener("click", async () => {
      location.hash = "#collectionidsearch";
    });
  const shippingReportRedirection = document.getElementById("bptlShipReports");
  shippingReportRedirection && shippingReportRedirection.addEventListener("click", async () => {
      location.hash = "#bptlshipreports";
    });
};