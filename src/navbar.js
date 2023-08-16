import { getWorkflow, appState } from "./shared.js";

export const homeNavBar = () => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#" id="home" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
    `;
}

export const userNavBar = (name) => {
    const dashboardSelectionStr = getDashboardSelectionStr();
    return `
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#welcome" id="welcome" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#dashboard" id="dashboard" title="Dashboard"><i class="fas fa-file-alt"></i> Dashboard</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#shipping" id="shipping" title="Shipping"><i class="fas fa-shipping-fast"></i> Shipping</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#reports" id="reports" title="Reports"><i class="fa fa-table"></i> Reports</a>
            </li>
        </div>
        ${dashboardSelectionStr}
        <div class="navbar-nav ml-auto" id="userAccountWrapper">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}

export const nonUserNavBar = (name, isBPTLUser) => {
    const dashboardSelectionStr = getDashboardSelectionStr();
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#welcome" id="welcome" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        ${isBPTLUser === true ? `<div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#bptl" id="bptl" title="Home"><i class="fa fa-id-badge"></i> BPTL</a>
            </li>
        </div>` : ``}
        ${dashboardSelectionStr}
        <div class="navbar-nav ml-auto" id="userAccountWrapper">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}

export const unAuthorizedUser = () => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#welcome" id="welcome" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        <div class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
            </li>
        </div>
    `;
}

export const adminNavBar = (name) => {
    return `
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#welcome" id="welcome" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#dashboard" id="dashboard" title="Dashboard"><i class="fas fa-file-alt"></i> Dashboard</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#shipping" id="shipping" title="Shipping"><i class="fas fa-shipping-fast"></i> Shipping</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#reports" id="reports" title="Reports"><i class="fa fa-table"></i> Reports</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#manage_users" id="manageUsers" title="Manage users"><i class="fas fa-users"></i> Manage users</a>
            </li>
        </div>
        <div class="navbar-nav ml-auto">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}

export const bodyNavBar = () => {
    const workflow = getWorkflow();
    let template = `
        <ul class="nav nav-tabs row">
            <li class="nav-item">
                <button class="nav-link active navbar-btn" id="navBarSearch">Participant Search</button>
            </li>
            <li class="nav-item">
                <button class="nav-link navbar-btn" id="navBarSpecimenSearch">Specimen Search</button>
            </li>
            <li class="nav-item">
            <button style="display:none" class="nav-link navbar-btn" id="navBarParticipantCheckIn">Check-In/Check-Out</button>
            </li>
            <li class="nav-item">
            <button style="display:none" class="nav-link navbar-btn" id="navBarSpecimenLink">Specimen Link</button>
            </li>
            <li class="nav-item">
            <button style="display:none" class="nav-link navbar-btn" id="navBarTubeCollection">Collection Data Entry</button>
            </li>
            <li class="nav-item">
            <button style="display:none" class="nav-link navbar-btn" id="navBarReview">Collection Review</button>
            </li>
        </ul>`;
        
        document.getElementById('contentHeader').innerHTML = template;
}

export const reportSideNavBar = () => {
    return `
        <ul class="nav nav-tabs flex-column" id="reportTabs">
            <li class="nav-item">
                <a class="nav-link active" href="#reports" id="navBarShippingReport">Shipping Report</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#checkoutreport" id="navBarCheckoutReport">Check-Out Report</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#dailyreport" id="navBarDailyReport">Daily Review Report</a>
            </li>
        </ul>`;
}

/**
 ${workflow && workflow === 'clinical' ? ``:`
                <li class="nav-item">
                    <button class="nav-link disabled navbar-btn" id="navBarParticipantCheckIn">Participant Check-In</button>
                </li>
            `}
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenLink">Specimen Link</button>
            </li>
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenProcess">${workflow && workflow === 'clinical' ? `Labeling and Scanning`: `Collect/Process`}</button>
            </li>
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenFinalize">${workflow && workflow === 'clinical' ? `Receipt Summary`: `Review`}</button>
            </li>
            ${workflow && workflow === 'clinical' ? ``:`
                <li class="nav-item">
                    <button class="nav-link disabled navbar-btn" id="participantCheckOut">Participant Check-Out</button>
                </li>
            `}
 */
export const shippingNavBar = () => {
    return `
        <ul class="nav nav-tabs row">
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarShippingDash">Packaging</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarBoxManifest">Box Manifest</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarReviewShipmentContents">Review Shipment Contents</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarShipmentTracking">Assign Tracking Information</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarFinalizeShipment">Finalize Shipment</button>
            </li>
        </ul>`
}

/**
 * Generate string for the dashboard selection in navbar
 * @returns {string} HTML string
 */
function getDashboardSelectionStr() {  
    const dashboardSelection = appState.getState().dashboardSelection;
    
    return generateDashboardSelectionStrForNavbar(dashboardSelection);
  }

  /**
 * Generate string to display dashboard selection in navbar
 * @returns {string} HTML string
 */
export function generateDashboardSelectionStrForNavbar(dashboardSelection) {
    if (dashboardSelection === 'research') {
        return `<div class="ml-auto hide-on-not-large-screen" id="dashboardSelectionInNavbar">
        <span class="text-research">Research Dashboard</span>
        </div>`;
    } else if (dashboardSelection === 'clinical') {
        return `<div class="ml-auto hide-on-not-large-screen" id="dashboardSelectionInNavbar">
        <span class="text-clinical" >Clinical Dashboard</span>
        </div>`;
    } else {
        return '';
    }
  }