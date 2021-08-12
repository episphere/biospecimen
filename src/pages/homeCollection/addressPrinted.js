import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { fakeParticipantsState } from "./printAddresses.js";
import { participantSelectionDropdown } from "./printAddresses.js";

export const addressesPrintedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  addressesPrintedTemplate(auth, route);
};

let kitAssignmentInfoText = "";

const addressesPrintedTemplate = async (auth, route) => {
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += `<div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center;">Assign Kits </h3> </span>
                        <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Select one to assign kit</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                        </tr>
                                    </thead>   
                                    <tbody id="contentBodyAddress">
                                        ${createAddressPrintedRows(
                                          fakeParticipantsState
                                        )}
                                    </tbody>
                              </table>
                        </div>
                    </div>
                    <div class="container-search-connect-id" style="margin:2rem .8rem">
                        <label for="search-connect-Id">Search for a Connect ID: <input type="search" id="search-connect-id"/></label>
                </div>`;
  template += modalAssignedInfo();
  document.getElementById("contentBody").innerHTML = template;

  // confirmAssignment();

  assignKitButton();
  participantSelectionDropdown();
};

const assignedTableButton = () => {
  let test = document.querySelector(".show-Assigned-Table");
  console.log(test);
};

// TODO: FIX ERROR WITH NAMING CONVENTION F BUTTON
const assignKitButton = () => {
  // Target All buttons with assign-kit-button class
  const allAssignKitButtons = document.querySelectorAll(".assign-kit-button");
  console.log(allAssignKitButtons);
  // Loop over list of buttons and assign a click event listener
  allAssignKitButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      console.log(
        "usps track number",
        e.target.getAttribute("data-uspsTrackingNumber")
      );
      console.log("data kit", e.target.getAttribute("data-kitID"));
      console.log("first_name", e.target.getAttribute("data-firstName"));
      console.log("last_name", e.target.getAttribute("data-lastName"));
      console.log("address_1", e.target.getAttribute("data-address1"));
      console.log("city", e.target.getAttribute("data-city"));
      console.log("state", e.target.getAttribute("data-state"));
      console.log("zip code", e.target.getAttribute("data-zipCode"));
      console.log(
        "kit Assignment Info",
        e.target.getAttribute("data-kitAssignmentInfo")
      );

      kitAssignmentInfoText = e.target.getAttribute("data-kitAssignmentInfo");
      console.log(kitAssignmentInfoText);
      let confirmButton = document.querySelector(".confirm-assignment");
      let modalBody = document.querySelector(".modal-body");
      let modalContent = document.querySelector(".modal-content");
      console.log(modalContent);
      console.log(confirmButton);
      modalBody.innerHTML = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center; flex-wrap:wrap; padding:1rem 2.5rem">
              <label for="search-scan-kit-Id" style="flex-flow:wrap;align-self:flex-start"><strong>Scan Supply Kit ID</strong>: <input type="search" id="search-scan-kit-Id" value=${e.target.getAttribute(
                "data-kitID"
              )}></label>
              <p style="display:block; align-self:flex-start; width: 100%"><strong>Full Name:</strong> ${
                kitAssignmentInfoText.split("\n")[0]
              }</p>
              <p style="display:block; align-self:flex-start; width: 100%"><strong>Address:</strong> ${kitAssignmentInfoText
                .split("\n")
                .splice(1)
                .join(" ")}</p>
              <label for="search-scan-usps-tracking" style="flex-flow:wrap; align-self:flex-start;display:flex;"><strong>Scan USPS Tracking Number on Supply Kit: </strong><input id="search-scan-usps-tracking" type="search" value="${e.target.getAttribute(
                "data-uspsTrackingNumber"
              )}"/></label>
          </div>`;

      // Event Handler
      confirmButton.addEventListener("click", (e) => {
        console.log("Za Warudo!");
        let modalContent = document.querySelector(".modal-content");
        console.log(modalContent);
        console.log(kitAssignmentInfoText);
        modalContent.innerHTML = "";
        console.log(kitAssignmentInfoText.split("\n")[0]);
        console.log(kitAssignmentInfoText.split(" "));
        modalContent.innerHTML = `
            <div class="modal-header" style="border:0">
                <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" style="white-space: pre; display:flex; flex-direction:column; justify-content:center;
              align-items:center;">
                <object data="../../../static/images/modals/check-circle-solid.svg" width="200" height="200"></object>
                <h1 class="text-success" style:"margin-bottom:2rem;">Success!</h1>
                <p>The participant has been saved and can be found on Assigned!</p>
              </div>
              <div class="modal-footer" style="border:0;display:flex;justify-content:center;padding: 0.75rem 2rem;">
                <button type="button" class="btn btn-secondary" style="padding-right:1rem;" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary confirm-assignment" data-dismiss="modal" data-dismiss="modal">Show Assigned Table</button>
            </div>`;
      });
    });
  });
};

const createAddressPrintedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                    <tr class="row-color-enrollment-dark participantRow">
                        <td style="display:flex; height:100%;align-items:center; justify-content:center; padding" >
                            <input type="button" class="assign-kit-button"
                            data-toggle="modal" data-target="#exampleModal"
                            data-uspsTrackingNumber = ${i.usps_tracking_number} data-kitID= ${i.kit_id} data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
                            data-address1= '${i.address_1}'
                            data-city= '${i.city}'
                            data-state= '${i.state}'
                            data-zipCode= '${i.zip_code}'
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
const modalAssignedInfo = (confirmAssignment) => {
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
        <div class="modal-body" style="white-space: pre">
          
        </div>
        <div class="modal-footer" style="border:0;display:flex;justify-content:center;padding: 0.75rem 2rem;">
          <button type="button" class="btn btn-secondary" style="padding-right:1rem;" data-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary confirm-assignment">Confirm Assignment</button>
        </div>
      </div>
    </div>
  </div>`;

  return template;
};

// console.log(fakeParticipantsState);
