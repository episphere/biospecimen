import {
    appState, performSearch, showAnimation, addBiospecimenUsers, getSpecimensByCollectionIds, hasObjectChanged, getAddedStrayTubes, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant,
    errorMessage, removeAllErrors, storeSpecimen, updateSpecimen, searchSpecimen, generateBarCode, updateBox,
    ship, disableInput, updateNewTempDate, getSiteTubesLists, getWorkflow, fixMissingTubeData,
    getSiteCouriers, getPage, getNumPages, removeSingleError, displayManifestContactInfo, checkShipForage, checkAlertState, retrieveDateFromIsoString,
    convertConceptIdToPackageCondition, checkFedexShipDuplicate, shippingDuplicateMessage, checkInParticipant, checkOutParticipant, getCheckedInVisit, participantCanCheckIn, shippingPrintManifestReminder,
    checkNonAlphanumericStr, shippingNonAlphaNumericStrMessage, visitType, getParticipantCollections, updateBaselineData,
    siteSpecificLocationToConceptId, conceptIdToSiteSpecificLocation, locationConceptIDToLocationMap, updateCollectionSettingData, convertToOldBox, translateNumToType,
    getCollectionsByVisit, getSpecimenAndParticipant, getUserProfile, checkDuplicateTrackingIdFromDb, checkAccessionId, checkSurveyEmailTrigger, checkDerivedVariables, isDeviceMobile, replaceDateInputWithMaskedInput, bagConceptIdList, showModalNotification, showTimedNotifications, showNotificationsCancelOrContinue, validateSpecimenAndParticipantResponse, findReplacementTubeLabels,
} from './shared.js';
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { showReportsManifest } from './pages/reportsQuery.js';
import { addNewBox, buildSpecimenDataInModal, createShippingModalBody, startShipping, generateBoxManifest, populateViewShippingBoxContentsList,
        renderShippingModalHeader, generateShippingManifest, finalShipmentTracking, populateModalSelect, prepareBoxToUpdate, processCheckedModalElements, shipmentTracking, updateBoxListModalUIValue } from './pages/shipping.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { additionalTubeIDRequirement, masterSpecimenIDRequirement, totalCollectionIDLength, workflows, specimenCollection, deviationReasons, refusedShippingDeviationConceptList} from './tubeValidation.js';
import { updateShippingStateAddBagToBox, updateShippingStateSelectedLocation } from './shippingState.js';
import { conceptIds, packageConditionConversion } from './fieldToConceptIdMapping.js';


export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
    if (!form) return;

    if (isDeviceMobile) {
      replaceDateInputWithMaskedInput(document.getElementById('dob'));
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value?.toLowerCase();
        const lastName = document.getElementById('lastName').value?.toLowerCase();
        const dobEl = document.getElementById('dob');
        let dob = dobEl.value;

        if (dob.length === 10) {
            if (isDeviceMobile) {
                // handle mobile device date input
                const [mm,dd,yyyy] = dob.split('/');
                dob = `${yyyy}${mm}${dd}`;
            } else { 
                // handle large screen date input
                const [yyyy,mm,dd] = dob.split('-');
                dob = `${yyyy}${mm}${dd}`;
            }
        } else if (dob.length>0) { 
            // todo: if the dob string is not valid, remind the user to enter a valid date
            return;
        }

        const params = new URLSearchParams()
        if (firstName) params.append('firstName', firstName);
        if (lastName) params.append('lastName', lastName);
        if (dob) params.append('dob', dob);
        
        if (params.size === 0) {
            showTimedNotifications({ title: 'Error', body: 'Please enter at least one field to search.' }, 10000, 1500);
            return;
        }

        performSearch(params.toString());
    })
};

export const addEventSearchForm2 = () => {
    const form = document.getElementById('search2');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        let query = '';
        if (email) query += `email=${email}`;
        performSearch(query);
    })
};

export const addEventSearchForm3 = () => {
    const form = document.getElementById('search3');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const phone = document.getElementById('phone').value.replaceAll("-", "");
        let query = '';
        if (phone) query += `phone=${phone}`;
        performSearch(query);
    })
};

export const addEventSearchForm4 = () => {
    const form = document.getElementById('search4');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const connectId = document.getElementById('connectId').value;
        let query = '';
        if (connectId) query += `connectId=${connectId}`;
        performSearch(query);
    })
};

export const addEventClearAll = () => {

    const btnClearAll = document.getElementById('btnClearAll');

    btnClearAll.addEventListener('click', () => {

        const firstName = document.getElementById('firstName');
        if(firstName) firstName.value = '';

        const lastName = document.getElementById('lastName');
        if(lastName) lastName.value = '';

        const dob = document.getElementById('dob');
        if(dob) dob.value = '';

        const connectID = document.getElementById('connectId');
        if(connectID) connectID.value = '';

        const email = document.getElementById('email');
        if(email) email.value = '';

        const phone = document.getElementById('phone');
        if(phone) phone.value = '';
    });
};


export const addEventSearchSpecimen = () => {
    const form = document.getElementById('specimenLookupForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        try {
            removeAllErrors();
            const collectionIdSearchEle = document.getElementById('masterSpecimenId');
            if (!collectionIdSearchEle) {
                errorMessage('masterSpecimenId', 'Please enter a collection ID.', true);
                return;
            }

            const collectionId = collectionIdSearchEle.value.toUpperCase().trim().substring(0, masterSpecimenIDRequirement.length);
            if (!masterSpecimenIDRequirement.regExp.test(collectionId)) {
                errorMessage('masterSpecimenId', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, true);
                return;
            }

            const { specimenData, participantData } = await getSpecimenAndParticipant(collectionId);
            if (validateSpecimenAndParticipantResponse(specimenData, participantData)) {
                tubeCollectedTemplate(participantData, specimenData);
            }
        } catch (error) {
            console.error("Error searching for specimen: ", error.message);
            showNotifications({ title: 'Error in Collection ID Search', body: `Error retrieving specimen. ${error.message}` });
        }
    });
}

// Add specimen to box using the allBoxesList from state.
// Return early if (1) no shipping location selected, (2) if the input is empty, (3) if item is already shipped, (4) if item is already in a box.
export const addEventAddSpecimenToBox = (currBoxId) => {
    const form = document.getElementById('addSpecimenForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const masterSpecimenIdInput = document.getElementById('masterSpecimenId');
        if (!masterSpecimenIdInput) return;
        const masterSpecimenId = masterSpecimenIdInput.value.toUpperCase().trim();

        const shippingLocationValue = document.getElementById('selectLocationList').value;
        if(shippingLocationValue === 'none') {
            showNotifications({ title: 'Shipping Location Not Selected', body: 'Please select a shipping location from the dropdown.' });
            return;
        }
        if (masterSpecimenId === '') {
            showNotifications({ title: 'Empty Entry or Scan', body: 'Please enter or scan a specimen bag ID or Full Specimen ID.' });
            return;
        }

        const allBoxesList = appState.getState().allBoxesList; 

        // Find the masterSpecimenId in available collections. Else, show a notification and return early.
        const canAddSpecimen = searchAvailableCollectionsForSpecimen(masterSpecimenId);

        if (!canAddSpecimen) {
            // Check if the scanned id is already in an unshipped box. If not, check if the scanned id is already shipped. Show a notification and return early.
            const scannedIdInUnshippedBoxes = findScannedIdInUnshippedBoxes(allBoxesList, masterSpecimenId);
            const isScannedIdInUnshippedBoxes = scannedIdInUnshippedBoxes['foundMatch'];
            if (isScannedIdInUnshippedBoxes) {
                const boxNum = scannedIdInUnshippedBoxes[conceptIds.shippingBoxId];
                const siteSpecificLocation = conceptIdToSiteSpecificLocation[scannedIdInUnshippedBoxes[conceptIds.shippingLocation]];
                const siteSpecificLocationName = siteSpecificLocation || '';
                const scannedInput = scannedIdInUnshippedBoxes['inputScanned'];
                showNotifications({ title:`${scannedInput} has already been recorded`, body: `${scannedInput} is recorded as being in ${boxNum} in ${siteSpecificLocationName}`});
                return;
            } else {
                const foundScannedIdShipped = await isScannedIdShipped(allBoxesList, masterSpecimenId);
                if (foundScannedIdShipped){
                    showNotifications({ title:'Item reported as already shipped', body: 'Please enter or scan another specimen bag ID or Full Specimen ID.'});
                    return;
                }
            }
        }

        const specimenTablesResult = buildSpecimenDataInModal(masterSpecimenId);
        const biospecimensList = specimenTablesResult.biospecimensList;

        if (biospecimensList.length === 0) {
            showNotifications({ title: 'Item not found', body: `Item not reported as collected or item is in an existing available collection. If item doesn't have a matching Specimen Bag ID in available collections, go to the Collection Dashboard to add specimen.` });
            return;
        } else {
            document.getElementById('submitMasterSpecimenId').click();
        }
    });

    addEventSubmitSpecimenBuildModal(currBoxId);
}

const addEventSubmitSpecimenBuildModal = (currBoxId) => {
    const submitButtonSpecimen = document.getElementById('submitMasterSpecimenId');
    submitButtonSpecimen.addEventListener('click', async e => {
        e.preventDefault();
        renderShippingModalHeader();
        
        const masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase().trim();
        const specimenTablesResult = buildSpecimenDataInModal(masterSpecimenId);
        const foundInOrphan = specimenTablesResult.foundInOrphan;
        const biospecimensList = specimenTablesResult.biospecimensList;
        const tableIndex = specimenTablesResult.tableIndex;

        if (biospecimensList.length === 0) {
            showNotifications({ title: 'Not found', body: 'The specimen with entered search criteria was not found!' });
            hideAnimation();
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(500);
            document.getElementById('shippingCloseButton').click();
            return;
        }

        createShippingModalBody(biospecimensList, masterSpecimenId, foundInOrphan);
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex, foundInOrphan);
        addEventCancelAddSpecimenToListModalButton(currBoxId);
    })
}

/**
 * Handle the cancel button click event in the modal.
 * This refresh clears existing event listeners (duplicates existed prior to this handler).
 * @param {String} currBoxId - the current box id in the shipping dashboard
 */
export const addEventCancelAddSpecimenToListModalButton = (currBoxId) => {
    const cancelButton = document.getElementById('shippingModalCancel');
    cancelButton && cancelButton.addEventListener('click', () => {
        document.getElementById('shippingCloseButton').click();
        startShipping(appState.getState().userName, true, currBoxId);
    });
}

export const addEventAddSpecimensToListModalButton = (bagId, tableIndex, isOrphan) => {
    const submitButton = document.getElementById('addToBoxButton');
    submitButton && submitButton.addEventListener('click', async e => {
        e.preventDefault();

        const boxList = appState.getState().allBoxesList;
        const locations = {};
        let boxIdAndBagsObj = {};
        for (let i = 0; i < boxList.length; i++) {
            const box = boxList[i];
            if (!box['bags']) box['bags'] = {};
            boxIdAndBagsObj[box[conceptIds.shippingBoxId]] = box['bags'];
            locations[box[conceptIds.shippingBoxId]] = box[conceptIds.shippingLocation];
        }

        const currBoxId = updateBoxListModalUIValue();
        boxIdAndBagsObj = processCheckedModalElements(boxIdAndBagsObj, bagId, currBoxId, isOrphan, tableIndex);

        const addedTubes = isOrphan
            ? [boxIdAndBagsObj[currBoxId]['unlabelled'].arrElements.find(tubeId => tubeId === bagId)].filter(Boolean)
            : boxIdAndBagsObj[currBoxId][bagId].arrElements || [];

        if (boxIdAndBagsObj.hasOwnProperty(currBoxId) && addedTubes.length > 0) {
            const labeledBagCount = Object.keys(boxIdAndBagsObj[currBoxId]).filter(key => key !== 'unlabelled' && key !== 'undefined').length ?? 0; // Labeled bags: Keys in boxIdAndBagsObj[currBoxId].
            const unlabeledBagCount = boxIdAndBagsObj[currBoxId]?.['unlabelled']?.['arrElements']?.length ?? 0; // Unlabeled bags: Hold stray tubes. Each is a separate bag.
            const bagCount = labeledBagCount + unlabeledBagCount;

            const canAddBag = checkBagCount(bagCount, bagId, currBoxId);
            if (!canAddBag) return;

            const boxToUpdate = prepareBoxToUpdate(currBoxId, boxList, boxIdAndBagsObj, locations, addedTubes);
            showAnimation();
            try {
                const boxUpdateResponse = await updateBox(boxToUpdate);
                hideAnimation();
                if (boxUpdateResponse.code === 200) {
                    updateShippingStateAddBagToBox(currBoxId, bagId, boxToUpdate, boxUpdateResponse.data);
                    await startShipping(appState.getState().userName, true, currBoxId);
                } else {
                    console.error('Failed to update box.', boxUpdateResponse);
                    showNotifications({ title: 'Error Adding Specimen(s)', body: `There was an error adding ${bagId.split(' ')[0]}. Please try again.` });
                }
            } catch (error) {
                hideAnimation();
                console.error('Failed to update box.', error);
                showNotifications({ title: 'Error Adding Specimen(s)', body: `There was an error adding ${bagId.split(' ')[0]}. Please try again.` });
            }
        }
    }, { once: true })
}

const checkBagCount = (bagCount, bagId, currBoxId) => {
    const maxBoxSize = bagConceptIdList.length;
    const timeToAlert = maxBoxSize - 3;
    const boxNumber = currBoxId.substring(3);
    const remainingBagCount = maxBoxSize - bagCount;
    const bagText = remainingBagCount !== 1 ? 'bags' : 'bag';

    if (bagCount < timeToAlert) {
        return true;
    } else if (bagCount >= timeToAlert && bagCount < maxBoxSize) {
        showNotifications({ title: 'Bag Added. Attention: This box is almost full.', body: `${bagId} has been added to box ${boxNumber}. Box ${boxNumber} is almost full. This box can accept ${remainingBagCount} more ${bagText}.` });
        return true;
    } else if (bagCount === maxBoxSize) {
        showNotifications({ title: 'Bag Added. Attention: This box is now full.', body: `${bagId} has been added to box ${boxNumber}. Box ${boxNumber} is now full. Please select another box or create a new box if you have more bags to pack.` });
        return true;
    } else {
        showNotifications({ title: `ERROR: Bag not added. Box ${boxNumber} is full.`, body: `${bagId} has NOT been added. Box ${boxNumber} is already full. Please select another box or create a new box for any remaining bags to pack.` });
        return false;
    }
}

