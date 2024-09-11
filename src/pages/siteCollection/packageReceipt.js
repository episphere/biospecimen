import { getIdToken, showAnimation, hideAnimation, baseAPI, convertDateReceivedinISO, checkTrackingNumberSource, getCurrentDate, locationConceptIDToLocationMap, retrieveDateFromIsoString, showNotificationsCancelOrContinue, showNotificationsSelectableList, triggerSuccessModal, showNotifications, validIso8601Format } from "../../shared.js";
import { nonUserNavBar } from "../../navbar.js";
import { siteCollectionNavbar } from "./siteCollectionNavbar.js";
import { activeSiteCollectionNavbar } from "./activeSiteCollectionNavbar.js";
import { conceptIds as fieldMapping, packageConditionConversion } from "../../fieldToConceptIdMapping.js";
import { confirmKitReceipt } from "../homeCollection/kitsReceipt.js";

const inputObject = {
    inputChange: false
  }

// add to state
// let hasUnsavedChanges = false;

export const packageReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packageReceiptTemplate(username); //
  checkTrackingNumberSource(); //
  formSubmit();
//   updateUnsavedChanges();
  setupLeavingPageMessage();
  addListenersOnPageLoad();
}

const packageReceiptTemplate = async (name) => {
    let template = ``;
    template += siteCollectionNavbar();
    template += `<div id="root root-margin" style="padding-top: 25px;">
                    <div id="alert_placeholder"></div>
                    <span> <h3 style="text-align: center; margin: 0 0 1rem;">Package Receipt</h3> </span>
                    <div class="mt-3" >
                        <br>
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="scannedBarcode">Scan FedEx/USPS Barcode</label>
                            <div style="display:inline-block;">
                            <input autocomplete="off" required="" class="col-md-8" type="text" id="scannedBarcode" data-track-changes style="width: 600px;" placeholder="Scan a Fedex or USPS barcode">
                            <span id="showMsg" style="padding-left: 10px;"></span>
                            <br>
                            <br>
                            <span>
                                <p><i>Press command/control while clicking with the mouse to make multiple selections</i></p>
                            </span>
                        </div>
                    </div>

                    <div class="row form-group">
                        <label class="col-form-label col-md-4" for="packageCondition">Select Package Condition</label>
                        <div style="display:inline-block; max-width:90%;"> 
                            <select required class="col form-control" id="packageCondition" data-track-changes style="width:100%" multiple="multiple" data-selected="[]">
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
                        <textarea class="col-md-8 form-control" id="receivePackageComments" cols="30" rows="5" placeholder="Any comments?" data-track-changes></textarea>
                    </div>
                    <div class="row form-group">
                        <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                        <input autocomplete="off" required class="col-md-8 form-control" type="date" type="text" id="dateReceived" value=${getCurrentDate()} data-track-changes>
                    </div>
                    <div class="mt-4 mb-4" style="display:inline-block;">
                        <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                        <button type="submit" class="btn btn-primary" data-toggle="modal" data-target="#modalShowMoreData" id="save">Save</button>
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
    activeSiteCollectionNavbar();
};

// add validation checks before sending off to the server
const formSubmit = () => {
    const form = document.getElementById("save");
    form.addEventListener("click", (e) => {
        e.preventDefault();
        const modalHeaderEl = document.getElementById("modalHeader");
        const modalBodyEl = document.getElementById("modalBody");
        const isSelectPackageConditionsListEmpty = checkSelectPackageConditionsList();
        console.log("🚀 ~ form.addEventListener ~ isSelectPackageConditionsListEmpty:", isSelectPackageConditionsListEmpty)

        if (isSelectPackageConditionsListEmpty) {
            return displayPackageConditionListEmptyModal(modalHeaderEl, modalBodyEl);
        }

        displaySelectedPackageConditionListModal(modalHeaderEl, modalBodyEl);
    });
};

const confirmPackageReceipt = () => {
  const confirmReceiptEle = document.getElementById('confirmReceipt');
  if (confirmReceiptEle) {
      confirmReceiptEle.addEventListener('click',  async () => { 
          try {
              let receiptedPackageObj = {};
              let packageConditions = [];
              const scannedBarcode = document.getElementById('scannedBarcode').value.trim();
              const onlyFedexCourierType = scannedBarcode.length >= 12;

              if (onlyFedexCourierType === true) {
                  receiptedPackageObj['scannedBarcode'] = scannedBarcode;
                  for (let option of document.getElementById('packageCondition').options) {
                      if (option.selected) { packageConditions.push(option.value) };
                  }

                  receiptedPackageObj[`${fieldMapping.packageCondition}`] = packageConditions;
                  
                  if (scannedBarcode.length === 12 || (!uspsFirstThreeNumbersCheck(scannedBarcode))) {  
                      receiptedPackageObj[`${fieldMapping.siteShipmentReceived}`] = fieldMapping.yes;
                      receiptedPackageObj[`${fieldMapping.siteShipmentComments}`] = document.getElementById('receivePackageComments').value.trim();
                      receiptedPackageObj[`${fieldMapping.siteShipmentDateReceived}`] = convertDateReceivedinISO(document.getElementById('dateReceived').value);
                  } else { 
                      receiptedPackageObj['receivePackageComments'] = document.getElementById('receivePackageComments').value.trim();
                      receiptedPackageObj['dateReceived'] = convertDateReceivedinISO(document.getElementById('dateReceived').value);
                    //   if(document.getElementById('collectionId').value) {
                    //       receiptedPackageObj['collectionId'] = document.getElementById('collectionId').value;
                    //       receiptedPackageObj['dateCollectionCard'] = document.getElementById('dateCollectionCard').value;
                    //       receiptedPackageObj['timeCollectionCard'] = document.getElementById('timeCollectionCard').value;
                    //       document.getElementById('collectionCheckBox').checked === true ? 
                    //         receiptedPackageObj['collectionCheckBox'] = true : 
                    //         receiptedPackageObj['collectionCheckBox'] = false
                    //       receiptedPackageObj['collectionComments'] = document.getElementById('collectionComments').value;
                    //   }    
                  }
                  
                  window.removeEventListener("beforeunload",beforeUnloadHandler)
                  setupLeavingPageMessage();
                  console.log("receiptedPackageObj", receiptedPackageObj);
                  console.log("packageConditions", packageConditions);
                  await storeSpecimenPackageReceipt(receiptedPackageObj);
              }
            //   throw errorMessage('Test Error: Please try again');
          } catch (error) {
              console.error(error)
              showNotifications({ title: 'Error', body: `Error: please try again. ${error}` });
          }
      });
  }
}



// const identifyCourierType = (scannedBarcode) => {
//     if (scannedBarcode.length >= 12) {
//         return true
//     }
//     return false
// }

const storeSpecimenPackageReceipt = async (receiptedPackageData) => {
  try {
      showAnimation();
      const idToken = await getIdToken();
      const response = await fetch(`${baseAPI}api=storeSpecimenReceipt`, {
          method: "POST",
          body: JSON.stringify(receiptedPackageData),
          headers: {
              Authorization: "Bearer " + idToken,
              "Content-Type": "application/json",
          },
      });

      const responseData = await response.json();
      console.log("🚀 ~ storeSpecimenPackageReceipt ~ responseData:", responseData)
      hideAnimation();
      
      if (responseData.code === 200) {
          clearPackageReceiptForm(true);
      } else if (responseData.code === 409) {
          switch (responseData.message) {
              case 'Multiple Results': // Multiple boxes found with the same tracking number
                  handleDuplicateTrackingNumbers(responseData.data, receiptedPackageData);
                  break;
              case 'Box Already Received': // Box has already been marked as received
                  handleAlreadyReceivedPackage(receiptedPackageData);
                  break;
              default:
                  throw new Error('Bad arg in response data message. Please report this error.');
          }    
      } else {
          showNotifications({ title: `Error: ${responseData.code}` , body: `Error: ${responseData.message}` });
      }
  } catch (error) {
      hideAnimation();
      console.error('Error: please try again.', error);
      showNotifications({ title: 'Error: Specimens Not Received', body: `Error: please try again. ${error}` });
  }
};

/**
 * Handles a case where multiple boxes are found with the same tracking number.
 * It can happen if a fedex tracking number is reused (by accident or recycled and duplicated).
 * @param {array<object>} boxWithDuplicateTrackingList - The list of boxes with the same tracking number.
 * @param {object} receiptedPackageData - The package receipt data to be saved.
 */
const handleDuplicateTrackingNumbers = (boxWithDuplicateTrackingList, receiptedPackageData) => {
    const modalMessage = {
        title: 'Multiple Boxes Found (Duplicate Tracking Number)',
        body: 'IMPORTANT: Multiple boxes were found with the same tracking number. Please select the correct box and click continue. The most recent ship date (top of the list) is likely to be the correct box, but please verify.',
    };

    // Sort boxes by ship date (most recent first) for display in UI. Most recent ship date is highly likely to be the correct box.
    boxWithDuplicateTrackingList.sort((a, b) => {
        const dateA = a.boxData[fieldMapping.shippingShipDate] ?? '';
        const dateB = b.boxData[fieldMapping.shippingShipDate] ?? '';  
        if (dateA === '') return 1;
        if (dateB === '') return -1;

        return dateB.localeCompare(dateA);
    });

    let boxDetailsList = [];
    for (const box of boxWithDuplicateTrackingList) {
        const boxId = box.boxData[fieldMapping.shippingBoxId] ?? '';
        const shipmentTimestamp = box.boxData[fieldMapping.shippingShipDate] ?? '';
        const originSite = locationConceptIDToLocationMap[box.boxData[fieldMapping.shippingLocation]]?.loginSiteName ?? '';
        const shipDate = validIso8601Format.test(box.boxData[fieldMapping.shippingShipDate]) ? retrieveDateFromIsoString(box.boxData[fieldMapping.shippingShipDate]) : '';
        const receivedDate = validIso8601Format.test(box.boxData[fieldMapping.siteShipmentDateReceived]) ? retrieveDateFromIsoString(box.boxData[fieldMapping.siteShipmentDateReceived]) : 'Not yet received';
        
        const boxDetailObj = {
            id: boxId,
            shipmentTimestamp: shipmentTimestamp,
            originSite: originSite,
            shipDate: shipDate,
            receivedDate: receivedDate,
        };

        boxDetailsList.push(boxDetailObj);
    }

    const onContinue = async (selectedBoxDetails) => {
        if (!selectedBoxDetails) {
            showNotifications({ title: 'Error', body: `Error: please select a box and try again.` });
            return;
        }
        receiptedPackageData['shipmentTimestamp'] = selectedBoxDetails.shipmentTimestamp;
  
        await storeSpecimenPackageReceipt(receiptedPackageData);
    };

    const onCancel = () => {
        clearPackageReceiptForm(false);
    };

    showNotificationsSelectableList(modalMessage, boxDetailsList, onCancel, onContinue);
}

/**
 * Handles the case where the package has already been marked as received. This is likely an accidental scan (has happened at receiving facility).
 * Build a noticfication modal with cancel or continue options.
 * @param {Object} receiptedPackageData - The package receipt data to be saved.
 */
const handleAlreadyReceivedPackage = (receiptedPackageData) => {
    const modalMessage = {
        title: 'Package Already Received',
        body: 'IMPORTANT: This package has already been marked as received. Do you want to continue? Click Cancel to discard changes or click Continue to overwrite the existing receipt.',
    };

    const onCancel = () => {
        clearPackageReceiptForm(false);
    };

    // Define what happens when the user clicks "Continue"
    const onContinue = async () => {
        receiptedPackageData['forceWriteOverride'] = true;
        // await storeSpecimenPackageReceipt(receiptedPackageData);
    };

    showNotificationsCancelOrContinue(modalMessage, null, onCancel, onContinue);
}

const clearPackageReceiptForm = (isSuccess) => {
    if (isSuccess) {
        triggerSuccessModal('Package Receipted Successfully');
    }

    const courierType = document.getElementById("courierType");
    if (courierType) courierType.innerHTML = '';

    const scannedBarcode = document.getElementById("scannedBarcode");
    if (scannedBarcode) scannedBarcode.value = '';
    
    const packageCondition = document.getElementById("packageCondition");
    if (packageCondition) packageCondition.value = '';
    
    const receivePackageComments = document.getElementById("receivePackageComments");
    if (receivePackageComments) receivePackageComments.value = '';
    
    const dateReceived = document.getElementById("dateReceived");
    if (dateReceived) dateReceived.value = getCurrentDate();
    
    const collectionComments = document.getElementById("collectionComments");
    if (collectionComments) collectionComments.value = '';

    const collectionId = document.getElementById("collectionId");
    if (collectionId) collectionId.value = '';
    
    enableCollectionCardFields();
    enableCollectionCheckBox();

    if (packageCondition) packageCondition.setAttribute("data-selected","[]");

    // TODO: Handled null case, maybe this logic can be removed, but I'm not aware of the impact re: enableCollectionCardFields() and enableCollectionCheckBox(). Leaving for now.
    if (collectionId.value) {
        collectionId.value = '';
        const dateCollectionCard = document.getElementById("dateCollectionCard");
        if (dateCollectionCard) dateCollectionCard.value = '';

        const timeCollectionCard = document.getElementById("timeCollectionCard");
        if (timeCollectionCard) timeCollectionCard.value = '';

        const collectionCheckBox = document.getElementById("collectionCheckBox");
        if (collectionCheckBox) collectionCheckBox.checked = false;

        const collectionComments = document.getElementById("collectionComments");
        if (collectionComments) collectionComments.value = '';

        enableCollectionCardFields();
        enableCollectionCheckBox();

        if (packageCondition) packageCondition.setAttribute("data-selected","[]");
    }
}

export const enableCollectionCheckBox = () => {
  const collectionCheckBoxEl = document.getElementById("collectionCheckBox")
  collectionCheckBoxEl.removeAttribute("disabled")
  collectionCheckBoxEl.checked = false
}

/**
 * Add event listener to body element to listen for specific event clicks to handle unsaved changes when user tries to navigate away from the page.
 * @param {boolean} inputChange - If true, add event listener to window object. If false, remove event listener from window object.
*/
export const setupLeavingPageMessage = (inputChange = false) => {  
    if (inputChange) {
        document.body.addEventListener('click', checkLinkNavigation);
      } else {
        document.body.removeEventListener('click', checkLinkNavigation);
      }
};

const checkLinkNavigation = (e) => { 
    if (e.target.tagName === 'A' && e.target.getAttribute('href') !== location.hash) {
        unsavedChangesRoutingMessage(e);
    }
};

const unsavedChangesRoutingMessage = (e) => {
    const result = confirm("Changes were made and will not be saved. Are you sure you want to leave the page?");
    if (!result) {
      e.preventDefault();
    } else { 
      // IMPORTANT - REMOVES EVENT LISTENER FROM WINDOW OBJECT AFTER ROUTE CHANGE IS CONFIRMED
      window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
};


/* ADD EVENT LISTENERS TO INPUTS THAT CAN BE SUBMITTED WHEN PAGE LOADS */ 
export const addListenersOnPageLoad = () => {
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
//   dateCollectionCardEl.addEventListener("input", hasInputChanged)
  timeCollectionCardEl.addEventListener("input", hasInputChanged)
  collectionCommentsEl.addEventListener("input", hasInputChanged)
}

/*
WINDOW
*/

export const beforeUnloadHandler = (e) => { 
  e.preventDefault()
  // Include for legacy browsers.
  e.returnValue = "";
};

/*
INPUT ELEMENTS - scannedBarcodeInputEl, receivePackageCommentsEl, dateReceivedEl
*/ 
const hasInputChanged = (e) => {
  // array of input has no value of true (false to true)
  if(e.target.value.trim() ==="" && !checkAllInputChanges()) {
    inputObject.inputChange = false
    setupLeavingPageMessage(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
  else if(e.target.value.trim() !== ""){
    inputObject.inputChange = true
    setupLeavingPageMessage(inputObject.inputChange)
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
      setupLeavingPageMessage(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
    }
    else if(e.target.value.trim() !== getCurrentDate()){
      inputObject.inputChange = true
      setupLeavingPageMessage(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
      return
    }
}

// INPUT(CHECKBOX) ELEMENT - collectionCheckBoxEl
const isChecked = (e) => {
  if(e.target.checked) {
    inputObject.inputChange = true
    setupLeavingPageMessage(inputObject.inputChange)
    clearChanges(inputObject.inputChange)
    unsavedMessageUnload(inputObject.inputChange)
  }
  // if no check and array of input has no value of true (false to true)
  else if (!e.target.checked && !checkAllInputChanges()){
    inputObject.inputChange = false
    setupLeavingPageMessage(inputObject.inputChange)
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
    setupLeavingPageMessage(inputObject.inputChange)
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
      setupLeavingPageMessage(inputObject.inputChange)
      clearChanges(inputObject.inputChange)
      unsavedMessageUnload(inputObject.inputChange)
    }
  }
}

const cancelConfirm = () => {
  const clearButtonEl = document.getElementById("clearForm");
  let result = confirm("Changes were made and will not be saved.")

  if(result){
    // document.getElementById("courierType").innerHTML = ``; // nor used anymore
    document.getElementById("scannedBarcode").value = "";
    document.getElementById("packageCondition").value = "";
    document.getElementById("receivePackageComments").value = "";
    document.getElementById("dateReceived").value = getCurrentDate();
    
    document.getElementById("collectionComments").value = "";
    document.getElementById("collectionId").value = "";
    enableCollectionCardFields()
    enableCollectionCheckBox()
    document.getElementById("packageCondition").setAttribute("data-selected","[]")
    setupLeavingPageMessage()
    clearButtonEl.removeEventListener("click",cancelConfirm)
    window.removeEventListener("beforeunload",beforeUnloadHandler)
    
    if (document.getElementById("collectionId").value) {
      document.getElementById("collectionId").value = "";
      document.getElementById("dateCollectionCard").value = "";
      document.getElementById("timeCollectionCard").value = "";
      document.getElementById("collectionCheckBox").checked = false;
      document.getElementById("collectionComments").value = "";

      enableCollectionCardFields();
      enableCollectionCheckBox();
      document.getElementById("packageCondition").setAttribute("data-selected","[]");
      setupLeavingPageMessage();
      clearButtonEl.removeEventListener("click",cancelConfirm);
      window.removeEventListener("beforeunload",beforeUnloadHandler);

    }
  }
  else {
    return 
  }
}

// OTHER UNSAVED CHANGES FUNCTIONS 

const unsavedMessageUnload = (inputChange) => {
  if(inputChange) {
    window.addEventListener("beforeunload",beforeUnloadHandler)
  }
  else if (!inputChange) {
    window.removeEventListener("beforeunload",beforeUnloadHandler)
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

const uspsFirstThreeNumbersCheck = (input) => {
  const regExp = /^420[0-9]{31}$/;
  return regExp.test(input);
}

export const displayInvalidPackageInformationModal = (modalHeaderEl,modalBodyEl) => {
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
                One or more fields are missing.
            </p>
        </div>
    </div>
    <div class="row" style="display:flex; justify-content:center;">
        <button type="button" class="btn btn-secondary" data-dismiss="modal" target="_blank">Close</button>
    </div>
    </div>`
};

