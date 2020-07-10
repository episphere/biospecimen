import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization } from "./../shared.js"
import { addEventSearchForm, addEventBackToSearch } from "./../events.js";

export const userDashboard = async (auth, route) => {
    await userAuthorization(auth, route);
    searchTemplate();
}

export const searchTemplate = () => {
    let template =  `
        <div class="row">
            <div class="col">
                <form id="search1" method="POST">
                    <div class="form-group">
                        <label class="col-form-label">First name</label>
                        <input class="form-control" type="text" id="firstName" placeholder="Enter first name"/>
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Last name</label>
                        <input class="form-control" type="text" id="lastName" placeholder="Enter last name"/>
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Date of birth</label>
                        <input class="form-control" type="date" id="dob"/>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Search</button>
                    </div>
                </form>
            </div>
            <div class="col"></div>
        </div>
    `;
    document.getElementById('root').innerHTML = template;
    addEventSearchForm();
}

export const searchResults = (result) => {
    let template = `
        <div class="row">
            <button class="btn btn-light" id="backToSearch"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
        <div class="row">
            <table class="table table-borderless table-responsive table-striped">
                <thead>
                    <tr>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Date of birth</th>
                        <th>Email</th>
                        <th>Phone no.</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.map(data => `
                        <tr>
                            <td>${data.RcrtUP_Fname_v1r0}</td>
                            <td>${data.RcrtCS_Lname_v1r0}</td>
                            <td>${data.RcrtUP_MOB_v1r0}/${data.RcrtUP_BD_v1r0}/${data.RcrtUP_YOB_v1r0}</td>
                            <td>${data.RcrtUP_Email1_v1r0 ? data.RcrtUP_Email1_v1r0 : ''}</td>
                            <td>${data.RcrtUP_Phone1_v1r0 ? data.RcrtUP_Phone1_v1r0 : ''}</td>
                            <td>${data.RcrtUP_AddressLn1_v1r0} ${data.RcrtUP_AddressLn2_v1r0 ? data.RcrtUP_AddressLn2_v1r0 : ''}</br>${data.RcrtUP_City_v1r0} ${Object.keys(allStates)[Object.values(allStates).indexOf(parseInt(data.RcrtUP_State_v1r0))]} ${data.RcrtUP_Zip_v1r0}</td>
                        </tr>
                    `)}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('root').innerHTML = template;
    addEventBackToSearch();
}