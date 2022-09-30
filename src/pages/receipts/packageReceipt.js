import { userDashboard } from "../dashboard.js";
import { getIdToken, showAnimation, hideAnimation, baseAPI } from "../../shared.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import fieldMapping from "../../fieldToConceptIdMapping.js";

const inputObject = {
  inputChange: false
}

export const packageReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packageReceiptTemplate(username, auth, route);
  addDefaultDateReceived(getCurrentDate);
  checkAndDisplayCourierType();
  checkCardIncluded();
  disableCollectionCardFields();
  enableCollectionCardFields();
  formSubmit(); 
  targetAnchorTagEl();
  addListenersOnPageLoad();
  dropdownTrigger();
}

const packageReceiptTemplate = async (name, auth, route) => {
    let template = ``;
    template += receiptsNavbar();
    template += `  <div id="root root-margin" style="padding-top: 25px;">
                      <div id="alert_placeholder"></div>
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Package Receipt</h3> </span>
                      <div class="mt-3" >
                        <h5 style="text-align: left;">Receive Packages</h5>
                        <div style=" display:inline-block;" class="dropdown">
                          <button class="btn btn-secondary dropdown-toggle dropdown-toggle-sites" id="dropdownSelection" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Select Shipment
                          </button>
                          <ul class="dropdown-menu" id="dropdownMenuButtonSelection" aria-labelledby="dropdownMenuButton">
                              <li><a class="dropdown-item" data-siteKey="homeCollection" id="homeCollection">Home Collection Shipment</a></li>
                              <li><a class="dropdown-item" data-siteKey="siteShipment" id="siteShipment">Site Shipment</a></li>
                          </ul>
                      </div>
                      <br />
                    <div class="row form-group">
                      <label class="col-form-label col-md-4" for="scannedBarcode">Scan FedEx/USPS Barcode</label>
                      <div style="display:inline-block;">
                        <input autocomplete="off" required="" class="col-md-8" type="text" id="scannedBarcode" style="width: 600px;" placeholder="Scan a Fedex or USPS barcode">
                        <span id="courierType" style="padding-left: 10px;"></span>
                        <br />
                        <br />
                        <span><h6><i>Press command/control while clicking with the mouse to make multiple selections</i></h6></span>
                      </div>
                    </div>
                        
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="packageCondition">Select Package Condition</label>
                             <div style="display:inline-block; max-width:90%;"> 
                                <select required class="col form-control" id="packageCondition" style="width:100%" multiple="multiple" data-selected="[]">
                                    <option id="select-dashboard" value="">-- Select Package Condition --</option>
                                    <option id="select-packageGoodCondition" value=${fieldMapping.packageGood}>Package in good condition</option>
                                    <option id="select-noIcePack" value=${fieldMapping.coldPacksNone}>No Ice Pack</option>
                                    <option id="select-warmIcePack" value=${fieldMapping.coldPacksWarm}>Warm Ice Pack</option>
                                    <option id="select-incorrectMaterialTypeSent" value=${fieldMapping.vialsIncorrectMaterialType}>Vials - Incorrect Material Type Sent</option>
                                    <option id="select-noLabelonVials" value=${fieldMapping.vialsMissingLabels}>No Label on Vials</option>
                                    <option id="select-returnedEmptyVials" value=${fieldMapping.vialsEmpty}>Returned Empty Vials</option>
                                    <option id="select-participantRefusal" value=${fieldMapping.participantRefusal}>Participant Refusal</option>
                                    <option id="select-crushed" value=${fieldMapping.crushed}>Crushed</option>
                                    <option id="select-damagedContainer" value=${fieldMapping.damagedContainer}>Damaged Container (outer and inner)</option>
                                    <option id="select-materialThawed" value=${fieldMapping.materialThawed}>Material Thawed</option>
                                    <option id="select-insufficientIce" value=${fieldMapping.coldPacksInsufficient}>Insufficient Ice</option>
                                    <option id="select-improperPackaging" value=${fieldMapping.improperPackaging}>Improper Packaging</option>
                                    <option id="select-damagedVials" value=${fieldMapping.damagedVials}>Damaged Vials</option>
                                    <option id="select-other" value=${fieldMapping.other}>Other</option>
                                    <option id="select-noPreNotification" value=${fieldMapping.noPreNotification}>No Pre-notification</option>
                                    <option id="select-noRefrigerant" value=${fieldMapping.noRefrigerant}>No Refrigerant</option>
                                    <option id="select-infoDoNotMatch" value=${fieldMapping.manifestDoNotMatch}>Manifest/Vial/Paperwork info do not match</option>
                                    <option id="select-shipmentDelay" value=${fieldMapping.shipmentDelay}>Shipment Delay</option>
                                    <option id="select-noManifestProvided" value=${fieldMapping.manifestNotProvided}>No Manifest provided</option>
                                </select>
                           </div>
                        </div>
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="receivePackageComments">Comment</label>
                            <textarea class="col-md-8 form-control" id="receivePackageComments" cols="30" rows="3" placeholder="Any comments?"></textarea>
                        </div>
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                            <input autocomplete="off" required class="col-md-8 form-control" type="date" type="text" id="dateReceived" value=${getCurrentDate()}>
                        </div>
                        <div id="collectionCard">
                            <h5 style="text-align: left;">Collection Card Data Entry for Home Mouthwash Kits</h5>
                            <div class="row form-group">
                                <label class="col-form-label col-md-4 for="collectionCheckBox">Check if card not included</label>
                                <input type="checkbox" name="collectionCheckBox" id="collectionCheckBox">
                            </div>
                            <div class="row form-group">
                                <label class="col-form-label col-md-4" for="collectionId">Collection ID</label>
                                <input autocomplete="off" class="col-md-8 form-control" type="text" id="collectionId" placeholder="Scan or Enter a Collection ID">
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
                                <label class="col-form-label col-md-4" for="collectionComments">Comments on Card Returned</label>
                                <textarea class="col-md-8 form-control" id="collectionComments" cols="30" rows="3" placeholder="Comments on the card?"></textarea>
                            </div>
                          </div>
                        
                        <div class="mt-4 mb-4" style="display:inline-block;">
                            <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                            <button type="submit" class="btn btn-primary" data-toggle="modal" data-target="#modalShowMoreData" id="save">Save</button>
                        </div>
                    </div>
                </div>`;
    template += `<div class="modal fade" id="modalShowMoreData" data-keyboard="false" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">
                    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
                        <div class="modal-content sub-div-shadow">
                            <div class="modal-header" id="modalHeader"></div>
                            <div class="modal-body" id="modalBody"></div>
                        </div>
                    </div>
                </div>`
        
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeReceiptsNavbar();
};