export const checkSelectPackageConditionsList = () => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected')
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList)
    if(parseSelectPackageConditionsList.length === 0) {
        return true
    }
    else return false
}

export const displayPackageConditionListEmptyModal = (modalHeaderEl, modalBodyEl) => {
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

export const displaySelectedPackageConditionListModal = (modalHeaderEl, modalBodyEl, isKitReceipt) => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected');
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList);
    modalHeaderEl.innerHTML = `
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>`
    modalBodyEl.innerHTML = `<div class="row">
        <div class="col">
            <div style="display:flex; justify-content:center; margin-bottom:1rem;">
            <i class="fas fa-exclamation-triangle fa-5x" style="color:#ffc107"></i>
            </div>
            <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; ">
                <span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Package Condition</span> 
                Confirm selected package condition(s):
                <ul id="packageConditionSpanList" style="margin:0 30px;"></ul>
            </p>
        </div>
    </div>
    <div class="row" style="display:flex; justify-content:center;">
        <button id="confirmPackageConditionButton" type="button" class="btn btn-primary" data-dismiss="modal" target="_blank" style="margin-right: 15px;">Confirm</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank">Cancel</button>
    </div>
    </div>`
    
    displaySelectedPackageConditionList(parseSelectPackageConditionsList);
    clickConfirmPackageConditionListButton(modalHeaderEl,modalBodyEl, isKitReceipt);
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

