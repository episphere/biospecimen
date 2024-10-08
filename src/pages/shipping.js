import { addBoxAndUpdateSiteDetails, appState, conceptIdToSiteSpecificLocation, combineAvailableCollectionsObjects, displayManifestContactInfo, filterDuplicateSpecimensInList, getAllBoxes, getBoxes, getSpecimensInBoxes, getUnshippedBoxes, getLocationsInstitute, getSiteMostRecentBoxId, getSpecimensByBoxedStatus, hideAnimation, locationConceptIDToLocationMap,
        miscTubeIdSet, removeActiveClass, removeBag, removeMissingSpecimen, showAnimation, showNotifications, siteSpecificLocation, siteSpecificLocationToConceptId, sortBiospecimensList,
        translateNumToType, userAuthorization, getSiteAcronym, findReplacementTubeLabels, createBagToSpecimenDict } from "../shared.js"
import { addDeviationTypeCommentsContent, addEventAddSpecimenToBox, addEventBackToSearch, addEventBoxSelectListChanged, addEventCheckValidTrackInputs,
        addEventCompleteShippingButton, addEventModalAddBox, addEventNavBarBoxManifest, addEventNavBarShipment, addEventNavBarShippingManifest, addEventNavBarAssignTracking, addEventLocationSelect,
        addEventPreventTrackingConfirmPaste, addEventReturnToPackaging, addEventReturnToReviewShipmentContents, addEventSaveButton, addEventSaveAndContinueButton, addEventShipPrintManifest,
        addEventTrackingNumberScanAutoFocus, addEventTrimTrackingNums, compareBoxIds, populateCourierBox, populateFinalCheck, populateTrackingQuery } from "../events.js";     
import { homeNavBar, shippingNavBar, unAuthorizedUser} from '../navbar.js';
import { setAllShippingState, updateShippingStateCreateBox, updateShippingStateRemoveBagFromBox, updateShippingStateSelectedLocation } from '../shippingState.js';
import { conceptIds } from '../fieldToConceptIdMapping.js';

export const shippingDashboard = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if (user) {
            const responseData = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( responseData.isBiospecimenUser === false ) {
                document.getElementById("contentBody").innerHTML = "Authorization failed you lack permissions to use this dashboard!";
                document.getElementById("navbarNavAltMarkup").innerHTML = unAuthorizedUser();
                return;
            }
            if (!responseData.role) return;
            startShipping(user.displayName || user.email || responseData.email);
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}

/**
 * Entry point to the shipping dashboard. Check for a stored location and initialize the shipping page.
 * @param {string} userName - the logged in user's email.
 * @param {boolean} loadFromState - whether to load data from appState or fetch from the server.
 * @param {string} currBoxId - the current box being viewed, to reload with this box active.
 */
export const startShipping = async (userName, loadFromState = false, currBoxId) => {    
    buildShippingNavAndHeader();
    getStoredLocationOnInit();
    buildShippingDOM();

    await buildShippingInterface(userName, loadFromState, currBoxId);
}

const buildShippingNavAndHeader = () => {
    const navBarParticipantCheckIn = document.getElementById('navBarParticipantCheckIn');
    if (navBarParticipantCheckIn) navBarParticipantCheckIn.classList.add('disabled');

    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShippingDash');
    navBarBtn.classList.add('active');
}

// Build the DOM for the shipping page.
const buildShippingDOM = () => {
    document.getElementById('contentBody').innerHTML = `
        ${renderShippingLocationSelector()}
        ${renderScanOrEnterSpecimenId()}
        ${renderCollectionsContentsAndBoxes()}
        ${renderTempMonitorCheckbox()}
    `;
}

/**
 * Build the shipping dashboard interface. Pull box, specimen, and location data. Build the UI.
 * This will run asyncronously when pulling new data (loadFromState = false) and synchronously when loading from state (loadFromState = true).
 * @param {*} userName - the logged-in userName.
 * @param {*} loadFromState - whether to load data from state or from the server.
 * @param {*} currBoxId - the currently selected boxId.
 */
const buildShippingInterface = async (userName, loadFromState, currBoxId) => {
    try {
        showAnimation();

        let allBoxesList;
        let availableLocations;
        let finalizedSpecimenList;
        let availableCollectionsObj;
        let replacementTubeLabelObj;
        const specimens = {
            notBoxed: {},
            partiallyBoxed: {},
            boxed: {},
        };

        if (loadFromState) {
            allBoxesList = appState.getState().allBoxesList;
            availableLocations = appState.getState().availableLocations;
            finalizedSpecimenList = appState.getState().finalizedSpecimenList;
            availableCollectionsObj = appState.getState().availableCollectionsObj;
            replacementTubeLabelObj = appState.getState().replacementTubeLabelObj;
            populateSelectLocationList(availableLocations, loadFromState);
        } else {
            const promiseResponse = await Promise.all([
                getUnshippedBoxes(),
                populateSelectLocationList(availableLocations, loadFromState)
            ]);

            allBoxesList = promiseResponse[0].data;
            availableLocations = promiseResponse[1];

            [specimens.boxed, specimens.notBoxed, specimens.partiallyBoxed] = await Promise.all([
                getSpecimensInBoxes(allBoxesList),
                getSpecimensByBoxedStatus(conceptIds.notBoxed.toString()),
                getSpecimensByBoxedStatus(conceptIds.partiallyBoxed.toString()),
            ]);
            finalizedSpecimenList = filterDuplicateSpecimensInList([...specimens.boxed, ...specimens.notBoxed.specimensList, ...specimens.partiallyBoxed.specimensList]);
            availableCollectionsObj = combineAvailableCollectionsObjects(specimens.notBoxed.availableCollections, specimens.partiallyBoxed.availableCollections);
            replacementTubeLabelObj = findReplacementTubeLabels(finalizedSpecimenList);
        }

        const specimenLookup = createBagToSpecimenDict(finalizedSpecimenList);

        populateAvailableCollectionsList(availableCollectionsObj, specimenLookup, loadFromState);
        setAllShippingState(availableCollectionsObj, availableLocations, allBoxesList, finalizedSpecimenList, userName, replacementTubeLabelObj);
        populateViewShippingBoxContentsList(currBoxId);
        populateBoxesToShipTable();
        addShippingEventListeners(currBoxId);

    } catch (error) {
        console.error("Error building shipping interface:", error);
        showNotifications({ title: 'Error building shipping interface', body: 'An unexpected error occurred. Please refresh your browser to reload.' });
    } finally {
        hideAnimation();
    }
};

const addShippingEventListeners = (currBoxId) => {
    const userName = appState.getState().userName;
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarShippingManifest(userName);
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest");
    addEventLocationSelect("selectLocationList", "shipping_location");
    addEventAddSpecimenToBox(currBoxId);
    addEventModalAddBox();
}

const getStoredLocationOnInit = () => {
    const selectedLocation = JSON.parse(localStorage.getItem('selections'))?.shipping_location ?? 'none';
    updateShippingStateSelectedLocation(selectedLocation);
    return selectedLocation;
}

/**
 * Populate the 'Available Collections' table.
 * @param {object} availableCollectionsObj - object containing available collections where available collections are keys and values are arrays of tubeIds. Stray tubes are in the 'unlabelled' key.
 * @param {object} specimenLookup - object keyed to look up specimen by collection bag ID
 * @param {boolean} loadFromState - if true, load data from state instead of fetching from server.
 * Note: Orphan panel is currently hidden by request of the product team. Retain for future use.
 *       Future orphan panel use would require completed state management implementation in the 'currDeleteButton' event listener.
 */
