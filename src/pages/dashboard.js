import { userAuthorization } from "./../shared.js"

export const userDashboard = async (auth, route) => {
    await userAuthorization(auth, route);
    document.getElementById('root').innerHTML = 'User dashboard'
}