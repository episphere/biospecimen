import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorflow, removeActiveClass, siteLocations, visitType } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventNavBarParticipantCheckIn, addEventBackToSearch, addEventCntdToCollectProcess, addEventSpecimenLinkFormCntd } from "./../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const specimenTemplate = async (data, formData, collections) => {
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
                <div class="row">${data['996038075']}, ${data['399159511']}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            ${formData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType[formData['331584571']]}
                </div>
            `: ``}
        </div>
        `;
        if(collections){
            template+=`</br><div class="row"><h4>Participant Collections</h4></div>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Collection ID</th>
                        <th>Accession ID</th>
                        <th>Date of Collection</th>
                        <th>Date scanned at Regional Lab</th>
                        <th>Visit</th>
                        <th>Collection settings</th>
                        <th>Select Action</th>
                    </tr>
                </thead>
                <tbody>`
                collections.forEach(collection => {
                    template += `<tr>
                        <td>${collection['820476880']}</td>
                        <td>${collection['646899796'] ? collection['646899796'] : ''}</td>
                        <td>${collection['678166505'] ? new Date(collection['678166505']).toLocaleString() : ''}</td>
                        <td>${collection['915838974'] ? new Date(collection['915838974']).toLocaleString() : ''}</td>
                        <td>${collection['331584571'] ? visitType[collection['331584571']] : ''}</td>
                        <td>${collection['650516960'] ? collectionSettings[collection['650516960']] : ''}</td>
                        <td><button class="custom-btn continue-collect-process" data-connect-id="${data.Connect_ID}" data-collection-id="${collection['820476880']}">${getWorflow() === 'research' ? `Continue to Collect/Process`:`Continue to Labeling and Receipt`}</button></td>
                    </tr>`
                })
            template +=`</tbody></table>`
        }
        
        template += `</br><div class="row"><h4>Start a new Collection</h4></div>
        <form id="specimenLinkForm" method="POST" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">
            
            
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="biospecimenVisitType">Select visit</label>
                <select class="form-control col-md-5" required id="biospecimenVisitType">
                    <option value=""> -- Select Visit -- </option>
                    <option selected value="153098257">Baseline</option>
                </select>
            </div>
            
            <div class="form-group row">`
                const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                const workflow = getWorflow();
                if(siteLocations[workflow] && siteLocations[workflow][siteAcronym]) {
                    template +=`<label class="col-md-4 col-form-label" for="collectionLocation">Select Collection Location</label>
                    <select class="form-control col-md-5" id="collectionLocation">`
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
                        <button class="barcode-btn-outside" type="button" id="scanAccessionIDBarCodeBtn" data-barcode-input="accessionID1" data-clear-btn="clearScanAccessionID"><i class="fas fa-barcode"></i></button>
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
                <input autocomplete="off" type="text" class="form-control col-md-5 disabled" disabled placeholder="Scan in Collection ID from Label Sheet Label" id="scanSpecimenID"/> 
                <button class="barcode-btn-outside" type="button" id="scanSpecimenIDBarCodeBtn" data-barcode-input="scanSpecimenID"><i class="fas fa-barcode"></i></button>
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanSpecimenID" title="Clear scanned barcode" data-enable-input="enterSpecimenID1,enterSpecimenID2" data-barcode-input="scanSpecimenID"><i class="fas fa-times"></i></button>
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
                <div class="col-auto">
                    <button class="btn btn-outline-danger" type="reset" id="reEnterSpecimen">No: Re-enter Collection ID</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="button" id="specimenSaveExit">Yes: Save and Exit</button>
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
    addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, masterSpecimenIDRequirement.length);
    if(document.getElementById('scanAccessionIDBarCodeBtn')) addEventBarCodeScanner('scanAccessionIDBarCodeBtn');
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventCntdToCollectProcess();
    addEventSpecimenLinkForm(formData);
    addEventSpecimenLinkFormCntd(formData);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}