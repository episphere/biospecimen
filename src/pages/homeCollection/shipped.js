import { showAnimation, hideAnimation, getParticipantSelection } from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";


export const shippedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  shippedTemplate(username, auth, route);
};

const shippedTemplate = async (name, auth, route) => {
  showAnimation();
  const response = await getParticipantSelection("shipped");
  hideAnimation();
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += ` <div class="container-fluid">
            <div id="root root-margin">
                <div class="table-responsive">
                <span> <h3 style="text-align: center; margin: 0 0 1rem;">Shipped</h3> </span>
                    <div class="sticky-header" style="overflow:auto;">
                        <table class="table table-bordered" id="participantData" 
                            style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                            <thead> 
                                <tr style="top: 0; position: sticky;">
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit ID</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">USPS Tracking Number</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Confirm Pickup</th>
                                </tr>
                            </thead>   
                            <tbody>
                                ${createShippedRows(response.data)}
                            </tbody>
                        </table>
                </div>
            </div> 
        </div>`;
        template += `<div class="modal fade" id="editSuccessModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
        <div class="modal-content" style="padding:1rem">
        <div class="modal-header" style="border:0">
        <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  participantSelectionDropdown();
};

const createShippedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                      <tr class="row-color-enrollment-dark participantRow">
                          <td>${i.first_name}</td>
                          <td>${i.last_name}</td>
                          <td>${i.kit_status}</td>
                          <td>${i.study_site}</td>
                          <td>${i.date_requested}</td>
                          <td>${i.supply_kitId}</td>
                          <td>${i.usps_trackingNum}</td>
                          <td>${i.confirm_pickup}</td>
                      </tr>`;
  });
  return template;
};