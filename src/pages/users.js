import { userAuthorization, biospecimenUsers } from "./../shared.js";
import { homeNavBar } from "../navbar.js";
import { addEventModalBtn } from "../events.js";

export const manageUsers = async (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(auth, route, user.displayName);
            if(!role) return;
            if(role === "user") window.location.hash = '#dashboard';

            const response = await biospecimenUsers();
            let template = '';
            if(response.code === 200 && response.data.users.length > 0) {
                template = userListTemplate(response.data.users);
            }
            else {
                template = `
                    <div class="row">
                        <button type="button" data-target="#biospecimenModal" data-toggle="modal" id="modalBtn" class="btn btn-primary">Add user(s)</button>
                    </div>
                `
            }
            document.getElementById('root').innerHTML = template;
            addEventModalBtn();
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
};

const userListTemplate = (result) => {
    let template = `
        <div class="row">
            <button type="button" data-target="#biospecimenModal" data-toggle="modal" id="modalBtn" class="btn btn-primary">Add user(s)</button>
        </div>
        <div class="row">
            <table class="table table-borderless table-responsive table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Added at</th>
                    </tr>
                </thead>
                <tbody>`;
    result.forEach(data => {
        template += `
            <tr>
                <td>${data.name}</td>
                <td>${data.email}</td>
                <td>${data.role}</td>
                <td>${new Date(data.addedAt).toLocaleString()}</td>
            </tr>
        `
    })
                    
    template += `</tbody></table></div>`;
    return template;
}