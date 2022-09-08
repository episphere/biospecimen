import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, numericInputValidator, getSiteCode, searchSpecimen, collectionInputValidator, addSelectionEventListener, verifyPaymentEligibility } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventClinicalSpecimenLinkForm, addEventClinicalSpecimenLinkForm2, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "./../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const specimenTemplate = async (data, formData) => {
    
    
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    // get rid of all this
    const isSpecimenLinkForm2 = !!formData;
    formData = formData ? formData : {};
    formData['siteAcronym'] = getSiteAcronym();
    formData['827220437'] = parseInt(getSiteCode());

    const workflow = getWorflow() ?? localStorage.getItem('workflow');
    const locationSelection = JSON.parse(localStorage.getItem('selections'))?.specimenLink_location;

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
                        template +=`<option ${locationSelection === site.concept.toString() ? 'selected="selected"' : ""} value='${site.concept}'>${site.location}</option>`
                    })
                    template +=`</select>`
                }
            template +=`</div>`
            template += `<div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
            </div>
            </br>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
            </div>

            <div class="form-group row">
                <div class="col">
                    <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="specimenContinue">Submit</button>
                </div>
            </div>`;

     } else if(isSpecimenLinkForm2) {// clinical specimen page 2
        let visit = visitType.filter(visit => visit.concept === formData['331584571'].toString())[0];
            template += `<div class="row">
                            <div class="column">
                                <div class="row">Visit: ${visit.visitType}</div>
                                <div class="row">Blood Accession ID: ${formData['646899796'] || 'N/A'}</div>
                                <div class="row">Urine Accession ID: ${formData['928693120'] || 'N/A'}</div>
                                <div class="row">Link a new Collection ID</div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
                        </div>
                        </br>
                        <div class="form-group row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
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
                <div class="helper-text"><span class="form-helper-text offset-4">This entry can only contain numbers.</span></div>
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
        // document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
        addEventSpecimenLinkForm(formData);
        addSelectionEventListener("collectionLocation", "specimenLink_location");
        
    } else if (isSpecimenLinkForm2) {// clinical specimen page 2
        // document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
        addEventClinicalSpecimenLinkForm2(formData);
        collectionInputValidator(['scanSpecimenID', 'scanSpecimenID2']);

    } else {//clinical specimen page 1
        document.getElementById('accessionID2').onpaste = e => e.preventDefault();
        document.getElementById('accessionID4').onpaste = e => e.preventDefault();
        addEventClinicalSpecimenLinkForm(formData);
        numericInputValidator(['accessionID1', 'accessionID2', 'accessionID3', 'accessionID4']);
 }

    // addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, masterSpecimenIDRequirement.length);
    // if(document.getElementById('scanAccessionIDBarCodeBtn')) addEventBarCodeScanner('scanAccessionIDBarCodeBtn');
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}