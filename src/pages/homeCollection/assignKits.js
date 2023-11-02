import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, triggerErrorModal, triggerSuccessModal, baseAPI } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import { getTotalAddressesToPrint } from "./printLabels.js";
import conceptIds from '../../fieldToConceptIdMapping.js';

const contentBody = document.getElementById("contentBody");

export const assignKitsScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  assignKitsTemplate(name);
}

const assignKitsTemplate = async (name) => {
  showAnimation();
  const response = await getTotalAddressesToPrint();
  hideAnimation();
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Assign Kits</h3></div>
                </div>`;

  template += `
  <div class="row">
      <div class="col">
        <div id="alert_placeholder"></div>
          <form>
                <div class="form-group row">
                  <label for="fullName" class="col-md-4 col-form-label">Full Name</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="fullName" placeholder="Enter Full Name">
                  </div>
                </div>
                <div class="form-group row">
                  <label for="address" class="col-md-4 col-form-label">Address</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="address" placeholder="Enter Address">
                  </div>
                </div>
                <div class="form-group row">
                  <label for="Connect_ID" class="col-md-4 col-form-label">Connect_ID</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="Connect_ID" placeholder="Enter Connect ID">
                  </div>
                </div>
                <div class="form-group row">
                  <label for="scanSupplyKit" class="col-md-4 col-form-label">Scan Supply Kit</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="scanSupplyKit" placeholder="Scan Supply Kit ID">
                  </div>
                </div>
                <div class="form-group row">
                <label for="scannedBarcode" class="col-md-4 col-form-label">Tracking Number</label>
                <div class="col-md-8">
                  <input type="text" class="form-control" id="scannedBarcode" placeholder="Scan FedEx Barcode">
                  <span id="showErrorMsg" style="font-size: 14px;"></span>
                </div>
              </div>
        </form>
        <div class="mt-4 mb-4" style="display:inline-block;">
          <button type="button" class="btn btn-primary" id="clearForm" disabled>View Assigned Kits</button>
          <button type="submit" class="btn btn-primary" id="confirmAssignment">Confirm Assignment</button>
        </div>
      </div>
      <div class="col-6">
        <div id="sidePane" style="width: 700px; height: 400px; overflow: auto; border: 1px solid #000">
        </div>
      </div>
</div>`;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;
  activeHomeCollectionNavbar();
  populateSidePaneRows(response.data);
  confirmAssignment(response.data);
  checkTrackingNumberValid();
};

const populateSidePaneRows = (participants) => {
  document.getElementById('sidePane').innerHTML += `&nbsp;<b>Participants :</b> ${Object.keys(participants).length}`
  participants.forEach((participant) => {
    document.getElementById('sidePane').innerHTML += `
            <ul style="overflow-y: scroll;">
            <br />
              ${participant['first_name'] + ' ' + participant['last_name']} |
              ${participant['address_1'] + ' ' + participant['address_2'] + ' ' + participant['city'] + ' ' + participant['state'] + ' ' + 
                participant['zip_code']} | ${participant['connect_id']}
              <button type="button" class="btn btn-link detailedRow"  data-firstName = '${participant.first_name}' data-lastName = '${participant.last_name}'
              data-address1= '${participant.address_1}'
              data-city= '${participant.city}'
              data-state= '${participant.state}'
              data-zipCode= '${participant.zip_code}'
              data-connectId= '${participant.connect_id}'
              id="selectParticipants">Select</button>
            </ul>
          </div>`
  })
  selectParticipants();
}

const checkTrackingNumberValid = () => {
    const checkTrackingNumber = document.getElementById("scannedBarcode");
    if (checkTrackingNumber) {
      checkTrackingNumber.addEventListener("input", (e) => {
        const input = e.target.value.trim()
        if (input.length !== 12 ) {
          document.getElementById('showErrorMsg').innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i> Scan limited only to Fedex`
          return
        }
        else if(input.length === 0){
          document.getElementById('showErrorMsg').innerHTML = ``
          return
        }
        else {
          document.getElementById('showErrorMsg').innerHTML = ``
          return
        }
      })
    }
  };

