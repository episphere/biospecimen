import { nonUserNavBar } from "./../../navbar.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import {
  showAnimation,
  hideAnimation,
  getIdToken,
  baseAPI,
  storeDateReceivedinISO,
  triggerSuccessModal,
  triggerErrorModal
} from "../../shared.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import conceptIds from '../../fieldToConceptIdMapping.js';

export const kitShipmentScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitShipmentTemplate(username);
  verifyScannedCode();
  hideAnimation();
};

const kitShipmentTemplate = async (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += ` 
                      <div id="root root-margin" style="padding-top: 25px;">
                      <div id="alert_placeholder"></div>
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Kit Shipment</h3> </span>
                      <div class="container-fluid" style="padding-top: 50px;">     
                          <div class="card">
                          <div class="card-body">
                          <span> <h3 style="text-align: center; margin: 0 0 1rem;">Scan tracking number</h3> </span>
                            <div style="text-align: center;  padding-bottom: 25px; "> 
                              <span id="fieldModified"> Scan Barcode</span>  : <input required type="text" name="scannedCode" id="scannedCode"  /> </div>
                              <div class="card text-center" id="cardBody" style="width: 40%; margin-left: 30%; margin-right: 30%;"> </div>
                          </div>
                        </div>
                  </div>
             </div>`;
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar()
};

const verifyScannedCode = async () => {
  const scannedCodeInput = document.getElementById("scannedCode");
  if (scannedCodeInput) {
    scannedCodeInput.addEventListener("change", async () => {
      showAnimation();
      const isScannedCodeValid = await checkScannedCodeValid(scannedCodeInput.value)
      hideAnimation();
      isScannedCodeValid.data.valid ? confirmPickupTemplate(isScannedCodeValid.data.UKID) : tryAgainTemplate();
    });
  }
};

const confirmPickupTemplate = (UKID) => {
  const cardBody = document.getElementById("cardBody");
  cardBody.innerHTML = `        
                  <div class="card-body">
                      <span id="pickupDate"> Pickup Date </span>  : <input required type="text" name="inputDate" id="inputDate" value=${new Date().toLocaleDateString()} style="text-align:center" />
                        <br />
                        <div class="form-check" style="padding-top: 20px;">
                            <input class="form-check-input" name="options" type="checkbox" id="defaultCheck" checked>
                            <label class="form-check-label" for="defaultCheck3">Confirm Pickup </label> 
                        </div>
                      </div>
                      <div style="display:inline-block; padding: 10px 10px;">
                        <button type="submit" class="btn btn-danger" id="cancelResponse">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="saveResponse">Save</button>
                      </div>`;
  saveResponse(UKID);
  cancelResponse(cardBody);
};

const tryAgainTemplate = () => {
  const cardBody = document.getElementById("cardBody");
  cardBody.innerHTML = `        
                <div class="card-body">
                    <span> Couldn't find scanned tracking number </span>
                    <br />
                </div>`;
};

const saveResponse = (UKID) => {
  const saveResponseBtn = document.getElementById("saveResponse");
  let data = {};
  data[conceptIds.UKID] = UKID;
  if (saveResponseBtn) {
    saveResponseBtn.addEventListener("click", (e) => {
      data[conceptIds.shippedDateTime] = storeDateReceivedinISO(document.getElementById("inputDate").value);
      setShippedResponse(data);
    });
  }
};

const cancelResponse = (cardBody) => {
  const cancelButton = document.getElementById("cancelResponse");
  if (cancelButton) {
    cancelButton.addEventListener("click", (e) => {
      cardBody.innerHTML = ``;
    });
  }
};

const setShippedResponse = async (data) => {
  showAnimation();
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=confirmShippment`, {
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
    triggerSuccessModal('Shipment confirmed.')
    document.getElementById("scannedCode").value = ``;
    document.getElementById("cardBody").innerHTML = ``;
    return true;
  } else {
    triggerErrorModal('Error')
  }
};

const checkScannedCodeValid = async (scannedCode) => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=verifyScannedCode&id=${scannedCode}`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}