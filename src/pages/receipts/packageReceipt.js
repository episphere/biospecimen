import { userDashboard } from "../dashboard.js";
import { getIdToken, showAnimation, hideAnimation } from "../../shared.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";

const inputObject = {
  inputChange: false
}


export const packageReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packageReceiptTemplate(username, auth, route);
  checkCourierType();
  checkCardIncluded();
  disableCollectionCardFields();
  enableCollectionCardFields();
  formSubmit();
  // cancelChanges();
  targetAnchorTagEl();

  // Receive Packages: barcode, packageconditions,receive package comments, date received
  const scannedBarcodeInputEl = document.getElementById("scannedBarcode");
  const packageConditionEl = document.getElementById("packageCondition");
  const receivePackageCommentsEl = document.getElementById("receivePackageComments");
  const dateReceivedEl = document.getElementById("dateReceived");

  scannedBarcodeInputEl.addEventListener("input",hasChanged)
  packageConditionEl.addEventListener("change",handleConditionChange)
  receivePackageCommentsEl.addEventListener("input",hasChanged)
  dateReceivedEl.addEventListener("input",hasChanged)

  // Collection Card Date Entry: collectionCheckBox,collectionId, dateCollectionCard,timeCollectionCard,collectionComments

  const collectionCheckBoxEl = document.getElementById("collectionCheckBox")
  const collectionIdEl = document.getElementById("collectionId")
  const dateCollectionCardEl = document.getElementById("dateCollectionCard")
  const timeCollectionCardEl = document.getElementById("timeCollectionCard")
  const collectionCommentsEl = document.getElementById("collectionComments")
  collectionCheckBoxEl.addEventListener("change",isChecked)
  collectionIdEl.addEventListener("input",hasChanged)
  dateCollectionCardEl.addEventListener("change",hasChanged)
  timeCollectionCardEl.addEventListener("input",hasChanged)
  collectionCommentsEl.addEventListener("input",hasChanged)

  
}

/*
scannedBarcodeInputEl 
receivePackageCommentsEl
dateReceivedEl
*/ 
const hasChanged = (e) => {
  if(e.target.value.trim() ==="") {
    inputObject.inputChange = false
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    // console.log(e.target.value,inputObject)
    
  }
  else if(e.target.value.trim() !== ""){
    inputObject.inputChange = true
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    // console.log(e.target.value,e.target,inputObject)
    // console.log(packageConditionsArr)
    return
  }
  else return
}

// collectionCheckBoxEl
const isChecked = (e) => {
  if(e.target.checked) {
    inputObject.inputChange = true
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    console.log(e.target.checked)
    console.log(e.target.value,inputObject)
  }
  else {
    inputObject.inputChange = false
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    console.log(e.target.checked)
    console.log(e.target.value,inputObject)
  }
}


// packageConditionEl
const handleConditionChange = (e) => {
  let arr = Array.from(e.target.selectedOptions, option => option.value);
  // Removes Empty String from first option value
  const filteredArr = arr.filter(condition => condition !== "")

  if(filteredArr.length) {
    // filteredArr.forEach(condition => packageConditionsArr.push(condition))
    inputObject.inputChange = true
    // call function to add eventlistener to anchor tags
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    console.log(filteredArr)
    console.log(inputObject)
  }
  else {
    inputObject.inputChange = false
    // call function to remove eventlistener from anchor tags
    targetAnchorTagEl(inputObject.inputChange)
    cancelChanges(inputObject.inputChange)
    console.log(filteredArr)
    console.log(inputObject)
  }
}


