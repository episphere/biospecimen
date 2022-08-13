import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, getSiteCode } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventClinicalSpecimenLinkForm, addEventClinicalSpecimenLinkForm2, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "./../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const specimenTemplate = async (data) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    const workflow = getWorflow() ?? localStorage.getItem('workflow');

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

        </br>`

        template += `<form id="specimenLinkForm" method="POST" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">`;
        if(workflow === 'research') {
            let visit = visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0];
            template += `<div class="">
                            <h4>Link a new Collection ID</h4><br/>
                            <h4> Visit: ${visit.visitType}</h4>
                        </div>`;
        template += `<div class="form-group row">`
                const siteAcronym = getSiteAcronym();
                
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
            </div>`;
     } else if(data.specimenFormData) {// clinical specimen page 2
        let visit = visitType.filter(visit => visit.concept === data.specimenFormData.visitType)[0];
            template += `<div class="row">
                            <div class="column">
                                <div class="row">Visit: ${visit}</div>
                                <div class="row">Blood Accession ID: ${data.specimenFormData['646899796']}</div>
                                <div class="row">Urine Accession ID: ${data.specimenFormData['611091485']}</div>
                                <div class="row">Link a new Collection ID</div>
                            </div>
                        </div>

                        <div class="form-group row">
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
                        </div>`
     } else  {// clinical specimen page 1
        template += `<div class="form-group row">`
        const siteAcronym = getSiteAcronym();
        template += `<select class="custom-select" id="visit-select">
                                <option value=""> -- Select Visit -- </option>`;
                                
                Array.from(visitType).forEach(option => {
                    template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                })

                template += `</select>`;
    template +=`</div>`
        template += `
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="accessionID1">Scan Blood Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" ${siteAcronym === 'KPCO' || siteAcronym === 'KPGA' || siteAcronym === 'KPNW' || siteAcronym === 'KPHI' ? 'required': ''} placeholder="Scan/Type in Accession ID from Blood Tube" id="accessionID1"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID2" data-barcode-input="accessionID1"><i class="fas fa-times"></i></button>
            </div>
            <div class="form-group row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Blood Tube" id="accessionID2"/>
            </div>
            </br>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="accessionID3">Scan Urine Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" ${siteAcronym === 'KPCO' || siteAcronym === 'KPGA' || siteAcronym === 'KPNW' || siteAcronym === 'KPHI' ? 'required': ''} placeholder="Scan/Type in Accession ID from Urine Tube" id="accessionID3"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID4" data-barcode-input="accessionID3"><i class="fas fa-times"></i></button>
            </div>
            <div class="form-group row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Urine Tube" id="accessionID4"/>
            </div>
            
    <div class="form-group row">
        <div class="col">
            <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="clinicalSpecimenContinue">Submit</button>
        </div>
    </div>`
    }
    template += `</form>
    </br>`;
    document.getElementById('contentBody').innerHTML = template;
    //JS Events logic 
    if(workflow === 'research') {
        document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
        addEventSpecimenLinkForm(data);
    } else if (data.specimenFormData) {// clinical specimen page 2
        document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
        addEventClinicalSpecimenLinkForm2(data);

    } else {//clinical specimen page 1
        document.getElementById('accessionID2').onpaste = e => e.preventDefault();
        document.getElementById('accessionID4').onpaste = e => e.preventDefault();
        addEventClinicalSpecimenLinkForm(data);

    }

    // addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, masterSpecimenIDRequirement.length);
    // if(document.getElementById('scanAccessionIDBarCodeBtn')) addEventBarCodeScanner('scanAccessionIDBarCodeBtn');
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}