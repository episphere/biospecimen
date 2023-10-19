import { userAuthorization, removeActiveClass, restrictNonBiospecimenUser, hideAnimation, showAnimation, getNumPages, conceptIdToSiteSpecificLocation, searchSpecimenInstitute } from "./../shared.js";
import { populateBoxTable, populateReportManifestHeader, populateReportManifestTable, addPaginationFunctionality, addEventFilter } from "./../events.js";
import { homeNavBar, reportSideNavBar } from '../navbar.js';
import { reportsNavbar } from "./reports/reportsNavbar.js";
import conceptIds from '../fieldToConceptIdMapping.js';

export const reportsQuery = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if (user) {
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if (response.isBiospecimenUser === false) {
                restrictNonBiospecimenUser();
                return;
            }
            if (!response.role) return;
            startReport();
        } else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
};

export const startReport = async (source) => {
    showAnimation();
    if (document.getElementById('navBarParticipantCheckIn') && source !== `bptlShippingReport`) document.getElementById('navBarParticipantCheckIn').classList.add('disabled')
    let template = `
    ${ source !== `bptlShippingReport` ? `
        <div class="container">
            <div class="row">
            <div class="col-lg-2" style="margin-bottom:20px">
                <h2>Reports</h2>
                ${reportSideNavBar()}
            </div>` : 
            `${reportsNavbar()}
                <div id="root root-margin">
                    <h3 style="text-align: center; margin: 1rem 0;">Shipping Report Screen</h3>`
    }
        <div class="col-lg-10">
            <div class="row">
                <div class="col-lg" style="margin-bottom:20px">
                    <h4>Filters</h4>
                    <label for="trackingIdInput" style="margin-right:0.5rem;">Tracking ID: </label>
                    <input type="text" id="trackingIdInput" style="margin-right:30px; height:38px; padding:5px;" placeholder="Tracking ID">
                    <span style="display:inline-block; margin-right:.5rem;">Date Shipped:</span>
                    <input type="date" id="startDate" style="height:38px; padding:5px;">
                    <span style="display:inline-block; margin:0 .75rem">to</span>
                    <input type="date" id="endDate" style="margin-right:30px; height:38px; padding:5px;">
                    <button id="submitFilter" class="btn btn-primary">Apply filter</button>
                    <button id="clearFilter" class="btn btn-danger">Clear filter(s)</button>
                </div>
            </div>
            <div class="row">
                <div class="col-lg">
                    <table id="boxTable" class="table table-bordered">
                    </table>
                </div>
            </div>
            <nav aria-label="Page navigation" id="paginationButtons">
                <ul class="pagination">
                    <li class="page-item" id="firstPage"><button class="page-link">First</button></li>
                    <li class="page-item" id="previousPage"><button class="page-link">Previous</button></li>
                    <li class="page-item" id="thisPage"><a class="page-link" id="middlePage">1</a></li>
                    <li class="page-item" id="nextPage"><button class="page-link">Next</button></li>
                    <li class="page-item" id="lastPage"><button class="page-link">Last</button></li>
                </ul>
            </nav>
        </div>
    </div>
</div>`;
    let numPages = await getNumPages(5, {}, source);
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('navbar-btn', 'active');
    addEventFilter(source);
    populateBoxTable(0, {}, source);
    addPaginationFunctionality(numPages, {}, source);
    hideAnimation();
    clearEventFilter(source);
};

export const showReportsManifest = async (currPage, source) => {
    showAnimation();
    const searchSpecimenInstituteResponse = await searchSpecimenInstitute();
    const searchSpecimenInstituteArray = searchSpecimenInstituteResponse?.data ?? [];

    let template = `
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <p>Site: ` + currPage['siteAcronym'] + `</p>
                <p>Location: ` + conceptIdToSiteSpecificLocation[currPage['560975149']] + `</p>
                <p>Tracking Number: ${currPage[conceptIds.shippingTrackingNumber] ?? ""} </p>
            </div>
        </div>
        <div class="row">
            <table id="boxManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Type/Color</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Deviation Type</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Comments</th>
                </tr>
            </table>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToReports">Return to Reports</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
            </div>
        </div>
        `;
        document.getElementById('contentBody').innerHTML = template;
        populateReportManifestHeader(currPage);
        populateReportManifestTable(currPage, searchSpecimenInstituteArray);
        document.getElementById('printBox').addEventListener('click', e => {
            window.print();
        });
        document.getElementById('returnToReports').addEventListener('click', e => {
            startReport(source);
        });
        hideAnimation();
    
};

const clearEventFilter = (source) => {

    let clearFilterButton = document.getElementById('clearFilter');
    clearFilterButton.addEventListener('click', async () => {
        startReport(source);
    });
}