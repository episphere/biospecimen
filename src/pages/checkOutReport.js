import { userAuthorization, removeActiveClass, hideAnimation, showAnimation, findParticipant, convertISODateTimeToLocal, restrictNonBiospecimenUser, showNotifications } from "./../shared.js"
import { checkInTemplate } from './checkIn.js';
import { homeNavBar, reportSideNavBar } from '../navbar.js';
import { conceptIds as fieldToConceptIdMapping } from "../fieldToConceptIdMapping.js";


export const checkOutReportTemplate = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( response.isBiospecimenUser === false ) {
                restrictNonBiospecimenUser();
                return;
            }
            if(!response.role) return;
            renderCheckOutReport();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const renderCheckOutReport = async () => {  
    let template = `
            <div class="container">
            <div class="row">
                <div class="col-lg-2" style="margin-bottom:20px">
                    <h2>Reports</h2>
                    ${reportSideNavBar()}
                </div>
                <div class="col-lg-10">
                    <div class="row">
                        <div class="col-lg">
                            <table id="populateCheckOutTable" class="table table-bordered">
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('nav-link', 'active');
    const navBarBtn = document.getElementById('navBarCheckoutReport');
    navBarBtn.classList.add('active');
    populateCheckOutTable();
}

export const populateCheckOutTable = async () => {
    try {
        showAnimation();
        const currTable = document.getElementById('populateCheckOutTable');
        currTable.innerHTML = '';
        
        const headerRow = currTable.insertRow();
        headerRow.innerHTML = `
        <th><b>Connect ID</b></th>
        <th><b>Last Name</b></th>
        <th><b>First Name</b></th>
        <th><b>Check-In Date/Time</b></th>
        <th><b>Go to Check-Out</b></th>
        `;

        const participantData = await findParticipant(`checkedIn=${true}`).then(res => res.data);
        
        for (const item of participantData) {
            if (!item[fieldToConceptIdMapping.collection.selectedVisit]?.[fieldToConceptIdMapping.baseline.visitId]?.[fieldToConceptIdMapping.checkOutDateTime]) {
                const newRow = currTable.insertRow();
                newRow.innerHTML = `
                    <td>${item['Connect_ID']}</td>
                    <td>${item[fieldToConceptIdMapping.lastName]}</td>
                    <td>${item[fieldToConceptIdMapping.firstName]}</td>
                    <td>${convertISODateTimeToLocal(item[fieldToConceptIdMapping.collection.selectedVisit]?.[fieldToConceptIdMapping.baseline.visitId]?.[fieldToConceptIdMapping.checkInDateTime])}</td>
                    <td><button class="btn btn-outline-primary text-nowrap participantCheckOutBtn" data-connect-id="${item['Connect_ID']}">Go to Check-Out</button></td>
                `;
            }
        }

        hideAnimation();
        redirectParticipantToCheckOut(participantData);    
    } catch (e) {
        hideAnimation();
        showNotifications({title: "Error", body: `Error fetching participant data -- ${e.message}`});
    }
}

const redirectParticipantToCheckOut = (participantData) => {
    const participantCheckOutBtns = document.getElementsByClassName('participantCheckOutBtn');
    
    const handleClick = async (e) => {
        e.preventDefault();
        const targetConnectID = parseInt(e.target.dataset.connectId);
        const targetParticipant = participantData.find(participant => participant['Connect_ID'] === targetConnectID);

        if (!targetParticipant) {
            console.error("Error: Could not locate participant. Check Connect ID.");
            showNotifications({title: "Error", body: "Could not locate participant. "});
            return;
        }

        checkInTemplate(targetParticipant, true);
        document.body.scrollIntoView();
    };
  
    for (const btn of participantCheckOutBtns) {
        btn.addEventListener('click', handleClick);
    }
}
