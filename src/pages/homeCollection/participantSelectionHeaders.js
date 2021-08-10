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
                        <option value="">-- Select dashboard --</option>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="addressPrinted">Address Printed</option>
                        <option value="assigned">Assigned</option>
                        <option value="shipped">Shipped</option>
                        <option value="received">Received</option>
                    </select>
                </div>
                </br>
                <div class="row">
                    <div class="col"><button class="btn btn-outline-primary" id="btnParticipantSearch">Show Participants</button></div>
                </div>
            </div> `;

  return template;
};
