import { getIdToken, showAnimation, hideAnimation, baseAPI, convertDateReceivedinISO, checkTrackingNumberSource, getCurrentDate, locationConceptIDToLocationMap, retrieveDateFromIsoString, showNotificationsCancelOrContinue, showNotificationsSelectableList, triggerSuccessModal, showNotifications, validIso8601Format } from "../../shared.js";
import { nonUserNavBar } from "../../navbar.js";
import { siteCollectionNavbar } from "./siteCollectionNavbar.js";
import { activeSiteCollectionNavbar } from "./activeSiteCollectionNavbar.js";
import { conceptIds as fieldMapping, packageConditionConversion } from "../../fieldToConceptIdMapping.js";
import { confirmKitReceipt } from "../homeCollection/kitsReceipt.js";

let hasUnsavedChanges = false;

export const packageReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packageReceiptTemplate(username);
  checkTrackingNumberSource();
  formSubmit();
  setupLeavingPageMessage();
  addFormInputListenersOnLoad();
  checkAllInputChanges();
}

const packageReceiptTemplate = async (name) => {
    let template = ``;
    template += siteCollectionNavbar();
    template += `
        <div id="root root-margin" style="padding-top: 25px;">
            <div id="alert_placeholder"></div>
            <span> <h3 style="text-align: center; margin: 0 0 1rem;">Package Receipt</h3> </span>
            <div class="mt-3" >
                <br>
                <div class="row form-group">
                    <label class="col-form-label col-md-4" for="scannedBarcode">Scan FedEx/USPS Barcode</label>
                    <div style="display:inline-block;">
                    <input autocomplete="off" required="" class="col-md-8" type="text" id="scannedBarcode"  style="width: 600px;" placeholder="Scan a Fedex or USPS barcode">
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
                    <select required class="col form-control" id="packageCondition"  style="width:100%" multiple="multiple" data-selected="[]" data-initial-value="[]">
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
                <textarea class="col-md-8 form-control" id="receivePackageComments" cols="30" rows="5" placeholder="Any comments?" ></textarea>
            </div>
            <div class="row form-group">
                <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                <input autocomplete="off" required class="col-md-8 form-control" type="date" type="text" id="dateReceived" value=${getCurrentDate()}>
            </div>
            <div class="mt-4 mb-4" style="display:inline-block;">
                <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                <button type="submit" class="btn btn-primary" data-toggle="modal" data-target="#modalShowMoreData" id="save">Save</button>
            </div>
        </div>
    `;
    template += `
        <div class="modal fade" id="modalShowMoreData" data-keyboard="false" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">
            <div class="modal-dialog modal-md modal-dialog-centered" role="document">
                <div class="modal-content sub-div-shadow">
                    <div class="modal-header" id="modalHeader"></div>
                    <div class="modal-body" id="modalBody"></div>
                </div>
            </div>
        </div>
    `;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeSiteCollectionNavbar();
};

const formSubmit = () => {
    const form = document.getElementById("save");
    form.addEventListener("click", (e) => {
        e.preventDefault();
        const modalHeaderEl = document.getElementById("modalHeader");
        const modalBodyEl = document.getElementById("modalBody");
        const isPackageInfoValid = validatePackageInformation(false);

        if (isPackageInfoValid) {
            return displaySelectedPackageConditionListModal(modalHeaderEl, modalBodyEl);
        }
        displayInvalidPackageInformationModal(modalHeaderEl, modalBodyEl);
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
                  }
                  await storeSpecimenPackageReceipt(receiptedPackageObj);
              }
          } catch (error) {
              console.error(error)
              showNotifications({ title: 'Error', body: `Error: please try again. ${error}` });
          }
      });
  }
};

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
        await storeSpecimenPackageReceipt(receiptedPackageData);
    };

    showNotificationsCancelOrContinue(modalMessage, null, onCancel, onContinue);
};
// TODO: Add empty input values to the inputChangeList array of objects.
const clearPackageReceiptForm = (isSuccess) => {
    if (isSuccess) {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        setupLeavingPageMessage();
        triggerSuccessModal('Package Receipted Successfully');
    }

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

    if (packageCondition) packageCondition.setAttribute("data-selected", "[]");

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

        if (packageCondition) packageCondition.setAttribute("data-selected","[]");
    }
}

