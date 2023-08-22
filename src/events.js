import { appState, performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant,
        errorMessage, removeAllErrors, storeSpecimen, updateSpecimen, searchSpecimen, generateBarCode, filterSpecimenCollectionList, updateBox,
        ship, disableInput, updateNewTempDate, getSiteTubesLists, getWorkflow, 
        getSiteCouriers, getPage, getNumPages, removeSingleError, displayContactInformation, checkShipForage, checkAlertState, retrieveDateFromIsoString,
        convertConceptIdToPackageCondition, checkFedexShipDuplicate, shippingDuplicateMessage, checkInParticipant, checkOutParticipant, getCheckedInVisit, shippingPrintManifestReminder,
        checkNonAlphanumericStr, shippingNonAlphaNumericStrMessage, visitType, getParticipantCollections, updateBaselineData, getUpdatedParticipantData,
        siteSpecificLocationToConceptId, conceptIdToSiteSpecificLocation, locationConceptIDToLocationMap, updateCollectionSettingData, convertToOldBox, translateNumToType,
        getCollectionsByVisit, getUserProfile, checkDuplicateTrackingIdFromDb, checkAccessionId, checkSurveyEmailTrigger,
        packageConditonConversion, checkDerivedVariables, isDeviceMobile, replaceDateInputWithMaskedInput, requestsBlocker } from './shared.js';
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
import conceptIds from './fieldToConceptIdMapping.js';


export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
    if (!form) return;

    if (isDeviceMobile) {
      replaceDateInputWithMaskedInput(document.getElementById('dob'));
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
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

        if (!firstName && !lastName && !dob) return;

        let query = '';
        if (firstName) query += `firstName=${firstName}&`;
        if (lastName) query += `lastName=${lastName}&`;
        if (dob) query += `dob=${dob}`;
        
        performSearch(query);
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

export const addEventsearchSpecimen = () => {
    const form = document.getElementById('specimenLookupForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        removeAllErrors();
        let masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase();

        if(masterSpecimenId.length > masterSpecimenIDRequirement.length) masterSpecimenId = masterSpecimenId.substring(0, masterSpecimenIDRequirement.length);

        if (!masterSpecimenIDRequirement.regExp.test(masterSpecimenId) || masterSpecimenId.length !== masterSpecimenIDRequirement.length) {
            errorMessage('masterSpecimenId', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, true);
            return;
        }
        showAnimation();
        const biospecimen = await searchSpecimen(masterSpecimenId);
        if (biospecimen.code !== 200 || Object.keys(biospecimen.data).length === 0) {
            hideAnimation();
            showNotifications({ title: 'Not found', body: 'Specimen not found!' }, true)
            return
        }
        const biospecimenData = biospecimen.data;

        if(getWorkflow() === 'research') {
            if(biospecimenData[conceptIds.collection.collectionSetting] !== conceptIds.research) {
                hideAnimation();
                showNotifications({ title: 'Incorrect Dashboard', body: 'Clinical Collections cannot be viewed on Research Dashboard' }, true);
                return;
            }
        }
        else {
            if(biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.research) {
                hideAnimation();
                showNotifications({ title: 'Incorrect Dashboard', body: 'Research Collections cannot be viewed on Clinical Dashboard' }, true);
                return;
            }
        }

        let query = `connectId=${parseInt(biospecimenData.Connect_ID)}`;
        const response = await findParticipant(query);
        
        hideAnimation();
        const participantData = response.data[0];
        tubeCollectedTemplate(participantData, biospecimenData);
    })
}

// Add specimen to box using the allBoxesList from state.
// Return early if (1) no shipping location selected, (2) if the input is empty, (3) if item is already shipped, (4) if item is already in a box.
export const addEventAddSpecimenToBox = () => {
    const form = document.getElementById('addSpecimenForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const masterSpecimenIdInput = document.getElementById('masterSpecimenId');
        if (!masterSpecimenIdInput) return;
        const masterSpecimenId = masterSpecimenIdInput.value.toUpperCase().trim();

        const shippingLocationValue = document.getElementById('selectLocationList').value;
        if(shippingLocationValue === 'none') {
            showNotifications({ title: 'Shipping Location Not Selected', body: 'Please select a shipping location from the dropdown.' }, true);
            return;
        }
        if (masterSpecimenId === '') {
            showNotifications({ title: 'Empty Entry or Scan', body: 'Please enter or scan a specimen bag ID or Full Specimen ID.' }, true);
            return;
        }

        const allBoxesList = appState.getState().allBoxesList; 
        const foundScannedIdShipped = isScannedIdShipped(allBoxesList, masterSpecimenId);
        const scannedIdInUnshippedBoxes = findScannedIdInUnshippedBoxes(allBoxesList, masterSpecimenId);
        const isScannedIdInUnshippedBoxes = scannedIdInUnshippedBoxes['foundMatch'];
        
        if (foundScannedIdShipped){
            showNotifications({ title:'Item reported as already shipped', body: 'Please enter or scan another specimen bag ID or Full Specimen ID.'}, true);
            return;
        }
        
        if(isScannedIdInUnshippedBoxes) {
            const boxNum = scannedIdInUnshippedBoxes[conceptIds.shippingBoxId];
            const siteSpecificLocation = conceptIdToSiteSpecificLocation[scannedIdInUnshippedBoxes[conceptIds.shippingLocation]];
            const siteSpecificLocationName = siteSpecificLocation || '';
            const scannedInput = scannedIdInUnshippedBoxes['inputScanned'];
            showNotifications({ title:`${scannedInput} has already been recorded`, body: `${scannedInput} is recorded as being in ${boxNum} in ${siteSpecificLocationName}`}, true);
            return;
        }

        const specimenTablesResult = buildSpecimenDataInModal(masterSpecimenId);
        const biospecimensList = specimenTablesResult.biospecimensList;

        if (biospecimensList.length === 0) {
            showNotifications({ title: 'Item not found', body: `Item not reported as collected. Go to the Collection Dashboard to add specimen.` }, true);
            return;
        } else {
            document.getElementById('submitMasterSpecimenId').click();
        }
    });

    addEventSubmitSpecimenBuildModal();
}