const populateAvailableCollectionsList = async (availableCollectionsObj, specimenLookup = {}, loadFromState = false) => {

    if (loadFromState) {
        availableCollectionsObj = appState.getState().availableCollectionsObj ?? {};
    }


    const bagIdList = Object.keys(availableCollectionsObj).sort();
    const tableEle = document.getElementById("specimenList");
    tableEle.innerHTML = buildPopulateSpecimensHeader();

    let numRows = 1;
    let orphanBagId;

    for (const bagId of bagIdList) {
        if (bagId !== "unlabelled") {
            const specimen = specimenLookup[bagId];
            const rowEle = tableEle.insertRow();
            rowEle.insertCell(0).innerHTML = bagId;
            rowEle.insertCell(1).innerHTML = availableCollectionsObj[bagId].length;
            if (specimen && specimen[conceptIds.collectionType] === conceptIds.clinical) {
                rowEle.insertCell(2).textContent = 'Clinical';
            } else if (specimen && specimen[conceptIds.collectionType] === conceptIds.research) {
                rowEle.insertCell(2).textContent = conceptIds.collectionLocationMapping[specimen[conceptIds.collectionLocation]];
            } else {
                console.warn('Specimen match not found for bag ID %s', bagId, specimen);
                rowEle.insertCell(2).textContent = '';
            }

            const hiddenChannel = rowEle.insertCell(3)
            hiddenChannel.innerHTML = JSON.stringify(availableCollectionsObj[bagId]);
            hiddenChannel.style.display = "none";
            if (numRows % 2 === 0) {
                rowEle.style['background-color'] = "lightgrey";
            }
            numRows += 1;
        } else {
            orphanBagId = bagId;
        }
    }

    const orphanPanel = document.getElementById('orphansPanel');
    const orphanTableEle = document.getElementById('orphansList');
    const specimenPanel = document.getElementById('specimenPanel');
    orphanTableEle.innerHTML = '';

    if (orphanBagId && availableCollectionsObj['unlabelled'].length > 0) {
        orphanPanel.style.display = 'block';
        specimenPanel.style.height = '550px';

        const orphanTubeIdList = availableCollectionsObj['unlabelled'];
        const rowEle = orphanTableEle.insertRow();
        rowEle.insertCell(0).innerHTML = 'Stray tubes';
        rowEle.insertCell(1).innerHTML = orphanTubeIdList.length;
        const hiddenChannel = rowEle.insertCell(2);
        hiddenChannel.innerHTML = JSON.stringify(orphanTubeIdList);
        hiddenChannel.style.display = "none";

        for (let i = 0; i < orphanTubeIdList.length; i++) {
            const rowCount = orphanTableEle.rows.length;
            const rowEle = orphanTableEle.insertRow();

            if (rowCount % 2 === 0) {
                rowEle.style['background-color'] = 'lightgrey';
            }

            rowEle.insertCell(0).innerHTML = orphanTubeIdList[i];
            rowEle.insertCell(1).innerHTML = '<input type="button" class="delButton" value = "Report as Missing"/>';

            const currDeleteButton = rowEle.cells[1].getElementsByClassName("delButton")[0];

            //This should remove the entrire bag
            currDeleteButton.addEventListener("click", async e => {
                showAnimation();
                const index = e.target.parentNode.parentNode.rowIndex;
                const table = e.target.parentNode.parentNode.parentNode.parentNode;
                const currTubeId = table.rows[index].cells[0].innerText;
                await removeMissingSpecimen(currTubeId);
                hideAnimation();

                startShipping(appState.getState().userName);
            });
        }
    } else {
        orphanPanel.style.display = 'none'
        specimenPanel.style.height = '550px'
    }
}

const populateBoxesToShipTable = () => {
    const detailedBoxes = appState.getState().detailedProviderBoxes;
    const table = document.getElementById("saveTable");
    table.innerHTML = renderBoxesToShipTableHeader();
    
    if (Object.keys(detailedBoxes).length > 0) {
        const sortedBoxKeys = Object.keys(detailedBoxes).sort();
        let rowCount = 0;
        sortedBoxKeys.forEach(box => {
            const currBox = detailedBoxes[box];
            const bagKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined').sort((a, b) => a.split(/\s+/)[1] - b.split(/\s+/)[1]);
            const boxStartedTimestamp = currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp] ? formatTimestamp(Date.parse(currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp])) : '';
            const boxLastModifiedTimestamp = currBox.boxData[conceptIds.shippingShipDateModify] ? formatTimestamp(Date.parse(currBox.boxData[conceptIds.shippingShipDateModify])) : '';
            const boxLocation = currBox.boxData[conceptIds.shippingLocation] ? locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]["siteSpecificLocation"] : '';
            const numTubesInBox = bagKeys.reduce((total, bagKey) => total + currBox[bagKey]['arrElements'].length, 0);

            if (numTubesInBox > 0) {   
                const currRow = table.insertRow(rowCount + 1);
                currRow.style['background-color'] = rowCount % 2 === 1 ? 'lightgrey' : '';
                currRow.innerHTML += renderBoxesToShipRow(boxStartedTimestamp, boxLastModifiedTimestamp, box, boxLocation, numTubesInBox);
                const currBoxButton = currRow.cells[6].querySelector(".boxManifestButton");
                currBoxButton.addEventListener("click", async () => {
                    generateBoxManifest(currBox);
                });

                rowCount++; 
            }
        });
    }
}

const populateShippingBoxContentsRows = (bagNum, cellNum, row, currBagId, fullTubeId, tubeType) => {
    bagNum % 2 === 1 ? row.style['background-color'] = 'lightgrey' : row.style['background-color'] = 'white'; {
        row.insertCell(0).innerHTML = (cellNum === 0) ? currBagId : '';
        row.insertCell(1).innerHTML = fullTubeId;
        row.insertCell(2).innerHTML = tubeType;
        row.insertCell(3).innerHTML = (cellNum === 0) ? '<input type="button" class="delButton" value = "remove bag" style="margin-top:2px;margin-bottom:2px">' : '';
    }
}

const handleShippingBoxContentsSelector = (boxIdAndBagsObj, selectedBoxId) => {
    const boxIdArray = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    const boxOptionsList = boxIdArray.map(boxId => `<option>${boxId}</option>`).join('');
    const boxSelectEle = document.getElementById('selectBoxList');
    boxSelectEle.innerHTML = boxOptionsList;
    boxSelectEle.value = selectedBoxId ?? boxIdArray[0] ?? '';

    return boxSelectEle.value;
}

