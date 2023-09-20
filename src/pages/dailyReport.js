import { userAuthorization, removeActiveClass, hideAnimation, showAnimation, getDailyParticipant, convertISODateTime, restrictNonBiospecimenUser, getDataAttributes, appState } from "./../shared.js"
import { homeNavBar, reportSideNavBar } from '../navbar.js';
import fieldToConceptIdMapping from "../fieldToConceptIdMapping.js";


export const dailyReportTemplate = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            appState.setState({siteAcronym: response.siteAcronym});
            if ( response.isBiospecimenUser === false ) {
                restrictNonBiospecimenUser();
                return;
            }
            if(!response.role) return;
            renderDailyReport();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const renderDailyReport = async () => {  
    let template = `
            <div class="container">
            <div class="row">
                <div class="col-lg-2" style="margin-bottom:20px">
                    <h2>Reports</h2>
                    ${reportSideNavBar()}
                </div>
                <div class="col-lg-10">
                    <div class="row">
                    ${renderCollectionLocationList()}
                        <div class="col-lg">
                            <table id="populateDailyReportTable" class="table table-bordered">
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('nav-link', 'active');
    const navBarBtn = document.getElementById('navBarDailyReport');
    navBarBtn.classList.add('active');
    initializeDailyReportTable();
}

const renderCollectionLocationList = () => {
    let template = ``;
    template += `       
            <div style="margin-top:10px; padding:15px;" class="dropdown">
                <button class="btn btn-secondary dropdown-toggle dropdown-toggle-sites" id="dropdownSites" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Filter by Collection Location
                </button>
                <ul class="dropdown-menu scrollable-menu" id="dropdownMenuButtonSites" aria-labelledby="dropdownMenuButton">
                            <li><a class="dropdown-item" data-siteKey="all" id="all">All</a></li>
                        ${appState.getState().siteAcronym === 'MFC' ? `
                            <li><a class="dropdown-item" data-siteKey="marshfield" id="marshfield">Marshfield</a></li>
                            <li><a class="dropdown-item" data-siteKey="weston" id="weston">Weston</a></li>
                            <li><a class="dropdown-item" data-siteKey="lakeHallie" id="lakeHallie">Lake Hallie</a></li>
                            <li><a class="dropdown-item" data-siteKey="riLa" id="riLa">Rice Lake</a></li>
                            <li><a class="dropdown-item" data-siteKey="wisRapids" id="wisRapids">Wisconsin Rapids</a></li>
                            <li><a class="dropdown-item" data-siteKey="colAbb" id="colAbb">Colby Abbotsford</a></li>
                            <li><a class="dropdown-item" data-siteKey="mino" id="mino">Minocqua</a></li>
                            <li><a class="dropdown-item" data-siteKey="merr" id="merr">Merrill</a></li>`:
                        appState.getState().siteAcronym === 'HP' ? `
                            <li><a class="dropdown-item" data-siteKey="hpRC" id="hpRC">HP Research Clinic</a></li>`:
                        appState.getState().siteAcronym === 'HFHS' ? `
                            <li><a class="dropdown-item" data-siteKey="hfhKRC" id="hfhKRC">HFH K-13 Research Clinic</a></li>
                            <li><a class="dropdown-item" data-siteKey="hfhPRC" id="hfhPRC">HFH Cancer Pavilion Research Clinic</a></li>
                            <li><a class="dropdown-item" data-siteKey="hfhLRC" id="hfhLRC">HFH Livonia Research Clinic</a></li>`:
                        appState.getState().siteAcronym === 'SFH' ? `
                            <li><a class="dropdown-item" data-siteKey="sfImag" id="sfImag">Sioux Falls Imagenetics</a></li>`:
                        appState.getState().siteAcronym === 'UCM' ? `
                            <li><a class="dropdown-item" data-siteKey="ucDcam" id="ucDcam">UC-DCAM</a></li>
                            <li><a class="dropdown-item" data-siteKey="ingHar" id="ingHar">Ingalls Harvey</a></li>
                            <li><a class="dropdown-item" data-siteKey="rivEas" id="rivEas">River East</a></li>
                            <li><a class="dropdown-item" data-siteKey="soLo" id="soLo">South Loop</a></li>` :
                        appState.getState().siteAcronym === 'NIH' ? 
                            `<li><a class="dropdown-item" data-siteKey="nci" id="nci">NIH/NCI</a></li>`:
                            `<li><a class="dropdown-item" data-siteKey="other" id="other">Other</a></li>`}
                </ul>
            </div>
            `
    return template;
}

const initializeDailyReportTable = async () => {
    showAnimation();
    const dailyReportsData = await getDailyParticipant().then(res => res.data);
    appState.setState({dailyReportsData: dailyReportsData}); // store inital daily reports data
    populateDailyReportTable(`Filter by Collection Location`, dailyReportsData);
}

const populateDailyReportTable = (dropdownHeader, dailyReportsData) => {
    const currTable = document.getElementById('populateDailyReportTable');
    currTable.innerHTML = '';
    
    const headerRow = currTable.insertRow();
    headerRow.innerHTML = `
      <th><b>Collection Location</b></th>
      <th><b>Connect ID</b></th>
      <th><b>Last Name</b></th>
      <th><b>First Name</b></th>
      <th><b>Check-In Date/Time</b></th>
      <th><b>Collection ID</b></th>
      <th><b>Collection Finalized</b></th>
      <th><b>Check-Out Date/Time</b></th>
    `;
    
    for (const item of dailyReportsData) {
      if (!item[fieldToConceptIdMapping.collection.selectedVisit]?.[fieldToConceptIdMapping.baseline.visitId]?.[fieldToConceptIdMapping.checkOutDateTime]) {
        const newRow = currTable.insertRow();
        newRow.innerHTML = `

          <td>${fieldToConceptIdMapping.collectionLocationMapping[item[fieldToConceptIdMapping.collectionLocation]]}</td>
          <td>${item['Connect_ID']}</td>
          <td>${item[fieldToConceptIdMapping.lastName]}</td>
          <td>${item[fieldToConceptIdMapping.firstName]}</td>
          <td>${convertISODateTime(item[fieldToConceptIdMapping.checkInDateTime])}</td>
          <td>${item[fieldToConceptIdMapping.collection.id]}</td>
          <td>${item[fieldToConceptIdMapping.collection.finalizedTime] !== undefined ? convertISODateTime(item[fieldToConceptIdMapping.collection.finalizedTime]) : ``}</td>
          <td>${item[fieldToConceptIdMapping.checkOutDateTime] !== undefined ? convertISODateTime(item[fieldToConceptIdMapping.checkOutDateTime]) : ``}</td>
        `;
      }
    }
    hideAnimation();
    dropdownTrigger(dropdownHeader);
}

const reInitalizeDailyReportTable = async (dropdownText, siteKey, dailyData) => {
    showAnimation();
    let data = dailyData;
    if (siteKey !== 'all') {
        data = data.filter((dailyReportData) => dailyReportData[fieldToConceptIdMapping.collectionLocation] === fieldToConceptIdMapping.nameToKeyObj[siteKey]);
    }
    populateDailyReportTable(dropdownText, data)
}


const dropdownTrigger = (sitekeyName) => {
    let a = document.getElementById('dropdownSites');
    let dropdownMenuButton = document.getElementById('dropdownMenuButtonSites');
    let tempSiteName = a.innerHTML = sitekeyName;
    if (dropdownMenuButton) {
        dropdownMenuButton.addEventListener('click', (e) => {
            if (sitekeyName === `Filter by Collection Location` || sitekeyName === tempSiteName) {
                a.innerHTML = e.target.textContent;
                const sitekey = getDataAttributes(e.target)
                const dailyReportsData = appState.getState().dailyReportsData;
                reInitalizeDailyReportTable(e.target.textContent, sitekey, dailyReportsData);
            }
        })
    }
}