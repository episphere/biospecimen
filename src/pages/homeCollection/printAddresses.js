import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import fieldMapping from "../../fieldToConceptIdMapping.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import {
  fakeParticipants,
  printAddressesParticipants,
} from "./fakeParticipants.js";

// Stringify array of objects and parse fake participants Data
const fakeParticipantsData = JSON.parse(JSON.stringify(fakeParticipants));
export const fakeParticipantsState = [...fakeParticipantsData];

export const printAddressesScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  printaddressesTemplate(username, auth, route, printAddressesParticipants);
};

const printaddressesTemplate = async (
  name,
  auth,
  route,
  printAddressesParticipants
) => {
  showAnimation();
  // const response = await findParticipant("firstName=Deanna");
  hideAnimation();
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center; margin: 0 0 1rem;">Print Addresses </h3> </span>
                        <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Select to print address</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Address 1</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Address 2</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">City</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">State</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Zip Code</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                      ${createParticipantRows(
                                        printAddressesParticipants
                                      )}
                                    </tbody>
                                  </table>
                            </div>
                    </div> 
                </div>
                <div style="margin: 1.5rem 0;">
                  <button type="button" id='generateCsv' class="btn btn-success btn-lg">Generate Address File</button>
                  <button type="button" class="btn btn-primary btn-lg" style="float: right;">Continue to Participant Selection</button>
                </div>
              </div>`;
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  generateParticipantCsvGetter();
  participantSelectionDropdown();
};

// REFACTOR
export const participantSelectionDropdown = () => {
  const participantDropdown = document.querySelector(
    ".participantSelectionDropdown"
  );
  // CHECKS THE CURRENT HASH AFTER ON LOAD AND SETS OPTION TO SELECTED
  // TODO: Refactor into switch statement?
  if (location.hash === "#participantselection") {
    document
      .getElementById("select-pending")
      .setAttribute("selected", "selected");
  }
  if (location.hash === "#allParticipants") {
    document.getElementById("select-all").setAttribute("selected", "selected");
  }
  if (location.hash === "#addressPrinted") {
    document
      .getElementById("select-address-printed")
      .setAttribute("selected", "selected");
  }
  if (location.hash === "#assigned") {
    document
      .getElementById("select-assigned")
      .setAttribute("selected", "selected");
  }

  if (location.hash === "#shipped") {
    document
      .getElementById("select-shipped")
      .setAttribute("selected", "selected");
  }

  participantDropdown.addEventListener("change", (e) => {
    // Clear selected attribute from each child node
    for (let i = 0; i < participantDropdown.children.length; i++) {
      participantDropdown.children[i].removeAttribute("selected");
    }

    // TODO: ADD MORE BASED ON UPCOMING DIFFERENT URL ROUTES
    let selection = e.target.value;
    if (selection === "pending") {
      location.hash = "#participantselection";
      return;
    } else if (selection === "addressPrinted") {
      location.hash = "#addressPrinted";
      return;
    } else if (selection === "assigned") {
      location.hash = "#assigned";
      return;
    } else if (selection === "all") {
      location.hash = "#allParticipants";
      return;
    } else if (selection === "shipped") {
      location.hash = "#shipped";
    } else {
      return;
    }
  });
};

// TODO: Add this "${createParticipantRows(response.data)}" back to <tbody> element  ***
const createParticipantRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                <tr class="row-color-enrollment-dark participantRow">
                    <td> <input type="checkbox" class="ptSelection" data-participantHolder = ${storeParticipantInfo(
                      i
                    )} name="ptSelection"></td>
                    <td>${i.first_name && i.first_name}</td>
                    <td>${i.last_name && i.last_name}</td>
                    <td>${i.connect_id && i.connect_id}</td>
                    <td>Pending</td>
                    <td>${i.address_1 && i.address_1}</td>
                    <td>${i.address_2 != undefined ? i.address_2 : ``}</td>
                    <td>${i.city && i.city}</td>
                    <td>${i.state && i.state}</td>
                    <td>${i.zip_code && i.zip_code}</td>
                    <td>${i.date_requested && i.date_requested}</td>
                </tr>`;
  });
  return template;
};