// This is the list on shipping screen -> view shipping box contents
export const populateViewShippingBoxContentsList = (selectedBoxId) => {
    const detailedLocationBoxes = appState.getState().detailedLocationBoxes;
    const currBoxId = handleShippingBoxContentsSelector(detailedLocationBoxes, selectedBoxId);
    const selectedLocation = appState.getState().selectedLocation;
    const shippingBoxContentsTable = document.getElementById('currTubeTable');

    if (currBoxId !== '') {
        const currBox = detailedLocationBoxes[currBoxId];    
        const boxKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined');
        shippingBoxContentsTable.innerHTML = renderViewBoxContentsTableHeader(selectedLocation);

        if (selectedLocation !== 'none') {
            //set up the table
            const replacementTubeLabelObj = appState.getState().replacementTubeLabelObj;
            for (let bagNum = 0; bagNum < boxKeys.length; bagNum++) {
                const currBagId = boxKeys[bagNum];
                const currTubes = currBox[boxKeys[bagNum]]['arrElements'];
                for (let tubeNum = 0; tubeNum < currTubes.length; tubeNum++) {
                    const fullTubeId = currTubes[tubeNum];
                    const tubeTypeStringArr = fullTubeId.split(' ');
                    const tubeId = tubeTypeStringArr[1];
                    let tubeType = Object.prototype.hasOwnProperty.call(translateNumToType, tubeId) ? translateNumToType[tubeId] : 'N/A';
                    if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, fullTubeId)) {
                        let [,originalTubeId] = replacementTubeLabelObj[fullTubeId].split(' '); 
                        tubeType = Object.prototype.hasOwnProperty.call(translateNumToType, originalTubeId) ? translateNumToType[originalTubeId] : tubeType;
                    }
                    const rowCount = shippingBoxContentsTable.rows.length;
                    const row = shippingBoxContentsTable.insertRow(rowCount);
                    
                    populateShippingBoxContentsRows(bagNum, tubeNum, row, currBagId, fullTubeId, tubeType);
                    if (tubeNum == 0) {
                        const currDeleteButton = row.cells[3].querySelector(".delButton");
                        handleRemoveBagButton(currDeleteButton, currTubes, currBoxId);
                    }
                }
            }
        }
    } else {
      // Clear table if no list is found
      shippingBoxContentsTable.innerHTML = renderViewBoxContentsTableHeader(selectedLocation);
    }
}

// Remove a bag from a box
const handleRemoveBagButton = (currDeleteButton, currTubes, currBoxId) => {
    currDeleteButton.addEventListener("click", async e => {
        e.preventDefault();
        showAnimation();
        
        const row = e.target.closest('tr');
        const currBagId = row.cells[0].innerText;
        const bagsToRemove = currBagId === "unlabelled" ? currTubes : [currBagId];
        
        try {
            const removeBagResponse = await removeBag(currBoxId, bagsToRemove);
            hideAnimation();

            if (removeBagResponse.code === 200) {
                updateShippingStateRemoveBagFromBox(currBoxId, currBagId, bagsToRemove, removeBagResponse.data);
                await startShipping(appState.getState().userName, true, currBoxId);
            } else {
                console.error('Failed to remove bag.', removeBagResponse);
                showNotifications({ title: 'Error removing bag', body: 'Error removing this bag. Please try again.' });
            }
        } catch (error) {
            hideAnimation();
            console.error('Failed to remove bag.', error);
            showNotifications({ title: 'Error removing bag', body: `There was an error removing this bag. Please try again.` });
        }
    });
}

/**
 * Add a new box with a new boxId.
 * @returns {boolean} - true on success, false on failure.
 * Get the highest existing boxId and ++ for the new box.
 * Create the box and add it to firestore. On success, add it to the relevant state objects (allBoxesList and boxesByLocationList, and detailedProviderBoxes).
 * Important: 0 is a valid box number: only check for null and undefined boxId values, not falsy values.
 * The decision to create a new box is location specific (not site specific). Check whether location's most recent box is empty or populated.
 * Box numbering is based on site (not location), always increment highest *site* box number.
 * Create the new box and update the modal if the location's largest box is not empty or if the location has no current boxes.
 */
export const addNewBox = async () => {
    try {
        const siteLocation = document.getElementById('selectLocationList').value;
        const siteLocationConversion = siteSpecificLocationToConceptId[siteLocation];
        const siteCode = siteSpecificLocation[siteLocation]["siteCode"];    
        const boxList = appState.getState().allBoxesList;
    
        const boxIdResponse = await getSiteMostRecentBoxId();
        let docId = boxIdResponse.data.docId;
        let largestBoxNum = boxIdResponse.data.mostRecentBoxId;
    
        if (!docId) {
            console.error('Error getting site details doc id');
            return false;
        }
    
        if (largestBoxNum == null) {
            largestBoxNum = await getLargestBoxNumFromAllBoxes();
        }
    
        const largestLocationBoxNum = largestBoxNum === -1 ? -1 : getLargestLocationBoxId(boxList, siteLocationConversion);
        const largestLocationBoxIndex = boxList.findIndex(box => box[conceptIds.shippingBoxId] === 'Box' + largestLocationBoxNum.toString());
        const shouldCreateNewBox = Object.keys(boxList[largestLocationBoxIndex]?.['bags'] ?? {}).length !== 0 || largestLocationBoxIndex === -1;

        if (shouldCreateNewBox) {
            const boxToAdd = await createNewBox(boxList, siteLocationConversion, siteCode, largestBoxNum, docId);
            if (!boxToAdd) {
                showNotifications({ title: 'ERROR ADDING BOX - PLEASE REFRESH YOUR BROWSER', body: 'Error: This box already exists. A member of your team may have recently created this box. Please refresh your browser and try again.' });
                return false;
            }
    
            document.getElementById('shippingModalChooseBox').setAttribute('data-new-box', boxToAdd[conceptIds.shippingBoxId]);
            updateShippingStateCreateBox(boxToAdd);
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error('Error adding box', e);
        showNotifications({
            title: 'ERROR ADDING BOX',
            body: 'An unexpected error occurred. Please try again later.'
        });
        return false;
    }
}

// Create the new box and add it to firestore. If the box already exists, wait one second, increment the boxId, and try again up to 3 times.
const createNewBox = async (boxList, pageLocationConversion, siteCode, largestBoxNum, docId) => {
    let attempts = 0;
    let maxAttempts = 3;

    const boxToAdd = {
        [conceptIds.shippingLocation]: pageLocationConversion,
        [conceptIds.siteCode]: siteCode,
        [conceptIds.submitShipmentFlag]: conceptIds.no,
        [conceptIds.siteShipmentReceived]: conceptIds.no,
        ['siteDetailsDocRef']: docId,
    };

    while (attempts < maxAttempts) {
        largestBoxNum++;
        boxToAdd[conceptIds.shippingBoxId] = 'Box' + largestBoxNum.toString();
    
        try {
            const addBoxResponse = await addBoxAndUpdateSiteDetails(boxToAdd);
            if (addBoxResponse.code === 200) {
                boxList.push(boxToAdd);
                return boxToAdd;
            } else if (addBoxResponse.code === 409) {
                attempts++;
                await delayRetryAttempt(1000);
                continue;
            } else {
                return null;
            }
        } catch (e) {
            console.error('Error adding box', e);
            return null;
        }
    }

    console.error('409 - Conflict! 3 Failed attempts creating new box.');
    return null;
}

// Delay retry attempt for 1 second when box creation fails.
const delayRetryAttempt = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Find the largest box among all boxes. This is a fallback for new sites that have no boxes.
 * It should only execute once per new site, and only if the siteDetails collection's 'mostRecentBoxId' field is null.
 * -1 fallback value is handled in the parent function.
 * @returns {number} - largest box number from all existing boxes.
 */
const getLargestBoxNumFromAllBoxes = async () => {
    const getAllBoxesResponse = await getAllBoxes();
    const boxList = getAllBoxesResponse.data;

    return boxList.reduce((largestBoxNum, currentBox) => {
        const currentBoxNum = parseInt(currentBox[conceptIds.shippingBoxId].substring(3));
        return Math.max(largestBoxNum, currentBoxNum);
    }, -1);
}

/**
 * Find the largest shipping box id for the location
 * Return the highest numeric boxId or -1 if none exist
 * @param {array<object>} boxesList - list of all boxes 
 * @param {number} siteLocationId - the shipping location Id for the site
 * @returns {number} - the largest boxId for the location
 */
const getLargestLocationBoxId = (boxesList, siteLocationId) => {
    const boxIdsForLocation = boxesList.filter(box => box[conceptIds.shippingLocation] === siteLocationId).map(box => parseInt(box[conceptIds.shippingBoxId].substring(3)));
    return boxIdsForLocation.length > 0 ? Math.max(...boxIdsForLocation) : -1;
}

export const generateBoxManifest = (currBox) => {
    const currInstitute = currBox.boxData.siteAcronym || getSiteAcronym();
    const currShippingLocationNumberObj = locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]
    const currLocation = locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]["siteSpecificLocation"];

    removeActiveClass('navbar-btn', 'active');
    const navBarBoxManifestBtn = document.getElementById('navBarBoxManifest');
    navBarBoxManifestBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = renderBoxManifestTemplate(currInstitute, currLocation);

    populateBoxManifestHeader(currBox, currShippingLocationNumberObj);
    populateBoxManifestTable(currBox);
    document.getElementById('printBox').addEventListener('click', e => {
        window.scrollTo(0, 0);
        window.print();
    });

    addEventReturnToPackaging();
}

