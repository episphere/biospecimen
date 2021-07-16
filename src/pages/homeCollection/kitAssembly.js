import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";

export const kitAssemblyScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  //showAnimation();
  kitAssemblyTemplate(auth, route);
};

const kitAssemblyTemplate = (auth, route) => {
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


/* 

KIT ASSEMBLY TABLE HEADERS 

1. Line Item - NUMERIC
2. Specify Kit USPS Tracking Number - NUMBER
NOTE: USPS has 22 numbers long and Arranged in groups of 4 digits
EXAMPLE: 9400 1234 5678 9999 8765 00 
3. Supply Kit ID - ALPHA NUMERIC
EXAMPLE(?) - JKL123422
4. Specimen Kit ID - ALPHA NUMERIC
EXAMPLE(?) - GHI123422
5. Collection Cup ID - ALPHA NUMERIC
EXAMPLE(?) - DEF123422
6. Collection Card ID - ALPHA NUMERIC
EXAMPLE(?) - ABC123422 
*/