const storeParticipantInfo = (i) => {
  let participantHolder = {};
  participantHolder["firstName"] = i.first_name && i.first_name;
  participantHolder["lastName"] = i.last_name && i.last_name;
  participantHolder["connectId"] = i.connect_id && i.connect_id;
  participantHolder["kitStatus"] = "addressPrinted";
  participantHolder["address1"] = String(i.address_1 && i.address_1);
  participantHolder["address2"] = i.address_2 != undefined ? i.address_2 : ``;
  participantHolder["city"] = i.city && i.city;
  participantHolder["state"] = i.state && i.state;
  participantHolder["zipCode"] = i.zip_code && i.zip_code;
  participantHolder["dateRequested"] = i.date_requested && i.date_requested;
  // participantHolder = JSON.stringify(participantHolder);
  let schemaInfo = escape(JSON.stringify(participantHolder));
  return schemaInfo;
};

const generateParticipantCsvGetter = () => {
  const a = document.getElementById("generateCsv");
  let holdParticipantResponse = [];
  if (a) {
    a.addEventListener("click", () => {
      console.log('generateParticipantCsv("participantData");');
      const participantRow = Array.from(
        document.getElementsByClassName("participantRow")
      );
      if (participantRow) {
        participantRow.forEach((element) => {
          const checkboxPt = element.getElementsByClassName("ptSelection")[0];
          checkboxPt.checked
            ? holdParticipantResponse.push(
                JSON.parse(unescape(checkboxPt.dataset.participantholder))
              )
            : ``;
        });
      }
      const response = setParticipantResponses(holdParticipantResponse);
      if (response) {
        generateParticipantCsv("participantData");
      }
    });
  }
};

const setParticipantResponses = async (holdParticipantResponse) => {
  console.log("holdParticipantResponse", holdParticipantResponse);
  const idToken = await getIdToken();
  const response = await await fetch(
    `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=printAddresses`,
    {
      method: "POST",
      body: JSON.stringify(holdParticipantResponse),
      headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 200) {
    return true;
  } else {
    alert("Error");
  }
};

const generateParticipantCsv = (table_id, separator = ",") => {
  console.log("3");
  // succeess alert
  // Select rows from table_id
  var rows = document.querySelectorAll("table#" + table_id + " tr");
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      var data = cols[j].innerText
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/(\s\s)/gm, " ");
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  var csv_string = csv.join("\n");
  // Download it
  var filename =
    "export_" + table_id + "_" + new Date().toLocaleDateString() + ".csv";
  var link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string)
  );
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/*
FAKE PENDING DATA***
[{
  "first_name": "David",
  "last_name": "Eagle",
  "connect_id": "2424953481",
  "kit_status": "Pending",
  "address_1": "058 Thackeray Street",
  "address_2": null,
  "city": "Iowa City",
  "state": "Iowa",
  "zip_code": 51381,
  "date_requested": "08/06/2021",
  "usps_tracking_number": 23209824123582591335,
  "kit_id": "HNI252688",
  "study_site": "KP IA"
}, {
  "first_name": "Leorio",
  "last_name": "Paradinight",
  "connect_id": "0563027029",
  "kit_status": "Pending",
  "address_1": "36866 Marquette Plaza",
  "address_2": null,
  "city": "Aurora",
  "state": "Colorado",
  "zip_code": 85341,
  "date_requested": "07/30/2021",
  "usps_tracking_number": 78306541752888337496,
  "kit_id": "HXH738238",
  "study_site": "KP CO"
}, {
  "first_name": "Ichigo",
  "last_name": "Kurosaki",
  "connect_id": "7091247876",
  "kit_status": "Pending",
  "address_1": "1439 Linden Drive",
  "address_2": null,
  "city": "Washington",
  "state": "District of Columbia",
  "zip_code": 99498,
  "date_requested": "07/31/2021",
  "usps_tracking_number": 25721624043598064554,
  "kit_id": "BLE433998",
  "study_site": "KP DC"
}, {
  "first_name": "Annie",
  "last_name": "Leonhart",
  "connect_id": "4602900054",
  "kit_status": "Pending",
  "address_1": "4076 Dexter Crossing",
  "address_2": null,
  "city": "Mobile",
  "state": "Alabama",
  "zip_code": 11107,
  "date_requested": "07/17/2021",
  "usps_tracking_number": 02003930129859401458,
  "kit_id": "AOT370580",
  "study_site": "KP AL"
}, {
  "first_name": "Charlotte",
  "last_name": "Roselei",
  "connect_id": "6107920005",
  "kit_status": "Pending",
  "address_1": "3 Merchant Street",
  "address_2": null,
  "city": "Hartford",
  "state": "Connecticut",
  "zip_code": 17195,
  "date_requested": "07/12/2021",
  "usps_tracking_number": 95776810780292207849,
  "kit_id": "BLC014082",
  "study_site": "KP CT"
}]
*/
