import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";
import { biospecimenUsers,getIdToken } from "../../shared.js";


// REMOVE & REFACTOR FOR LATER***
const api = 'https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?'; 


export const kitAssemblyScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  //showAnimation();
  kitAssemblyTemplate(auth, route);
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
  const kitData = await getKitData().then(res => res.data)

  await console.log(kitData)
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
                
                <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td>9400 1234 5678 9999 8765 00</td>
                        <td>JKL123422</td>
                        <td>GHI123422</td>
                        <td>DEF123422</td>
                        <td>ABC123422</td>
                    </tr>
                </tbody>
            </table>`;
  document.getElementById("contentBody").innerHTML = template;
};
