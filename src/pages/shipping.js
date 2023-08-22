import { addBox, appState, conceptIdToSiteSpecificLocation, displayContactInformation, getAllBoxes, getLocationsInstitute, hideAnimation, locationConceptIDToLocationMap,
        removeActiveClass, removeBag, removeMissingSpecimen, showAnimation, showNotifications, siteSpecificLocation, siteSpecificLocationToConceptId, sortBiospecimensList,
        translateNumToType, userAuthorization } from "../shared.js"
import { addDeviationTypeCommentsContent, addEventAddSpecimenToBox, addEventBackToSearch, addEventBoxSelectListChanged, addEventCheckValidTrackInputs,
        addEventCompleteShippingButton, addEventModalAddBox, addEventNavBarBoxManifest, addEventNavBarShipment, addEventNavBarShippingManifest, addEventNavBarAssignTracking, addEventLocationSelect,
        addEventPreventTrackingConfirmPaste, addEventReturnToPackaging, addEventReturnToReviewShipmentContents, addEventSaveButton, addEventSaveAndContinueButton, addEventShipPrintManifest,
        addEventTrackingNumberScanAutoFocus, addEventTrimTrackingNums, compareBoxIds, getInstituteSpecimensList, populateCourierBox, populateFinalCheck, populateTrackingQuery } from "../events.js";     
import { homeNavBar, shippingNavBar, unAuthorizedUser} from '../navbar.js';
import { setAllShippingState, updateShippingStateCreateBox, updateShippingStateRemoveBagFromBox, updateShippingStateSelectedLocation } from '../shippingState.js';
import conceptIds from '../fieldToConceptIdMapping.js';

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

// Check for a stored location and initialize the shipping page.
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
 * NOTE: allBoxesList is used because the larger filter iterates ALL boxes and removes specimens that belong to the shipped boxes.
 * TODO: future change: add shipped property and only pull unshipped.
 * This will run asyncronously when pulling new data (loadFromState = false) and synchronously when loading from state (loadFromState = true).
 * @param {*} userName - the logged-in userName.
 * @param {*} loadFromState - whether to load data from state or from the server.
 * @param {*} currBoxId - the currently selected boxId.
 */
const buildShippingInterface = async (userName, loadFromState, currBoxId) => {    
    showAnimation();

    let allBoxesList;
    let availableLocations;

    if (loadFromState) {
        availableLocations = appState.getState().availableLocations;
        allBoxesList = appState.getState().allBoxesList;
    } else {
        const getAllBoxesResponse = await getAllBoxes();
        allBoxesList = getAllBoxesResponse.data;
    }

    const promiseResponse = await Promise.all([
        populateAvailableCollectionsList(allBoxesList, loadFromState),
        populateSelectLocationList(availableLocations, loadFromState),
    ]);

    const { finalizedSpecimenList, availableCollectionsObj } = promiseResponse[0];
    availableLocations = promiseResponse[1];

    setAllShippingState(availableCollectionsObj, availableLocations, allBoxesList, finalizedSpecimenList, userName);

    populateViewShippingBoxContentsList(currBoxId); // 'View Shipping Box Contents' section
    populateBoxesToShipTable(); // 'Select boxes to ship' section
    addShippingEventListeners();

    hideAnimation();
}

const addShippingEventListeners = () => {
    const userName = appState.getState().userName;
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarShippingManifest(userName);
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest");
    addEventLocationSelect("selectLocationList", "shipping_location");
    addEventAddSpecimenToBox();
    addEventModalAddBox();
}

const getStoredLocationOnInit = () => {
    const selectedLocation = JSON.parse(localStorage.getItem('selections'))?.shipping_location ?? 'none';
    updateShippingStateSelectedLocation(selectedLocation);
    return selectedLocation;
}

/**
 * Populate the 'Available Collections' table.
 * @param {array} boxList - list of available boxes.
 * @param {boolean} loadFromState - if true, load data from state instead of fetching from server.
 * @returns {array} finalizedSpecimenList - the list of specimens with the finalized flag.
 * @returns {object} availableCollectionsObj - obj to populate the 'Available Collections' table.
 * If finalizedSpecimenList or availableCollectionsObj are empty (such as initial load), fetched from server.
 * Note: Orphan panel is currently hidden by request of the product team. Retain for future use.
 *       Future orphan panel use would require completed state management implementation in the 'currDeleteButton' event listener.
 */
