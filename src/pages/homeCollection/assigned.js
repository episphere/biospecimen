import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
  getParticipantSelection,
} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { participantSelectionDropdown } from "./printAddresses.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";

export const assignedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  assignedTemplate(username, auth, route);
};

const assignedTemplate = async (name, auth, route) => {
  showAnimation();
  const response = await getParticipantSelection("assigned");
  hideAnimation();
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center; margin: 0 0 1rem;">Assigned</h3> </span>
                            <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">USPS Tracking Number</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Edit / Save</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                       ${createAssignedParticipantRows(
                                         response.data
                                       )}
                                    </tbody>
                              </table>
                        </div>
                    </div> 
                </div>
                <br />
                <button type="button" class="btn btn-primary btn-lg" style="float: right; margin: 0 0 1rem;" id="kitShipmentBtn">Continue to Kit Shipment</button>
                <br />
                </div>`;
  template += `<div class="modal fade" id="editSuccessModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content" style="padding:1rem">
    <div class="modal-header" style="border:0">
    <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    </div>
    <div class="modal-body" style="display:flex; flex-direction:column; justify-content:center;align-items:center">
          <img src="./static/images/modals/check-circle-solid.svg" alt="green-check-icon" height="150" width="200" style="display:block;"/>
          <h1 class="text-success" style:"margin:1.5rem 0 2rem 0;">Success!</h1>
          <p style="text-align:center; margin:1.5rem 0 2rem 0; font-weight:600">The participant's Supply Kit ID and USPS Tracking Number were successfully edited and saved!</p>
        </div>
      </div>
    </div>
  </div>
</div>`;
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  participantSelectionDropdown();

  redirectToKitShipment();
  for (let i = 0; i < response.data.length; i++) {
    editAssignedRow(i);
    saveAssignedRow(i);
  }
};

const createAssignedParticipantRows = (assignedParticipantsRows) => {
  let template = ``;
  // Use for loop on fake assigned data array, --> i is current object, index is current object number in array
  let uspsTrackingHolder = [];
  assignedParticipantsRows.forEach((i, index) => {
    uspsTrackingHolder.push(i.usps_trackingNum);
    template += `
      <tr id=row-${index} class="row-color-enrollment-dark participantRow">
        <td style="padding:1rem">${i.first_name}</td>
        <td style="padding:1rem">${i.last_name}</td>
        <td style="padding:1rem">${i.connect_id}</td>
        <td style="padding:1rem">${i.kit_status}</td>
        <td style="padding:1rem">${i.study_site}</td>
        <td style="padding:1rem">${i.date_requested}</td>
        <td id=kit-id-${index} style="padding:1rem">${i.supply_kitId}</td>
        <td id=usps-${index} style="padding:1rem">${i.usps_trackingNum}</td>

      <td style="height:100%; padding:1rem;" >
        <input type="button" id="edit-assign-button-${JSON.stringify(index)}"
          class="edit-assign-button"
            data-uspsTrackingNumber = ${i.usps_trackingNum} data-kitID= ${
      i.supply_kitId
    } data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
            data-address1= '${i.address_1}'
            data-city= '${i.city}'
            data-state= '${i.state}'
            data-zipCode= '${i.zip_code}'
            data-id='${i.id}'
            data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${
      i.address_1
    },\n${i.city}, ${i.state} ${i.zip_code} ${i.id}'
            value="Edit" >

        <input type="button" id="save-assign-button-${JSON.stringify(index)}"
       style="display:none;"
            data-uspsTrackingNumber= ${i.usps_trackingNum} data-kitID= ${
      i.supply_kitId
    } data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
            data-address1= '${i.address_1}'
            data-city= '${i.city}'
            data-state= '${i.state}'
            data-zipCode= '${i.zip_code}'
            data-id='${i.id}'
            data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${
      i.address_1
    },\n${i.city}, ${i.state} ${i.zip_code} ${i.id}'
            value="Save" data-toggle="modal" data-target="#editSuccessModal">
        </td>
      </tr>`;
  });
  return template;
};

// TODO: Add error handling and trim() to value inputs
const editAssignedRow = (i) => {
  let editButton = document.getElementById(`edit-assign-button-${i}`);
  let saveButton = document.getElementById(`save-assign-button-${i}`);

  editButton.addEventListener("click", (e) => {
    editButton.style.display = "none";
    saveButton.style.display = "block";

    // edit and target supply kit id and usps tracking number

    let supplyKitId = document.getElementById(`kit-id-${i}`);
    let uspsTrackingNumber = document.getElementById("usps-" + i);

    // Target the values in the innerHTML
    let supplyKitIdData = supplyKitId.innerHTML;
    let uspsTrackingNumberData = uspsTrackingNumber.innerHTML;

    // Change innerHTML with input element with original values from text inside
    supplyKitId.innerHTML = `<input type="text" id="supply-kit-id-text-${i}" value=${supplyKitIdData}></input>`;

    // uspsTrackingNumber.innnerHTML = `<input type="text" id="usps-number-text-${i}" value=${uspsTrackingNumberData}></input>`;
    uspsTrackingNumber.innerHTML = `<input type="text" id="usps-number-text-${i}" value=${uspsTrackingNumberData}></input>`;
  });
};

const saveAssignedRow = (i) => {
  let saveButton = document.getElementById(`save-assign-button-${i}`);
  let editButton = document.getElementById(`edit-assign-button-${i}`);

  saveButton.addEventListener("click", (e) => {
    // TODO: Add if else condtional checks in regards to successful inputs(Error Handling)
    if (false) {
      // TODO : Make Modal for an error?
      return;
    }
    console.log("test", editButton.dataset.id);

    let supplyKitIdValue = document.getElementById(
      `supply-kit-id-text-${i}`
    ).value;
    let uspsNumberValue = document.getElementById(
      `usps-number-text-${i}`
    ).value;
    console.log(
      "save...",
      supplyKitIdValue,
      uspsNumberValue,
      editButton.dataset.id
    );
    let jsonObj = {
      id: editButton.dataset.id,
      usps_trackingNum: uspsNumberValue,
      supply_kitId: supplyKitIdValue,
    };
    updateInputFields(jsonObj);
    document.getElementById("kit-id-" + i).innerHTML = supplyKitIdValue;
    document.getElementById("usps-" + i).innerHTML = uspsNumberValue;

    saveButton.style.display = "none";
    editButton.style.display = "block";
  });
};

/*
==================================
POST REQUEST - Updates participant data with kit status, usps tracking number supply kit id
==================================
*/
const updateInputFields = async (jsonObj) => {
  const idToken = await getIdToken();
  const response = await await fetch(
    `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=assignKit`,
    {
      method: "POST",
      body: JSON.stringify(jsonObj),
      headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 200) {
    return true;
  } else {
    alert("Error");
  }
};

const redirectToKitShipment = () => {
  const kitShipmentRedirection = document.getElementById("kitShipmentBtn");
  if (kitShipmentRedirection) {
    kitShipmentRedirection.addEventListener("click", () => {
      location.hash = "#kitshipment";
    });
  }
};