const displaySelectedPackageConditionList = (parseSelectPackageConditionsList) => {
    const packageConditionSpanListEl = document.getElementById('packageConditionSpanList');
    for (const packageConditionConceptId of parseSelectPackageConditionsList) {
        if (packageConditionConversion[packageConditionConceptId]) {
            const listEl = document.createElement('li');
            listEl.textContent = packageConditionConversion[packageConditionConceptId];
            packageConditionSpanListEl.appendChild(listEl);
        }
    }
}

const clickConfirmPackageConditionListButton = (modalHeaderEl,modalBodyEl, isKitReceipt) => {
    const confirmPackageConditionButtondocument = document.getElementById("confirmPackageConditionButton");
    confirmPackageConditionButtondocument.addEventListener("click", () => {
        displayConfirmPackageReceiptModal(modalHeaderEl,modalBodyEl);
        if (isKitReceipt) { confirmKitReceipt(); }
        else { confirmPackageReceipt(); }

    })    
}


// const validatePackageInformation = () => {
//     const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected');
//     const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList);
//     const scannedBarcode = document.getElementById("scannedBarcode").value;
//     const dateReceived = document.getElementById("dateReceived").value;
//     const collectionId = document.getElementById("collectionId").value;
//     const dateCollectionCard = document.getElementById("dateCollectionCard").value;
//     const timeCollectionCard = document.getElementById("timeCollectionCard").value;

//     return (parseSelectPackageConditionsList.length !== 0) &&
//         !!scannedBarcode && !!dateReceived && !!collectionId && !!dateCollectionCard && !!timeCollectionCard;
// };