const addEventSubmitSpecimenBuildModal = () => {
    const submitButtonSpecimen = document.getElementById('submitMasterSpecimenId');
    submitButtonSpecimen.addEventListener('click', async e => {
        e.preventDefault();
        renderShippingModalHeader();
        
        const masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase().trim();
        const specimenTablesResult = buildSpecimenDataInModal(masterSpecimenId);
        const foundInOrphan = specimenTablesResult.foundInOrphan;
        const biospecimensList = specimenTablesResult.biospecimensList;
        const tableIndex = specimenTablesResult.tableIndex;

        if (biospecimensList.length == 0) {
            showNotifications({ title: 'Not found', body: 'The specimen with entered search criteria was not found!' }, true);
            hideAnimation();
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(500);
            document.getElementById('shippingCloseButton').click();
            return;
        }

        createShippingModalBody(biospecimensList, masterSpecimenId, foundInOrphan);
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex, foundInOrphan);
    })
}

export const addEventAddSpecimensToListModalButton = (bagId, tableIndex, isOrphan) => {
    const submitButton = document.getElementById('addToBoxButton');
    submitButton.addEventListener('click', async e => {
        e.preventDefault();

        const boxList = appState.getState().allBoxesList;
        const locations = {};
        let boxIdAndBagsObj = {};
        for (let i = 0; i < boxList.length; i++) {
            const box = boxList[i];
            boxIdAndBagsObj[box[conceptIds.shippingBoxId]] = box['bags'];
            locations[box[conceptIds.shippingBoxId]] = box[conceptIds.shippingLocation];
        }

        const currBoxId = updateBoxListModalUIValue();
        boxIdAndBagsObj = processCheckedModalElements(boxIdAndBagsObj, bagId, currBoxId, isOrphan, tableIndex);

        if (boxIdAndBagsObj.hasOwnProperty(currBoxId)) {
            const boxToUpdate = prepareBoxToUpdate(currBoxId, boxList, boxIdAndBagsObj, locations);
            showAnimation();
            const boxUpdateResponse = await updateBox(boxToUpdate);
            hideAnimation();
            if (boxUpdateResponse.code === 200) {
                updateShippingStateAddBagToBox(currBoxId, bagId, boxToUpdate);
                await startShipping(appState.getState().userName, true, currBoxId);
            } else {
                showNotifications({ title: 'Error', body: 'Error updating box' }, true);
            }
        }
    }, { once: true })
}