/**
 * Location selection event listener.
 * Remove the listener then add is back. This makes sure it is only added once.
 * @param {string} elemId - the id of the element getting the event listener.
 * @param {*} pageAndElement - the page and element to store in local storage
 */
export const addEventLocationSelect = (elemId, pageAndElement) => {
    const selectionChangeHandler = (event) => {
        const selection = event.target.value;
        const prevSelections = JSON.parse(localStorage.getItem('selections'));
        localStorage.setItem('selections', JSON.stringify({...prevSelections, [pageAndElement] : selection}));
        if (selection) {
            updateShippingStateSelectedLocation(selection);
            const detailedLocationBoxes = appState.getState().detailedLocationBoxes;
            const locationBoxIds = Object.keys(detailedLocationBoxes).length > 0 ? Object.keys(detailedLocationBoxes).sort() : [''];
            const selectedBoxId = document.getElementById('selectBoxList').value;
            const currBoxId = (selectedBoxId && locationBoxIds.includes(selectedBoxId)) ? selectedBoxId : locationBoxIds[0];

            startShipping(appState.getState().userName, true, currBoxId);
        }
    };

    const element = document.getElementById(elemId);
    if (element) {
        element.removeEventListener("change", selectionChangeHandler);
        element.addEventListener("change", selectionChangeHandler);
    }
}

export const compareBoxIds = (a, b) => {
    return parseInt(a.substring(3), 10) - parseInt(b.substring(3), 10);
}

// Handle new box creation in the shipping modal.
export const addEventModalAddBox = () => {
    const boxButton = document.getElementById('modalAddBoxButton');
    const createBoxSuccessAlertEle = document.getElementById("create-box-success");
    const createBoxErrorAlertEle = document.getElementById("create-box-error");
    boxButton.addEventListener('click', async () => {
        // Check whether a box is being added. If so, return.
        if (document.body.getAttribute('data-adding-box')) return;
        document.body.setAttribute('data-adding-box', 'true');
        
        showAnimation();
        const isCreateBoxSuccess = await addNewBox();
        hideAnimation();

        const detailedLocationBoxes = appState.getState().detailedLocationBoxes;
        const boxIdsArray = Object.keys(detailedLocationBoxes).sort(compareBoxIds);
        populateModalSelect(detailedLocationBoxes);
        populateViewShippingBoxContentsList(boxIdsArray[boxIdsArray.length - 1]);
        checkAlertState(isCreateBoxSuccess, createBoxSuccessAlertEle, createBoxErrorAlertEle)
        // reset alertState
        document.body.removeAttribute('data-adding-box');
    });
}

// Handle changes to the selected boxId in the 'View Shipping Box Contents' section
export const addEventBoxSelectListChanged = () => {
    const selectBoxList = document.getElementById('selectBoxList');
    selectBoxList.addEventListener("change", () => {
        const selectedBoxId = document.getElementById('selectBoxList').value;
        populateViewShippingBoxContentsList(selectedBoxId);
    });
}

export const addEventBackToSearch = (id) => {
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        searchTemplate();
    });
};

export const addEventCheckOutComplete = (specimenData) => {
    const btn = document.getElementById('checkOutExit');
    btn.addEventListener('click', async () => {
        specimenData['420757389'] = 353358909;
        specimenData['343048998'] = new Date().toISOString();
        showAnimation();
        await updateSpecimen([specimenData]);
        hideAnimation();
        searchTemplate();
    })
}

export const addEventHideNotification = (element) => {
    const hideNotification = element.querySelectorAll('.hideNotification');
    Array.from(hideNotification).forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentNode.parentNode.parentNode.parentNode.removeChild(btn.parentNode.parentNode.parentNode);
        });
        setTimeout(() => { btn.dispatchEvent(new Event('click')) }, 8000);
    });
}

export const addEventModalBtn = (role, userEmail) => {
    const btn = document.getElementById("modalBtn");
    btn.addEventListener('click', () => {
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `<h5 class="modal-title">Add user</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>`;

        body.innerHTML = `
            <form id="addNewUser" method="POST">
                <div class="form-group">
                    <label class="col-form-label search-label">Name</label>
                    <input class="form-control" required type="name" autocomplete="off" id="userName" placeholder="Enter name"/>
                </div>
                <div class="form-group">
                    <label class="col-form-label search-label">Email</label>
                    <input class="form-control" required autocomplete="off" type="email" autocomplete="off" id="userEmail" placeholder="Enter name"/>
                </div>
                <div class="form-group">
                    <label class="col-form-label search-label">Role</label>
                    <select class="form-control" required id="userRole">
                        <option value="">-- Select role --</option>
                        ${role === 'admin' ? `
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                        ` : `
                            <option value="user">User</option>
                        `}
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-outline-primary">Add</button>
                </div>
            </form>
        `;
        addEventNewUserForm(userEmail);
    })
};

const addEventNewUserForm = (userEmail) => {
    const form = document.getElementById('addNewUser');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const array = [];
        let data = {};
        data['name'] = document.getElementById('userName').value;
        data['email'] = document.getElementById('userEmail').value;
        data['role'] = document.getElementById('userRole').value;
        array.push(data)
        showAnimation();
        const response = await addBiospecimenUsers(array);
        if (response.code === 200) {
            showNotifications({ title: 'New user added!', body: `<b>${data.email}</b> is added as <b>${data.role}</b>` });
            form.reset();
            const users = await biospecimenUsers();
            hideAnimation();
            if (users.code === 200 && users.data.users.length > 0) {
                document.getElementById('usersList').innerHTML = userListTemplate(users.data.users, userEmail);
                addEventRemoveUser();
            }
        }
        else if (response.code === 400 && response.message === 'User with this email already exists') {
            hideAnimation();
            showNotifications({ title: 'User already exists!', body: `User with email: <b>${data.email}</b> already exists` });
        }
    })
}

export const addEventRemoveUser = () => {
    const elements = document.getElementsByClassName('fa-user-minus');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', async () => {
            const email = element.dataset.email;
            showAnimation();
            const response = await removeBiospecimenUsers(email);
            hideAnimation();
            if (response.code === 200) {
                element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
                showNotifications({ title: 'User removed!', body: `User with email <b>${email}</b> is removed.` });
            }
        })
    })
}

export const addGoToCheckInEvent = () => {
    const handler = (uid) => async (_event) => {
        try {
            showAnimation();

            let data = await getUserProfile(uid).then(
                (res) => res.data
            );

            checkInTemplate(data);
        } catch (error) {
            console.error("Error checking in participant: ", error);
        } finally {
            hideAnimation();
        }
    };

    const checkInButtons = document.querySelectorAll(
        `[data-check-in-btn-connect-id]`
    );

    Array.from(checkInButtons).forEach((btn) => {
        btn.addEventListener("click", handler(btn.dataset.checkInBtnUid));
    });
};

export const addGoToSpecimenLinkEvent = () => {
    const specimenLinkButtons = document.querySelectorAll('button[data-specimen-link-connect-id]');
    for (const btn of specimenLinkButtons) {
        btn.addEventListener('click', async () => {
        let query = `connectId=${parseInt(btn.dataset.specimenLinkConnectId)}`;
        const response = await findParticipant(query);
        const data = response.data[0];

        specimenTemplate(data);
        });
    }
};

