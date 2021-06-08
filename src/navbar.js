import { getWorflow } from "./shared.js";

export const homeNavBar = () => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#" id="home" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/issues/new" title="Please create an issue if you encounter any"><i class="fas fa-bug"></i> Report issue</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/projects/6" title="GitHub Projects page"><i class="fas fa-tasks"></i> GitHub Projects</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://gitter.im/episphere/biospecimen" title="Chat with us"><i class="fas fa-comments"></i> Chat with us</a>
            </li>
        </div>
    `;
}

export const userNavBar = (name) => {
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
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/issues" title="Please create an issue if you encounter any"><i class="fas fa-bug"></i> Report issue</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/projects/6" title="GitHub Projects page"><i class="fas fa-tasks"></i> GitHub Projects</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://gitter.im/episphere/biospecimen" title="Chat with us"><i class="fas fa-comments"></i> Chat with us</a>
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

export const nonUserNavBar = (name) => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#welcome" id="welcome" title="Home"><i class="fas fa-home"></i> Home</a>
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
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/issues" title="Please create an issue if you encounter any"><i class="fas fa-bug"></i> Report issue</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/connect/projects/6" title="GitHub Projects page"><i class="fas fa-tasks"></i> GitHub Projects</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://gitter.im/episphere/biospecimen" title="Chat with us"><i class="fas fa-comments"></i> Chat with us</a>
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
    const workflow = getWorflow();
    let template = `
        <ul class="nav nav-tabs row">
            <li class="nav-item">
                <button class="nav-link active navbar-btn" id="navBarSearch">Participant Search</button>
            </li>
            <li class="nav-item">
                <button class="nav-link navbar-btn" id="navBarSpecimenSearch">Specimen Search</button>
            </li>
            ${workflow && workflow === 'clinical' ? ``:`
                <li class="nav-item">
                    <button class="nav-link disabled navbar-btn" id="navBarParticipantCheckIn">Participant Check-In</button>
                </li>
            `}
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenLink">Specimen Link</button>
            </li>
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenProcess">${workflow && workflow === 'clinical' ? `Labeling and Receipt`: `Collect/Process`}</button>
            </li>
            <li class="nav-item">
                <button class="nav-link disabled navbar-btn" id="navBarSpecimenFinalize">${workflow && workflow === 'clinical' ? `Receipt Summary`: `Review`}</button>
            </li>
            ${workflow && workflow === 'clinical' ? ``:`
                <li class="nav-item">
                    <button class="nav-link disabled navbar-btn" id="participantCheckOut">Participant Check-Out</button>
                </li>
            `}
        </ul>`;
        
        document.getElementById('contentHeader').innerHTML = template;
}
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
                <button class="nav-link navbar-btn" id="navBarShippingManifest">Shipping Manifest</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarShipmentTracking">Shipment Tracking Information</button>
            </li>
            <li class="nav-item col-auto">
                <button class="nav-link navbar-btn" id="navBarSummaryAndReview">Summary and Review</button>
            </li>
        </ul>`
}