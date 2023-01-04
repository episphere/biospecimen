import { performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant, errorMessage, removeAllErrors, storeSpecimen, updateSpecimen, searchSpecimen, generateBarCode, searchSpecimenInstitute, addBox, updateBox, getBoxes, ship, getLocationsInstitute, getBoxesByLocation, disableInput, allStates, removeBag, removeMissingSpecimen, getAllBoxes, getNextTempCheck, updateNewTempDate, getSiteTubesLists, getWorflow, collectionSettings, getSiteCouriers, getPage, getNumPages, allTubesCollected, removeSingleError, updateParticipant, displayContactInformation, checkShipForage, checkAlertState, sortBiospecimensList, retrieveDateFromIsoString, convertConceptIdToPackageCondition, checkFedexShipDuplicate, shippingDuplicateMessage, checkInParticipant, checkOutParticipant, getCheckedInVisit, shippingPrintManifestReminder, checkNonAlphanumericStr, shippingNonAlphaNumericStrMessage, visitType, getParticipantCollections, updateBaselineData, getUpdatedParticipantData, siteSpecificLocation, siteSpecificLocationToConceptId, conceptIdToSiteSpecificLocation, locationConceptIDToLocationMap, siteFullNames, updateCollectionSettingData, convertToOldBox, translateNumToType, getCollectionsByVisit, getUserProfile, checkDuplicateTrackingIdFromDb, getAllBoxesWithoutConversion,  bagConceptIdList, checkAccessionId, checkSurveyEmailTrigger, packageConditonConversion } from './shared.js';
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { showReportsManifest, startReport } from './pages/reportsQuery.js';
import { startShipping, boxManifest, shippingManifest, finalShipmentTracking, shipmentTracking } from './pages/shipping.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { additionalTubeIDRequirement, masterSpecimenIDRequirement, siteSpecificTubeRequirements, totalCollectionIDLength, workflows, specimenCollection } from './tubeValidation.js';
import conceptIds from './fieldToConceptIdMapping.js';

export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dobEl = document.getElementById('dob');
        let dob = dobEl.value;

        if (dobEl.dataset.maskedInputFormat === "mm/dd/yyyy") {
            const [mm,dd,yyyy] = dob.split('/');
            dob = `${yyyy}${mm}${dd}`;
        }

        if (!firstName && !lastName && !dob) return;
        let query = '';
        if (firstName) query += `firstName=${firstName}&`;
        if (lastName) query += `lastName=${lastName}&`;
        if (dob) query += `dob=${dob.replace(/-/g, '')}&`;
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
        if (biospecimen.code !== 200) {
            hideAnimation();
            showNotifications({ title: 'Not found', body: 'Specimen not found!' }, true)
            return
        }
        const biospecimenData = biospecimen.data;

        if(getWorflow() === 'research') {
            if(biospecimenData['650516960'] != 534621077) {
                hideAnimation();
                showNotifications({ title: 'Incorrect Dashboard', body: 'Clinical Collections cannot be viewed on Research Dashboard' }, true);
                return;
            }
        }
        else {
            if(biospecimenData['650516960'] === 534621077) {
                hideAnimation();
                showNotifications({ title: 'Incorrect Dashboard', body: 'Research Collections cannot be viewed on Clinical Dashboard' }, true);
                return;
            }
        }

        let query = `connectId=${parseInt(biospecimenData.Connect_ID)}`;
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];

        tubeCollectedTemplate(data, biospecimenData);
    })
}

export const getCurrBoxNumber = (j) => {
    let keys = Object.keys(j);
    let count = 1;
    return keys.length;
}

export const addEventAddSpecimenToBox = (userName) => {
    const form = document.getElementById('addSpecimenForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const masterSpecimenId = document.getElementById('masterSpecimenId').value.trim();
        const shippingLocationValue = document.getElementById('selectLocationList').value;
        if(shippingLocationValue === 'none') { // No Shipping Location Selected from dropdown
            showNotifications({ title: 'Shipping Location Not Selected', body: 'Please select a shipping location from the dropdown.' }, true)
            return
        }
        if (masterSpecimenId == '') { // Message when whitespace is removed and input is empty string
            showNotifications({ title: 'Empty Entry or Scan', body: 'Please enter or scan a specimen bag ID or Full Specimen ID.' }, true)
            return
        }

        showAnimation();
        const getAllBoxesWithoutConversionResponse = await getAllBoxesWithoutConversion(); // get and search all boxes from a login site
        hideAnimation();
        let masterIdSplit = masterSpecimenId.split(/\s+/);
        let foundInOrphan = false;
        //get all ids from the hidden
        let shippingTable = document.getElementById('specimenList') // Available Collections table
        let orphanTable = document.getElementById('orphansList') // Hidden Orphan Table 
        let biospecimensList = []
        let tableIndex = -1;
        let foundinShippingTable = false;
        let foundScannedIdShipped = isScannedIdShipped(getAllBoxesWithoutConversionResponse, masterSpecimenId)
        let scannedIdInBoxesNotShippedObject = findScannedIdInBoxesNotShippedObject(getAllBoxesWithoutConversionResponse, masterSpecimenId)
        let isScannedIdInBoxesNotShipped = scannedIdInBoxesNotShippedObject['foundMatch']

        for (let i = 1; i < shippingTable.rows.length; i++) {
            let currRow = shippingTable.rows[i];
            if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId.toUpperCase()) {
                tableIndex = i;
                biospecimensList = JSON.parse(currRow.cells[2].innerText)
                foundinShippingTable = true;
            }
        }

        for (let i = 1; i < orphanTable.rows.length; i++) {
            let currRow = orphanTable.rows[i];
            if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId.toUpperCase()) {
                tableIndex = i;
                let currTubeNum = currRow.cells[0].innerText.split(' ')[1];
                biospecimensList = [currTubeNum];
                foundInOrphan = true;
            }
        }
        
        if (foundScannedIdShipped){ // Check if item scanned is already shipped
            showNotifications({ title:'Item reported as already shipped', body: 'Please enter or scan another specimen bag ID or Full Specimen ID.'}, true)
            return
        }
        
        if(isScannedIdInBoxesNotShipped) { // Check if item scanned appears in current boxes
            let boxNum = scannedIdInBoxesNotShippedObject['132929440']
            let siteSpecificLocation = conceptIdToSiteSpecificLocation[scannedIdInBoxesNotShippedObject['560975149']]
            let siteSpecificLocationName = siteSpecificLocation ? siteSpecificLocation : ''
            let scannedInput = scannedIdInBoxesNotShippedObject['inputScanned']
            showNotifications({ title:`${scannedInput} has already been recorded`, body: `${scannedInput} is recorded as being in ${boxNum} in ${siteSpecificLocationName}`}, true)
            return
        }

        if (biospecimensList.length == 0) {
            showNotifications({ title: 'Item not found', body: `Item not reported as collected. Go to the Collection Dashboard to add specimen.` }, true)
            return
        }
        else {
            document.getElementById('submitMasterSpecimenId').click();
        }
    });
    const submitButtonSpecimen = document.getElementById('submitMasterSpecimenId');
    submitButtonSpecimen.addEventListener('click', async e => {
        e.preventDefault();
        showAnimation();
        //getCurrBoxNumber

        const masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase().trim();
        let mouthwashList = document.getElementById("mouthwashList")
        let currTubeTable = document.getElementById("currTubeTable")

        const header = document.getElementById('shippingModalHeader');
        const body = document.getElementById('shippingModalBody');
        header.innerHTML = `<h5 class="modal-title">Specimen Verification</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="shippingCloseButton">
                                <span aria-hidden="true">&times;</span>
                            </button>`;

        /*body.innerHTML = `
        <table class="table" id="shippingModalTable">
            <thead>
                <tr>
                    <th>Full Specimen ID</th>
                    <th>Type/Color</th>
                    <th style="text-align:center;">Sample Present</th>
                </tr>
            </thead>
        </table>
        `;*/
        let masterIdSplit = masterSpecimenId.split(/\s+/);
        let foundInOrphan = false;
        //get all ids from the hidden
        let shippingTable = document.getElementById('specimenList')
        let orphanTable = document.getElementById('orphansList')
        let biospecimensList = []
        let tableIndex = -1;
        let foundinShippingTable = false;

        // Modify to change tube order, tube ordered by color
        let tubeOrder = [      
        "0001", //"SST/Gold or Red"
        "0002", //"SST/Gold or Red"
        "0011", //"SST/Gold or Red"
        "0012", //"SST/Gold or Red"
        "0021", //"SST/Gold or Red"
        "0022", //"SST/Gold or Red"
        "0031", //"SST/Gold or Red"
        "0032", //"SST/Gold or Red"
        "0003", //"Heparin/Green"
        "0013", //"Heparin/Green"
        "0004", //"EDTA/Lavender"
        "0014", //"EDTA/Lavender"
        "0024", //"EDTA/Lavender"
        "0005", //"ACD/Yellow"
        "0006", //"Urine/Yellow"
        "0016", //"Urine Cup"
        "0007", //"Mouthwash Container"
        "0050", //"NA"
        "0051", //"NA"
        "0052", //"NA"
        "0053", //"NA"
        "0054", //"NA
      ] 
        for (let i = 1; i < shippingTable.rows.length; i++) {
            let currRow = shippingTable.rows[i];
            if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId) {
                tableIndex = i;
                biospecimensList = JSON.parse(currRow.cells[2].innerText)
                foundinShippingTable = true;
            }

        }

        for (let i = 1; i < orphanTable.rows.length; i++) {
            let currRow = orphanTable.rows[i];
            if (currRow.cells[0] !== undefined && currRow.cells[0].innerText == masterSpecimenId) {
                tableIndex = i;
                let currTubeNum = currRow.cells[0].innerText.split(' ')[1];
                biospecimensList = [currTubeNum];
                foundInOrphan = true;
            }

        }

        if (biospecimensList.length == 0) {
            showNotifications({ title: 'Not found', body: 'The participant with entered search criteria not found!' }, true)
            hideAnimation();
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(500);
            document.getElementById('shippingCloseButton').click();
            return
        }

        const biospecimensListByType = sortBiospecimensList(biospecimensList, tubeOrder)
        await createShippingModalBody(biospecimensListByType, masterSpecimenId, foundInOrphan)
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex, foundInOrphan, userName);
        hideAnimation();

    })
}

