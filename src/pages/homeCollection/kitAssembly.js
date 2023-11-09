import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, appState, baseAPI, triggerErrorModal } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import conceptIds from '../../fieldToConceptIdMapping.js';

const contentBody = document.getElementById("contentBody");
localStorage.setItem('tmpKitData', JSON.stringify([]));
appState.setState({UKID: ``});

export const kitAssemblyScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitAssemblyTemplate(name);
  hideAnimation();
}

const kitAssemblyTemplate = async (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">

                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Kit Assembly</h3></div>
                </div>`;

  template += `
          <div class="row">
              <div class="col">
              <div id="alert_placeholder"></div>
                  <form>
                        <div class="form-group row">
                          <label for="scannedBarcode" class="col-md-4 col-form-label">Tracking Number</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="scannedBarcode" placeholder="Scan Barcode" required />
                            <span id="showErrorMsg" style="font-size: 14px;"></span>
                          </div>
                        </div>
                        <div class="form-group row">
                          <label for="supplyKitId" class="col-md-4 col-form-label">Supply Kit ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="supplyKitId" placeholder="Enter Supply Kit ID" required />
                          </div>
                        </div>
                        <div class="form-group row">
                          <label for="returnKitId" class="col-md-4 col-form-label">Return Kit ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="returnKitId" placeholder="Enter Return Kit ID" required />
                            <span id="showReturnKitErrorMsg" style="font-size: 14px;"></span>
                            </div>
                        </div>
                        <div class="form-group row">
                          <label for="cupId" class="col-md-4 col-form-label">Cup ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="cupId" placeholder="Enter Cup ID" required />
                          </div>
                        </div>
                        <div class="form-group row">
                          <label for="cardId" class="col-md-4 col-form-label">Card ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="cardId" placeholder="Enter Card ID" required />
                            <span id="showCardIdErrorMsg" style="font-size: 14px;"></span>
                          </div>
                      </div>
                      <div class="form-group row">
                        <label for="kitType" class="col-md-4 col-form-label">Kit Type</label>
                          <div class="col-md-8">
                            <div class="dropdown">
                              <button class="btn btn-secondary dropdown-toggle dropdown-toggle-sites" id="dropdownSites" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              Select Kit Type
                              </button>
                                <ul class="dropdown-menu scrollable-menu" id="dropdownMenuButtonSites" aria-labelledby="dropdownMenuButton">
                                        <li><a class="dropdown-item" data-kitType="mouthwash" id="mouthwash">Mouthwash</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
                <div class="mt-4 mb-4" style="display:inline-block;">
                  <button type="submit" class="btn btn-primary" id="saveKit">Save & Next</button>
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
  processAssembledKit();
  enableEnterKeystroke();
  dropdownTrigger('Select Kit Type');
  checkTrackingNumberValid();
  performQCcheck('returnKitId', 'supplyKitId', 'showReturnKitErrorMsg', `Supply Kit & Return Kit need to be same`);
  performQCcheck('cardId', 'cupId', 'showCardIdErrorMsg', `Cup ID & Card ID need to be same`);
};

const enableEnterKeystroke = () => {
  document.getElementById("cardId").addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.key === 'Enter') {
        document.getElementById("saveKit").click();
    }
});
}

