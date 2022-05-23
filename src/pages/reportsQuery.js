import { userAuthorization, removeActiveClass, addEventBarCodeScanner, getBoxes, getAllBoxes, getBoxesByLocation, hideAnimation, showAnimation, showNotifications, getNumPages, conceptIdToSiteSpecificLocation} from "./../shared.js"
import { populateBoxTable, populateReportManifestHeader, populateReportManifestTable, addPaginationFunctionality, addEventNavBarShipment, addEventFilter} from "./../events.js";
import { homeNavBar, bodyNavBar, shippingNavBar, unAuthorizedUser} from '../navbar.js';


export const reportsQuery = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( response.isBiospecimenUser === false ) {
                document.getElementById("contentBody").innerHTML = "Authorization failed you lack permissions to use this dashboard!";
                document.getElementById("navbarNavAltMarkup").innerHTML = unAuthorizedUser();
                return;
            }
            if(!response.role) return;
            startReport();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const startReport = async () => {
    showAnimation();
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    
    let template = `
        <div class="row">
            <div class="col-lg" style="margin-bottom:20px">
                <h2>Shipping Reports</h2>
            </div>
        </div>
        <div class="row">
            
            <div class="col-lg" style="margin-bottom:20px">
                <h4>Filters</h4>
                <label for="trackingIdInput">Tracking ID: </label>
                <input type="text" id="trackingIdInput" style="margin-right:30px" placeholder="Tracking ID"></input>
                <label for="startDate">Start Date: </label>
                <input type="date" id="startDate"  style="margin-right:30px"></input>
                <label for="endDate">End Date: </label>
                <input type="date" id="endDate" style="margin-right:30px"></input>
                <button id="submitFilter" class="btn btn-primary">Apply filter</button>
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
                <li class="page-item" id="firstPage"><button class="page-link" >First</button></li>
                <li class="page-item" id="previousPage"><button class="page-link" >Previous</button></li>
                <li class="page-item" id="thisPage"><a class="page-link"  id = "middlePage">1</a></li>
                <li class="page-item" id="nextPage"><button class="page-link">Next</button></li>
                <li class="page-item" id="lastPage"><button class="page-link">Last</button></li>
            </ul>
        </nav>
    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    let numPages = await getNumPages(5, {});
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('navbar-btn', 'active')
    addEventFilter();
    populateBoxTable(0, {});
    addPaginationFunctionality(numPages, {});
    hideAnimation();
    
    //addEventSubmitAddBag();
    
}

export const showReportsManifest = async (currPage) => {
    let template = `
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <p>Site: ` + currPage['siteAcronym'] + `</p>
                <p>Location: ` + conceptIdToSiteSpecificLocation[currPage['560975149']] + `</p>
            </div>
        </div>
        <div class="row">
            <table id="boxManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Type/Color</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
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
        removeActiveClass('navbar-btn', 'active')
        populateReportManifestHeader(currPage)
        populateReportManifestTable(currPage)
        document.getElementById('printBox').addEventListener('click', e => {
            window.print();
        });
        document.getElementById('returnToReports').addEventListener('click', e => {
            startReport();
        })
        hideAnimation();
    
}