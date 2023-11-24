import { getIdToken, findParticipant, showAnimation, hideAnimation} from "../../shared.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { fakeParticipants, printAddressesParticipants} from "./fakeParticipants.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";

// Stringify array of objects and parse fake participants Data
const fakeParticipantsData = JSON.parse(JSON.stringify(fakeParticipants));
export const fakeParticipantsState = [...fakeParticipantsData];

export const printAddressesScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    printaddressesTemplate(username, auth, route, fakeParticipantsData);
};

const printaddressesTemplate = async (name, auth, route, printAddressesParticipants) => {
    let template = ``;
    template += renderParticipantSelectionHeader();
    template += ` <div class="container-fluid">
                    <div id="root root-margin">
                      <div id="alert_placeholder"></div>
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center; margin: 0 0 1rem;">Print Addresses </h3> </span>
                        <div class="sticky-header" style="overflow:auto; width:95.7%; margin:0 auto;">
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
                                      ${createParticipantRows(printAddressesParticipants)}
                                    </tbody>
                                  </table>
                            </div>
                    </div> 
                </div>
                <br />
                <button type="button" id='generateCsv' class="btn btn-success btn-lg">Generate Address File</button>
                </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar()
    generateParticipantCsvGetter();
    participantSelectionDropdown();
};

// REFACTOR
export const participantSelectionDropdown = () => {
    const participantDropdown = document.querySelector(
        ".participantSelectionDropdown"
    );
    // CHECKS THE CURRENT HASH AFTER ON LOAD AND SETS OPTION TO SELECTED
    if (location.hash === "#participantselection") {
        document.getElementById("select-pending").setAttribute("selected", "selected");
    }
    if (location.hash === "#allParticipants") {
        document.getElementById("select-all").setAttribute("selected", "selected");
    }
    if (location.hash === "#addressPrinted") {
        document.getElementById("select-address-printed").setAttribute("selected", "selected");
    }
    if (location.hash === "#assigned") {
        document.getElementById("select-assigned").setAttribute("selected", "selected");
    }
    if (location.hash === "#shipped") {
        document.getElementById("select-shipped").setAttribute("selected", "selected");
    }
    if(location.hash === "#received"){
        document.getElementById("select-received").setAttribute("selected","selected");
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
            return
        } else if(selection === "received") {
            location.hash = "#received"
            return
        } else return
    });
};

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
    participantHolder["first_name"] = i.first_name && i.first_name;
    participantHolder["last_name"] = i.last_name && i.last_name;
    participantHolder["connect_id"] = i.connect_id && i.connect_id;
    participantHolder["kit_status"] = "addressPrinted";
    participantHolder["address_1"] = String(i.address_1 && i.address_1);
    participantHolder["address_2"] = i.address_2 != undefined ? i.address_2 : ``;
    participantHolder["city"] = i.city && i.city;
    participantHolder["state"] = i.state && i.state;
    participantHolder["zip_code"] = i.zip_code && i.zip_code;
    participantHolder["study_site"] = i.study_site && i.study_site;
    participantHolder["date_requested"] = i.date_requested && i.date_requested;
    let schemaInfo = escape(JSON.stringify(participantHolder));
    return schemaInfo;
};

const generateParticipantCsvGetter = () => {
    const a = document.getElementById("generateCsv");
    let holdParticipantResponse = [];
    if (a) {
        a.addEventListener("click", () => {
            const participantRow = Array.from(
                document.getElementsByClassName("participantRow")
            );
            if (participantRow) {
                participantRow.forEach((element) => {
                    const checkboxPt = element.getElementsByClassName("ptSelection")[0];
                    checkboxPt.checked ? holdParticipantResponse.push(JSON.parse(unescape(checkboxPt.dataset.participantholder))) : ``;
                });
            }
            const response = setParticipantResponses(holdParticipantResponse);
            if (response) {
                generateParticipantCsv(holdParticipantResponse);
            }
        });
    }
};

const generateParticipantCsv = (items) => {
  let csv = ``;
  csv += `first_name, last_name, address_1, address_2, city, state, zip_code, study_site, \r\n`
  for (let row = 0; row < (items.length); row++) {
    let keysAmount = Object.keys(items[row]).length
    let keysCounter = 0
    for(let key in items[row]) {
      if (key !== 'connect_id' && key !== 'kit_status' && key !== 'date_requested') { 
        csv += items[row][key] + (keysCounter + 1 < keysAmount ? ',' : '\r\n') }
      keysCounter++
    }}
    let link = document.createElement("a");
    link.id = "download-csv";
    link.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(csv));
    link.setAttribute("download",`${new Date().toLocaleDateString()}-participant-address-export.csv`);
    document.body.appendChild(link);
    document.querySelector("#download-csv").click();
    document.body.removeChild(link);
    let alertList = document.getElementById("alert_placeholder");
    let template = ``;
    template += `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              Success!
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
            </div>`;
    alertList.innerHTML = template;
};

const setParticipantResponses = async (holdParticipantResponse) => {
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
