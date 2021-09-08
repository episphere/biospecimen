import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";
import { getIdToken, showAnimation, hideAnimation } from "../../shared.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";

const api =
  "https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?";

// Track the last row number
let lastRowNumber = "";
let uspsHolder = [];

export const kitAssemblyScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  const kitData = await getKitData().then((res) => res.data);
  hideAnimation();
  // await kitAssemblyTemplate(user, name, auth, route);

  // TODO: UNSAVED AND NAVIGATION - REFACTOR AND MAKE REUSABLE FOR OTHER PAGES
  // window.addEventListener("beforeunload", function (e) {
  //   var confirmationMessage =
  //     "It looks like you have been editing something. " +
  //     "If you leave before saving, your changes will be lost.";

  //   (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  //   return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  // });

  kitAssemblyTemplate(user, name, auth, route);

  // Fetch data using GET request

  const tableBody = document.getElementById("kit-assembly-table-body");

  // Render Table Data
  populateKitTable(tableBody, kitData);
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
        // Sort Function from Oldest to Newest
        const sortData = kitData.sort((a, b) =>
          a.timeStamp < b.timeStamp ? -1 : a.timeStamp > b.timeStamp ? 1 : 0
        );
        return sortData;
      }
      throw new Error("No Kit Assembly data!");
    } else {
      throw new Error("Status Code is not 200!");
    }
  } catch (e) {
    // if error return an empty array
    console.log(e);
    return [];
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
    <div id="alert-success" class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Kit was saved successfully!</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    contentBody.insertAdjacentHTML("afterbegin", alert);
    closeAlert("success");
  } else {
    alert += `<div id="alert-warning" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Kit was not saved successfully!</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    closeAlert("warn");
  }
};

const kitAssemblyTemplate = async (user, name, auth, route) => {
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
                        <th scope="col" style="background-color: #f7f7f7;" width="5%">Line Item</th>
                        <th scope="col" style="background-color: #f7f7f7;" width="25%">Specimen Kit USPS Tracking Number</th>
                        <th scope="col" style="background-color: #f7f7f7;" width="15%">Supply Kit ID</th>
                        <th scope="col" style="background-color: #f7f7f7;" width="15%">Specimen Kit ID</th>
                        <th scope="col" style="background-color: #f7f7f7;" width="20%">Collection Cup ID</th>
                        <th scope="col" style="background-color: #f7f7f7;" width="20%">Collection Card ID</th>
                    </tr>
                </thead>
                
                <tbody id="kit-assembly-table-body">
                </tbody>
            </table>
        </div>`;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
};

