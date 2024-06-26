import { validateUser, siteFullNames, showAnimation, hideAnimation, errorMessage, removeAllErrors, urls, searchSpecimen, appState } from "./../shared.js";
import { userDashboard } from "./dashboard.js";
import { nonUserNavBar, unAuthorizedUser, generateDashboardSelectionStrForNavbar } from './../navbar.js'

export const welcomeScreen = async (auth, route) => {

    const user = auth.currentUser;
    if(!user) return;
    console.log('userWelcome', user.email)
    const name = user.displayName ? user.displayName : user.email;
    showAnimation();
    const response = await validateUser();
    hideAnimation();
    if(response.code !== 200) {
        document.getElementById('contentBody').innerHTML = 'Authorization failed you lack permissions to use this dashboard!';
        document.getElementById('navbarNavAltMarkup').innerHTML = unAuthorizedUser();
        return;
    }

    welcomeScreenTemplate(name || response.data.email, response.data, auth, route);
}

const clinicalOnlySiteArray = ['KPNW', 'KPCO', 'KPHI', 'KPGA'];
const researchOnlySiteArray = ['MFC', 'BSWH'];

const welcomeScreenTemplate = (name, data, auth, route) => {
    let template = '';
    let dashboardSelectionStr = '';

    if (clinicalOnlySiteArray.includes(data.siteAcronym)) {
        dashboardSelectionStr = `                    
            <select required disabled class="col form-control" id="dashboardSelection">
                <option selected value="clinical">Clinical Dashboard</option>
            </select>`;
    } else if (researchOnlySiteArray.includes(data.siteAcronym)) {
        dashboardSelectionStr = `
            <select required disabled class="col form-control" id="dashboardSelection">
                <option selected value="research">Research Dashboard</option>
            </select>`;
    } else {
        const savedDashboardSelection = appState.getState().dashboardSelection ?? '';
        dashboardSelectionStr = `
            <select required class="col form-control" id="dashboardSelection">
                <option value="">-- Select Dashboard --</option>`;

        if (savedDashboardSelection === 'research') {
            dashboardSelectionStr += `
                <option selected value="research">Research Dashboard</option>
                <option value="clinical">Clinical Dashboard</option>`;
        } else if (savedDashboardSelection === 'clinical') {
            dashboardSelectionStr += `
                <option value="research">Research Dashboard</option>
                <option selected value="clinical">Clinical Dashboard</option>`;
        } else {
            dashboardSelectionStr += `
                <option value="research">Research Dashboard</option>
                <option value="clinical">Clinical Dashboard</option>`;
        }

        dashboardSelectionStr += `</select>`;
    }

    template += `
    <div id="alert_placeholder"></div>
        <div class="row align-center welcome-screen-div">
            
            <div class="col">WELCOME</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">User: ${name}</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">Site: ${siteFullNames[data.siteAcronym]}</div>
        </div>
        ${ (data.isBiospecimenUser === true) ?
       ` <div class="row welcome-screen-div">
            <div class="col div-border" style="margin-right: 1rem;padding-bottom: 1rem;">
                <div>
                    <label for="dashboardSelection" class="col-form-label">Select dashboard to use </label>
                    ${dashboardSelectionStr}
                </div>
                </br>
                <div class="row">
                    <div class="col"><button class="btn btn-outline-primary" id="btnParticipantSearch">Participant Search</button></div>
                    <div class="col"><button class="btn btn-outline-secondary" id="btnSpecimenSearch">Specimen Search</button></div>
                </div>
            </div>
            <div class="col div-border align-center">
            </br>
            </br>
                <div class="row">
                    <div class="col"><button class="btn btn-outline-warning" id="btnShipping">Shipping</button></div>
                    <div class="col"><button class="btn btn-outline-warning" id="btnReports">Reports</button></div>
                </div>
            </div>
        </div>` : ``}
        <br />
        ${ (data.isBPTLUser === true) ?
            `<div class="col align-center d-grid gap-2 col-6 mx-auto">
                <div class="col"><button class="btn btn-lg btn-outline-primary" id="btnBPTL"><i class="fa fa-id-badge"></i> BPTL</button></div>
            </div>` : `` }
        `;
    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name, data.isBPTLUser);
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('contentBody').dataset.siteAcronym = data.siteAcronym;
    document.getElementById('contentBody').dataset.siteCode = data.siteCode;
    localStorage.setItem('siteAcronym',data.siteAcronym);
    localStorage.setItem('siteCode',data.siteCode);
    document.getElementById('contentHeader').innerHTML = '';

    updateNavbarAfterDashboardSelection();

    document.getElementById('btnParticipantSearch') && document.getElementById('btnParticipantSearch').addEventListener('click', () => {
        removeAllErrors();
        const selection = document.getElementById('dashboardSelection');
        if(!selection.value) {
            errorMessage('dashboardSelection', 'Please select Clinical or Research dashboard', true);
            return;
        }
        document.getElementById('contentBody').dataset.workflow = selection.value;
        localStorage.setItem('workflow', selection.value);
        location.hash = '#dashboard';
    });

    document.getElementById('btnSpecimenSearch') && document.getElementById('btnSpecimenSearch').addEventListener('click', () => {
        removeAllErrors();
        const selection = document.getElementById('dashboardSelection');
        if(!selection.value) {
            errorMessage('dashboardSelection', 'Please select Clinical or Research dashboard', true);
            return;
        }
        document.getElementById('contentBody').dataset.workflow = selection.value;
        localStorage.setItem('workflow', selection.value);
        window.history.replaceState({},'', './#dashboard');
        userDashboard(auth, route, true);
    });
    document.getElementById('btnShipping') && document.getElementById('btnShipping').addEventListener('click',  async () => {
        //window.history.replaceState({},'', './#shipping');
        location.hash = '#shipping';
        //shippingDashboard(auth, route, true);
    });
    document.getElementById('btnReports') && document.getElementById('btnReports').addEventListener('click',  async () => {
        //window.history.replaceState({},'', './#shipping');
        location.hash = '#reports';
        //shippingDashboard(auth, route, true);
    });
    document.getElementById('btnBPTL') && document.getElementById('btnBPTL').addEventListener('click',  async () => {
        location.hash = '#bptl';
    });
    location.host !== urls.prod ? headsupBanner() : ``
}

