import { userAuthorization, biospecimenUsers } from "./../shared.js";
import { homeNavBar } from "../navbar.js";
import { addEventModalBtn, addEventRemoveUser } from "../events.js";

export const manageUsers = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName);
            if(!role) return;
            if(role === "user") window.location.hash = '#dashboard';
            document.getElementById('root').innerHTML = '';
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
            userListDiv.classList = ['row allow-overflow'];
            userListDiv.id = 'usersList';
            document.getElementById('root').appendChild(userListDiv);

            if(response.code === 200 && response.data.users.length > 0) {
                document.getElementById('usersList').innerHTML = userListTemplate(response.data.users, user.email);
                addEventRemoveUser()
            };
            addEventModalBtn(role, user.email);
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
};

export const userListTemplate = (result, userEmail) => {
    let template = `
            <table class="table table-borderless table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Added at</th>
                        <th>Added by</th>
                        <th>Remove user</th>
                    </tr>
                </thead>
                <tbody>`;
    result.forEach(data => {
        console.log(data)
        if(data.email === userEmail) return;
        template += `
        <tr>
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.role}</td>
            <td>${new Date(data.addedAt).toLocaleString()}</td>
            <td>${data.addedBy}</td>
            <td><i title="Remove user" class="fas fa-user-minus" data-email="${data.email}"></i></td>
        </tr>
        `
    });
                    
    template += `</tbody></table>`;
    return template;
}