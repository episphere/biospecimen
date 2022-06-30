import { userAuthorization, removeActiveClass, validateUser, addEventBarCodeScanner, allStates, getWorflow, isDeviceMobile, replaceDateInputWithMaskedInput, checkedIn, verificationConversion } from "./../shared.js"
import {  addGoToCheckInEvent, addGoToSpecimenLinkEvent, addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventsearchSpecimen, addEventNavBarSpecimenSearch, addEventNavBarShipment, addEventClearAll } from "./../events.js";
import { homeNavBar, bodyNavBar, unAuthorizedUser } from '../navbar.js';

export const userDashboard = (auth, route, goToSpecimenSearch) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( response.isBiospecimenUser === false ) {
                document.getElementById("contentBody").innerHTML = "Authorization failed you lack permissions to use this dashboard!";
                document.getElementById("navbarNavAltMarkup").innerHTML = unAuthorizedUser();
                return;
            }
            if(!response.role) return;
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
                        <div class="form-group">
                            <br/>
                        </div>
                        <div class="form-group">
                            <button type="button" id="btnClearAll" class="btn btn-outline-danger">Clear All</button>
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
    addEventClearAll();
    addEventNavBarSpecimenSearch();
    if(isDeviceMobile) {
    replaceDateInputWithMaskedInput(document.getElementById('dob'));
    }
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
                        <th>Participation Status</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`
    result.forEach(data => {

        if(data['821247024'] === 922622075) return;
        const isCheckedIn = checkedIn(data);
        template += `
            <tr>
                <td>${data['996038075']}</td>
                <td>${data['399159511']}</td>
                <td>${data['231676651']}</td>
                <td>${data['564964481']}/${data['795827569']}/${data['544150384']}</td>
                <td>${data['521824358']} ${data['442166669'] ? data['442166669'] : ''}</br>${data['703385619']} ${data['634434746']} ${data['892050548']}</td>
                <td>${data.Connect_ID}</td>
                <td>${verificationConversion[[data['821247024']]]}</td>
                <td>${data['912301837'] === 208325815 || data['912301837'] === 622008261 || data['912301837'] === 458508122 ? `<i class="fas fa-2x fa-check"></i>` :  `<i class="fas fa-2x fa-times"></i>`}</td>
                <td>
                    <button class="btn btn-outline-primary text-nowrap" data-check-in-btn-connect-id=${data.Connect_ID} data-check-in-btn-uid=${data.state.uid}>${!isCheckedIn ? `Go to Check-In` : `Go to Check-Out`}</button>
                </td>
                <td>
                    ${isCheckedIn ? `<button class="btn btn-outline-primary text-nowrap" data-specimen-link-connect-id=${data.Connect_ID}>Specimen Link</button>` : ``}
                </td>
            </tr>
        `
    });
    template += `</tbody></table></div>`;

    document.getElementById('contentBody').innerHTML = template;
    addEventBackToSearch('navBarSearch');
    addGoToCheckInEvent();
    addGoToSpecimenLinkEvent();
}