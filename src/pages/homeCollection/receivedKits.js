import { showAnimation, hideAnimation, getParticipantSelection, convertTime } from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";

export const receivedKitsScreen = async (auth,route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  receivedKitsTemplate(username, auth, route);
}

const receivedKitsTemplate = async (name,auth,route) => {
  showAnimation();
  const response = await getParticipantSelection("received");
  hideAnimation();
  let template = ``;

  template += renderParticipantSelectionHeader();
  template += `<div class="container-fluid">
  <div id="root root-margin">
      <div class="table-responsive">
      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Received Kits</h3> </span>
      <div class="sticky-header" style="overflow:auto;">
              <table class="table table-bordered" id="participantReceivedData" 
                  style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                  <thead> 
                      <tr style="top: 0; position: sticky;">
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                          <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Received</th>
                      </tr>
                  </thead>   
                  <tbody>
                    ${createReceivedRows(response.data)}
                  </tbody>
                </table>
          </div>
        </div> 
  </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar()
  participantSelectionDropdown();
}

const createReceivedRows = (participantRows) => {
  let template = ``
  participantRows.forEach(i => {
    template += `
    <tr class="row-color-enrollment-dark participantRow">
      <td>${i.first_name ?? "N/A"}</td>
      <td>${i.last_name ?? "N/A"}</td>
      <td>${i.connect_id ?? "N/A"}</td>
      <td>${i.kit_status ?? "N/A"}</td>
      <td>${i.study_site ?? "N/A"}</td>
      <td>${i.date_requested ?? "N/A"}</td>
      <td>${i.time_stamp && splitTime(convertTime(i.time_stamp)) ?? "N/A"}</td>
    </tr>`;
  });
  return template
}

const splitTime = (dateTime) => {
  return dateTime.split(",")[0]
}