const checkAndDisplayCourierType = () => {
  const a = document.getElementById("scannedBarcode");
  let input = ""
  if (a) {
    a.addEventListener("input", (e) => {
      input = e.target.value.trim()
      // None
      if(input.length === 0){
        document.getElementById('courierType').innerHTML = ``
        // enableCollectionCardFields();
        // document.getElementById('collectionCheckBox').checked = false;
        return
      }
      // USPS
      else if (uspsFirstThreeNumbersCheck(input) || (input.length === 34 && uspsFirstThreeNumbersCheck(input))) {
        // console.log(uspsFirstThreeNumbersCheck(input))
        document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`
        // document.getElementById('collectionCheckBox').checked = false;
        // document.getElementById('collectionCheckBox').removeAttribute("disabled")
        // enableCollectionCardFields();
        triggerErrorModal();
        return
      }
      // USPS
      else if (input.length === 22 || input.length === 20) {
        // console.log(uspsFirstThreeNumbersCheck(input))
        document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`
        // document.getElementById('collectionCheckBox').checked = false;
        // document.getElementById('collectionCheckBox').removeAttribute("disabled")
        // enableCollectionCardFields();
        triggerErrorModal();
        return
      }
      // FEDEX
      else if (input.length === 12) {
        document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> FEDEX` 
        // document.getElementById('collectionCheckBox').checked = false;
        // document.getElementById('collectionCheckBox').disabled = true;
        // checkCardIncluded();
        // disableCollectionCardFields();
        return
      }
      // FEDEX
      else if (input.length > 12) {
        document.getElementById('courierType').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> FEDEX`
        e.target.value = input.slice(-12)
        // document.getElementById('collectionCheckBox').checked = false;
        // document.getElementById('collectionCheckBox').disabled = true;
        // checkCardIncluded();
        // disableCollectionCardFields();
        return
      }
      // None
      else {
        document.getElementById('courierType').innerHTML = ``
        // document.getElementById('collectionCheckBox').checked = false;
        // document.getElementById('collectionCheckBox').removeAttribute("disabled")
        // enableCollectionCardFields();
        return
      }
    }) 
  }
};

