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
            
            const div = document.createElement('div');
            div.classList = ['row'];

            const button = document.createElement('button');
            button.classList = ['btn btn-primary'];
            button.id = 'modalBtn';
            button.dataset.target = '#biospecimenModal';
            button.dataset.toggle = 'modal';
            button.innerHTML = 'Add user';

            div.appendChild(button);
            document.getElementById('root').appendChild(div);

            const userListDiv = document.createElement('div');
            userListDiv.classList = ['row'];
            userListDiv.id = 'usersList';
            document.getElementById('root').appendChild(userListDiv);

            if(response.code === 200 && response.data.users.length > 0) {
                document.getElementById('usersList').innerHTML = userListTemplate(response.data.users);
            };
            addEventModalBtn(role);
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
};

export const userListTemplate = (result) => {
    let template = `
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
                    
    template += `</tbody></table>`;
    return template;
}