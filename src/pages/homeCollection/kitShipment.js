import { nonUserNavBar, unAuthorizedUser } from './../../navbar.js';
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { showAnimation, hideAnimation, getIdToken, getParticipantSelection } from "../../shared.js";

  
  export const kitShipmentScreen = async (auth, route) => {
    const user = auth.currentUser;
    let uspsHit = ``;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitShipmentTemplate(username, auth, route);
    verifyScannedCode(uspsHit);
  };
  
  
  const kitShipmentTemplate = async (name, auth, route) => {
    let template = ``;
    template += homeCollectionNavbar();
    template += ` 
                      <div id="root root-margin" style="padding-top: 25px;">
                      <div id="alert_placeholder"></div>
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Kit Shippment</h3> </span>
                      <div class="container-fluid" style="padding-top: 50px;">     
                          <div class="card">
                          <div class="card-body">
                          <span> <h3 style="text-align: center; margin: 0 0 1rem;">Scan USPS tracking number</h3> </span>
                            <div style="text-align: center;  padding-bottom: 25px; "> 
                              <span id="fieldModified"> Scan Barcode</span>  : <input required type="text" name="scannedCode" id="scannedCode"  /> </div>
                              <div class="card text-center" id="cardBody" style="width: 40%; margin-left: 30%; margin-right: 30%;"> </div>
                          </div>
                        </div>
                  </div>
             </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
  };
  
 const verifyScannedCode = async (uspsHit) => {
     const a = document.getElementById('scannedCode');
     const response = await getParticipantSelection("all");
     const assignedParticipants = response.data

     if (a) {
         a.addEventListener('change', () => {
          uspsHit = assignedParticipants.filter( el => (parseInt(el.usps_trackingNum) === parseInt(a.value)) )
          uspsHit.length != 0 ? confirmPickupTemplate(uspsHit) : tryAgainTemplate();
         })
     }
 }

  const confirmPickupTemplate = (uspsHit) => {
    const a = document.getElementById('cardBody');
    let template = ``
    template += `        
                  <div class="card-body">
                      <span id="pickupDate"> Pickup Date </span>  : <input required type="text" name="inputDate" id="inputDate"  />
                        <br />
                        <div class="form-check" style="padding-top: 20px;">
                            <input class="form-check-input" name="options" type="checkbox" id="defaultCheck" checked>
                            <label class="form-check-label" for="defaultCheck3">Confirm Pickup </label> 
                        </div>
                      </div>
                      <div style="display:inline-block; padding: 10px 10px;">
                        <button type="submit" class="btn btn-danger">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="saveResponse">Save</button>
                      </div>`
    a.innerHTML = template;
    saveResponse(uspsHit);
  }

  const tryAgainTemplate = () => {
    const a = document.getElementById('cardBody');
    let template = ``
    template += `        
                <div class="card-body">
                    <span> Couldn't find USPS Tracking Number </span>
                    <br />
                </div>`
    a.innerHTML = template;
  }


  const saveResponse = (uspsHit) => {
    const a = document.getElementById('saveResponse');
    let data = {} 
    data.id = uspsHit && uspsHit[0].id
    if(a){
      a.addEventListener("click", (e) => {
        data.pickup_date = document.getElementById('inputDate').value;
        data.confirm_pickup = document.getElementById('defaultCheck').checked;
        setShippedResponse(data);
      })
    }
  }

  const setShippedResponse = async (data) => {
    showAnimation();
    const idToken = await getIdToken(); 
    const response = await await fetch(
      `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=shipped`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: "Bearer " + idToken,
          "Content-Type": "application/json",
        },
      }
    );
    hideAnimation();
    if (response.status === 200) {
      let alertList = document.getElementById('alert_placeholder');
      let template = ``
      template += `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                  Response saved!
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>`
      alertList.innerHTML = template;
      document.getElementById('scannedCode').value = ``;
      document.getElementById('cardBody').innerHTML = ``;
      return true; // return success modal screen
    } else {
      alert("Error");
    }
  }