export const enableCollectionCheckBox = () => {
  const collectionCheckBoxEl = document.getElementById("collectionCheckBox");
  collectionCheckBoxEl.removeAttribute("disabled");
  collectionCheckBoxEl.checked = false;
}

/**
 * Adds or removes click event listener to body element to handle unsaved changes when user tries to navigate away from the page.
 * @param {boolean} inputChange - If true, add event listener to window object. If false, remove event listener from window object.
*/
export const setupLeavingPageMessage = (inputChange = false) => {  
    if (inputChange) {
        document.body.addEventListener('click', checkLinkNavigation);
    } else {
        document.body.removeEventListener('click', checkLinkNavigation);
    }
};

/**
 * Target all anchor tags except the one with the same href as the current location hash. Display a message to the user if they try to navigate away from the page.
*/
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
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.body.removeEventListener('click', checkLinkNavigation);
    }
};

/**
 * Add event listeners to input elements on page load.
 * @param {boolean} isKitReceipt - If true, add event listeners to only kit receipt inputs. If false, add event listeners to all inputs.
*/
export const addFormInputListenersOnLoad = (isKitReceipt = false) => {
    const inputChangeCheckList = inputChangeList.filter((input) => isKitReceipt || !input.onlyKitsReceipt);

    inputChangeCheckList.forEach(({ selector, listenerType, customHandler }) => {
        const inputEl = document.getElementById(selector);
        let eventHandler;

        if (inputEl) {
            if (customHandler) {
                eventHandler = customHandler;
            } else if (listenerType === 'input') {
                eventHandler = handleInputChange;
            }
        }
        document.getElementById(selector).addEventListener(listenerType, eventHandler);
    })
};

/**
 * Handles the beforeunload event when the user tries to navigate away from the page.
 * @param {e} e - The beforeunload event object.
 * Note: The returnValue is an empty string for legacy browsers.
 */
export const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "";
};

/**
 * Checks if current input has changed or any other input has changed. Changes the value of hasUnsavedChanges. Adds or removes listeners in handleUnsavedChangesListeners function.
 * @param {Event} e - The input event object. 
*/
const handleInputChange = (e) => {
    const hasValue = e.target.value.trim() !== "";
    hasUnsavedChanges = hasValue || checkAllInputChanges();
    handleUnsavedChangesListeners(hasUnsavedChanges);

}

/**
 * A custom handler for input element with dateReceived id.
 * Checks if current input has changed or any other input has changed. Changes the value of hasUnsavedChanges. Adds or removes listeners in handleUnsavedChangesListeners function.
 * @param {Event} e - The input event object. 
*/
const handleInputDateChange = (e) => {
    const isCurrentDate = e.target.value.trim() === getCurrentDate();
    hasUnsavedChanges = !isCurrentDate || checkAllInputChanges();
    handleUnsavedChangesListeners(hasUnsavedChanges);
}

/**
 * A custom handler for the checkbox element with collectionCheckBox id.
 * Checks if current input has changed or any other input has changed. Changes the value of hasUnsavedChanges. Adds or removes listeners in handleUnsavedChangesListeners function.
 * @param {Event} e - The input event object. 
*/
const handleCheckboxChange = (e) => {
    hasUnsavedChanges = e.target.checked || checkAllInputChanges(true);
    handleUnsavedChangesListeners(hasUnsavedChanges);
}