export const populateBoxManifestHeader = (currBox, currShippingLocationNumberObj) => {
    if(!currBox) return;

    const currKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined');
    const numBags = currKeys.length;
    const numTubes = currKeys.reduce((acc, bagKey) => acc + currBox[bagKey]['arrElements'].length, 0);

    const boxId = currBox.boxData[conceptIds.shippingBoxId];
    const boxStartedTimestamp = formatTimestamp(currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp]);
    const boxLastModifiedTimestamp = formatTimestamp(currBox.boxData[conceptIds.shippingShipDateModify]);

    renderBoxManifestHeader(boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currShippingLocationNumberObj);
}

// Render the box manifest header.
// CreateParent divs, create list of data to be appended, create the new elements, append.
const renderBoxManifestHeader = (boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currShippingLocationNumberObj) => {
    const boxManifestCol1 = document.getElementById('boxManifestCol1');
    const boxManifestCol3 = document.getElementById('boxManifestCol3');
    
    const div1 = document.createElement("div");
    const div3 = document.createElement("div");
    
    const dataCol1 = [
        { text: `${boxId} Manifest`, style: { fontWeight: '700', fontSize: '1.5rem' } },
        { text: `Date Started: ${boxStartedTimestamp}` },
        { text: `Last Modified: ${boxLastModifiedTimestamp}` },
        { text: displayManifestContactInfo(currShippingLocationNumberObj), isHTML: true }
    ];
    
    const dataCol3 = [
        { text: `Number of Sleeves/Bags: ${numBags}` },
        { text: `Number of Specimens:  ${numTubes}` }
    ];
    
    const createBoxManifestElements = (data, parent) => {
        for (const item of data) {
            const newP = document.createElement("p");
            newP.innerHTML = item.text;
    
            if (item.style) {
                Object.assign(newP.style, item.style);
            }
    
            if (item.isHTML) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = newP.outerHTML;
                parent.appendChild(newDiv);
            } else {
                parent.appendChild(newP);
            }
        }
    }
    
    createBoxManifestElements(dataCol1, div1);
    createBoxManifestElements(dataCol3, div3);
    
    boxManifestCol1.appendChild(div1);
    boxManifestCol3.appendChild(div3);
}

// Get all ids from the available collections table and hidden orphan table.
export const buildSpecimenDataInModal = (masterSpecimenId) =>{
    const shippingTable = document.getElementById('specimenList');
    const orphanTable = document.getElementById('orphansList');
    
    let foundInOrphan = false;
    let biospecimensList = []
    let tableIndex = -1;

    for (let i = 1; i < shippingTable.rows.length; i++) {
        const currRow = shippingTable.rows[i];
        if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId.toUpperCase()) {
            tableIndex = i;
            biospecimensList = JSON.parse(currRow.cells[3].innerText)
        }
    }

    for (let i = 1; i < orphanTable.rows.length; i++) {
        const currRow = orphanTable.rows[i];
        if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId.toUpperCase()) {
            tableIndex = i;
            const currTubeNum = currRow.cells[0].innerText.split(' ')[1];
            biospecimensList = [currTubeNum];
            foundInOrphan = true;
        }
    }

    return { foundInOrphan, biospecimensList, tableIndex };
}

export const createShippingModalBody = (biospecimensList, masterBiospecimenId, isOrphan) => {
    const boxList = appState.getState().boxesByLocationList;
    let boxIdAndBagsObj = {};
    for (let i = 0; i < boxList.length; i++) {
        const box = boxList[i];
        boxIdAndBagsObj[box[conceptIds.shippingBoxId]] = box['bags'];
    }
    
    const tubeTable = document.createElement('table');
    const splitTubeIdArray = masterBiospecimenId.split(/\s+/); /* Ex. ['CXA000133', '0008']*/
    const replacementTubeLabelObj = appState.getState().replacementTubeLabelObj;
    let isBagEmpty = true;
    biospecimensList = sortBiospecimensList(biospecimensList);
    for (const specimenId of biospecimensList) {
        if (shouldAddModalRow(isOrphan, splitTubeIdArray, specimenId)) {
            isBagEmpty = addRowToModalTable(isBagEmpty, tubeTable, splitTubeIdArray, specimenId, replacementTubeLabelObj);
        }
    }

    renderShippingModalBody(tubeTable.innerHTML);
    populateModalSelect(boxIdAndBagsObj);

    if (isBagEmpty) {
        showNotifications({ title: 'Not found', body: 'The specimen with entered search criteria not found!' });
        document.getElementById('shippingCloseButton').click();
        hideAnimation();
    }
}

const shouldAddModalRow = (isOrphan, splitTubeIdArray, tubeId) => {
    // If the tube has a replacement label, use the original tube Id to determine if it should be added to the modal.
    if (miscTubeIdSet.has(tubeId)) {
        const fullTubeIdToSearch = splitTubeIdArray[0] + ' ' + tubeId;
        const replacementTubeLabelObj = appState.getState().replacementTubeLabelObj;
        const standardTubeId = replacementTubeLabelObj[fullTubeIdToSearch];
        tubeId = standardTubeId ? standardTubeId.split(' ')[1] : tubeId;
    }
    if (isOrphan) return true;
    if (splitTubeIdArray.length >= 2 && splitTubeIdArray[1] == '0008') {
        //look for all non-mouthwash (0007)
        return tubeId !== '0007' && tubeId !== '0008';
    } else {
        return tubeId === '0007' && tubeId !== '0009';
    }
}

