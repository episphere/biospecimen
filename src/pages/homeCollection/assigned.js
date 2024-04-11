import { getIdToken, findParticipant, showAnimation, hideAnimation, getParticipantSelection} from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { kitStatusSelectionDropdown } from "./kitStatusReports.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";

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
  template += displayKitStatusReportsHeader();
  template += ` <div class="container-fluid">
                    <div id="root root-margin">
                      <div id="alert_placeholder"></div>
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
                                    <tbody style="font-size:.9rem;">
                                       ${createAssignedParticipantRows(response.data)}
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
  kitStatusSelectionDropdown();
  activeHomeCollectionNavbar()
                                      
  redirectToKitShipment();
  for (let i = 0; i < response.data.length; i++) {
    editAssignedRow(i);
    saveAssignedRow(i);
    cancelEdit(i)
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
        <div style="display:flex; justify-content:center;">
          <button id="edit-assign-button-${JSON.stringify(index)}"
            class="edit-assign-button bg-primary"
            style="width:32px;height:32px; color:#fff; border:0;"
              data-uspsTrackingNumber = ${i.usps_trackingNum} data-kitID= ${i.supply_kitId} 
              data-firstName= '${i.first_name}' 
              data-lastName= '${i.last_name}'
              data-address1= '${i.address_1}'
              data-city= '${i.city}'
              data-state= '${i.state}'
              data-zipCode= '${i.zip_code}'
              data-id='${i.id}'
              data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${i.address_1},\n${i.city}, ${i.state} ${i.zip_code} ${i.id}'
              value="Edit" ><i class="fas fa-edit" style="font-size:1.2rem"></i></button>
        </div>
        <div style="display:flex; justify-content:center;">
          <button id="cancel-assign-button-${JSON.stringify(index)}"
            class="edit-save-button bg-light"
            style="display:none; position:relative; width:32px; height:32px; margin-right:.5rem; border:2px solid #545454; background-color:#fff;"
              data-uspsTrackingNumber= ${i.usps_trackingNum} 
              data-kitID= ${i.supply_kitId} 
              data-firstName= '${i.first_name}' 
              data-lastName= '${i.last_name}'
              data-address1= '${i.address_1}'
              data-city= '${i.city}'
              data-state= '${i.state}'
              data-zipCode= '${i.zip_code}'
              data-id='${i.id}'
              data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${i.address_1},\n${i.city}, ${i.state} ${i.zip_code} ${i.id}'
              value="Close"><i class="fas fa-times" style="font-size: 1.5rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color:#545454;"></i></button>

          <button id="save-assign-button-${JSON.stringify(index)}"
              class="edit-save-button bg-success"
              style="display:none; position:relative; width:32px; height:32px; background-color:#5cb85c; border:0;"
                data-uspsTrackingNumber= ${i.usps_trackingNum} 
                data-kitID= ${i.supply_kitId} 
                data-firstName= '${i.first_name}' 
                data-lastName= '${i.last_name}'
                data-address1= '${i.address_1}'
                data-city= '${i.city}'
                data-state= '${i.state}'
                data-zipCode= '${i.zip_code}'
                data-id='${i.id}'
                data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${i.address_1},\n${i.city}, ${i.state} ${i.zip_code} ${i.id}'
                value="Save" data-toggle="modal"><i class="fas fa-check" style="color:#fff; font-size: 1.1rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></i></button>
          </div>
        </td>
      </tr>`;
  });
  return template;
};

