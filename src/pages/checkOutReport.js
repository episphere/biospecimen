import { userAuthorization, removeActiveClass, hideAnimation, showAnimation, findParticipant, convertISODateTime, checkOutParticipant } from "./../shared.js"
import { checkInTemplate } from './checkIn.js';
import { homeNavBar, reportSideNavBar, unAuthorizedUser} from '../navbar.js';
import fieldToConceptIdMapping from "../fieldToConceptIdMapping.js";


export const checkOutReportTemplate = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( response.isBiospecimenUser === false ) {
                document.getElementById("contentBody").innerHTML = "Authorization failed you lack permissions to use this dashboard!";
                document.getElementById("navbarNavAltMarkup").innerHTML = unAuthorizedUser();
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
    let currTable = document.getElementById('populateCheckOutTable')
    currTable.innerHTML = ''
    let rowCount = currTable.rows.length;
    let currRow = currTable.insertRow(rowCount);
    currRow.insertCell(0).innerHTML = "<b>Connect ID</b>";
    currRow.insertCell(1).innerHTML = "<b>Last Name</b>";
    currRow.insertCell(2).innerHTML = "<b>First Name</b>";
    currRow.insertCell(3).innerHTML = "<b>Check-In Date/Time</b>";
    currRow.insertCell(4).innerHTML = "<b>Go to Check-Out</b>";

    showAnimation();
    const data = await findParticipant(`checkedIn=${true}`).then(res => res.data);
    for (let i = 0; i < data.length; i++) {
        if(!data[i]['331584571']['266600170']['343048998']){
            rowCount = currTable.rows.length;
            currRow = currTable.insertRow(rowCount);
            currRow.insertCell(0).innerHTML = data[i]['Connect_ID'];
            currRow.insertCell(1).innerHTML = data[i][fieldToConceptIdMapping.lName];
            currRow.insertCell(2).innerHTML = data[i][fieldToConceptIdMapping.fName];
            currRow.insertCell(3).innerHTML = convertISODateTime(data[i]['331584571']['266600170']['840048338']);
            currRow.insertCell(4).innerHTML = `<button class="btn btn-outline-primary text-nowrap participantCheckOutBtn" data-checkout='${JSON.stringify(data[i])}'>Go to Check-Out</button>`;
        }
    }
    hideAnimation();
    redirectParticipantToCheckOut();
}

const redirectParticipantToCheckOut = () => {
    const participantCheckOutBtns = document.getElementsByClassName('participantCheckOutBtn');
    for (let i = 0; i < participantCheckOutBtns.length; i++) {
      participantCheckOutBtns[i].addEventListener('click', async (e) => {
        e.preventDefault();
        const checkoutParticipantObject = participantCheckOutBtns[i].getAttribute('data-checkout');
        console.log('checkoutId:', JSON.parse(checkoutParticipantObject));
        checkInTemplate(JSON.parse(checkoutParticipantObject), 'checkOutReport');
        document.body.scrollIntoView();
      });
    }
  }