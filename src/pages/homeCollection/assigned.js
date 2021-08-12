import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";
import { participantSelectionDropdown } from "./printAddresses.js";

const placeholderAssignedData = [
  {
    first_name: "Jolyene",
    last_name: "Cujoh",
    connect_id: "7756917180",
    kit_status: "Assigned",
    address_1: "34442 Steve Hunt Road",
    address_2: null,
    city: "Miami",
    state: "FL",
    zip_code: 33131,
    date_requested: "08/04/2021",
    usps_tracking_number: 26091708560117153712,
    kit_id: "JSO784103",
    study_site: "KP FL",
  },
  {
    first_name: "Arcueid",
    last_name: "Brunestud",
    connect_id: "1753927180",
    kit_status: "Assigned",
    address_1: "1171 Doe Meadow Drive",
    address_2: null,
    city: "Maryland",
    state: "MD",
    zip_code: 20014,
    date_requested: "08/04/2021",
    usps_tracking_number: 42551059936003641131,
    kit_id: "FGO444100",
    study_site: "KP MD",
  },
];

const assignedParticipants = JSON.parse(
  JSON.stringify([...placeholderAssignedData])
);

export const assignedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  aassignedTemplate(auth, route);
};

const aassignedTemplate = async (auth, route) => {
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
                                         assignedParticipants
                                       )}
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
    </div>
    <div class="modal-body" style="display:flex; flex-direction:column; justify-content:center;align-items:center">
          <object data="../../../static/images/modals/check-circle-solid.svg" width="200" height="150px"></object>
          <h1 class="text-success" style:"margin:1.5rem 0 2rem 0;">Success!</h1>
          <p style="text-align:center; margin:1.5rem 0 2rem 0; font-weight:600">The participant's Supply Kit ID and USPS Tracking Number were successfully edited and saved!</p>
        </div>
      </div>
    </div>
  </div>
</div>`;

  document.getElementById("contentBody").innerHTML = template;
  participantSelectionDropdown();
  console.log(assignedParticipants);

  for (let i = 0; i < assignedParticipants.length; i++) {
    console.log(i);
    editAssignedRow(i);
    saveAssignedRow(i);
  }
};

const createAssignedParticipantRows = (assignedParticipantsRows) => {
  let template = ``;
  // Use for loop on fake assigned data array, --> i is current object, index is current object number in array
  assignedParticipantsRows.forEach((i, index) => {
    template += `
      <tr id=row-${index} class="row-color-enrollment-dark participantRow">
        <td style="padding:1rem">${i.first_name}</td>
        <td style="padding:1rem">${i.last_name}</td>
        <td style="padding:1rem">${i.connect_id}</td>
        <td style="padding:1rem">${i.kit_status}</td>
        <td style="padding:1rem">${i.study_site}</td>
        <td style="padding:1rem">${i.date_requested}</td>
        <td id=kit-id-${index} style="padding:1rem">${i.kit_id}</td>
        <td id=usps-${index} style="padding:1rem">${i.usps_tracking_number}</td>

      <td style="height:100%; padding:1rem;" >
        <input type="button" id="edit-assign-button-${JSON.stringify(index)}"
          class="edit-assign-button"
            data-uspsTrackingNumber = ${i.usps_tracking_number} data-kitID= ${
      i.kit_id
    } data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
            data-address1= '${i.address_1}'
            data-city= '${i.city}'
            data-state= '${i.state}'
            data-zipCode= '${i.zip_code}'
            data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${
      i.address_1
    },\n${i.city}, ${i.state} ${i.zip_code}'
            value="Edit" >

        <input type="button" id="save-assign-button-${JSON.stringify(index)}"
       style="display:none;"
            data-uspsTrackingNumber= ${i.usps_tracking_number} data-kitID= ${
      i.kit_id
    } data-firstName= '${i.first_name}' data-lastName= '${i.last_name}'
            data-address1= '${i.address_1}'
            data-city= '${i.city}'
            data-state= '${i.state}'
            data-zipCode= '${i.zip_code}'
            data-kitAssignmentInfo = '${i.first_name} ${i.last_name}\n${
      i.address_1
    },\n${i.city}, ${i.state} ${i.zip_code}'
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
    console.log("edit button clicked!");
    editButton.style.display = "none";
    saveButton.style.display = "block";

    // edit and target supply kit id and usps tracking number

    let supplyKitId = document.getElementById(`kit-id-${i}`);
    let uspsTrackingNumber = document.getElementById("usps-" + i);

    // console.log(supplyKitId);
    console.log(uspsTrackingNumber);

    // Target the values in the innerHTML
    let supplyKitIdData = supplyKitId.innerHTML;
    let uspsTrackingNumberData = uspsTrackingNumber.innerHTML;
    // console.log(supplyKitIdData, uspsTrackingNumberData);

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
    console.log("save button clicked!");
    if (false) {
      return;
    }
    let supplyKitIdValue = document.getElementById(
      `supply-kit-id-text-${i}`
    ).value;
    let uspsNumberValue = document.getElementById(
      `usps-number-text-${i}`
    ).value;

    document.getElementById("kit-id-" + i).innerHTML = supplyKitIdValue;
    document.getElementById("usps-" + i).innerHTML = uspsNumberValue;

    console.log(supplyKitIdValue);

    saveButton.style.display = "none";
    editButton.style.display = "block";
  });
};
