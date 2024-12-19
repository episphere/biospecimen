import { removeActiveClass, generateBarCode, visitType, getSiteTubesLists, getWorkflow, updateSpecimen, appState, keyToNameObj, showNotifications } from "./../shared.js";
import { addEventReturnToCollectProcess } from "./../events.js";
import {searchTemplate} from "./dashboard.js";
import { collectionIdSearchScreenTemplate } from "./siteCollection/collectionIdSearch.js";
import { conceptIds } from "./../fieldToConceptIdMapping.js";

export const finalizeTemplate = (participantData, specimenData, bptlCollectionFlag) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarReview');
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');
    let template = '';

    template += `
        <div class="row">
        ${bptlCollectionFlag === true ? 
            `` : `<h5>Review Collection Data Entry</h5>`}
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row"><h5>${participantData[conceptIds.lastName] && participantData[conceptIds.lastName]}, ${participantData[conceptIds.firstName] && participantData[conceptIds.firstName]}</h5></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">
                    ${specimenData[conceptIds.collection.bloodAccessNumber] ? `Blood Accesion ID: ${specimenData[conceptIds.collection.bloodAccessNumber]}` : ''}
                </div>
                <div class="row">
                    ${specimenData[conceptIds.collection.urineAccessNumber] ? `Urine Accession ID: ${specimenData[conceptIds.collection.urineAccessNumber]}` : ''}
                </div>
                <div class="row">Collection ID: ${specimenData[conceptIds.collection.id]}</div>
                <div class="row">Collection ID Link Date/Time: ${getWorkflow() === 'research' ? new Date(specimenData[conceptIds.collection.collectionTime]).toLocaleString(): new Date(specimenData[conceptIds.collection.scannedTime]).toLocaleString()}</div>
                ${getWorkflow() === 'research' ? `
                ${bptlCollectionFlag === true ? 
                    `<div class="row">
                        <div>Collection Setting: Research</div>
                    </div>` : ``}
                    <div class="row">
                    <div>Collection Phlebotomist Initials: ${specimenData[conceptIds.collection.phlebotomistInitials] || ''}</div>
                    </div>` 
                    : `<div class="row">
                        ${bptlCollectionFlag === true ? `
                            <div>Collection Setting: Clinical</div>` : ``}
                    </div>
                    <div class="row">
                        <div>Initials of Team Member Completing Clincial Collection Data Entry: ${specimenData[conceptIds.collection.phlebotomistInitials] || ''}</div>
                    </div>`
                }
                ${bptlCollectionFlag === true ? `<div class="row"> Site: ${keyToNameObj[participantData[conceptIds.healthcareProvider]]} </div>` : ``}
            </div>
            ${specimenData[conceptIds.collection.selectedVisit] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType.filter(visit => visit.concept == specimenData[conceptIds.collection.selectedVisit])[0].visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <div class="row">
            <table id="finalizeTable" class="table-borderless collection-table">
                <thead style="margin-bottom: 1rem;">
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
                            if(specimenData[obj.concept][conceptIds.collection.tube.deviation][option.concept] === conceptIds.yes) deviationSelections.push(option.label);
                        });
                    }
                    template += `
                        <tr style="vertical-align: top;">
                            <td>${obj.specimenType}</td>
                            <td>${obj.collectionChkBox === true ? `${specimenData[`${obj.concept}`][conceptIds.collection.tube.isCollected] === conceptIds.yes ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}` : ``}</td>
                            ${getWorkflow() === 'research' ? `<td>${specimenData[`${obj.concept}`][conceptIds.collection.tube.selectReasonNotCollected] ? notCollectedOptions.filter(option => option.concept == specimenData[`${obj.concept}`][conceptIds.collection.tube.selectReasonNotCollected])[0].label : ''}</td>` : ''}
                            <td>${specimenData[`${obj.concept}`][conceptIds.collection.tube.isCollected] === conceptIds.yes && specimenData[`${obj.concept}`][conceptIds.collection.tube.scannedId] ? `${specimenData[`${obj.concept}`][conceptIds.collection.tube.scannedId]}` : '' }</td>
                            <td>${obj.deviationChkBox === true ? `${specimenData[`${obj.concept}`][conceptIds.collection.tube.isDeviated] === conceptIds.yes ? 'Yes' : 'No'}`: ``}</td>
                            <td class="deviation-type-width">${deviationSelections ? getDeviationSelections(deviationSelections) : ''}</td>
                            <td class="deviation-comments-width">${specimenData[`${obj.concept}`][conceptIds.collection.tube.deviationComments] ? specimenData[`${obj.concept}`][conceptIds.collection.tube.deviationComments] : specimenData[`${obj.concept}`][conceptIds.collection.tube.optionalNotCollectedDetails] ? specimenData[`${obj.concept}`][conceptIds.collection.tube.optionalNotCollectedDetails] : ''}</td>
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
                        <textarea rows=3 disabled class="form-control" id="finalizedAdditionalNotes">${specimenData[conceptIds.collection.note] ? `${specimenData[conceptIds.collection.note]}` : ''}</textarea>
                    </div>
                </div>
                </br>
                ${bptlCollectionFlag === true ? 
                    `<div class="form-group row">
                        <div class="col-auto">
                            <button class="btn btn-outline-danger" type="button" id="returnToSpecimenSearch">Return to Search</button>
                        </div>
                    </div>
                    ` :`<div class="form-group row">
                <div class="col-auto">
                    <button class="btn btn-outline-danger" type="button" data-connect-id="${participantData.Connect_ID}" id="returnToCollectProcess" data-master-specimen-id="${specimenData[conceptIds.collection.id]}">${getWorkflow() === 'research' ? 'Return to Collection Data Entry' : 'Return to Collection Data Entry'}</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${participantData.Connect_ID}" data-master-specimen-id="${specimenData[conceptIds.collection.id]}" type="button" id="finalizedSaveExit">Exit</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary modal-open" data-modal-id="modal1" data-connect-id="${participantData.Connect_ID}" data-master-specimen-id="${specimenData[conceptIds.collection.id]}" type="submit" id="finalizedContinue">Review Complete</button>
                </div>
            </div>`}
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
    generateBarCode('connectIdBarCode', participantData.Connect_ID);

    document.getElementById('finalizedSaveExit') && document.getElementById('finalizedSaveExit').addEventListener('click', () => {
        searchTemplate();
    });

    document.getElementById('returnToSpecimenSearch') && document.getElementById('returnToSpecimenSearch').addEventListener('click', () => {
        collectionIdSearchScreenTemplate(appState.getState().username);
    });

    document.getElementById('finalizeForm') && document.getElementById('finalizeForm').addEventListener('submit', (e) => { 
        e.preventDefault();
        const modalId = e.target.getAttribute('data-modal-id');
        openModal(modalId);
    });

    // If specimen has not been finalized, finalize it as normal.
    // Occasionally, a stray tube is found and an already-finalized collection gets updated. In this case, don't update the properties associated with finalizing.
    document.getElementById('finalizedConfirmButton') && document.getElementById('finalizedConfirmButton').addEventListener('click', async () => {
        try {
            const isPreviouslyFinalized = specimenData[conceptIds.collection.isFinalized] === conceptIds.yes;

            if (!isPreviouslyFinalized) {
                specimenData[conceptIds.collection.isFinalized] = conceptIds.yes;
                specimenData[conceptIds.collection.finalizedTime] = new Date().toISOString();
                specimenData[conceptIds.boxedStatus] = conceptIds.notBoxed;
                specimenData[conceptIds.strayTubesList] = [];
                await updateSpecimen([specimenData]);
            }
        } catch (e) {
            console.error(e);
            showNotifications({ title: 'Error finalizing specimen.', body: `There was an error finalizing this specimen. Please try again. ${e}` });
        }
    });

    document.querySelectorAll('#modal2 .modal-close').forEach(element => { 
        element.addEventListener('click', () => { 
            searchTemplate();
        });
    });

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

const getDeviationSelections = (deviationSelectionsList) => {
    let deviationsSelectionContent = "";
    deviationSelectionsList.forEach( (deviationSelection, index) => {
        deviationsSelectionContent += (index !== deviationSelectionsList.length - 1) ? `${deviationSelection}, <br>` : `${deviationSelection}`;
    })
    return deviationsSelectionContent;
}