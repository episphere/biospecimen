import { userAuthorization, removeActiveClass, addEventBarCodeScanner, allStates, getWorflow, isDeviceiPad, replaceDateInputWithMaskedInput } from "./../shared.js"
import {  addGoToCheckInEvent, addEventCheckInCompleteForm, addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventSelectParticipantForm, addEventsearchSpecimen, addEventNavBarSpecimenSearch, addEventNavBarShipment } from "./../events.js";
import { homeNavBar, bodyNavBar } from '../navbar.js';
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const userDashboard = (auth, route, goToSpecimenSearch) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if(!role) return;
            searchTemplate(goToSpecimenSearch);
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}

export const searchTemplate = (goToSpecimenSearch) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    const contentBody = document.getElementById('contentBody');
    let template = `
        <div class="row">
            <div class="col-lg">
                <h5>Participant Lookup</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                <div class="row form-row">
                    <form id="search1" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">First name</label>
                            <input class="form-control" autocomplete="off" type="text" id="firstName" placeholder="Enter First Name"/>
                        </div>
                        <div class="form-group">
                            <label class="col-form-label search-label">Last name</label>
                            <input class="form-control" autocomplete="off" type="text" id="lastName" placeholder="Enter Last Name"/>
                        </div>
                        <div class="form-group">
                            <label class="col-form-label search-label">Date of Birth</label>
                            <input class="form-control" type="date" id="dob"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="col-lg">
                <div class="row form-row">
                    <form id="search4" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Connect ID</label>
                            <input class="form-control" autocomplete="off" required type="text" maxlength="10" id="connectId" placeholder="Enter ConnectID"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
                ${contentBody.dataset.workflow && contentBody.dataset.workflow === 'clinical' ? `
                    
                `:`
                    <div class="row form-row">
                        <form id="search2" method="POST">
                            <div class="form-group">
                                <label class="col-form-label search-label">Email</label>
                                <input class="form-control" required autocomplete="off" type="email" id="email" placeholder="Enter email"/>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn btn-outline-primary">Search</button>
                            </div>
                        </form>
                    </div>
                    <div class="row form-row">
                        <form id="search3" method="POST">
                            <div class="form-group">
                                <label class="col-form-label search-label">Phone no.</label>
                                <input class="form-control" autocomplete="off" required type="text" maxlength="12" id="phone" placeholder="XXX-XXX-XXXX" pattern="\\d{3}-\\d{3}-\\d{4}"/>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn btn-outline-primary">Search</button>
                            </div>
                        </form>
                    </div>
                `}
            </div>
        </div>
    `;
    
    contentBody.innerHTML = template;
    bodyNavBar();
    addEventSearchForm1();
    addEventSearchForm2();
    addEventSearchForm3();
    addEventSearchForm4();
    addEventNavBarSpecimenSearch();
    isDeviceiPad && replaceDateInputWithMaskedInput(document.getElementById('dob'));
    //addEventNavBarShipment();
    if(goToSpecimenSearch) document.getElementById('navBarSpecimenSearch').click();
}

export const searchBiospecimenTemplate = () => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let template = `
        <div class="row">
            <div class="col-lg">
                <h5>Collection Lookup</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                Find by Collection ID
                <div class="row form-row">
                    <form id="specimenLookupForm" method="POST">
                        <div class="form-group">
                            <label class="search-label">Collection ID</label>
                            <input class="form-control" autocomplete="off" required type="text" id="masterSpecimenId" placeholder="Enter/Scan Collection ID"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenSearch');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    addEventsearchSpecimen();
    addEventBackToSearch('navBarSearch');
    // addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, masterSpecimenIDRequirement.length);
}

export const searchResults = (result) => {
    const f = () => addEventSelectParticipantForm();

    let conversion = {
        '875007964': 'Not Yet Verified',
        '197316935': 'Verified',
        '219863910': 'Cannot Be Verified',
        '922622075': 'Duplicate',
        '160161595': 'Outreach Maxed Out'
    }

    let template = `
        </br>
        <div class="row">
            <h5>Participant Search Results</h5>
        </div>
        </br>
        
        <div class="row">
            <table class="table table-borderless table-striped">
                <thead>
                    <tr>
                        <th>Last name</th>
                        <th>First name</th>
                        <th>Middle name</th>
                        <th>Date of birth</th>
                        <th>Address</th>
                        <th>Connect ID</th>
                        <th>Verification Status</th>
                        <th>Participant Status</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`
    result.forEach(data => {

        if(data['821247024'] === 922622075) return;
        const checkedIn = (data['135591601'] === 353358909);

        template += `
            <tr>
                <td>${data['996038075']}</td>
                <td>${data['399159511']}</td>
                <td>${data['231676651']}</td>
                <td>${data['564964481']}/${data['795827569']}/${data['544150384']}</td>
                <td>${data['521824358']} ${data['442166669'] ? data['442166669'] : ''}</br>${data['703385619']} ${data['634434746']} ${data['892050548']}</td>
                <td>${data.Connect_ID}</td>
                <td>${conversion[data['821247024']]}</td>
                <td>${data['773707518'] === 353358909 || data['831041022'] === 353358909 || data['747006172'] === 353358909 ? `<i class="fas fa-2x fa-times"></i>` : `<i class="fas fa-2x fa-check"></i>`}</td>
        
                <td>
                ${!checkedIn ? 
                `<button class="btn btn-outline-primary text-nowrap" data-check-in-btn-connect-id=${data.Connect_ID}>Go to check-in</button>` :
                `<button class="btn btn-outline-primary text-nowrap" data-check-in-btn-connect-id=${data.Connect_ID}>Go to check-out</button>`}
                </td>
                <td>
                <form method="POST" id="checkInCompleteForm" data-connect-id=${data.Connect_ID}>
                ${checkedIn ? `<button class="btn btn-outline-primary text-nowrap" id="checkInComplete">Specimen Link</button></form>` : ``}
                </td>
            </tr>
        `
    });
    template += `</tbody></table></div>`;

    document.getElementById('contentBody').innerHTML = template;
    addEventBackToSearch('navBarSearch');
    addEventCheckInCompleteForm(true);
    if (getWorflow() === 'clinical') {
        addGoToCheckInEvent();
      //  addEventSelectParticipantForm(true);
    }
    else {
        addGoToCheckInEvent();
       // addEventSelectParticipantForm();
    }
  
}