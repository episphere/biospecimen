import { addEventSelectAllCollection, addEventBiospecimenCollectionForm, addEventBiospecimenCollectionFormCntd, addEventBackToSearch, addEventTubeCollectedForm, addEventBackToTubeCollection } from './../events.js'
import { removeActiveClass, generateBarCode, addEventBarCodeScanner } from '../shared.js';
import { siteSpecificTubeRequirements, workflows } from '../tubeValidation.js';

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
                <div class="row">Master Specimen ID: ${formData.masterSpecimenId}</div>
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
                        <tr><th>Tube Type</th><th>Collected</th><th>Scan Tube ID</th><th>Select for Deviation</th></tr>
                    </thead>
                    <tbody>`
                    const dashboardType = document.getElementById('contentBody').dataset.workflow;
                    const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                    let tubes = workflows[dashboardType];
                    if(dashboardType === 'clinical' && siteAcronym === 'KPHI' && formData.Collection_Location && formData.Collection_Location === 'non-Oahu') tubes = workflows.clinical_non_oahu;
                    tubes.forEach((obj, index) => {
                        template += `
                            <tr>
                                <td>(${index+1}) ${obj.specimenType}</br>${obj.image ? `<img src="${obj.image}" alt="${obj.readableValue} image">` : ``}</td>
                                <td><input type="checkbox" data-tube-label="(${index+1}) ${obj.specimenType}" class="tube-collected custom-checkbox-size disabled" data-tube-type="${obj.tubeType}" disabled ${formData[`${obj.name}Collected`] === true ? 'checked': ''} id="${obj.name}Collected"></td>
                                <td>
                                    <input type="text" id="${obj.name}Id" ${formData[`${obj.name}Id`] ? `value='${formData.masterSpecimenId} ${formData[`${obj.name}Id`]}'`: ''} class="form-control ${formData[`${obj.name}Collected`] === false ? 'disabled': ''} input-barcode-id" ${formData[`${obj.name}Collected`] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID">
                                    <button class="barcode-btn-collect-process" type="button" id="${obj.name}IdBarCodeBtn" data-barcode-input="${obj.name}Id"><i class="fas fa-barcode"></i></button>
                                </td>
                                <td><input type="checkbox" data-tube-label="(${index+1}) ${obj.specimenType}" class="tube-deviated custom-checkbox-size ${formData[`${obj.name}Collected`] === false ? 'disabled': ''}" ${formData[`${obj.name}Deviated`] === true ? 'checked': ''} data-tube-type="${obj.tubeType}" ${formData[`${obj.name}Collected`] === false ? 'disabled': ''} id="${obj.name}Deviated"></td>
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
                    <textarea rows=3 class="form-control" id="collectionAdditionalNotes">${formData['collectionAdditionalNotes'] ? `${formData["collectionAdditionalNotes"]}`: ''}</textarea>
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
    addEventBackToTubeCollection(data, formData.masterSpecimenId);
    addEventBiospecimenCollectionForm(data, formData);
    addEventBiospecimenCollectionFormCntd(data, formData);
    const barCodeBtns = Array.from(document.getElementsByClassName('barcode-btn-collect-process'));
    barCodeBtns.forEach(btn => {
        addEventBarCodeScanner(btn.id, 0, 14);
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
                <div class="row">Master Specimen ID: ${formData.masterSpecimenId}</div>
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
                    let tubes = workflows[dashboardType];
                    if(dashboardType === 'clinical' && siteAcronym === 'KPHI' && formData.Collection_Location && formData.Collection_Location === 'non-Oahu') tubes = workflows.clinical_non_oahu;
                    tubes.forEach((obj, index) => {
                        template += `
                            <tr>
                                <td>(${index+1}) ${obj.specimenType}</br>${obj.image ? `<img src="${obj.image}" alt="${obj.readableValue} image">` : ``}</td>
                                <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="${obj.tubeType}" ${formData[`${obj.name}Collected`] === true ? 'checked': ''} id="${obj.name}Collected"></td>
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
    addEventTubeCollectedForm(data, `${formData.masterSpecimenId}`);
}