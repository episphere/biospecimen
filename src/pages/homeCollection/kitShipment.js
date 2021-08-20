import { nonUserNavBar, unAuthorizedUser } from './../../navbar.js';
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";

  
  export const kitShipmentScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitShipmentTemplate(username, auth, route);
    verifyScannedCode();
  };
  
  
  const kitShipmentTemplate = async (name, auth, route) => {
    let template = ``;
    template += homeCollectionNavbar();
    template += ` 
                      <div id="root root-margin" style="padding-top: 25px;">
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Kit Shippment</h3> </span>
                      <div class="container-fluid" style="padding-top: 50px;">
                          
                          <div class="card">
                          <div class="card-body">
                          <span> <h3 style="text-align: center; margin: 0 0 1rem;">Scan USPS tracking number</h3> </span>
                            <div style="text-align: center;  padding-bottom: 25px; "> 
                            <span id="fieldModified"> Scan Barcode</span>  : <input required type="text" name="scannedCode" id="scannedCode"  /> </div>
                                <div class="card text-center" style="width: 40%; margin-left: 30%; margin-right: 30%; ">
                                    <div class="card-body">
                                        <span id="pickupDate"> Pickup Date </span>  : <input required type="text" name="inputDate" id="inputDate"  />
                                        <br />
                                        <div class="form-check" style="padding-top: 20px;">
                                            <input class="form-check-input" name="options" type="checkbox" id="defaultCheck">
                                            <label class="form-check-label" for="defaultCheck3">Confirm Pickup </label> 
                                        </div>
                                    </div>
                                
                                <div style="display:inline-block; padding: 10px 10px;">
                                    <button type="submit" class="btn btn-danger">Cancel</button>
                                    <button type="submit" class="btn btn-primary" id="saveResponse">Save</button>
                                </div>
                            </div>
                          </div>
                        </div>
                  </div>
             </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
  };
  
 const verifyScannedCode = () => {
     const a = document.getElementById('scannedCode');
     if (a) {
         a.addEventListener('change', () => {
            console.log('a', a)
         })
     }
 }