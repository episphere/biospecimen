import { userAuthorization } from "./../shared.js";

export const manageUsers = (auth, route) => {
    userAuthorization(auth, route);
    document.getElementById('root').innerHTML = 'Manager users';
}