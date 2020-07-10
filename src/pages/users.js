import { userAuthorization } from "./../shared.js";

export const manageUsers = async (auth, route) => {
    await userAuthorization(auth, route);
    document.getElementById('root').innerHTML = 'Manager users';
}