export const addEventCheckInCompleteForm = (isCheckedIn, checkOutFlag) => {
    const form = document.getElementById('checkInCompleteForm');
    form && form.addEventListener('submit', async e => {
        e.preventDefault();
        try {
            const btnCheckIn = document.getElementById('checkInComplete');
            btnCheckIn.disabled = true;
            
            let query = `connectId=${parseInt(form.dataset.connectId)}`;
            
            const response = await findParticipant(query);
            const data = response.data[0];
            console.log("🚀 ~ addEventCheckInCompleteForm ~ data:", data)

            if (isCheckedIn) {
                showAnimation();
                await checkOutParticipant(data);
                hideAnimation();
                showTimedNotifications({ title: 'Success', body: 'Participant is checked out.' }, 100000, 1500);
                setTimeout(() => {
                    const closeButton = document.querySelector('#biospecimenModal .btn[data-dismiss="modal"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                    checkOutFlag === true ? location.reload() : goToParticipantSearch(); 
                }, 1500);
            } else {
                const visitConcept = document.getElementById('visit-select').value;
                
                const isClinicalUrineOrBloodCollected = checkClinicalBloodOrUrineCollected(data)

                if (isClinicalUrineOrBloodCollected) return;


                for (const visit of visitType) {
                    if (data[conceptIds.collection.selectedVisit] && data[conceptIds.collection.selectedVisit][visit.concept]) {
                        const visitTime = new Date(data[conceptIds.collection.selectedVisit][visit.concept][conceptIds.checkInDateTime]);
                        const now = new Date();
                        if (now.getYear() == visitTime.getYear() && now.getMonth() == visitTime.getMonth() && now.getDate() == visitTime.getDate()) {
                            const response = await getParticipantCollections(data.token);
                            console.log("🚀 ~ addEventCheckInCompleteForm ~ response:", response)
                            let collection = response.data.filter(res => res[conceptIds.collection.selectedVisit] == visit.concept);
                            if (collection.length === 0) continue;
                            const confirmContinueCheckIn = await handleCheckInWarning(visit, data, collection);
                            if (!confirmContinueCheckIn) return;
                        }
                    }
                }
    
                // await handleCheckInModal(data, visitConcept, query);
            }
        } catch (error) {
            const bodyMessage = isCheckedIn ? 'There was an error checking out the participant. Please try again.' : 'There was an error checking in the participant. Please try again.';
            showNotifications({ title: 'Error', body: bodyMessage });
        }
    });
};

/**
 * Checks if the participant has a clinical blood or urine collected and any specimen collected at Regional. If participant has clinical blood or urine collected, show a notification and return true.
 * @param {Object} data - participant data
 * @returns {Boolean} - true if participant has any clinical blood or urine collected, false otherwise
*/
const checkClinicalBloodOrUrineCollected = (data) => {
    const isBloodOrUrineCollected = data?.[conceptIds.collectionDetails]?.[conceptIds.baseline.visitId]?.[conceptIds.clinicalBloodOrUrineCollected];
    const anySpecimenCollectedRRL = data?.[conceptIds.collectionDetails]?.[conceptIds.baseline.visitId]?.[conceptIds.anySpecimenCollected];

    if (isBloodOrUrineCollected === conceptIds.yes && anySpecimenCollectedRRL === conceptIds.yes) { 
        const bodyMessage = 'Check In not allowed, participant already has clinical collection for this timepoint.'
        showNotifications({ title: 'Check In Error', body: bodyMessage });
        return true;
    }
    return false;
}

const handleCheckInWarning = async (visit, data, collection) => {
    const message = {
        title: "Warning - Participant Previously Checked In",
        body: "Participant " + data[conceptIds.firstName] + " " + data[conceptIds.lastName] + " was previously checked in on " + 
            new Date(data[conceptIds.collection.selectedVisit][visit.concept][conceptIds.checkInDateTime]).toLocaleString() +
            " with Collection ID " + collection[0][conceptIds.collection.id] +
            ".\r\nIf this is today, DO NOT check the participant in again.\r\nNote Collection ID above and see Check-In SOP for further instructions.\r\n\r\n" +
            "If this is not today, you may check the participant in for an additional visit.",
        continueButtonText: "Continue with Check-In",
    };

    const onCancel = () => { return false };
    const onContinue = async () => { return true };

    const userConfirmed = await new Promise((resolve) => {
        showNotificationsCancelOrContinue(message, null, () => resolve(onCancel()), () => resolve(onContinue()));
    });

    return userConfirmed;
}

const handleCheckInModal = async (data, visitConcept, query) => {
    await checkInParticipant(data, visitConcept);

    const checkInMessage = {
        title: "Success",
        body: "Participant is checked in.",
        continueButtonText: "Continue to Specimen Link",
    };

    const checkInOnCancel = () => {  };
    const checkInOnContinue = async () => {
        try {
            const updatedResponse = await findParticipant(query);
            const updatedData = updatedResponse.data[0];
    
            specimenTemplate(updatedData);
        } catch (error) {
            showNotifications({ title: 'Error', body: 'There was an error checking in the participant. Please try again.' });
        }
    };

    showNotificationsCancelOrContinue(checkInMessage, 10000, checkInOnCancel, checkInOnContinue);
}

export const addEventVisitSelection = () => {

    const visitSelection = document.getElementById('visit-select');
    if(visitSelection) {
        visitSelection.addEventListener('change', async () => {

            const checkInButton = document.getElementById('checkInComplete');
            
            // This should only apply to users who have not revoked their participation
            const form = document.getElementById('checkInCompleteForm');
            let query = `connectId=${parseInt(form.dataset.connectId)}`;
            
            const response = await findParticipant(query);
            const data = response.data[0];
            let canCheckIn = participantCanCheckIn(data);
            if(canCheckIn) {
                checkInButton.disabled = !visitSelection.value;
            }
        });
    }
}

export const goToParticipantSearch = () => {
    document.getElementById('navBarSearch').click();
}

export const addEventSpecimenLinkForm = (formData) => {
    const form = document.getElementById('researchSpecimenContinue');
    const connectId = document.getElementById('researchSpecimenContinue').dataset.connectId;
    // Note: Can use this connectId value to get related biospecimen documents

    if (document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;

    form.addEventListener('click', async (e) => {
        e.preventDefault();
        const collections = await getCollectionsByVisit(formData);
        console.log("🚀 ~ form.addEventListener ~ collections:", collections, "--", "formData:", formData)
        if (collections.length) {
            existingCollectionAlert(collections, connectId, formData);
        } else {
            btnsClicked(connectId, formData);

        }
    });
};

export const addEventClinicalSpecimenLinkForm = (formData) => {
    const form = document.getElementById('clinicalSpecimenContinue');
    form.addEventListener('click', async (e) => {
        e.preventDefault();
        clinicalBtnsClicked(formData);
    });
};

export const addEventClinicalSpecimenLinkForm2 = (formData) => {
    const form = document.getElementById('clinicalSpecimenContinueTwo');
    const connectId = form.dataset.connectId;
    
    form.addEventListener('click', async (e) => {
        e.preventDefault();
        btnsClicked(connectId, formData);
    });
};

const existingCollectionAlert = async (collections, connectId, formData) => {
     const existingCollection = () => {
         const title = 'Warning';
         const body = `<div class="row"><div class="col">The Following ${collections.length} Collection ID(s) already exist for this participant: 
         ${collections.map(collection => collection['820476880']).join(', ')}</div></div>`;
         const closeButtonName = 'Close';
         const continueButtonName = 'Add New Collection';
         const continueAction = async () => {
             btnsClicked(connectId, formData);   
         };
       
         showModalNotification(title, body, closeButtonName, continueButtonName, continueAction);
       };
       
       existingCollection();
 
 }

// todo: this function handles tangled situations. Needs to be refactored
/**
 * Handles events after collection ID is scanned and "Submit" is clicked
 * @param {string} connectId 
 * @param {*} formData 
 */
const btnsClicked = async (connectId, formData) => { 
    console.log("🚀 ~ btnsClicked ~ connectId, formData:", connectId, formData)
    removeAllErrors();

    let scanSpecimenID = document.getElementById('scanSpecimenID')?.value && document.getElementById('scanSpecimenID')?.value.toUpperCase();

    if(scanSpecimenID && scanSpecimenID.length > masterSpecimenIDRequirement.length) scanSpecimenID = scanSpecimenID.substring(0, masterSpecimenIDRequirement.length);

    const scanSpecimenID2 = document.getElementById('scanSpecimenID2')?.value && document.getElementById('scanSpecimenID2')?.value.toUpperCase();
    const collectionLocation = document.getElementById('collectionLocation');

    let hasError = false;
    let focus = true;

    if (!scanSpecimenID && !scanSpecimenID2 && !formData?.collectionId) {
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Scan Collection ID or Type in Manually', focus, true);
        focus = false;
        errorMessage('scanSpecimenID2', 'Please Scan Collection ID or Type in Manually', focus, true);
    } else if (scanSpecimenID !== scanSpecimenID2 && !formData?.collectionId) {
        hasError = true;
        errorMessage('scanSpecimenID2', 'Entered Collection ID doesn\'t match.', focus, true);
    } else if (scanSpecimenID && scanSpecimenID2) {
        if (!masterSpecimenIDRequirement.regExp.test(scanSpecimenID) || scanSpecimenID.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('scanSpecimenID', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, focus, true);
            focus = false;
        }
    }

    if (collectionLocation && collectionLocation.value === 'none') {
        hasError = true;
        errorMessage('collectionLocation', `Please Select Collection Location.`, focus, true);
        focus = false;
    }

    if (hasError) return;

    if (collectionLocation) formData[conceptIds.collectionLocation] = parseInt(collectionLocation.value);

    const collectionID = formData?.collectionId || scanSpecimenID;
    const firstNameCidString = conceptIds.firstName.toString();
    const firstName = document.getElementById(firstNameCidString).innerText || ""


    const confirmVal = await showConfirmationModal(collectionID, firstName);

    if (confirmVal === "cancel") return;

    formData[conceptIds.collection.id] = collectionID;
    formData[conceptIds.collection.collectionSetting] = getWorkflow() === 'research' ? conceptIds.research : conceptIds.clinical;
    formData['Connect_ID'] = parseInt(document.getElementById('specimenLinkForm').dataset.connectId);
    formData['token'] = document.getElementById('specimenLinkForm').dataset.participantToken;
    
    let query = `connectId=${parseInt(connectId)}`;

    showAnimation();
    const response = await findParticipant(query);
    const particpantData = response.data[0];
    let specimenData;
    
    if (!formData?.collectionId) {
        specimenData = (await searchSpecimen(formData[conceptIds.collection.id])).data;
        
    }
    hideAnimation();
    console.log("🚀 ~ btnsClicked ~ specimenData:", specimenData)
    if (specimenData?.Connect_ID && parseInt(specimenData.Connect_ID) !== particpantData.Connect_ID) {
        showNotifications({ title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different Connect ID.' })
        return;
    }

    showAnimation();
    formData[conceptIds.collection.selectedVisit] = formData?.[conceptIds.collection.selectedVisit] || parseInt(getCheckedInVisit(particpantData));
    console.log("🚀 ~ btnsClicked ~ parseInt(getCheckedInVisit(particpantData)):", parseInt(getCheckedInVisit(particpantData)))
    console.log("____")
    console.log("🚀 ~ btnsClicked ~ formData?.[conceptIds.collection.selectedVisit]:", formData?.[conceptIds.collection.selectedVisit])
    
    
    if (!formData?.collectionId) {
        console.log("Form data to be added:", formData);
        const storeResponse = await storeSpecimen([formData]);  
        if (storeResponse.code === 400) {
            hideAnimation();
            showNotifications({ title: 'Specimen already exists!', body: `Collection ID ${collectionID} is already associated with a different Connect ID` });
            return;
        }
    }

    const biospecimenData = (await searchSpecimen(formData?.collectionId || formData[conceptIds.collection.id])).data;
    await createTubesForCollection(formData, biospecimenData);
    
    // if 'clinical' and no existing collection ID, check email trigger
    if (formData[conceptIds.collection.collectionSetting] === conceptIds.clinical && !formData?.collectionId) {
        await checkSurveyEmailTrigger(particpantData, formData[conceptIds.collection.selectedVisit]);
    }

    hideAnimation();
    if (formData?.collectionId || confirmVal == "confirmed") {
        tubeCollectedTemplate(particpantData, biospecimenData);

    } else {
        searchTemplate();
    }
}
    

const showConfirmationModal = async (collectionID, firstName) => {
    return new Promise((resolve) => {
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('modal', 'fade');
        modalContainer.id = 'confirmationModal';
        modalContainer.tabIndex = '-1';
        modalContainer.role = 'dialog';
        modalContainer.setAttribute('aria-labelledby', 'exampleModalCenterTitle');
        modalContainer.setAttribute('aria-hidden', 'true');
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-dialog', 'modal-dialog-centered');
        modalContent.setAttribute('role', 'document');

        const modalBody = `
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Collection ID</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Collection ID: ${collectionID}</p>
                    <p>Confirm ID is correct for participant: ${firstName}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" data-result="cancel">Cancel</button>
                    <button type="button" class="btn btn-info" data-result="back" data-dismiss="modal">Confirm and Exit</button>
                    <button type="button" class="btn btn-success" data-result="confirmed" data-dismiss="modal">Confirm and Continue</button>
                </div>
            </div>
        `;

        modalContent.innerHTML = modalBody;
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);

        modalContainer.classList.add('show');
        modalContainer.style.display = 'block';
        modalContainer.addEventListener('click', (event) => {
            const result = event.target.getAttribute('data-result');
            if (result) 
            {
                document.body.removeChild(modalContainer);
                resolve(result);
            }
        });
    });
};


/**
 * Check accession number inputs after clicking 'Submit' button
 * @param {*} formData 
 */
const clinicalBtnsClicked = async (formData) => { 

    removeAllErrors();
    const connectId = document.getElementById('clinicalSpecimenContinue').dataset.connectId;
    const participantName = document.getElementById('clinicalSpecimenContinue').dataset.participantName;

    const accessionID1 = document.getElementById('accessionID1');
    const accessionID2 = document.getElementById('accessionID2');
    const accessionID3 = document.getElementById('accessionID3');
    const accessionID4 = document.getElementById('accessionID4');
    const selectedVisit = document.getElementById('visit-select').value;
    
    let hasError = false;
    let focus = true;

    if (accessionID1 && !accessionID1.value && accessionID3 && !accessionID3.value) {
        hasError = true;
        errorMessage('accessionID1', 'Please type Blood/Urine Accession ID from tube.', focus, true);
        focus = false;
    }
    else if (accessionID1 && accessionID1.value && !accessionID2.value && !accessionID2.classList.contains('disabled')) {
        hasError = true;
        errorMessage('accessionID2', 'Please re-type Blood Accession ID from tube.', focus, true);
        focus = false;
    }
    else if (accessionID1 && accessionID1.value && accessionID2.value && accessionID1.value !== accessionID2.value) {
        hasError = true;
        errorMessage('accessionID2', 'Blood Accession ID doesn\'t match', focus, true);
        focus = false;
    }
    
    if (accessionID3 && accessionID3.value && !accessionID4.value && !accessionID4.classList.contains('disabled')) {
        hasError = true;
        errorMessage('accessionID4', 'Please re-type Urine Accession ID from tube.', focus, true);
        focus = false;
    }
    else if (accessionID3 && accessionID3.value && accessionID4.value && accessionID3.value !== accessionID4.value) {
        hasError = true;
        errorMessage('accessionID4', 'Urine Accession ID doesn\'t match', focus, true);
        focus = false;
    }
    else if (!selectedVisit) {
        hasError = true;
        errorMessage('visit-select', 'Visit Type is not selected', focus, true);
        focus = false;
    }

    if (hasError) return;
    let confirmVal = 'No';

    if (accessionID1 && accessionID1.value && accessionID3 && !accessionID3.value) {
        const button = document.createElement('button');
        button.dataset.target = '#biospecimenModal';
        button.dataset.toggle = 'modal';
    
        document.getElementById('root').appendChild(button);
        button.click();
        document.getElementById('root').removeChild(button);
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `Urine Accession Id is Missing`
        let template =  `You have not entered a Urine Accession Id. Do you want to continue?`
        template += `
        <br />
        <div style="display:inline-block; margin-top:20px;">
            <button type="button" class="btn btn-primary" data-dismiss="modal" target="_blank"  data-toggle="modal" id="yesTrigger">Yes</button>
            <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank" id="noTrigger">NO</button>
            </div>
        </div>`
        body.innerHTML = template;


        const noBtn = document.getElementById('noTrigger')
        noBtn.addEventListener("click", async e => {
            confirmVal = 'No'
        })

        const yesBtn = document.getElementById('yesTrigger')
        yesBtn.addEventListener("click", async e => {
            confirmVal = 'Yes'
            triggerConfirmationModal(accessionID2, accessionID4, participantName, hasError, confirmVal, selectedVisit, formData, connectId)
        })

    }
    
    
    if (accessionID1 && !accessionID1.value && accessionID3 && accessionID3.value) {
        const button = document.createElement('button');
        button.dataset.target = '#biospecimenModal';
        button.dataset.toggle = 'modal';
    
        document.getElementById('root').appendChild(button);
        button.click();
        document.getElementById('root').removeChild(button);
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `Blood Accession Id is Missing`
        let template =  `You have not entered a Blood Accession Id. Do you want to continue?`
        template += `
        <br />
        <div style="display:inline-block; margin-top:20px;">
            <button type="button" class="btn btn-primary" data-dismiss="modal" target="_blank" id="yesTrigger">Yes</button>
            <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank" id="noTrigger">NO</button>
            </div>
        </div>`
        body.innerHTML = template;

        const noBtn = document.getElementById('noTrigger')
        noBtn.addEventListener("click", async e => {
            confirmVal = 'No'
        })

        const yesBtn = document.getElementById('yesTrigger')
        yesBtn.addEventListener("click", async e => {
            confirmVal = 'Yes'
            triggerConfirmationModal(accessionID2, accessionID4, participantName, hasError, confirmVal, selectedVisit, formData, connectId)
        })
    }

    if (!hasError && accessionID2.value && accessionID4.value) {
        confirmationModal(accessionID1, accessionID3, participantName, selectedVisit, formData, connectId)
    }
}

const triggerConfirmationModal =  (accessionID2, accessionID4, participantName, hasError, confirmVal, selectedVisit, formData, connectId) => {
    if (!hasError && confirmVal === 'Yes') {
        confirmationModal(accessionID2, accessionID4, participantName, selectedVisit, formData, connectId)
}}

const confirmationModal = (accessionID2, accessionID4, participantName, selectedVisit, formData, connectId) => {
    const button = document.createElement('button');
    button.dataset.target = '#modalShowMoreData';
    button.dataset.toggle = 'modal';
    document.getElementById('root').appendChild(button);
    button.click();
    document.getElementById('root').removeChild(button);
    const header = document.getElementById('modalHeader');
    const body = document.getElementById('modalBody');
    header.innerHTML = `Confirm Accession ID`
    let template =  `Blood Accession ID: ${accessionID2.value ? accessionID2.value : 'N/A' } <br />
    Urine Accession ID: ${accessionID4.value ? accessionID4.value : 'N/A' } <br />
    Confirm ID is correct for participant: ${participantName}`
    template += `
    <br />
    <div style="display:inline-block; margin-top:20px;">
        <button type="button" class="btn btn-primary" data-dismiss="modal" target="_blank" id="proceedNextPage">Confirm & Continue</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank" id="cancel">Cancel</button>
        </div>
    </div>`
    body.innerHTML = template;
    const noBtn = document.getElementById('cancel');
    noBtn.addEventListener("click", async e => {
        return
    })

    const yesBtn = document.getElementById('proceedNextPage');
    yesBtn.addEventListener("click", async e => {
        (accessionID2.value) ? await proceedToSpecimenPage(accessionID2, accessionID4, selectedVisit, formData, connectId) :
        await redirectSpecimenPage(accessionID2, accessionID4, selectedVisit, formData, connectId)
    }) 
}

const proceedToSpecimenPage = async (accessionID1, accessionID3, selectedVisit, formData, connectId) => {
    const bloodAccessionId = await checkAccessionId({accessionId: +accessionID1.value, accessionIdType: '646899796'});
    if (bloodAccessionId.code == 200) {
        if (bloodAccessionId.data) {
            hideAnimation();
            const button = document.createElement('button');
            button.dataset.target = '#biospecimenModal';
            button.dataset.toggle = 'modal';
            document.getElementById('root').appendChild(button);
            button.click();
            document.getElementById('root').removeChild(button);
            const header = document.getElementById('biospecimenModalHeader');
            const body = document.getElementById('biospecimenModalBody');
            header.innerHTML = `Existing Accession ID`
            let template =  `Accession ID entered is already assigned to Collection ID ${bloodAccessionId?.data?.[820476880]}. Choose an action`
            template += `
            <br />
            <div style="display:inline-block; margin-top:20px;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" target="_blank" id="addCollection">Add Specimens to existing Collection ID</button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" target="_blank" id="cancelSelection">Cancel</button>
                </div>
            </div>`
            body.innerHTML = template;
            const noBtn = document.getElementById('cancelSelection');
            noBtn.addEventListener("click", async e => {
                await redirectSpecimenPage(accessionID1, accessionID3, selectedVisit, formData, connectId)
                return
            })

            const yesBtn = document.getElementById('addCollection');
            yesBtn.addEventListener("click", async e => {
                formData.collectionId = bloodAccessionId?.data?.[820476880];
                formData['331584571'] =  selectedVisit;
                
                btnsClicked(connectId, formData); // needs code reformat/enhancement
                await redirectSpecimenPage(accessionID1, accessionID3, selectedVisit, formData, connectId)
                return
            }) 
        }
        else {
            await redirectSpecimenPage(accessionID1, accessionID3, selectedVisit, formData, connectId)
            return
        }
    }
}

const redirectSpecimenPage = async (accessionID1, accessionID3, selectedVisit, formData, connectId) => {
    if(accessionID1?.value) formData = {...formData, '646899796': +accessionID1.value || ''};
    if(accessionID3?.value) formData['928693120'] = +accessionID3.value || '';
    if(selectedVisit) formData['331584571'] =  +selectedVisit;
    let query = `connectId=${parseInt(connectId)}`;
    const response = await findParticipant(query);
    const data = response.data[0];
    specimenTemplate(data, formData);
}

export const addEventBiospecimenCollectionFormSave = async (participantData, biospecimenData) => {
    const collectionSaveExit = document.getElementById('collectionSave');
    collectionSaveExit && collectionSaveExit.addEventListener('click', async () => {
        await checkFormAndSave(participantData, biospecimenData, false);
    });

    const collectionSaveContinue = document.getElementById('collectionNext');
    collectionSaveContinue && collectionSaveContinue.addEventListener('click', async () => {
        await checkFormAndSave(participantData, biospecimenData, true);
    });
};

/**
 * Validate the form and save the collection.
 * @param {Object} participantData - Participant data object.
 * @param {Object} biospecimenData - Biospecimen data object.
 * @param {Boolean} shouldNavigateToReview - Boolean to indicate the button clicked. false -> 'save' (stay on page). true -> 'Go to Review' (navigate to Review screen).
 */
const checkFormAndSave = async (participantData, biospecimenData, shouldNavigateToReview) => {
    try {
        const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));
        const isFormDataValid = inputFields.every(input => validateFormInputField(input, biospecimenData, true));
        
        isFormDataValid || !shouldNavigateToReview ?
            await collectionSubmission(participantData, biospecimenData, shouldNavigateToReview) :
            showTimedNotifications({ title: 'Data Errors Exist!', body: 'Please correct data entry errors in red before saving.' });
    } catch (error) {
        console.error("Error saving collection: ", error);
        showNotifications({ title: 'Error saving collection!', body: error.message });
    }
}

export const addEventBiospecimenCollectionFormToggles = () => {
    const collectedBoxes = Array.from(document.getElementsByClassName('tube-collected'));
    const deviationBoxes = Array.from(document.getElementsByClassName('tube-deviated'));
    const reasonNotCollectedDropdown = Array.from(document.getElementsByClassName('reason-not-collected'));

    collectedBoxes.forEach(collected => {

        const reason = document.getElementById(collected.id + "Reason"); // reason select dropdown element 
        const deviated = document.getElementById(collected.id + "Deviated"); // deviated checkbox element
        const specimenId = document.getElementById(collected.id + "Id"); // full specimen id input element

        collected.addEventListener('change', () => {
            if (getWorkflow() === 'research' && reason) reason.disabled = collected.checked;
            if (deviated) deviated.disabled = !collected.checked;
            specimenId.disabled = !collected.checked;
            
            if (collected.checked) {
                if (getWorkflow() === 'research' && reason) reason.value = '';
            } else {
                const event = new CustomEvent('change');

                specimenId.value = '';
                specimenId.dispatchEvent(event);

                if (deviated) {
                    deviated.checked = false;
                    deviated.dispatchEvent(event);

                }
            }

            if (getWorkflow() === 'research' && collected.id === `${conceptIds.collection.mouthwashBagScan}`) {
                const mouthwashContainer = document.getElementById(`${conceptIds.collection.mouthwashTube1}Id`);
                if (!mouthwashContainer.value && collected.checked) {
                    specimenId.disabled = true;
                }
            }

            if (getWorkflow() === 'research' && collected.id === `${conceptIds.collection.mouthwashTube1}`) {
                const mouthwashBagChkb = document.getElementById(`${conceptIds.collection.mouthwashBagScan}`);
                const mouthwashBagText = document.getElementById(`${conceptIds.collection.mouthwashBagScan}Id`);
                if (collected.checked) {
                    mouthwashBagChkb.checked = true;
                    mouthwashBagText.disabled = false;
                }
            }
            
            const selectionData = workflows[getWorkflow()].filter(tube => tube.concept === collected.id)[0];
            if (selectionData.tubeType === 'Blood tube' || selectionData.tubeType === 'Urine') {
                const biohazardBagChkb = document.getElementById(`${conceptIds.collection.bloodUrineBagScan}`);
                const biohazardBagText = document.getElementById(`${conceptIds.collection.bloodUrineBagScan}Id`);
                const allTubesCollected = Array.from(document.querySelectorAll('.tube-collected'))
                const allBloodUrineCheckedArray = allTubesCollected.filter(
                    item => (item.getAttribute("data-tube-type") === "Blood tube" && item.checked) || (item.getAttribute("data-tube-type") === "Urine" && item.checked)
                );
               
                if (collected.checked) {
                    biohazardBagChkb.checked = true;
                    biohazardBagText.disabled = false;
                } 
                else if(collected.checked === false && biohazardBagChkb.checked === true && allBloodUrineCheckedArray.length) {
                    biohazardBagChkb.checked = true;
                    biohazardBagText.disabled = false;
                }
                else {
                    biohazardBagChkb.checked = false;
                    biohazardBagText.disabled = true;
                }
            }
        });
    });

    deviationBoxes.forEach(deviation => {
        const collectedId = document.getElementById(deviation.id).id.replace('Deviated', '');
        const type = document.getElementById(`${collectedId}Deviation`);
        const comment = document.getElementById(`${collectedId}DeviatedExplanation`);

        deviation.addEventListener('change', () => {
            type.disabled = !deviation.checked;

            if (!deviation.checked) type.value = '';
            if (deviation.checked && comment.disabled) comment.disabled = false;
        });
    });

    reasonNotCollectedDropdown.forEach( reasonDropdown => {
        const collectedId = document.getElementById(reasonDropdown.id).id.replace('Reason', '');
        const collected = document.getElementById(collectedId);
        const specimenId = document.getElementById(`${collectedId}Id`);
        const deviation = document.getElementById(`${collectedId}Deviated`);
        const type = document.getElementById(`${collectedId}Deviation`);
        const comment = document.getElementById(`${collectedId}DeviatedExplanation`);

        reasonDropdown.addEventListener('change', () => {
            if (reasonDropdown.value) {
                if (collected) {
                    collected.checked = false;
                }
                if (specimenId) { 
                    specimenId.value = '';
                    specimenId.disabled = true;
                }
                if (deviation) {
                    deviation.checked = false;
                    deviation.disabled = true;
                }
                if (type) {
                    type.value = '';
                    type.disabled = true;
                }
                if (reasonDropdown.value === `${conceptIds.collection.reasonNotCollectedOther}`) {
                    comment.value = '';
                    comment.disabled = false;
                }
            }
        });
    });
};

export const addEventBiospecimenCollectionFormEdit = () => {
    const editButtons = Array.from(document.querySelectorAll('[id$="collectEditBtn"]'));
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const conceptID = button.id.replace('collectEditBtn', '');
            document.getElementById(conceptID + 'Id').disabled = false;
            const tubeCollectedCheckbox = document.getElementById(conceptID);
            if (tubeCollectedCheckbox) tubeCollectedCheckbox.disabled = false;
            const reasonNotCollectedDropdown = document.getElementById(conceptID + 'Reason');
            if (reasonNotCollectedDropdown) reasonNotCollectedDropdown.disabled = false;

            const deviation = document.getElementById(conceptID + 'Deviated');
            if (deviation) {
                deviation.disabled = false;

                if (deviation.checked) {
                    const type = document.getElementById(deviation.id.replace('Deviated', 'Deviation'));
                    const comment = document.getElementById(deviation.id + 'Explanation'); 

                    type.disabled = false;
                    comment.disabled = false;
                }
            }
        });
    });
};

