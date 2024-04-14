import { showAnimation, hideAnimation, getParticipantsByKitStatus } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { kitStatusSelectionDropdown } from "./kitStatusReports.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";


export const kitStatusReportsShippedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  kitStatusShippedTemplate(username, auth, route);
};

const kitStatusShippedTemplate = async (name, auth, route) => {
  showAnimation();
  const response = await getParticipantsByKitStatus(conceptIds.shipped);
  console.log(response.data);
  hideAnimation();
    let template = ``;
    template += displayKitStatusReportsHeader();
    template += ` <div class="container-fluid">
                <div id="root root-margin">
                    <div class="table-responsive">
                        <h3 style="text-align: center; margin: 0 0 1rem;">Kits Shipped</h3>
                        <div class="sticky-header" style="overflow:auto;">
                            <table class="table table-bordered" id="participantData" style="margin-bottom:0; 
                                position:relative; border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                <thead> 
                                    <tr style="top: 0; position: sticky;">
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Shipped Date</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit ID</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit ID Tracking Number</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Return Kit Tracking Number</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Mouthwash Survey Completion Status</th>
                                    </tr>
                                </thead>   
                                <tbody>
                                    
                                </tbody>
                            </table>
                    </div>
                </div> 
            </div>`;
    template += `<div class="modal fade" id="editSuccessModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
            <div class="modal-content" style="padding:1rem">
            <div class="modal-header" style="border:0">
            <button type="button" class="close" style="font-size:40px" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
            </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar()
  kitStatusSelectionDropdown();
};



// ${createShippedRows(response.data)}
// const createShippedRows = (participantRows) => {
//   let template = ``;
//   participantRows.forEach((i) => {
//     template += `
//                       <tr class="row-color-enrollment-dark participantRow">
//                           <td>${i.first_name}</td>
//                           <td>${i.last_name}</td>
//                           <td>${i.kit_status}</td>
//                           <td>${i.study_site}</td>
//                           <td>${i.pickup_date}</td>
//                           <td>${i.supply_kitId}</td>
//                           <td>${i.usps_trackingNum}</td>
//                           <td>${i.confirm_pickup}</td>
//                       </tr>`;
//   });
//   return template;
// };