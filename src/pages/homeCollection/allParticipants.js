import { showAnimation, hideAnimation } from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { fakeParticipantsState } from "./printAddresses.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";

export const allParticipantsScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  allParticipantsTemplate(username, auth, route);
};

const allParticipantsTemplate = async (name, auth, route) => {
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += `<div class="container-fluid">
  <div id="root root-margin">
      <div class="table-responsive">
      <span> <h3 style="text-align: center; margin: 0 0 1rem;">All Participants </h3> </span>
      <div class="sticky-header" style="overflow:auto;">
              <table class="table table-bordered" id="participantData" 
                  style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                  <thead> 
                      <tr style="top: 0; position: sticky;">
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
                  </tbody>
                </table>
          </div>
        </div> 
  </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  participantSelectionDropdown();
};
