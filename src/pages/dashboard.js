import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization, removeActiveClass } from "./../shared.js"
import { addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventSelectParticipantForm, addEventsearchSpecimen, addEventNavBarSpecimenSearch } from "./../events.js";
import { homeNavBar, bodyNavBar } from '../navbar.js';

export const userDashboard = (auth, route, goToSpecimenSearch) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName);
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
                            <input class="form-control" type="text" id="firstName" placeholder="Enter First Name"/>
                        </div>
                        <div class="form-group">
                            <label class="col-form-label search-label">Last name</label>
                            <input class="form-control" type="text" id="lastName" placeholder="Enter Last Name"/>
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
                    <form id="search2" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Email</label>
                            <input class="form-control" required type="email" id="email" placeholder="Enter Email Id"/>
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
                            <input class="form-control" required type="text" maxlength="10" id="phone" placeholder="Enter Phone No."/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
                <div class="row form-row">
                    <form id="search4" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Connect Id</label>
                            <input class="form-control" required type="text" maxlength="10" id="connectId" placeholder="Enter Connect Id"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('contentHeader').innerHTML = bodyNavBar();
    addEventSearchForm1();
    addEventSearchForm2();
    addEventSearchForm3();
    addEventSearchForm4();
    addEventNavBarSpecimenSearch();
    if(goToSpecimenSearch) document.getElementById('navBarSpecimenSearch').click();
}

export const searchBiospecimenTemplate = () => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let template = `
        <div class="row">
            <div class="col-lg">
                <h5>Specimen Lookup</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                <i class="fas fa-barcode"></i> Find by Specimen ID
                <div class="row form-row">
                    <form id="specimenLookupForm" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Master Specimen ID</label>
                            <input class="form-control" required type="text" id="masterSpecimenId" placeholder="Enter/Scan Specimen ID"/>
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
}

export const searchResults = (result) => {
    let template = `
        </br>
        <div class="row">
            <h5>Participant Search Results</h5>
        </div>
        </br>
        
        <div class="row allow-overflow">
            <form method="POST" id="selectParticipant">
            <table class="table table-borderless table-striped">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Last name</th>
                        <th>Middle initial</th>
                        <th>First name</th>
                        <th>Date of birth</th>
                        <th>Address</th>
                        <th>Connect Id</th>
                    </tr>
                </thead>
                <tbody>`
    result.forEach(data => {
        template += `
            <tr>
                <td><input type="radio" name="selectParticipant" required value="${data.Connect_ID}"></td>
                <td>${data.RcrtUP_Lname_v1r0}</td>
                <td>${data.RcrtUP_Minitial_v1r0}</td>
                <td>${data.RcrtUP_Fname_v1r0}</td>
                <td>${data.RcrtUP_MOB_v1r0}/${data.RcrtUP_BD_v1r0}/${data.RcrtUP_YOB_v1r0}</td>
                <td>${data.RcrtUP_AddressLn1_v1r0} ${data.RcrtUP_AddressLn2_v1r0 ? data.RcrtUP_AddressLn2_v1r0 : ''}</br>${data.RcrtUP_City_v1r0} ${Object.keys(allStates)[Object.values(allStates).indexOf(parseInt(data.RcrtUP_State_v1r0))]} ${data.RcrtUP_Zip_v1r0}</td>
                <td>${data.Connect_ID}</td>
            </tr>
        `
    });
    template += `</tbody></table>
        <div class="row remove-margin">
            <div>
                <button class="btn btn-outline-dark" id="backToSearch"><i class="fas fa-arrow-left"></i> Return to search</button>
            </div>
            <div class="ml-auto">
                <button type="Submit" class="btn btn-outline-primary">Go to participant cheeck-in</button>
            </div>
        </div>
    </form></div>`;

    document.getElementById('contentBody').innerHTML = template;
    addEventSelectParticipantForm();
    addEventBackToSearch('backToSearch');
}