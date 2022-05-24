import { addEventSelectAllCollection, addEventBiospecimenCollectionForm, addEventBiospecimenCollectionFormToggles, addEventBackToSearch, addEventBiospecimenCollectionFormEdit, addEventBiospecimenCollectionFormEditAll, addEventBiospecimenCollectionFormText } from './../events.js'
import { removeActiveClass, generateBarCode, addEventBarCodeScanner, visitType, getSiteTubesLists, getWorflow, getCheckedInVisit, findParticipant, verifyDefaultConcepts, checkedIn } from '../shared.js';
import { checkInTemplate } from './checkIn.js';

export const tubeCollectedTemplate = (data, formData) => {
    const isCheckedIn = checkedIn(data);

    let template = `
        </br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row"><h5>${data['996038075']}, ${data['399159511']}</h5></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${formData['820476880']}</div>
                <div class="row">Collection ID Link Date/Time: ${new Date(formData['678166505']).toLocaleString()}</div>
            </div>
            ${formData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType.filter(visit => visit.concept == formData['331584571'])[0].visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <form id="biospecimenCollectionForm" method="POST">
            <div class="row">
                <table class="table collection-table">
                    <thead>
                        <tr>
                            <th class="align-left">Specimen Type</th>
                            <th class="align-left">Sample Collected 
                                <input class="custom-checkbox-size" type="checkbox" id="selectAllCollection">
                                <label for="selectAllCollection">&nbsp;Check All</label>
                            </th>
                            ${getWorflow() === 'research' ? `<th class="align-left">Reason Not Collected</th>` : ''}
                            <th class="align-left">Scan Full Specimen ID</th> 
                            <th class="align-left">Select For Deviation</th>
                            <th class="align-left">Deviation Type</th> 
                            <th class="align-left">Comments</th>
                            <th><button class="btn btn-outline-primary" type="button" id="collectEditAllBtn">Edit All</button></th>
                        </tr>
                    </thead>
                    <tbody>`
                    
                    let siteTubesList = getSiteTubesLists(formData);
                    const collectionFinalized = (formData['410912345'] === 353358909);
                    
                    if(!siteTubesList || siteTubesList?.length === 0) siteTubesList = [];

                    siteTubesList?.forEach((obj, index) => {

                        const notCollectedOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].tubeNotCollectedOptions;
                        const deviationOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].deviationOptions;

                        const tubeCollected = (formData[obj.concept]['593843561'] === 353358909);
                        const tubeDeviated = (formData[obj.concept]['678857215'] === 353358909);

                        let required = false;
                        if(formData[obj.concept] && formData[obj.concept]['593843561'] !== 104430631) {
                            required = true;
                        }

                        template += `
                            <tr>
                                <td>
                                    ${obj.specimenType} ${obj.id ? '(' + obj.id + ')' : ''}</br>${obj.image ? `<img src="${obj.image}" alt="${obj.readableValue} image">` : ``}
                                </td>

                                <td class="align-left">${obj.collectionChkBox === true ? `
                                    <input type="checkbox" 
                                        class="tube-collected custom-checkbox-size" 
                                        data-tube-type="${obj.tubeType}" 
                                        ${tubeCollected ? 'checked disabled': ''} 
                                        id="${obj.concept}"
                                    >`
                                    :``}
                                </td>`

                                if(getWorflow() === 'research') {

                                    template += 
                                
                                        `<td>`

                                            if(notCollectedOptions) {
                                                template += `
                                                    <select 
                                                        data-connect-id="${data.Connect_ID}" 
                                                        id="${obj.concept}Reason"
                                                        style="width:200px"
                                                        ${tubeCollected ? 'disabled' : ''}
                                                    >
                                                        <option value=""> -- Select Reason -- </option>`

                                                        notCollectedOptions.forEach(option => {
                                                            template += `<option ${formData[`${obj.concept}`]['883732523'] == option.concept ? 'selected' : ''} value=${option.concept}>${option.label}</option>`;
                                                        })

                                                template += `</select>`    
                                            }

                                        `</td>`
                                }

                                template += `
                                <td>
                                    <input 
                                        type="text" 
                                        autocomplete="off" 
                                        id="${obj.concept}Id" 
                                        ${formData[`${obj.concept}`] && formData[`${obj.concept}`]['825582494'] ? `value='${formData[`${obj.concept}`]['825582494']}'`: ``}
                                        class="form-control input-barcode-id" 
                                        ${required ? 'required' : ''} 
                                        disabled
                                        placeholder="Scan/Type in Full Specimen ID"
                                        style="font-size:1.3rem; width:200px"
                                    >
                                </td>

                                <td>${obj.deviationChkBox === true ? `
                                    <input 
                                        type="checkbox" 
                                        data-tube-label="${obj.specimenType}" 
                                        data-tube-color="${obj.tubeColor}"
                                        data-tube-type="${obj.tubeType}" 
                                        class="tube-deviated custom-checkbox-size" 
                                        ${tubeDeviated ? 'checked': ''} 
                                        disabled
                                        id="${obj.concept}Deviated"
                                    >`: ``}
                                </td>

                                <td>`
                                
                                    if(obj.deviationChkBox) {
                                        template += `
                                            <select 
                                                data-connect-id="${data.Connect_ID}" 
                                                id="${obj.concept}Deviation"
                                                style="width:300px"
                                                multiple
                                                disabled
                                            >
                                                <option value=""> -- Select Deviation -- </option>`

                                                deviationOptions.forEach(deviation => {
                                                    template += `<option ${formData[obj.concept]['248868659'][deviation.concept] === 353358909 ? 'selected' : ''} value=${deviation.concept}>${deviation.label}</option>`;
                                                })

                                        template += `</select>`  
                                    }

                                template += `
                                </td>

                                <td>${obj.deviationChkBox === true ? `
                                    <input 
                                        type="text" 
                                        placeholder="Details (Optional)" 
                                        id="${obj.concept}DeviatedExplanation" 
                                        ${formData[obj.concept]['536710547'] ? `value='${formData[`${obj.concept}`]['536710547']}'`: formData[obj.concept]['338286049'] ? `value='${formData[`${obj.concept}`]['338286049']}'` : ``}
                                        ${tubeCollected ? 'disabled': ''}
                                    >
                                    `: ``}
                                </td>

                                <td>${tubeCollected && !collectionFinalized ? `
                                    <button 
                                        class="btn btn-outline-primary" 
                                        type="button" 
                                        id="${obj.concept}collectEditBtn">
                                        Edit
                                    </button>` 
                                    : ``}
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
                    <button class="btn btn-outline-danger" type="button" id="backToSearch">Return to Search</button>
                </div>
                ${isCheckedIn ?
                `<div class="ml-auto">
                    <button class="btn btn-outline-primary text-nowrap" data-connect-id=${data.Connect_ID} type="button" id="collectionCheckout">Go to Check-Out</button>
                </div>` : ``}               
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="button" id="collectionSave">Save</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="button" id="collectionNext">Save and Review</button>
                </div>
            </div>
        </form>
    `;
    removeActiveClass('navbar-btn', 'active');
    const navBarBtn = document.getElementById('navBarTubeCollection');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');


    addEventBackToSearch('navBarSearch');
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventSelectAllCollection();
    addEventBackToSearch('backToSearch');
    addEventBiospecimenCollectionForm(data, formData);
    addEventBiospecimenCollectionFormToggles();
    addEventBiospecimenCollectionFormEdit();
    addEventBiospecimenCollectionFormEditAll();
    addEventBiospecimenCollectionFormText(data, formData);
    
    document.getElementById('collectionCheckout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const connectId = e.target.getAttribute('data-connect-id');
        try {
            let data = await findParticipant(`connectId=${connectId}`).then(res => res.data?.[0]);
            data = await verifyDefaultConcepts(data);
            checkInTemplate(data);
            document.body.scrollIntoView();
        } catch (error) {
            console.log("Error occured while trying to check out.");
        }
     });
}