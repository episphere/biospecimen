import { userAuthorization, removeActiveClass, hideAnimation, showAnimation, findParticipant, convertISODateTime, restrictNonBiospecimenUser } from "./../shared.js"
import { checkInTemplate } from './checkIn.js';
import { homeNavBar, reportSideNavBar } from '../navbar.js';
import fieldToConceptIdMapping from "../fieldToConceptIdMapping.js";


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
    console.log('participant data', data);
    for (const item of data) {
      if (!item[fieldToConceptIdMapping.collection.selectedVisit]?.[fieldToConceptIdMapping.baseline.visitId]?.[fieldToConceptIdMapping.checkOutDateTime]) {
        const newRow = currTable.insertRow();
        newRow.innerHTML = `
          <td>${item['Connect_ID']}</td>
          <td>${item[fieldToConceptIdMapping.lastName]}</td>
          <td>${item[fieldToConceptIdMapping.firstName]}</td>
          <td>${convertISODateTime(item[fieldToConceptIdMapping.collection.selectedVisit]?.[fieldToConceptIdMapping.baseline.visitId]?.[fieldToConceptIdMapping.checkInDateTime])}</td>
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
      checkInTemplate(JSON.parse(checkoutParticipantObject), true);
      document.body.scrollIntoView();
    };
  
    for (const btn of participantCheckOutBtns) {
      btn.addEventListener('click', handleClick);
    }
  }  