const selectParticipants = () => {
  const detailedRow = Array.from(document.getElementsByClassName('detailedRow'));
  if (detailedRow) {
    Array.from(detailedRow).forEach(function(selectPtBtn) {
      selectPtBtn.addEventListener('click', () => {
        document.getElementById('fullName').value = selectPtBtn.getAttribute('data-firstName') + ' ' + selectPtBtn.getAttribute('data-lastName')
        document.getElementById('address').value = selectPtBtn.getAttribute('data-address1') + ' ' + selectPtBtn.getAttribute('data-city') + ' ' + 
        selectPtBtn.getAttribute('data-state') + ' ' + selectPtBtn.getAttribute('data-zipCode')
        document.getElementById('Connect_ID').value = selectPtBtn.getAttribute('data-connectId')
      });
    });
}}

const confirmAssignment = (participants) => {
  const confirmAssignmentBtn = document.getElementById('confirmAssignment');
  if (confirmAssignmentBtn) {
    confirmAssignmentBtn.addEventListener('click', async () => { 
      let obj = {};
      obj['fullName'] = document.getElementById('fullName').value;
      obj['address'] = document.getElementById('address').value;
      obj[conceptIds.supplyKitTrackingNum] = document.getElementById('scannedBarcode').value.trim();
      obj[conceptIds.supplyKitId] = document.getElementById('scanSupplyKit').value.trim();
      obj['Connect_ID'] = document.getElementById('Connect_ID')?.value;
      const assignmentStatus = await processConfirmedAssignment(obj);
      if (assignmentStatus) {
        document.getElementById('fullName').value = ``;
        document.getElementById('address').value = ``;
        document.getElementById('Connect_ID').value = ``;
        document.getElementById('scannedBarcode').value = ``;
        document.getElementById('scanSupplyKit').value = ``;
        const filteredParticipants  = participants.filter((participant) => {
            return participant['connect_id'] !== obj['Connect_ID'];
        });
        repopulateSidePaneRows(filteredParticipants)
    }
    else {
        document.getElementById('fullName').value = obj['fullName'];
        document.getElementById('address').value = obj['address'];
        document.getElementById('Connect_ID').value = obj[conceptIds.supplyKitTrackingNum];
        document.getElementById('scannedBarcode').value = obj[conceptIds.supplyKitId];
        document.getElementById('scanSupplyKit').value =  obj['Connect_ID'];
        }
    })
  }
}

const processConfirmedAssignment = async (assignment) => {
    showAnimation();
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=assignKit`, {
        method: "POST",
        body: JSON.stringify(assignment),
        headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
        },
    });
    hideAnimation();
    if (response.status === 200) {
        triggerSuccessModal('Kit assigned to participant.')
        return true
    }
    else {
        triggerErrorModal(`Can't assign kit to participant.`)
        return false
    }
}

const repopulateSidePaneRows = (participants) => {
  document.getElementById('sidePane').innerHTML = ``
  participants.forEach((participant) => {
    document.getElementById('sidePane').innerHTML += `<div>
            <ul style="overflow-y: scroll;">
            <br />
              ${participant['first_name'] + ' ' + participant['last_name']} |
              ${participant['address_1'] + ' ' + participant['address_2'] + ' ' + participant['city'] + ' ' + participant['state'] + ' ' + 
                participant['zip_code']} | ${participant['connect_id']}
              <button type="button" class="btn btn-link detailedRow"  data-firstName = '${participant.first_name}' data-lastName = '${participant.last_name}'
              data-address1= '${participant.address_1}'
              data-city= '${participant.city}'
              data-state= '${participant.state}'
              data-zipCode= '${participant.zip_code}'
              data-connectId= '${participant.connect_id}'
              id="selectParticipants">Select</button>
            </ul>
          </div>`
  })
  selectParticipants();
}