export const addEventBiospecimenCollectionFormEditAll = () => {
    const editAll = document.getElementById('collectEditAllBtn');

    editAll.addEventListener('click', () => {

        const editButtons = Array.from(document.querySelectorAll('[id$="collectEditBtn"]'));
        editButtons.forEach(button => {
            button.dispatchEvent(new CustomEvent('click'));
        });
    });
};

export const addEventBiospecimenCollectionFormInputErrorHandler = (biospecimenData) => {
    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));

    inputFields.forEach(input => {
        input.addEventListener('change', () => {
            validateFormInputField(input, biospecimenData);
        });

        input.addEventListener('keyup', e => {
            if (e.keyCode == 13) {
                const inputFieldsEnabled = inputFields.filter(i => i.disabled === false);
                const inputIndex = inputFieldsEnabled.indexOf(input);

                if(inputIndex != inputFieldsEnabled.length - 1) {
                    inputFieldsEnabled[inputIndex + 1].focus();
                }
            }
        });
    });
};

/**
 * Validate form input field. If the input is not valid, display an error message.
 * This function is used for both the initial form input validation and the form input validation after the user clicks 'Submit'.
 * If the input is a tube, it can be an exact match to the tube ID or a replacement label (0050-0054). If the input is a bag, it must be an exact match to the bag ID.
 * @param {Object} inputTube - The tube data input by the user.
 * @param {Object} biospecimenData - The biospecimen data object.
 * @returns {Boolean} - Returns true if the input is valid, otherwise returns false.
 */
const validateFormInputField = (inputTube, biospecimenData) => {
    removeSingleError(inputTube.id);
    
    const collectionID = biospecimenData[conceptIds.collection.id];
    const siteTubesList = getSiteTubesLists(biospecimenData);
    const siteTubeData = siteTubesList.find(siteTube => siteTube.concept === inputTube.id.replace('Id', ''));
    const validationID = collectionID + ' ' + siteTubeData.id;
    const inputTubeIDString = getValue(`${inputTube.id}`).toUpperCase();
    const replcementTubeRegExp = /^CXA\d{6}\s(0050|0051|0052|0053|0054)$/;
    
    const tubeCheckBox = document.getElementById(inputTube.id.replace('Id',''));
    if (tubeCheckBox && tubeCheckBox.checked) {
        const isBagID = siteTubeData.id === '0008' || siteTubeData.id === '0009';
        const isTubeIDEntryValid = isBagID ?
            validationID === inputTubeIDString :
            validationID === inputTubeIDString || (collectionID === inputTubeIDString.substr(0, masterSpecimenIDRequirement.length) && replcementTubeRegExp.test(inputTubeIDString));

        if (!isTubeIDEntryValid) {
            const errorMessageText = isBagID ?
                `Invalid entry. Bag ID must be ${validationID}` :
                `Invalid entry. Specimen ID must be ${validationID}.`;
            errorMessage(inputTube.id, errorMessageText);
            return false;
        }
    }

    return true;
}

export const createTubesForCollection = async (formData, biospecimenData) => {
    const { collectionTime, scannedTime, tube } = conceptIds.collection;

    if (getWorkflow() === 'research' && biospecimenData[collectionTime] === undefined) biospecimenData[collectionTime] = new Date().toISOString();
    if (getWorkflow() === 'clinical' && biospecimenData[scannedTime] === undefined) biospecimenData[scannedTime] = new Date().toISOString();
    let siteTubesList = getSiteTubesLists(formData);

    siteTubesList.forEach((dt) => {
        if (biospecimenData[`${dt.concept}`] === undefined) biospecimenData[`${dt.concept}`] = {[tube.isCollected]: conceptIds.no};

        if (biospecimenData[dt.concept][tube.deviation] === undefined && dt.deviationOptions) {
            biospecimenData[dt.concept][tube.deviation] = {};
            dt.deviationOptions.forEach(dev => {
                biospecimenData[dt.concept][tube.deviation][dev.concept] = conceptIds.no;
            });
            biospecimenData[dt.concept][tube.isDeviated] = conceptIds.no;
            biospecimenData[dt.concept][tube.isDiscarded] = conceptIds.no;
        }
    });

    await updateSpecimen([biospecimenData]);
}