export const getInstituteSpecimensList = async (boxList) => {
    boxList = boxList.sort((a,b) => compareBoxIds(a[conceptIds.shippingBoxId], b[conceptIds.shippingBoxId]));

    const finalizedSpecimenList = await filterSpecimenCollectionList();
    const availableCollectionsObj = {};

    // note: currently collections have no mouthwash specimens (0007)
    for (const currCollection of finalizedSpecimenList) {
        const tubesInBox = {
          shipped: {
            bloodUrine: [],
            mouthWash: [],
            orphan: [],
          },
          notShipped: {
            bloodUrine: [],
            mouthWash: [],
            orphan: [],
          },
        };

        // For each collection, get its blood/urine, mouthwash, and orphan specimens that are in the box already
        if (currCollection[conceptIds.collection.id]) {
            // todo: save box id in collection and remove box iteration.
            for (const box of boxList) {
                let boxIsShipped = false;
                if (box[conceptIds.submitShipmentFlag] == conceptIds.yes) {
                    boxIsShipped = true;
                }

                const bagObjects = box.bags;
                const bloodUrineBagId = currCollection[conceptIds.collection.id] + ' 0008';

                if (bagObjects[bloodUrineBagId]) {
                    const tubeIdList = bagObjects[bloodUrineBagId]['arrElements']
                    if (tubeIdList.length > 0) {
                        for (const tubeId of tubeIdList) {          
                            const tubeNum = tubeId.split(/\s+/)[1] // tubeId (eg 'CXA002655 0001'); tubeNum (eg '0001')
                            if (boxIsShipped ) {
                                tubesInBox.shipped.bloodUrine.push(tubeNum);
                            } else {
                                tubesInBox.notShipped.bloodUrine.push(tubeNum);
                            }
                        }
                    }
                }

                const mouthWashBagId = currCollection[conceptIds.collection.id] + ' 0009';
                if (bagObjects[mouthWashBagId]) {
                    const tubeIdList = bagObjects[mouthWashBagId]['arrElements']
                    for (const tubeId of tubeIdList) {
                        const tubeNum = tubeId.split(/\s+/)[1];
                        if (boxIsShipped ) {
                            tubesInBox.shipped.mouthWash.push(tubeNum);
                        } else {
                            tubesInBox.notShipped.mouthWash.push(tubeNum);
                        }
                    }
                }

                if (bagObjects['unlabelled']) {
                    let tubeIdList = bagObjects['unlabelled']['arrElements']

                    for (const tubeId of tubeIdList) {
                        const [collectionIdFromTube, tubeNumber] = tubeId.split(/\s+/);

                        if (collectionIdFromTube == currCollection[conceptIds.collection.id]) {
                            if (boxIsShipped ) {
                                tubesInBox.shipped.orphan.push(tubeNumber);
                            } else {
                                tubesInBox.notShipped.orphan.push(tubeNumber);
                            }
                        }
                    }
                }
            }
        }

        const tubesToAdd={
            bloodUrine: [],
            mouthWash: [],
            orphan: [],
          }

        for (let currCid of specimenCollection.tubeCidList) {
            const currTubeNum = specimenCollection.cidToNum[currCid];
            const currSpecimen = currCollection[currCid];

            if (!currSpecimen) continue;

            if (currTubeNum == '0007') {
                if (tubesInBox.shipped.mouthWash.includes(currTubeNum) || tubesInBox.notShipped.mouthWash.includes(currTubeNum)) {
                    continue;
                } else {
                    tubesToAdd.mouthWash.push(currTubeNum);
                }
            } else {
                if (tubesInBox.shipped.bloodUrine.includes(currTubeNum) || tubesInBox.shipped.orphan.includes(currTubeNum) || tubesInBox.notShipped.bloodUrine.includes(currTubeNum) || tubesInBox.notShipped.orphan.includes(currTubeNum)) {
                    continue;
                } else {
                    tubesToAdd.bloodUrine.push(currTubeNum);
                }
            }
        }

        if (tubesInBox.shipped.bloodUrine.length > 0 && tubesToAdd.bloodUrine.length > 0) {
            tubesToAdd.orphan=tubesToAdd.bloodUrine;
            tubesToAdd.bloodUrine=[];
        }

        for (const tubeNum of tubesToAdd.orphan) {
            if (!availableCollectionsObj['unlabelled']) {
                availableCollectionsObj['unlabelled'] = [];
            }
            availableCollectionsObj['unlabelled'].push(currCollection[conceptIds.collection.id] + ' ' + tubeNum);
        }

        if (tubesInBox.shipped.bloodUrine.length === 0 && tubesInBox.notShipped.bloodUrine.length ===0 && tubesToAdd.bloodUrine.length> 0) {
            availableCollectionsObj[currCollection[conceptIds.collection.id] + ' 0008'] = tubesToAdd.bloodUrine;
        }

        if (tubesInBox.shipped.mouthWash.length === 0 && tubesInBox.notShipped.mouthWash.length ===0 && tubesToAdd.mouthWash.length > 0) {
            availableCollectionsObj[currCollection[conceptIds.collection.id] + ' 0009'] = tubesToAdd.mouthWash;
        }
    }

    return { finalizedSpecimenList, availableCollectionsObj };
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
            showNotifications({ title: 'User already exists!', body: `User with email: <b>${data.email}</b> already exists` }, true);
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
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btnCheckIn = document.getElementById('checkInComplete');
        btnCheckIn.disabled = true;
        
        let query = `connectId=${parseInt(form.dataset.connectId)}`;
        
        const response = await findParticipant(query);
        const data = response.data[0];

        if(isCheckedIn) {
            
            checkOutParticipant(data);

            await swal({
                title: "Success",
                icon: "success",
                text: `Participant is checked out.`,
            });
            checkOutFlag === true ? location.reload() : goToParticipantSearch();
        }
        else {

            const visitConcept = document.getElementById('visit-select').value;
            
            for(const visit of visitType) {
                if(data['331584571'] && data['331584571'][visit.concept]) {
                    const visitTime = new Date(data['331584571'][visit.concept]['840048338']);
                    const now = new Date();
                    
                    if(now.getYear() == visitTime.getYear() && now.getMonth() == visitTime.getMonth() && now.getDate() == visitTime.getDate()) {

                        const response = await getParticipantCollections(data.token);
                        let collection = response.data.filter(res => res['331584571'] == visit.concept);
                        if (collection.length === 0) continue;

                        const confirmRepeat = await swal({
                            title: "Warning - Participant Previously Checked In",
                            icon: "warning",
                            text: "Participant " + data['399159511'] + " " + data['996038075'] + " was previously checked in on " + new Date(data['331584571'][visit.concept]['840048338']).toLocaleString() + " with Collection ID " + collection[0]['820476880'] + ".\r\nIf this is today, DO NOT check the participant in again.\r\nNote Collection ID above and see Check-In SOP for further instructions.\r\n\r\nIf this is is not today, you may check the participant in for an additional visit.",
                            buttons: {
                                cancel: {
                                    text: "Cancel",
                                    value: "cancel",
                                    visible: true,
                                    className: "btn btn-danger",
                                    closeModal: true,
                                },
                                confirm: {
                                    text: "Continue with Check-In",
                                    value: 'confirmed',
                                    visible: true,
                                    closeModal: true,
                                    className: "btn btn-success",
                                }
                            }
                        });

                        if (confirmRepeat === "cancel") return;
                    }
                }
            }

            await checkInParticipant(data, visitConcept);

            const confirmVal = await swal({
                title: "Success",
                icon: "success",
                text: "Participant is checked in.",
                buttons: {
                    cancel: {
                        text: "Close",
                        value: "cancel",
                        visible: true,
                        className: "btn btn-default",
                        closeModal: true,
                    },
                    confirm: {
                        text: "Continue to Specimen Link",
                        value: 'confirmed',
                        visible: true,
                        className: "",
                        closeModal: true,
                        className: "btn btn-success",
                    }
                },
            });

            if (confirmVal === "confirmed") {
                const updatedResponse = await findParticipant(query);
                const updatedData = updatedResponse.data[0];

                specimenTemplate(updatedData);
            }
        }
    });
};

