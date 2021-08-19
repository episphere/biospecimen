import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";
import { getIdToken, showAnimation, hideAnimation } from "../../shared.js";

const api =
  "https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?";

// Track the last row number
let lastRowNumber = "";
let uspsHolder = [];

export const kitAssemblyScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  showAnimation();
  const kitData = await getKitData().then((res) => res.data);
  hideAnimation();

  kitAssemblyTemplate(auth, route);

  // Fetch data using GET request

  const tableBody = document.getElementById("kit-assembly-table-body");

  // Sort Function from Oldest to Newest (REFACTOR FOR MULTIPLE USE)
  const sortData = kitData.sort((a, b) =>
    a.timeStamp < b.timeStamp ? -1 : a.timeStamp > b.timeStamp ? 1 : 0
  );

  console.log(sortData);
  // Render Table Data
  populateKitTable(tableBody, sortData);
  // Render Page Buttons
  kitAssemblyPageButtons();

  let inputUsps = document.getElementById("input-usps");
  let inputSupplyKit = document.getElementById("input-supply-kit");
  let inputSpecimenKit = document.getElementById("input-specimen-kit");
  let inputCollectionCup = document.getElementById("input-collection-cup");
  let inputCollectionCard = document.getElementById("input-collection-card");

  const inputElements = {
    inputUsps,
    inputSupplyKit,
    inputSpecimenKit,
    inputCollectionCard,
    inputCollectionCup,
  };

  //Event Listener for Table Inputs
  await userInputHandler(
    inputUsps,
    inputSupplyKit,
    inputSpecimenKit,
    inputCollectionCup,
    inputCollectionCard
  );

  // Add autofocus on first input cell
  inputUsps.focus();

  // Remove all current input fields on row
  clearAllInputs(inputElements);

  // Invoke function to add item to table and send a POST request
  await saveItem(
    tableBody,
    inputUsps,
    inputSupplyKit,
    inputSpecimenKit,
    inputCollectionCup,
    inputCollectionCard,
    inputElements
  );
};

/*
==================================================
GET METHOD REQUEST - Retrieve all Kits
==================================================
*/
const getKitData = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${api}api=getKitData`, {
    method: "GET",
    headers: {
      Authorization: "Bearer" + idToken,
    },
  });

  try {
    if (response.status === 200) {
      const kitData = await response.json();
      if (kitData.data.length) {
        return kitData;
      }
      // TODO: ADD a row where a user can enter data, handle when there is no data from GET request
      throw new Error("No Kit Assembly data!");
    } else {
      throw new Error("Status Code is not 200!");
    }
  } catch (e) {
    console.log(e);
  }
};
/*
==================================================
POST METHOD REQUEST - Add a Kit
==================================================
*/
const addKitData = async (jsonSaveBody) => {
  const idToken = await getIdToken();
  const response = await await fetch(`${api}api=addKitData`, {
    method: "POST",
    body: JSON.stringify(jsonSaveBody),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });

  // TODO: Make into separate Function call
  let contentBody = document.getElementById("contentBody");
  let alert = "";

  if (response.status === 200) {
    alert += `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Kit was saved successfully!</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    contentBody.insertAdjacentHTML("afterbegin", alert);
  } else {
    alert += `<div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Kit was not saved successfully!</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
  }
};

const kitAssemblyTemplate = async (auth, route) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Kit Assembly</h3></div>
                </div>`;

  template += `
        <div style="overflow:auto; height:45vh">
            <table id="kit-assembly-table" class="table table-bordered" style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                <thead>
                    <tr style="top: 0;
                    position: sticky;">
                        <th scope="col" style="background-color: #f7f7f7;">Line Item</th>
                        <th scope="col" style="background-color: #f7f7f7;">Specimen Kit USPS Tracking Number</th>
                        <th scope="col" style="background-color: #f7f7f7;">Supply Kit ID</th>
                        <th scope="col" style="background-color: #f7f7f7;">Specimen Kit ID</th>
                        <th scope="col" style="background-color: #f7f7f7;">Collection Cup ID</th>
                        <th scope="col" style="background-color: #f7f7f7;">Collection Card ID</th>
                    </tr>
                </thead>
                
                <tbody id="kit-assembly-table-body">
                </tbody>
            </table>
        </div>`;

  document.getElementById("contentBody").innerHTML = template;
};