const collectionSubmission = async (participantData, biospecimenData, continueToFinalizeScreen) => {
    removeAllErrors();

    // Make a deep copy. Check for changes at end of function prior to saving.
    const originalSpecimenData = JSON.parse(JSON.stringify(biospecimenData));

    if (getWorkflow() === 'research' && biospecimenData[conceptIds.collection.collectionTime] === undefined) biospecimenData[conceptIds.collection.collectionTime] = new Date().toISOString();

    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));
    const siteTubesList = getSiteTubesLists(biospecimenData);

    let hasError = false;
    let focus = true;
    let hasCntdError = false;

    inputFields.forEach(input => {
        const tubeConceptId = input.id.replace('Id', '');
        const tubes = siteTubesList.filter(tube => tube.concept === tubeConceptId);
        
        if (tubeConceptId && biospecimenData[tubeConceptId] === undefined) {
            const tubePlaceholderData = siteTubesList.find(stockTube => stockTube.concept === tubeConceptId);
            fixMissingTubeData(tubePlaceholderData, biospecimenData[tubeConceptId] = {});
        }

        let value = getValue(`${input.id}`).toUpperCase();
        const masterID = value.substr(0, masterSpecimenIDRequirement.length);
        const tubeID = value.substr(masterSpecimenIDRequirement.length + 1, totalCollectionIDLength);

        const tubeCheckBox = document.getElementById(input.id.replace('Id',''));

        if (tubeCheckBox) input.required = tubeCheckBox.checked;

        if (!continueToFinalizeScreen && value.length === 0) return;

        if (input.required && value.length !== totalCollectionIDLength) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, `Combination of Collection ID and Full Specimen ID should be ${totalCollectionIDLength} characters long and in the following format CXA123456 1234.`, focus);
            focus = false;
        } else if (input.required && masterID !== biospecimenData[conceptIds.collection.id]) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Collection ID.', focus);
            focus = false;
        } else if (input.required && tubes.length === 0) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        } else if (input.required && (tubes[0].id !== tubeID && !additionalTubeIDRequirement.regExp.test(tubeID))) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        }

        if (tubeConceptId && input.required) biospecimenData[tubeConceptId][conceptIds.collection.tube.scannedId] = `${masterID} ${tubeID}`.trim();
    });

    if ((hasError && continueToFinalizeScreen == true) || hasCntdError) return;

    const tubesCollected = Array.from(document.getElementsByClassName('tube-collected'));

    tubesCollected.forEach((tube) => {
        if (biospecimenData[tube.id] === undefined) biospecimenData[`${tube.id}`] = {};
        if (biospecimenData[tube.id] && biospecimenData[tube.id][conceptIds.collection.tube.isCollected] === conceptIds.yes && tube.checked === false) {
            delete biospecimenData[tube.id][conceptIds.collection.tube.scannedId];
        }

        biospecimenData[tube.id][conceptIds.collection.tube.isCollected] = tube.checked ? conceptIds.yes : conceptIds.no;

        const reason = document.getElementById(tube.id + 'Reason');
        const deviated = document.getElementById(tube.id + 'Deviated');
        const deviation = document.getElementById(tube.id + 'Deviation');
        const comment = document.getElementById(tube.id + 'DeviatedExplanation');

        // Reason selected dropdown
        if (reason) {
            if (reason.value) {
                biospecimenData[tube.id][conceptIds.collection.tube.selectReasonNotCollected] = parseInt(reason.value);
                biospecimenData[tube.id][conceptIds.collection.tube.optionalNotCollectedDetails] = comment.value.trim();

                if (biospecimenData[tube.id][conceptIds.collection.tube.selectReasonNotCollected] === conceptIds.collection.reasonNotCollectedOther && !comment.value.trim()) {
                    hasError = true;
                    errorMessage(comment.id, 'Please provide more details', focus);
                    focus = false;
                    return
                }
            } else {
                delete biospecimenData[tube.id][conceptIds.collection.tube.selectReasonNotCollected];
                delete biospecimenData[tube.id][conceptIds.collection.tube.optionalNotCollectedDetails];
            }
        }

        // Deviation Checkbox
        if (deviated) {
            if(deviated.checked) {
                biospecimenData[tube.id][conceptIds.collection.tube.isDeviated] = conceptIds.yes;
                biospecimenData[tube.id][conceptIds.collection.tube.deviationComments] = comment.value.trim();
            } else {
                biospecimenData[tube.id][conceptIds.collection.tube.isDeviated] = conceptIds.no;
                delete biospecimenData[tube.id][conceptIds.collection.tube.deviationComments];
            }
    
            const tubeData = siteTubesList.filter(td => td.concept === tube.id)[0];
            const deviationSelections = Array.from(deviation).filter(dev => dev.selected).map(dev => parseInt(dev.value));

            if(tubeData.deviationOptions) {
                tubeData.deviationOptions.forEach(option => { 
                    biospecimenData[tube.id][conceptIds.collection.tube.deviation][option.concept] = (deviationSelections.indexOf(option.concept) != -1 ? conceptIds.yes : conceptIds.no);
                });
            }
            
            biospecimenData[tube.id][conceptIds.collection.tube.isDiscarded] = 
                (biospecimenData[tube.id][conceptIds.collection.tube.deviation][conceptIds.collection.deviationType.broken] === conceptIds.yes || 
                biospecimenData[tube.id][conceptIds.collection.tube.deviation][conceptIds.collection.deviationType.insufficientVolume] === conceptIds.yes || 
                biospecimenData[tube.id][conceptIds.collection.tube.deviation][conceptIds.collection.deviationType.discard] === conceptIds.yes || 
                biospecimenData[tube.id][conceptIds.collection.tube.deviation][conceptIds.collection.deviationType.mislabel] === conceptIds.yes) ? conceptIds.yes : conceptIds.no;
    
            if (biospecimenData[tube.id][conceptIds.collection.tube.deviation][conceptIds.collection.deviationType.other] === conceptIds.yes && !comment.value.trim()) { 
                hasError = true;
                errorMessage(comment.id, 'Please provide more details', focus);
                focus = false;
                return
            }
        }
    });

    if (hasError) return;

    biospecimenData[conceptIds.collection.note] = document.getElementById('collectionAdditionalNotes').value;

    if (continueToFinalizeScreen) {
        if (getWorkflow() === 'clinical') {
            if (biospecimenData[conceptIds.collection.scannedTime] === undefined) biospecimenData[conceptIds.collection.scannedTime] = new Date().toISOString();
        }

        if (getWorkflow() === 'research') {
            let initials = document.getElementById('collectionInitials')
            if(initials && initials.value.trim().length == 0) {
                errorMessage(initials.id, 'This field is required. Please enter the phlebotomist\'s initials.', focus);
                focus = false;
                return;
            }
            else {
                biospecimenData[conceptIds.collection.phlebotomistInitials] = initials.value.trim();
            }
        }
    }

    // Handle corner cases: found strays and re-finalizing collections
    const isFinalized = biospecimenData[conceptIds.collection.isFinalized] === conceptIds.yes;
    const isFormUpdated = hasObjectChanged(originalSpecimenData, biospecimenData);
    
    let addedStrayTubes = [];
    if (isFinalized && isFormUpdated) {
        addedStrayTubes = getAddedStrayTubes(originalSpecimenData, biospecimenData);
    }
    
    // Save button actions after form processing. "Save" stays on same screen. "Go to review" navigates to finalize screen when continueToFinalizeScreen = true.
    if (!isFormUpdated) {
        continueToFinalizeScreen ? finalizeTemplate(participantData, biospecimenData) : showTimedNotifications({ title: 'No changes detected', body: 'No changes have been made to the collection data.' });
    } else if (isFinalized) {
        handleFinalizedCollectionUpdate(biospecimenData, participantData, siteTubesList, addedStrayTubes, continueToFinalizeScreen);
    } else {
        try {
            await processSpecimenCollectionFormUpdates(biospecimenData, participantData, siteTubesList, continueToFinalizeScreen);
            await handleFormSaveAndNavigation(biospecimenData, continueToFinalizeScreen);
        } catch (error) {
            console.error(`error saving specimen ${error}`);
            showNotifications({ title: 'Error saving collection', body: `${error}` });
        }
    }
}

/**
 * Handle case where form has been updated but specimen is already finalized.
 * If specimen has already been finalized, alert user that changes will update the specimen.
 * @param {object} biospecimenData - the updatedBiospecimenData (existing data plus form changes).
 * @param {object} participantData - the participantData from Firestore.
 * @param {array} siteTubesList - the list of tubes based on the site (from getSiteTubesLists()).
 * @param {array} addedStrayTubes - tubes added this form submission.
 * @param {boolean} continueToFinalizeScreen - if true, navigate to finalize screen.
 */
const handleFinalizedCollectionUpdate = async (biospecimenData, participantData, siteTubesList, addedStrayTubes, continueToFinalizeScreen) => {
    const modalMessage = {
        title: `Collection ${biospecimenData[conceptIds.collection.id]} is Already Finalized`,
        body: 'IMPORTANT: This Collection has already been finalized. Click continue if you want to update the collection and re-finalize. Click Cancel to discard changes.',
    };

    const onCancel = () => { /* Nothing to do here */ };
    
    // Manage boxedStatus since specimen is already finalized. If boxedStatus = notBoxed -> no update needed.
    // If boxedStatus = partiallyBoxed || boxedStatus = boxed -> setBoxedStatus to partiallyBoxed and add the new tubes to strayTubesList.
    const onContinue = async () => {
        try {
            const currentBoxedStatus = biospecimenData[conceptIds.boxedStatus];
            if (currentBoxedStatus === conceptIds.partiallyBoxed || currentBoxedStatus === conceptIds.boxed) {
                const strayTubesList = biospecimenData[conceptIds.strayTubesList] || [];
                strayTubesList.push(...addedStrayTubes);
                biospecimenData[conceptIds.strayTubesList] = strayTubesList;
                biospecimenData[conceptIds.boxedStatus] = conceptIds.partiallyBoxed;
            }
            await processSpecimenCollectionFormUpdates(biospecimenData, participantData, siteTubesList, continueToFinalizeScreen);
            await handleFormSaveAndNavigation(biospecimenData, continueToFinalizeScreen);
        } catch (error) {
            console.error(`Error handleFinalizedCollectionUpdate -> onContinue. ${error}`);
            showNotifications({ title: "Error updating collection", body: error.message });
        }
    };

    showNotificationsCancelOrContinue(modalMessage, null, onCancel, onContinue);
}

// TODO: The write process would benefit from optimization. Many sequential reads/writes.
const processSpecimenCollectionFormUpdates = async (biospecimenData, participantData, siteTubesList) => {
    const baselineVisit = (biospecimenData[conceptIds.collection.selectedVisit] === conceptIds.baseline.visitId);
    const clinicalResearchSetting = (biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.research || biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.clinical);
    
    try {
        showAnimation();

        await Promise.all([
            updateSpecimen([biospecimenData]),
            updateCollectionSettingData(biospecimenData, siteTubesList, participantData),
        ]);

        if (baselineVisit && clinicalResearchSetting) await updateBaselineData(siteTubesList, participantData);
        await checkDerivedVariables({ "token": participantData["token"] });

        hideAnimation();
    } catch (error) {
        hideAnimation();
        console.error("Error saving collection: ", error);
        showNotifications({ title: 'Error saving collection!', body: error.message });
    }
}

const handleFormSaveAndNavigation = async (biospecimenData, continueToFinalizeScreen) => {
    if (continueToFinalizeScreen) {
        const { specimenData: updatedSpecimenData, participantData: updatedParticipantData } = await getSpecimenAndParticipant(biospecimenData[conceptIds.collection.id]);
        if (validateSpecimenAndParticipantResponse(updatedSpecimenData, updatedParticipantData)) {
            finalizeTemplate(updatedParticipantData, updatedSpecimenData);
        }
    } else {
        showTimedNotifications({ title: 'Success!', body: 'Collection specimen data has been saved.' });
    }
}

const getValue = (id) => document.getElementById(id).value.trim();

export const addEventSelectAllCollection = () => {
    const checkbox = document.getElementById('selectAllCollection');
    checkbox.addEventListener('click', () => {
        
        Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => {
            if(!chk.disabled && chk.id !== `${conceptIds.collection.mouthwashBagScan}`) { 
                chk.checked = checkbox.checked;

                const event = new CustomEvent('change');
                chk.dispatchEvent(event);
            }
        });
    })
}

export const addEventNavBarParticipantCheckIn = () => {
    const btn = document.getElementById('navBarParticipantCheckIn');
    if (!btn) return
    btn.addEventListener('click', async () => {
        const connectId = btn.dataset.connectId;
        if (!connectId) return;
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        checkInTemplate(data);
    })
}

export const addEventReturnToCollectProcess = () => {
    const btn = document.getElementById('returnToCollectProcess');
    btn && btn.addEventListener('click', async () => {
        const masterSpecimenId = btn.dataset.masterSpecimenId;
        const connectId = btn.dataset.connectId;
        showAnimation();
        let query = `connectId=${parseInt(connectId)}`;
        const response = await findParticipant(query);
        const participantData = response.data[0];
        const biospecimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        
        tubeCollectedTemplate(participantData, biospecimenData);
    })
};

export const addEventNavBarSpecimenSearch = () => {
    const btn = document.getElementById('navBarSpecimenSearch');
    btn.addEventListener('click', e => {
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        searchBiospecimenTemplate();
    });
}

export const addEventNavBarShipment = (id, userName) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', async e => {
        e.stopPropagation();
        let navButton = document.getElementById('navBarShippingDash')
        if (navButton.classList.contains('active')) return;
        await startShipping(userName);
    });
}

export const addEventReturnToPackaging = () => {
    const btn = document.getElementById('returnToPackaging');
    btn.addEventListener('click', async e => {
        e.stopPropagation();
        let navButton = document.getElementById('navBarShippingDash')
        if (navButton.classList.contains('active')) return;
        await startShipping(appState.getState().userName, true);
    });
}

export const addEventShipPrintManifest = (id) => {
  const btn = document.getElementById(id)
  btn.addEventListener('click', e => {
    window.print()
    if(e.target.classList.contains("print-manifest")) {
      e.target.classList.remove("print-manifest")
    } else return
  })
}

export const addEventNavBarBoxManifest = (id) => {
    const userName = appState.getState().userName;
    const btn = document.getElementById(id);
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        if (id === 'viewBoxManifestBlood') {
            //return box 1 info
            generateBoxManifest(document.getElementById('currTubeTable'), userName);
        }
        else if (id === 'viewBoxManifestMouthwash') {
            //return box 2 info
            generateBoxManifest(document.getElementById('mouthwashList'), userName);
        }
    });
}