export const addEventVisitSelection = () => {

    const visitSelection = document.getElementById('visit-select');
    if(visitSelection) {
        visitSelection.addEventListener('change', () => {

            const checkInButton = document.getElementById('checkInComplete');
            checkInButton.disabled = !visitSelection.value;
        });
    }
}

export const goToParticipantSearch = () => {
    document.getElementById('navBarSearch').click();
}

export const addEventSpecimenLinkForm = (formData) => {
    const form = document.getElementById('researchSpecimenContinue');
    const connectId = document.getElementById('researchSpecimenContinue').dataset.connectId;

    if (document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;

    form.addEventListener('click', async (e) => {
        e.preventDefault();
        const collections = await getCollectionsByVisit(formData);
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
     //   yesTriggerModal()
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
    const confirmVal = await swal({
        title: "Warning",
        icon: "warning",
        text: `The Following ${collections.length} Collection ID(s) already exist for this participant: 
        ${collections.map(collection => collection['820476880']).join(', ')}`,
        buttons: {
            cancel: {
                text: "Close",
                value: "cancel",
                visible: true,
                className: "btn btn-default",
                closeModal: true,
            },
            confirm: {
                text: "Add New Collection",
                value: 'confirmed',
                visible: true,
                className: "",
                closeModal: true,
                className: "btn btn-success",
            }
        },
    });

    if (confirmVal === "confirmed") {
        btnsClicked(connectId, formData);
    }
}

// todo: this function handles tangled situations. Needs to be refactored
/**
 * Handles events after collection ID is scanned and "Submit" is clicked
 * @param {string} connectId 
 * @param {*} formData 
 */
const btnsClicked = async (connectId, formData) => { 
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
    }
    else if (scanSpecimenID !== scanSpecimenID2 && !formData?.collectionId) {
        hasError = true;
        errorMessage('scanSpecimenID2', 'Entered Collection ID doesn\'t match.', focus, true);
    }
    else if (scanSpecimenID && scanSpecimenID2) {
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
    let confirmVal = '';

    if (!formData?.collectionId) {
        confirmVal = await swal({
            title: "Confirm Collection ID",
            icon: "info",
            text: `Collection ID: ${collectionID}\n Confirm ID is correct for participant: ${firstName}`,
            buttons: {
                cancel: {
                    text: "Cancel",
                    value: "cancel",
                    visible: true,
                    className: "btn btn-default",
                    closeModal: true,
                },
                back: {
                    text: "Confirm and Exit",
                    value: "back",
                    visible: true,
                    className: "btn btn-info",
                },
                confirm: {
                    text: "Confirm and Continue",
                    value: 'confirmed',
                    visible: true,
                    className: "",
                    closeModal: true,
                    className: "btn btn-success",
                }
            },
        });
    }

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

    if (specimenData?.Connect_ID && parseInt(specimenData.Connect_ID) !== particpantData.Connect_ID) {
        showNotifications({ title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different Connect ID.' }, true)
        return;
    }

    showAnimation();
    formData[conceptIds.collection.selectedVisit] = formData?.[conceptIds.collection.selectedVisit] || parseInt(getCheckedInVisit(particpantData));
    
    if (!formData?.collectionId) {
        const storeResponse = await storeSpecimen([formData]);  
        if (storeResponse.code === 400) {
            hideAnimation();
            showNotifications({ title: 'Specimen already exists!', body: `Collection ID ${collectionID} is already associated with a different Connect ID` }, true);
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

export const addEventBiospecimenCollectionForm = (participantData, biospecimenData) => {
    const collectionSaveExit = document.getElementById('collectionSave');
    collectionSaveExit.addEventListener('click', () => {
        collectionSubmission(participantData, biospecimenData);
    });

    const collectionSaveContinue = document.getElementById('collectionNext');
    collectionSaveContinue.addEventListener('click', () => {
        collectionSubmission(participantData, biospecimenData, true);
    });
};

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

export const addEventBiospecimenCollectionFormText = (participantData, biospecimenData) => {
    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));

    inputFields.forEach(input => {
        input.addEventListener('change', () => {
            const siteTubesList = getSiteTubesLists(biospecimenData)
            const tubes = siteTubesList.filter(participantData => participantData.concept === input.id.replace('Id', ''));

            removeSingleError(input.id);

            let value = getValue(`${input.id}`).toUpperCase();
            if (value.length != 0) {

                const tubeCheckBox = document.getElementById(input.id.replace('Id',''));

                if (tubeCheckBox) input.required = tubeCheckBox.checked;

                const masterID = value.substr(0, masterSpecimenIDRequirement.length);
                const tubeID = value.substr(masterSpecimenIDRequirement.length + 1, totalCollectionIDLength);

                if (input.required && value.length !== totalCollectionIDLength) {
                    errorMessage(input.id, `Combination of Collection ID and Full Specimen ID should be ${totalCollectionIDLength} characters long and in the following format CXA123456 1234.`);
                }
                else if (input.required && masterID !== biospecimenData['820476880']) {
                    errorMessage(input.id, 'Invalid Collection ID.');
                }
                else if (input.required && tubes.length === 0) {
                    errorMessage(input.id, 'Invalid Full Specimen ID.');
                }
                else if (input.required && (tubes[0].id !== tubeID && !additionalTubeIDRequirement.regExp.test(tubeID))) {
                    errorMessage(input.id, 'Invalid Full Specimen ID.');
                }
            }
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

const collectionSubmission = async (participantData, biospecimenData, cntd) => {
    removeAllErrors();

    if (getWorkflow() === 'research' && biospecimenData[conceptIds.collection.collectionTime] === undefined) biospecimenData[conceptIds.collection.collectionTime] = new Date().toISOString();

    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));
    const siteTubesList = getSiteTubesLists(biospecimenData);

    let hasError = false;
    let focus = true;
    let hasCntdError = false;

    inputFields.forEach(input => {
        const tubes = siteTubesList.filter(tube => tube.concept === input.id.replace('Id', ''));

        let value = getValue(`${input.id}`).toUpperCase();
        const masterID = value.substr(0, masterSpecimenIDRequirement.length);
        const tubeID = value.substr(masterSpecimenIDRequirement.length + 1, totalCollectionIDLength);

        const tubeCheckBox = document.getElementById(input.id.replace('Id',''));

        if (tubeCheckBox) input.required = tubeCheckBox.checked;

        if (!cntd && value.length === 0) return;

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

        if (input.required) biospecimenData[`${input.id.replace('Id', '')}`][conceptIds.collection.tube.scannedId] = `${masterID} ${tubeID}`.trim();
    });

    if ((hasError && cntd == true) || hasCntdError) return;

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

    if (cntd) {
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

    showAnimation();
    await updateSpecimen([biospecimenData]);
    
    const baselineVisit = (biospecimenData[conceptIds.collection.selectedVisit] === conceptIds.baseline.visitId);
    const clinicalResearchSetting = (biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.research || biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.clinical);

    await updateCollectionSettingData(biospecimenData, siteTubesList, participantData);

    if(baselineVisit && clinicalResearchSetting) {
        await updateBaselineData(siteTubesList, participantData);
    }

    await checkDerivedVariables({"token": participantData["token"]});

    if (cntd) {

        participantData = await getUpdatedParticipantData(participantData);
        const specimenData = (await searchSpecimen(biospecimenData[conceptIds.collection.id])).data;
        hideAnimation();
        finalizeTemplate(participantData, specimenData);
    }
    else {

        await swal({
            title: "Success",
            icon: "success",
            text: "Collection specimen data has been saved",
            buttons: {
                close: {
                    text: "Close",
                    value: "close",
                    visible: true,
                    className: "btn btn-success",
                    closeModal: true,
                }
            },
        });

        hideAnimation();
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

export const addEventFinalizeForm = (specimenData) => {
    const finalizedSaveExit = document.getElementById('finalizedSaveExit');
    finalizedSaveExit.addEventListener('click', () => {
        finalizeHandler(specimenData);
    });
}

export const addEventFinalizeFormCntd = (specimenData) => {
    const form = document.getElementById('finalizeForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        finalizeHandler(specimenData, true);
    });
}

// update the existing object in 'biospecimen' collection with finalized flag and timestamp
const finalizeHandler = async (biospecimenData, cntd) => {

    if (cntd) {
        showAnimation();

        biospecimenData[conceptIds.collection.isFinalized] = conceptIds.yes;
        biospecimenData[conceptIds.collection.finalizedTime] = new Date().toISOString();

        await updateSpecimen([biospecimenData]);

        hideAnimation();
        showNotifications({ title: 'Specimen Finalized', body: 'Collection Finalized Successfully!' });
    }

    searchTemplate();
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
        let shipSetForage = []
        let currTable = document.getElementById('saveTable')
        let tempCheckStatus = ""
        const currSiteSpecificName = document.getElementById('selectLocationList').value
        const currShippingLocationNumber = siteSpecificLocationToConceptId[currSiteSpecificName]
        appState.setState(state => ({shipping: {...state.shipping, locationNumber: currShippingLocationNumber}}));
        for (var r = 1; r < currTable.rows.length; r++) {

            let currCheck = currTable.rows[r].cells[0]
            if (currCheck.childNodes[0].checked) {
                let currBoxId = currTable.rows[r].cells[3].innerText;
                boxesToShip.push(currBoxId)
            }

        }

        if (selectedLocation === 'none') {
            await swal({
                title: "Reminder",
                icon: "warning",
                text: "Please Select 'Shipping Location'",
                className: "swal-no-box",
                buttons: {
                  confirm: {
                    text: "OK",
                    value: true,
                    visible: true,
                    closeModal: true,
                    className: "swal-no-box-button",
                  },
                },
              });
              return
        }

        if(!boxesToShip.length) {
          await swal({
            title: "Reminder",
            icon: "warning",
            text: "Please select Box(es) to review and ship",
            className: "swal-no-box",
            buttons: {
              confirm: {
                text: "OK",
                value: true,
                visible: true,
                closeModal: true,
                className: "swal-no-box-button",
              },
            },
          });
          return
        }

        tempCheckStatus = tempCheckedEl.checked 
        // Push empty item with boxId and empty tracking number string
        // shipSetForage used to handle empty localforage or no box id match
        boxesToShip.forEach(box => shipSetForage.push({ "boxId": box, [conceptIds.shippingTrackingNumber]: "" }));
        checkShipForage(shipSetForage,boxesToShip)
        //return box 1 info
        shippingPrintManifestReminder(boxesToShip, userName, tempCheckStatus, currShippingLocationNumber);
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
          showNotifications({ title: 'Invalid Fields', body: 'Please add valid inputs to fields.' }, true);
          return;
        }

        for (const boxId of boxIdArray) {
            const trackingId = document.getElementById(boxId + "trackingId").value.toUpperCase();
            const trackingIdConfirm = document.getElementById(boxId + "trackingIdConfirm").value.toUpperCase();
            if (trackingId === '' || trackingIdConfirm === '') {
                showNotifications({ title: 'Missing Fields', body: 'Please enter in shipment tracking numbers'}, true);
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
            await swal({
                title: 'Error!',
                icon: 'error',
                text: 'Tracking Ids do not match in one of the boxes.',
                timer: 1600,
              });
            return;
        }

        let isDuplicateTrackingIdInDb = await checkDuplicateTrackingIdFromDb(boxIdArray);
        if(isDuplicateTrackingIdInDb || (checkFedexShipDuplicate(boxIdArray) && boxIdArray.length > 1)){
            shippingDuplicateMessage(isDuplicateTrackingIdInDb)
            return
          }
          
        localforage.setItem("shipData", shippingData);
        await swal({
          title: 'Success!',
          icon: 'success',
          text: 'Tracking input saved',
          timer: 1600,
        });
    })
}

/**
 * Handle 'Sign' button click
 * @param {object} boxIdAndTrackingObj eg: {Box1: {959708259: '123456789012', specimens:{'CXA001234 0008':{...}} }}
 * @param {string} userName 
 * @param {string} boxWithTempMonitor boxId of box with temp monitor (eg: 'Box10') 
 * @param {string} shipmentCourier name of shipment courier (eg: 'FedEx')
 */
export const addEventCompleteShippingButton = (boxIdAndTrackingObj, userName, boxWithTempMonitor, shipmentCourier) => {
    document.getElementById('finalizeModalSign').addEventListener('click', async () => {
        const finalizeSignInputEle = document.getElementById('finalizeSignInput');
        const [firstName, lastName] = userName.split(/\s+/);
        const firstNameShipper = firstName ?? "";
        const lastNameShipper = lastName ?? "";
        const errorMessageEle = document.getElementById('finalizeModalError');

        if (finalizeSignInputEle.value.toUpperCase() !== userName.toUpperCase()) {
          errorMessageEle.style.display = "block";
          return;
        }

        // Block subsequent requests before the first one is completed
        if (requestsBlocker.isBlocking()) return;
        requestsBlocker.block();

        const commonShippingData = {
          666553960: conceptIds[shipmentCourier],
          948887825: firstNameShipper,
          885486943: lastNameShipper,
          boxWithTempMonitor,
        };
        let boxIdToTrackingNumberObj = {};

        for (const boxId in boxIdAndTrackingObj) {
          boxIdToTrackingNumberObj[boxId] = boxIdAndTrackingObj[boxId][conceptIds.shippingTrackingNumber];
        }

        const shipment = await ship(boxIdToTrackingNumberObj, commonShippingData);

        if (shipment.code === 200) {
          boxWithTempMonitor && (await updateNewTempDate());
          document.getElementById('finalizeModalCancel').click();
          alert('This shipment is now finalized; no other changes can be made');
          localforage.removeItem('shipData');
          startShipping(userName);
        } else {
          errorMessageEle.style.display = 'block';
          errorMessageEle.textContent =
            'There was an error when saving the shipment data.';

          if (shipment.code === 500) {
            errorMessageEle.textContent =
              'There was an error when saving the shipment data. Please sign again.';
          }
        }

        requestsBlocker.unblock();
    });

    // Restore error message after closing the modal, in multiple clicks
    document.getElementById('finalizeModalCancel').addEventListener('click', () => {
        const errorMessageEle = document.getElementById('finalizeModalError');
        errorMessageEle.style.display = "none";
        errorMessageEle.textContent = `*Please type in ${userName}`;
    });
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

export const populateBoxTable = async (page, filter) => {
    showAnimation();
    let pageStuff = await getPage(page, 5, '656548982', filter)
    let currTable = document.getElementById('boxTable')
    currTable.innerHTML = ''
    let rowCount = currTable.rows.length;
    let currRow = currTable.insertRow(rowCount);
    currRow.insertCell(0).innerHTML = "Tracking Number";
    currRow.insertCell(1).innerHTML = "Date Shipped";
    currRow.insertCell(2).innerHTML = "Shipping Location";
    currRow.insertCell(3).innerHTML = "Box Id";
    currRow.insertCell(4).innerHTML = "View Manifest";
    currRow.insertCell(5).innerHTML = `Received<span style="display:block;">(Yes/No)</span>`;
    currRow.insertCell(6).innerHTML = "Date Received";
    currRow.insertCell(7).innerHTML = "Condition";
    currRow.insertCell(8).innerHTML = "Comments"

    let conversion = {
        "712278213": "FedEx",
        "149772928": "World Courier"
    }
    
    for (let i = 0; i < pageStuff.data.length; i++) {
        rowCount = currTable.rows.length;
        currRow = currTable.insertRow(rowCount);
        let currPage = convertToOldBox(pageStuff.data[i]);
        let numTubes = 0;
        let keys = Object.keys(currPage['bags']);
        for (let j = 0; j < keys.length; j++) {
            numTubes += currPage['bags'][keys[j]]['arrElements'].length;
        }
        let shippedDate = ''
        let receivedDate = ''
        let packagedCondition = ''

        if (currPage.hasOwnProperty('656548982')) {
            const shippedDateStr = currPage['656548982'];
            shippedDate = retrieveDateFromIsoString(shippedDateStr)
        }

        if(currPage.hasOwnProperty('926457119')) {
            const receivedDateStr = currPage['926457119']
            receivedDate = retrieveDateFromIsoString(receivedDateStr)
        }

        if(currPage.hasOwnProperty('238268405')) {
          packagedCondition = currPage['238268405']
        }

        currRow.insertCell(0).innerHTML = currPage[conceptIds.shippingTrackingNumber] ?? '';
        currRow.insertCell(1).innerHTML = shippedDate;
        currRow.insertCell(2).innerHTML = conceptIdToSiteSpecificLocation[currPage['560975149']];
        currRow.insertCell(3).innerHTML = currPage['132929440'];
        currRow.insertCell(4).innerHTML = '<button type="button" class="button btn btn-info" id="reportsViewManifest' + i + '">View manifest</button>';
        currRow.insertCell(5).innerHTML = currPage.hasOwnProperty('333524031') ? "Yes" : "No"
        currRow.insertCell(6).innerHTML = receivedDate;
        currRow.insertCell(7).innerHTML = convertConceptIdToPackageCondition(packagedCondition, packageConditonConversion);
        currRow.insertCell(8).innerHTML = currPage.hasOwnProperty('870456401') ? currPage['870456401'] : '' ;
        addEventViewManifestButton('reportsViewManifest' + i, currPage);

    }
    hideAnimation();
}

export const addEventViewManifestButton = (buttonId, currPage) => {
    let button = document.getElementById(buttonId);
    button.addEventListener('click', () => {
        showReportsManifest(currPage);
    });
}


export const populateReportManifestHeader = (currPage) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")
    let siteAcronym = currPage["siteAcronym"]

    let currShippingLocationNumber = currPage['560975149']
    const currContactInfo = locationConceptIDToLocationMap[currShippingLocationNumber]["contactInfo"][siteAcronym]

    let newDiv = document.createElement("div")
    let newP = document.createElement("p");
    newP.innerHTML = currPage['132929440'] + " Manifest";
    newP.setAttribute("style", "font-size: 1.5rem; font-weight:bold;")
    document.getElementById('boxManifestCol1').appendChild(newP);

    let toInsertDateStarted = ''
    if (currPage.hasOwnProperty('672863981')) { // 672863981 - Autogenerated date/time when first bag added to box
        let dateStarted = Date.parse(currPage['672863981'])

        let currentdate = new Date(dateStarted);
        let ampm = parseInt(currentdate.getHours()) / 12 >= 1 ? "PM" : "AM";
        let hour = parseInt(currentdate.getHours()) % 12;
        toInsertDateStarted = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear()
        /*+ " "  
        + hour.toString()+ ":"  
        + currentdate.getMinutes() + ampm;
*/
    }
    let toInsertDateShipped = ''
    if (currPage.hasOwnProperty('656548982')) { // 656548982 - Autogenerated date/time stamp for submit shipment time
        let dateStarted = currPage['656548982']

        let currentdate = new Date(dateStarted);
        let ampm = parseInt(currentdate.getHours()) / 12 >= 1 ? "PM" : "AM";
        let hour = parseInt(currentdate.getHours()) % 12;
        toInsertDateShipped = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear()
        /*+ " "  
        + hour.toString()+ ":"  
        + currentdate.getMinutes() + ampm;
*/
    }
    newP = document.createElement("p");
    newP.innerHTML = "Date Started: " + toInsertDateStarted;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newP = document.createElement("p");
    newP.innerHTML = "Date Shipped: " + toInsertDateShipped;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newDiv.innerHTML = displayContactInformation(currContactInfo)
    document.getElementById('boxManifestCol1').appendChild(newDiv)
}

export const populateReportManifestTable = (currPage, searchSpecimenInstituteArray) => {
    const currTable = document.getElementById('boxManifestTable');
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
            if (translateNumToType.hasOwnProperty(thisId[1])) {
                toAddType = translateNumToType[thisId[1]];
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

export const addPaginationFunctionality = (lastPage, filter) => {
    let paginationButtons = document.getElementById('paginationButtons');
    paginationButtons.innterHTML = ""
    paginationButtons.innerHTML = `<ul class="pagination">
                                        <li class="page-item" id="firstPage"><button class="page-link" >First</button></li>
                                        <li class="page-item" id="previousPage"><button class="page-link" >Previous</button></li>
                                        <li class="page-item" id="thisPage"><a class="page-link"  id = "middlePage">1</a></li>
                                        <li class="page-item" id="nextPage"><button class="page-link">Next</button></li>
                                        <li class="page-item" id="lastPage"><button class="page-link">Last</button></li>
                                    </ul>`
    let first = document.getElementById('firstPage');
    let previous = document.getElementById('previousPage');
    let current = document.getElementById('thisPage');
    let next = document.getElementById('nextPage');
    let final = document.getElementById('lastPage');
    let middleNumber = document.getElementById('middlePage');

    first.addEventListener('click', () => {
        middleNumber.innerHTML = '1'
        populateBoxTable(0, filter)
    })

    previous.addEventListener('click', () => {
        middleNumber.innerHTML = middleNumber.innerHTML == '1' ? '1' : parseInt(middleNumber.innerHTML) - 1;
        populateBoxTable(parseInt(middleNumber.innerHTML) - 1, filter)
    })

    next.addEventListener('click', () => {
        middleNumber.innerHTML = parseInt(middleNumber.innerHTML) >= lastPage ? (lastPage == 0 ? 1 : lastPage.toString()) : parseInt(middleNumber.innerHTML) + 1;
        populateBoxTable(parseInt(middleNumber.innerHTML) - 1, filter)
    })

    final.addEventListener('click', () => {
        middleNumber.innerHTML = lastPage == 0 ? 1 : lastPage;
        populateBoxTable(lastPage == 0 ? 0 : lastPage - 1, filter)
    })


}

export const addEventFilter = () => {

    let filterButton = document.getElementById('submitFilter');
    filterButton.addEventListener('click', async () => {
        let trackingId = document.getElementById('trackingIdInput').value.trim();

        let startDate = document.getElementById('startDate').value;
        let endDate = document.getElementById('endDate').value;
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
                    //throw error
                    return;
                }
            }

        }
        populateBoxTable(0, filter);
        let numPages = await getNumPages(5, filter);
        addPaginationFunctionality(numPages, filter);
    });
}

/**
 * Search for the specimenId in the shipped boxes
 * @param {array<object>} allBoxesList - list of all boxes for the healthcare provider
 * @param {string} masterSpecimenId - specimenId to search for
 * @returns {boolean} true if the specimenId is found in the shipped boxes, false otherwise.
 * If the specimenId is a masterId, search for the key in the bags.
 * If the bag is unlabelled, search arrElements for the key.
 * If the specimen isn't a masterId, iterate the bags and search for the keys in the arrElements. 
 * TODO: future implementation will include shipped property on the specimen object
 */
export const isScannedIdShipped = (allBoxesList, masterSpecimenId) => {
    if (!allBoxesList.length) return false;

    const specimenIdType = masterSpecimenId.split(' ')[1];
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
 *   //TODO: future refactor - use getSpecimenDeviation() when reports data handling is updated to a state managed solution.
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
 * //TODO: future refactor - use getSpecimenComments() when reports data handling is updated to a state managed solution.
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
 * //TODO: future refactor - use addDeviationTypeCommentsContent() when reports data handling is updated to a state managed solution.
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
