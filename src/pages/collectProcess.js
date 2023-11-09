import { addEventSelectAllCollection, addEventBiospecimenCollectionForm, addEventBiospecimenCollectionFormToggles, addEventBackToSearch, addEventBiospecimenCollectionFormEdit, addEventBiospecimenCollectionFormEditAll, addEventBiospecimenCollectionFormText } from './../events.js'
import { removeActiveClass, generateBarCode, addEventBarCodeScanner, visitType, getSiteTubesLists, getWorkflow, getCheckedInVisit, findParticipant, checkedIn } from '../shared.js';
import { checkInTemplate } from './checkIn.js';
import { conceptIds } from '../fieldToConceptIdMapping.js';

export const tubeCollectedTemplate = (participantData, biospecimenData) => {
    const isCheckedIn = checkedIn(participantData);

    let template = `
        </br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row"><h5>${participantData[conceptIds.firstName]}, ${participantData[conceptIds.lastName]}</h5></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${biospecimenData[conceptIds.collection.id]}</div>
                <div class="row">Collection ID Link Date/Time: ${getWorkflow() === 'research' ? new Date(biospecimenData[conceptIds.collection.collectionTime]).toLocaleString(): new Date(biospecimenData[conceptIds.collection.scannedTime]).toLocaleString()}</div>
                ${getWorkflow() === 'research' ? `
                    <div class="row">
                        <div>Collection Phlebotomist Initials:&nbsp</div>
                        <input 
                            type="text"
                            ${biospecimenData[conceptIds.collection.phlebotomistInitials] ? `value=${biospecimenData[conceptIds.collection.phlebotomistInitials]}` : ``}
                            id="collectionInitials"
                            style="text-transform:uppercase"
                            onpaste="return false;"
                            required
                        /> 
                    </div>` 
                    
                    : ''
                }
            </div>
            ${biospecimenData[conceptIds.collection.selectedVisit] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType.filter(visit => visit.concept == biospecimenData[conceptIds.collection.selectedVisit])[0]?.visitType}
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
                            ${getWorkflow() === 'research' ? `<th class="align-left">Reason Not Collected</th>` : ''}
                            <th class="align-left">Scan Full Specimen ID</th> 
                            <th class="align-left">Select For Deviation</th>
                            <th class="align-left">Deviation Type</th> 
                            <th class="align-left">Comments</th>
                            <th><button class="btn btn-outline-primary" type="button" id="collectEditAllBtn">Edit All</button></th>
                        </tr>
                    </thead>
                    <tbody>`
                    
                    let siteTubesList = getSiteTubesLists(biospecimenData);
                    const collectionFinalized = (biospecimenData[conceptIds.collection.isFinalized] === conceptIds.yes);
                    
                    if(!siteTubesList || siteTubesList?.length === 0) siteTubesList = [];

                    siteTubesList?.forEach((obj, index) => {
                        const notCollectedOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].tubeNotCollectedOptions;
                        const deviationOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].deviationOptions;
                        const tubeCollected = (biospecimenData[obj.concept]?.[conceptIds.collection.tube.isCollected] === conceptIds.yes);
                        const tubeDeviated = (biospecimenData[obj.concept]?.[conceptIds.collection.tube.isDeviated] === conceptIds.yes);

                        let required = false;
                        if (biospecimenData[obj.concept]?.[conceptIds.collection.tube.isCollected] !== conceptIds.no) { 
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

                                if(getWorkflow() === 'research') {

                                    template += 
                                
                                        `<td>`

                                            if(notCollectedOptions) {
                                                template += `
                                                    <select 
                                                        data-connect-id="${participantData.Connect_ID}" 
                                                        id="${obj.concept}Reason"
                                                        class="reason-not-collected"
                                                        style="width:200px"
                                                        ${tubeCollected ? 'disabled' : ''}
                                                    >
                                                        <option value=""> -- Select Reason -- </option>`

                                                        notCollectedOptions.forEach(option => {
                                                            template += `<option ${biospecimenData[`${obj.concept}`]?.[conceptIds.collection.tube.selectReasonNotCollected] == option.concept ? 'selected' : ''} value=${option.concept}>${option.label}</option>`;
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
                                        ${biospecimenData[`${obj.concept}`] && biospecimenData[`${obj.concept}`]?.[conceptIds.collection.tube.scannedId] ? `value='${biospecimenData[`${obj.concept}`][conceptIds.collection.tube.scannedId]}'`: ``}
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
                                                data-connect-id="${participantData.Connect_ID}" 
                                                id="${obj.concept}Deviation"
                                                style="width:300px"
                                                multiple
                                                disabled
                                            >
                                                <option value=""> -- Select Deviation -- </option>`

                                                deviationOptions.forEach(deviation => {
                                                    template += `<option ${biospecimenData[obj.concept]?.[conceptIds.collection.tube.deviation][deviation.concept] === conceptIds.yes ? 'selected' : ''} value=${deviation.concept}>${deviation.label}</option>`;
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
                                        ${biospecimenData[obj.concept]?.[conceptIds.collection.tube.deviationComments] ? `value='${biospecimenData[`${obj.concept}`]?.[conceptIds.collection.tube.deviationComments]}'`: biospecimenData[obj.concept]?.[conceptIds.collection.tube.optionalNotCollectedDetails] ? `value='${biospecimenData[`${obj.concept}`]?.[conceptIds.collection.tube.optionalNotCollectedDetails]}'` : ``}
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
                    <textarea rows=3 class="form-control" id="collectionAdditionalNotes">${biospecimenData[conceptIds.collection.note] ? `${biospecimenData[conceptIds.collection.note]}`: ''}</textarea>
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col-auto">
                    <button class="btn btn-outline-danger" type="button" id="backToSearch">Return to Search</button>
                </div>
                ${isCheckedIn ?
                `<div class="ml-auto" style="display:none">
                    <button class="btn btn-outline-primary text-nowrap" data-connect-id=${participantData.Connect_ID} type="button" id="collectionCheckout">Go to Check-Out</button>
                </div>` : ``}               
                <div class="ml-auto">
                    <button class="btn btn-info" data-connect-id="${participantData.Connect_ID}" type="button" id="collectionSave">Save</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${participantData.Connect_ID}" type="button" id="collectionNext">Go to Review</button>
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
    generateBarCode('connectIdBarCode', participantData.Connect_ID);
    addEventSelectAllCollection();
    addEventBackToSearch('backToSearch');
    addEventBiospecimenCollectionForm(participantData, biospecimenData);
    addEventBiospecimenCollectionFormToggles();
    addEventBiospecimenCollectionFormEdit();
    addEventBiospecimenCollectionFormEditAll();
    addEventBiospecimenCollectionFormText(participantData, biospecimenData);
    
    document.getElementById('collectionCheckout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const connectId = e.target.getAttribute('data-connect-id');
        try {
            const participantData = await findParticipant(`connectId=${connectId}`).then(res => res.data?.[0]);
            checkInTemplate(participantData);
            document.body.scrollIntoView();
        } catch (error) {
            console.log("Error occured while trying to check out.");
        }
     });
}