import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";
import { getIdToken } from "../../shared.js";


// REMOVE & REFACTOR FOR LATER***
const api = 'https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?'; 


export const kitAssemblyScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  //showAnimation();
  await kitAssemblyTemplate(auth, route);

  const kitData = await getKitData().then(res => res.data)
  const tableBody = document.getElementById("kit-assembly-table-body")
  populateKitTable(tableBody,kitData)

  // Render Page Buttons
  kitAssemblyPageButtons()

  // Invoke function to add event listener when clicked
  // saveItemModal()
};

// REMOVE & REFACTOR FOR LATER, ADD TO SHARED.JS FILE?***
// GET METHOD REQUEST
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
        // debugger;
        return kitData;
      }
      throw new Error("No Kit Assembly data!");
    } else {
      throw new Error("Status Code is not 200!");
    }
  } catch (e) {
    console.log(e);
  }
};

// REMOVE & REFACTOR FOR LATER, ADD TO SHARED.JS FILE?***
// POST METHOD REQUEST
const addKitData = () => {

}

const kitAssemblyTemplate = async (auth, route) => {
//   const kitData = await getKitData().then(res => res.data)

//   console.log(kitData)
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3>Kit Assembly</h3></div>
                </div>  `;

  template += `
        <div style="overflow:auto; height:400px">
            <table id="kit-assembly-table" class="table table-bordered" style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                <thead>
                    <tr style="top: 0;
                    position: sticky;">
                        <th scope="col" style="background-color: #f7f7f7;">Line Item</th>
                        <th scope="col" style="background-color: #f7f7f7;">Specify Kit USPS Tracking Number</th>
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
    let tableRow = ''

    // TODO = Make the number dynamic and editable
    let extraRow = ''
    console.log(kitData)
    // Create loop 
    for(let i = 0; i < kitData.length; i++) {
        // Append a row with data cells and corresponding data from fetch
        tableRow += `
        <tr>
            <th scope="row">${i+1}</th>
            <td>${kitData[i].uspsTrackingNumber}</td>
            <td>${kitData[i].supplyKitId}</td>
            <td>${kitData[i].specimenKitId}</td>
            <td>${kitData[i].collectionCupId}</td>
            <td>${kitData[i].collectionCardId}</td>
        </tr>`
        
        // If the current iteration is the last item, add an extra row
        if(i === kitData.length-1){
            // Add two to current i value to display correct line item number
            extraRow = `        
            <tr class="new-row">
                <th scope="row">${i+2}</th>
                <td contenteditable="true"></td>
                <td contenteditable="true"></td>
                <td contenteditable="true"></td>
                <td contenteditable="true"></td>
                <td contenteditable="true"></td>
            </tr>
            `
            tableRow += extraRow
        }
        tableBody.innerHTML = tableRow
    }
}

const kitAssemblyPageButtons = () => {
    const contentBody = document.getElementById("contentBody")
    let buttonContainerTemplate = ""

    console.log(contentBody)
    
    buttonContainerTemplate += `
        <div class="kit-assembly-button-container d-flex justify-content-around" style="margin: 8rem;">
            <button id="kit-assembly-save-button" type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#saveModal">Save</button>
            <button type="button" class="btn btn-success">Continue to Print Addresses</button>
        </div> 
    `
    contentBody.innerHTML += buttonContainerTemplate
}


/*
TODO STEPS:

1. Fetch data using GET request
2. Target table body
3. Create a function to create a new row and iterate through list of items
    NOTE: Insert an extra row
4. Make extra row editable
    TODO: Fix resizing issue - make content fit within container and not change width
5. Create Buttons (Add, Save, Link to another page)
    - Add: Create a new editable row for table
    - Save: Makes a POST request to add a new item to the dataset
    - Link: To another Web page
6. Prioritize Save button POST request 
    - TEST POST Request first on POSTMAN *
    - Create a Modal for Save Button with Two Buttons (IGNORE FOR MVP)
        - Confirm
        - Cancel
    - Make save button make a post request and have a popup saying success
7. Have an Add button create a new line to table
8. Handle acceptable POST request on the client side
*/