import { showAnimation, hideAnimation, getParticipantsByKitStatus, convertISODateTime, keyToNameObj } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { kitStatusSelectionDropdown } from "./kitStatusReports.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";


export const kitStatusReportsShippedScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitStatusShippedTemplate(username, auth, route);
};

const kitStatusShippedTemplate = async (name) => {
    showAnimation();
    const response = await getParticipantsByKitStatus(conceptIds.shipped);
    const shippedKitStatusParticipantsArray = response.data;
    hideAnimation();

    let template = `
                    ${displayKitStatusReportsHeader()}
                    <div class="container-fluid">
                        <div id="root root-margin">
                            <div class="table">
                                <h3 style="text-align: center; margin: 0 0 1rem;">Kits Shipped</h3>
                                ${displayKitStatusShippedTable(shippedKitStatusParticipantsArray)}
                            </div>
                        </div>
                    </div>`;
                    
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar()
    kitStatusSelectionDropdown();
};

const displayKitStatusShippedTable = (shippedKitStatusParticipantsArray) => {
    return `
            <div class="sticky-header" style="overflow:auto;">
                <table class="table table-bordered" id="participantData" style="margin-bottom:1rem; 
                    position:relative; border-collapse:collapse;">
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
                        ${createShippedRows(shippedKitStatusParticipantsArray)}
                    </tbody>
                </table>
            </div>`;
}

// TODO - Add displayPagination function functionality
// const displayPagination = () => { 
//     return `<nav aria-label="Page navigation" id="paginationButtons">
//                 <ul class="pagination">
//                     <li class="page-item" id="firstPage"><button class="page-link">First</button></li>
//                     <li class="page-item" id="previousPage"><button class="page-link">Previous</button></li>
//                     <li class="page-item" id="thisPage"><a class="page-link" id="middlePage">1</a></li>
//                     <li class="page-item" id="nextPage"><button class="page-link">Next</button></li>
//                     <li class="page-item" id="lastPage"><button class="page-link">Last</button></li>
//                 </ul>
//             </nav>`;
// }

// TODO - Add kit status filter functionality
// const displayKitStatusFilter = () => {
//     return `<div class="row">
//                 <div class="col-lg-10" style="margin-bottom:20px">
//                     <h4>Filters</h4>
//                     <label for="trackingIdInput" style="margin-right:0.5rem;">Tracking ID: </label>
//                     <input type="text" id="trackingIdInput" style="margin-right:30px; height:38px; padding:5px;" placeholder="Tracking ID">
//                     <span style="display:inline-block; margin-right:.5rem;">Date Shipped:</span>
//                     <input type="date" id="startDate" style="height:38px; padding:5px;">
//                     <span style="display:inline-block; margin:0 .75rem">to</span>
//                     <input type="date" id="endDate" style="margin-right:30px; height:38px; padding:5px;">
//                     <button id="submitFilter" class="btn btn-primary">Apply filter</button>
//                     <button id="clearFilter" class="btn btn-danger">Clear filter(s)</button>
//                 </div>
//             </div>`
// }

/**
 * Returns rows for the shipped kits table
 * @param {Array} shippedKitStatusParticipantsArray - an array of custom objects with values from participants and kitAssembly collection that have a shipped kit status
 * @returns {string} - a string of table rows
*/
const createShippedRows = (shippedKitStatusParticipantsArray) => {
    let template = ``;
    for (const particpantObj of shippedKitStatusParticipantsArray) {

    const connectID = particpantObj["Connect_ID"];
    const healthcareProvider = keyToNameObj[particpantObj[conceptIds.healthcareProvider]];
    const mouthwashShippedDate = convertISODateTime(particpantObj[conceptIds.shippedDateTime]).split(/\s+/)[0];
    const supplyKitId = particpantObj[conceptIds.supplyKitId];
    const supplyKitTrackingNum = particpantObj[conceptIds.supplyKitTrackingNum];
    const returnKitTrackingNum = particpantObj[conceptIds.returnKitTrackingNum];
    const mouthwashSurveyStatus = convertSurveyCompletionStatus(particpantObj[conceptIds.mouthwashSurveyCompletionStatus]);

    template += `
                <tr class="row-color-enrollment-dark participantRow">
                    <td>${connectID}</td>
                    <td>${healthcareProvider}</td>
                    <td>${mouthwashShippedDate}</td>
                    <td>${supplyKitId}</td>
                    <td>${supplyKitTrackingNum}</td>
                    <td>${returnKitTrackingNum}</td>
                    <td>${mouthwashSurveyStatus}</td>
                </tr>`;
    }
    return template;
};

/**
 * Returns the survey completion status (Not Started, In Progress, Completed) based on the status value
 * @param {number} status - the concept Id status value of the mouthwash survey
*/
const convertSurveyCompletionStatus = (status) => {
    switch (status) {
        case conceptIds.modules.notStarted:
            return "Not Started";
        case conceptIds.modules.started:
            return "Started";
        case conceptIds.modules.submitted:
            return "Submitted";
        default:
            return "Unknown Status";
    }
}