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
    
    showAnimation();
    const data = await findParticipant(`checkedIn=${true}`).then(res => res.data);
    
    for (const item of data) {
      if (!item['331584571']['266600170']['343048998']) {
        const newRow = currTable.insertRow();
        newRow.innerHTML = `
          <td>${item['Connect_ID']}</td>
          <td>${item[fieldToConceptIdMapping.lName]}</td>
          <td>${item[fieldToConceptIdMapping.fName]}</td>
          <td>${convertISODateTime(item['331584571']['266600170']['840048338'])}</td>
          <td><button class="btn btn-outline-primary text-nowrap participantCheckOutBtn" data-checkout='${JSON.stringify(item)}'>Go to Check-Out</button></td>
        `;
      }
    }
    hideAnimation();
    redirectParticipantToCheckOut();    
}

const redirectParticipantToCheckOut = () => {
    const participantCheckOutBtns = document.getElementsByClassName('participantCheckOutBtn');
    
    const handleClick = async (e) => {
      e.preventDefault();
      const checkoutParticipantObject = e.target.getAttribute('data-checkout');
      checkInTemplate(JSON.parse(checkoutParticipantObject), 'checkOutReport');
      document.body.scrollIntoView();
    };
  
    for (const btn of participantCheckOutBtns) {
      btn.addEventListener('click', handleClick);
    }
  }  
