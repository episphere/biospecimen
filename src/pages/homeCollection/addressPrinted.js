import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { fakeParticipantsState } from "./printAddresses.js";

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
                        <span> <h3 style="text-align: center;">Print Addresses </h3> </span>
                        <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Select one to assign kit</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit Status</th>
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
  template += modalAssignedInfo(kitAssignmentInfoText);
  document.getElementById("contentBody").innerHTML = template;

  assignKitButton();
  redirectDropdownScreen();
};

const redirectDropdownScreen = () => {
  const a = document.getElementById("btnParticipantSearch");
  a.addEventListener("click", () => {
    const selection = document.getElementById("paticipantSelection");
    if (selection.value === "pending") {
      location.hash = "#participantselection";
    } else if (selection.value === "addressPrinted") {
      location.hash = "#addressPrinted";
    } else if (selection.value === "assigned") {
      location.hash = "#assigned";
    }
  });
};

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
    });
  });
};

const createAddressPrintedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                    <tr class="row-color-enrollment-dark participantRow">
                        <td style="display:flex; height:100%;align-items:center; justify-content:center"; border:0;">
                            <input type="button" class="assign-kit-button"
                            data-toggle="modal" data-target="#exampleModal"
                            data-uspsTrackingNumber = ${i.usps_tracking_number} data-kitID= ${i.kit_id} data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
                            data-address1= '${i.address_1}'
                            data-city= '${i.city}'
                            data-state= '${i.state}'
                            data-zipCode= '${i.zip_code}'
                            data-kitAssignmentInfo = '${i.first_name} ${i.last_name},\n${i.address_1},\n${i.city}, ${i.state} ${i.zip_code}'
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

const modalAssignedInfo = (kitAssigmentInfoText) => {
  let template = ``;
  template += `<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          ${kitAssigmentInfoText}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm Assignment</button>
        </div>
      </div>
    </div>
  </div>`;
  return template;
};

console.log(fakeParticipantsState);
// full_address_1: "BlaineTrail,Houston,TX43098",