export const createShippingModalBody = async (biospecimensList, masterBiospecimenId, isOrphan) => {
    //let keys = Object.keys(biospecimenData)
    /*let tubes = [];
    for(let i = 0; i < biospecimensList.length; i++){
        let currData = biospecimenData[keys[i]];
        let re = /tube[0-9]*Id/
        if(biospecimensList[i].match(re) != null){
            tubes.push(biospecimenData[keys[i]]);
        }
    }*/
    let currLocation = document.getElementById('selectLocationList').value;
    let currLocationConceptId = siteSpecificLocationToConceptId[currLocation]
    let response = await getBoxesByLocation(currLocationConceptId);
    let boxList = response.data;
    let boxIdAndBagsObj = {};
    for (let i = 0; i < boxList.length; i++) {
        let box = boxList[i]
        boxIdAndBagsObj[box['132929440']] = box['bags']
    }

    //let tubeTable = document.getElementById("shippingModalTable")
    let tubeTable = document.createElement('table');
    let currSplit = masterBiospecimenId.split(/\s+/); /* Ex. ['CXA000133', '0008']*/
    let currBag = [];
    let empty = true;
    if (!isOrphan) {
        if (currSplit.length >= 2 && currSplit[1] == '0008') {
            //look for all non-moutwash (0007)
            for (let i = 0; i < biospecimensList.length; i++) {
                if (biospecimensList[i] != '0007' && biospecimensList[i] != '0008') {
                    empty = false;
                    currBag.push(biospecimensList[i])
                    var rowCount = tubeTable.rows.length;
                    var row = tubeTable.insertRow(rowCount);

                    row.insertCell(0).innerHTML = currSplit[0] + ' ' + biospecimensList[i];
                    let thisId = biospecimensList[i];
                    let toAddType = 'N/A'
                    if (translateNumToType.hasOwnProperty(thisId)) {
                        toAddType = translateNumToType[thisId];
                    }
                    row.insertCell(1).innerHTML = toAddType;
                    row.insertCell(2).innerHTML = '<input type="checkbox" class="samplePresentCheckbox" style="transform: scale(2); display:block; margin:0 auto;"  checked>';
                    row.cells[2].style.verticalAlign = "middle"

                    let checkboxEl = row.cells[2].firstChild
                    checkboxEl.setAttribute("data-full-specimen-id", `${currSplit[0]} ${biospecimensList[i]}`)
                    checkboxEl.addEventListener("click", e => {
                        e.target.toggleAttribute("checked")
                    })
                }
            }
        }
        else {
            for (let i = 0; i < biospecimensList.length; i++) {
                if (biospecimensList[i] == '0007' && biospecimensList[i] != '0009') {
                    empty = false;
                    currBag.push(biospecimensList[i])
                    var rowCount = tubeTable.rows.length;
                    var row = tubeTable.insertRow(rowCount);
                    row.insertCell(0).innerHTML = currSplit[0] + ' ' + biospecimensList[i];
                    let thisId = biospecimensList[i]
                    let toAddType = 'N/A'
                    if (translateNumToType.hasOwnProperty(thisId)) {
                        toAddType = translateNumToType[thisId];
                    }
                    row.insertCell(1).innerHTML = toAddType;
                    row.insertCell(2).innerHTML = `<input type="checkbox" class="samplePresentCheckbox" style="transform: scale(2); display:block; margin:0 auto;" checked>`;
                    row.cells[2].style.verticalAlign = "middle"

                    let checkboxEl = row.cells[2].firstChild
                    checkboxEl.setAttribute("data-full-specimen-id", `${currSplit[0]} ${biospecimensList[i]}`)
                    checkboxEl.addEventListener("click", e => {
                        e.target.toggleAttribute("checked")
                    })
                }
            }
        }
    }
    else {
        for (let i = 0; i < biospecimensList.length; i++) {
            empty = false;
            currBag.push(biospecimensList[i])
            var rowCount = tubeTable.rows.length;
            var row = tubeTable.insertRow(rowCount);

            row.insertCell(0).innerHTML = currSplit[0] + ' ' + biospecimensList[i];
            let thisId = biospecimensList[i]
            let toAddType = 'N/A'
            if (translateNumToType.hasOwnProperty(thisId)) {
                toAddType = translateNumToType[thisId];
            }
            row.insertCell(1).innerHTML = toAddType;
            row.insertCell(2).innerHTML = '<input type="checkbox" class="samplePresentCheckbox" style="transform: scale(2); display:block; margin:0 auto;"  checked>';
            row.cells[2].style.verticalAlign = "middle"

            let checkboxEl = row.cells[2].firstChild
            checkboxEl.setAttribute("data-full-specimen-id", `${currSplit[0]} ${biospecimensList[i]}`)
            checkboxEl.addEventListener("click", e => {
                e.target.toggleAttribute("checked")
            })
        }
    }

    document.getElementById('shippingModalBody').innerHTML = `
    <table class="table" id="shippingModalTable">
        <thead>
            <tr>
                <th>Full Specimen ID</th>
                <th>Type/Color</th>
                <th style="text-align:center;">Sample Present</th>
            </tr>
        </thead>
        ${tubeTable.innerHTML}
    </table>
    `;
    populateModalSelect(boxIdAndBagsObj)
    if (empty) {
        showNotifications({ title: 'Not found', body: 'The participant with entered search criteria not found!' }, true)
        document.getElementById('shippingCloseButton').click();
        hideAnimation();
        return
    }

}

export const addEventAddSpecimensToListModalButton = (bagid, tableIndex, isOrphan, userName) => {
    let submitButton = document.getElementById('addToBagButton')
    let specimenSearch = document.getElementById('masterSpecimenId')
    submitButton.addEventListener('click', async e => {
        e.preventDefault();
        showAnimation();
        let boxIdAndBagsObj = {};
        // get un-shipped boxes
        let response = await getBoxes();
        let boxList = response.data;
        let locations = {};
        for (let i = 0; i < boxList.length; i++) {
            let box = boxList[i]
            // Box ID ("132929440"); Location ID, site specific ("560975149"); Login Site ("789843387")
            boxIdAndBagsObj[box['132929440']] = box['bags']
            // Location ID's value will be a number
            locations[box['132929440']] = box['560975149'];
        }

        //push the things into the right box
        //first get all elements still left
        let tubeTable = document.getElementById("shippingModalTable");
        let numRows = tubeTable.rows.length;
        let bagSplit = bagid.split(/\s+/);
        let boxId = document.getElementById('shippingModalChooseBox').value;
        let nameSplit = userName.split(/\s+/);
        let firstName = nameSplit[0] ? nameSplit[0] : '';
        let lastName = nameSplit[1] ? nameSplit[1] : '';
        let checkedEleList = [];
        let uncheckedEleList = [];
        const allCheckboxEle = document.querySelectorAll(".samplePresentCheckbox");

        for (let ele of allCheckboxEle) {
            if (ele.checked) {
                checkedEleList.push(ele)
            }
            else {
                uncheckedEleList.push(ele)
            }
        }

        if (isOrphan) {
            bagid = 'unlabelled'
        }

        let toDelete = [];

        for (let i = 0; i < checkedEleList.length; i++) {
            // data-full-specimen-id (Ex. "CXA444444 0007")
            let idToAdd = checkedEleList[i].getAttribute("data-full-specimen-id")
            const [collectionId, tubeId] = idToAdd.split(/\s+/);
            toDelete.push(tubeId);

            if (!isOrphan) {
                if (tubeId === '0007') {
                    bagid = collectionId + ' 0009';
                } else {
                    bagid = collectionId + ' 0008';
                }
            }

            if (boxIdAndBagsObj.hasOwnProperty(boxId)) {
                if (boxIdAndBagsObj[boxId].hasOwnProperty(bagid)) {
                    let arr = boxIdAndBagsObj[boxId][bagid]['arrElements'];
                    arr.push(idToAdd);
                }
                else {
                    boxIdAndBagsObj[boxId][bagid] = { 'arrElements': [idToAdd], '469819603': firstName, '618036638': lastName };
                }
            }
            else {
                boxIdAndBagsObj[boxId] = {}
                boxIdAndBagsObj[boxId][bagid] = { 'arrElements': [idToAdd], '469819603': firstName, '618036638': lastName };
            }

        }

        document.getElementById('selectBoxList').value = boxId;

        let shippingTable = document.getElementById('specimenList')

        // handle an orphan tube scanned if currArr is undefined 
        let currArr = shippingTable?.rows[tableIndex]?.cells[2]?.innerText
        if(currArr != undefined) {
          let parseCurrArr = JSON.parse(shippingTable.rows[tableIndex].cells[2].innerText)
          for (let i = 0; i < toDelete.length; i++) {
            let currDel = toDelete[i];
            parseCurrArr.splice(parseCurrArr.indexOf(toDelete[i]), 1);
          }
          if (parseCurrArr.length == 0) {
            shippingTable.deleteRow(tableIndex);
          }
          else {
            shippingTable.rows[tableIndex].cells[2].innerText = JSON.stringify(parseCurrArr);
            shippingTable.rows[tableIndex].cells[1].innerText = parseCurrArr.length;
          }
        }
        let boxIds = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);

        for (let i = 0; i < boxIds.length; i++) {
            let currTime = new Date().toISOString();
            let toPass = {};
            let found = false;
            if (boxIds[i] == boxId) {
                for (let j = 0; j < boxList.length; j++) {
                    if (boxList[j]['132929440'] == boxIds[i]) {
                      // Autogenerated date/time when first bag added to box - 672863981
                        if (boxList[j].hasOwnProperty('672863981')) {
                            toPass['672863981'] = boxList[j]['672863981'];
                            found = true;
                        }
                        if (boxList[j].hasOwnProperty('555611076')) {
                            toPass['555611076'] = boxList[j]['555611076'];
                        }
                    }
                }

                if (found == false) {
                    toPass['672863981'] = currTime;
                }
                /* 
                Box ID - 132929440
                Location ID, site specific - 560975149
                Autogenerated date/time when box last modified (bag added or removed)- 555611076
                */
                toPass['132929440'] = boxIds[i]; 
                toPass['bags'] = boxIdAndBagsObj[boxIds[i]]
                toPass['560975149'] = locations[boxIds[i]]
                toPass['789843387'] = siteSpecificLocation[conceptIdToSiteSpecificLocation[locations[boxIds[i]]]].siteCode
                toPass['555611076'] = currTime;
                await updateBox(toPass);
            }
        }

        response = await getAllBoxes();
        boxList = response.data;
        await populateTubeInBoxList(userName);
        await populateSpecimensList(boxList);
        boxIdAndBagsObj = {};

        for (let i = 0; i < boxList.length; i++) {
            if (!boxList[i].hasOwnProperty('145971562') || boxList[i]['145971562'] != '353358909') {
                let box = boxList[i]
                boxIdAndBagsObj[box['132929440']] = box['bags']
            }

        }

        await populateSaveTable(boxIdAndBagsObj, boxList, userName)
        // clear input field
        specimenSearch.value = ""
        hideAnimation();
    }, { once: true })
    //ppulateSpecimensList();
}


