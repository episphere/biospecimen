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
                                    <tbody>
                                        ${createAddressPrintedRows(
                                          fakeParticipantsState
                                        )}
                                    </tbody>
                              </table>
                        </div>
                    </div> 
                </div>`;
  document.getElementById("contentBody").innerHTML = template;

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

const createAddressPrintedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                    <tr class="row-color-enrollment-dark participantRow">
                        <td> <input type="button" class="assign-kit" data-uspsTrackingNumber = ${i.usps_tracking_number}} data-kitID= ${i.kit_id}
                        value="Assign Kit"></td>
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

console.log(fakeParticipantsState);
