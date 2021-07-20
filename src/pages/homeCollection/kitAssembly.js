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
};

// REMOVE & REFACTOR FOR LATER, ADD TO SHARED.JS FILE?***
const getKitData = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getKitData`,{
        method:"GET",
        headers: {
            Authorization:"Bearer"+idToken
        }
    })

    const kitData = await response.json()

    // TODO - ERROR HANDLING, MAYBE TRY/CATCH BLOCK?
    // if(kitData.data.length < 1) {
    //     return console.log('No data')
    // }
    // else {
    //     console.log(kitData)
    //     return kitData
    // }
    
    return kitData
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
        <table id="kit-assembly-table" class="table   table-bordered">
                <thead>
                    <tr>
                        <th scope="col">Line Item</th>
                        <th scope="col">Specify Kit USPS Tracking Number</th>
                        <th scope="col">Supply Kit ID</th>
                        <th scope="col">Specimen Kit ID</th>
                        <th scope="col">Collection Cup ID</th>
                        <th scope="col">Collection Card ID</th>
                    </tr>
                </thead>
                
                <tbody id="kit-assembly-table-body">
                </tbody>
            </table>`;

  document.getElementById("contentBody").innerHTML = template;
};


const populateKitTable = (tableBody, kitData) => {
    // tableBody - targetstable body element, use when inserting an element when looping
    let tableRow = ''

    // TODO = Make the number dynamic and editable
    let extraRow = `
        <tr>
            <th scope="row">.</th>
            <td>.</td>
            <td>.</td>
            <td>.</td>
            <td>.</td>
            <td>.</td>
        </tr>
        `
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
            tableRow += extraRow
        }
        tableBody.innerHTML = tableRow
    }
}


/*
TODO STEPS:

1. Fetch data using GET request
2. Target table body
3. Create a function to create a new row and iterate through list of items
    NOTE: Insert an extra row
4. Make extra row editable


*/