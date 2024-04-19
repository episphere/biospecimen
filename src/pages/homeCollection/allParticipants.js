import { showAnimation, hideAnimation, getParticipantsByKitStatus } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { kitStatusSelectionDropdown } from "./kitStatusReports.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";

export const allParticipantsScreen = async (auth, route) => {
    const user = auth.currentUser;
    console.log(user);
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    allParticipantsTemplate(username, auth, route);
};

const allParticipantsTemplate = async (name) => {
    showAnimation();
    const response = await getParticipantsByKitStatus("all");
    hideAnimation();
    const template = `
        ${displayKitStatusReportsHeader()}
        <div class="container-fluid">
            <div id="root root-margin">
                <div class="table-responsive">
                span> <h3 style="text-align: center; margin: 0 0 1rem;">All Participants </h3> </span>
                <div class="sticky-header" style="overflow:auto;">
                    <table class="table table-bordered" id="participantData" style="margin-bottom:0; 
                        position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                        <thead> 
                            <tr style="top: 0; position: sticky;">
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Status</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">City</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">State</th>
                                <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                            </tr>
                        </thead>   
                        <tbody>
                            ${createShippedRows(response.data)}
                        </tbody>
                    </table>
                </div>
            </div> 
        </div>`;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar()
    kitStatusReportsDropdown();
};


const createShippedRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                <tr class="row-color-enrollment-dark participantRow">
                    <td>${i.first_name}</td>
                    <td>${i.last_name}</td>
                    <td>${i.connect_id}</td>
                    <td>${i.kit_status}</td>
                    <td>${i.study_site}</td>
                    <td>${i.city}</td>
                    <td>${i.state}</td>
                    <td>${i.date_requested}</td>
                </tr>`;
  });
  return template;
};