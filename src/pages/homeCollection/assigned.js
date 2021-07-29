import { getIdToken, findParticipant, showAnimation, hideAnimation } from "../../shared.js";
import { renderParticipanSelectionHeader } from "./participantSelectionHeaders.js";

export const assignedScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const username = user.displayName ? user.displayName : user.email;
    aassignedTemplate(auth, route);
}             

const aassignedTemplate = async (auth, route) => {
    let template = ``;
    template += renderParticipanSelectionHeader();
    template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center;">Assigned</h3> </span>
                            <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">USPS Tracking Number</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Edit</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                       
                                    </tbody>
                              </table>
                        </div>
                    </div> 
                </div>`
    document.getElementById('contentBody').innerHTML = template;

    redirectDropdownScreen();
}


const  redirectDropdownScreen = () => {
    const a = document.getElementById('btnParticipantSearch');
    a.addEventListener('click', () => {
        const selection = document.getElementById('paticipantSelection');
        if (selection.value === 'pending') {
            location.hash = '#participantselection';
        }
        else if (selection.value === 'addressPrinted') {
            location.hash = '#addressPrinted';
        }
        else if (selection.value === 'assigned') {
            location.hash = '#assigned';
        }
    })
}