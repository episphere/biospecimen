import { userAuthorization } from "./../shared.js"

export const userDashboard = (auth, route) => {
    userAuthorization(auth, route);
    document.getElementById('root').innerHTML = 'User dashboard'
}