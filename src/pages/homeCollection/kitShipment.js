import { showAnimation, hideAnimation } from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { fakeParticipantsState } from "./printAddresses.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";

/*
Fake Placeholder shipped
*/
const fakeShippedParticipants = [
  {
    first_name: "David",
    last_name: "Eagle",
    connect_id: "2424953481",
    kit_status: "shipped",
    address_1: "058 Thackeray Street",
    address_2: null,
    city: "Iowa City",
    state: "Iowa",
    zip_code: 51381,
    date_requested: "08/06/2021",
    usps_trackingNum: 23209824123582591335,
    supply_kitId: "HNI252688",
    study_site: "KP IA",
  },
  {
    first_name: "Leorio",
    last_name: "Paradinight",
    connect_id: "0563027029",
    kit_status: "shipped",
    address_1: "36866 Marquette Plaza",
    address_2: null,
    city: "Aurora",
    state: "Colorado",
    zip_code: 85341,
    date_requested: "07/30/2021",
    usps_trackingNum: 78306541752888337496,
    supply_kitId: "HXH738238",
    study_site: "KP CO",
  },
  {
    first_name: "Charlotte",
    last_name: "Roselei",
    connect_id: "6107920005",
    kit_status: "shipped",
    address_1: "3 Merchant Street",
    address_2: null,
    city: "Hartford",
    state: "Connecticut",
    zip_code: 17195,
    date_requested: "07/12/2021",
    usps_trackingNum: 95776810780292207849,
    supply_kitId: "BLC014082",
    study_site: "KP CT",
  },
];

export const shippedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  shippedTemplate(username, auth, route);
};

const shippedTemplate = async (name, auth, route) => {
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
                      </tr>
                  </thead>   
                  <tbody>
                    ${createShippedRows(fakeShippedParticipants)}
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
                      </tr>`;
  });
  return template;
};