const populateKitTable = (tableBody, kitData) => {
  // tableBody - targetable body element, use when inserting an element when looping
  let tableRow = "";

  // TODO = Make the number dynamic and editable
  let extraRow = "";

  // Create loop and iterate all array items
  for (let i = 0; i < kitData.length; i++) {
    // Append usps track number to uspsHolder
    uspsHolder.push(kitData[i].uspsTrackingNumber);
    // console.log(uspsHolder);

    // Append a row with data cells and corresponding data from fetch
    tableRow += `
        <tr>
            <th scope="row">${i + 1}</th>
            <td>${kitData[i].uspsTrackingNumber}</td>
            <td>${kitData[i].supplyKitId}</td>
            <td>${kitData[i].specimenKitId}</td>
            <td>${kitData[i].collectionCupId}</td>
            <td>${kitData[i].collectionCardId}</td>
        </tr>`;

    // Update the last row number
    lastRowNumber = i + 1;
    // // If the current iteration is the last item and matches length of last row variable, add an extra row
    if (lastRowNumber === kitData.length) {
      extraRow = `
        <tr class="new-row">      
          <th scope="row">${lastRowNumber + 1}</th>
          <td>
              <input id="input-usps" autocomplete="off" style="width:80%"/>
          </td>
          <td>
              <input id="input-supply-kit" type="string" autocomplete="off" style="width:80%"/>
          </td>
          <td>
              <input id="input-specimen-kit" type="string" autocomplete="off" style="width:80%"/>
          </td>
          <td>
              <input id="input-collection-cup" type="string" autocomplete="off" style="width:80%"/>
          </td>
          <td>
              <input id="input-collection-card" type="string" autocomplete="off" style="width:80%"/>
          </td>
      </tr>
      `;
      tableRow += extraRow;
    }

    tableBody.innerHTML = tableRow;
  }
};

const kitAssemblyPageButtons = () => {
  const contentBody = document.getElementById("contentBody");
  let buttonContainerTemplate = "";

  buttonContainerTemplate += `
        <div class="kit-assembly-button-container d-flex justify-content-around" style="margin: 4rem 0 1.5rem 0;">
          <button id="kit-assembly-clear-button" type="button" class="btn btn-outline-secondary" style=" width:13rem; height:3rem; border-radius:15px">Clear</button>

          <button id="kit-assembly-save-button" type="submit" class="btn btn-success" style="width:13rem;height:3rem; border-radius:15px">Save</button>
        </div> 
    `;
  contentBody.innerHTML += buttonContainerTemplate;
};

const saveItem = async (
  tableBody,
  inputUsps,
  inputSupplyKit,
  inputSpecimenKit,
  inputCollectionCup,
  inputCollectionCard,
  inputElements
) => {
  const saveButton = document.getElementById("kit-assembly-save-button");
  let tableNumRows = tableBody.rows.length;
  saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    // Target Last row and the last row's children elements
    // Remove whitespace if any on input fields
    jsonSaveBody.collectionCardId = inputCollectionCard.value.trim();
    jsonSaveBody.supplyKitId = inputSupplyKit.value.trim();
    jsonSaveBody.collectionCupId = inputCollectionCup.value.trim();
    jsonSaveBody.specimenKitId = inputSpecimenKit.value.trim();
    // Convert string to number data type
    jsonSaveBody.uspsTrackingNumber = inputUsps.value.trim();

    // PREVENTS USER FROM SUBMITTING INCOMPLETE INPUT FIELD ROW
    for (const key in jsonSaveBody) {
      if (!jsonSaveBody[key]) {
        // Modal Dialog Warning!
        alert("One or more inputs are empty!");
        return;
      }
    }
    /* 
      INPUT CHARACTER LENGTH CHECK
    */
    // if (jsonSaveBody.uspsTrackingNumber.length !== 20) {
    //   console.log(jsonSaveBody.uspsTrackingNumber.length);

    //   return alert("uspsTrackingNumber length must be 20 characters");
    // }
    // if (jsonSaveBody.supplyKitId.length !== 9) {
    //   console.log(jsonSaveBody.supplyKitId.length);

    //   return alert("supply kit id must be 9 characters");
    // }

    // if (jsonSaveBody.specimenKitId.length !== 9) {
    //   console.log(jsonSaveBody.specimenKitId.length);

    //   return alert("specimen kit id must be 9 characters");
    // }

    // if (jsonSaveBody.collectionCupId.length !== 14) {
    //   console.log(jsonSaveBody.collectionCupId.length);

    //   return alert("collection cup id must be 14 characters");
    // }

    // if (jsonSaveBody.collectionCardId.length !== 14) {
    //   console.log(jsonSaveBody.collectionCardId.length);

    //   return alert("collection card id must be 14 characters");
    // }

    // Increment with all filled input fields
    tableNumRows++;

    // Check and change data type to number before sending POST request
    if (isNumeric(jsonSaveBody.uspsTrackingNumber)) {
      jsonSaveBody.uspsTrackingNumber = parseInt(inputUsps.value.trim());
      console.log(jsonSaveBody);
    }

    // Checks array if input usps tracking number exists in usps placeholder array
    // exits outer function if duplicate
    if (checkDuplicate(uspsHolder, jsonSaveBody.uspsTrackingNumber)) {
      debugger;
      alert("Duplicate usps tracking number!");
      clearRowInputs(inputElements);
      return;
    }

    // ADD DATA to TABLE
    // addKitData(jsonSaveBody);

    addRow(jsonSaveBody, tableNumRows);
    console.log(uspsHolder);
    clearRowInputs(inputElements);
  });
};