const headsupBanner = () => {
    let template = ``;
    let alertList = document.getElementById('alert_placeholder');
    template += `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <center> Warning: This is a test environment, <b> do not use real participant data  </b> </center>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>`
    
    alertList.innerHTML = template;
}

const navbarThemesSettings = {
  research: {
    cssClassesToAdd: ['bg-research'],
    cssClassesToRemove: ['bg-clinical', 'bg-light'],
    logoImageSrc: './static/images/NCI-LOGO-FA-White-Yellow.png',
  },
  clinical: {
    cssClassesToAdd: ['bg-clinical'],
    cssClassesToRemove: ['bg-research', 'bg-light'],
    logoImageSrc: './static/images/NCI-LOGO-FA-Color-Blue.png',
  },
  default: {
    cssClassesToAdd: ['bg-light'],
    cssClassesToRemove: ['bg-research', 'bg-clinical'],
    logoImageSrc: './static/images/NCI-LOGO-FA-Color-Blue.png',
  },
};

/**
 * Update navbar after dashboard type change
 */
function updateNavbarAfterDashboardSelection() {
  const dashboardSelectElement = document.getElementById('dashboardSelection');

  dashboardSelectElement && dashboardSelectElement.addEventListener('change', (event) => {
    const selectedDashboard = event.target.value;
    appState.setState({ dashboardSelection: selectedDashboard });

    const dashboardEleInNavbar = document.getElementById('dashboardSelectionInNavbar');
    dashboardEleInNavbar && dashboardEleInNavbar.remove();

    const { cssClassesToAdd, cssClassesToRemove, logoImageSrc } =
      navbarThemesSettings[selectedDashboard] || navbarThemesSettings.default;

    const navbar = document.getElementById('topNavbar');
    navbar.classList.remove(...cssClassesToRemove);
    navbar.classList.add(...cssClassesToAdd);

    const logoImgElement = document.getElementById('connectLogo');
    logoImgElement.src = logoImageSrc;

    renderDashboardSelectionInNavbar(selectedDashboard);
  });
}

/**
 * Render dashboard selection element in navbar
 * @returns {HTMLElement}
 */
function renderDashboardSelectionInNavbar(dashboardSelection) {  
    let wrapperDiv = document.createElement('div');
    wrapperDiv.innerHTML = generateDashboardSelectionStrForNavbar(dashboardSelection);

    const userAccountWrapperDiv = document.getElementById('userAccountWrapper');
    if (userAccountWrapperDiv) {
     userAccountWrapperDiv.before(wrapperDiv.firstElementChild ?? '') ;
    }
  }