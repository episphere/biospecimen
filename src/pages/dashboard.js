import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization } from "./../shared.js"
import { addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4 } from "./../events.js";
import { homeNavBar } from '../navbar.js';

export const userDashboard = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName);
            if(!role) return;
            searchTemplate();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}

export const searchTemplate = () => {
    let template =  `
        <div class="row">
            <div class="col">
                <div class="row form-row">
                    <form id="search1" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">First name</label>
                            <input class="form-control" type="text" id="firstName" placeholder="Enter first name"/>
                        </div>
                        <div class="form-group">
                            <label class="col-form-label search-label">Last name</label>
                            <input class="form-control" type="text" id="lastName" placeholder="Enter last name"/>
                        </div>
                        <div class="form-group">
                            <label class="col-form-label search-label">Date of birth</label>
                            <input class="form-control" type="date" id="dob"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="col">
                <div class="row form-row">
                    <form id="search2" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Email</label>
                            <input class="form-control" required type="email" id="email" placeholder="Enter email id"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Search</button>
                        </div>
                    </form>
                </div>
                <div class="row form-row">
                    <form id="search3" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Phone no.</label>
                            <input class="form-control" required type="text" maxlength="10" id="phone" placeholder="Enter phone no."/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Search</button>
                        </div>
                    </form>
                </div>
                <div class="row form-row">
                    <form id="search4" method="POST">
                        <div class="form-group">
                            <label class="col-form-label search-label">Connect Id</label>
                            <input class="form-control" required type="text" maxlength="10" id="connectId" placeholder="Enter connect id"/>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('root').innerHTML = template;
    addEventSearchForm1();
    addEventSearchForm2();
    addEventSearchForm3();
    addEventSearchForm4();
}

export const searchResults = (result) => {
    let template = `
        <div class="row">
            <button class="btn btn-light" id="backToSearch"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
        <div class="row allow-overflow">
            <table class="table table-borderless table-striped">
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Date of birth</th>
                        <th>Email</th>
                        <th>Phone no.</th>
                        <th>Address</th>
                        <th>Connect Id</th>
                    </tr>
                </thead>
                <tbody>`
    result.forEach(data => {
        template += `
            <tr>
                <td>${data.RcrtUP_Fname_v1r0}</td>
                <td>${data.RcrtCS_Lname_v1r0}</td>
                <td>${data.RcrtUP_MOB_v1r0}/${data.RcrtUP_BD_v1r0}/${data.RcrtUP_YOB_v1r0}</td>
                <td>${data.RcrtUP_Email1_v1r0 ? data.RcrtUP_Email1_v1r0 : ''}</td>
                <td>${data.RcrtUP_Phone1_v1r0 ? data.RcrtUP_Phone1_v1r0 : ''}</td>
                <td>${data.RcrtUP_AddressLn1_v1r0} ${data.RcrtUP_AddressLn2_v1r0 ? data.RcrtUP_AddressLn2_v1r0 : ''}</br>${data.RcrtUP_City_v1r0} ${Object.keys(allStates)[Object.values(allStates).indexOf(parseInt(data.RcrtUP_State_v1r0))]} ${data.RcrtUP_Zip_v1r0}</td>
                <td>${data.Connect_ID}</td>
            </tr>
        `
    });
    template += `</tbody></table></div>`;

    document.getElementById('root').innerHTML = template;
    addEventBackToSearch();
}