export const addEventNavBarShippingManifest = (userName) => {
    const tempCheckedEl = document.getElementById('tempMonitorChecked');
    const btn = document.getElementById('completePackaging');
    btn.addEventListener('click', async e => {
        let selectedLocation = document.getElementById('selectLocationList').value;
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        //get table info
        let boxesToShip = [];
        let shipSetForage = [];
        let currTable = document.getElementById('saveTable');
        let tempCheckStatus = "";
        const currSiteSpecificName = document.getElementById('selectLocationList').value;
        const currShippingLocationNumber = siteSpecificLocationToConceptId[currSiteSpecificName];
        const currShippingLocationNumberObj = locationConceptIDToLocationMap[currShippingLocationNumber];
        appState.setState(state => ({shipping: {...state.shipping, locationNumber: currShippingLocationNumber}}));
        for (var r = 1; r < currTable.rows.length; r++) {

            let currCheck = currTable.rows[r].cells[0]
            if (currCheck.childNodes[0].checked) {
                let currBoxId = currTable.rows[r].cells[3].innerText;
                boxesToShip.push(currBoxId)
            }

        }

        if (selectedLocation === 'none') {
              showNotifications({ title: 'Reminder', body: 'Please Select  \'Shipping Location\' ' });
              return
        }

        if(!boxesToShip.length) {
          showNotifications({ title: 'Reminder', body: 'Please select Box(es) to review and ship' }); 
          return
        }

        tempCheckStatus = tempCheckedEl.checked;
        // Push empty item with boxId and empty tracking number string
        // shipSetForage used to handle empty localforage or no box id match
        boxesToShip.forEach(box => shipSetForage.push({ "boxId": box, [conceptIds.shippingTrackingNumber]: "" }));
        checkShipForage(shipSetForage,boxesToShip);
        //return box 1 info
        shippingPrintManifestReminder(boxesToShip, userName, tempCheckStatus, currShippingLocationNumberObj);
    });
}

export const addEventReturnToReviewShipmentContents = (element, boxIdAndBagsObj, userName, boxWithTempMonitor='') => {
    document.getElementById(element).addEventListener('click', async e => {
        const boxIdArray = Object.keys(boxIdAndBagsObj);
        let isTempMonitorIncluded = false

        if (boxWithTempMonitor) {
            isTempMonitorIncluded = true;
        }

        const locationNumber = appState.getState().shipping.locationNumber;
        await generateShippingManifest(boxIdArray, userName, isTempMonitorIncluded, locationNumber);
    });
}

export const addEventNavBarAssignTracking = (element, userName, boxIdAndBagsObj, tempChecked) => {
    let btn = document.getElementById('navBarShipmentTracking');
    document.getElementById(element).addEventListener('click', async (e) => {
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        await shipmentTracking(boxIdAndBagsObj, userName, tempChecked);
    });
}

export const addEventTrackingNumberScanAutoFocus = () => {
    let arrInputs = Array.from(document.getElementsByClassName('shippingTrackingInput'))
    for(let i = 0; i < arrInputs.length - 1; i++ ) {
        arrInputs[i].addEventListener("keydown", e => {
            if(e.keyCode == 13) arrInputs[i+1].focus()
        })
    }   
}

export const addEventTrimTrackingNums = () => {
  let boxTrackingIdEls = Array.from(document.getElementsByClassName("boxTrackingId"))
  let boxTrackingIdConfirmEls = Array.from(document.getElementsByClassName("boxTrackingIdConfirm"))
  const nonAlphaNumericMatch = /[^a-zA-Z0-9]/gm;
  // Trim Function here
  boxTrackingIdEls.forEach(el => el.addEventListener("input", e => {
    let inputTrack = e.target.value.trim()
    if(inputTrack.length >= 0) {
      e.target.value = inputTrack.replace(nonAlphaNumericMatch, '')
    }
    if(inputTrack.length > 12) {
      e.target.value = inputTrack.slice(-12)
    }
  }))
  boxTrackingIdConfirmEls.forEach(el => el.addEventListener("input", e => {
    let inputTrackConfirm = e.target.value.trim()
    if(inputTrackConfirm.length >= 0) {
      e.target.value = inputTrackConfirm.replace(nonAlphaNumericMatch, '')
    }
    if(inputTrackConfirm.length > 12) {
      e.target.value = inputTrackConfirm.slice(-12)
    }
  }))
}

export const addEventPreventTrackingConfirmPaste = () => {
  let boxTrackingIdConfirmEls = Array.from(document.getElementsByClassName("boxTrackingIdConfirm"));
  boxTrackingIdConfirmEls.forEach(el => {
    el.addEventListener("paste", e => e.preventDefault())
  })
}

export const addEventCheckValidTrackInputs = (boxIdAndBagsObj) => {

  let boxIdArray = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
  /* Check Tracking Numbers - ON SCREEN LOAD */
  boxIdArray.forEach(box => {
    let input = document.getElementById(box+"trackingId").value.trim()
    let inputConfirm = document.getElementById(box+"trackingIdConfirm").value.trim()
    let inputErrorMsg = document.getElementById(box+"trackingIdErrorMsg")
    let inputConfirmErrorMsg = document.getElementById(box+"trackingIdConfirmErrorMsg")
    if(input.length !== 0 && input.length < 12) {
      document.getElementById(box+"trackingId").classList.add("invalid")
      inputErrorMsg.textContent = `Tracking number must be 12 digits`
    }
    if(inputConfirm !== input ) {
      document.getElementById(box+"trackingIdConfirm").classList.add("invalid")
      inputConfirmErrorMsg.textContent = `Tracking numbers must match`
    }
  })
  /* Check Tracking Numbers - User Input */
  boxIdArray.forEach(box => {
    // box tracking id 
    document.getElementById(box+"trackingId").addEventListener("input", e => {
        let input = document.getElementById(box+"trackingId").value.trim()
        let inputConfirm = document.getElementById(box+"trackingIdConfirm").value.trim()
        let inputErrorMsg = document.getElementById(box+"trackingIdErrorMsg") 
        let inputConfirmErrorMsg = document.getElementById(box+"trackingIdConfirmErrorMsg")

      if(input.length === 12) {
          inputErrorMsg.textContent = ``
          document.getElementById(box+"trackingId").classList.remove("invalid")

          if (input === inputConfirm) { 
            inputConfirmErrorMsg.textContent = ``
            document.getElementById(box+"trackingIdConfirm").classList.remove("invalid")
          }
          else {
            inputConfirmErrorMsg.textContent = `Tracking numbers must match`
            document.getElementById(box+"trackingIdConfirm").classList.add("invalid")
          }
      }
      else if (input.length < 12 && input === inputConfirm) { 
        inputConfirmErrorMsg.textContent = ``
        document.getElementById(box+"trackingIdConfirm").classList.remove("invalid")
        inputErrorMsg.textContent = `Tracking number must be 12 digits`
        document.getElementById(box+"trackingId").classList.add("invalid")
      }
      else if(input.length < 12 && input !== inputConfirm) {
        inputErrorMsg.textContent = `Tracking number must be 12 digits`
        document.getElementById(box+"trackingId").classList.add("invalid")
        inputConfirmErrorMsg.textContent = `Tracking numbers must match`
        document.getElementById(box+"trackingIdConfirm").classList.add("invalid")
      }
      else {
        inputErrorMsg.textContent = `Tracking number must be 12 digits`
        document.getElementById(box+"trackingId").classList.add("invalid")
      }
    })
    // box tracking id confirm
    document.getElementById(box + "trackingIdConfirm").addEventListener("input", e => {
      let input = document.getElementById(box+"trackingId").value.trim()
      let inputConfirm = document.getElementById(box+"trackingIdConfirm").value.trim()
      let inputConfirmErrorMsg = document.getElementById(box+"trackingIdConfirmErrorMsg")
      
      if(inputConfirm === input) {
          inputConfirmErrorMsg.textContent = ``
          document.getElementById(box+"trackingIdConfirm").classList.remove("invalid")
      }
      else {
        document.getElementById(box+"trackingIdConfirm").classList.add("invalid")
        inputConfirmErrorMsg.textContent = `Tracking numbers must match`
      }
    })
  })
}

export const populateTrackingQuery = async (boxIdAndBagsObj) => {
    let boxIdArray = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    let toBeInnerHTML = ""

    let shipping = {}
    let shipData = await localforage.getItem("shipData")

    for(let box of shipData) {
      // if boxes has box id of localforage shipData push
      if(boxIdArray.includes(box["boxId"])) {
        shipping[box["boxId"]] = {[conceptIds.shippingTrackingNumber]: box[conceptIds.shippingTrackingNumber], "confirmTrackNum": box["confirmTrackNum"] };
      }
      else {
        shipping[box["boxId"]] = {[conceptIds.shippingTrackingNumber]: "" , confirmTrackNum: ""};
      }
    }
    
    for(let i = 0; i < boxIdArray.length; i++){
        let trackNum = boxIdArray[i] && shipping?.[boxIdArray[i]]?.[conceptIds.shippingTrackingNumber];
        let trackNumConfirm = boxIdArray[i] && shipping?.[boxIdArray[i]]?.["confirmTrackNum"];
        toBeInnerHTML +=`
        <div class = "row" style="justify-content:space-around">
                            <div class="form-group" style="margin-top:30px; width:380px;">
                                <label style="float:left;margin-top:5px">`+'Enter / Scan Shipping Tracking Number for ' + `<span style="font-weight:600;display:block;">${boxIdArray[i]}</span>` + `</label>
                                <br>
                                <div style="float:left;">
                                    <input class="form-control boxTrackingId shippingTrackingInput" type="text" id="` + boxIdArray[i] + 'trackingId' + `" placeholder="Enter/Scan Tracking Number" value="${trackNum ?? ""}" data-toggle="tooltip" data-placement="top" title="Scan or manually type tracking number" autocomplete="off"/>
                                    <p style="font-size:.8rem; margin-top:.5rem;">Ex. 457424072905</p>
                                    <p id="${boxIdArray[i]}trackingIdErrorMsg" class="text-danger"></p>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top:30px; width:380px;">
                                <label style="float:left;margin-top:5px">`+'Confirm Shipping Tracking Number for '+ `<span style="font-weight:600;display:block;">${boxIdArray[i]}</span>` + `</label>
                                <br>
                                <div style="float:left;">
                                    <input class="form-control boxTrackingIdConfirm shippingTrackingInput" type="text" id="` + boxIdArray[i] + 'trackingIdConfirm' + `" placeholder="Enter/Scan Tracking Number" value="${trackNumConfirm ?? ""}" data-toggle="tooltip" data-placement="top" title="Scan or manually type to confirm the correct tracking number" autocomplete="off"/>
                                    <p style="font-size:.8rem; margin-top:.5rem;">Ex. 457424072905</p>
                                    <p id="${boxIdArray[i]}trackingIdConfirmErrorMsg" class="text-danger"></p>
                                </div>
                            </div>
                        </div>
                        <br>`
    }
    document.getElementById("forTrackingNumbers").innerHTML = toBeInnerHTML;
}

export const addEventSaveAndContinueButton = async (boxIdAndBagsObj, userName, boxWithTempMonitor) => {
    document.getElementById('completeTracking').addEventListener('click', async () => {
        let shippingData = [];
        let boxIdAndTrackingObj = {};
        const boxIdArray = Object.keys(boxIdAndBagsObj);
        const trackingNumConfirmEls = Array.from(document.getElementsByClassName("invalid"));
        if (trackingNumConfirmEls.length > 0) {
          showNotifications({ title: 'Invalid Fields', body: 'Please add valid inputs to fields.' });
          return;
        }

        for (const boxId of boxIdArray) {
            const trackingId = document.getElementById(boxId + "trackingId").value.toUpperCase();
            const trackingIdConfirm = document.getElementById(boxId + "trackingIdConfirm").value.toUpperCase();
            if (trackingId === '' || trackingIdConfirm === '') {
                showNotifications({ title: 'Missing Fields', body: 'Please enter in shipment tracking numbers'});
                return;
            }
        
            shippingData.push({
              [conceptIds.shippingTrackingNumber]: trackingId,
              confirmTrackNum: trackingIdConfirm,
              boxId
            });
            boxIdAndTrackingObj[boxId] = {
              [conceptIds.shippingTrackingNumber]: trackingId,
              specimens: boxIdAndBagsObj[boxId]
            };
        }

        const isDuplicateTrackingIdInDb = await checkDuplicateTrackingIdFromDb(boxIdArray);
        if (isDuplicateTrackingIdInDb || (checkFedexShipDuplicate(boxIdArray) && boxIdArray.length > 1)) {
            shippingDuplicateMessage();
            return;
          }

        if (checkNonAlphanumericStr(boxIdArray)) {
          shippingNonAlphaNumericStrMessage();
          return;
        }

        localforage.setItem("shipData", shippingData);
        const shipmentCourier = document.getElementById('courierSelect').value;
        finalShipmentTracking({boxIdAndBagsObj, boxIdAndTrackingObj, userName, boxWithTempMonitor, shipmentCourier});
    })

}

export const addEventSaveButton = async (boxIdAndBagsObj) => {
    document.getElementById('saveTracking').addEventListener('click', async () => {
        let isMismatch = false;
        let shippingData = [];
        let boxIdAndTrackingObj = {};
        const boxIdArray = Object.keys(boxIdAndBagsObj);

        for (const boxId of boxIdArray) {
            const trackingId = document.getElementById(boxId + "trackingId").value.toUpperCase();
            const trackingIdConfirm = document.getElementById(boxId + "trackingIdConfirm").value.toUpperCase();
    
            if (trackingId !== trackingIdConfirm) {
              isMismatch = true;
              break;
            }

            shippingData.push({[conceptIds.shippingTrackingNumber]: trackingId, confirmTrackNum: trackingIdConfirm, boxId});
            boxIdAndTrackingObj[boxId] = {
                [conceptIds.shippingTrackingNumber]: trackingId,
                specimens: boxIdAndBagsObj[boxId],
              };
        }

        if (isMismatch) {
              showTimedNotifications({ title: 'Reminder', body: 'Tracking Ids do not match in one of the boxes.' });  
            return;
        }

        let isDuplicateTrackingIdInDb = await checkDuplicateTrackingIdFromDb(boxIdArray);
        if(isDuplicateTrackingIdInDb || (checkFedexShipDuplicate(boxIdArray) && boxIdArray.length > 1)){
            shippingDuplicateMessage(isDuplicateTrackingIdInDb)
            return
          }
          
        localforage.setItem("shipData", shippingData);
        showTimedNotifications({ title: 'Reminder', body: 'Tracking input saved.' });
    })
}

const validateShipperEmail = (email) => {
    const finalizeSignInputEle = document.getElementById('finalizeSignInput');
    if (finalizeSignInputEle.value.toUpperCase() !== email.toUpperCase()) {
        showNotifications({ title: 'Error Shipping Box(es)', body: `Email mismatch. You entered: ${finalizeSignInputEle.value}, which does not match the email on record.` });
        return false;
    }
    return true;
}

