import { removeActiveClass, generateBarCode, visitType, getSiteTubesLists, getWorkflow, getCheckedInVisit, updateSpecimen } from "./../shared.js";
import { addEventFinalizeForm, addEventFinalizeFormCntd, addEventReturnToCollectProcess } from "./../events.js";
import {searchTemplate} from "./dashboard.js";

export const finalizeTemplate = (data, specimenData) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarReview');
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');
    let template = '';

    template += `
        <div class="row">
            <h5>Review Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row"><h5>${data['996038075']}, ${data['399159511']}</h5></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${specimenData['820476880']}</div>
                <div class="row">Collection ID Link Date/Time: ${getWorkflow() === 'research' ? new Date(specimenData['678166505']).toLocaleString(): new Date(specimenData['915838974']).toLocaleString()}</div>
                ${getWorkflow() === 'research' ? `
                    <div class="row">
                        <div>Collection Phlebotomist Initials: ${specimenData['719427591'] || ''}</div>
                    </div>` 
                    
                    : ''
                }
            </div>
            ${specimenData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType.filter(visit => visit.concept == specimenData['331584571'])[0].visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <div class="row">
            <table id="finalizeTable" class="table-borderless collection-table">
                <thead>
                    <tr>
                        <th>Specimen Type</th>
                        ${getWorkflow() === 'clinical' ? `<th>Received</th>`:`<th>Collected</th>`}
                        ${getWorkflow() === 'research' ? `<th>Reason</th>` : ''}
                        <th>Full Specimen ID</th>
                        <th>Deviation</th>
                        <th>Deviation Type</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>`
                const siteTubesList = getSiteTubesLists(specimenData)
                siteTubesList.forEach((obj) => {

                    const notCollectedOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].tubeNotCollectedOptions;
                    let deviationSelections = [];

                    if(obj.deviationOptions) {
                        obj.deviationOptions.forEach(option => {
                            if(specimenData[obj.concept]['248868659'][option.concept] === 353358909) deviationSelections.push(option.label);
                        });
                    }

                    template += `
                        <tr>
                            <td>${obj.specimenType}</td>
                            <td>${obj.collectionChkBox === true ? `${specimenData[`${obj.concept}`]['593843561'] === 353358909 ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}` : ``}</td>
                            ${getWorkflow() === 'research' ? `<td>${specimenData[`${obj.concept}`]['883732523'] ? notCollectedOptions.filter(option => option.concept == specimenData[`${obj.concept}`]['883732523'])[0].label : ''}</td>` : ''}
                            <td>${specimenData[`${obj.concept}`]['593843561'] === 353358909 && specimenData[`${obj.concept}`]['825582494'] ? `${specimenData[`${obj.concept}`]['825582494']}` : '' }</td>
                            <td>${obj.deviationChkBox === true ? `${specimenData[`${obj.concept}`]['678857215'] === 353358909 ? 'Yes' : 'No'}`: ``}</td>
                            <td class="deviation-comments-width">${deviationSelections ? deviationSelections : ''}</td>
                            <td class="deviation-comments-width">${specimenData[`${obj.concept}`]['536710547'] ? specimenData[`${obj.concept}`]['536710547'] : specimenData[`${obj.concept}`]['338286049'] ? specimenData[`${obj.concept}`]['338286049'] : ''}</td>
                        </tr>
                    `
                });
                template +=`
                </tbody>
            </table>
            </br>
            <form id="finalizeForm" method="POST">
                <div class="form-group row">
                    <div class="col">
                        <label for="finalizedAdditionalNotes">Additional Notes (Optional)</label>
                        </br>
                        <textarea rows=3 disabled class="form-control" id="finalizedAdditionalNotes">${specimenData['338570265'] ? `${specimenData['338570265']}` : ''}</textarea>
                    </div>
                </div>
                </br>
                <div class="form-group row">
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" type="button" data-connect-id="${data.Connect_ID}" id="returnToCollectProcess" data-master-specimen-id="${specimenData['820476880']}">${getWorkflow() === 'research' ? 'Return to Collection Data Entry' : 'Return to Collection Data Entry'}</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['820476880']}" type="button" id="finalizedSaveExit">Exit</button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary modal-open" data-modal-id="modal1" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['820476880']}" type="submit" id="finalizedContinue">Review Complete</button>
                    </div>
                </div>
            </form>
            <div class="modal-wrapper" id="modal1">
                <div class="modal-dialog model-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title">Confirm
                        Collection</h5>
                    <button type="button" class="close modal-close"><span>&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                    Once “Confirm” is clicked, the collection data entered will be
                    finalized and will NOT be editable.
                    </div>
                    <div class="modal-footer">
                    <button type="button"
                        class="btn btn-outline-secondary modal-close">Close</button>
                    <button type="button" class="btn btn-outline-primary modal-open" id="finalizedConfirmButton" data-modal-id="modal2">Confirm</button>
                    </div>
                </div>
                </div>
            </div>
            <div class="modal-wrapper" id="modal2">
                <div class="modal-dialog model-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title">Specimen
                        Finalized</h5>
                        <button type="button" class="close modal-close"><span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                    Collection Finalized Successfully!
                    </div>
                    <div class="modal-footer">
                    <button type="button"
                        class="btn btn-outline-secondary modal-close" id="model2CloseButton" >Close</button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);

    document.getElementById('finalizedSaveExit').addEventListener('click', () => {
        searchTemplate();
    });

    document.getElementById('finalizeForm').addEventListener('submit', (e) => { 
        e.preventDefault();
        const modalId = e.target.getAttribute('data-modal-id');
        openModal(modalId);
    });

    document.getElementById('finalizedConfirmButton').addEventListener('click', async (e) => { 
        specimenData['410912345'] = 353358909;
        specimenData['556788178'] = new Date().toISOString();
        await updateSpecimen([specimenData]);
    });

    document.querySelectorAll('#modal2 .modal-close').forEach(element => { 
        element.addEventListener('click', () => { 
            searchTemplate();
        });
    });

    // addEventFinalizeForm(specimenData);
    // addEventFinalizeFormCntd(specimenData);
    addEventReturnToCollectProcess();
    document.querySelector('body').scrollIntoView(true);

    // Handle transition between modals:
    document.querySelectorAll('.modal-open').forEach((modalTrigger) => {
    modalTrigger.addEventListener('click', (clickEvent) => {
        const trigger = clickEvent.target;
        const modalId = trigger.getAttribute('data-modal-id');
        openModal(modalId);
    });
    });

    document.querySelectorAll('.modal-close').forEach((modalClose) => {
    modalClose.addEventListener('click', () => {
        closeModal();
    });
    });

    document.body.addEventListener('keyup', (keyEvent) => {
    if (keyEvent.key === 'Escape') {
        closeModal();
    }
    });

    let openedModalId = null;
    let openedModal = null;

    function openModal(modalId) {
        if (openedModalId === modalId) return;
        
        const modalWrapper = document.getElementById(modalId);
        if (modalWrapper) {
            closeModal();
            modalWrapper.classList.add('visible');
            openedModal = modalWrapper;
            openedModalId = modalId;
        }
        }
        
    function closeModal() {
        if (openedModal) {
            openedModal.classList.remove('visible');
            openedModal = null;
            openedModalId = null;
        }
    }  
}