export const getInstituteSpecimensList = async (boxList) => {
    boxList = boxList.sort((a,b) => compareBoxIds(a[conceptIds.shippingBoxId], b[conceptIds.shippingBoxId]));

    const collectionId = conceptIds.collection.id;
    let collectionList = await searchSpecimenInstitute();
    let resultBags = {};

    // note: currently collections have no mouthwash specimens (0007)
    for (const currCollection of collectionList) {
        let tubesInBox = {
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
        if (currCollection[collectionId]) {
            // todo: save box id in collection and remove box iteration.
            for (const box of boxList) {
                let boxIsShipped = false;
                if (box[conceptIds.submitShipmentFlag] == conceptIds.yes) {
                    boxIsShipped = true;
                }

                const bagObjects = box.bags;
                const bloodUrineBagId = currCollection[collectionId] + ' 0008';

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

                const mouthWashBagId = currCollection[collectionId] + ' 0009';
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

                        if (collectionIdFromTube == currCollection[collectionId]) {
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

        let tubesToAdd={
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
            if (!resultBags['unlabelled']) {
                resultBags['unlabelled'] = [];
            }
            resultBags['unlabelled'].push(currCollection[collectionId] + ' ' + tubeNum);
        }

        if (tubesInBox.shipped.bloodUrine.length === 0 && tubesInBox.notShipped.bloodUrine.length ===0 && tubesToAdd.bloodUrine.length> 0) {
            resultBags[currCollection[collectionId] + ' 0008'] = tubesToAdd.bloodUrine;
        }

        if (tubesInBox.shipped.mouthWash.length === 0 && tubesInBox.notShipped.mouthWash.length ===0 && tubesToAdd.mouthWash.length > 0) {
            resultBags[currCollection[collectionId] + ' 0009'] = tubesToAdd.mouthWash;
        }
    }
    return resultBags;
}

export const populateSpecimensList = async (boxList) => {
    let bagIdAndtubeIdListObj = await getInstituteSpecimensList(boxList);
    let bagIdList = Object.keys(bagIdAndtubeIdListObj);
    bagIdList.sort();

    let tableEle = document.getElementById("specimenList");
    let numRows = 1;
    let orphanBagId = '';

    tableEle.innerHTML = `<tr>
                                <th>Specimen Bag ID</th>
                                <th># Specimens in Bag</th>
                            </th>`;

    for (const bagId of bagIdList) {
        if (bagId != "unlabelled") {
            let rowEle = tableEle.insertRow();
            rowEle.insertCell(0).innerHTML = bagId;
            rowEle.insertCell(1).innerHTML = bagIdAndtubeIdListObj[bagId].length;

            let hiddenChannel = rowEle.insertCell(2)
            hiddenChannel.innerHTML = JSON.stringify(bagIdAndtubeIdListObj[bagId]);
            hiddenChannel.style.display = "none";
            if (numRows % 2 == 0) {
                rowEle.style['background-color'] = "lightgrey";
            }
            numRows += 1;
        } else {
            orphanBagId = bagId;
        }
    }

    let orphanPanel = document.getElementById('orphansPanel');
    let orphanTableEle = document.getElementById('orphansList')
    let specimenPanel = document.getElementById('specimenPanel')
    orphanTableEle.innerHTML = '';

    if (orphanBagId != '' && bagIdAndtubeIdListObj['unlabelled'].length > 0) {
        orphanPanel.style.display = 'block'
        specimenPanel.style.height = '550px'

        const orphanTubeIdList = bagIdAndtubeIdListObj['unlabelled'];
        let rowEle = orphanTableEle.insertRow();
        rowEle.insertCell(0).innerHTML = 'Stray tubes';
        rowEle.insertCell(1).innerHTML = orphanTubeIdList.length;
        let hiddenChannel = rowEle.insertCell(2)
        hiddenChannel.innerHTML = JSON.stringify(orphanTubeIdList);
        hiddenChannel.style.display = "none";

        for (let i = 0; i < orphanTubeIdList.length; i++) {
            const rowCount = orphanTableEle.rows.length;
            let rowEle = orphanTableEle.insertRow();

            if (rowCount % 2 == 0) {
                rowEle.style['background-color'] = 'lightgrey'
            }

            rowEle.insertCell(0).innerHTML = orphanTubeIdList[i];
            rowEle.insertCell(1).innerHTML = '<input type="button" class="delButton" value = "Report as Missing"/>';

            let currDeleteButton = rowEle.cells[1].getElementsByClassName("delButton")[0];

            //This should remove the entrire bag
            currDeleteButton.addEventListener("click", async e => {
                showAnimation();
                let index = e.target.parentNode.parentNode.rowIndex;
                let table = e.target.parentNode.parentNode.parentNode.parentNode;
                let currRow = table.rows[index];
                let currTubeId = table.rows[index].cells[0].innerText;

                table.deleteRow(index);
                await removeMissingSpecimen(currTubeId);
                currRow = table.rows[index];

                while (currRow != undefined && currRow.cells[0].innerText == "") {
                    table.deleteRow(index);
                    currRow = table.rows[index];
                }

                let response = await getAllBoxes();
                let boxList = response.data;
                await populateSpecimensList(boxList);
                hideAnimation();
            })
        }
    } else {
        orphanPanel.style.display = 'none'
        specimenPanel.style.height = '550px'
    }
}

export const populateBoxManifestHeader = (boxId, boxList, currContactInfo) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")

    let currBox = {};
    for (let i = 0; i < boxList.length; i++) {
        if (boxList[i]['132929440'] == boxId) {
            currBox = boxList[i]
        }
    }
    let currJSONKeys = Object.keys(currBox['bags'])
    let numBags = currJSONKeys.length;
    let numTubes = 0;
    for (let i = 0; i < currJSONKeys.length; i++) {
        numTubes += currBox['bags'][currJSONKeys[i]]['arrElements'].length;
    }

    let newDiv = document.createElement("div")
    let newP = document.createElement("p");
    newP.style.fontWeight = 700;
    newP.style.fontSize = "1.5rem";
    newP.innerHTML = boxId + " Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);
    let toInsertDateStarted = ''
    if (currBox.hasOwnProperty('672863981')) {
        let dateStarted = Date.parse(currBox['672863981'])
        let currentdate = new Date(dateStarted);
        console.group(currentdate.getMinutes())
        let currMins = currentdate.getMinutes() < 10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes();
        let ampm = parseInt(currentdate.getHours()) / 12 >= 1 ? "PM" : "AM";
        let hour = parseInt(currentdate.getHours()) % 12;
        toInsertDateStarted = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear() + " "
            + hour.toString() + ":"
            + currMins + ampm;

    }
    let toInsertDateShipped = ''
    if (currBox.hasOwnProperty('555611076')) {
        let dateStarted = Date.parse(currBox['555611076'])

        let currentdate = new Date(dateStarted);
        let currMins = currentdate.getMinutes() < 10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes();
        let ampm = parseInt(currentdate.getHours()) / 12 >= 1 ? "PM" : "AM";
        let hour = parseInt(currentdate.getHours()) % 12;
        toInsertDateShipped = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear() + " "
            + hour.toString() + ":"
            + currMins + ampm;

    }
    newP = document.createElement("p");
    newP.innerHTML = "Date Started: " + toInsertDateStarted;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newP = document.createElement("p");
    newP.innerHTML = "Last Modified: " + toInsertDateShipped;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newP = document.createElement("p");
    newDiv = document.createElement("div")
    newDiv.innerHTML = displayContactInformation(currContactInfo)
    document.getElementById('boxManifestCol1').appendChild(newDiv);

    newP.innerHTML = "Number of Sleeves/Bags: " + numBags;
    document.getElementById('boxManifestCol3').appendChild(newP);
    newP = document.createElement("p");
    newP.innerHTML = "Number of Specimens:  " + numTubes;
    document.getElementById('boxManifestCol3').appendChild(newP);


}

export const populateModalSelect = (boxIdAndBagsObj) => {
    let boxSelectEle = document.getElementById('shippingModalChooseBox');
    let selectedBoxId = boxSelectEle.getAttribute('data-new-box') || document.getElementById('selectBoxList').value;
    let addToBoxButton =  document.getElementById('addToBagButton');
    addToBoxButton.removeAttribute("disabled")
    let options = '';
    let boxIds = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    for (let i = 0; i < boxIds.length; i++) {
        options += `<option>${boxIds[i]}</option>`;
    }
    if (options == '') {
        addToBoxButton.setAttribute('disabled', 'true');
    }
    boxSelectEle.innerHTML = options;
    boxSelectEle.value = selectedBoxId;
}

export const populateTempSelect = (boxes) => {
    let boxDiv = document.getElementById("tempCheckList");
    boxDiv.style.display = "block";
    boxDiv.innerHTML = `<p>Select the box that contains the temperature monitor</p>
    <select name="tempBox" id="tempBox">
    <option disabled value> -- select a box -- </option>
    </select>`;

    let toPopulate = document.getElementById('tempBox')

    for (let i = 0; i < boxes.length; i++) {
        
        var opt = document.createElement("option");
        opt.value = boxes[i];
        opt.innerHTML = boxes[i];
        if(i === 0){
            opt.selected = true;
        }
        // then append it to the select element
        toPopulate.appendChild(opt);
    }
}

export const populateSaveTable = (boxIdAndBagsObj, boxList, userName) => {
    let table = document.getElementById("saveTable");
    table.innerHTML = `<tr>
                        <th style="border-bottom:1px solid;">To Ship</th>
                        <th style="border-bottom:1px solid;">Started</th>
                        <th style="border-bottom:1px solid;">Last Modified</th>
                        <th style="border-bottom:1px solid;">Box Number</th>
                        <th style="border-bottom:1px solid;">Location</th>
                        <th style="border-bottom:1px solid;">Contents</th>
                        <th style="border-bottom:1px solid;text-align:center;"><p style="margin-bottom:0">View/Print Box Manifest</p><p style="margin-bottom:0">(to be included in shipment)</p></th>
                    </tr>`
    let count = 0;
    let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    for (let i = 0; i < boxIdList.length; i++) {
        if (Object.keys(boxIdAndBagsObj[boxIdList[i]]).length > 0) {
            let currRow = table.insertRow(count + 1);
            if (count % 2 == 1) {
                currRow.style['background-color'] = 'lightgrey'
            }
            count += 1;
            currRow.insertCell(0).innerHTML = `<input type="checkbox" class="markForShipping" style="transform: scale(1.5);">`
            let dateStarted = '';
            let lastModified = '';
            let thisLocation = '';

            // todo: remove this for loop
            for (let j = 0; j < boxList.length; j++) {
                if (boxList[j]['132929440'] == boxIdList[i]) {
                    if (boxList[j].hasOwnProperty('672863981')) {
                        let timestamp = Date.parse(boxList[j]['672863981']);
                        let newDate = new Date(timestamp);
                        let ampm = 'AM'
                        if (newDate.getHours() >= 12) {
                            ampm = 'PM'
                        }
                        let minutesTag = newDate.getMinutes();
                        if (minutesTag < 10) {
                            minutesTag = '0' + minutesTag;
                        }
                        dateStarted = (newDate.getMonth() + 1) + '/' + (newDate.getDate()) + '/' + newDate.getFullYear() + ' ' + ((newDate.getHours() + 11) % 12 + 1) + ':' + minutesTag + ' ' + ampm;
                        //dateStarted = boxJSONS[j]['672863981'];
                    }
                    if (boxList[j].hasOwnProperty('555611076')) {
                        let timestamp = Date.parse(boxList[j]['555611076']);
                        let newDate = new Date(timestamp);
                        let ampm = 'AM'
                        if (newDate.getHours() >= 12) {
                            ampm = 'PM'
                        }
                        let minutesTag = newDate.getMinutes();
                        if (minutesTag < 10) {
                            minutesTag = '0' + minutesTag;
                        }
                        lastModified = (newDate.getMonth() + 1) + '/' + (newDate.getDate()) + '/' + newDate.getFullYear() + ' ' + ((newDate.getHours() + 11) % 12 + 1) + ':' + minutesTag + ' ' + ampm;
                        //lastModified = boxJSONS[j]['555611076']

                    }
                    if (boxList[j].hasOwnProperty('560975149')) {
                        thisLocation = locationConceptIDToLocationMap[boxList[j]['560975149']]["siteSpecificLocation"];
                    }
                }
            }
            currRow.insertCell(1).innerHTML = dateStarted;
            currRow.insertCell(2).innerHTML = lastModified;
            currRow.insertCell(3).innerHTML = boxIdList[i];
            currRow.insertCell(4).innerHTML = thisLocation;
            //get num tubes
            let currBox = boxIdAndBagsObj[boxIdList[i]];
            let numTubes = 0;
            let boxKeys = Object.keys(currBox);
            for (let j = 0; j < boxKeys.length; j++) {
                numTubes += currBox[boxKeys[j]]['arrElements'].length;
            }
            currRow.insertCell(5).innerHTML = numTubes.toString() + " tubes";
            currRow.insertCell(6).innerHTML = '<input type="button" style="display:block;margin:0 auto;" class="boxManifestButton" value = "Box Manifest"/>';

            //boxes[i]

            let currBoxButton = currRow.cells[6].getElementsByClassName("boxManifestButton")[0];

            currBoxButton.addEventListener("click", async e => {
                var index = e.target.parentNode.parentNode.rowIndex;
                var table = document.getElementById("shippingModalTable");
                //bring up edit on the corresponding table

                await boxManifest(boxIdList[i], userName);


                //addEventNavBarBoxManifest("viewBoxManifestBlood")
                //if(hiddenJSON[boxes[i]])
                //table.deleteRow(index);
            })
        }
    }
}

export const populateTempNotification = async () => {

    let checkDate = false;
    //let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('tempTubeReminder');
    if (checkDate == true) {
        toToggle.style.display = 'block';
    }
    else {
        toToggle.style.display = 'none';
    }
}

export const populateTempCheck = async () => {
    let checkDate = false;
    //let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('checkForTemp');
    if (checkDate == true) {
        toToggle.style.display = 'block';
    }
    else {
        toToggle.style.display = 'none';
    }
}

export const populateShippingManifestHeader = (hiddenJSON, userName, locationNumber, siteAcronym, currShippingLocationNumber) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")
    const currContactInfo = locationConceptIDToLocationMap[currShippingLocationNumber]["contactInfo"][siteAcronym]
    let newP = document.createElement("p");
    let newDiv = document.createElement("div")
    newP.innerHTML = "Shipment Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);

    //let date = "";
    let currentdate = new Date();
    let ampm = parseInt(currentdate.getHours()) / 12 >= 1 ? "PM" : "AM";
    let hour = (currentdate.getHours() - 1 + 12) % 12 + 1;
    let minutes = currentdate.getMinutes() < 10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    let datetime = (currentdate.getMonth() + 1) + "/"
        + currentdate.getDate() + "/"
        + currentdate.getFullYear() + " "
        + hour.toString() + ":"
        + minutes + ampm;
    newP = document.createElement("p");
    newP.innerHTML = "Current Date/Time: " + datetime;
    document.getElementById('boxManifestCol1').appendChild(newP);

    newP = document.createElement("p");
    newP.innerHTML = "Sender: " + userName;
    document.getElementById('boxManifestCol1').appendChild(newP);

    newDiv = document.createElement("div");
    newDiv.innerHTML = displayContactInformation(currContactInfo)
    document.getElementById('boxManifestCol1').appendChild(newDiv);

    newP = document.createElement("p");
    newP.innerHTML = "Site: " + siteAcronym;
    document.getElementById('boxManifestCol3').appendChild(newP);

    newP = document.createElement("p");
    newP.innerHTML = "Location: " + locationConceptIDToLocationMap[currShippingLocationNumber]["siteSpecificLocation"];
    document.getElementById('boxManifestCol3').appendChild(newP);

}

export const populateShippingManifestBody = (boxIdAndBagsObj) => {
    let table = document.getElementById("shippingManifestTable");
    let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    let currRowIndex = 1;
    let greyIndex = 0;
    for (let i = 0; i < boxIdList.length; i++) {
        let firstSpec = true;
        let currBoxId = boxIdList[i];
        let specimens = Object.keys(boxIdAndBagsObj[boxIdList[i]])
        for (let j = 0; j < specimens.length; j++) {
            let firstTube = true;
            let specimen = specimens[j];
            let tubes = boxIdAndBagsObj[boxIdList[i]][specimen]['arrElements'];
            for (let k = 0; k < tubes.length; k++) {

                let currTube = tubes[k];
                let currRow = table.insertRow(currRowIndex);

                if (firstSpec) {

                    currRow.insertCell(0).innerHTML = currBoxId;
                    firstSpec = false;

                }
                else {
                    currRow.insertCell(0).innerHTML = '';
                }
                if (firstTube) {

                    currRow.insertCell(1).innerHTML = specimen;
                    firstTube = false;
                }
                else {
                    currRow.insertCell(1).innerHTML = '';
                }

                currRow.insertCell(2).innerHTML = currTube;
                let fullScannerName = ''

                if (boxIdAndBagsObj[boxIdList[i]][specimen].hasOwnProperty('469819603') && k == 0) {
                    fullScannerName += boxIdAndBagsObj[boxIdList[i]][specimen]['469819603'] + ' '
                }
                if (boxIdAndBagsObj[boxIdList[i]][specimen].hasOwnProperty('618036638') && k == 0) {
                    fullScannerName += boxIdAndBagsObj[boxIdList[i]][specimen]['618036638']
                }
                currRow.insertCell(3).innerHTML = fullScannerName

                if (greyIndex % 2 == 0) {
                    currRow.style['background-color'] = "lightgrey";
                }

                currRowIndex += 1;

            }
            greyIndex += 1;
        }


    }
}

const compareBoxIds = (a, b) => {
    let a1 = parseInt(a.substring(3));
    let b1 = parseInt(b.substring(3));
    if (a1 < b1) {
        return -1;
    }
    else if (a1 > b1) {
        return 1;
    }
    return 0;

}

export const populateBoxSelectList = async (boxIdAndBagsObj, userName,) => {
    let boxSelectEle = document.getElementById('selectBoxList');
    let options = ''
    let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    for (let i = 0; i < boxIdList.length; i++) {
        options += '<option>' + boxIdList[i] + '</option>';
    }
    boxSelectEle.innerHTML = options;

    let currBoxId = boxSelectEle.value;
    if (currBoxId != '') {
        let currBox = boxIdAndBagsObj[currBoxId];


        //document.getElementById('BoxNumBlood').innerText = currBoxId;
        let toInsertTable = document.getElementById('currTubeTable')
        let boxKeys = Object.keys(currBox)
        toInsertTable.innerHTML = ` <tr>
                                    <th style = "border-bottom:1px solid;">Specimen Bag ID</th>
                                    <th style = "border-bottom:1px solid;">Full Specimen ID</th>
                                    <th style = "border-bottom:1px solid;">Type/Color</th>
                                    <th style = "border-bottom:1px solid;"></th>
                                </tr>`;
        //set the rest of the table up
        for (let j = 0; j < boxKeys.length; j++) {
            let currBagId = boxKeys[j];
            let currTubes = currBox[boxKeys[j]]['arrElements'];

            for (let k = 0; k < currTubes.length; k++) {

                //get the first element (tube id) from the thingx
                let toAddId = currTubes[k];
                let thisId = toAddId.split(' ');
                let toAddType = 'N/A'
                if (translateNumToType.hasOwnProperty(thisId[1])) {
                    toAddType = translateNumToType[thisId[1]];
                }
                var rowCount = toInsertTable.rows.length;
                var row = toInsertTable.insertRow(rowCount);
                if (j % 2 == 1) {
                    row.style['background-color'] = "lightgrey"
                }
                if (k == 0) {
                    row.insertCell(0).innerHTML = currBagId
                }
                else {
                    row.insertCell(0).innerHTML = ""
                }
                row.insertCell(1).innerHTML = toAddId;
                row.insertCell(2).innerHTML = toAddType;
                if (k == 0) {
                    row.insertCell(3).innerHTML = '<input type="button" class="delButton" value = "remove bag" style="margin-top:2px;margin-bottom:2px">';
                }
                else {
                    row.insertCell(3).innerHTML = "";
                }
                //row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';

                if (k == 0) {
                    let currDeleteButton = row.cells[3].getElementsByClassName("delButton")[0];

                    //This should remove the entrire bag
                    currDeleteButton.addEventListener("click", async e => {
                        showAnimation();
                        let index = e.target.parentNode.parentNode.rowIndex;
                        let table = e.target.parentNode.parentNode.parentNode.parentNode;

                        let currRow = table.rows[index];
                        let currBagId = table.rows[index].cells[0].innerText;
                        /*if(currRow.cells[0].innerText != ""){
                            if(index < table.rows.length-1){
                                if(table.rows[index + 1].cells[0].innerText ==""){
                                    table.rows[index+1].cells[0].innerText = currRow.cells[0].innerText;
                                }
                            }
                        }*/
                        table.deleteRow(index);
                        let bagsToRemove = [currBagId];

                        if (currBagId === "unlabelled") { 
                            bagsToRemove = currTubes;
                        }

                        await removeBag(boxSelectEle.value, bagsToRemove)
                        currRow = table.rows[index];

                        while (currRow != undefined && currRow.cells[0].innerText == "") {
                            table.deleteRow(index);
                            currRow = table.rows[index];
                        }

                        let response = await getAllBoxes();
                        let boxList = response.data;
                        let boxIdAndBagsObj = {};

                        await populateSpecimensList(boxList);

                        for (let i = 0; i < boxList.length; i++) {
                            if (!boxList[i].hasOwnProperty('145971562') || boxList[i]['145971562'] != '353358909') {
                                let box = boxList[i]
                                boxIdAndBagsObj[box['132929440']] = box['bags']
                            }

                        }

                        await populateSaveTable(boxIdAndBagsObj, boxList, userName)
                        hideAnimation();
                    })
                }

            }
        }
    }
    else {
      // Clear Table if no list is found
      let toInsertTable = document.getElementById('currTubeTable')
      toInsertTable.innerHTML = ` <tr>
                                    <th style = "border-bottom:1px solid;">Specimen Bag ID</th>
                                    <th style = "border-bottom:1px solid;">Full Specimen ID</th>
                                    <th style = "border-bottom:1px solid;">Type/Color</th>
                                    <th style = "border-bottom:1px solid;"></th>
                                </tr>`;
    }
  return
}

// todo: this function needs to be refactored for efficiency
const addNewBox = async (userName) => {
    let response = await getAllBoxes();
    let boxList = response.data;
    let locations = {};
    let keys = [];
    let largestOverall = 0;
    let largeIndex = -1;

    let largestLocation = 0;
    let largestLocationIndex = -1;
    let pageLocation = document.getElementById('selectLocationList').value;

    let pageLocationConversion = siteSpecificLocationToConceptId[pageLocation];
    let loginSite = siteSpecificLocation[pageLocation]["siteCode"]
    // loop through entire hiddenJSON and determine the largest boxid number
    // hiddenJSON includes in process and shipped boxes
    for (let i = 0; i < boxList.length; i++) {
        let curr = parseInt(boxList[i]['132929440'].substring(3))      
        let currLocation = conceptIdToSiteSpecificLocation[boxList[i]['560975149']]

        if (curr > largestOverall) {
            largestOverall = curr;
            largeIndex = i;
        }
        if (curr > largestLocation && currLocation == pageLocation) {
            largestLocation = curr;
            largestLocationIndex = i;
        }

    }
    if (largestLocationIndex != -1) {
      // find index of largest box and assign boxid
        let lastBox = boxList[largeIndex]['132929440']
        // check if largest boxid number has bags
        if (Object.keys(boxList[largestLocationIndex]['bags']).length != 0) {
            //add a new Box
            //create new Box Id
            let newBoxNum = parseInt(lastBox.substring(3)) + 1;
            if (newBoxNum === undefined) {
                newBoxNum = 1;
            }
            let newBoxId = 'Box' + newBoxNum.toString();
            let toPass = {};
            toPass['132929440'] = newBoxId;
            toPass['bags'] = {};
            toPass['560975149'] = pageLocationConversion;
            toPass['789843387'] = loginSite
            await addBox(toPass);

            boxList.push({ '132929440': newBoxId, bags: {}, '560975149': pageLocationConversion })
            let boxJSONS = boxList;

            boxList = {};

            for (let i = 0; i < boxJSONS.length; i++) {
                let box = boxJSONS[i]
                if (box['560975149'] == pageLocationConversion) {
                    if (!box.hasOwnProperty('145971562') || box['145971562'] !== '353358909') {
                        boxList[box['132929440']] = box['bags']
                    }
                }
            }
            document.getElementById('shippingModalChooseBox').setAttribute('data-new-box', newBoxId);
            await populateBoxSelectList(boxList, userName)
            return true
        }
        else {
            return false
        }
    }
    else {
        //add a new Box
        //create new Box Id
        let lastBox = 'Box0'
        if (largeIndex != -1) {
            lastBox = boxList[largeIndex]['132929440']
        }
        let newBoxNum = parseInt(lastBox.substring(3)) + 1;
        let newBoxId = 'Box' + newBoxNum.toString();
        let toPass = {};
        toPass['132929440'] = newBoxId;
        toPass['bags'] = {};
        toPass['560975149'] = pageLocationConversion;
        toPass['789843387'] = loginSite;
        await addBox(toPass);
        boxList.push({ '132929440': newBoxId, bags: {}, '560975149': pageLocationConversion })
        let boxJSONS = boxList;

        boxList = {};
        for (let i = 0; i < boxJSONS.length; i++) {
            let box = boxJSONS[i]
            if (box['560975149'] == pageLocationConversion) {
                if (!box.hasOwnProperty('145971562') || box['145971562'] !== '353358909') {
                    boxList[box['132929440']] = box['bags']
                }
            }
        }
        await populateBoxSelectList(boxList, userName)
        return true
    }

}

export const addEventModalAddBox = (userName) => {
    let boxButton = document.getElementById('modalAddBoxButton');
    let createBoxSuccessAlertEl = document.getElementById("create-box-success");
    let createBoxErrorAlertEl = document.getElementById("create-box-error");
    boxButton.addEventListener('click', async () => {
        // Check whether a box is being added. If so, return.
        if (document.body.getAttribute('data-adding-box')) return;

        let alertState = ''
        document.body.setAttribute('data-adding-box', 'true');
        showAnimation();
        // returns boolean value
        let notifyCreateBox = await addNewBox(userName);
        alertState = notifyCreateBox
        let currLocation = document.getElementById('selectLocationList').value;
        let currLocationConceptId = siteSpecificLocationToConceptId[currLocation]
        let response = await getBoxesByLocation(currLocationConceptId);
        let boxArray = response.data;
        let currLocationBoxObjects = {};
        for (let i = 0; i < boxArray.length; i++) {
            let box = boxArray[i]
            currLocationBoxObjects[box['132929440']] = box['bags']
        }
        await populateModalSelect(currLocationBoxObjects)
        await populateBoxSelectList(currLocationBoxObjects, userName);
        hideAnimation()
        checkAlertState(alertState, createBoxSuccessAlertEl, createBoxErrorAlertEl)
        // reset alertState
        alertState = ''
        document.body.removeAttribute('data-adding-box');
    }
  )}

export const populateTubeInBoxList = async (userName) => {
    let selectEle = document.getElementById('selectBoxList');
    let currBoxId = selectEle.value;
    let response = await getBoxes();
    let boxList = response.data;
    let currBox = {};
    for (let i = 0; i < boxList.length; i++) {
        let box = boxList[i];
        if (box['132929440'] == currBoxId) {
            currBox = box.bags;
        }
    }
    let currList = "";

    //document.getElementById('BoxNumBlood').innerText = currBoxId;
    let toInsertTable = document.getElementById('currTubeTable')
    let boxKeys = Object.keys(currBox)
    toInsertTable.innerHTML = ` <tr>
                                    <th style = "border-bottom:1px solid;">Specimen Bag ID</th>
                                    <th style = "border-bottom:1px solid;">Full Specimen ID</th>
                                    <th style = "border-bottom:1px solid;">Type/Color</th>
                                    <th style = "border-bottom:1px solid;"></th>
                                </tr>`;
    //set the rest of the table up
    let translateNumToType = {
        "0001": "SST/Gold or Red",
        "0002": "SST/Gold or Red",
        "0003": "Heparin/Green",
        "0004": "EDTA/Lavender",
        "0005": "ACD/Yellow",
        "0006": "Urine/Yellow",
        "0007": "Mouthwash Container",
        "0011": "SST/Gold or Red",
        "0012": "SST/Gold or Red",
        "0013": "Heparin/Green",
        "0014": "EDTA/Lavender",
        "0016": "Urine Cup",
        "0021": "SST/Gold or Red",
        "0022": "SST/Gold or Red",
        "0031": "SST/Gold or Red",
        "0032": "SST/Gold or Red",
        "0024": "EDTA/Lavender",
        "0050": "NA",
        "0051": "NA",
        "0052": "NA",
        "0053": "NA",
        "0054": "NA"
    };
    for (let j = 0; j < boxKeys.length; j++) {
        let currBagId = boxKeys[j];
        let currTubes = currBox[boxKeys[j]]['arrElements'];

        for (let k = 0; k < currTubes.length; k++) {

            //get the first element (tube id) from the thingx
            let toAddId = currTubes[k];
            let thisId = toAddId.split(' ');
            let toAddType = 'N/A'
            if (translateNumToType.hasOwnProperty(thisId[1])) {
                toAddType = translateNumToType[thisId[1]];
            }
            var rowCount = toInsertTable.rows.length;
            var row = toInsertTable.insertRow(rowCount);
            if (j % 2 == 1) {
                row.style['background-color'] = 'lightgrey'
            }
            if (k == 0) {
                row.insertCell(0).innerHTML = currBagId
            }
            else {
                row.insertCell(0).innerHTML = ""
            }
            row.insertCell(1).innerHTML = toAddId;
            row.insertCell(2).innerHTML = toAddType;
            if (k == 0) {
                row.insertCell(3).innerHTML = '<input type="button" class="delButton" value = "remove bag" style="margin-top:2px;margin-bottom:2px;">';
            }
            else {
                row.insertCell(3).innerHTML = "";
            }
            //row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';

            if (k == 0) {
                let currDeleteButton = row.cells[3].getElementsByClassName("delButton")[0];

                //This should remove the entrire bag
                currDeleteButton.addEventListener("click", async e => {
                    showAnimation();
                    var index = e.target.parentNode.parentNode.rowIndex;
                    var table = e.target.parentNode.parentNode.parentNode.parentNode;

                    let currRow = table.rows[index];
                    let currBagId = table.rows[index].cells[0].innerText;
                    /*if(currRow.cells[0].innerText != ""){
                        if(index < table.rows.length-1){
                            if(table.rows[index + 1].cells[0].innerText ==""){
                                table.rows[index+1].cells[0].innerText = currRow.cells[0].innerText;
                            }
                        }
                    }*/
                    table.deleteRow(index);
                    let bagsToRemove = [currBagId];
                    if (currBagId === "unlabelled") { 
                        bagsToRemove = currTubes;
                    }
                    let result = await removeBag(selectEle.value, bagsToRemove)
                    currRow = table.rows[index];

                    while (currRow != undefined && currRow.cells[0].innerText == "") {
                        table.deleteRow(index);
                        currRow = table.rows[index];
                    }

                    let response = await getAllBoxes();
                    let boxList = response.data;
                    let boxIdAndBagsObj = {};

                    await populateSpecimensList(boxList);

                    for (let i = 0; i < boxList.length; i++) {
                        if (!boxList[i].hasOwnProperty('145971562') || boxList[i]['145971562'] != '353358909') {
                            let box = boxList[i]
                            boxIdAndBagsObj[box['132929440']] = box['bags']
                        }
                    }

                    await populateSaveTable(boxIdAndBagsObj, boxList, userName)
                    hideAnimation();
                })
            }

        }
    }

}

export const addEventBoxSelectListChanged = () => {
    let selectBoxList = document.getElementById('selectBoxList');
    selectBoxList.addEventListener("change", async () => {
        showAnimation();
        await populateTubeInBoxList();
        hideAnimation();
    })
}

export const addEventChangeLocationSelect = (userName) => {
    let locationSelectEle = document.getElementById('selectLocationList');
    locationSelectEle.addEventListener("change", async () => {
        let currLocation = locationSelectEle.value;
        if (currLocation !== 'none') {
            showAnimation();
            let currLocationConceptId = siteSpecificLocationToConceptId[currLocation]
            let boxArray = (await getBoxesByLocation(currLocationConceptId)).data;

            let boxIdAndBagsObj = {};
            for (let i = 0; i < boxArray.length; i++) {
                let box = boxArray[i]
                boxIdAndBagsObj[box['132929440']] = box['bags']
            }

            await populateBoxSelectList(boxIdAndBagsObj, userName);
            hideAnimation();
        }
        else {
            showAnimation();
            let boxObjects = {};
            await populateBoxSelectList(boxObjects, userName);
            hideAnimation();
        }
    })
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

            let data = await getUserProfile({uid}).then(
                (res) => res.data
            );

            checkInTemplate(data);
        } catch (error) {
            console.log("Error checking in participant: ", error);
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
    // For research
    const researchSpecimenLinkButtons = document.querySelectorAll('[data-specimen-link-connect-id]');
    Array.from(researchSpecimenLinkButtons).forEach((btn) => {
        btn.addEventListener('click', async () => {

            let query = `connectId=${parseInt(btn.dataset.specimenLinkConnectId)}`;
        
            const response = await findParticipant(query);
            const data = response.data[0];
    
            specimenTemplate(data);
        });
    });

    //For Clinical
    const clinicalSpecimenLinkButtons = document.querySelectorAll('[data-clinical-specimen-link-connect-id]');
    Array.from(clinicalSpecimenLinkButtons).forEach((btn) => {
        btn.addEventListener('click', async () => {

            let query = `connectId=${parseInt(btn.dataset.clinicalSpecimenLinkConnectId)}`;
        
            const response = await findParticipant(query);
            const data = response.data[0];
    
            specimenTemplate(data);
        });
    });
};

export const addEventCheckInCompleteForm = (isCheckedIn) => {
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

            goToParticipantSearch();
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
            };

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
    const connectId = document.getElementById('clinicalSpecimenContinueTwo').dataset.connectId;
    
    form.addEventListener('submit', async (e) => {
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

    if (collectionLocation) formData['951355211'] = parseInt(collectionLocation.value);

    const collectionID = formData?.collectionId || scanSpecimenID;
    const n = document.getElementById('399159511').innerText || ""
    let confirmVal = '';

    if (!formData?.collectionId) {
        confirmVal = await swal({
            title: "Confirm Collection ID",
            icon: "info",
            text: `Collection ID: ${collectionID}\n Confirm ID is correct for participant: ${n || ""}`,
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

    formData['820476880'] = collectionID;
    formData['650516960'] = getWorflow() === 'research' ? 534621077 : 664882224;
    formData['Connect_ID'] = parseInt(document.getElementById('specimenLinkForm').dataset.connectId);
    formData['token'] = document.getElementById('specimenLinkForm').dataset.participantToken;
    
    let bloodAccessionId = formData?.['646899796'];
    if (bloodAccessionId) {
        formData['646899796'] = bloodAccessionId;
    }
    let urineAccessionId = formData?.['928693120'];
    if (urineAccessionId) {
        formData['928693120'] = urineAccessionId;
    }
    let query = `connectId=${parseInt(connectId)}`;

    showAnimation();
    let response = await findParticipant(query);
    let data = response.data[0];
    let specimenData;
    
    if (!formData?.collectionId) {
        specimenData = (await searchSpecimen(formData['820476880'])).data;
    }
    hideAnimation();

    if (specimenData && specimenData.Connect_ID && parseInt(specimenData.Connect_ID) !== data.Connect_ID && !formData?.collectionId) {
        showNotifications({ title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different connect ID.' }, true)
        return;
    }

    showAnimation();
    formData['331584571'] = formData?.['331584571'] || parseInt(getCheckedInVisit(data))
    
    if (!formData?.collectionId) {
        const storeResponse = await storeSpecimen([formData]);  
        if (storeResponse.code === 400) {
            hideAnimation();
            showNotifications({ title: 'Specimen already exists!', body: `Collection ID ${collectionID} is already associated with a different Connect ID` }, true);
            return;
        }
    }

    const biospecimenData = (await searchSpecimen(formData?.collectionId || formData['820476880'])).data;
    await createTubesForCollection(formData, biospecimenData);
    
    if(formData['650516960'] === 664882224) {
        await checkSurveyEmailTrigger(data, formData['331584571']);
    }

    hideAnimation();
    if (formData?.collectionId || confirmVal == "confirmed") {
        tubeCollectedTemplate(data, biospecimenData);

    } else {
        searchTemplate();
    }
}

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
    console.log('sss', accessionID2.value)
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
        (accessionID2.value) ? await proccedToSpecimenPage(accessionID2, accessionID4, selectedVisit, formData, connectId) :
        await redirectSpecimenPage(accessionID2, accessionID4, selectedVisit, formData, connectId)
    }) 
}

const proccedToSpecimenPage = async (accessionID1, accessionID3, selectedVisit, formData, connectId) => {
    const bloodAccessionId = await checkAccessionId({accessionId: +accessionID1.value, accessionIdType: '646899796'});
    console.log('bloodAccessionId', bloodAccessionId)
    if (bloodAccessionId.message === 'AccessionId exists!') {
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
           // btnsClicked(connectId, formData);
            await redirectSpecimenPage(accessionID1, accessionID3, selectedVisit, formData, connectId)
            return
        }) 
    } else if (bloodAccessionId.message === 'AccessionId doesn\'t exist!'){
        await redirectSpecimenPage(accessionID1, accessionID3, selectedVisit, formData, connectId)
        return
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

export const addEventBiospecimenCollectionForm = (dt, biospecimenData) => {
    const collectionSaveExit = document.getElementById('collectionSave');
    collectionSaveExit.addEventListener('click', () => {
        collectionSubmission(dt, biospecimenData);
    });

    const collectionSaveContinue = document.getElementById('collectionNext');
    collectionSaveContinue.addEventListener('click', () => {
        collectionSubmission(dt, biospecimenData, true);
    });
};

export const addEventBiospecimenCollectionFormToggles = () => {
    const collectedBoxes = Array.from(document.getElementsByClassName('tube-collected'));
    const deviationBoxes = Array.from(document.getElementsByClassName('tube-deviated'));

    collectedBoxes.forEach(collected => {

        const reason = document.getElementById(collected.id + "Reason");
        const deviated = document.getElementById(collected.id + "Deviated");
        const specimenId = document.getElementById(collected.id + "Id");

        collected.addEventListener('change', () => {
            
            if(getWorflow() === 'research' && reason) reason.disabled = collected.checked;
            if(deviated) deviated.disabled = !collected.checked;
            specimenId.disabled = !collected.checked;
            
            if(collected.checked) {
                if(getWorflow() === 'research' && reason) reason.value = '';
            }
            else {
                const event = new CustomEvent('change');

                specimenId.value = '';
                specimenId.dispatchEvent(event);

                if(deviated) {
                    deviated.checked = false;
                    deviated.dispatchEvent(event);
                }
            }
            
            if (getWorflow() === 'research' && collected.id === '223999569') {
                const mouthwashContainer = document.getElementById(`143615646Id`);
                if (!mouthwashContainer.value && collected.checked) {
                    specimenId.disabled = true;
                }
            }

            if (getWorflow() === 'research' && collected.id === '143615646') {
                const mouthwashBagChkb = document.getElementById(`223999569`);
                const mouthwashBagText = document.getElementById(`223999569Id`);
                if (collected.checked) {
                    mouthwashBagChkb.checked = true;
                    mouthwashBagText.disabled = false;
                }
            }
            
            const selectionData = workflows[getWorflow()].filter(tube => tube.concept === collected.id)[0];

            if (selectionData.tubeType === 'Blood tube' || selectionData.tubeType === 'Urine') {
                const biohazardBagChkb = document.getElementById(`787237543`);
                const biohazardBagText = document.getElementById(`787237543Id`);
                if (collected.checked) {
                    biohazardBagChkb.checked = true;
                    biohazardBagText.disabled = false;
                } else {
                    biohazardBagChkb.checked = false;
                    biohazardBagText.disabled = true;
                }
        
            }
        });
    });

    deviationBoxes.forEach(deviation => {

        const type = document.getElementById(deviation.id.replace('Deviated', 'Deviation'));

        deviation.addEventListener('change', () => {

            type.disabled = !deviation.checked;

            if(!deviation.checked) type.value = '';
        });
    });
};

export const addEventBiospecimenCollectionFormEdit = () => {
    const editButtons = Array.from(document.querySelectorAll('[id$="collectEditBtn"]'));
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const conceptID = button.id.replace('collectEditBtn', '');
            document.getElementById(conceptID + 'Id').disabled = false;

            const deviation = document.getElementById(conceptID + 'Deviated');
            if(deviation) {
                deviation.disabled = false;

                if(deviation.checked) {
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

export const addEventBiospecimenCollectionFormText = (dt, biospecimenData) => {
    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));

    inputFields.forEach(input => {
        input.addEventListener('change', () => {
            const siteTubesList = getSiteTubesLists(biospecimenData)
            const tubes = siteTubesList.filter(dt => dt.concept === input.id.replace('Id', ''));

            removeSingleError(input.id);

            let value = getValue(`${input.id}`).toUpperCase();
            if (value.length != 0) {

                const tubeCheckBox = document.getElementById(input.id.replace('Id',''));

                if(tubeCheckBox) input.required = tubeCheckBox.checked;

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
    
    if(getWorflow() === 'research' && biospecimenData['678166505'] === undefined) biospecimenData['678166505'] = new Date().toISOString();
    if(getWorflow() === 'clinical' && biospecimenData['915838974'] === undefined) biospecimenData['915838974'] = new Date().toISOString();
    let siteTubesList = getSiteTubesLists(formData);

    siteTubesList.forEach((dt) => {
        if(biospecimenData[`${dt.concept}`] === undefined) biospecimenData[`${dt.concept}`] = {'593843561': 104430631};

        if(biospecimenData[dt.concept]['248868659'] === undefined && dt.deviationOptions) {
            biospecimenData[dt.concept]['248868659'] = {};
            dt.deviationOptions.forEach(dev => {
                biospecimenData[dt.concept]['248868659'][dev.concept] = 104430631;
            });
            biospecimenData[dt.concept]['678857215'] = 104430631;
            biospecimenData[dt.concept]['762124027'] = 104430631;
        }
    });

    await updateSpecimen([biospecimenData]);
}

const collectionSubmission = async (formData, biospecimenData, cntd) => {
    removeAllErrors();

    if (getWorflow() === 'research' && biospecimenData['678166505'] === undefined) biospecimenData['678166505'] = new Date().toISOString();

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

        if(tubeCheckBox) input.required = tubeCheckBox.checked;

        if(!cntd && value.length === 0) return;
        
        if(input.required && value.length !== totalCollectionIDLength) {

            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, `Combination of Collection ID and Full Specimen ID should be ${totalCollectionIDLength} characters long and in the following format CXA123456 1234.`, focus);
            focus = false;
        }
        else if (input.required && masterID !== biospecimenData['820476880']) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Collection ID.', focus);
            focus = false;
        }
        else if (input.required && tubes.length === 0) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        }
        else if (input.required && (tubes[0].id !== tubeID && !additionalTubeIDRequirement.regExp.test(tubeID))) {
            hasError = true;
            hasCntdError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        }

        if (input.required) biospecimenData[`${input.id.replace('Id', '')}`]['825582494'] = `${masterID} ${tubeID}`.trim();
    });

    if ((hasError && cntd == true) || hasCntdError) return;

    const tubesCollected = Array.from(document.getElementsByClassName('tube-collected'));

    tubesCollected.forEach((tube) => {
        if (biospecimenData[tube.id] === undefined) biospecimenData[`${tube.id}`] = {};
        if (biospecimenData[tube.id] && biospecimenData[tube.id]['593843561'] === 353358909 && tube.checked === false) {
            biospecimenData[tube.id] = {};
        }

        biospecimenData[tube.id]['593843561'] = tube.checked ? 353358909 : 104430631;

        const reason = document.getElementById(tube.id + 'Reason');
        const deviated = document.getElementById(tube.id + 'Deviated');
        const deviation = document.getElementById(tube.id + 'Deviation');
        const comment = document.getElementById(tube.id + 'DeviatedExplanation');

        if(reason) {
            if(reason.value) {
                biospecimenData[tube.id]['883732523'] = parseInt(reason.value); 
                biospecimenData[tube.id]['338286049'] = comment.value.trim();

                if(biospecimenData[tube.id]['883732523'] === 181769837 && !comment.value.trim()) { 
                    hasError = true;
                    errorMessage(comment.id, 'Please provide more details', focus);
                    focus = false;
                    return
                }
            }
            else {
                delete biospecimenData[tube.id]['883732523'];
                delete biospecimenData[tube.id]['338286049'];
            }
        }
        
        if(deviated) {
            if(deviated.checked) {
                biospecimenData[tube.id]['678857215'] = 353358909;
                biospecimenData[tube.id]['536710547'] = comment.value.trim();
            }
            else {
                biospecimenData[tube.id]['678857215'] = 104430631;
                delete biospecimenData[tube.id]['536710547'];
            }
    
            const tubeData = siteTubesList.filter(td => td.concept === tube.id)[0];
            const deviationSelections = Array.from(deviation).filter(dev => dev.selected).map(dev => parseInt(dev.value));
    
            if(tubeData.deviationOptions) {
                tubeData.deviationOptions.forEach(option => {
                    biospecimenData[tube.id]['248868659'][option.concept] = (deviationSelections.indexOf(option.concept) != -1 ? 353358909 : 104430631);
                });
            }
    
            biospecimenData[tube.id]['762124027'] = (biospecimenData[tube.id]['248868659']['472864016'] === 353358909 || biospecimenData[tube.id]['248868659']['956345366'] === 353358909 || biospecimenData[tube.id]['248868659']['810960823'] === 353358909 || biospecimenData[tube.id]['248868659']['684617815'] === 353358909) ? 353358909 : 104430631;
    
            if (biospecimenData[tube.id]['248868659']['453343022'] === 353358909 && !comment.value.trim()) { 
                hasError = true;
                errorMessage(comment.id, 'Please provide more details', focus);
                focus = false;
                return
            }
        }
    });

    if (hasError) return;

    biospecimenData['338570265'] = document.getElementById('collectionAdditionalNotes').value;

    if (cntd) {
        if (getWorflow() === 'clinical') {
            if (biospecimenData['915838974'] === undefined) biospecimenData['915838974'] = new Date().toISOString();
        }
    }

    showAnimation();

    await updateSpecimen([biospecimenData]);
    

    const baselineVisit = (biospecimenData['331584571'] === 266600170);
    const clinicalResearchSetting = (biospecimenData['650516960'] === 534621077 || biospecimenData['650516960'] === 664882224);

    await updateCollectionSettingData(biospecimenData, siteTubesList, formData);
    formData = await getUpdatedParticipantData(formData);

    if(baselineVisit && clinicalResearchSetting) {
        await updateBaselineData(siteTubesList, formData);
        formData = await getUpdatedParticipantData(formData);
    }

    if (cntd) {
        const specimenData = (await searchSpecimen(biospecimenData['820476880'])).data;
        hideAnimation();
        finalizeTemplate(formData, specimenData);
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

const isChecked = (id) => document.getElementById(id).checked;

export const addEventSelectAllCollection = () => {
    const checkbox = document.getElementById('selectAllCollection');
    checkbox.addEventListener('click', () => {
        
        Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => {
            if(!chk.disabled && chk.id !== '223999569') {
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

const finalizeHandler = async (biospecimenData, cntd) => {

    if (cntd) {
        showAnimation();

        biospecimenData['410912345'] = 353358909;
        biospecimenData['556788178'] = new Date().toISOString();

        await updateSpecimen([biospecimenData]);

        hideAnimation();
        showNotifications({ title: 'Specimen Finalized', body: 'Collection Finalized Successfully!' });
    }

    searchTemplate();
}

export const addEventReturnToCollectProcess = () => {
    const btn = document.getElementById('returnToCollectProcess');
    btn.addEventListener('click', async () => {
        const masterSpecimenId = btn.dataset.masterSpecimenId;
        const connectId = btn.dataset.connectId;
        showAnimation();
        let query = `connectId=${parseInt(connectId)}`;
        const response = await findParticipant(query);
        const data = response.data[0];
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        tubeCollectedTemplate(data, specimenData);
    })
};

export const addEventBackToTubeCollection = (data, masterSpecimenId) => {
    const btn = document.getElementById('backToTubeCollection');
    btn.addEventListener('click', async () => {
        showAnimation();
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        tubeCollectedTemplate(data, specimenData);
    })
}

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

export const addEventShipPrintManifest = (id) => {
  const btn = document.getElementById(id)
  btn.addEventListener('click', e => {
    window.print()
    if(e.target.classList.contains("print-manifest")) {
      e.target.classList.remove("print-manifest")
    } else return
  })
}

export const addEventNavBarBoxManifest = (id, userName) => {
    const btn = document.getElementById(id);
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        if (id == 'viewBoxManifestBlood') {
            //return box 1 info
            boxManifest(document.getElementById('currTubeTable'), userName);
        }
        else if (id == 'viewBoxManifestMouthwash') {
            //return box 2 info
            boxManifest(document.getElementById('mouthwashList'), userName)
        }
    });
}

export const addEventNavBarShippingManifest = (userName, tempCheckedEl) => {
    const btn = document.getElementById('completePackaging');
    document.getElementById('completePackaging').addEventListener('click', async e => {
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
        boxesToShip.forEach(box => shipSetForage.push({ "boxId": box, "959708259": "" }))
        checkShipForage(shipSetForage,boxesToShip)
        //return box 1 info
        shippingPrintManifestReminder(boxesToShip, userName, tempCheckStatus, currShippingLocationNumber);
    });
}

export const addEventReturnToReviewShipmentContents = (element, boxIdAndBagsObj, userName, tempChecked) => {
    const btn = document.getElementById(element);
    document.getElementById(element).addEventListener('click', async e => {
        let boxListToShip = Object.keys(boxIdAndBagsObj).sort(compareBoxIds)
        //return box 1 info
        if (tempChecked != false) {
            tempChecked = true;
        }
        await shippingManifest(boxListToShip, userName, tempChecked);
    });
}

export const addEventNavBarTracking = (element, userName, boxIdAndBagsObj, tempChecked) => {
    let btn = document.getElementById('navBarShipmentTracking');
    document.getElementById(element).addEventListener('click', async e => {
        e.stopPropagation();
        if (btn.classList.contains('active')) return;
        let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds)
        for (let i = 0; i < boxIdList.length; i++) {
            // hiddenJSON[keys[i]] = hiddenJSON[keys[i]]['specimens']
            boxIdAndBagsObj[boxIdList[i]] = {
              "959708259" : boxIdAndBagsObj[boxIdList[i]]["959708259"],
              "specimens" : boxIdAndBagsObj[boxIdList[i]]['specimens']
          }
        }
        //return box 1 info
        shipmentTracking(boxIdAndBagsObj, userName, tempChecked);
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

  let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
  /* Check Tracking Numbers - ON SCREEN LOAD */
  boxIdList.forEach(box => {
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
  boxIdList.forEach(box => {
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

export const populateSelectLocationList = async () => {
    const locationSelection = JSON.parse(localStorage.getItem('selections'))?.shipping_location;
    let selectEle = document.getElementById('selectLocationList')
    let response = await getLocationsInstitute();
    let options = '<option value="none">Select Shipping Location</option>'
    
    for (let i = 0; i < response.length; i++) {
        options += `<option ${locationSelection === response[i] ? 'selected="selected"' : ""}>` + response[i] + '</option>';
    }

    selectEle.innerHTML = options;
}

export const populateBoxManifestTable = (boxId, boxIdAndBagsObj) => {
    let currTable = document.getElementById('boxManifestTable');
    let bagObjects = boxIdAndBagsObj[boxId];

    let bagList = Object.keys(bagObjects);
    let rowCount = 1;
    for (let i = 0; i < bagList.length; i++) {
        let tubes = bagObjects[bagList[i]]['arrElements'];
        for (let j = 0; j < tubes.length; j++) {
            let currRow = currTable.insertRow(rowCount);
            if (j == 0) {
                currRow.insertCell(0).innerHTML = bagList[i];
            }
            else {
                currRow.insertCell(0).innerHTML = '';
            }
            currRow.insertCell(1).innerHTML = tubes[j]
            let thisId = tubes[j].split(' ');
            let toAddType = 'N/A'
            if (translateNumToType.hasOwnProperty(thisId[1])) {
                toAddType = translateNumToType[thisId[1]];
            }
            currRow.insertCell(2).innerHTML = toAddType
            let fullScannerName = ''

            if (bagObjects[bagList[i]].hasOwnProperty('469819603') && j == 0) {
                fullScannerName += bagObjects[bagList[i]]['469819603'] + ' ';
            }
            if (bagObjects[bagList[i]].hasOwnProperty('618036638') && j == 0) {
                fullScannerName += bagObjects[bagList[i]]['618036638'];
            }
            currRow.insertCell(3).innerHTML = fullScannerName;

            if (i % 2 == 0) {
                currRow.style['background-color'] = "lightgrey";
            }
            rowCount += 1;
        }
    }

}

export const populateTrackingQuery = async (boxIdAndBagsObj) => {
    let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    let toBeInnerHTML = ""

    let shipping = {}
    let shipData = await localforage.getItem("shipData")

    for(let box of shipData) {
      // if boxes has box id of localforage shipData push
      if(boxIdList.includes(box["boxId"])) {
        shipping[box["boxId"]] = {"959708259":box["959708259"], "confirmTrackNum": box["confirmTrackNum"] }
      }
      else {
        shipping[box["boxId"]] = {"959708259":"" , confirmTrackNum:"", }
      }
    }
    
    for(let i = 0; i < boxIdList.length; i++){
        let trackNum = boxIdList[i] && shipping?.[boxIdList[i]]?.["959708259"];
        let trackNumConfirm = boxIdList[i] && shipping?.[boxIdList[i]]?.["confirmTrackNum"];
        toBeInnerHTML +=`
        <div class = "row" style="justify-content:space-around">
                            <div class="form-group" style="margin-top:30px; width:380px;">
                                <label style="float:left;margin-top:5px">`+'Enter / Scan Shipping Tracking Number for ' + `<span style="font-weight:600;display:block;">${boxIdList[i]}</span>` + `</label>
                                <br>
                                <div style="float:left;">
                                    <input class="form-control boxTrackingId shippingTrackingInput" type="text" id="` + boxIdList[i] + 'trackingId' + `" placeholder="Enter/Scan Tracking Number" value="${trackNum ?? ""}" data-toggle="tooltip" data-placement="top" title="Scan or manually type tracking number" autocomplete="off"/>
                                    <p style="font-size:.8rem; margin-top:.5rem;">Ex. 457424072905</p>
                                    <p id="${boxIdList[i]}trackingIdErrorMsg" class="text-danger"></p>
                                </div>
                            </div>
                            <div class="form-group" style="margin-top:30px; width:380px;">
                                <label style="float:left;margin-top:5px">`+'Confirm Shipping Tracking Number for '+ `<span style="font-weight:600;display:block;">${boxIdList[i]}</span>` + `</label>
                                <br>
                                <div style="float:left;">
                                    <input class="form-control boxTrackingIdConfirm shippingTrackingInput" type="text" id="` + boxIdList[i] + 'trackingIdConfirm' + `" placeholder="Enter/Scan Tracking Number" value="${trackNumConfirm ?? ""}" data-toggle="tooltip" data-placement="top" title="Scan or manually type to confirm the correct tracking number" autocomplete="off"/>
                                    <p style="font-size:.8rem; margin-top:.5rem;">Ex. 457424072905</p>
                                    <p id="${boxIdList[i]}trackingIdConfirmErrorMsg" class="text-danger"></p>
                                </div>
                            </div>
                        </div>
                        <br>`
    }
    document.getElementById("forTrackingNumbers").innerHTML = toBeInnerHTML;
}

export const addEventCompleteButton = (boxIdAndBagsObj, userName, tempChecked) => {
    document.getElementById('completeTracking').addEventListener('click', async () => {
        let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
        let emptyField = false;
        let trackingNumConfirmEls = Array.from(document.getElementsByClassName("invalid"))

        if(trackingNumConfirmEls.length > 0) {
          showNotifications({ title: 'Invalid Fields', body: 'Please add valid inputs to fields.' }, true)
          return
        }

        for (let i = 0; i < boxIdList.length; i++) {
            let boxi = document.getElementById(boxIdList[i] + "trackingId").value.toUpperCase();
            let boxiConfirm = document.getElementById(boxIdList[i] + "trackingIdConfirm").value.toUpperCase();
            if (boxi == '' || boxiConfirm == '') {
                emptyField = true
                showNotifications({ title: 'Missing Fields', body: 'Please enter in shipment tracking numbers'}, true)
                return
            }
        
            // if '959708259' exists update tracking number
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('959708259')) {
              boxIdAndBagsObj[boxIdList[i]]['959708259'] = boxi
            }
            // if 'confirmTrackNum' exists update tracking number
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('confirmTrackNum')) {
              boxIdAndBagsObj[boxIdList[i]]['confirmTrackNum'] = boxiConfirm 
            }
            // if specimens exists update, else add following key/values
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('specimens')) {
              boxIdAndBagsObj[boxIdList[i]]['specimens'] = boxIdAndBagsObj[boxIdList[i]]['specimens'] 
            } 
            else {
              boxIdAndBagsObj[boxIdList[i]] = { '959708259': boxi, confirmTrackNum: boxiConfirm, specimens: boxIdAndBagsObj[boxIdList[i]] }
            }  
        }

        let isDuplicateTrackingIdInDb = await checkDuplicateTrackingIdFromDb(boxIdList );
        
        if(isDuplicateTrackingIdInDb || (checkFedexShipDuplicate(boxIdList) && boxIdList.length > 1)){
            shippingDuplicateMessage()
            return
          }

        if(checkNonAlphanumericStr(boxIdList)) {
          shippingNonAlphaNumericStrMessage()
          return 
        }

        if (emptyField == false) {
            document.getElementById('shippingHiddenTable').innerText = JSON.stringify(boxIdAndBagsObj);
            addEventSaveContinue(boxIdAndBagsObj)
            let shipmentCourier = document.getElementById('courierSelect').value;
            finalShipmentTracking(boxIdAndBagsObj, userName, tempChecked, shipmentCourier);
        }
    })

}

export const addEventSaveButton = async (boxIdAndBagsObj) => {
    document.getElementById('saveTracking').addEventListener('click', async () => {
        let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
        let isMismatch = -1;

        for (let i = 0; i < boxIdList.length; i++) {
            let boxi = document.getElementById(boxIdList[i] + "trackingId").value.toUpperCase();
            let boxiConfirm = document.getElementById(boxIdList[i] + "trackingIdConfirm").value.toUpperCase();
            
            if (boxi !== boxiConfirm) {
                isMismatch = i;
                break;
            }

            // if '959708259' exists update tracking number
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('959708259')) {
              boxIdAndBagsObj[boxIdList[i]]['959708259'] = boxi
            }
            // if 'confirmTrackNum' exists update tracking number
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('confirmTrackNum')) {
              boxIdAndBagsObj[boxIdList[i]]['confirmTrackNum'] = boxiConfirm 
            }
            // if specimens exists update, else add following key/values
            if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('specimens')) {
              boxIdAndBagsObj[boxIdList[i]]['specimens'] = boxIdAndBagsObj[boxIdList[i]]['specimens'] 
            } 
            else {
              boxIdAndBagsObj[boxIdList[i]] = { '959708259': boxi, confirmTrackNum: boxiConfirm, specimens: boxIdAndBagsObj[boxIdList[i]] }
            }  
        }

        if (isMismatch > - 1) {
            await swal({
                title: 'Error!',
                icon: 'error',
                text: 'Tracking Ids do not match in one of the boxes.',
                timer: 1600,
              })           
            return;
        }
        let isDuplicateTrackingIdInDb = await checkDuplicateTrackingIdFromDb(boxIdList);
        if(isDuplicateTrackingIdInDb || (checkFedexShipDuplicate(boxIdList) && boxIdList.length > 1)){
            shippingDuplicateMessage(isDuplicateTrackingIdInDb)
            return
          }
          
        let shippingData = []

        for(let i = 0; i < boxIdList.length; i++){
          let boxi = document.getElementById(boxIdList[i] + "trackingId").value.toUpperCase();
          let boxiConfirm = document.getElementById(boxIdList[i] + "trackingIdConfirm").value.toUpperCase();
            shippingData.push({ "959708259": boxi, confirmTrackNum: boxiConfirm, "boxId":boxIdList[i]})
        }
        localforage.setItem("shipData",shippingData)

        await swal({
          title: 'Success!',
          icon: 'success',
          text: 'Tracking input saved',
          timer: 1600,
        })
    })
}

export const addEventSaveContinue = (boxIdAndBagsObj) => {
      let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
      for (let i = 0; i < boxIdList.length; i++) {
          let boxi = document.getElementById(boxIdList[i] + "trackingId").value.toUpperCase();
          let boxiConfirm = document.getElementById(boxIdList[i] + "trackingIdConfirm").value.toUpperCase();
          // if '959708259' exists update tracking number
          if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('959708259')) {
            boxIdAndBagsObj[boxIdList[i]]['959708259'] = boxi
          }
          // if 'confirmTrackNum' exists update tracking number
          if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('confirmTrackNum')) {
            boxIdAndBagsObj[boxIdList[i]]['confirmTrackNum'] = boxiConfirm 
          }
          // if specimens exists update, else add following key/values
          if (boxIdAndBagsObj[boxIdList[i]].hasOwnProperty('specimens')) {
            boxIdAndBagsObj[boxIdList[i]]['specimens'] = boxIdAndBagsObj[boxIdList[i]]['specimens'] 
          } 
          else {
            boxIdAndBagsObj[boxIdList[i]] = { '959708259': boxi, confirmTrackNum: boxiConfirm, specimens: boxIdAndBagsObj[boxIdList[i]] }
          }  
      }
      
      let shippingData = []

      for(let i = 0; i < boxIdList.length; i++){
        let boxi = document.getElementById(boxIdList[i] + "trackingId").value.toUpperCase();
        let boxiConfirm = document.getElementById(boxIdList[i] + "trackingIdConfirm").value.toUpperCase();
          shippingData.push({ "959708259": boxi, confirmTrackNum: boxiConfirm, "boxId":boxIdList[i]})
      }
      localforage.setItem("shipData",shippingData)
}

export const addEventCompleteShippingButton = (boxIdAndBagsObj, userName, tempChecked, shipmentCourier) => {
    document.getElementById('finalizeModalSign').addEventListener('click', async () => {
        let finalizeTextField = document.getElementById('finalizeSignInput');
        let firstNameShipper = userName.split(" ")[0] ? userName.split(" ")[0] : ""
        let lastNameShipper = userName.split(" ")[1] ? userName.split(" ")[1] : ""
        let conversion = {
            "FedEx": 712278213,
            "World Courier": 149772928
        }
        let tempCheckedId = 104430631
        if (tempChecked != false) {
          tempCheckedId = tempChecked
        }
        let shippingData = {}
        shippingData["666553960"] = conversion[shipmentCourier]
        shippingData["105891443"] = tempCheckedId;
        shippingData["948887825"] = firstNameShipper;
        shippingData["885486943"] = lastNameShipper;
        let trackingNumbers = {}
        let boxIdList = Object.keys(boxIdAndBagsObj);
        for (let i = 0; i < boxIdList.length; i++) {
            trackingNumbers[boxIdList[i]] = boxIdAndBagsObj[boxIdList[i]]['959708259'];
        }
        if (finalizeTextField.value.toUpperCase() === userName.toUpperCase()) {
            let boxes = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
            let shipSent = await ship(boxes, shippingData, trackingNumbers);
            console.log(shipSent)
            document.getElementById('finalizeModalCancel').click();
            if (tempChecked) {
                updateNewTempDate();
            }
            if(shipSent.code === 200) {
              alert("This shipment is now finalized; no other changes can be made")
              localforage.removeItem("shipData")
              startShipping(userName) 
            }
            // Add error logic here
            else return
        }
        else {
            let errorMessage = document.getElementById('finalizeModalError');
            errorMessage.style.display = "block";
        }
    })
}

export const populateFinalCheck = (boxIdAndBagsObj) => {
    let table = document.getElementById('finalCheckTable');
    let boxIdList = Object.keys(boxIdAndBagsObj).sort(compareBoxIds);
    for (let i = 0; i < boxIdList.length; i++) {
        let currBox = boxIdList[i]
        let currShippingNumber = boxIdAndBagsObj[boxIdList[i]]['959708259']
        let specimenObj = boxIdAndBagsObj[boxIdList[i]]['specimens'];
        let keys = Object.keys(specimenObj);
        let numTubes = 0;
        let numBags = specimenObj.hasOwnProperty('orphans') ? keys.length - 1 : keys.length;
        for (let j = 0; j < keys.length; j++) {
            numTubes += specimenObj[keys[j]]?.['arrElements'].length;
        }
        let row = table.insertRow(i + 1);
        row.insertCell(0).innerHTML = currBox;
        row.insertCell(1).innerHTML = currShippingNumber;
        row.insertCell(2).innerHTML = numTubes;
        row.insertCell(3).innerHTML = numBags;
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

        currRow.insertCell(0).innerHTML = currPage.hasOwnProperty('959708259') ? currPage['959708259'] : '';
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

export const populateReportManifestTable = (currPage) => {
    let currTable = document.getElementById('boxManifestTable');

    let bags = Object.keys(currPage['bags']);
    let rowCount = 1;
    for (let i = 0; i < bags.length; i++) {
        let tubes = currPage['bags'][bags[i]]['arrElements'];
        for (let j = 0; j < tubes.length; j++) {
            let currRow = currTable.insertRow(rowCount);
            if (j == 0) {
                currRow.insertCell(0).innerHTML = bags[i];
            }
            else {
                currRow.insertCell(0).innerHTML = '';
            }
            currRow.insertCell(1).innerHTML = tubes[j]
            let thisId = tubes[j].split(' ');
            let toAddType = 'N/A'
            if (translateNumToType.hasOwnProperty(thisId[1])) {
                toAddType = translateNumToType[thisId[1]];
            }
            currRow.insertCell(2).innerHTML = toAddType
            let fullScannerName = ''
            let currBox = currPage['bags'];
            if (currBox[bags[i]].hasOwnProperty('469819603') && j == 0) {
                fullScannerName += currBox[bags[i]]['469819603'] + ' ';
            }
            if (currBox[bags[i]].hasOwnProperty('618036638') && j == 0) {
                fullScannerName += currBox[bags[i]]['618036638'];
            }
            currRow.insertCell(3).innerHTML = fullScannerName;
            if (i % 2 == 0) {
                currRow.style['background-color'] = "lightgrey";
            }
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

    })

}

export const isScannedIdShipped = (getAllBoxesWithoutConversionResponse, masterSpecimendId) => {
  const getAllBoxesWithoutConversionData = getAllBoxesWithoutConversionResponse.data;
  if(!getAllBoxesWithoutConversionData.length) return false;
  const inputScanned = masterSpecimendId;
  const allBoxesShippedFilter = getAllBoxesWithoutConversionData.filter(box => box.hasOwnProperty('145971562')) // Submit shipment flag - '145971562'
  let foundMatch = false

  for (let box of allBoxesShippedFilter) {
      if(foundMatch) break;
      
      for(let bagConceptId of bagConceptIdList) {
        const bag = box[bagConceptId];
        if (
          bag?.["223999569"] == inputScanned || // Biohazard Bag (mouthwash) scan
          bag?.["522094118"] == inputScanned || // Orphan Bag/Container Scan
          bag?.["787237543"] == inputScanned || // Biohazard Bag (Blood or Blood/Urine) ID
          bag?.["234868461"]?.includes(inputScanned)){ // Check if input is found in (Samples Within - "234868461") array
          foundMatch = true;
          break;
        }
      }
    }
  return foundMatch;
}

const findScannedIdInBoxesNotShippedObject = (getAllBoxesWithoutConversionResponse, masterSpecimenId) => {
  const getAllBoxesWithoutConversionData = getAllBoxesWithoutConversionResponse.data
  const allBoxesNotShippedFilter = getAllBoxesWithoutConversionData.filter(box => !box.hasOwnProperty('145971562'))
  const inputScanned = masterSpecimenId;
  let foundMatch = false
  let boxNumber
  let siteSpecificLocationId
  let dataObj = {"inputScanned": inputScanned}

  for(let box of allBoxesNotShippedFilter) {
    if(foundMatch) break;

    for(let bagConceptId of bagConceptIdList) {
      const bag = box[bagConceptId];
      if(
        bag?.["223999569"] == inputScanned || // Biohazard Bag (mouthwash) scan
        bag?.["522094118"] == inputScanned || // Orphan Bag/Container Scan
        bag?.["787237543"] == inputScanned || // Biohazard Bag (Blood or Blood/Urine) ID
        bag?.["234868461"]?.includes(inputScanned)){ // Check if input is found in (Samples Within - "234868461") array
          foundMatch = true
          boxNumber = box['132929440']
          siteSpecificLocationId = box['560975149']
          dataObj['foundMatch'] = foundMatch
          dataObj['560975149'] = siteSpecificLocationId
          dataObj['132929440'] = boxNumber
          break;
        }
    }
  }
  return dataObj
}