const populateAvailableCollectionsList = async (boxList, loadFromState = false) => {
    let finalizedSpecimenList = appState.getState().finalizedSpecimenList ?? [];
    let availableCollectionsObj = appState.getState().availableCollectionsObj ?? {};

    if (!loadFromState) {
        ({ finalizedSpecimenList, availableCollectionsObj } = await getInstituteSpecimensList(boxList));
    }

    const bagIdList = Object.keys(availableCollectionsObj).sort();

    const tableEle = document.getElementById("specimenList");
    tableEle.innerHTML = buildPopulateSpecimensHeader();
    
    let numRows = 1;
    let orphanBagId;

    for (const bagId of bagIdList) {
        if (bagId !== "unlabelled") {
            const rowEle = tableEle.insertRow();
            rowEle.insertCell(0).innerHTML = bagId;
            rowEle.insertCell(1).innerHTML = availableCollectionsObj[bagId].length;

            const hiddenChannel = rowEle.insertCell(2)
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

    return { finalizedSpecimenList, availableCollectionsObj };
}

const populateBoxesToShipTable = () => {
    const detailedBoxes = appState.getState().detailedProviderBoxes;
    const table = document.getElementById("saveTable");
    table.innerHTML = renderBoxesToShipTableHeader();
    
    if (Object.keys(detailedBoxes).length > 0) {
        const sortedBoxKeys = Object.keys(detailedBoxes).sort();
        sortedBoxKeys.forEach((box, i) => {
            const currBox = detailedBoxes[box];
            const bagKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined').sort((a, b) => a.split(/\s+/)[1] - b.split(/\s+/)[1]);
            const boxStartedTimestamp = currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp] ? formatTimestamp(Date.parse(currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp])) : '';
            const boxLastModifiedTimestamp = currBox.boxData[conceptIds.shippingShipDateModify] ? formatTimestamp(Date.parse(currBox.boxData[conceptIds.shippingShipDateModify])) : '';
            const boxLocation = currBox.boxData[conceptIds.shippingLocation] ? locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]["siteSpecificLocation"] : '';
            const numTubesInBox = bagKeys.reduce((total, bagKey) => total + currBox[bagKey]['arrElements'].length, 0);

            const currRow = table.insertRow(i + 1);
            currRow.style['background-color'] = i % 2 === 1 ? 'lightgrey' : '';
            
            if (numTubesInBox > 0) {
                currRow.innerHTML += renderBoxesToShipRow(boxStartedTimestamp, boxLastModifiedTimestamp, box, boxLocation, numTubesInBox);
                const currBoxButton = currRow.cells[6].querySelector(".boxManifestButton");
                currBoxButton.addEventListener("click", async () => {
                generateBoxManifest(currBox);
            });
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
            for (let bagNum = 0; bagNum < boxKeys.length; bagNum++) {
                const currBagId = boxKeys[bagNum];
                const currTubes = currBox[boxKeys[bagNum]]['arrElements'];
                for (let tubeNum = 0; tubeNum < currTubes.length; tubeNum++) {
                    const fullTubeId = currTubes[tubeNum];
                    const tubeTypeStringArr = fullTubeId.split(' ');
                    const tubeType = translateNumToType[tubeTypeStringArr[1]] ? translateNumToType[tubeTypeStringArr[1]] : 'N/A';
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
        showAnimation();
        const row = e.target.closest('tr');
        const currBagId = row.cells[0].innerText;
        const bagsToRemove = currBagId === "unlabelled" ? currTubes : [currBagId];        
        const removeBagResponse = await removeBag(currBoxId, bagsToRemove);
        hideAnimation();

        if (removeBagResponse.code === 200) {
            updateShippingStateRemoveBagFromBox(currBoxId, bagsToRemove);
            startShipping(appState.getState().userName, true, currBoxId);
        } else {
            showNotifications({ title: 'Error removing bag', body: 'We experienced an error removing this bag. Please try again.' });
        }
    });
}

// Calculate the highest existing boxId and ++ for the new box.
// Create the box and add it to firestore. On success, add it to the relevant state objects (allBoxesList and boxesByLocationList, and detailedProviderBoxes).
export const addNewBox = async () => {    
    const siteLocation = document.getElementById('selectLocationList').value;
    const siteLocationConversion = siteSpecificLocationToConceptId[siteLocation];
    const siteCode = siteSpecificLocation[siteLocation]["siteCode"];
    
    const boxList = appState.getState().allBoxesList;
    
    const { largestBoxIndex, largestBoxIndexAtLocation } = findLargestBoxData(boxList, siteLocation);
    const shouldUpdateBoxModal = largestBoxIndexAtLocation !== -1 && Object.keys(boxList[largestBoxIndexAtLocation]['bags']).length !== 0;
    
    let largestBoxId;
    if (shouldUpdateBoxModal) largestBoxId = boxList[largestBoxIndex][conceptIds.shippingBoxId];
    else largestBoxId = largestBoxIndex !== -1 ? boxList[largestBoxIndex][conceptIds.shippingBoxId] : 'Box0';

    if (largestBoxIndexAtLocation == -1 || shouldUpdateBoxModal) {
        const boxToAdd = await createNewBox(boxList, siteLocationConversion, siteCode, largestBoxId, shouldUpdateBoxModal);
        if (!boxToAdd) return false;
        updateShippingStateCreateBox(boxToAdd);
        return true;
    } else {
        return false;
    }
}

const createNewBox = async (boxList, pageLocationConversion, siteCode, largestBoxId, updateBoxModal) => {
    const newBoxNum = parseInt(largestBoxId.substring(3)) + 1;
    const newBoxId = 'Box' + newBoxNum.toString();
    const boxToAdd = {
        'bags': {},
        [conceptIds.shippingBoxId]: newBoxId,
        [conceptIds.shippingLocation]: pageLocationConversion,
        [conceptIds.siteCode]: siteCode,
        [conceptIds.submitShipmentFlag]: conceptIds.no,
        [conceptIds.siteShipmentReceived]: conceptIds.no
    };

    try {
        await addBox(boxToAdd);
    } catch (e) {
        console.error('Error adding box', e);
        return null;
    }
    
    boxList.push(boxToAdd);
    if (updateBoxModal) document.getElementById('shippingModalChooseBox').setAttribute('data-new-box', newBoxId);

    return boxToAdd;
}

// Find the largest box among all boxes and the largest box at the specified location.
const findLargestBoxData = (boxList, siteLocation) => {
    let largestBoxId = 0; 
    let largestBoxIndex = -1;
    let largestLocationBoxId = 0; 
    let largestBoxIndexAtLocation = -1;

    for (let i = 0; i < boxList.length; i++) {
        const currBoxNum = parseInt(boxList[i][conceptIds.shippingBoxId].substring(3));
        const currLocation = conceptIdToSiteSpecificLocation[boxList[i][conceptIds.shippingLocation]];

        if (currBoxNum > largestBoxId) {
            largestBoxId = currBoxNum;
            largestBoxIndex = i;
        }

        if (currLocation == siteLocation && currBoxNum > largestLocationBoxId) {
            largestLocationBoxId = currBoxNum;
            largestBoxIndexAtLocation = i;
        }
    }

    return { largestBoxIndex, largestBoxIndexAtLocation };
}

export const generateBoxManifest = (currBox) => {
    const currInstitute = currBox.boxData.siteAcronym;
    const currLocation = locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]["siteSpecificLocation"];
    const currContactInfo = locationConceptIDToLocationMap[currBox.boxData[conceptIds.shippingLocation]]["contactInfo"];

    removeActiveClass('navbar-btn', 'active');
    const navBarBoxManifestBtn = document.getElementById('navBarBoxManifest');
    navBarBoxManifestBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = renderBoxManifestTemplate(currInstitute, currLocation);

    populateBoxManifestHeader(currBox, currContactInfo);
    populateBoxManifestTable(currBox);
    document.getElementById('printBox').addEventListener('click', e => {
        window.print();
    });

    addEventReturnToPackaging();
}

export const populateBoxManifestHeader = (currBox, currContactInfo) => {
    if(!currBox) return;

    const currKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined');
    const numBags = currKeys.length;
    const numTubes = currKeys.reduce((acc, bagKey) => acc + currBox[bagKey]['arrElements'].length, 0);

    const boxId = currBox.boxData[conceptIds.shippingBoxId];
    const boxStartedTimestamp = formatTimestamp(currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp]);
    const boxLastModifiedTimestamp = formatTimestamp(currBox.boxData[conceptIds.shippingShipDateModify]);

    renderBoxManifestHeader(boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currContactInfo);
}

// Render the box manifest header.
// CreateParent divs, create list of data to be appended, create the new elements, append.
const renderBoxManifestHeader = (boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currContactInfo) => {
    const boxManifestCol1 = document.getElementById('boxManifestCol1');
    const boxManifestCol3 = document.getElementById('boxManifestCol3');
    
    const div1 = document.createElement("div");
    const div3 = document.createElement("div");
    
    const dataCol1 = [
        { text: `${boxId} Manifest`, style: { fontWeight: '700', fontSize: '1.5rem' } },
        { text: `Date Started: ${boxStartedTimestamp}` },
        { text: `Last Modified: ${boxLastModifiedTimestamp}` },
        { text: displayContactInformation(currContactInfo), isHTML: true }
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
            biospecimensList = JSON.parse(currRow.cells[2].innerText)
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
    let isBagEmpty = true;
    
    biospecimensList = sortBiospecimensList(biospecimensList);
    for (const specimenId of biospecimensList) {
        if (shouldAddModalRow(isOrphan, splitTubeIdArray, specimenId)) {
            isBagEmpty = addRowToModalTable(isBagEmpty, tubeTable, splitTubeIdArray, specimenId);
        }
    }

    renderShippingModalBody(tubeTable.innerHTML);
    populateModalSelect(boxIdAndBagsObj);

    if (isBagEmpty) {
        showNotifications({ title: 'Not found', body: 'The participant with entered search criteria not found!' }, true);
        document.getElementById('shippingCloseButton').click();
        hideAnimation();
    }
}

const shouldAddModalRow = (isOrphan, splitTubeIdArray, tubeId) => {
    if (isOrphan) return true;
    if (splitTubeIdArray.length >= 2 && splitTubeIdArray[1] == '0008') {
        //look for all non-mouthwash (0007)
        return tubeId !== '0007' && tubeId !== '0008';
    } else {
        return tubeId === '0007' && tubeId !== '0009';
    }
}

const addRowToModalTable = (isBagEmpty, tubeTable, splitTubeIdArray, tubeId) => {
    isBagEmpty = false;
    const rowCount = tubeTable.rows.length;
    const row = tubeTable.insertRow(rowCount);
    const tubeType = translateNumToType.hasOwnProperty(tubeId) ? translateNumToType[tubeId] : 'N/A';

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

export const prepareBoxToUpdate = (boxId, boxList, boxIdAndBagsObj, locations) => {
    const currTime = new Date().toISOString();
    const foundBox = boxList.find(box => box[conceptIds.shippingBoxId] == boxId) || {};

    return {
        ...foundBox,
        'bags': boxIdAndBagsObj[boxId],
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
    const currArr = availableCollectionsTable?.rows[tableIndex]?.cells[2]?.innerText;
    if(currArr != undefined) {
        const parseCurrArr = JSON.parse(availableCollectionsTable.rows[tableIndex].cells[2].innerText);
        for (let i = 0; i < tubesToDelete.length; i++) {
            parseCurrArr.splice(parseCurrArr.indexOf(tubesToDelete[i]), 1);
        }
        if (parseCurrArr.length == 0) {
            availableCollectionsTable.deleteRow(tableIndex);
        } else {
            availableCollectionsTable.rows[tableIndex].cells[2].innerText = JSON.stringify(parseCurrArr);
            availableCollectionsTable.rows[tableIndex].cells[1].innerText = parseCurrArr.length;
        }
    }
}

const assignBagId = (tubeId, collectionId) => {
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
    const options = boxIds.map(boxId => `<option>${boxId}</option>`).join(''); 

    if (options == '') {
        addToBoxButton.setAttribute('disabled', 'true');
    }

    boxSelectEle.innerHTML = options;
    boxSelectEle.value = selectedBoxId;
}

export const populateTempSelect = (boxes) => {
    const boxDiv = document.getElementById("tempCheckList");
    boxDiv.style.display = "block";
    boxDiv.style.marginTop = "10px";
    boxDiv.innerHTML = `<p>Select the box that contains the temperature monitor</p>
        <select name="tempBox" id="tempBox">
        <option disabled value> -- select a box -- </option>
        </select>`;

    const toPopulate = document.getElementById('tempBox')

    for (let i = 0; i < boxes.length; i++) {
        
        const opt = document.createElement("option");
        opt.value = boxes[i];
        opt.innerHTML = boxes[i];
        if(i === 0){
            opt.selected = true;
        }
        // then append it to the select element
        toPopulate.appendChild(opt);
    }
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
    bagList.forEach((bagKey, bagIndex) => {
        const bagIndexStart = bagIndex + 1;
        const tubesList = currBox[bagKey].arrElements;
        for (let i = 0; i < tubesList.length; i++) {
            const tubeDetail = currBox[bagKey].specimenDetails[tubesList[i]];
            const currRow = boxManifestTable.insertRow(i + 1);
            const tubeId = tubesList[i].split(' ');
            const tubeTypeAndColor = translateNumToType[tubeId[1]] ? translateNumToType[tubeId[1]] : 'N/A';
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
export const generateShippingManifest = (boxIdArray, userName, isTempMonitorIncluded, currShippingLocationNumber) => {
    showAnimation();
    const boxArray = appState.getState().allBoxesList;
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
            showNotifications({title: 'Missing field!', body: 'Please enter the box where the temperature monitor is being stored.'}, true);
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

export const populateShippingManifestHeader = (userName, siteAcronym, currShippingLocationNumber) => {
    const currContactInfo = locationConceptIDToLocationMap[currShippingLocationNumber]["contactInfo"][siteAcronym];
    const siteSpecificLocation = locationConceptIDToLocationMap[currShippingLocationNumber]["siteSpecificLocation"];

    const currentDateTime = formatTimestamp();
    const dataCol1 = [
        { text: "Shipment Manifest", style: { fontWeight: '700', fontSize: '1.5rem' } },
        { text: `Current Date/Time: ${currentDateTime}` },
        { text: `Sender: ${userName}` },
        { text: displayContactInformation(currContactInfo), isHTML: true }
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
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName, boxWithTempMonitor)
    await populateTrackingQuery(boxIdAndBagsObj);
    addEventTrimTrackingNums()
    addEventTrackingNumberScanAutoFocus()
    addEventPreventTrackingConfirmPaste()
    addEventCheckValidTrackInputs(boxIdAndBagsObj)
    addEventSaveButton(boxIdAndBagsObj);
    addEventSaveAndContinueButton(boxIdAndBagsObj, userName, boxWithTempMonitor);
    hideAnimation();
}

export const finalShipmentTracking = (boxIdAndBagsObj, userName, boxWithTempMonitor, shipmentCourier) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2 >Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarFinalizeShipment');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = renderFinalShipmentTrackingTemplate(shipmentCourier, userName);
    
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarAssignTracking("returnToTracking", userName, boxIdAndBagsObj, boxWithTempMonitor)
    addEventNavBarAssignTracking("navBarFinalizeShipment", userName, boxIdAndBagsObj, boxWithTempMonitor)
    populateFinalCheck(boxIdAndBagsObj);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName)
    addEventCompleteShippingButton(boxIdAndBagsObj, userName, boxWithTempMonitor, shipmentCourier);
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
                        <div id="create-box-error" class="alert alert-danger" role="alert" style="display:none;">Please add a specimen or specimens to last box
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
