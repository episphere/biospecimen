import { validateUser, siteFullNames, showAnimation, hideAnimation, errorMessage, removeAllErrors } from "./../shared.js";
import { kitAssemblyScreen } from "./homeCollection/kitAssembly.js";
import { nonUserNavBar, unAuthorizedUser } from './../navbar.js'

export const bptlScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const name = user.displayName ? user.displayName : user.email;
    showAnimation();
    const response = await validateUser();
    hideAnimation();
    if(response.code !== 200) {
        document.getElementById('contentBody').innerHTML = 'Authorization failed you lack permissions to use this dashboard!';
        document.getElementById('navbarNavAltMarkup').innerHTML = unAuthorizedUser();
        return;
    }
    bptlScreenTemplate(name, response.data, auth, route);
    redirectPageToLocation(name, auth, route);
}

const bptlScreenTemplate = (name, data, auth, route) => {
    let template = '';
    template += `
        <div class="row align-center welcome-screen-div">
            <div class="col"><h3>BPTL Dashboard</h3></div>
        </div>
        <div class="container overflow-hidden">
            <div class="row gx-5">
                <div class="col">
                    <h4>Home Collection</h4>
                    <div class="p-3 border bg-light"><button type="button" href="#kitassembly" class="btn btn-primary btn-lg" id="kitAssembly">Kit Assembly</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#participantselection" class="btn btn-primary btn-lg" id="participantSelection">Participant Selection</button></div>
                    <div class="p-3 border bg-light"><button type="button" href="#kitshipment" class="btn btn-primary btn-lg" id="kitShipment">Kit Shipment</button></div>
                </div>
                <div class="col">
                    <h4>Supplies</h4>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Pending Requests</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Supply Packing</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Supply Shipment</button></div>
                </div>
                <div class="col">
                    <h4>Receipts</h4>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Packages in Transit from Sites</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Package Receipt</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Home Collection Data Entry</button></div>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Create .csv File</button></div>
                </div>
                <div class="col">
                    <h4>Reports</h4>
                    <div class="p-3 border bg-light"><button type="button" class="btn btn-primary btn-lg">Reports</button></div>
                </div>
            </div>
        </div>
        `
        document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
        document.getElementById('contentBody').innerHTML = template;
}



const redirectPageToLocation = (name, auth, route) => {
    const kitAssemblyRedirection = document.getElementById('kitAssembly');
    kitAssemblyRedirection && kitAssemblyRedirection.addEventListener('click',  async () => {
        location.hash = '#kitassembly';
    })
    const participantSelectionRedirection = document.getElementById('participantSelection');
    participantSelectionRedirection && participantSelectionRedirection.addEventListener('click',  async () => {
        location.hash = '#participantselection';
    })
    const kitShipmentRedirection = document.getElementById('kitShipment');
    kitShipmentRedirection && kitShipmentRedirection.addEventListener('click',  async () => {
        location.hash = '#kitshipment';
    })
}