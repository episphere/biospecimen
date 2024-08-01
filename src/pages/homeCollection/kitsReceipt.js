import { homeCollectionNavbar, activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, convertDateReceivedinISO, baseAPI, triggerSuccessModal, triggerErrorModal, processResponse, checkTrackingNumberSource, getCurrentDate, numericInputValidator, autoTabAcrossArray, sendInstantNotification, getLoginDetails } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";
import { displayInvalidPackageInformationModal, displaySelectedPackageConditionListModal, validatePackageInformation, checkSelectPackageConditionsList, targetAnchorTagEl, addListenersOnPageLoad, beforeUnloadMessage, enableCollectionCardFields, enableCollectionCheckBox } from "../receipts/packageReceipt.js";

const contentBody = document.getElementById("contentBody");

export const kitsReceiptScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitsReceiptTemplate(name);
  hideAnimation();
  targetAnchorTagEl();
  addListenersOnPageLoad();
  formSubmit(); 
}

const kitsReceiptTemplate = async (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Kits Receipt</h3></div>
                </div>`;

                template += `  <div id="root root-margin" style="padding-top: 25px;">
                  <div id="alert_placeholder"></div>
                  <div class="mt-3" >
                  <br />
                  <div class="row form-group">
                    <label class="col-form-label col-md-4" for="scannedBarcode">Scan Return Kit Tracking Number</label>
                    <div style="display:inline-block;">
                      <input autocomplete="off" required="" class="col-md-8" type="text" id="scannedBarcode" style="width: 600px;" placeholder="Scan Barcode">
                      <span id="showMsg" style="padding-left: 10px;"></span>
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
                              <option id="select-packageGoodCondition" value=${conceptIds.pkgGoodCondition}>Package in good condition</option>
                              <option id="select-pkgCrushed" value=${conceptIds.pkgCrushed}>Package Crushed</option>
                              <option id="select-pkgImproperPackaging" value=${conceptIds.pkgImproperPackaging}>Improper Packaging</option>
                              <option id="select-pkgCollectionCupDamaged" value=${conceptIds.pkgCollectionCupDamaged}>Collection Cup Damaged</option>
                              <option id="select-pkgCollectionCupLeaked" value=${conceptIds.pkgCollectionCupLeaked}>Collection Cup Leaked</option>
                              <option id="select-pkgEmptyCupReturned" value=${conceptIds.pkgEmptyCupReturned}>Empty Cup Returned</option>
                              <option id="select-pkgIncorrectMaterialType" value=${conceptIds.pkgIncorrectMaterialType}>Incorrect Material Type</option>
                              <option id="select-pkgCollectionCupNotReturned" value=${conceptIds.pkgCollectionCupNotReturned}>Collection Cup Not Returned</option>
                              <option id="select-pkgOther" value=${conceptIds.pkgOther}>Other</option>
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
                      <div class="row form-group">
                          <label class="col-form-label col-md-4 for="collectionCheckBox">Check if Collection Card Missing</label>
                          <input type="checkbox" name="collectionCheckBox" id="collectionCheckBox">
                      </div>
                      <div class="row form-group">
                          <label class="col-form-label col-md-4" for="collectionId">Collection ID</label>
                          <input autocomplete="off" class="col-md-8 form-control" type="text" id="collectionId" placeholder="Scan or Enter a Collection ID">
                          <span id="showCollectionErrorMsg" style="font-size: 14px;"></span>
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
  

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;

  // Set up automatic tabbing between inputs upon scanning (assuming the scanner automatically inputs the enter key at the end)
  autoTabAcrossArray(['scannedBarcode', 'packageCondition', 'receivePackageComments', 'dateReceived', 'collectionCheckBox', 'collectionId', 'dateCollectionCard', 'timeCollectionCard', 'collectionComments']);
  
  numericInputValidator(['scannedBarcode']);
  activeHomeCollectionNavbar();
  checkTrackingNumberSource();
  performCollectionIdcheck();
};