const packageReceiptTemplate = async (name, auth, route) => {
    let template = ``;
    template += receiptsNavbar();
    template += `  <div id="root root-margin" style="padding-top: 25px;">
                      <div id="alert_placeholder"></div>
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Package Receipt</h3> </span>
                      <form method="post" class="mt-3" id="configForm">
                        <h5 style="text-align: left;">Receive Packages</h5>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="scannedBarcode">Scan FedEx/USPS Barcode</label>
                            <div style="display:inline-block;">
                              <input autocomplete="off" required class="col-md-8" type="text" id="scannedBarcode" style="width: 600px;">
                              <span id='courierType' style="padding-left: 10px;"></span>
                            </div>
                        </div>
                        
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="packageConditionSelection">Select Package Condition</label>
                             <div style="display:inline-block; max-width:90%;"> 
                                <select required class="col form-control" id="packageCondition" style="width:100%" multiple="multiple">
                                    <option id="select-dashboard" value="">-- Select Package Condition --</option>
                                    <option id="select-noIcePack" value="noIcePack">No Ice Pack</option>
                                    <option id="select-warmIcePack" value="warmIcePack">Warm Ice Pack</option>
                                    <option id="select-incorrectMaterialTypeSent" value="incorrectMaterialTypeSent">Incorrect Material Type Sent</option>
                                    <option id="select-noLabelonVials" value="noLabelonVials">No Label on Vials</option>
                                    <option id="select-returnedEmptyVials" value="returnedEmptyVials">Returned Empty Vials</option>
                                    <option id="select-participantRefusal" value="participantRefusal">Participant Refusal</option>
                                    <option id="select-crushed" value="crushed">Crushed</option>
                                    <option id="select-damagedContainer" value="damagedContainer">Damaged Container (outer and inner)</option>
                                    <option id="select-materialThawed" value="materialThawed">Material Thawed</option>
                                    <option id="select-insufficientIce" value="insufficientIce">Insufficient Ice</option>
                                    <option id="select-improperPackaging" value=improperPackaging">Improper Packaging</option>
                                    <option id="select-damagedVials" value="damagedVials">Damaged Vials</option>
                                    <option id="select-other" value="other">Other</option>
                                    <option id="select-noPreNotification" value="noPreNotification">No Pre-notification</option>
                                    <option id="select-noRefrigerant" value="noRefrigerant">No Refrigerant</option>
                                    <option id="select-improperManifest" value="improperManifest">Improper/Incorrect Manifest</option> 
                                    <option id="select-infoDoNotMatch" value="infoDoNotMatch">Vial/Paperwork info do not match</option>
                                    <option id="select-shipmentDelay" value="shipmentDelay">Shipment Delay</option>
                                    <option id="select-noManifestProvided" value="noManifestProvided">No Manifest provided</option>
                                </select>
                                <br />
                                <span><h6><i>Press command/control to make multiple selections</i></h6></span>
                           </div>
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4">Comment</label>
                            <textarea class="col-md-8" required id="receivePackageComments" cols="30" rows="3"></textarea>
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                            <input autocomplete="off" required class="col-md-8 form-control" type="date" type="text" id="dateReceived">
                        </div>

                        <div id="collectionCard">
                            <h5 style="text-align: left;">Collection Card Data Entry</h5>

                            <div class="row form-group">
                                <label class="col-form-label col-md-4">Check if card not included</label>
                                <input type="checkbox" name="collectionCheckBox" id="collectionCheckBox">
                            </div>

                            <div class="row form-group">
                                <label class="col-form-label col-md-4">Collection ID</label>
                                <input autocomplete="off" class="col-md-8" type="text" id="collectionId">
                            </div>

                            <div class="row form-group">
                                <label class="col-form-label col-md-4" for="dateCollectionCard">Enter Collection Date from Collection Card</label>
                                <input autocomplete="off" class="col-md-8 form-control" type="date" id="dateCollectionCard">
                            </div>

                            <div class="row form-group">
                                <label class="col-form-label col-md-4" for="timeCollectionCard">Enter Collection Time from Collection Card</label>
                                <input autocomplete="off" class="col-md-8 form-control" type="time" step="1" id="timeCollectionCard">
                            </div>

                            <div class="row form-group">
                                <label class="col-form-label col-md-4">Comments on Card Returned</label>
                                <textarea class="col-md-8" id="collectionComments" cols="30" rows="3"></textarea>
                            </div>
                          </div>
                        
                        <div class="mt-4 mb-4" style="display:inline-block;">
                            <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                            <button type="submit" class="btn btn-primary" id="save">Save</button>
                        </div>

                    </form>
                   
                </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(name);
    activeReceiptsNavbar();
};

const checkCourierType = () => {
  // TODO: Add a stricter check
  const a = document.getElementById("scannedBarcode");
  if (a) {
    a.addEventListener("change", () => {
      if (a.value.trim().length <= 12) { 
            document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> FEDEX` 
            document.getElementById('collectionCheckBox').disabled = true;
            disableCollectionCardFields();
   
          }
            else {
            document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`}
    }) }
}

const checkCardIncluded = () => {
  const a = document.getElementById('collectionCheckBox')
  if (a) {
    a.addEventListener("change", () => {
      a.checked ? disableCollectionCardFields() : enableCollectionCardFields()
    })
}}

const disableCollectionCardFields = () => {
  document.getElementById('collectionId').disabled = true;
  document.getElementById('dateCollectionCard').disabled = true;
  document.getElementById('timeCollectionCard').disabled = true;
  document.getElementById('collectionComments').disabled = true;
}

const enableCollectionCardFields = () => {
  document.getElementById('collectionId').disabled = false;
  document.getElementById('dateCollectionCard').disabled = false;
  document.getElementById('timeCollectionCard').disabled = false;
  document.getElementById('collectionComments').disabled = false;
}


const formSubmit = () => {
  const form = document.getElementById('configForm');
  form.addEventListener('submit', e => {
      e.preventDefault();
      let obj = {};
      let packageConditions = [];
      obj['scannedBarcode'] = document.getElementById('scannedBarcode').value.trim();
      for (let option of document.getElementById('packageCondition').options) {
        if (option.selected) {packageConditions.push(option.value)}
      }
      obj['packageCondition'] = packageConditions;
      obj['receivePackageComments'] = document.getElementById('receivePackageComments').value.trim();
      obj['dateReceived'] = document.getElementById('dateReceived').value;
      if(document.getElementById('collectionId').value) {
        obj['collectionId'] = document.getElementById('collectionId').value;
        obj['dateCollectionCard'] = document.getElementById('dateCollectionCard').value;
        obj['timeCollectionCard'] = document.getElementById('timeCollectionCard').value;
        document.getElementById('collectionCheckBox').checked === true ? 
            obj['collectionCheckBox'] = true : obj['collectionCheckBox'] = false
        obj['collectionComments'] = document.getElementById('collectionComments').value;
       
      }
      // storePackageReceipt(obj);

  })
}      

// Important question: does an event listener need to be attached as soon as page loads?
// When page loads every input is blank.

// onload attach event listener
// input changes add event listener - use click me as test
// no input changes and not onload - remove click me as test

// Add two parameters and check truthy and falsy values
const cancelChanges = (inputChanges) => {
    const cancelChanges = document.getElementById("clearForm");
    if(inputChanges) {
      cancelChanges.addEventListener("click",cancelConfirm)
    }
    else {
      cancelChanges.removeEventListener("click",cancelConfirm)
    }
};

const cancelConfirm = (e) => {
    const cancelChanges = document.getElementById("clearForm");
    let result = confirm("Changes were made and will not be saved.")

    if(result){
      document.getElementById("courierType").innerHTML = ``;
      document.getElementById("scannedBarcode").value = "";
      document.getElementById("packageCondition").value = "";
      document.getElementById("receivePackageComments").value = "";
      document.getElementById("dateReceived").value = "";
      
      // Remove Later include with error handling for USPS and Fedex?
      enableCollectionCardFields()
      enableCollectionCheckBox()
      cancelChanges.removeEventListener("click",cancelConfirm)

      if (document.getElementById("collectionId").value) {
          document.getElementById("collectionId").value = "";
          document.getElementById("dateCollectionCard").value = "";
          document.getElementById("timeCollectionCard").value = "";
          document.getElementById("collectionCheckBox").checked = false;
          document.getElementById("collectionComments").value = "";

          // Remove Later include with error handling for USPS and Fedex?
          enableCollectionCardFields()
          enableCollectionCheckBox()
          cancelChanges.removeEventListener("click",cancelConfirm)
      }
    }
    else {
      return 
    }
  
}

const storePackageReceipt = async (data) => {
    showAnimation();
    const idToken = await getIdToken();
    const response = await await fetch(
        `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=storeReceipt`,
        {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Authorization: "Bearer " + idToken,
                "Content-Type": "application/json",
            },
        }
    );
    hideAnimation();
    if (response.status === 200) {
        let alertList = document.getElementById("alert_placeholder");
        let template = ``;
        template += `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                  Response saved!
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>`;
        alertList.innerHTML = template;
        return true;
    } else {
        alert("Error");
    }
};


/*
FUNCTIONS FOR UNSAVED CHANGES
*/

// Add to shared.js later as an export function expression
const targetAnchorTagEl = (state = false) => {
  // Target all items with anchor tags, convert HTML Collection to a normal array of elements
  // Filter and remove current anchor tag with the current location.hash
  console.log(location.hash)
  const allAnchorTags = Array.from(document.getElementsByTagName("a"));
  const filteredAnchorTags = allAnchorTags.filter(el => el.getAttribute("href") !== location.hash)
  
  // console.log(filteredAnchorTags)
  
  if(state) {
    allAnchorTags.forEach(el => {
        el.addEventListener("click", clickMe)
    })
  }
  else {
    allAnchorTags.forEach(el => {
      el.removeEventListener("click", clickMe)
    })
  }
}

function clickMe(e) {
  // REMOVE LATER- ADDED E PREVENT DEFAULT FOR TESTING PURPOSES
  e.preventDefault()
  console.log(e.target,"Clicked")
}

// document.getElementById("dateReceived").value

const enableCollectionCheckBox = () => {
  const collectionCheckBoxEl = document.getElementById("collectionCheckBox")
  collectionCheckBoxEl.removeAttribute("disabled")
  collectionCheckBoxEl.checked = false
}