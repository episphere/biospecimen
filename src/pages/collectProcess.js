import { addEventSelectAllCollection, addEventBiospecimenCollectionForm, addEventBackToSearch, addEventTubeCollectedForm, addEventBackToTubeCollection } from './../events.js'
import { removeActiveClass, generateBarCode } from '../shared.js';

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
            <div class="ml-auto form-group">
                Visit: ${formData.visitType}
            </div>
        </div>
        </br>
        <form id="biospecimenCollectionForm" method="POST">
            <div class="row">
                <table class="table-borderless collection-table">
                    <thead>
                        <tr><th>Tube Type</th><th>Collected</th><th>Scan Tube ID</th><th>Select for Deviation</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>(1) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="checkbox" data-tube-label="(1) Red Top Separator" class="tube-collected custom-checkbox-size disabled" data-tube-type="Blood tubes" disabled ${formData['tube1Collected'] === true ? 'checked': ''} id="tube1Collected"></td>
                            <td><input type="text" id="tube1Id" ${formData['tube1Id'] ? `value='${formData["tube1Id"]}'`: ''} class="form-control ${formData['tube1Collected'] === false ? 'disabled': ''}" ${formData['tube1Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(1) Red Top Separator" class="tube-deviated custom-checkbox-size ${formData['tube1Collected'] === false ? 'disabled': ''}" ${formData['tube1Deviated'] === true ? 'checked': ''} data-tube-type="Blood tubes" ${formData['tube1Collected'] === false ? 'disabled': ''} id="tube1Deviated"></td>
                        </tr>
                        <tr>
                            <td>(2) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="checkbox" data-tube-label="(2) Red Top Separator" class="tube-collected custom-checkbox-size disabled" data-tube-type="Blood tubes" disabled ${formData['tube2Collected'] === true ? 'checked': ''} id="tube2Collected"></td>
                            <td><input type="text" id="tube2Id" ${formData['tube2Id'] ? `value='${formData["tube2Id"]}'`: ''} class="form-control ${formData['tube2Collected'] === false ? 'disabled': ''}" ${formData['tube2Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(2) Red Top Separator" class="tube-deviated custom-checkbox-size ${formData['tube2Collected'] === false ? 'disabled': ''}" ${formData['tube2Deviated'] === true ? 'checked': ''} data-tube-type="Blood tubes" ${formData['tube2Collected'] === false ? 'disabled': ''} id="tube2Deviated"></td>
                        </tr>
                        <tr>
                            <td>(3) Green Top Heparin</br><img src="./static/images/tube2.PNG"></td>
                            <td><input type="checkbox" data-tube-label="(3) Green Top Heparin" class="tube-collected custom-checkbox-size disabled" data-tube-type="Blood tubes" disabled ${formData['tube3Collected'] === true ? 'checked': ''} id="tube3Collected"></td>
                            <td><input type="text" id="tube3Id" ${formData['tube3Id'] ? `value='${formData["tube3Id"]}'`: ''} class="form-control ${formData['tube3Collected'] === false ? 'disabled': ''}" ${formData['tube3Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(3) Green Top Heparin" class="tube-deviated custom-checkbox-size ${formData['tube3Collected'] === false ? 'disabled': ''}" ${formData['tube3Deviated'] === true ? 'checked': ''} data-tube-type="Blood tubes" ${formData['tube3Collected'] === false ? 'disabled': ''} id="tube3Deviated"></td>
                        </tr>
                        <tr>
                            <td>(4) Lavender Top EDTA</br><img src="./static/images/tube3.PNG"></td>
                            <td><input type="checkbox" data-tube-label="(4) Lavender Top EDTA" class="tube-collected custom-checkbox-size disabled" data-tube-type="Blood tubes" disabled ${formData['tube4Collected'] === true ? 'checked': ''} id="tube4Collected"></td>
                            <td><input type="text" id="tube4Id" ${formData['tube4Id'] ? `value='${formData["tube4Id"]}'`: ''} class="form-control ${formData['tube4Collected'] === false ? 'disabled': ''}" ${formData['tube4Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(4) Lavender Top EDTA" class="tube-deviated custom-checkbox-size ${formData['tube5Collected'] === false ? 'disabled': ''}" ${formData['tube4Deviated'] === true ? 'checked': ''} data-tube-type="Blood tubes" ${formData['tube4Collected'] === false ? 'disabled': ''} id="tube4Deviated"></td>
                        </tr>
                        <tr>
                            <td>(5) Yellow Top ACD</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="checkbox" data-tube-label="(5) Yellow Top ACD" class="tube-collected custom-checkbox-size disabled" data-tube-type="Blood tubes" disabled ${formData['tube5Collected'] === true ? 'checked': ''} id="tube5Collected"></td>
                            <td><input type="text" id="tube5Id" ${formData['tube5Id'] ? `value='${formData["tube5Id"]}'`: ''} class="form-control ${formData['tube5Collected'] === false ? 'disabled': ''}" ${formData['tube5Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(5) Yellow Top ACD" class="tube-deviated custom-checkbox-size ${formData['tube5Collected'] === false ? 'disabled': ''}" ${formData['tube5Deviated'] === true ? 'checked': ''} data-tube-type="Blood tubes" ${formData['tube5Collected'] === false ? 'disabled': ''} id="tube5Deviated"></td>
                        </tr>
                        <tr>
                            <td>(6) Urine</td>
                            <td><input type="checkbox" data-tube-label="(6) Urine" class="tube-collected custom-checkbox-size disabled" data-tube-type="Urine" disabled ${formData['tube6Collected'] === true ? 'checked': ''} id="tube6Collected"></td>
                            <td><input type="text" id="tube6Id" ${formData['tube6Id'] ? `value='${formData["tube6Id"]}'`: ''} class="form-control ${formData['tube6Collected'] === false ? 'disabled': ''}" ${formData['tube6Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(6) Urine" class="tube-deviated custom-checkbox-size ${formData['tube6Collected'] === false ? 'disabled': ''}" ${formData['tube6Deviated'] === true ? 'checked': ''} data-tube-type="Urine" ${formData['tube6Collected'] === false ? 'disabled': ''} id="tube6Deviated"></td>
                        </tr>
                        <tr>
                            <td>(7) Mouthwash</td>
                            <td><input type="checkbox" data-tube-label="(7) Mouthwash" class="tube-collected disabled custom-checkbox-size" data-tube-type="Mouthwash" disabled ${formData['tube7Collected'] === true ? 'checked': ''} id="tube7Collected"></td>
                            <td><input type="text" id="tube7Id" ${formData['tube7Id'] ? `value='${formData["tube7Id"]}'`: ''} class="form-control ${formData['tube7Collected'] === false ? 'disabled': ''}" ${formData['tube7Collected'] === false ? 'disabled': 'required'} placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" data-tube-label="(7) Mouthwash" class="tube-deviated custom-checkbox-size ${formData['tube7Collected'] === false ? 'disabled': ''}" ${formData['tube7Deviated'] === true ? 'checked': ''} data-tube-type="Mouthwash" ${formData['tube7Collected'] === false ? 'disabled': ''} id="tube7Deviated"></td>
                        </tr>
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
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="submit" id="collectionSaveExit">Save and Exit</button>
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
            <div class="ml-auto form-group">
                Visit: ${formData.visitType}
            </div>
        </div>
        </br>
        <form id="tubeCollectionForm" method="POST">
            <div class="row">
                <table class="table-borderless collection-table">
                    <thead>
                        <tr><th></th><th class="align-left"><input class="custom-checkbox-size" type="checkbox" id="selectAllCollection"><label for="selectAllCollection"> Check All</label></th></tr>
                        <tr><th>Tube Type</th><th class="align-left">Select If Collected</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>(1) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Blood tubes" ${formData['tube1Collected'] === true ? 'checked': ''} id="tube1Collected"></td>
                        </tr>
                        <tr>
                            <td>(2) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Blood tubes" ${formData['tube2Collected'] === true ? 'checked': ''} id="tube2Collected"></td>
                        </tr>
                        <tr>
                            <td>(3) Green Top Heparin</br><img src="./static/images/tube2.PNG"></td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Blood tubes" ${formData['tube3Collected'] === true ? 'checked': ''} id="tube3Collected"></td>
                        </tr>
                        <tr>
                            <td>(4) Lavender Top EDTA</br><img src="./static/images/tube3.PNG"></td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Blood tubes" ${formData['tube4Collected'] === true ? 'checked': ''} id="tube4Collected"></td>
                        </tr>
                        <tr>
                            <td>(5) Yellow Top ACD</br><img src="./static/images/tube1.PNG"></td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Blood tubes" ${formData['tube5Collected'] === true ? 'checked': ''} id="tube5Collected"></td>
                        </tr>
                        <tr>
                            <td>(6) Urine</td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Urine" ${formData['tube6Collected'] === true ? 'checked': ''} id="tube6Collected"></td>
                        </tr>
                        <tr>
                            <td>(7) Mouthwash</td>
                            <td class="align-left"><input type="checkbox" class="tube-collected custom-checkbox-size" data-tube-type="Mouthwash" ${formData['tube7Collected'] === true ? 'checked': ''} id="tube7Collected"></td>
                        </tr>
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