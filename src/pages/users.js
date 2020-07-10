import { userAuthorization } from "./../shared.js";
import { homeNavBar } from "../navbar.js";

export const manageUsers = async (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(auth, route, user.displayName);
            if(!role) return;
            if(role !== "admin") {
                window.location.hash = '#dashboard';
            }
            document.getElementById('root').innerHTML = 'Manager users';
        }
        else{
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}