const triggerErrorModal = () => {
    let alertList = document.getElementById("alert_placeholder");
        let template = ``;
        template += `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Scan limited only to FEDEX
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>`;
        alertList.innerHTML = template;
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
  const form = document.getElementById('save');
  form.addEventListener('click', e => {
    e.preventDefault();
    const modalHeaderEl = document.getElementById('modalHeader');
    const modalBodyEl = document.getElementById('modalBody');
    const isSelectPackageConditionsListEmpty = checkSelectPackageConditionsList() 

    if (isSelectPackageConditionsListEmpty) {
        displayPackageConditionListEmptyModal(modalHeaderEl,modalBodyEl)
    }
    else {
        displayConfirmPackageReceiptModal(modalHeaderEl,modalBodyEl)
        confirmPackageReceipt()
    }
  })
}

const confirmPackageReceipt = () => {
  const a = document.getElementById('confirmReceipt');
  if (a) {
    a.addEventListener('click',  () => { 
      let obj = {};
      let packageConditions = [];
      const scannedBarcode = document.getElementById('scannedBarcode').value.trim();
      const onlyFedexCourierType = identifyCourierType(scannedBarcode);
      if (onlyFedexCourierType === true) {
        obj['scannedBarcode'] = scannedBarcode
        for (let option of document.getElementById('packageCondition').options) {
          if (option.selected) {packageConditions.push(option.value)}
        }
        obj[`${fieldMapping.packageCondition}`] = packageConditions;
        if (scannedBarcode.length === 12 || (!uspsFirstThreeNumbersCheck(scannedBarcode))) {  
          obj[`${fieldMapping.siteShipmentReceived}`] = fieldMapping.yes
          obj[`${fieldMapping.siteShipmentComments}`] = document.getElementById('receivePackageComments').value.trim();
          obj[`${fieldMapping.siteShipmentDateReceived}`] = storeDateReceivedinISO(document.getElementById('dateReceived').value);
        } else { 
          obj['receivePackageComments'] = document.getElementById('receivePackageComments').value.trim();
          obj['dateReceived'] = storeDateReceivedinISO(document.getElementById('dateReceived').value);
          if(document.getElementById('collectionId').value) {
            obj['collectionId'] = document.getElementById('collectionId').value;
            obj['dateCollectionCard'] = document.getElementById('dateCollectionCard').value;
            obj['timeCollectionCard'] = document.getElementById('timeCollectionCard').value;
            document.getElementById('collectionCheckBox').checked === true ? 
                obj['collectionCheckBox'] = true : obj['collectionCheckBox'] = false
            obj['collectionComments'] = document.getElementById('collectionComments').value;
          }    
        }
        window.removeEventListener("beforeunload",beforeUnloadMessage)
        targetAnchorTagEl();
        storePackageReceipt(obj);
       } 
    })
  }
}

const identifyCourierType = (scannedBarcode) => {
 if (scannedBarcode.length === 12 || scannedBarcode.length > 12) {
    return true
  }
  else {
    return false
}}

const storeDateReceivedinISO = (date) => { // ("YYYY-MM-DD" to ISO format DateTime)
  const isoDateTime= new Date(date).toISOString();
  return isoDateTime
}

