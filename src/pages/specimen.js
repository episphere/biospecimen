import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, getSiteCode } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "./../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const specimenTemplate = async (data) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    // get rid of all this
    let formData = {};
    formData['siteAcronym'] = getSiteAcronym();
    formData['827220437'] = parseInt(getSiteCode());

    let template = `
        </br>

        <div class="row">
            <h5>Specimen Link</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data['996038075']},<span id='399159511'>${data['399159511']}</span></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
        </div>

        </br>

        <div class="">
            <h4>Link a new Collection ID</h4><br/>
            <h4> Visit: ${visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0].visitType}</h4>
        </div>

        <form id="specimenLinkForm" method="POST" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">
            <div class="form-group row">`
                const siteAcronym = getSiteAcronym();
                const workflow = getWorflow() ?? localStorage.getItem('workflow');
                if(siteLocations[workflow] && siteLocations[workflow][siteAcronym]) {
                    template +=`<label class="col-md-4 col-form-label" for="collectionLocation">Select Collection Location</label>
                    <select class="form-control col-md-5" id="collectionLocation">
                    <option value='none'>Please Select Location</option>`
                    siteLocations[workflow][siteAcronym].forEach(site => {
                        template +=`<option value='${site.concept}'>${site.location}</option>`
                    })
                    template +=`</select>`
                }
            template +=`</div>`
            if(workflow === 'clinical') {
                template += `
                    <div class="form-group row">
                        <label class="col-md-4 col-form-label" for="accessionID1">Scan in Accession ID:</label>
                        <input autocomplete="off" type="text" class="form-control col-md-5" ${siteAcronym === 'KPCO' || siteAcronym === 'KPGA' || siteAcronym === 'KPNW' || siteAcronym === 'KPHI' ? 'required': ''} placeholder="Scan/Type in Accession ID from Tube" id="accessionID1"/>
                        
                        <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID2" data-barcode-input="accessionID1"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="form-group row">
                        <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Type in Accession ID from Tube" id="accessionID2"/>
                    </div>
                    </br>
                `
            }
            template += `<div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan Collection ID from Label Sheet Label</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan in Collection ID from Label Sheet Label" id="scanSpecimenID"/> 
            </div>
            </br>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID1">Manually Enter Collection ID</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Manually Enter in Collection ID from Label Sheet Label" id="enterSpecimenID1"/>
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID2">Re-enter Collection ID</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-enter Collection ID" id="enterSpecimenID2"/>
            </div>

            <div class="form-group row">
                <div class="col">
                    <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="specimenContinue">Submit</button>
                </div>
            </div>
        </form>
        </br>
    `;
    
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
    // addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, masterSpecimenIDRequirement.length);
    // if(document.getElementById('scanAccessionIDBarCodeBtn')) addEventBarCodeScanner('scanAccessionIDBarCodeBtn');
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventSpecimenLinkForm(formData);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}