const populateKitTable = (tableBody, kitData) => {
  // tableBody - targetable body element, use when inserting an element when looping
  let tableRow = "";

  // TODO = Make the number dynamic and editable
  let extraRow = "";

  console.log(kitData);

  // Early exit if KitData is undefined
  if (!kitData || !kitData.length) {
    console.log("kitdata is undefined! or has length of 0");
    for (let i = 0; i < 1; i++) {
      // Update the last row number
      lastRowNumber = i + 1;
      // // If the current iteration is the last item and matches length of last row variable, add an extra row
      if (lastRowNumber === 1) {
        extraRow = `
      <tr class="new-row">      
        <th scope="row">${lastRowNumber}</th>
        <td>
          <input id="input-usps" autocomplete="off" name="input-usps" style="width:100%;text-overflow: ellipsis;" placeholder="3374889321009425653720" />
          <label for ="input-usps" style="font-size:.8rem;">Ex. 3374889321009425653720</label>
          <p></p>
        </td>
        <td>
            <input id="input-supply-kit" type="string" autocomplete="off" name="input-supply-kit" style="width:100%" placeholder="CON000007"/>
            <label for ="input-supply-kit" style="font-size:.8rem;">Ex. CON000007</label>
            <p></p>
        </td>
        <td>
            <input id="input-specimen-kit" type="string" autocomplete="off" name="input-specimen-kit" style="width:100%" name="input-specimen-kit" placeholder="CON000007"/>
            <label for ="input-specimen-kit" style="font-size:.8rem;">Ex. CON000007</label>
            <p></p>
        </td>
        <td class="text-wrap">
            <input id="input-collection-cup" type="string" autocomplete="off" style="width:100%; text-overflow: ellipsis;" placeholder="CXA123460 0009
            " name"input-collection-cup"/>
            <label for ="input-collection-cup" style="font-size:.8rem;">Ex. CXA123460 0009
            </label>
            
        </td>
        <td>
            <input id="input-collection-card" type="string" autocomplete="off" style="width:10 0%" placeholder="CXA123460 0009
            " name="input-collection-card"/>
            <label for ="input-collection-card" style="font-size:.8rem;">Ex. CXA123460 0009
            </label>
            <p></p>
        </td>
    </tr>
    `;
        tableRow += extraRow;
      }

      tableBody.innerHTML = tableRow;
      debugger;
      return;
    }
  }

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
            <input id="input-usps" autocomplete="off" name="input-usps" style="width:100%;text-overflow: ellipsis;" placeholder="3374889321009425653720" />
            <label for ="input-usps" style="font-size:.8rem;">Ex. 3374889321009425653720</label>
            <p></p>
          </td>
          <td>
            <input id="input-supply-kit" type="string" autocomplete="off" name="input-supply-kit" style="width:100%" placeholder="CON000007"/>
            <label for ="input-supply-kit" style="font-size:.8rem;">Ex. CON000007</label>
            <p></p>
          </td>
          <td>
            <input id="input-specimen-kit" type="string" autocomplete="off" name="input-specimen-kit" style="width:100%" name="input-specimen-kit" placeholder="CON000007"/>
            <label for ="input-specimen-kit" style="font-size:.8rem;">Ex. CON000007</label>
          </td>
          <td>
            <input id="input-collection-cup" type="string" autocomplete="off" style="width:100%;" placeholder="CXA123460 0009
            " name"input-collection-cup"/>
            <label for ="input-collection-cup" style="font-size:.8rem;">Ex. CXA123460 0009
            </label>
            <p></p>
          </td>
          <td>
              <input id="input-collection-card" type="string" autocomplete="off" style="width:100%" placeholder="CXA123460 0009
              " name="input-collection-card"/>
              <label for ="input-collection-card" style="font-size:.8rem;">Ex. CXA123460 0009
              </label>
              <p></p>
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

    if (
      jsonSaveBody.uspsTrackingNumber.length < 20 ||
      jsonSaveBody.uspsTrackingNumber.length > 22
    ) {
      return alert(
        "USPS tracking number length must be within the range of 20 to 22 characters"
      );
    }

    if (jsonSaveBody.supplyKitId.length !== 9) {
      return alert("supply kit id must be 9 characters");
    }

    if (jsonSaveBody.specimenKitId.length !== 9) {
      return alert("specimen kit id must be 9 characters");
    }

    if (jsonSaveBody.collectionCupId.length !== 14) {
      return alert("collection cup id must be 14 characters");
    }

    if (jsonSaveBody.collectionCardId.length !== 14) {
      return alert("collection card id must be 14 characters");
    }

    // Checks array if input usps tracking number exists in usps placeholder array
    // exits outer function if duplicate
    if (checkDuplicate(uspsHolder, jsonSaveBody.uspsTrackingNumber)) {
      alert("Duplicate usps tracking number!");
      return;
    }

    // Increment with all filled input fields
    tableNumRows++;
    // ADD DATA to TABLE
    // addKitData(jsonSaveBody);

    addRow(jsonSaveBody, tableNumRows);

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
  await inputUsps.addEventListener("blur", (e) => {
    let usps = e.target.value;
    console.log(usps.length);
    if (usps.length >= 30 && usps.length <= 32) {
      console.log(usps.length, usps);
      e.target.value = usps.split("").splice(8).join("");
    }
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
const addRow = (jsonSaveBody, tableNumRows) => {
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
    // alert("Number Value");
  } else {
    alert("Invalid USPS number data type, Not a number value");
    return;
  }

  uspsHolder.push(uspsTrackingNumber);
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
};

// Clear the row of existing user inputs
const clearRowInputs = (inputElements) => {
  for (let property in inputElements) {
    inputElements[property].value = "";
  }
};

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
const isNumeric = (num) => {
  // parseFloat - converts to string if needed, and then returns a floating point number
  // isFinite - false if the argument is (or will be coerced to) positive or negative Infinity or NaN or undefined
  return !isNaN(parseFloat(num)) && isFinite(num);
};

// Prevents POST request and Add to line if duplicate is found
// Used as a conditional in if statement above
const checkDuplicate = (uspsHolder, number) => {
  let unique = [...new Set(uspsHolder)];
  let found = unique.indexOf(number);
  if (found !== -1) {
    return true;
  }
};

// Manually close alert
const closeAlert = (status) => {
  if (status === "success") {
    const alertSuccess = document.getElementById("alert-success");
    alertSuccess.style.display = "block";
    setTimeout(function () {
      alertSuccess.style.display = "none";
    }, 3000);
  } else if (status === "warn") {
    const alertWarning = document.getElementById("alert-warning");
    alertWarning.style.display = "block";
    setTimeout(function () {
      alertWarning.style.display = "none";
    }, 3000);
  } else return;
};