const storePackageReceipt = async (data) => {
    showAnimation();
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=storeReceipt`,
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
        document.getElementById("courierType").innerHTML = ``;
        document.getElementById("scannedBarcode").value = "";
        document.getElementById("packageCondition").value = "";
        document.getElementById("receivePackageComments").value = "";
        document.getElementById("dateReceived").value = getCurrentDate();
        
        document.getElementById("collectionComments").value = "";
        document.getElementById("collectionId").value = "";
        enableCollectionCardFields()
        enableCollectionCheckBox()
        document.getElementById("packageCondition").setAttribute("data-selected","[]")
        if (document.getElementById("collectionId").value) {
          document.getElementById("collectionId").value = "";
          document.getElementById("dateCollectionCard").value = "";
          document.getElementById("timeCollectionCard").value = "";
          document.getElementById("collectionCheckBox").checked = false;
          document.getElementById("collectionComments").value = "";
    
          enableCollectionCardFields();
          enableCollectionCheckBox();
          document.getElementById("packageCondition").setAttribute("data-selected","[]");
    
        }
    } else {
        alert("Error");
    }
};

const enableCollectionCheckBox = () => {
  const collectionCheckBoxEl = document.getElementById("collectionCheckBox")
  collectionCheckBoxEl.removeAttribute("disabled")
  collectionCheckBoxEl.checked = false
}

/*
=========================================
FUNCTIONS FOR UNSAVED CHANGES
=========================================
*/

/* TARGET ALL ANCHOR TAG ELEMENTS */ 
const targetAnchorTagEl = (inputChange = false) => {
  // Target all items with anchor tags, convert HTML Collection to a normal array of elements
  // Filter and remove current anchor tag with the current location.hash
  const allAnchorTags = Array.from(document.getElementsByTagName("a"));
  const filteredAnchorTags = allAnchorTags.filter(el => el.getAttribute("href") !== location.hash)
  
  if(inputChange) {
    filteredAnchorTags.forEach(el => {
        el.addEventListener("click", unsavedChangesRoutingMessage)
    })
  }
  else {
    filteredAnchorTags.forEach(el => {
      el.removeEventListener("click", unsavedChangesRoutingMessage)
    })
  }
}

/* ADD EVENT LISTENERS TO INPUTS THAT CAN BE SUBMITTED WHEN PAGE LOADS */ 
const addListenersOnPageLoad = () => {
  // Receive Packages: barcode, packageconditions,receive package comments, date received
  const scannedBarcodeInputEl = document.getElementById("scannedBarcode");
  const packageConditionEl = document.getElementById("packageCondition");
  const receivePackageCommentsEl = document.getElementById("receivePackageComments");
  const dateReceivedEl = document.getElementById("dateReceived");

  scannedBarcodeInputEl.addEventListener("input", hasInputChanged)
  packageConditionEl.addEventListener("change",handleConditionChange)
  receivePackageCommentsEl.addEventListener("input", hasInputChanged)
  dateReceivedEl.addEventListener("input", hasInputDateChanged)

  // Collection Card Date Entry: collectionCheckBox,collectionId, dateCollectionCard,timeCollectionCard,collectionComments

  const collectionCheckBoxEl = document.getElementById("collectionCheckBox")
  const collectionIdEl = document.getElementById("collectionId")
  const dateCollectionCardEl = document.getElementById("dateCollectionCard")
  const timeCollectionCardEl = document.getElementById("timeCollectionCard")
  const collectionCommentsEl = document.getElementById("collectionComments")
  collectionCheckBoxEl.addEventListener("change",isChecked)
  collectionIdEl.addEventListener("input", hasInputChanged)
  dateCollectionCardEl.addEventListener("change", hasInputChanged)
  timeCollectionCardEl.addEventListener("input", hasInputChanged)
  collectionCommentsEl.addEventListener("input", hasInputChanged)
}

/* NAMED EVENT LISTENERS FOR UNSAVED CHANGES ADDED / REMOVED */

const unsavedChangesRoutingMessage = (e) => {
  unsavedMessageConfirmation(e)
}

// Reusable message alert
const unsavedMessageConfirmation = (e) => {
  const result = confirm("Changes were made and will not be saved.\n\nAre you sure you want to leave the page? ")
  if(!result) {
    e.preventDefault()
    return false
  }
  else { 
    // IMPORTANT - REMOVES EVENT LISTENER FROM WINDOW OBJECT AFTER ROUTE CHANGE IS CONFIRMED
    window.removeEventListener("beforeunload",beforeUnloadMessage)
    return true
  }
}

/*
WINDOW
*/
const beforeUnloadMessage = (e) => { 
  e.preventDefault()
  // Chrome requires returnValue to be set.
  e.returnValue = "";
  return
}

/*
INPUT ELEMENTS - scannedBarcodeInputEl, receivePackageCommentsEl, dateReceivedEl
*/ 
const hasInputChanged = (e) => {
  // array of input has no value of true (false to true)
  if(e.target.value.trim() ==="" && !checkAllInputChanges()) {
    inputObject.inputChange = false
    targetAnchorTagEl(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
  else if(e.target.value.trim() !== ""){
    inputObject.inputChange = true
    targetAnchorTagEl(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
    return
  }
}

/*
INPUT(DATE) ELEMENT - dateReceivedEl
*/ 
const hasInputDateChanged = (e) => {
    if(e.target.value.trim() === getCurrentDate() && !checkAllInputChanges()) {
      inputObject.inputChange = false
      targetAnchorTagEl(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
    }
    else if(e.target.value.trim() !== getCurrentDate()){
      inputObject.inputChange = true
      targetAnchorTagEl(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
      return
    }
}

// INPUT(CHECKBOX) ELEMENT - collectionCheckBoxEl
const isChecked = (e) => {
  if(e.target.checked) {
    inputObject.inputChange = true
    targetAnchorTagEl(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
  // if no check and array of input has no value of true (false to true)
  else if (!e.target.checked && !checkAllInputChanges()){
    inputObject.inputChange = false
    targetAnchorTagEl(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
}

// SELECT ELEMENT - packageConditionEl
const handleConditionChange = (e) => {
  let arr = Array.from(e.target.selectedOptions, option => option.value);
  // Removes Empty String from first option value
  const filteredArr = arr.filter(condition => condition !== "")

  if(filteredArr.length) {
    // filteredArr.forEach(condition => packageConditionsArr.push(condition))
    inputObject.inputChange = true
    document.getElementById("packageCondition").setAttribute("data-selected",`${JSON.stringify(filteredArr)}`)
    // call function to add eventlistener to anchor tags  
    targetAnchorTagEl(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
  // if no check and array of input has no value of true (false to true)
  else if(!filteredArr.length){
    // set data-selected attribute
    document.getElementById("packageCondition").setAttribute("data-selected","[]")
    if(!checkAllInputChanges()){
      inputObject.inputChange = false
      // call function to remove eventlistener from anchor tags
      targetAnchorTagEl(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
    }
  }
}

const cancelConfirm = () => {
  const clearButtonEl = document.getElementById("clearForm");
  let result = confirm("Changes were made and will not be saved.")

  if(result){
    document.getElementById("courierType").innerHTML = ``;
    document.getElementById("scannedBarcode").value = "";
    document.getElementById("packageCondition").value = "";
    document.getElementById("receivePackageComments").value = "";
    document.getElementById("dateReceived").value = getCurrentDate();
    
    document.getElementById("collectionComments").value = "";
    document.getElementById("collectionId").value = "";
    enableCollectionCardFields()
    enableCollectionCheckBox()
    document.getElementById("packageCondition").setAttribute("data-selected","[]")
    targetAnchorTagEl()
    clearButtonEl.removeEventListener("click",cancelConfirm)
    window.removeEventListener("beforeunload",beforeUnloadMessage)
    
    if (document.getElementById("collectionId").value) {
      document.getElementById("collectionId").value = "";
      document.getElementById("dateCollectionCard").value = "";
      document.getElementById("timeCollectionCard").value = "";
      document.getElementById("collectionCheckBox").checked = false;
      document.getElementById("collectionComments").value = "";

      enableCollectionCardFields();
      enableCollectionCheckBox();
      document.getElementById("packageCondition").setAttribute("data-selected","[]");
      targetAnchorTagEl()
      clearButtonEl.removeEventListener("click",cancelConfirm);
      window.removeEventListener("beforeunload",beforeUnloadMessage);

    }
  }
  else {
    return 
  }
}

// OTHER UNSAVED CHANGES FUNCTIONS 

const unsavedMessageUnload = (inputChange) => {
  if(inputChange) {
    window.addEventListener("beforeunload",beforeUnloadMessage)
  }
  else if (!inputChange) {
    window.removeEventListener("beforeunload",beforeUnloadMessage)
  }
}

// Add two parameters and check truthy and falsy values
const clearChanges = (inputChanges) => {
  const clearButtonEl = document.getElementById("clearForm");
  if(inputChanges) {
    clearButtonEl.addEventListener("click",cancelConfirm)
  }
  else {
    clearButtonEl.removeEventListener("click",cancelConfirm)
  }
};

const checkAllInputChanges = () => {
  /*
  Get values, data-sets, checked ---> 
  Compare to --> 
  empty string, data-selected not "", checkbox not checked
  || document.getElementById("packageCondition").getAttribute("data-selected").length !== 0
  */ 
  // Input Change made !== "" or checked === true or data selected any option element selected !== "select packaage condition"

  const condition1 = document.getElementById("scannedBarcode").value !== "" 
  const condition2 = parseDataSelected(document.getElementById("packageCondition").getAttribute("data-selected"))
  const condition3 = document.getElementById("receivePackageComments").value !== "";
  const condition4 = document.getElementById("dateReceived").value !== getCurrentDate();

  const condition5 = document.getElementById("collectionCheckBox").checked === true;
  const condition6 = document.getElementById("collectionId").value !== "";
  const condition7 = document.getElementById("dateCollectionCard").value !== "";
  const condition8 = document.getElementById("timeCollectionCard").value !== "";
  const condition9 = document.getElementById("collectionComments").value !== "";
  const conditionsArr = [
    condition1,
    condition2,
    condition3,
    condition4,
    condition5,
    condition6,
    condition7,
    condition8,
    condition9
  ]
  // if any items returns true (Any input changes are made)
  if(conditionsArr.includes(true)) {
    return true
  } else return false
}

const parseDataSelected = (value) => {
  let parseData = JSON.parse(value)
  if(parseData.length === 0){
    return false
  }
  else if (parseData.length > 0) {
    return true
  }
  return false
}

const addDefaultDateReceived = (getCurrentDate) => {
  const dateReceivedEl = document.getElementById("dateReceived")
  if(getCurrentDate()){
    dateReceivedEl.value = getCurrentDate()
  }
  else dateReceivedEl.value = ""
}

// returns current date in english canada format ("YYYY-MM-DD")
const getCurrentDate = () => new Date().toLocaleDateString('en-CA');

const uspsFirstThreeNumbersCheck = (input) => {
  const regExp = /^420[0-9]{31}$/
  return regExp.test(input);
}

const dropdownTrigger = () => {
  let a = document.getElementById('dropdownSelection');
  let dropdownMenuButton = document.getElementById('dropdownMenuButtonSelection');
  const tempCategory = a.innerHTML.trim();
  if (dropdownMenuButton) {
      dropdownMenuButton.addEventListener('click', async (e) => {
          if (tempCategory === 'Select Shipment' || tempCategory === 'Home Collection Shipment' || tempCategory === 'Site Shipment') {
              a.innerHTML = e.target.textContent;
              controlCollectionCardField(e.target.textContent)
          }
      })
  }
}

const controlCollectionCardField = (dropdownSelection) => {
  if (dropdownSelection === 'Site Shipment') {
    document.getElementById('collectionCheckBox').checked = false;
    document.getElementById('collectionCheckBox').disabled = true;
    disableCollectionCardFields()
  } else { 
    document.getElementById('collectionCheckBox').checked = false;
    document.getElementById('collectionCheckBox').removeAttribute("disabled")
    enableCollectionCardFields() 
  }
} 
const checkSelectPackageConditionsList = () => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected')
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList)
    if(parseSelectPackageConditionsList.length === 0) {
        return true
    }
    else return false
}

const displayPackageConditionListEmptyModal = (modalHeaderEl,modalBodyEl) => {
    modalHeaderEl.innerHTML = `
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>`
    modalBodyEl.innerHTML =  `<div class="row">
        <div class="col">
            <div style="display:flex; justify-content:center; margin-bottom:1rem;">
            <i class="fas fa-exclamation-triangle fa-5x" style="color:#ffc107"></i>
            </div>
            <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; ">
                <span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Package Condition</span> 
                Please select package condition(s).
            </p>
        </div>
    </div>
    <div class="row" style="display:flex; justify-content:center;">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" target="_blank">Close</button>
    </div>
    </div>`
}

const displayConfirmPackageReceiptModal = (modalHeaderEl,modalBodyEl) => {
    modalHeaderEl.innerHTML = `<h5>Confirmation</h5>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>`
    modalBodyEl.innerHTML = `<div>
        <span>Confirm package receipt</span>
        <br >
        <div style="display:inline-block;">
            <button type="submit" class="btn btn-primary" data-dismiss="modal" id="confirmReceipt" target="_blank">Confirm</button>
            <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank">Cancel</button>
        </div>
    </div>`
}