import { addEventBarCodeScanner, generateBarCode, removeActiveClass, siteLocations } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "./../events.js";
import { workflows } from "../tubeValidation.js";

export const specimenTemplate = (data, formData) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.classList.remove('disabled');
    navBarBtn.classList.add('active');
    let template = `
        </br>
        <div class="row">
            <h5>Specimen Link</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            ${formData.visitType ? `
                <div class="ml-auto form-group">
                    Visit: ${formData.visitType}
                </div>
            `: ``}
        </div>
        </br>
        <form id="specimenLinkForm" method="POST">
            <div class="form-group row">`
                const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                const workflow = document.getElementById('contentBody').dataset.workflow;
                if(siteLocations[workflow] && siteLocations[workflow][siteAcronym]) {
                    template +=`<label class="col-md-4 col-form-label" for="collectionLocation">Select Collection Location</label><select class="form-control col-md-5" id="collectionLocation">`
                    siteLocations[workflow][siteAcronym].forEach(location => {
                        template +=`<option value='${location}'>${location}</option>`
                    })
                    template +=`</select>`
                }
                template +=` 
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan Master Specimen ID</label>
                <input type="text" class="form-control col-md-5 disabled" disabled placeholder="Scan in Master Specimen ID from Label Sheet Label" id="scanSpecimenID"/> 
                <button class="barcode-btn-outside" type="button" id="scanSpecimenIDBarCodeBtn" data-barcode-input="scanSpecimenID"><i class="fas fa-barcode"></i></button>
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanSpecimenID" title="Clear scanned barcode" data-barcode-input="scanSpecimenID"><i class="fas fa-times"></i></button>
            </div>
            </br>
            <div class="form-group row">
                If it can't be scanned:
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID1">Manually Enter Master Specimen ID</label>
                <input type="text" class="form-control col-md-5" placeholder="Manually Enter in Master Specimen ID from Label Sheet Label" id="enterSpecimenID1"/>
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID2">Re-enter Master Specimen ID</label>
                <input type="text" class="form-control col-md-5" placeholder="Re-enter Master Specimen ID" id="enterSpecimenID2"/>
            </div>

            <div class="form-group row">
                Is the Master Specimen ID correct for the participant?
            </div>
            <div class="form-group row">
                <div class="col-auto">
                    <button class="btn btn-outline-danger" id="reEnterSpecimen">No: Re-enter Master Specimen ID</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="submit" id="specimenSaveExit">Yes: Save and Exit</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="submit" id="specimenContinue">Yes: Continue</button>
                </div>
            </div>
        </form>
        </br>
    `;
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
    addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, 9);
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventSpecimenLinkForm(formData);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}