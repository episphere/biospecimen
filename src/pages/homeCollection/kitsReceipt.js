import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation } from "../../shared.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import fieldMapping from "../../fieldToConceptIdMapping.js";

const api =
  "https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?";

const contentBody = document.getElementById("contentBody");

export const kitsReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitsReceiptTemplate(user, name, auth, route);
  hideAnimation();
}

const kitsReceiptTemplate = async (user, name, auth, route) => {
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
};

const addDefaultDateReceived = (getCurrentDate) => {
  const dateReceivedEl = document.getElementById("dateReceived")
  if(getCurrentDate()){
    dateReceivedEl.value = getCurrentDate()
  }
  else dateReceivedEl.value = ""
}

// returns current date in default format ("YYYY-MM-DD")
const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate.getFullYear() + "-" + checkForPadding(parseInt(currentDate.getMonth() + 1)) + "-" + checkForPadding(currentDate.getDate())
}

const checkForPadding = (input) => { // adds 0 before single month & day to adhere to HTML date format
  if (input < 10) return `0`+input.toString();
  else return input;
}