import { homeCollectionNavbar } from "./homeCollectionNavbar.js";

export const participantSelection = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  renderParticipantSelectionHeader(auth, route);
};

export const renderParticipantSelectionHeader = () => {
  let template = ``;
  template += homeCollectionNavbar();
  template += renderKitStatusList();
  return template;
};

export const renderKitStatusList = () => {
  let template = ``;
  template += ` 

            <div style="margin-top:10px; padding:15px;">
                <div>
                    <label for="paticipantSelection" class="col-form-label">Participant Selection</label>
                    <select required class="col form-control participantSelectionDropdown" id="paticipantSelection">
                        <option id="select-dashboard" value="">-- Select dashboard --</option>
                        <option id="select-all" value="all">All</option>
                        <option id="select-pending" value="pending">Pending</option>
                        <option id="select-address-printed" value="addressPrinted">Address Printed</option>
                        <option id="select-assigned" value="assigned">Assigned</option>
                        <option id="select-shipped" value="shipped">Shipped</option>
                        <option id="select-received" value="received">Received</option>
                    </select>
                </div>
                </br>
            </div> `;

  return template;
};

// TODO: FULLY REMOVE
{
  /* <div class="row">
<div class="col"><button class="btn btn-outline-primary" id="btnParticipantSearch">Show Participants</button></div>
</div> */
}
