import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, convertDateReceivedinISO, baseAPI, triggerSuccessModal } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";
import { displayPackageConditionListEmptyModal, displaySelectedPackageConditionListModal, checkAndDisplayCourierType, checkSelectPackageConditionsList, targetAnchorTagEl, addListenersOnPageLoad, beforeUnloadMessage, enableCollectionCardFields, enableCollectionCheckBox } from "../receipts/packageReceipt.js";

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
                <label class="col-form-label col-md-4" for="scannedBarcode">Scan Barcode</label>
                <div style="display:inline-block;">
                  <input autocomplete="off" required="" class="col-md-8" type="text" id="scannedBarcode" style="width: 600px;" placeholder="Scan Barcode">
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
  

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;
  activeHomeCollectionNavbar();
  checkAndDisplayCourierType(true);
};

// returns current date in default format ("YYYY-MM-DD")
const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate.getFullYear() + "-" + checkForPadding(parseInt(currentDate.getMonth() + 1)) + "-" + checkForPadding(currentDate.getDate())
}

const checkForPadding = (input) => { // adds 0 before single month & day to adhere to HTML date format
  if (input < 10) return `0`+input.toString();
  else return input;
}

const formSubmit = () => {
  const form = document.getElementById("save");
  form.addEventListener("click", (e) => {
      e.preventDefault();
      const modalHeaderEl = document.getElementById("modalHeader");
      const modalBodyEl = document.getElementById("modalBody");
      const isSelectPackageConditionsListEmpty = checkSelectPackageConditionsList();

      if (isSelectPackageConditionsListEmpty) {
          displayPackageConditionListEmptyModal(modalHeaderEl, modalBodyEl);
      } else {
          displaySelectedPackageConditionListModal(modalHeaderEl, modalBodyEl, true);
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
      const onlyUSPSCourierType = identifyCourierType(scannedBarcode);
      if (onlyUSPSCourierType === true) {
        kitObj[conceptIds.returnKitTrackingNum] = scannedBarcode
        for (let option of document.getElementById('packageCondition').options) {
          if (option.selected) {packageConditions.push(option.value)}
        }
        kitObj[`${conceptIds.pkgReceiptConditions}`] = packageConditions;
      //  kitObj[conceptIds.pkgComments] = document.getElementById('receivePackageComments').value.trim();
        kitObj[conceptIds.receivedDateTime] = convertDateReceivedinISO(document.getElementById('dateReceived').value);
        if(document.getElementById('collectionId').value) {
          kitObj[conceptIds.collectionCupId] = document.getElementById('collectionId').value;
          const dateCollectionCard = document.getElementById('dateCollectionCard').value;
          const timeCollectionCard = document.getElementById('timeCollectionCard').value;
          kitObj[conceptIds.collectionDateTimeStamp] = dateCollectionCard + 'T' + timeCollectionCard
          document.getElementById('collectionCheckBox').checked === true ? 
          kitObj[conceptIds.collectionCardFlag] = true : kitObj[conceptIds.collectionCardFlag] = false
          kitObj[conceptIds.collectionAddtnlNotes] = document.getElementById('collectionComments').value;
        }    
        window.removeEventListener("beforeunload",beforeUnloadMessage)
        targetAnchorTagEl();
        storePackageReceipt(kitObj);
       } 
    })
  }


}

const identifyCourierType = (scannedBarcode) => { return scannedBarcode.length === 20 || scannedBarcode.length === 22 }

const storePackageReceipt = async (data) => {
  showAnimation();
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=kitReceipt`,
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
    triggerSuccessModal('Kit Receipted.')
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
  } 
  else {
    triggerErrorModal('Error during Kit receipt.')
  }
};