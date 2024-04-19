import { homeCollectionNavbar } from "./homeCollectionNavbar.js";

export const participantSelection = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  displayKitStatusReportsHeader(auth, route);
};

export const displayKitStatusReportsHeader = () => {
    let template = ``;
    template += homeCollectionNavbar();
    template += renderKitStatusList();
    return template;
};

export const renderKitStatusList = () => {
    return `<div style="margin-top:10px; padding:15px;">
                <div>
                    <label for="paticipantSelection" class="col-form-label">Kit Status</label>
                    <select required class="col form-control kitStatusSelectionDropdown" id="paticipantSelection">
                        <option id="select-dashboard" value="" >-- Select dashboard --</option>
                        <option id="select-all" value="all" disabled>All</option>
                        <option id="select-pending" value="pending" disabled>Pending</option>
                        <option id="select-address-printed" value="addressPrinted" disabled>Address Printed</option>
                        <option id="select-assigned" value="assigned" disabled>Assigned</option>
                        <option id="select-shipped" value="shipped">Shipped</option>
                        <option id="select-received" value="received" disabled>Received</option>
                    </select>
                </div>
                </br>
            </div>`;
};