/**
 * A custom handler for select element with packageCondition id. Sets the attribute data-selected with the selected options.
 * Checks if current select element's selectedOptions have changed. Changes the value of hasUnsavedChanges. Adds or removes listeners in handleUnsavedChangesListeners function.
 * @param {Event} e - The select event object.
*/
const handlePackageConditionChange = (e) => {
    const packageConditions = Array.from(e.target.selectedOptions, option => option.value)
        .filter(condition => condition !== "")
  
    if (packageConditions.length) {
        hasUnsavedChanges = true
        document.getElementById("packageCondition").setAttribute("data-selected",`${JSON.stringify(packageConditions)}`)

        handleUnsavedChangesListeners(hasUnsavedChanges);
    } else if (!packageConditions.length){
      document.getElementById("packageCondition").setAttribute("data-selected","[]");

      if (!checkAllInputChanges()) {
        hasUnsavedChanges = false
        handleUnsavedChangesListeners(hasUnsavedChanges);
      }
    }
};
// TODO: Add empty input values to the inputChangeList array of objects.
const cancelConfirm = () => {
    const clearButtonEl = document.getElementById("clearForm");
    const result = confirm("Changes were made and will not be saved.")

    if (result) {
        const scannedBarcode = document.getElementById("scannedBarcode").value;
        if (scannedBarcode) document.getElementById("scannedBarcode").value = "";
        
        const packageCondition = document.getElementById("packageCondition");
        if (packageCondition) packageCondition.value = "";

        const receivePackageComments = document.getElementById("receivePackageComments");
        if (receivePackageComments) receivePackageComments.value = "";
    
        const dateReceived = document.getElementById("dateReceived");
        if (dateReceived) dateReceived.value = getCurrentDate();;
        
        const collectionCheckBox = document.getElementById("collectionCheckBox");
        if (collectionCheckBox) collectionCheckBox.checked = false;

        const collectionId = document.getElementById("collectionId");
        if (collectionId) collectionId.value = "";

        const dateCollectionCard = document.getElementById("dateCollectionCard");
        if (dateCollectionCard) dateCollectionCard.value = "";
        
        const timeCollectionCard = document.getElementById("timeCollectionCard");
        if (timeCollectionCard) timeCollectionCard.value = "";

        const collectionComments = document.getElementById("collectionComments");
        if (collectionComments) collectionComments.value = "";

        clearButtonEl.removeEventListener("click", cancelConfirm);
        packageCondition.setAttribute("data-selected","[]")
        
        window.removeEventListener("beforeunload", handleBeforeUnload);
        setupLeavingPageMessage()
    }
};

/**
 * Add or remove event listener to window object for beforeunload event.
 * @param {boolean} hasUnsavedChanges - If true, add event listener to window object. If false, remove event listener from window object.
*/
const toggleBeforeUnloadListener = (hasUnsavedChanges) => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    if (hasUnsavedChanges) {
        window.addEventListener("beforeunload", handleBeforeUnload);
    }
};

// Add two parameters and check truthy and falsy values
// toggle clearFormClickListener
const toggleClearFormBtnListener = (inputChanges) => {
    const clearButtonEl = document.getElementById("clearForm");
    if (inputChanges) {
        clearButtonEl.addEventListener("click", cancelConfirm);
    } else {
        clearButtonEl.removeEventListener("click", cancelConfirm);
    }
};

/**
 * Checks if any input has changed for their respective forms, package receipt or mouthwash kit receipt. Uses the inputChangeList array of objects to check if inputs have changed.
 * @param {boolean} isKitReceipt - If true, add event listeners to only kit receipt inputs. If false, add event listeners to all inputs.
 * @returns {boolean} true if any input has changed, false otherwise.
*/
const checkAllInputChanges = (isKitReceipt = false) => {
    let inputChangeCheckList = inputChangeList.filter((input) =>  input.onlyKitsReceipt === false);
    if (isKitReceipt) { 
        inputChangeCheckList = inputChangeList;
    }

    return inputChangeCheckList.some((input) => {
        const inputEl = document.getElementById(input.selector);
        return input.check && input.check(inputEl);
    });
}

/**
 * Array of objects with input id selectors, corresponding check functions, listenerType.
*/
const inputChangeList = [ 
    {
        selector: "scannedBarcode",
        check: (input) => input.value.trim() !== "",
        listenerType: "input",
        onlyKitsReceipt: false,
    },
    {
        selector: "packageCondition",
        check: (input) => {
            const initialValue = input.getAttribute("data-initial-value");
            const currentValue = input.getAttribute("data-selected");
            return currentValue !== initialValue;
        },
        listenerType: "change",
        onlyKitsReceipt: false,
        customHandler: handlePackageConditionChange,
    },
    {
        selector: "receivePackageComments",
        check: (input) => input.value.trim() !== "",
        listenerType: "input",
        onlyKitsReceipt: false,
    },
    {
        selector: "dateReceived",
        check: (input) => input.value.trim() !== getCurrentDate(),
        listenerType: "input",
        onlyKitsReceipt: false,
        customHandler: handleInputDateChange,
    },
    {
        selector: "collectionCheckBox",
        check: (input) => input.checked === true,
        listenerType: "change",
        onlyKitsReceipt: true,
        customHandler: handleCheckboxChange,
    },
    {
        selector: "collectionId",
        check: (input) => input.value.trim() !== "",
        listenerType: "input",
        onlyKitsReceipt: true,
    },
    {
        selector: "dateCollectionCard",
        check: (input) => input.value.trim() !== "",
        listenerType: "change",
        onlyKitsReceipt: true,
    },
    {
        selector: "timeCollectionCard",
        check: (input) => input.value.trim() !== "",
        listenerType: "input",
        onlyKitsReceipt: true,
    },
    {
        selector: "collectionComments",
        check: (input) => input.value.trim() !== "",
        listenerType: "input",
        onlyKitsReceipt: true,
    }
];