/**
 * Handle 'Sign' button click
 * @param {object} boxIdAndTrackingObj eg: {Box1: {959708259: '123456789012', specimens:{'CXA001234 0008':{...}} }}
 * @param {string} userName 
 * @param {string} boxWithTempMonitor boxId of box with temp monitor (eg: 'Box10') 
 * @param {string} shipmentCourier name of shipment courier (eg: 'FedEx')
 */
export const addEventCompleteShippingButton = (boxIdAndTrackingObj, userName, boxWithTempMonitor, shipmentCourier) => {
    const finalizeModalSignElement = document.getElementById('finalizeModalSign');
    const finalizeModalCancelElement = document.getElementById('finalizeModalCancel');

    const finalizeAndShip = async () => {
        if (!validateShipperEmail(userName)) return;

        const commonShippingData = {
            [conceptIds.shipmentCourier]: conceptIds[shipmentCourier],
            [conceptIds.shippedByFirstName]: userName,
            boxWithTempMonitor,
        };

        const boxIdToTrackingNumberObj = Object.fromEntries(
            Object.entries(boxIdAndTrackingObj).map(
                ([boxId, value]) => [boxId, value[conceptIds.shippingTrackingNumber]]
            )
        );

        try {
            showAnimation();
            const shipment = await ship(boxIdToTrackingNumberObj, commonShippingData);
            hideAnimation();

            if (shipment.code === 200) {
                boxWithTempMonitor && (await updateNewTempDate());
                finalizeModalCancelElement.click();
                localforage.removeItem('shipData');
                showNotifications({ title: 'Success Shipping Box(es)', body: 'Box(es) Shipped Successfully! No other changes can be made to the boxes that were just shipped.' }, 10000);
                startShipping(userName);
            } else {
                showNotifications({ title: 'Error Shipping Box(es)', body: `There was an error shipping the box(es). Please try again: ${shipment.message}` });
            }
        } catch (error) {
            showNotifications({ title: 'Error Shipping Box(es)', body: `There was an error shipping the box(es). Please try again: ${error}` });
        }
    }

    const finalizeModalCancelClickHandler = () => {
        const errorMessageEle = document.getElementById('finalizeModalError');
        errorMessageEle.style.display = "none";
        errorMessageEle.textContent = `*Please type in ${userName}`;
    };

    // Remove event listeners, then add them (ensure no duplicates)
    finalizeModalSignElement.removeEventListener('click', finalizeAndShip);
    finalizeModalCancelElement.removeEventListener('click', finalizeModalCancelClickHandler);

    finalizeModalSignElement.addEventListener('click', finalizeAndShip);
    finalizeModalCancelElement.addEventListener('click', finalizeModalCancelClickHandler);
}

export const populateFinalCheck = (boxIdAndTrackingObj) => {
    let table = document.getElementById('finalCheckTable');
    let boxIdArray = Object.keys(boxIdAndTrackingObj).sort(compareBoxIds);
    for (const boxId of boxIdArray) {
        const trackingNumber = boxIdAndTrackingObj[boxId][conceptIds.shippingTrackingNumber];
        const specimenObj = boxIdAndTrackingObj[boxId]['specimens'];
        const bagArray = Object.keys(specimenObj);
        const numBags = specimenObj['orphans'] ? bagArray.length - 1 : bagArray.length;
        let numTubes = 0;

        for (const bag of bagArray) {
            numTubes += specimenObj[bag]['arrElements']?.length ?? 0;
        }

        let row = table.insertRow();
        row.insertCell().textContent = boxId;
        row.insertCell().textContent = trackingNumber;
        row.insertCell().textContent = numTubes;
        row.insertCell().textContent = numBags;
    }
}

export const addEventContactInformationModal = (data) => {
    const btn = document.getElementById('contactInformationModal');
    btn.addEventListener('click', () => {
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `<h5 class="modal-title">Contact Information</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>`;
        body.innerHTML = `
            <div class="row">
                <div class="col">${data['736251808']}, ${data['471168198']}</div>
                <div class="ml-auto">Connect ID: <svg id="connectIdBarCodeModal"></svg></div>
            </div>
            <div class="row">
                <div class="col">
                    <button class="btn btn-outline-primary disabled" disabled>EDIT</button>
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col">
                    <strong>Address:</strong> ${data['521824358']}${data['442166669'] ? ` ${data['442166669']}` : ''} ${data['703385619']} ${data['634434746']} ${data['892050548']}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Email(s):</strong> ${data['869588347'] ? data['869588347'] : ''}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Phone:</strong> ${data['388711124'] ? data['388711124'] : ''}
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col">
                    <button type="button" class="btn btn-outline-success" data-dismiss="modal" aria-label="Close">
                        Information verified
                    </button>
                </div>
            </div>
        `;
        generateBarCode('connectIdBarCodeModal', data.Connect_ID);
    });
};

export const addEventQRCodeBtn = () => {
    const btns = Array.from(document.getElementsByClassName('qr-code-dashboard'));
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const header = document.getElementById('biospecimenModalHeader');
            const body = document.getElementById('biospecimenModalBody');
            header.innerHTML = `<h5 class="modal-title">QR Code</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>`;

            body.innerHTML = `
                <div class="row">
                    <div class="col">
                        <img src="./static/images/dashboard_QR.PNG" height="80%" width="60%" alt="QR Code">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-outline-dark" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
            `;
        });
    })
}

export const addEventClearScannedBarcode = (id) => {
    const clearInputBtn = document.getElementById(id);
    clearInputBtn.hidden = false;
    clearInputBtn.addEventListener('click', () => {
        clearInputBtn.dataset.enableInput.split(',').forEach(ele => disableInput(ele, false));
        document.getElementById(clearInputBtn.dataset.barcodeInput).value = '';
        clearInputBtn.hidden = true;
    });
}

export const populateCourierBox = async () => {
    let couriers = await getSiteCouriers();
    let selectBox = document.getElementById('courierSelect');
    for (let i = 0; i < couriers.length; i++) {
        let currElement = document.createElement('option');
        currElement.textContent = couriers[i];
        selectBox.appendChild(currElement);
    }

}

export const handleBoxReportsData = async (filter, source) => {
    const currReportPageNum = appState.getState().reportData.currReportPageNum;
    let reportPageBoxData = appState.getState().reportData.reportPageBoxData;
    if (!reportPageBoxData) {
        try {
            showAnimation();
            reportPageBoxData = await getPage(currReportPageNum, 5, conceptIds.shippingShipDate.toString(), filter, source);
            
            const stateUpdateObj = {
                ...appState.getState(),
                reportData: {
                    ...appState.getState().reportData,
                    reportPageBoxData
                }
            };

            appState.setState(stateUpdateObj);
            hideAnimation();
        } catch (error) {
            hideAnimation();
            showNotifications({ title: 'Error fetching data', body: error.message });
            return;
        }
    }

    populateBoxReportsTable(source);
}

const populateBoxReportsTable = (source) => {
    const reportPageBoxData = appState.getState().reportData.reportPageBoxData;
    const currTable = document.getElementById('boxTable')
    currTable.innerHTML = ''
    let rowCount = currTable.rows.length;
    let currRow = currTable.insertRow(rowCount);
    currRow.insertCell(0).innerText = "Tracking Number";
    currRow.insertCell(1).innerText = "Date Shipped";
    currRow.insertCell(2).innerText = "Shipping Location";
    currRow.insertCell(3).innerText = "Box Id";
    currRow.insertCell(4).innerText = "View Manifest";
    currRow.insertCell(5).innerHTML = `Received<span style="display:block;">(Yes/No)</span>`;
    currRow.insertCell(6).innerText = "Date Received";
    currRow.insertCell(7).innerText = "Condition";
    currRow.insertCell(8).innerText = "Comments";

    for (let i = 0; i < reportPageBoxData.data.length; i++) {
        rowCount = currTable.rows.length;
        currRow = currTable.insertRow(rowCount);
        const currBox = convertToOldBox(reportPageBoxData.data[i]);
        const trackingNumber = currBox[conceptIds.shippingTrackingNumber] ?? '';
        const shippedDate = currBox[conceptIds.shippingShipDate] ? retrieveDateFromIsoString(currBox[conceptIds.shippingShipDate]) : '';
        const receivedDate = currBox[conceptIds.siteShipmentDateReceived] ? retrieveDateFromIsoString(currBox[conceptIds.siteShipmentDateReceived]) : '';
        const packagedCondition = currBox[conceptIds.packageCondition] || '';
        const shippingLocation = conceptIdToSiteSpecificLocation[currBox[conceptIds.shippingLocation]];
        const boxId = currBox[conceptIds.shippingBoxId];
        const viewManifestButton = '<button type="button" class="button btn btn-info" id="reportsViewManifest' + i + '">View manifest</button>';
        const isReceived = currBox[conceptIds.siteShipmentReceived] === conceptIds.yes ? 'Yes' : 'No';
        const packageConditionValue = convertConceptIdToPackageCondition(packagedCondition, packageConditionConversion);
        const packageComments = currBox[conceptIds.siteShipmentComments] || '';

        currRow.insertCell(0).innerText = trackingNumber;
        currRow.insertCell(1).innerText = shippedDate;
        currRow.insertCell(2).innerText = shippingLocation;
        currRow.insertCell(3).innerText = boxId;
        currRow.insertCell(4).innerHTML = viewManifestButton;
        currRow.insertCell(5).innerText = isReceived;
        currRow.insertCell(6).innerText = receivedDate;
        currRow.insertCell(7).innerHTML = packageConditionValue;
        currRow.insertCell(8).innerText = packageComments;
        
        addEventViewManifestButton('reportsViewManifest' + i, currBox, source);
    }
}

export const addEventViewManifestButton = (buttonId, currPage, source) => {
    const button = document.getElementById(buttonId);
    button && button.addEventListener('click', () => {
        showReportsManifest(currPage, source);
    });
}

export const populateReportManifestHeader = (currPage) => {
    const currShippingLocationNumber = currPage[conceptIds.shippingLocation];
    const currShippingLocationNumberObj = locationConceptIDToLocationMap[currShippingLocationNumber];

    let newDiv = document.createElement("div");
    let newP = document.createElement("p");
    newP.innerHTML = currPage[conceptIds.shippingBoxId] + " Manifest";
    newP.setAttribute("style", "font-size: 1.5rem; font-weight:bold;");
    document.getElementById('boxManifestCol1').appendChild(newP);

    let toInsertDateStarted = '';
    if (currPage.hasOwnProperty(conceptIds.firstBagAddedToBoxTimestamp)) {
        const dateStarted = Date.parse(currPage[conceptIds.firstBagAddedToBoxTimestamp]);
        const currentdate = new Date(dateStarted);

        toInsertDateStarted = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear()
    }

    let toInsertDateShipped = ''
    if (currPage.hasOwnProperty(conceptIds.shippingShipDate)) {
        const dateStarted = currPage[conceptIds.shippingShipDate];
        const currentdate = new Date(dateStarted);

        toInsertDateShipped = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear()
    }

    newP = document.createElement("p");
    newP.innerHTML = "Date Started: " + toInsertDateStarted;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newP = document.createElement("p");
    newP.innerHTML = "Date Shipped: " + toInsertDateShipped;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newDiv.innerHTML = displayManifestContactInfo(currShippingLocationNumberObj);
    document.getElementById('boxManifestCol1').appendChild(newDiv);
}

export const populateReportManifestTable = (currPage, searchSpecimenInstituteArray) => {
    const currTable = document.getElementById('boxManifestTable');
    const replacementTubeLabelObj = findReplacementTubeLabels(searchSpecimenInstituteArray);
    let bags = Object.keys(currPage['bags']);    
    let rowCount = 1;
    for (let i = 0; i < bags.length; i++) {
        let tubes = currPage['bags'][bags[i]]['arrElements'];
        for (let j = 0; j < tubes.length; j++) {
            const currTube = tubes[j]
            let currRow = currTable.insertRow(rowCount);
            if (j == 0) {
                currRow.insertCell(0).innerHTML = bags[i];
            } else {
                currRow.insertCell(0).innerHTML = '';
            }
            currRow.insertCell(1).innerHTML = currTube;
            let thisId = currTube.split(' ');
            let toAddType = 'N/A';
            if (Object.prototype.hasOwnProperty.call(translateNumToType, thisId[1])) {
                toAddType = translateNumToType[thisId[1]];
            }
            if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, currTube)) {
                const [, originalTubeId] = replacementTubeLabelObj[currTube].split(' ');
                if (Object.prototype.hasOwnProperty.call(translateNumToType, originalTubeId)) {
                    toAddType = translateNumToType[originalTubeId];
                }
            }
            currRow.insertCell(2).innerHTML = toAddType;
            let fullScannerName = '';
            let currBox = currPage['bags'];
            if (currBox[bags[i]].hasOwnProperty('469819603') && j == 0) {
                fullScannerName += currBox[bags[i]]['469819603'] + ' ';
            }
            if (currBox[bags[i]].hasOwnProperty('618036638') && j == 0) {
                fullScannerName += currBox[bags[i]]['618036638'];
            }
            addDeviationTypeCommentsContentReports(searchSpecimenInstituteArray, currTube, currRow, i);
            rowCount += 1;
        }
    }
}

/**
 * Pagination for the box reports includes first, previous, next, last, and go to page functionality.
 * @param {object} filter - filter object used for fetching the data.
 * @param {string} source - source of the data (eg: null or 'bptlShippingReport')
 */
