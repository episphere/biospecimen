import { validateUser, siteFullNames } from "./../shared.js";
import { userDashboard } from "./dashboard.js";
import { nonUserNavBar } from './../navbar.js'

export const welcomeScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const name = user.displayName;
    const response = await validateUser();
    if(response.code !== 200) return;
    welcomeScreenTemplate(name, response.data, auth, route);
}

const welcomeScreenTemplate = (name, data, auth, route) => {
    let template = '';
    template += `
        <div class="row align-center welcome-screen-div">
            <div class="col">WELCOME</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">Clinical Research Associate: ${name}</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">IHCS: ${siteFullNames[data.siteAcronym]}</div>
        </div>
        <div class="row welcome-screen-btn-div">
            <div class="col"><button class="btn btn-outline-primary" id="btnParticipantSearch">Participant Search</button></div>
            <div class="col"><button class="btn btn-outline-secondary" id="btnSpecimenSearch">Specimen Search</button></div>
            <div class="col"><button class="btn btn-outline-warning disabled" disabled>Shipping</button></div>
        </div>
    `;
    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('contentHeader').innerHTML = '';

    document.getElementById('btnParticipantSearch').addEventListener('click', () => {
        location.hash = '#dashboard';
    });

    document.getElementById('btnSpecimenSearch').addEventListener('click', () => {
        window.history.replaceState({},'', './#dashboard');
        userDashboard(auth, route, true);
    });
}