const addRowToModalTable = (isBagEmpty, tubeTable, splitTubeIdArray, tubeId, replacementTubeLabelObj) => {
    isBagEmpty = false;
    const rowCount = tubeTable.rows.length;
    const row = tubeTable.insertRow(rowCount);
    let tubeType = Object.prototype.hasOwnProperty.call(translateNumToType, tubeId) ? translateNumToType[tubeId] : 'N/A';
    if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, splitTubeIdArray[0]+' '+tubeId)) {
        let [,originalTubeId] = replacementTubeLabelObj[splitTubeIdArray[0]+' '+tubeId].split(' '); 
        tubeType = Object.prototype.hasOwnProperty.call(translateNumToType, originalTubeId) ? translateNumToType[originalTubeId] : tubeType;
    }

    row.insertCell(0).innerHTML = `${splitTubeIdArray[0]} ${tubeId}`;
    row.insertCell(1).innerHTML = tubeType;
    row.insertCell(2).innerHTML = '<input type="checkbox" class="samplePresentCheckbox" style="transform: scale(2); display:block; margin:0 auto;" checked>';
    row.cells[2].style.verticalAlign = "middle";

    const checkboxEl = row.cells[2].firstChild;
    checkboxEl.setAttribute("data-full-specimen-id", `${splitTubeIdArray[0]} ${tubeId}`);
    checkboxEl.addEventListener("click", e => {
        e.target.toggleAttribute("checked");
    });

    return isBagEmpty;
}

export const updateBoxListModalUIValue = () => {
    const shippingModalChooseBox = document.getElementById('shippingModalChooseBox');
    const boxId = shippingModalChooseBox.value;
    document.getElementById('selectBoxList').value = boxId;
    
    return boxId;
}

export const processCheckedModalElements = (boxIdAndBagsObj, bagId, boxId, isOrphan, tableIndex) => {
    const allCheckboxEle = document.querySelectorAll(".samplePresentCheckbox");
    const [firstName = '', lastName = ''] = appState.getState().userName.split(/\s+/);
    const checkedEleList = Array.from(allCheckboxEle).filter(ele => ele.checked);
    const tubesToDelete = [];

    if (isOrphan) bagId = 'unlabelled';

    for (const checkedEle of checkedEleList) {
        const specimenIdToAdd = checkedEle.getAttribute("data-full-specimen-id"); // data-full-specimen-id (Ex. "CXA444444 0007")
        const [collectionId, tubeId] = specimenIdToAdd.split(/\s+/);
        tubesToDelete.push(tubeId);

        if (!isOrphan) {
            bagId = assignBagId(tubeId, collectionId);
        }

        if (boxIdAndBagsObj.hasOwnProperty(boxId)) {
            if (boxIdAndBagsObj[boxId].hasOwnProperty(bagId)) {
                boxIdAndBagsObj[boxId][bagId]['arrElements'].push(specimenIdToAdd);
            } else {
                boxIdAndBagsObj[boxId][bagId] = {
                    'arrElements': [specimenIdToAdd],
                    [conceptIds.scannedByFirstName]: firstName,
                    [conceptIds.scannedByLastName]: lastName
                };
            }
        } else {
            boxIdAndBagsObj[boxId] = {}
            boxIdAndBagsObj[boxId][bagId] = {
                'arrElements': [specimenIdToAdd],
                [conceptIds.scannedByFirstName]: firstName,
                [conceptIds.scannedByLastName]: lastName
            };
        }
    }
    handleAvailableCollectionsTableRows(tableIndex, tubesToDelete);
    
    return boxIdAndBagsObj;
}

export const prepareBoxToUpdate = (boxId, boxList, boxIdAndBagsObj, locations, addedTubes) => {
    const currTime = new Date().toISOString();
    const foundBox = boxList.find(box => box[conceptIds.shippingBoxId] == boxId) || {};

    return {
        ...foundBox,
        'bags': boxIdAndBagsObj[boxId],
        'addedTubes': addedTubes,
        [conceptIds.shippingShipDateModify]: currTime,
        [conceptIds.shippingBoxId]: boxId,
        [conceptIds.shippingLocation]: locations[boxId],
        [conceptIds.siteCode]: siteSpecificLocation[conceptIdToSiteSpecificLocation[locations[boxId]]].siteCode,
        [conceptIds.firstBagAddedToBoxTimestamp]: foundBox[conceptIds.firstBagAddedToBoxTimestamp]
            ? foundBox[conceptIds.firstBagAddedToBoxTimestamp]
            : currTime,
    };
}

const handleAvailableCollectionsTableRows = (tableIndex, tubesToDelete) => {
    const availableCollectionsTable = document.getElementById('specimenList');
    
    // handle an orphan tube scanned if currArr is undefined  
    const currArr = availableCollectionsTable?.rows[tableIndex]?.cells[3]?.innerText;
    if(currArr != undefined) {
        const parseCurrArr = JSON.parse(currArr);
        for (let i = 0; i < tubesToDelete.length; i++) {
            parseCurrArr.splice(parseCurrArr.indexOf(tubesToDelete[i]), 1);
        }
        if (parseCurrArr.length == 0) {
            availableCollectionsTable.deleteRow(tableIndex);
        } else {
            availableCollectionsTable.rows[tableIndex].cells[3].innerText = JSON.stringify(parseCurrArr);
            availableCollectionsTable.rows[tableIndex].cells[1].innerText = parseCurrArr.length;
        }
    }
}

const assignBagId = (tubeId, collectionId) => {
    // If the tube has a replacement label, use the original tube Id to assign the bag Id.
    if (miscTubeIdSet.has(tubeId)) {
        const fullTubeIdToSearch = collectionId + ' ' + tubeId;
        const standardTubeId = appState.getState().replacementTubeLabelObj[fullTubeIdToSearch];
        tubeId = standardTubeId ? standardTubeId.split(' ')[1] : tubeId;
    }

    if (tubeId === '0007') {
        return collectionId + ' 0009';
    } else {
        return collectionId + ' 0008';
    }
}

export const populateModalSelect = (detailedLocationBoxes) => {
    const boxSelectEle = document.getElementById('shippingModalChooseBox');
    const selectedBoxId = boxSelectEle.getAttribute('data-new-box') || document.getElementById('selectBoxList').value;
    const addToBoxButton =  document.getElementById('addToBoxButton');
    
    addToBoxButton.removeAttribute("disabled")
    
    const boxIds = Object.keys(detailedLocationBoxes).sort(compareBoxIds);
    const boxOptions = boxIds.map(boxId => `<option>${boxId}</option>`).join(''); 

    if (boxOptions == '') {
        addToBoxButton.setAttribute('disabled', 'true');
    }

    boxSelectEle.innerHTML = boxOptions;
    boxSelectEle.value = selectedBoxId;
}

export const formatTimestamp = (timestamp) => {
    const newDate = timestamp ? new Date(timestamp) : new Date();
    const ampm = newDate.getHours() >= 12 ? 'PM' : 'AM';
    const minutesTag = newDate.getMinutes() < 10 ? `0${newDate.getMinutes()}` : newDate.getMinutes();
    return `${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()} ${(newDate.getHours() + 11) % 12 + 1}:${minutesTag} ${ampm}`;
};