export const addPaginationFunctionality = (filter, source) => {
    const numReportPages = appState.getState().reportData.numReportPages;
    let currPageNum = appState.getState().reportData.currReportPageNum || 1;

    const paginationButtons = document.getElementById('paginationButtons');
    paginationButtons.innerHTML = `<ul class="pagination">
                                        <li class="page-item" id="firstPage"><button class="page-link" >First</button></li>
                                        <li class="page-item" id="previousPage"><button class="page-link" >Previous</button></li>
                                        <li class="page-item" id="thisPage"><a class="page-link"  id = "middlePage">${currPageNum}</a></li>
                                        <li class="page-item" id="nextPage"><button class="page-link">Next</button></li>
                                        <li class="page-item" id="lastPage"><button class="page-link">Last</button></li>
                                        <li class="page-item" style="margin-left: 40px;"><input type="text" class="page-link" id="goToPageInput" placeholder="Enter page number" /></li>
                                        <li class="page-item"><button class="page-link" id="goToPageButton">Go to page</button></li>
                                    </ul>`
    const firstEle = document.getElementById('firstPage');
    const previousEle = document.getElementById('previousPage');
    const nextEle = document.getElementById('nextPage');
    const lastEle = document.getElementById('lastPage');
    const currPageEle = document.getElementById('middlePage');

    // Update the current page number and the UI, then load the new page
    const setPage = (targetPageNum) => {
        const newPageNum = parseInt(targetPageNum, 10);
        if (currPageNum === newPageNum) return;

        currPageNum = newPageNum;
        currPageEle.innerHTML = currPageNum;

        const stateUpdateObj = {
            ...appState.getState(),
            reportData: {
                ...appState.getState().reportData,
                currReportPageNum: currPageNum,
                reportPageBoxData: null
            }
        };

        appState.setState(stateUpdateObj);

        handleBoxReportsData(filter, source);

    }

    firstEle.addEventListener('click', () => {
        setPage(1)
    });

    previousEle.addEventListener('click', () => {
        if (currPageNum > 1) setPage(currPageNum - 1);
    });

    nextEle.addEventListener('click', () => {
        if (currPageNum < numReportPages) setPage(currPageNum + 1);
    });

    lastEle.addEventListener('click', () => {
        setPage(numReportPages)
    });

    // Enable go to page feature.
    document.getElementById('goToPageButton').addEventListener('click', () => {
        const input = document.getElementById('goToPageInput');
        const pageNumber = parseInt(input.value.trim(), 10);
    
        // Validate the input to ensure it's a valid page number within the range
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numReportPages) {
            setPage(pageNumber);
        } else if (!isNaN(pageNumber) && (pageNumber < 1)) {
            setPage(1);
        } else if (!isNaN(pageNumber) && (pageNumber > numReportPages)) {
            setPage(numReportPages);
        } else {
            alert(`Please enter a valid page number (1 - ${numReportPages}).`);
        }
    
        input.value = '';
    });

    // Enable page navigation using the 'Enter' key.
    document.getElementById('goToPageInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('goToPageButton').click();
        }
    });
}

export const addEventFilter = (source) => {
    const filterButton = document.getElementById('submitFilter');
    filterButton && filterButton.addEventListener('click', async () => {
        const trackingId = document.getElementById('trackingIdInput')?.value.trim() ?? '';
        const startDate = document.getElementById('startDate')?.value ?? '';
        const endDate = document.getElementById('endDate')?.value ?? '';
        let filter = {};
        if (trackingId !== "") {
            filter['trackingId'] = trackingId;
        }
        if (startDate !== "") {
            let startDateUnix = Date.parse(startDate + ' 00:00')
            filter['startDate'] = new Date(startDateUnix).toISOString()
        }
        if (endDate !== "") {
            let endDateUnix = Date.parse(endDate + ' 23:59')
            filter['endDate'] = new Date(endDateUnix).toISOString()
            if (startDate !== "") {
                if (filter['endDate'] <= filter['startDate']) { // endDate being less than startDate, unix format will be greater the more current date and time 
                    showNotifications({ title: 'Date Input Error', body: 'End date must be after start date. Please edit these dates and try again.' });
                    return;
                }
            }
        }

        try {
            showAnimation();
            const numReportPages = await getNumPages(5, filter, source);

            const stateUpdateObj = {
                ...appState.getState(),
                reportData: {
                    currReportPageNum: 1,
                    reportPageBoxData: null,
                    numReportPages,
                }
            };

            appState.setState(stateUpdateObj);

            handleBoxReportsData(filter, source);
            addPaginationFunctionality(filter, source);
            hideAnimation();
        } catch (error) {
            hideAnimation();
            showNotifications({ title: 'Error fetching data', body: error.message });
        }
    });
}

/**
 * Search for the specimenId in the shipped boxes
 * @param {array<object>} allBoxesList - list of all boxes for the healthcare provider
 * @param {string} masterSpecimenId - specimenId to search for
 * @returns {boolean} true if the specimenId is found in the shipped boxes, false otherwise.
 * If the specimenId is a masterId, search for the key in the bags.
 * If the bag is unlabelled, search arrElements for the key.
 */
export const isScannedIdShipped = async (allBoxesList, masterSpecimenId) => {
    if (!allBoxesList.length) return false;

    const [collectionId, specimenIdType] = masterSpecimenId.split(' ');
    const isMasterId = ['0007', '0008', '0009'].includes(specimenIdType);

    for (const box of allBoxesList) {
        if (box[conceptIds.submitShipmentFlag] !== conceptIds.yes) continue;
        
        const { bags } = box;
        if (isMasterId) {
            if (bags[masterSpecimenId] || (bags.unlabelled && bags.unlabelled.arrElements.includes(masterSpecimenId))) {
                return true;
            }
        } else {
            for (const bagId in bags) {
                if (bags[bagId].arrElements.includes(masterSpecimenId)) {
                    return true;
                }
            }
        }
    }

    const searchedSpecimen = await getSpecimensByCollectionIds([collectionId]);
    for (const specimen of searchedSpecimen) {
        const specimenData = specimen.data;
        if (specimenData[conceptIds.boxedStatus] === conceptIds.boxed) {
            return true;
        }
    }

    return false;
};

const findScannedIdInUnshippedBoxes = (allBoxesList, masterSpecimenId) => {
    const buildFoundDataObj = (box) => {
        const dataObj = {};
        dataObj['foundMatch'] = true;
        dataObj[conceptIds.shippingLocation] = box[conceptIds.shippingLocation];
        dataObj[conceptIds.shippingBoxId] = box[conceptIds.shippingBoxId];
        dataObj['inputScanned'] = masterSpecimenId;
        return dataObj;
    }
    
    const specimenIdType = masterSpecimenId.split(' ')[1];
    const isMasterId = ['0007', '0008', '0009'].includes(specimenIdType);
    let dataObj = {"inputScanned": masterSpecimenId};

    for (const box of allBoxesList) {
        if (box[conceptIds.submitShipmentFlag] === conceptIds.yes) continue;        
        const { bags } = box;

        if (isMasterId) {
            if (bags[masterSpecimenId] || (bags.unlabelled && bags.unlabelled.arrElements.includes(masterSpecimenId))) {
                dataObj = buildFoundDataObj(box);
                return dataObj;
            }
        } else {
            for (const bagId in bags) {
                if (bags[bagId]?.arrElements?.includes(masterSpecimenId)) {
                    dataObj = buildFoundDataObj(box);
                    return dataObj;
                }
            }
        }
    }

    return dataObj;
  }

  /**
 * Function to add content to deviation type and comments cells in the manifest table
 * @param {string} tubeDetail - tube with deviation data
 * @param {object} currRow - current row of the manifest table
 * @param {number} bagsArrayIndex - current index of the bags array
*/
export const addDeviationTypeCommentsContent = (tubeDetail, currRow, bagsArrayIndex) => {
    if (!tubeDetail) return;
    
    const acceptedDeviationArray = getSpecimenDeviation(tubeDetail);
    const currTubeComments = getSpecimenComments(tubeDetail);
    const deviationTypeCell = currRow.insertCell(3);
    const commentCell = currRow.insertCell(4);
    deviationTypeCell.classList.add('deviation-type-cell');
    commentCell.classList.add('comments-cell');
    
    if (acceptedDeviationArray.length >= 1) {
        let deviationString = '';
        for (const deviationLabel of acceptedDeviationArray) {
            deviationString += `${deviationLabel} <br>`;
        }
        deviationTypeCell.innerHTML = deviationString;
    } else {
        deviationTypeCell.innerHTML = `<br>`;
    }
    commentCell.innerHTML = currTubeComments;
    
    if (bagsArrayIndex % 2 === 0) {
        currRow.style['background-color'] = 'lightgrey';
    }
}

/** 
 *  Returns an array of deviation type name(s) for a single specimen tube id or an empty array if no deviation type found.
 *  @param {object} tubeDetail - tube with deviation data.
 *  @returns {array} Example array - ['Hemolysis present'].
 *  DeviationObj - current tube's deviation keys with yes or no values.
 *  Push to acceptedDeviationArr if deviation not found in the the refused shipping deviation list and deviation exists.
*/
export const getSpecimenDeviation = (tubeDetail) => {
    const acceptedDeviationArr = [];
    if (tubeDetail[conceptIds.collection.tube.isCollected] === conceptIds.yes &&
        tubeDetail[conceptIds.collection.tube.isDeviated] === conceptIds.yes) { 
        const deviationObj = tubeDetail[conceptIds.collection.tube.deviation];
        if (deviationObj) {
            for (const deviation in deviationObj) {
                if (!refusedShippingDeviationConceptList.includes(parseInt(deviation)) && deviationObj[deviation] === conceptIds.yes) {
                    acceptedDeviationArr.push(deviationReasons.find(deviationReason => deviationReason['concept'] === parseInt(deviation))?.['label']);
                }
            }
        }
    }
    return acceptedDeviationArr;
}

/**
 * Returns a string of the Full Specimen ID's comments
 * @param {object} tubeDetail - tube with deviation data
 */
export const getSpecimenComments = (tubeDetail) => {
    return tubeDetail[conceptIds.collection.tube.deviationComments] ?? '';
}

/** 
 *  Returns an array of deviation type name(s) for a single specimen tube id or an empty array if no deviation type found
 *  @param {array} searchSpecimenInstituteArray - firestore biospecimen collection data array of objects or empty array depending on response
 *  @param {string} currTube - current specimen tube id to filter searchSpecimenInstituteArray - Ex. 'CXA321789 0001'
 *  @returns {array} Example array - ['Hemolysis present']
*/ 
export const getSpecimenDeviationReports = (searchSpecimenInstituteArray, currTube) => {
    const { collection } = conceptIds
    const { scannedId, isCollected, isDeviated, deviation } = conceptIds.collection.tube;
    const [collectionId, tubeId] = currTube.split(/\s+/);
    const tubeIdDeviationReasonArray = deviationReasons;
    const specimenObj = searchSpecimenInstituteArray.find(specimen => (specimen[collection.id] === collectionId)) ?? {};
    const acceptedDeviationArr = [];

    for (const key in specimenObj) {
        const currSpecimenKey = specimenObj[key]
        // loop over all properties to find scannedId property - 825582494 
        if (currSpecimenKey[scannedId] === currTube && currSpecimenKey[isCollected] === conceptIds.yes && currSpecimenKey[isDeviated] === conceptIds.yes) { 
            // deviationObj - current tube's deviation keys with yes or no values 
            const deviationObj = currSpecimenKey[deviation];
            if (deviationObj) {
                for (const deviation in deviationObj) {
                    // deviation not found in the the refused shipping deviation list and deviation exists
                    if (!refusedShippingDeviationConceptList.includes(parseInt(deviation)) && deviationObj[deviation] === conceptIds.yes) {
                        acceptedDeviationArr.push(tubeIdDeviationReasonArray.find(deviationReason => deviationReason['concept'] === parseInt(deviation))?.['label']);
                    }
                }
            }
        }
    }
    return acceptedDeviationArr;
}

/**
 * Returns a string of the Full Specimen ID's comments
 * @param {array} searchSpecimenInstituteArray - firestore biospecimen collection data array of objects or empty array depending on response
 * @param {string} currTube - current specimen tube id to filter searchSpecimenInstituteArray - Ex. 'CXA321789 0001'
 */
export const getSpecimenCommentsReports = (searchSpecimenInstituteArray, currTube) => {
    const { collection } = conceptIds;
    const deviationComments = collection.tube.deviationComments;
    const [collectionId, tubeId] = currTube.split(/\s+/);
    const specimenObj = searchSpecimenInstituteArray.find(specimen => (specimen[collection.id] === collectionId)) ?? {};
    const tubeIdToCid = specimenCollection['numToCid']?.[tubeId];
    return specimenObj[tubeIdToCid]?.[deviationComments] ?? '';
}

/**
 * Function to add content to deviation type and comments cells in the manifest table
 * @param {array} searchSpecimenInstituteArray - firestore biospecimen collection data array of objects or empty array depending on response
 * @param {string} currTube - current specimen tube id to filter searchSpecimenInstituteArray - Ex. 'CXA321789 0001'
 * @param {object} currRow - current row of the manifest table
 * @param {number} bagsArrayIndex - current index of the bags array
*/

export const addDeviationTypeCommentsContentReports = (searchSpecimenInstituteArray, currTube, currRow, bagsArrayIndex) => {
    if (currTube) {
        const acceptedDeviationArray = getSpecimenDeviationReports(searchSpecimenInstituteArray, currTube);
        const currTubeComments = getSpecimenCommentsReports(searchSpecimenInstituteArray, currTube);
        let deviationString = '';
        const deviationTypeCell = currRow.insertCell(3);
        deviationTypeCell.classList.add('deviation-type-cell');
        const commentCell = currRow.insertCell(4);
        commentCell.classList.add('comments-cell');

        if (acceptedDeviationArray.length >= 1) {
            for (const deviationLabel of acceptedDeviationArray) {
                deviationString += `${deviationLabel} <br>`;
            }
            deviationTypeCell.innerHTML = deviationString;
        } else {
            deviationTypeCell.innerHTML = `<br>`;
        }
        commentCell.innerHTML = currTubeComments;
    }
    
    if (bagsArrayIndex % 2 === 0) {
        currRow.style['background-color'] = 'lightgrey';
    }
}

const searchAvailableCollectionsForSpecimen = (specimenId) => {
    const availableCollectionsObj = appState.getState().availableCollectionsObj;
    if (specimenId.endsWith('0008') || specimenId.endsWith('0009')) {
        const specimenCollection = availableCollectionsObj?.[specimenId];
        if (specimenCollection) {
            return true;
        }
    } else {
        if (availableCollectionsObj?.['unlabelled'].includes(specimenId)) {
            return true;
        }
    }
    return false;
}