// User input handler

const userInputHandler = async (
  inputUsps,
  inputSupplyKit,
  inputSpecimenKit,
  inputCollectionCup,
  inputCollectionCard
) => {
  // Event Handlers for input fields
  await inputUsps.addEventListener("input", (e) => {
    inputUsps.value = e.target.value;
  });

  await inputSupplyKit.addEventListener("input", (e) => {
    inputSupplyKit.value = e.target.value;
  });

  await inputSpecimenKit.addEventListener("input", (e) => {
    inputSpecimenKit.value = e.target.value;
  });

  await inputCollectionCup.addEventListener("input", (e) => {
    inputCollectionCup.value = e.target.value;
  });

  await inputCollectionCard.addEventListener("input", (e) => {
    inputCollectionCard.value = e.target.value;
  });
};

// Create JSON body object to be modified
const jsonSaveBody = {
  collectionCardId: "",
  supplyKitId: "",
  collectionCupId: "",
  specimenKitId: "",
  uspsTrackingNumber: "",
};

// Add New row with inputs
function addRow(jsonSaveBody, tableNumRows) {
  // Convert to integer num value
  let uspsTrackingNumber = jsonSaveBody.uspsTrackingNumber;
  console.log(uspsTrackingNumber);

  // Target Line Item Number
  let newRowEl = document.querySelector(".new-row");

  // Early Exit for number checker
  // If trackingNumber is data type of number
  // CALL isNumeric function to check if input is a valid number
  if (isNumeric(uspsTrackingNumber)) {
    console.log(typeof uspsTrackingNumber === "number");
    console.log(uspsTrackingNumber);
    // ADD UI MODAL
    alert("Number Value");
  } else {
    alert("Invalid USPS number data type, Not a number value");
    debugger;
    return;
  }

  uspsHolder.push(parseInt(uspsTrackingNumber));
  newRowEl.firstChild.nextSibling.innerHTML = tableNumRows;
  newRowEl.insertAdjacentHTML(
    "beforebegin",
    `<tr>
<th scope="row">${tableNumRows - 1}</th>
<td>
    ${jsonSaveBody.uspsTrackingNumber}
</td>
<td>
    ${jsonSaveBody.supplyKitId}
</td>
<td>
    ${jsonSaveBody.specimenKitId}
</td>
<td>
    ${jsonSaveBody.collectionCupId}
</td>
<td>
    ${jsonSaveBody.collectionCardId}
</td>
</tr>`
  );
}

// Clear the row of existing user inputs
function clearRowInputs(inputElements) {
  for (let property in inputElements) {
    inputElements[property].value = "";
  }
}

// clear Button Clear Inputs Function

const clearAllInputs = (inputElements) => {
  const clearButton = document.getElementById("kit-assembly-clear-button");

  clearButton.addEventListener("click", (e) => {
    e.preventDefault();
    // for in to loop over all property keys
    for (let property in inputElements) {
      inputElements[property].value = "";
    }
  });
};

/*
CHECK IF STRING OR NUM VALUE IS A REAL NUMBER  
https://stackoverflow.com/questions/9716468/pure-javascript-a-function-like-jquerys-isnumeric
*/
function isNumeric(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

// Prevents POST request and Add to line if duplicate is found
// Used as a conditional in if statement above
function checkDuplicate(uspsHolder, number) {
  let found = uspsHolder.indexOf(number);
  if (found !== -1) {
    return true;
  }
}

/*
UPCOMING FEATURES

1. USER VALIDATION CHECKS - 
    - Input checks for Column 2 and 3 (Match) / Modals? 
    - Input checks for Column 4 and 5 (Match) / Modals?
    - USPS unique numeric check / Modals?
    - Modal Warning when user is moving away from page or accidentally hit close button

2. ALERT USER WHEN THEY NAVIGATE AWAY FROM PAGE OR EXIT WINDOW  - 
    https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes

Extra- ALERT FADE OUT
    - HAVE ALERT FADE OUT WHEN CERTAIN TIME PASSES


/*

API INTEGRATION

url with - https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/

http://{URL}/biospecimen?api=printAddresses returns success upon adding participant data to Participant Selection collection

http://{URL}/biospecimen?api=getParticipantSelection&type=${filter} returns participant data with kit status set as per filter

http://{URL}/biospecimen?api=assignKit updates participant data with kit status, usps tracking number & supply kit id
*/