const performCollectionIdcheck = () => {
  const collectionIdField = document.getElementById('collectionId');
  if (collectionIdField) {
    collectionIdField.addEventListener("input", (e) => {
      if (collectionIdField.value.length < 14) {
        document.getElementById('showCollectionErrorMsg').innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i> Enter Correct Collection ID`
      } else {
        document.getElementById('showCollectionErrorMsg').innerHTML = ``
      }
    })
  }
}

const formSubmit = () => {
  const form = document.getElementById("save");
  form.addEventListener("click", (e) => {
      e.preventDefault();
      const modalHeaderEl = document.getElementById("modalHeader");
      const modalBodyEl = document.getElementById("modalBody");
      const isPackageInfoValid = validatePackageInformation();

      if (isPackageInfoValid) {
        displaySelectedPackageConditionListModal(modalHeaderEl, modalBodyEl, true);
      } else {
        displayInvalidPackageInformationModal(modalHeaderEl, modalBodyEl);
      }
  });
};

export const confirmKitReceipt = () => {
  const confirmReceiptBtn = document.getElementById('confirmReceipt');
  if (confirmReceiptBtn) {
    confirmReceiptBtn.addEventListener('click',  () => {
      let kitObj = {};
      let packageConditions = [];
      const scannedBarcode = document.getElementById('scannedBarcode').value.trim();
      kitObj[conceptIds.returnKitTrackingNum] = scannedBarcode
      for (let option of document.getElementById('packageCondition').options) {
        if (option.selected) {packageConditions.push(option.value)}
      }
      kitObj[conceptIds.pkgReceiptConditions] = packageConditions;
      kitObj[conceptIds.kitPkgComments] = document.getElementById('receivePackageComments').value.trim();
      kitObj[conceptIds.receivedDateTime] = convertDateReceivedinISO(document.getElementById('dateReceived').value);
      if (document.getElementById('collectionId').value) {
        kitObj[conceptIds.collectionCupId] = document.getElementById('collectionId').value;
        const dateCollectionCard = document.getElementById('dateCollectionCard').value;
        const timeCollectionCard = document.getElementById('timeCollectionCard').value;
        if(dateCollectionCard && timeCollectionCard) {
          kitObj[conceptIds.collectionDateTimeStamp] = dateCollectionCard + 'T' + timeCollectionCard
        }
        
        document.getElementById('collectionCheckBox').checked === true ? 
        kitObj[conceptIds.collectionCardFlag] = true : kitObj[conceptIds.collectionCardFlag] = false
        kitObj[conceptIds.collectionAddtnlNotes] = document.getElementById('collectionComments').value;
      }
      window.removeEventListener("beforeunload",beforeUnloadMessage)
      targetAnchorTagEl();
      storePackageReceipt(kitObj);
    })
  }
}

const storePackageReceipt = async (data) => {
  showAnimation();
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=kitReceipt`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });
  hideAnimation();

  const returnedPtInfo = await processResponse(response);
  if (returnedPtInfo.status === true) {
    triggerSuccessModal("Kit Receipted.");
    document.getElementById("showMsg").innerHTML = "";
    document.getElementById("scannedBarcode").value = "";
    document.getElementById("packageCondition").value = "";
    document.getElementById("receivePackageComments").value = "";
    document.getElementById("dateReceived").value = getCurrentDate();
    document.getElementById("collectionComments").value = "";
    
    enableCollectionCardFields();
    enableCollectionCheckBox();
    document.getElementById("packageCondition").setAttribute("data-selected", "[]");
    if (document.getElementById("collectionId").value) {
      document.getElementById("collectionId").value = "";
      document.getElementById("dateCollectionCard").value = "";
      document.getElementById("timeCollectionCard").value = "";
      document.getElementById("collectionCheckBox").checked = false;
      document.getElementById("collectionComments").value = "";
      enableCollectionCardFields();
      enableCollectionCheckBox();
      document.getElementById("packageCondition").setAttribute("data-selected", "[]");
    }

    let requestData = {
      attempt: "1st contact",
      email: returnedPtInfo.prefEmail,
      token: returnedPtInfo.token,
      uid: returnedPtInfo.uid,
      connectId: returnedPtInfo.Connect_ID,
      preferredLanguage: returnedPtInfo.preferredLanguage,
      substitutions: {
        firstName: returnedPtInfo.ptName || "User",
      },
    };

    if (returnedPtInfo.surveyStatus !== conceptIds.modules.submitted) {
      const loginDetails = getLoginDetails(returnedPtInfo);
      if (!loginDetails) {
        triggerErrorModal("Login details not found for this participant. Please check user profile data.");

        return;
      }

      requestData.category = "Baseline Mouthwash Sample Survey Reminders";
      requestData.substitutions.loginDetails = loginDetails;
    } else {
      requestData.category = "Mouthwash Home Collection Acknowledgement";
    }

    try {
      await sendInstantNotification(requestData);
    } catch (e) {
      console.error(`Error sending email to user ${returnedPtInfo.prefEmail}.`, e);
      throw new Error(`Error sending email to user ${returnedPtInfo.prefEmail}: ${e.message}`);
    }

  } else if (returnedPtInfo.status === "Check Collection ID") {
    triggerErrorModal("Error during kit receipt. Please check the collection ID.");
  } else {
    triggerErrorModal("Error during kit receipt. Please check the tracking number and other fields.");
  }
};