// TODO: Add error handling and trim() to value inputs
const editAssignedRow = (i) => {
  let editButton = document.getElementById(`edit-assign-button-${i}`);
  let saveButton = document.getElementById(`save-assign-button-${i}`);
  let cancelButton = document.getElementById(`cancel-assign-button-${i}`);

  editButton.addEventListener("click", (e) => {
    editButton.style.display = "none";
    saveButton.style.display = "block";
    cancelButton.style.display = "block"

    // edit and target supply kit id and usps tracking number

    let supplyKitId = document.getElementById(`kit-id-${i}`);
    let uspsTrackingNumber = document.getElementById("usps-" + i);

    // Target the values in the innerHTML
    let supplyKitIdData = supplyKitId.innerHTML;
    let uspsTrackingNumberData = uspsTrackingNumber.innerHTML;

    // Change innerHTML with input element with original values from text inside
    supplyKitId.innerHTML = `<input type="text" id="supply-kit-id-text-${i}" value=${supplyKitIdData} style="width:95px;"></input>`;

    uspsTrackingNumber.innerHTML = `<input type="text" id="usps-number-text-${i}" value=${uspsTrackingNumberData} style="width:190px;"></input>`;
  });
};

const saveAssignedRow = (i) => {
  let saveButton = document.getElementById(`save-assign-button-${i}`);
  let editButton = document.getElementById(`edit-assign-button-${i}`);
  let cancelButton = document.getElementById(`cancel-assign-button-${i}`);

  saveButton.addEventListener("click", (e) => {
    let supplyKitIdValue = document.getElementById(`supply-kit-id-text-${i}`).value;
    let uspsNumberValue = document.getElementById(`usps-number-text-${i}`).value;

    if (uspsNumberValue === `` || supplyKitIdValue === ``) {
      let alertList = document.getElementById("alert_placeholder");
        let template = ``;
        template += `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                  One or both input responses are empty!
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>`;
        alertList.innerHTML = template;
    } else {
      let jsonObj = {
        id: editButton.dataset.id,
        usps_trackingNum: uspsNumberValue,
        supply_kitId: supplyKitIdValue,
      };
      // Change edit buttons dataset attributes to maintain current state of supply kit id and usps tracking number after saved
      editButton.setAttribute("data-uspstrackingnumber", `${uspsNumberValue}`);
      editButton.setAttribute("data-kitid", `${supplyKitIdValue}`); 
      updateInputFields(jsonObj);
      document.getElementById("kit-id-" + i).innerHTML = supplyKitIdValue;
      document.getElementById("usps-" + i).innerHTML = uspsNumberValue;

      saveButton.style.display = "none";
      cancelButton.style.display = "none"
      editButton.style.display = "block";

      let alertList = document.getElementById("alert_placeholder");
      let template = ``;
      template += `
              <div class="alert alert-success alert-dismissible fade show" role="alert">
                Response Saved!
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
              </div>`;
      alertList.innerHTML = template;
    }
    });
};

const cancelEdit = (i) => {
  let saveButton = document.getElementById(`save-assign-button-${i}`);
  let editButton = document.getElementById(`edit-assign-button-${i}`);
  let cancelButton = document.getElementById(`cancel-assign-button-${i}`);
  cancelButton.addEventListener("click",(e) => {
    // Targets td cell of supply kit id and usps tracking number
    let supplyKitIdText = document.getElementById(`supply-kit-id-text-${i}`);
    let uspsNumberText = document.getElementById(`usps-number-text-${i}`);

    // Target and get access to the values of the edit buttons dataset kitid and usps tracking number value
    let editButtonKitIdValue = editButton.getAttribute("data-kitid")
    let editButtonUspsNumValue = editButton.getAttribute("data-uspstrackingnumber")

    // Updates supply kit id and usps number text from targetted input element 
    supplyKitIdText.setAttribute("data-kitid",editButtonKitIdValue)
    uspsNumberText.setAttribute("data-uspstrackingnumber",editButtonUspsNumValue)
    document.getElementById("kit-id-" + i).innerHTML = supplyKitIdText.getAttribute("data-kitid");
    document.getElementById("usps-" + i).innerHTML = uspsNumberText.getAttribute("data-uspstrackingnumber");

    // Toggles appearance by hiding cancel and save button, edit becomes visible 
    saveButton.style.display = "none";
    cancelButton.style.display = "none"
    editButton.style.display = "block";
  })
}

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
    return false;
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