import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { userDashboard } from "../dashboard.js";

export const kitAssemblyScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const username = user.displayName ? user.displayName : user.email;
    //showAnimation();
    kitAssemblyTemplate(auth, route);
}             


const kitAssemblyTemplate = (auth, route) => {
    let template = ``;
    template += homeCollectionNavbar();
    template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3>Kit Assembly</h3></div>
                </div>  `
    document.getElementById('contentBody').innerHTML = template;
}
