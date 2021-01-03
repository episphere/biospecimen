import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization, removeActiveClass, addEventBarCodeScanner, storeBox, getBoxes, getAllBoxes, getBoxesByLocation, hideAnimation, showAnimation, showNotifications} from "./../shared.js"
import { populateBoxTable} from "./../events.js";
import { homeNavBar, bodyNavBar, shippingNavBar} from '../navbar.js';

export const reportsQuery = (auth, route) => {
    
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName);
            if(!role) return;
            console.log(user.displayName)
            startReport();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const startReport = async () => {
    showAnimation();
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    
    let template = `
        <div class="row">
            <div class="col-lg">
                <table id="boxTable" class="table table-bordered">
                </table>
            </div>
        </div>
    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('navbar-btn', 'active')
    populateBoxTable();
    hideAnimation();
    
    //addEventSubmitAddBag();
    
}
