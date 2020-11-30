import { addEventSelectAllCollection, addEventBiospecimenCollectionForm, addEventBiospecimenCollectionFormCntd, addEventBackToSearch, addEventTubeCollectedForm, addEventBackToTubeCollection } from './../events.js'
import { removeActiveClass, generateBarCode, addEventBarCodeScanner } from '../shared.js';
import { siteSpecificTubeRequirements, totalCollectionIDLength, workflows } from '../tubeValidation.js';

export const collectProcessTemplate = (data, formData) => {
    let template = `
        </br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${formData['820476880']}</div>
            </div>
            ${formData.visitType ? `
                <div class="ml-auto form-group">
                    Visit: ${formData.visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <form id="biospecimenCollectionForm" method="POST">
            <div class="row">
                <table class="table-borderless collection-table">
                    <thead>
                        <tr><th>Tube Type</th><th>Collected</th><th>Scan Full Specimen ID</th><th>Select for Deviation</th></tr>
                    </thead>
                    <tbody>`
                    const dashboardType = document.getElementById('contentBody').dataset.workflow;
                    const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                    const subSiteLocation = formData.Collection_Location;
                    const siteTubesList = siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] : siteSpecificTubeRequirements[siteAcronym][dashboardType]; 
                    siteTubesList.forEach((obj, index) => {
                        template += `
                            <tr>
                                <td>(${index+1}) ${obj.specimenType}</br>${obj.image ? `<img src="${obj.image}" alt="${obj.readableValue} image">` : ``}</td>
                                <td>${obj.collectionChkBox === true ? `<input type="checkbox" data-tube-label="(${index+1}) ${obj.specimenType}" class="tube-collected custom-checkbox-size disabled" data-tube-type="${obj.tubeType}" disabled ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 353358909 ? 'checked': ''} id="${obj.concept}">`: ``}</td>
                                <td>
                                    <input 
                                        type="text" 
                                        autocomplete="off" 
                                        id="${obj.concept}Id" 
                                        ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['label'] ? `value='${formData[`${obj.concept}`]['label']}'`: ``}
                                        class="form-control ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 104430631 ? 'disabled': ''} input-barcode-id" 
                                        ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 104430631 ? 'disabled': 'required'} 
                                        placeholder="Scan/Type in Full Specimen ID"
                                    >
                                    ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 353358909 ? `<button class="barcode-btn-collect-process" type="button" id="${obj.concept}IdBarCodeBtn" data-barcode-input="${obj.concept}Id"><i class="fas fa-barcode"></i></button>`: ''}
                                </td>
                                <td>${obj.deviationChkBox === true ? `
                                    <input 
                                        type="checkbox" 
                                        data-tube-label="(${index+1}) ${obj.specimenType}" 
                                        class="tube-deviated custom-checkbox-size ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 104430631 ? 'disabled': ''}" 
                                        ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['678857215'] === 353358909 ? 'checked': ''} 
                                        data-tube-type="${obj.tubeType}" 
                                        ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 104430631 ? 'disabled': ''} 
                                        id="${obj.concept}Deviated"
                                    >`: ``}
                                </td>
                            </tr>
                        `
                    });
                     
                    template +=`
                    </tbody>
                </table>
            </div>
            <div class="row">
                <div class="col">
                    <label for="collectionAdditionalNotes">Additional notes on collection</label>
                    </br>
                    <textarea rows=3 class="form-control" id="collectionAdditionalNotes">${formData['338570265'] ? `${formData["338570265"]}`: ''}</textarea>
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col-auto">
                    <button class="btn btn-outline-danger" id="backToTubeCollection">Back to tube collection</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="button" id="collectionSaveExit">Save and Exit</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="submit" id="collectionNext">Next</button>
                </div>
            </div>
        </form>
    `;
    removeActiveClass('navbar-btn', 'active');
    const navBarBtn = document.getElementById('navBarSpecimenProcess');
    navBarBtn.classList.remove('disabled');
    navBarBtn.classList.add('active');
    addEventBackToSearch('navBarSearch');
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToTubeCollection(data, formData['820476880']);
    addEventBiospecimenCollectionForm(data, formData);
    addEventBiospecimenCollectionFormCntd(data, formData);
    const barCodeBtns = Array.from(document.getElementsByClassName('barcode-btn-collect-process'));
    barCodeBtns.forEach(btn => {
        addEventBarCodeScanner(btn.id, 0, totalCollectionIDLength);
    });
}

export const tubeCollectedTemplate = (data, formData) => {
    let template = `
        </br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${formData['820476880']}</div>
            </div>
            ${formData.visitType ? `
                <div class="ml-auto form-group">
                    Visit: ${formData.visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <form id="tubeCollectionForm" method="POST">
            <div class="row">
                <table class="table-borderless collection-table">
                    <thead>
                        <tr><th></th><th class="align-left"><input class="custom-checkbox-size" type="checkbox" id="selectAllCollection"><label for="selectAllCollection">&nbsp;Check All</label></th></tr>
                        <tr><th>Tube Type</th><th class="align-left">Select If Collected</th></tr>
                    </thead>
                    <tbody>`
                    const dashboardType = document.getElementById('contentBody').dataset.workflow;
                    const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                    const subSiteLocation = formData.Collection_Location;
                    const siteTubesList = siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] : siteSpecificTubeRequirements[siteAcronym][dashboardType]; 
                    siteTubesList.forEach((obj, index) => {
                        template += `
                            <tr>
                                <td>(${index+1}) ${obj.specimenType}</br>${obj.image ? `<img src="${obj.image}" alt="${obj.readableValue} image">` : ``}</td>
                                <td class="align-left">${obj.collectionChkBox === true ? `<input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="${obj.tubeType}" ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['593843561'] === 353358909 ? 'checked': ''} id="${obj.concept}">`:``}</td>
                            </tr>
                        `
                    });
                        template +=`
                    </tbody>
                </table>
            </div>
            </br>
            <div class="row">
                <div class="ml-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="submit" id="collectionNext">Next</button>
                </div>
            </div>
        </form>
    `;
    removeActiveClass('navbar-btn', 'active');
    const navBarBtn = document.getElementById('navBarSpecimenProcess');
    navBarBtn.classList.remove('disabled');
    navBarBtn.classList.add('active');
    addEventBackToSearch('navBarSearch');
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventSelectAllCollection();
    addEventTubeCollectedForm(data, `${formData['820476880']}`);
}