import { userAuthorization } from "./../shared.js";

export const manageUsers = async (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(auth, route);
            document.getElementById('root').innerHTML = 'Manager users';
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}