// get available locations from firestore on the first load
// save those locations in state and load from state on subsequent loads - if (availableLocations)
const populateSelectLocationList = async (availableLocations, loadFromState) => {
    const locationSelection = JSON.parse(localStorage.getItem('selections'))?.shipping_location;
    const selectEle = document.getElementById('selectLocationList');
    
    if (!loadFromState) {
        availableLocations = await getLocationsInstitute();
    }

    const defaultOption = `<option value="none" ${locationSelection === 'none' ? 'selected="selected"' : ""}>Select Shipping Location</option>`;    
    const locationOptions = availableLocations.map(location => 
        `<option ${locationSelection === location ? 'selected="selected"' : ""} value="${location}">${location}</option>`
    ).join('');

    selectEle.innerHTML = defaultOption + locationOptions;

    return availableLocations;
}

const populateBoxManifestTable = (currBox) => {
    const boxManifestTable = document.getElementById('boxManifestTable');
    const bagList = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined').sort(sortSpecimenKeys);
    const replacementTubeLabelObj = appState.getState().replacementTubeLabelObj;
    bagList.forEach((bagKey, bagIndex) => {
        const bagIndexStart = bagIndex + 1;
        const tubesList = currBox[bagKey].arrElements;
        for (let i = 0; i < tubesList.length; i++) {
            const tubeDetail = currBox[bagKey].specimenDetails[tubesList[i]];
            const currRow = boxManifestTable.insertRow(i + 1);
            const fullTubeId = tubesList[i];
            const tubeId = fullTubeId.split(' ');
            let tubeTypeAndColor = Object.prototype.hasOwnProperty.call(translateNumToType, tubeId[1]) ? translateNumToType[tubeId[1]] : 'N/A';
            if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, fullTubeId)) {
                let [,originalTubeId] = replacementTubeLabelObj[fullTubeId].split(' '); 
                tubeTypeAndColor = Object.prototype.hasOwnProperty.call(translateNumToType, originalTubeId) ? translateNumToType[originalTubeId] : tubeTypeAndColor;
            }
            currRow.insertCell(0).innerHTML = i === 0 ? bagKey : '';
            currRow.insertCell(1).innerHTML = tubesList[i];
            currRow.insertCell(2).innerHTML = tubeTypeAndColor;

            addDeviationTypeCommentsContent(tubeDetail, currRow, bagIndexStart);
        };
    });
}

const sortSpecimenKeys = (a, b) => {
    const numA = parseInt(a.split(' ')[0].substring(3));
    const numB = parseInt(b.split(' ')[0].substring(3));
    return numB - numA;
}

/**
 * 
 * @param {string[]} boxIdArray
 * @param {string} userName
 * @param {boolean} isTempMonitorIncluded
 * @param {number} currShippingLocationNumber
 */
export const generateShippingManifest = async (boxIdArray, userName, isTempMonitorIncluded, currShippingLocationNumber) => {
    showAnimation();
    const response = await getBoxes();
    const boxArray = response.data;
    let siteAcronym = '';
    let boxIdAndBagsObjToDisplay = {};

    for (const box of boxArray) {
        const boxId = box[conceptIds.shippingBoxId];
        if (!boxIdArray.includes(boxId)) continue;

        boxIdAndBagsObjToDisplay[boxId] = box['bags'];
        !siteAcronym && (siteAcronym = box['siteAcronym']);
    }

    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarReviewShipmentContents');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = renderShippingManifestTemplate(boxIdArray, isTempMonitorIncluded);
    
    populateShippingManifestHeader(userName, siteAcronym, currShippingLocationNumber); // populate shipping header via site specfiic location selected from shipping page
    populateShippingManifestTable(boxIdAndBagsObjToDisplay);
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventShipPrintManifest('printBox');
    addEventNavBarShipment('returnToPackaging', userName);
    
    const btn = document.getElementById('assignTrackingNumberPage');
    btn && btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const tempBoxElement = document.getElementById('tempBox');
        if (isTempMonitorIncluded && tempBoxElement.value === '') {
            showNotifications({title: 'Missing field!', body: 'Please enter the box where the temperature monitor is being stored.'});
            return;
        }

        let boxWithTempMonitor = '';
        if (isTempMonitorIncluded) {
            boxWithTempMonitor = tempBoxElement.value;
        }

        await shipmentTracking(boxIdAndBagsObjToDisplay, userName, boxWithTempMonitor);
    });

    hideAnimation();
}

const tempSelectStringRender = ({boxIdArray, isTempMonitorIncluded}) => {
    let tempSelectString = "";
    if (isTempMonitorIncluded) {
        tempSelectString = `
            <div style="display:block">
                <p>Select the box that contains the temperature monitor</p>
                <select name="tempBox" id="tempBox">
                <option disabled value> -- select a box -- </option>
                ${boxIdArray
                  .map((boxId, idx) =>
                    idx === 0
                      ? `<option selected value="${boxId}">${boxId}</option>`
                      : `<option value="${boxId}">${boxId}</option>`
                  )
                  .join("")}
                </select>
            </div>
        `;
    }

    return tempSelectString;
}

export const populateShippingManifestHeader = (userName, siteAcronym, currShippingLocationNumberObj) => {
    const siteSpecificLocation = currShippingLocationNumberObj["siteSpecificLocation"];

    const currentDateTime = formatTimestamp();
    const dataCol1 = [
        { text: "Shipment Manifest", style: { fontWeight: '700', fontSize: '1.5rem' } },
        { text: `Current Date/Time: ${currentDateTime}` },
        { text: `Sender: ${userName}` },
        { text: displayManifestContactInfo(currShippingLocationNumberObj), isHTML: true }
    ];
    
    const dataCol3 = [
        { text: `Site: ${siteAcronym}` },
        { text: `Location: ${siteSpecificLocation}` }
    ];

    buildShippingManifestHeader(dataCol1, dataCol3);
}

const buildShippingManifestHeader = (dataCol1, dataCol3) => {
    const boxManifestCol1 = document.getElementById('boxManifestCol1');
    const boxManifestCol3 = document.getElementById('boxManifestCol3');
    
    const div1 = document.createElement("div");
    const div3 = document.createElement("div");
    
    const createShippingManifestElements = (data, parent) => {
        for (const item of data) {
            const newP = document.createElement("p");
            newP.innerHTML = item.text;

            if (item.style) {
                Object.assign(newP.style, item.style);
            }
    
            if (item.isHTML) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = newP.outerHTML;
                parent.appendChild(newDiv);
            } else {
                parent.appendChild(newP);
            }
        }
    }
    
    createShippingManifestElements(dataCol1, div1);
    createShippingManifestElements(dataCol3, div3);
    
    boxManifestCol1.appendChild(div1);
    boxManifestCol3.appendChild(div3);
}

export const populateShippingManifestTable = (boxIdAndBagsObj) => {
    const table = document.getElementById("shippingManifestTable");
    const boxIdArray = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    let greyIndex = 0;
    let firstSpecimenInBox = true;

    boxIdArray.forEach((currBoxId) => {
        const specimens = Object.keys(boxIdAndBagsObj[currBoxId]);        
        specimens.forEach((specimen) => {
            const tubes = boxIdAndBagsObj[currBoxId][specimen]['arrElements'];

            tubes.forEach((currTube, tubeIndex) => {
                const specimenData = boxIdAndBagsObj[currBoxId][specimen];
                const fullScannerName = tubeIndex === 0 
                    ? `${specimenData[conceptIds.scannedByFirstName] || ''} ${specimenData[conceptIds.scannedByLastName] || ''}`.trim()
                    : '';
                const currRow = table.insertRow(-1);
                currRow.insertCell(0).innerHTML = firstSpecimenInBox && tubeIndex === 0 ? currBoxId : '';
                currRow.insertCell(1).innerHTML = tubeIndex === 0 ? specimen : '';
                currRow.insertCell(2).innerHTML = currTube;
                currRow.insertCell(3).innerHTML = fullScannerName;

                if (greyIndex % 2 === 0) currRow.style['background-color'] = "lightgrey";
                if (firstSpecimenInBox && tubeIndex === 0) firstSpecimenInBox = false;
            });

            greyIndex += 1;
        });

        firstSpecimenInBox = true;
    });
}