const performQCcheck = (inputBox2, inputBox1, errorTag, errorMsg) => {
  const checkInputBox2 = document.getElementById(inputBox2);
  if (checkInputBox2) {
    checkInputBox2.addEventListener("input", (e) => {
      const checkInputBox2Value = e.target.value.trim();
      const checkInputBox1Value = document.getElementById(inputBox1).value.trim();
      if (checkInputBox2Value !== checkInputBox1Value) {
        document.getElementById(errorTag).innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i> ${errorMsg}`
      }
      else {
        document.getElementById(errorTag).innerHTML = ``
      }
    })
  }
}

const checkTrackingNumberValid = () => {
  const checkTrackingNumber = document.getElementById("scannedBarcode");
  if (checkTrackingNumber) {
    checkTrackingNumber.addEventListener("input", (e) => {
      const input = e.target.value.trim()
      if (input.length > 22 || input.length < 20) {
        document.getElementById('showErrorMsg').innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i> Scan limited only to USPS`
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


const processAssembledKit = () => {
  const saveKitButton = document.getElementById('saveKit');
  if (saveKitButton) {
    saveKitButton.addEventListener('click', async () => { 
      let kitObj = {};

      const scannedBarcodeValue = document.getElementById('scannedBarcode').value.trim();
      const supplyKitIdValue = document.getElementById('supplyKitId').value.trim();
      const returnKitIdValue = document.getElementById('returnKitId').value.trim();
      const collectionCupIdValue = document.getElementById('cupId').value;
      const collectionCardIdValue = document.getElementById('cardId').value;

      if (scannedBarcodeValue.length === 0 || supplyKitIdValue.length === 0 ||  returnKitIdValue.length === 0 ||
        collectionCupIdValue.length === 0 || collectionCardIdValue.length === 0) {
          triggerErrorModal('One or more fields are missing.');
        }
      else {
        kitObj[conceptIds.returnKitTrackingNum] = scannedBarcodeValue;
        kitObj[conceptIds.supplyKitId] = supplyKitIdValue;
        kitObj[conceptIds.returnKitId] = returnKitIdValue;
        kitObj[conceptIds.collectionCupId] = collectionCupIdValue
        kitObj[conceptIds.collectionCardId] = collectionCardIdValue;
        kitObj[conceptIds.kitType] = conceptIds.mouthwashKitType;
        const responseStoredStatus = await storeAssembledKit(kitObj);
        if (responseStoredStatus) {
          document.getElementById('scannedBarcode').value = ``
          document.getElementById('supplyKitId').value = ``
          document.getElementById('returnKitId').value = ``
          document.getElementById('cupId').value = ``
          document.getElementById('cardId').value = ``
        }
      }
    })
  }
}


const renderSidePane = () => {
  const kitObjects = JSON.parse(localStorage.getItem('tmpKitData'));
  document.getElementById('sidePane').innerHTML = ``
  document.getElementById('sidePane').innerHTML +=  `&nbsp;<b>Kits Assembled:</b> ${Object.keys(kitObjects).length}`
  kitObjects.forEach((kitObject) => {
    kitObject[conceptIds.collectionCupId] = kitObject[conceptIds.collectionCupId].replace(/\s/g, "\n");
    kitObject[conceptIds.collectionCardId] = kitObject[conceptIds.collectionCardId].replace(/\s/g, "\n");
    document.getElementById('sidePane').innerHTML +=
      `<ul style="overflow-y: scroll;">
        <br />
        Scanned Barcode = ${ kitObject[conceptIds.returnKitTrackingNum] } |
        Supply Kit ID = ${ kitObject[conceptIds.supplyKitId] } |
        Return Kit ID = ${ kitObject[conceptIds.returnKitId] } |
        Cup Id = ${ kitObject[conceptIds.collectionCupId] } |
        Card Id = ${ kitObject[conceptIds.collectionCardId] }
        <button type="button" class="btn btn-outline-primary detailedRow" data-kitObject=${JSON.stringify(kitObject)} id="editAssembledKits">Edit</button>
      </ul>`
  })
  editAssembledKits();
}



const editAssembledKits = () => {
  const detailedRow = Array.from(document.getElementsByClassName('detailedRow'));
  if (detailedRow) {
    Array.from(detailedRow).forEach(function(editKitBtn) {
      editKitBtn.addEventListener('click', () => {
        const editKitObj = JSON.parse(editKitBtn.getAttribute('data-kitObject'));
        document.getElementById('scannedBarcode').value = editKitObj[conceptIds.returnKitTrackingNum]
        document.getElementById('supplyKitId').value = editKitObj[conceptIds.supplyKitId]
        document.getElementById('returnKitId').value = editKitObj[conceptIds.returnKitId]
        document.getElementById('cupId').value = editKitObj[conceptIds.collectionCupId]
        document.getElementById('cardId').value = editKitObj[conceptIds.collectionCardId]
        appState.setState({UKID: editKitObj[conceptIds.UKID]})
      });
    }); // state to indicate if its an edit & also pass the UKID
}}

const checkCollecitonUniqueness = async (collectionUniqueId) => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=collectionUniqueness&id=${collectionUniqueId}`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

const storeAssembledKit = async (kitData) => {
  const idToken = await getIdToken();
  showAnimation();
  const collectionUnique = await checkCollecitonUniqueness(kitData[conceptIds.collectionCupId].replace(/\s/g, "\n"));
  hideAnimation();
  if (collectionUnique.data) {
    kitData[conceptIds.kitStatus] = conceptIds.pending.toString();
    kitData[conceptIds.UKID] = "MW" + Math.random().toString(16).slice(2);
    kitData[conceptIds.pendingDateTimeStamp] = new Date().toISOString();
    let api = `addKitData`
    if (appState.getState().UKID !== ``) { 
      api = `updateKitData` 
      kitData[conceptIds.UKID] = appState.getState().UKID
    }
    const response = await fetch(`${baseAPI}api=${api}`, {
      method: "POST",
      body: JSON.stringify(kitData),
      headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      alertTemplate(`Kit saved successfully!`, `success`);
      const existingKitData = JSON.parse(localStorage.getItem('tmpKitData'));
      existingKitData.push(kitData);
      if (appState.getState().UKID !== ``) {
        const filteredKitData = [];
        const seenValues = new Set();
        for (let i = existingKitData.length - 1; i >= 0; i--) { // removes previously assembled kit
          const key = existingKitData[i][conceptIds.UKID];
          if (!seenValues.has(key)) {
              seenValues.add(key);
              filteredKitData.push(existingKitData[i]);
          }
      }
        appState.setState({UKID: ``})
        localStorage.setItem('tmpKitData', JSON.stringify(filteredKitData))
      }
      else {
        localStorage.setItem('tmpKitData', JSON.stringify(existingKitData))
      }

      renderSidePane();
      return true
    }
    else {
      alertTemplate(`Kit saved unsuccessfully!`, `warn`);
      return false
    }
  } 
  else {
    triggerErrorModal('The collection card and cup ID are already in use.')
    return false
  }
}

const alertTemplate = (message, status = "warn", duration = 1000) => {
  if (status === "success") {
    alert = `
    <div id="alert-success" class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>${message}</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`
    ;
    contentBody.insertAdjacentHTML("afterbegin", alert);
    closeAlert(status, duration);
  } else if (status === "warn") {
    alert = `<div id="alert-warning" class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>${message}</strong>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`;
    contentBody.insertAdjacentHTML("afterbegin", alert);
    closeAlert(status, duration);
  } else return;
};

// Automatically Close Alert Message
const closeAlert = (status = "warn", duration = 5000) => {
  if (status === "success") {
    const alertSuccess = document.getElementById("alert-success");
    alertSuccess.style.display = "block";
    setTimeout(function () {
      alertSuccess.style.display = "none";
    }, duration);
  } else if (status === "warn") {
    const alertWarning = document.getElementById("alert-warning");
    alertWarning.style.display = "block";
    setTimeout(function () {
      alertWarning.style.display = "none";
    }, duration);
  } else return;
};

const dropdownTrigger = (sitekeyName) => {
  let dropdownSiteBtn = document.getElementById('dropdownSites');
  let dropdownMenuButton = document.getElementById('dropdownMenuButtonSites');
  let tempSiteName = dropdownSiteBtn.innerHTML = sitekeyName;
  if (dropdownMenuButton) {
      dropdownMenuButton.addEventListener('click', (e) => {
          if (sitekeyName === `Select Kit Type` || sitekeyName === tempSiteName) {
            dropdownSiteBtn.innerHTML = e.target.textContent;  
          }
      })
  }
}