import { showAnimation, hideAnimation, getIdToken, getParticipantSelection} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activehomeCollectionNavbar.js";

export const addressesPrintedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  addressesPrintedTemplate(username, auth, route);
};

let kitAssignmentInfoText = "";

const addressesPrintedTemplate = async (name, auth, route) => {
  showAnimation();
  const response = await getParticipantSelection("addressPrinted");
  hideAnimation();
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += `<div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center; margin: 0 0 1rem;">Assign Kits </h3> </span>
                        <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Select One to Assign Kit</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                        </tr>
                                    </thead>   
                                    <tbody id="contentBodyAddress">
                                        ${createAddressPrintedRows(response.data)}
                                    </tbody>
                              </table>
                        </div>
                    </div>`;
  template += modalAssignedInfo();
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar()
  assignKitButton();
  participantSelectionDropdown();
  
};

// TODO: FIX ERROR WITH NAMING CONVENTION FOR BUTTON, BUTTON CHANGES TO UNEXPECTED NAME
// KEEP CONSOLE LOGS, WORK IN PROGRESS IN DEBUGGING FOR ADDRESS PRINTED.JS FILE
const assignKitButton = () => {
  // Target All buttons with assign-kit-button class
  const allAssignKitButtons = document.querySelectorAll(".assign-kit-button");
  // Loop over list of buttons and assign a click event listener
  allAssignKitButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      kitAssignmentInfoText = e.target.getAttribute("data-kitAssignmentInfo");
      const userId = e.target.getAttribute("data-id"); // grabs the pt user id
      let confirmButton = document.querySelector(".confirm-assignment");
      let modalBody = document.querySelector(".modal-body");
      console.log(kitAssignmentInfoText);
      modalBody.innerHTML = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center; flex-wrap:wrap; padding:1rem 2.5rem">
              <label for="search-scan-kit-Id" style="flex-flow:wrap;align-self:flex-start"><strong>Scan Supply Kit ID</strong>: <input type="text" id="search-scan-kit-Id" /></label>
              <p style="display:block; align-self:flex-start; width: 100%"><strong>Full Name:</strong> ${
                kitAssignmentInfoText.split("\n")[0]
              }</p>
              <p style="display:block; align-self:flex-start; width: 100%"><strong>Address:</strong> ${kitAssignmentInfoText.split("\n").splice(1).join(" ")}</p>
              <label for="search-scan-usps-tracking" style="flex-flow:wrap; align-self:flex-start; display:flex; height:32px;"><strong style="margin-right: .5rem;">Scan USPS Tracking Number on Supply Kit: </strong> <input id="search-scan-usps-tracking" type="search" style="appearance:auto;"/></label>
          </div>`;
      // Event Handler
      confirmButton.addEventListener("click", async (e) => {
        const supplyKitId = document.getElementById("search-scan-kit-Id").value;
        const uspsTrackingNumber = document.getElementById("search-scan-usps-tracking").value;
        const getAssignKitResponse = await setRequiredFields(userId, supplyKitId, uspsTrackingNumber); // stores responsea
        let modalContent = document.querySelector(".modal-content");
        modalContent.innerHTML = "";
        getAssignKitResponse ? (
        modalContent.innerHTML = `
            <div class="modal-header" style="border:0">
                <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" style="display:flex; flex-direction:column; justify-content:center;
              align-items:center;">
                <img src="./static/images/modals/check-circle-solid.svg" alt="green-check-icon" height="150" width="200" style="display:block;"/>
                <h1 class="text-success" style:"margin-bottom:1.5rem;">Success!</h1>
                <p style="font-weight:600;margin:0;">The participant has been saved and can be found on Assigned!</p>
              </div>
              <div class="modal-footer" style="border:0;display:flex;justify-content:center;padding: 0.75rem 2rem 1rem;">
                <button type="button" class="btn btn-secondary" style="padding-right:1rem;" data-dismiss="modal">Close</button>
                <button id="assigned-table" type="button" class="btn btn-primary confirm-assignment" data-dismiss="modal" data-dismiss="modal" style="margin-left:5%">Show Assigned Table</button>
            </div>` ) : 
            (
              modalContent.innerHTML =  `<div class="modal-header" style="border:0">
                <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
               </div>
              <div class="modal-body" style="display:flex; flex-direction:column; justify-content:center;
                align-items:center;">
                  <img src="./static/images/modals/error.svg" alt="red-cross-icon" height="150" width="200" style="display:block;"/>
                  <h1 class="text-danger" style:"margin-bottom:1.5rem;">Error!</h1>
                  <p style="font-weight:600;margin:0;">Check scanned Supply Kit ID and try again</p>
                </div>
                <div class="modal-footer" style="border:0;display:flex;justify-content:center;padding: 0.75rem 2rem 1rem;">
                  <button type="button" class="btn btn-secondary" style="padding-right:1rem;" data-dismiss="modal">Close</button>
              </div>` 
            )
        let moveToAssigned = document.getElementById("assigned-table");
        moveToAssigned && moveToAssigned.addEventListener("click", (e) => {
          location.hash = "#assigned";
        });
      });
    });
  });
  return kitAssignmentInfoText;
};

const createAddressPrintedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                    <tr class="row-color-enrollment-dark participantRow">
                        <td style="display:flex; height:100%;align-items:center; justify-content:center; padding" >
                            <input type="button" class="assign-kit-button"
                            data-toggle="modal" data-target="#exampleModal"
                            data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
                            data-address1= '${i.address_1}'
                            data-city= '${i.city}'
                            data-state= '${i.state}'
                            data-zipCode= '${i.zip_code}'
                            data-id = '${i.id}'
                            data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${i.address_1},\n${i.city}, ${i.state} ${i.zip_code}'
                            value="Assign Kit" >
                        </td>
                        <td>${i.first_name}</td>
                        <td>${i.last_name}</td>
                        <td>${i.connect_id}</td>
                        <td>${i.kit_status}</td>
                        <td>${i.study_site}</td>
                        <td>${i.date_requested}</td>
                    </tr>`;
  });
  return template;
};

// KIT ASSIGNMENT MODAL
const modalAssignedInfo = () => {
  let template = ``;
  template += `<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 70%">
      <div class="modal-content">
        <div class="modal-header" style="border:0; position:relative;">
        <h2 style="top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);position:absolute; margin: .5rem 0 0 0">Assign Kit to Participant?</h2>
          <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          
        </div>
        <div class="modal-footer" style="border:0;display:flex;justify-content:center;padding: 0.75rem 2rem;">
          <button type="button" class="btn btn-secondary" style="padding-right:1rem;" data-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary confirm-assignment" style="margin-left:5%">Confirm Assignment</button>
        </div>
      </div>
    </div>
  </div>`;

  return template;
};

// Kit Assignment Info to change status
const setRequiredFields = async (userId, supplyKitId, uspsTrackingNumber) => {
  let jsonObj = {
    id: userId,
    usps_trackingNum: uspsTrackingNumber,
    supply_kitId: supplyKitId,
  };
  const idToken = await getIdToken();
  const response = await await fetch(
    `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=assignKit`,
    {
      method: "POST",
      body: JSON.stringify(jsonObj),
      headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 200) {
    return true; // return success modal screen
  } else {
    return false;
  }
};