export const shipmentTracking = async (boxIdAndBagsObj, userName, boxWithTempMonitor) => {
    showAnimation();

    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let template = `
        <div class="row" style="margin-top:40px;">
            <div class="col-lg">
                <label for="courierSelect" style="font-size:1.4rem; margin-bottom:1rem;">Choose Shipment Courier</label>
                <select name="courier" id="courierSelect" style="padding:.2rem; display:block;">
                </select>
            </div>
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg">
                <p style="margin:0; font-size:1.4rem;">Enter Shipment Tracking Numbers:</p>
                <div class="col-lg" id="forTrackingNumbers">
                </div>
            </div>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;" id="boxManifestCol2">  
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="saveTracking" style="margin-right:.5rem;">Save</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completeTracking">Save and Continue</button>
            </div>
        </div>
    `;

    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShipmentTracking');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateCourierBox();
    addEventNavBarShipment("returnToPackaging", userName);
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName, boxWithTempMonitor);
    await populateTrackingQuery(boxIdAndBagsObj);
    addEventTrimTrackingNums();
    addEventTrackingNumberScanAutoFocus();
    addEventPreventTrackingConfirmPaste();
    addEventCheckValidTrackInputs(boxIdAndBagsObj);
    addEventSaveButton(boxIdAndBagsObj);
    addEventSaveAndContinueButton(boxIdAndBagsObj, userName, boxWithTempMonitor);
    hideAnimation();
}

export const finalShipmentTracking = ({ boxIdAndBagsObj, boxIdAndTrackingObj, userName, boxWithTempMonitor, shipmentCourier }) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2 >Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarFinalizeShipment');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = renderFinalShipmentTrackingTemplate(shipmentCourier, userName);
    
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarAssignTracking("returnToTracking", userName, boxIdAndBagsObj, boxWithTempMonitor)
    addEventNavBarAssignTracking("navBarFinalizeShipment", userName, boxIdAndBagsObj, boxWithTempMonitor)
    populateFinalCheck(boxIdAndTrackingObj);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName)
    addEventCompleteShippingButton(boxIdAndTrackingObj, userName, boxWithTempMonitor, shipmentCourier);
    addEventBackToSearch('navBarShippingDash');
}

const renderShippingLocationSelector = () => {
    return `
        <div class="row">
            <div class="col-lg">
                <h5>Choose your shipping location</h5>
            </div>
        </div>
        <div class="row" style="margin-bottom:10px">
            <div class = "col-lg">
                <select class="selectpicker" id="selectLocationList" style="padding:.25rem">
                </select>
                </br></br>
            </div>
        </div>
    `;
}

const renderScanOrEnterSpecimenId = () => {
    return `
    <div class="row" style="margin:0; margin-bottom: 1.5rem;">
        <div class="col-lg" style="padding: 0;margin: 0;">
            <div class="row form-row" style="padding-left:0px;margin:0;">
                <form id="addSpecimenForm" method="POST" style="width:100%;">
                    <label for="masterSpecimenId">
                        <h5>To start packing the shipping boxes, scan specimen bag ID or Full Specimen ID here:</h5>
                    </label>
                    <div class="form-group">
                        <div class="input-group">
                            <input class="form-control" required type="text" id="masterSpecimenId" placeholder="Enter/Scan" autocomplete="off"/>
                            <div class="input-group-append">
                                <button class="btn btn-primary" aria-label="Enter Specimen ID" type="submit">Enter</button>
                            </div>
                        </div>
                    </div>
                </form>
                <button href="#" id="submitMasterSpecimenId" type="submit" class="btn btn-outline-primary" data-toggle="modal" data-target="#shippingModal" data-backdrop="static" style = "display:none">Add specimen to box</button>
                <button href="#" id="submitSpecimenIdProxyButton" type="submit" class="btn btn-outline-primary" data-toggle="modal" data-target="#shippingModal" data-backdrop="static" style = "display:none">Add specimen to box</button>
                <br><br>
            </div>
        </div>
    </div>
    `;
}

const renderCollectionsContentsAndBoxes = () => {
    return `
    <div class="row">
        ${renderAvailableCollections()}
        ${renderViewShippingBoxContents()}
        ${renderSpecimenVerificationModal()}
        ${renderTempTubeReminder()} 
    </div>
    </br>
    <div id="edit">
        ${renderSelectBoxes()}
    </div>
    `;
}

const renderAvailableCollections = () => {
    return `
        <div class="col-5">
            <h4 style="text-align:center; margin-bottom:1rem;">Available Collections</h4>
            <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto;" id="specimenPanel">
                <table class = "table" style="width: 100%;margin-bottom:0px;" id="specimenList"></table>
            </div>
            <div class="panel panel-default" style="position:absolute; border-style:solid;height:0px;border-width:1px;overflow:auto; display:none;" id="orphansPanel">
                <table class = "table" style="width: 100%; margin-bottom:0px;" id="orphansList"></table>
            </div>
        </div>
    `;
}