const uspsFirstThreeNumbersCheck = (input) => {
  const regExp = /^420[0-9]{31}$/;
  return regExp.test(input);
}

export const displayInvalidPackageInformationModal = (modalHeaderEl, modalBodyEl) => {
    modalHeaderEl.innerHTML = `
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    modalBodyEl.innerHTML = `
        <div class="row">
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
        </div>
    `;
};

export const checkSelectPackageConditionsList = () => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected');
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList);
    if (parseSelectPackageConditionsList.length === 0) {
        return true;
    }
    return false;
};

export const displayPackageConditionListEmptyModal = (modalHeaderEl, modalBodyEl) => {
    modalHeaderEl.innerHTML = `
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        `;
    modalBodyEl.innerHTML = `
        <div class="row">
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
    `;
}

export const displaySelectedPackageConditionListModal = (modalHeaderEl, modalBodyEl, isKitReceipt) => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected');
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList);
    modalHeaderEl.innerHTML = `
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    modalBodyEl.innerHTML = `
        <div class="row">
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
    `;

    displaySelectedPackageConditionList(parseSelectPackageConditionsList);
    clickConfirmPackageConditionListButton(modalHeaderEl,modalBodyEl, isKitReceipt);
}

const displayConfirmPackageReceiptModal = (modalHeaderEl,modalBodyEl) => {
    modalHeaderEl.innerHTML = `
        <h5>Confirmation</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
    `;
    modalBodyEl.innerHTML = `
        <div>
            <span>Confirm package receipt</span>
            <br >
            <div style="display:inline-block;">
                <button type="submit" class="btn btn-primary" data-dismiss="modal" id="confirmReceipt" target="_blank">Confirm</button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank">Cancel</button>
            </div>
        </div>
    `;
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

const clickConfirmPackageConditionListButton = (modalHeaderEl, modalBodyEl, isKitReceipt) => {
    const confirmPackageConditionButtondocument = document.getElementById("confirmPackageConditionButton");
    confirmPackageConditionButtondocument.addEventListener("click", () => {
        displayConfirmPackageReceiptModal(modalHeaderEl,modalBodyEl);
        if (isKitReceipt) { 
            confirmKitReceipt(); 
        } else { 
            confirmPackageReceipt(); 
        }
    });  
};

/**
 * Returns true if all required fields are filled out, false otherwise.
 * @param {boolean} isMouthwashKit - Set to false as default, true if function called on mouthwash kit's kit receipt page.
 * @returns {boolean} - True if all required fields are filled out, false otherwise.
*/
export const validatePackageInformation = (isMouthwashKit = false) => {
    const selectPackageConditionsList = document.getElementById('packageCondition').getAttribute('data-selected');
    const parseSelectPackageConditionsList = JSON.parse(selectPackageConditionsList);
    const scannedBarcode = document.getElementById("scannedBarcode")?.value;
    const dateReceived = document.getElementById("dateReceived")?.value;
    const collectionId = document.getElementById("collectionId")?.value;
    const dateCollectionCard = document.getElementById("dateCollectionCard")?.value;
    const timeCollectionCard = document.getElementById("timeCollectionCard")?.value;
    
    const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

    if (isMouthwashKit) {
        return (parseSelectPackageConditionsList.length !== 0) 
            && isNonEmptyString(scannedBarcode)
            && isNonEmptyString(dateReceived)
            && isNonEmptyString(collectionId) 
            && isNonEmptyString(dateCollectionCard) 
            && isNonEmptyString(timeCollectionCard);
    }
    return (selectPackageConditionsList.length !== 0) 
        && isNonEmptyString(scannedBarcode) 
        && isNonEmptyString(dateReceived);
};

const handleUnsavedChangesListeners = (hasUnsavedChanges) => {
    setupLeavingPageMessage(hasUnsavedChanges);
    toggleClearFormBtnListener(hasUnsavedChanges);
    toggleBeforeUnloadListener(hasUnsavedChanges);
};