const renderViewShippingBoxContents = () => {
    return `
        <div class="col-7">
            <div style="display:flex; justify-content:space-evenly; align-items:center; margin-bottom:.625rem;">
                <div>
                    <h4>View Shipping Box Contents</h4>
                </div>
                <div>
                    <select class="selectpicker" id="selectBoxList" name="box-ids" style="padding:0.25rem"></select>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto">
                        <table style="width: 100%;" id="currTubeTable"></table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

const renderTempTubeReminder = () => {
    return `
        <div id="tempTubeReminder" style="color:red;display:none;">
            <p>Please put a temperature monitor in the box for shipping
            </p>
        </div>
    `;
}

const renderSelectBoxes = () => {
    return `
        <div class="row" style="margin-bottom:1rem">
            <div class="col-9 no-gutters">
                <h4 style="text-align:start;">Select one or more boxes to ship</h4>
            </div>
            <div class="col-3 no-gutters">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging" style="margin:auto;display:block;">Continue to Review Shipment Contents</button>
            </div>
        </div>
        <div style="border: 1px solid black; overflow: auto; margin-bottom: 0.5rem; height: 400px;">
            <table class="table table-bordered" style="width:100%;border:1px solid;" id="saveTable">
            </table>
        </div>
    `;
}

const renderTempMonitorCheckbox = () => {
    return `
        <div class="row" id="checkForTemp">
            <div class="col-lg">
                <input type="checkbox" id="tempMonitorChecked" style="transform: scale(1.5); margin-right:10px; margin-top:5px; margin-left:5px;" checked>
                <label for="tempMonitorChecked">Temperature Monitor is included in this shipment</label><br>
            </div>
        </div>
    `;
}

const renderSpecimenVerificationModal = () => {
    return `
        <div class="modal fade" id="shippingModal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content sub-div-shadow">
                    <div class="modal-header" id="shippingModalHeader"></div>
                    <div class="modal-body" id="shippingModalBody"></div>
                    <div class="modal-body"> 
                        <h4 style="margin-bottom:0.8rem">Select Box or Create New Box</h4>
                        <div id="create-box-success" class="alert alert-success" role="alert" style="display:none;">New box has been created
                        </div>
                        <div id="create-box-error" class="alert alert-danger" role="alert" style="display:none;">Last created box is empty. Please add a specimen(s) to last box.
                        </div>
                        <select class="selectpicker" id="shippingModalChooseBox" data-new-box="" style="font-size:1.4rem;"></select>
                        <button type="button" class="btn btn-primary" id="modalAddBoxButton">Create New Box</button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="addToBoxButton">Add to Box</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="shippingModalCancel">Cancel</button>
                    </div>  
                </div>
            </div>
        </div>
    `;
}

const renderBoxManifestTemplate = (currInstitute, currLocation) => {
    return `
        </br>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
                <div style="float:left;width: 33%;" id="boxManifestCol3">
                    <p>Site: ` + currInstitute + `</p>
                    <p>Location: ` + currLocation + `</p>
                </div>
            </div>
            <div class="row">
                <table id="boxManifestTable" style="width: 100%;">
                    <tr>
                        <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                        <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                        <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Type/Color</th>
                        <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Deviation Type</th>
                        <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Comments</th>
                    </tr>
                </table>
            </div>
            <div class="row" style="margin-top:3.125rem">
                <div class="card" style="width:100%">
                    <div class="card-body" style="text-align:center;">
                        <p style="margin-bottom: 0;">
                        <strong><span style="margin-right:0.5rem;"><i class="fas fa-exclamation-triangle fa-lg" style="color:#ffc107"></i></span>IMPORTANT: PRINT AND INCLUDE THIS MANIFEST IN SHIPPING BOX</strong>
                        </p>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top:3.125rem; display: flex; justify-content: space-between;">
                <div id="boxManifestCol1">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
                </div>
                <div id="boxManifestCol3">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
                </div>
        </div>
    `;
}

export const renderShippingModalHeader = () => {
    const header = document.getElementById('shippingModalHeader');
        header.innerHTML = `<h5 class="modal-title">Specimen Verification</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="shippingCloseButton">
        <span aria-hidden="true">&times;</span>
        </button>`;
}

export const renderShippingModalBody = (tubeTable) => {
    document.getElementById('shippingModalBody').innerHTML = `
    <table class="table" id="shippingModalTable">
        <thead>
            <tr>
                <th>Full Specimen ID</th>
                <th>Type/Color</th>
                <th style="text-align:center;">Sample Present</th>
            </tr>
        </thead>
        ${tubeTable}
    </table>
    `;
}

export const buildPopulateSpecimensHeader = () => {
    return `
        <tr>
            <th>Specimen Bag ID</th>
            <th># Specimens in Bag</th>
            <th>Collection Location</th>
        </th>
    `;
}

export const renderBoxesToShipTableHeader = () => {
    return `
        <tr>
            <th style="border-bottom:1px solid;">To Ship</th>
            <th style="border-bottom:1px solid;">Started</th>
            <th style="border-bottom:1px solid;">Last Modified</th>
            <th style="border-bottom:1px solid;">Box Number</th>
            <th style="border-bottom:1px solid;">Location</th>
            <th style="border-bottom:1px solid;">Contents</th>
            <th style="border-bottom:1px solid;text-align:center;"><p style="margin-bottom:0">View/Print Box Manifest</p><p style="margin-bottom:0">(to be included in shipment)</p></th>
        </tr>
    `;
}

export const renderBoxesToShipRow = (boxStartedTimestamp, boxLastModifiedTimestamp, boxId, boxLocation, numTubesInBox) => {
    return `
        <td><input type="checkbox" class="markForShipping" style="transform: scale(1.5); text-align= center;"></td>
        <td>${boxStartedTimestamp}</td>
        <td>${boxLastModifiedTimestamp}</td>
        <td>${boxId}</td>
        <td>${boxLocation}</td>
        <td>${numTubesInBox} tubes</td>
        <td><input type="button" style="display:block;margin:0 auto;" class="boxManifestButton" value="Box Manifest"/></td>
    `;
};

export const renderViewBoxContentsTableHeader = (selectedLocation) => {
    return `
        <tr>
            <th style = "border-bottom:1px solid;">Specimen Bag ID</th>
            <th style = "border-bottom:1px solid;">Full Specimen ID</th>
            <th style = "border-bottom:1px solid;">Type/Color</th>
            <th style = "border-bottom:1px solid; min-width:125px;"></th>
        </tr>
        ${selectedLocation === 'none' ? '<tr><td colspan="1" style="text-align:center; vertical-align:middle;">Please select a shipping location</td></tr>' : ''}
    `;
}

export const renderShippingManifestTemplate = (boxIdArray, isTempMonitorIncluded) => {
    return `
        </br>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
            </div>
        </div>
        <div class="row">
            <table id="shippingManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Box Number</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
                </tr>
            </table>
        </div>
        <div class="row" id="tempCheckList">
            ${tempSelectStringRender({boxIdArray, isTempMonitorIncluded})}
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary print-manifest" data-dismiss="modal" id="printBox">Optional: Print Shipment Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="assignTrackingNumberPage">Continue to Assign Tracking Number</button>
            </div>
        </div>
    `;
}

const renderFinalShipmentTrackingTemplate = (shipmentCourier, userName) => {
    return `
        <div class="row" style="margin-top:40px">
            <div class="col-lg" id="numBoxes">
            </div>
        </div>
        <div class="row" style="margin-top:50px">
            <p>Shipment Courier: ` + shipmentCourier + `</p>
        </div>
        <div class="row" style="margin-top:10px">
            
            <p>Verify Tracking Numbers:</p>
        </div>
        <div class="row" style="margin-top:10px">
            <table id="finalCheckTable" style="width:100%">
                <tr>
                    <th>Box</th>
                    <th>Tracking Number</th>
                    <th>Number of tubes in shipment</th>
                    <th>Number of bags in shipment</th>
                </tr>
            </table>
        </div>
        
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToTracking">Back to Assign Tracking Information</button>
            </div>
            <div style="float: left;width: 33%;">
                
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#finalizeModal" id="completeShippingButton">Finalize</button>
            </div>
        </div>

        <!-- The Modal -->
        <div class="modal fade" id="finalizeModal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content sub-div-shadow">
                    <div class="modal-header" id="finalizeModalHeader">
                        This will finalize the shipment
                    </div>
                    <div class="modal-body" id="finalizeModalBody">
                        
                    </div>
                    <div class="modal-body"> 
                        <h4>Please enter your email here to indicate this shipment is finalized. Once signed, no changes can be made to the shipment details.<h4>
                        <input type="text" id="finalizeSignInput">
                        </input>
                        <p id="finalizeModalError" style="color:red;display:none;">
                            *Please type in "` + userName + `"
                        </p>
                    </div>
                    <div class="modal-footer">
                    
                        <button type="button" class="btn btn-primary" id="finalizeModalSign">Sign</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="finalizeModalCancel">Close</button>
                    </div>  
                </div>
            </div>
        </div>
    `;
}
