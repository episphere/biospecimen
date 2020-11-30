import { performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant, removeActiveClass, errorMessage, removeAllErrors, storeSpecimen, searchSpecimen, generateBarCode, addEventBarCodeScanner, getIdToken, searchSpecimenInstitute, storeBox, getBoxes, ship, getLocationsInstitute, getBoxesByLocation, disableInput, allStates, removeBag, removeMissingSpecimen, getAllBoxes, getNextTempCheck, updateNewTempDate} from './shared.js'
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { startShipping, boxManifest, shippingManifest, finalShipmentTracking} from './pages/shipping.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { collectProcessTemplate, tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { explanationTemplate } from './pages/explanation.js';
import { additionalTubeIDRequirement, masterSpecimenIDRequirement, siteSpecificTubeRequirements, workflows } from './tubeValidation.js';
import { checkOutScreen } from './pages/checkout.js';

export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
    if(!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;
        if(!firstName && !lastName && !dob) return;
        let query = '';
        if(firstName) query += `firstName=${firstName}&`;
        if(lastName) query += `lastName=${lastName}&`;
        if(dob) query += `dob=${dob.replace(/-/g,'')}&`;
        performSearch(query);
    })
};

export const addEventSearchForm2 = () => {
    const form = document.getElementById('search2');
    if(!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        let query = '';
        if(email) query += `email=${email}`;
        performSearch(query);
    })
};

export const addEventSearchForm3 = () => {
    const form = document.getElementById('search3');
    if(!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        let query = '';
        if(phone) query += `phone=${phone}`;
        performSearch(query);
    })
};

export const addEventSearchForm4 = () => {
    const form = document.getElementById('search4');
    if(!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const connectId = document.getElementById('connectId').value;
        let query = '';
        if(connectId) query += `connectId=${connectId}`;
        performSearch(query);
    })
};

export const addEventsearchSpecimen = () => {
    const form = document.getElementById('specimenLookupForm');
    if(!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        removeAllErrors();
        const masterSpecimenId = document.getElementById('masterSpecimenId').value;
        if(!masterSpecimenIDRequirement.regExp.test(masterSpecimenId) || masterSpecimenId.length !== masterSpecimenIDRequirement.length) {
            errorMessage('masterSpecimenId', 'Collection ID must be 9 characters long and in CXA123456 format.', true);
            return;
        }
        showAnimation();
        const biospecimen = await searchSpecimen(masterSpecimenId);
        if(biospecimen.code !== 200) {
            hideAnimation();
            
            showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
            return
        }
        const biospecimenData = biospecimen.data;
        let keys = Object.keys(biospecimenData)
        for(let i = 0; i < keys.length; i++){
            let currData = biospecimenData[keys[i]];
            let re = /tube[0-9]*Id/
            console.log(keys[i])
            console.log(keys[i].match(/tube[0-9]*Id/)==null)
        }
        console.log(JSON.stringify(biospecimenData))
        let query = `connectId=${parseInt(biospecimenData.connectId)}`;
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        if(biospecimenData.finalized) checkOutScreen(data, biospecimenData);
        else tubeCollectedTemplate(data, biospecimenData)
    })
}

export const getCurrBoxNumber=(j)=>{
    let keys = Object.keys(j);
    let count = 1;
    return keys.length;
}

export const addEventAddSpecimenToBox = () => {
    const form = document.getElementById('addSpecimenForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        
        showAnimation();
        //getCurrBoxNumber

        const masterSpecimenId = document.getElementById('masterSpecimenId').value;
        let mouthwashList = document.getElementById("mouthwashList")
        let currTubeTable = document.getElementById("currTubeTable")

        const header = document.getElementById('shippingModalHeader');
        const body = document.getElementById('shippingModalBody');
        header.innerHTML = `<h5 class="modal-title">Add Specimens</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="shippingCloseButton">
                                <span aria-hidden="true">&times;</span>
                            </button>`;

        body.innerHTML = `
        <table class="table" id="shippingModalTable">
            <thead>
                <tr>
                    <th>Tube ID</th>
                    <th>Type</th>
                    <th></th>
                </tr>
            </thead>
        </table>
        `;
        let masterIdSplit = masterSpecimenId.split(/\s+/);
        let foundInOrphan = false;
        //get all ids from the hidden
        let shippingTable = document.getElementById('specimenList')
        let orphanTable = document.getElementById('orphansList')
        let biospecimensList = []
        let tableIndex = -1;
        let foundInShipping = false;
        for(let i = 1; i < shippingTable.rows.length; i++){
            let currRow = shippingTable.rows[i];
            if(currRow.cells[0]!==undefined && currRow.cells[0].innerText == masterSpecimenId){
                console.log(currRow.cells[2].innerText)
                tableIndex = i;
                biospecimensList = JSON.parse(currRow.cells[2].innerText)
                foundInShipping = true;
                console.log('owikebnvolekidbnvpowivbhnwspolivkbnh')
                console.log(JSON.stringify(biospecimensList))
            }
            
        }
        
       for(let i = 1; i < orphanTable.rows.length; i++){
            let currRow = orphanTable.rows[i];
            if(currRow.cells[0]!==undefined && currRow.cells[0].innerText == masterSpecimenId){
                //console.log(currRow.cells[2].innerText)
                tableIndex = i;
                let currTubeNum = currRow.cells[0].innerText.split(' ')[1];
                console.log(currTubeNum)
                biospecimensList = [currTubeNum];
                foundInOrphan = true;
            }
            
        }

        if(biospecimensList.length == 0){
            showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
            hideAnimation();
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(500);
            document.getElementById('shippingCloseButton').click();
            return
        }

        biospecimensList.sort();
        await createShippingModalBody(biospecimensList, masterSpecimenId,foundInOrphan)
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex, foundInOrphan);
        hideAnimation();

        /*
        //document.getElementById("shippingModal").modal();
        var specimenList = document.getElementById("specimenList");
        let list = [];
        for (let index = 0; index < specimenList.children.length; index++) {
            list.push(specimenList.children[index].value);
        }
        
        if(list.includes(masterSpecimenId)){
            let spl = masterSpecimenId.split(/\s+/);
            if(spl.length >= 2 && spl[1] == "0008"){
                var option = document.createElement("option");
                option.text = masterSpecimenId;
                mouthwashList.add(option)
            }
            else{
                //go to blood and urine
                var option = document.createElement("option");
                option.text = masterSpecimenId;
                currTubeTable.add(option)
            }
        }

        for (var i=0; i<specimenList.length; i++) {
            if (specimenList.options[i].value == masterSpecimenId)
                specimenList.remove(i);
        }
        */
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

    let response = await getBoxesByLocation(currLocation);
    let boxJSONS = response.data;
    let hiddenJSON = {};
    console.log(boxJSONS)
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['boxId']] = box['bags']
    }

    let tubeTable = document.getElementById("shippingModalTable")
    let currSplit = masterBiospecimenId.split(/\s+/);
    let currBag = [];
    let empty = true;
    let translateNumToType = {
        "0001":"SST/Gold",
        "0002":"SST/Gold",
        "0003":"Heparin/Green",
        "0004":"EDTA/Lavender",
        "0005":"ACD/Yellow",
        "0006":"Urine/Yellow",
        "0007":"Mouthwash Container",
        "0011":"SST/Gold",
        "0012":"SST/Gold",
        "0013":"Heparin/Green",
        "0014":"EDTA/Lavender",
        "0016":"Urine Cup",
        "0021":"SST/Gold",
        "0022":"SST/Gold",
        "0031":"SST/Gold",
        "0032":"SST/Gold",
        "0024":"EDTA/Lavender",
        "0050":"NA",
        "0051":"NA",
        "0052":"NA",
        "0053":"NA",
        "0054":"NA"
    };
    if(!isOrphan){
        if(currSplit.length >= 2 && currSplit[1] == '0008'){
            //look for all non-moutwash (0007)
            for(let i = 0; i < biospecimensList.length; i++){
                if(biospecimensList[i] != '0007'){
                    empty = false;
                    currBag.push(biospecimensList[i])
                    var rowCount = tubeTable.rows.length;
                    var row = tubeTable.insertRow(rowCount);           
                    row.insertCell(0).innerHTML= currSplit[0] + ' ' + biospecimensList[i];
                    let thisId =biospecimensList[i];
                    let toAddType = 'N/A'
                    if(translateNumToType.hasOwnProperty(thisId)){
                        toAddType = translateNumToType[thisId];
                    }
                    row.insertCell(1).innerHTML= toAddType;
                    row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Missing">';

                    let currDeleteButton = row.cells[2].getElementsByClassName("delButton")[0];
                    currDeleteButton.addEventListener("click", async e => {
                        var index = e.target.parentNode.parentNode.rowIndex;
                        var table = document.getElementById("shippingModalTable");
                        table.deleteRow(index);
                    })
                    
                }
            }
        }
        else{
            for(let i = 0; i < biospecimensList.length; i++){
                if(biospecimensList[i] == '0007'){
                    empty = false;
                    currBag.push(biospecimensList[i])
                    var rowCount = tubeTable.rows.length;
                    var row = tubeTable.insertRow(rowCount);           
                    row.insertCell(0).innerHTML= currSplit[0] + ' ' + biospecimensList[i];
                    let thisId = biospecimensList[i]
                    let toAddType = 'N/A'
                    if(translateNumToType.hasOwnProperty(thisId)){
                        toAddType = translateNumToType[thisId];
                    }
                    row.insertCell(1).innerHTML= toAddType;
                    row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Missing">';

                    let currDeleteButton = row.cells[2].getElementsByClassName("delButton")[0];
                    currDeleteButton.addEventListener("click", async e => {
                        var index = e.target.parentNode.parentNode.rowIndex;
                        var table = document.getElementById("shippingModalTable");
                        table.deleteRow(index);
                    })
                    
                }
            }
        }
    }
    else{
        for(let i = 0; i < biospecimensList.length; i++){
            empty = false;
            currBag.push(biospecimensList[i])
            var rowCount = tubeTable.rows.length;
            var row = tubeTable.insertRow(rowCount);           
            row.insertCell(0).innerHTML= currSplit[0] + ' ' + biospecimensList[i];
            let thisId = biospecimensList[i]
            let toAddType = 'N/A'
            if(translateNumToType.hasOwnProperty(thisId)){
                toAddType = translateNumToType[thisId];
            }
            row.insertCell(1).innerHTML= toAddType;
            row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Missing">';

            let currDeleteButton = row.cells[2].getElementsByClassName("delButton")[0];
            currDeleteButton.addEventListener("click", async e => {
                var index = e.target.parentNode.parentNode.rowIndex;
                var table = document.getElementById("shippingModalTable");
                table.deleteRow(index);
            })
        }
    }
    populateModalSelect(hiddenJSON)

    if(empty){
        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
        document.getElementById('shippingCloseButton').click();
        hideAnimation();
        return
    }
    
}

export const addEventAddSpecimensToListModalButton=(bagid, tableIndex, isOrphan)=>{
    let submitButton = document.getElementById('addToBagButton')
    submitButton.addEventListener('click', async e =>{
        e.preventDefault();
        
        
        showAnimation();
        let hiddenJSON = {};
        let isBlood = true;
        let response = await  getBoxes();
        let boxJSONS = response.data;
        let locations = {};
        console.log(boxJSONS)
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSON[box['boxId']] = box['bags']
            locations[box['boxId']] = box['location'];
        }
        let nextBoxNum = Object.keys(hiddenJSON).length + 1;

        console.log('trigger')
        //push the things into the right box
        //first get all elements still left
        let tubeTable = document.getElementById("shippingModalTable");
        let numRows = tubeTable.rows.length;
        let bagSplit = bagid.split(/\s+/);
        let boxId = ""
        boxId = document.getElementById('shippingModalChooseBox').value;

        if(isOrphan){
            bagid = 'orphans'
        }

        let toDelete = [];

        for(let i = 1; i < numRows; i++){
            //get the first element (tube id) from the thingx
            let toAddId = tubeTable.rows[i].cells[0].innerText;
            toDelete.push(toAddId.split(/\s+/)[1]);

            if(hiddenJSON.hasOwnProperty(boxId)){
                if(hiddenJSON[boxId].hasOwnProperty(bagid)){
                    let arr = hiddenJSON[boxId][bagid]['arrElements'];
                    arr.push(toAddId);
                }
                else{
                    hiddenJSON[boxId][bagid] = {'isBlood':isBlood,'arrElements':[toAddId]};
                }
            }
            else{
                hiddenJSON[boxId] = {}
                hiddenJSON[boxId][bagid] = {'isBlood':isBlood,'arrElements':[toAddId]};
            }

        }

        
        

        document.getElementById('selectBoxList').value = boxId;
        //document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON);

        let shippingTable = document.getElementById('specimenList')
        let currArr = JSON.parse(shippingTable.rows[tableIndex].cells[2].innerText);
        for (let i = 0; i < toDelete.length; i++){
            let currDel = toDelete[i];
            currArr.splice(currArr.indexOf(toDelete[i]),1);
        }
        if(currArr.length == 0){
            shippingTable.deleteRow(tableIndex);
        }
        else{
            shippingTable.rows[tableIndex].cells[2].innerText = JSON.stringify(currArr);
            shippingTable.rows[tableIndex].cells[1].innerText = currArr.length;
        }
        let boxIds = Object.keys(hiddenJSON);

        console.log(boxIds);    
        for(let i = 0; i < boxIds.length; i++){
            let toPass = {};
            toPass['boxId'] = boxIds[i];
            toPass['bags'] = hiddenJSON[boxIds[i]]
            toPass['location'] = locations[boxIds[i]]
            await storeBox(toPass);
        }

        response = await  getAllBoxes();
        boxJSONS = response.data;
        hiddenJSON = {};
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSON[box['boxId']] = box['bags']
        }
        
            
        await populateTubeInBoxList();
        await populateSpecimensList(hiddenJSON);
        hideAnimation();
    },{once:true})
    //ppulateSpecimensList();
}

export const getInstituteSpecimensList = async(hiddenJSON) => {
    const response = await searchSpecimenInstitute();
    let specimenData = response.data;
    console.log(JSON.stringify('apeuidbvaosidvbasd;vkbasv:    '  + specimenData))
    let toReturn = {};
    let checkedOrphans = false;
    for(let i = 0; i < specimenData.length; i++){
        let toExclude8 = [];
        let toExclude9 = [];
        let toExcludeOrphans = [];
        if(specimenData[i].hasOwnProperty('masterSpecimenId')){
            let boxes = Object.keys(hiddenJSON);
            for(let j = 0; j < boxes.length; j++){
                let specimens = Object.keys(hiddenJSON[boxes[j]]);
                console.log(JSON.stringify(hiddenJSON[boxes[j]]));
                if(specimens.includes(specimenData[i]['masterSpecimenId'] + ' 0008')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['masterSpecimenId'] + ' 0008')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude8.push(currList[k].split(/\s+/)[1]);
                    }
                }
                if(specimens.includes(specimenData[i]['masterSpecimenId'] + ' 0009')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['masterSpecimenId'] + ' 0009')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude9.push(currList[k].split(/\s+/)[1]);
                    }

                }
                if(checkedOrphans == false){
                    if(specimens.includes('orphans')){
                        console.log('ipouaqwjehbdsfnvlkasjdbvloiaksudjvbgoivu')
                        console.log(JSON.stringify( hiddenJSON[boxes[j]]['orphans']['arrElements']))
                        let currList =  hiddenJSON[boxes[j]]['orphans']['arrElements']
                        for(let k = 0; k < currList.length; k++){
                            toExcludeOrphans.push(currList[k].split(/\s+/)[1]);
                        }
                        
                    }
                }
            }
        }
        let list8 = [];
        let list9 = [];
        let keys = Object.keys(specimenData[i])
        for(let j = 0; j < keys.length; j++){
            
            let currKey = keys[j];
            if(currKey.match(/tube[0-9]*Id/) != null){
                //get number of the tube
                let tubeNum = currKey.substring(4, currKey.indexOf("Id"));
                let shippedKey = keys.indexOf('tube'+tubeNum+'Shipped')
                let missingKey = keys.indexOf('tube'+tubeNum+'Missing')
                if(shippedKey != -1){
                    if(specimenData[i][keys[shippedKey]] == false){
                        if(missingKey != -1){
                            if(specimenData[i][keys[missingKey]] == false){
                                if(specimenData[i][currKey] != '0007'){
                                    
                                    if(toExclude8.indexOf(specimenData[i][currKey]) == -1){
                                        list8.push(specimenData[i][currKey]);
                                    }
                                }
                                else{
                                    if(toExclude9.indexOf(specimenData[i][currKey]) == -1){
                                        list9.push(specimenData[i][currKey]);
                                    }
                                }
                            }
                        }
                        else{
                            if(specimenData[i][currKey] != '0007'){
                                
                                if(toExclude8.indexOf(specimenData[i][currKey]) == -1){
                                    list8.push(specimenData[i][currKey])
                                }
                            }
                            else{
                                if(toExclude9.indexOf(specimenData[i][currKey]) == -1){
                                    list9.push(specimenData[i][currKey]);
                                }
                            }
                        }
                    }
                }
                if(missingKey != -1){
                    if(specimenData[i][keys[missingKey]] == false){
                        if(specimenData[i][currKey] != '0007'){
                            
                            if(toExclude8.indexOf(specimenData[i][currKey]) == -1){
                                list8.push(specimenData[i][currKey])
                            }
                        }
                        else{
                            if(toExclude9.indexOf(specimenData[i][currKey]) == -1){
                                list9.push(specimenData[i][currKey]);
                            }
                        }
                    }
                }
            }
        }
        console.log(JSON.stringify(toReturn))
        if(toExclude8.length > 0 && list8.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            //add orphan tubes
            
            //toInsert[specimenData[i]['masterSpecimenId'] + ' 0008'] = list8
            if(!toReturn.hasOwnProperty('orphans')){
                //console.log(JSON.stringify(toReturn))
                toReturn['orphans'] = []
            }
            for(let j = 0; j < list8.length; j++){
                console.log('oipuwqabe vloi;uajgbdsvolisadujbvsaloidvubasdliuasdvb')
                console.log(list8[j]);
                console.log(JSON.stringify(toExcludeOrphans))
                if(!toExcludeOrphans.includes(list8[j])){
                    toReturn['orphans'].push(specimenData[i]['masterSpecimenId'] + ' ' + list8[j])
                }
            }

        }
        if(toExclude9.length > 0 && list9.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            
            if(!toReturn.hasOwnProperty('orphans')){
                //console.log(JSON.stringify(toReturn))
                toReturn['orphans'] = []
            }
            for(let j = 0; j < list9.length; j++){
                console.log('oipuwqabe vloi;uajgbdsvolisadujbvsaloidvubasdliuasdvb1')
                console.log(specimenData[i]['masterSpecimenId'] + ' ' + list9[j]);
                if(!toExcludeOrphans.includes(list9[j])){
                    toReturn['orphans'].push(specimenData[i]['masterSpecimenId'] + ' ' + list9[j])
                }
            }

        }
        if(toExclude8.length == 0 && list8.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            toReturn[specimenData[i]['masterSpecimenId'] + ' 0008'] = list8;
        }
        if(toExclude9.length == 0 && list9.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            toReturn[specimenData[i]['masterSpecimenId'] + ' 0009'] = list9;
        }
    }
    
    return toReturn;
}

export const populateSpecimensList = async (hiddenJSON) => {
    let specimenObject = await getInstituteSpecimensList(hiddenJSON);
    const response = await searchSpecimenInstitute();
    let specimenData = response.data
    console.log("SpecimenData!!: " + JSON.stringify(specimenData))
    console.log(JSON.stringify(specimenObject))
    for(let i = 0; i < specimenData.length; i++){
        //let specimenData = 
        
    }
    let list = Object.keys(specimenObject);
    console.log(list)
    //console.log(JSON.stringify(curr));
    //let list = ["KW123456 0008", "KW123456 0009"]
    list.sort();
    
    var specimenList = document.getElementById("specimenList");
    let numRows = 1;
    specimenList.innerHTML = `<tr>
                                <th>Specimen Bag ID</th>
                                <th># Specimens</th>
                            </th>`;
    let orphansIndex = -1;
    
   
    for(let i = 0; i < list.length; i++){
        if(list[i] != "orphans"){
            var rowCount = specimenList.rows.length;
            var row = specimenList.insertRow(rowCount);           
            row.insertCell(0).innerHTML= list[i];
            row.insertCell(1).innerHTML = specimenObject[list[i]].length;
            
            let hiddenChannel = row.insertCell(2)
            hiddenChannel.innerHTML = JSON.stringify(specimenObject[list[i]]);
            hiddenChannel.style.display = "none";
            if(numRows % 2 == 0){
                row.style['background-color'] = "lightgrey";
            }
            numRows += 1;
        }
        else{
            orphansIndex = i;
        }
    }
    
    let orphanPanel = document.getElementById('orphansPanel');
    let orphanTable = document.getElementById('orphansList')
    let specimenPanel = document.getElementById('specimenPanel')
    orphanTable.innerHTML = '';

    if(orphansIndex != -1 && specimenObject['orphans'].length > 0){

        orphanPanel.style.display = 'block'
        specimenPanel.style.height = '400px'
        
        let toInsert = specimenObject['orphans'];
        console.log('ORPHANS: ' + JSON.stringify(toInsert))
        var rowCount = orphanTable.rows.length;
        var row = orphanTable.insertRow(rowCount); 
        row.insertCell(0).innerHTML= 'Orphan tubes';
        row.insertCell(1).innerHTML = toInsert.length;
        let hiddenChannel = row.insertCell(2)
        hiddenChannel.innerHTML = JSON.stringify(toInsert);
        hiddenChannel.style.display = "none";
        for(let i = 0; i < toInsert.length; i++){
            rowCount = orphanTable.rows.length;
            row = orphanTable.insertRow(rowCount); 
            if(rowCount % 2  == 0){
                row.style['background-color'] = 'lightgrey'
            }
            console.log(toInsert[i])
            row.insertCell(0).innerHTML= toInsert[i];
            row.insertCell(1).innerHTML ='<input type="button" class="delButton" value = "Report as Missing"/>';
        
            //boxes[i]
    
            //let currBoxButton = currRow.cells[5].getElementsByClassName("delButton")[0];
            let currDeleteButton = row.cells[1].getElementsByClassName("delButton")[0]; 
    
            //This should remove the entrire bag
            currDeleteButton.addEventListener("click", async e => {
                var index = e.target.parentNode.parentNode.rowIndex;
                var table = e.target.parentNode.parentNode.parentNode.parentNode;
                
                let currRow = table.rows[index];
                let currTubeId = table.rows[index].cells[0].innerText;
                console.log(currTubeId);
                /*if(currRow.cells[0].innerText != ""){
                    if(index < table.rows.length-1){
                        if(table.rows[index + 1].cells[0].innerText ==""){
                            table.rows[index+1].cells[0].innerText = currRow.cells[0].innerText;
                        }
                    }
                }*/
                table.deleteRow(index);
                let result = await removeMissingSpecimen(currTubeId);
                console.log(result)
                //let result = await removeBag(boxList.value, [currBagId])
                //console.log(JSON.stringify(result))
                currRow = table.rows[index];
                while(currRow != undefined && currRow.cells[0].innerText ==""){
                    console.log(currRow.cells)
                    table.deleteRow(index);
                    currRow = table.rows[index];
                }
                
                //delete bag from json

            })
        }
    }
    else{
        orphanPanel.style.display = 'none'
        specimenPanel.style.height = '600px'
    }
    var rowCount = specimenList.rows.length;
    var row = specimenList.insertRow(rowCount);
        
    //put in orphans
    /*
    for(let i = 0; i < list.length; i++){
        var option = document.createElement("option");
        option.text = list[i];
        specimenList.add(option)
    }*/

}

export const populateBoxManifestHeader= (boxId, hiddenJSON) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")

    let newP = document.createElement("p");
    newP.innerHTML = "Box 1 Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);

    //let date = "";
    let currentdate = new Date(); 
    let ampm = parseInt(currentdate.getHours())/12 >= 1 ? "PM" : "AM"; 
    let hour = parseInt(currentdate.getHours())%12;
    let datetime =  (currentdate.getMonth()+1) + "/"
                    + currentdate.getDate()  + "/" 
                    + currentdate.getFullYear() + " "  
                    + hour.toString()+ ":"  
                    + currentdate.getMinutes() + ampm;
    newP = document.createElement("p");
    newP.innerHTML = "Date/Time: " + datetime;
    document.getElementById('boxManifestCol1').appendChild(newP);
     

}

export const populateModalSelect = (hiddenJSON) => {
    let currSelectBox = document.getElementById('selectBoxList');
    let toFocus = currSelectBox.value;
    let boxList = document.getElementById('shippingModalChooseBox');
    let list = ''
    let keys = Object.keys(hiddenJSON).sort(compareBoxIds);
    for(let i = 0; i < keys.length; i++){
        list += '<option>' + keys[i] + '</option>';
    }
    if(list == ''){
        list = 'remember to add Box'
    }
    boxList.innerHTML = list;
    currSelectBox.value = document.getElementById('selectBoxList').value;
}

export const populateSaveTable = (hiddenJSON) => {
    let table = document.getElementById("saveTable");
    let count = 0;
    let boxes = Object.keys(hiddenJSON)
    for(let i = 0; i < boxes.length; i++){
        if(Object.keys(hiddenJSON[boxes[i]]).length > 0 ){
        let currRow = table.insertRow(count+1);
        if(count % 2 == 1){
            currRow.style['background-color'] = 'lightgrey'
        }
        currRow.style.
        count += 1;
        currRow.insertCell(0).innerHTML=`<input type="checkbox" class="markForShipping">`
        currRow.insertCell(1).innerHTML= '';
        currRow.insertCell(2).innerHTML= '';
        currRow.insertCell(3).innerHTML= boxes[i];
        //get num tubes
        let currBox = hiddenJSON[boxes[i]];
        let numTubes = 0;
        let boxKeys=Object.keys(currBox);
        for(let j = 0; j < boxKeys.length; j++ ){
            numTubes += currBox[boxKeys[j]]['arrElements'].length;
        }
        currRow.insertCell(4).innerHTML= numTubes.toString() + " tubes";
        currRow.insertCell(5).innerHTML= '<input type="button" class="boxManifestButton" value = "Box Manifest"/>';
        
        //boxes[i]

        let currBoxButton = currRow.cells[5].getElementsByClassName("boxManifestButton")[0];
        currBoxButton.addEventListener("click", async e => {
            var index = e.target.parentNode.parentNode.rowIndex;
            var table = document.getElementById("shippingModalTable");
            //bring up edit on the corresponding table
            
            await boxManifest(boxes[i]);


            //addEventNavBarBoxManifest("viewBoxManifestBlood")
            //if(hiddenJSON[boxes[i]])
            //table.deleteRow(index);
        })
    }
}
}

export const populateTempNotification = async () => {
    
    let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('tempTubeReminder');
    if(checkDate == true){
        toToggle.style.display='block';
    }
    else{
        toToggle.style.display='none';
    }
}

export const populateTempCheck = async () => {
    let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('checkForTemp');
    if(checkDate == true){
        toToggle.style.display='block';
    }
    else{
        toToggle.style.display='none';
    }
}

export const populateShippingManifestHeader = (hiddenJSON) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")

    let newP = document.createElement("p");
    newP.innerHTML = "Box 1 Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);

    //let date = "";
    let currentdate = new Date(); 
    let ampm = parseInt(currentdate.getHours())/12 >= 1 ? "PM" : "AM"; 
    let hour = parseInt(currentdate.getHours())%12;
    let datetime =  (currentdate.getMonth()+1) + "/"
                    + currentdate.getDate()  + "/" 
                    + currentdate.getFullYear() + " "  
                    + hour.toString()+ ":"  
                    + currentdate.getMinutes() + ampm;
    newP = document.createElement("p");
    newP.innerHTML = "Date/Time: " + datetime;
    document.getElementById('boxManifestCol1').appendChild(newP);
} 

export const populateShippingManifestBody = (hiddenJSON) =>{
    let table = document.getElementById("shippingManifestTable");
    let boxes = Object.keys(hiddenJSON);
    let currRowIndex = 1;
    for(let i = 0; i < boxes.length; i++){
        let firstSpec = true;
        let currBox = boxes[i];
        let specimens = Object.keys(hiddenJSON[boxes[i]])
        for(let j = 0; j < specimens.length; j++){
            let firstTube = true;
            let specimen = specimens[j];
            let tubes = hiddenJSON[boxes[i]][specimen]['arrElements'];
            for(let k = 0; k < tubes.length; k++){

                let currTube = tubes[k];
                let currRow = table.insertRow(currRowIndex);

                if(firstSpec){
                    
                    currRow.insertCell(0).innerHTML= currBox;
                    firstSpec = false;

                }
                else{
                    currRow.insertCell(0).innerHTML= '';
                }
                if(firstTube){

                    currRow.insertCell(1).innerHTML= specimen;
                    firstTube = false;
                }
                else{
                    currRow.insertCell(1).innerHTML= '';
                }

                currRow.insertCell(2).innerHTML= currTube;
                currRowIndex+=1;
            
            }

        }

    }
}

const compareBoxIds = (a,b) => {
    let a1 = parseInt(a.substring(3));
    let b1 = parseInt(b.substring(3));
    if(a1 < b1){
        return -1;
    }
    else if(a1 > b1){
        return 1;
    }
    return 0;

}

export const populateBoxSelectList = (hiddenJSON) => {
    let boxList = document.getElementById('selectBoxList');
    let selectBoxList = document.getElementById('selectBoxList');
    let list = ''
    let keys = Object.keys(hiddenJSON).sort(compareBoxIds);
    for(let i = 0; i < keys.length; i++){
        list += '<option>' + keys[i] + '</option>';
    }
    if(list == ''){
        list = 'remember to add Box'
    }
    boxList.innerHTML = list;

    let currBoxId = selectBoxList.value;
    if(currBoxId != ''){
    let currBox = hiddenJSON[currBoxId];
        
    
    document.getElementById('BoxNumBlood').innerText = currBoxId;
    let toInsertTable = document.getElementById('currTubeTable')
    let boxKeys = Object.keys(currBox)
    toInsertTable.innerText = '';
    let translateNumToType = {
        "0001":"SST/Gold",
        "0002":"SST/Gold",
        "0003":"Heparin/Green",
        "0004":"EDTA/Lavender",
        "0005":"ACD/Yellow",
        "0006":"Urine/Yellow",
        "0007":"Mouthwash Container",
        "0011":"SST/Gold",
        "0012":"SST/Gold",
        "0013":"Heparin/Green",
        "0014":"EDTA/Lavender",
        "0016":"Urine Cup",
        "0021":"SST/Gold",
        "0022":"SST/Gold",
        "0031":"SST/Gold",
        "0032":"SST/Gold",
        "0024":"EDTA/Lavender",
        "0050":"NA",
        "0051":"NA",
        "0052":"NA",
        "0053":"NA",
        "0054":"NA"
    };
    //set the rest of the table up
    for(let j = 0; j < boxKeys.length; j++){
        let currBagId = boxKeys[j];
        let currTubes = currBox[boxKeys[j]]['arrElements'];
        
        for(let k = 0; k < currTubes.length; k++){

                //get the first element (tube id) from the thingx
                let toAddId = currTubes[k];
                let thisId = toAddId.split(' ');
                let toAddType = 'N/A'
                if(translateNumToType.hasOwnProperty(thisId[1])){
                    toAddType = translateNumToType[thisId[1]];
                }
                var rowCount = toInsertTable.rows.length;
                var row = toInsertTable.insertRow(rowCount);           
                if(j % 2 == 1){
                    row.style['background-color'] = "lightgrey"
                }
                if(k == 0){
                    row.insertCell(0).innerHTML=currBagId
                }
                else{
                    row.insertCell(0).innerHTML=""
                }
                row.insertCell(1).innerHTML= toAddId;
                row.insertCell(2).innerHTML= toAddType;
                if(k == 0){
                    row.insertCell(3).innerHTML='<input type="button" class="delButton" value = "remove">';
                }
                else{
                    row.insertCell(3).innerHTML="";
                }
                //row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';

                if(k == 0){
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
                        let result = await removeBag(boxList.value, [currBagId])
                        currRow = table.rows[index];
                        while(currRow != undefined && currRow.cells[0].innerText ==""){
                            table.deleteRow(index);
                            currRow = table.rows[index];
                        }
                        let response = await  getAllBoxes();
                        let boxJSONS = response.data;
                        let hiddenJSON = {};
                        for(let i = 0; i < boxJSONS.length; i++){
                            let box = boxJSONS[i]
                            hiddenJSON[box['boxId']] = box['bags']
                        }

                        await populateSpecimensList(hiddenJSON);
                        hideAnimation();
                        //delete bag from json

                    })
                }

        }
    }
    }
    
}

export const addEventAddBox = () => {
    let boxButton = document.getElementById('addBoxButton');
    boxButton.addEventListener('click', async () => {
        let response = await  getBoxes();
        let hiddenJSON = response.data;
        let locations = {};
        let keys = [];
        let largestOverall = 0;
        let largeIndex = -1;

        let largestLocation = 0;
        let largestLocationIndex = -1;
        let pageLocation = document.getElementById('selectLocationList').value;
        for(let i = 0; i < hiddenJSON.length; i++){
            let curr = parseInt(hiddenJSON[i]['boxId'].substring(3))
            let currLocation = hiddenJSON[i]['location']

            if(curr > largestOverall){
                largestOverall = curr;
                largeIndex = i;
            }
            if(curr > largestLocation && currLocation == pageLocation){
                largestLocation = curr;
                largestLocationIndex = i;
            }
            
        }
        if(largestLocationIndex != -1){
            let lastBox = hiddenJSON[largeIndex]['boxId']
            if(Object.keys(hiddenJSON[largestLocationIndex]['bags']).length != 0){
                //add a new Box
                //create new Box Id
                let newBoxNum = parseInt(lastBox.substring(3)) + 1;
                let newBoxId = 'Box' + newBoxNum.toString();
                let toPass = {};
                toPass['boxId'] = newBoxId;
                toPass['bags'] = {};
                toPass['location'] = pageLocation;
                await storeBox(toPass);

                hiddenJSON.push({boxId:newBoxId, bags:{}, location:pageLocation})
                let boxJSONS = hiddenJSON;
                
                hiddenJSON = {};

                for(let i = 0; i < boxJSONS.length; i++){
                    let box = boxJSONS[i]
                    if(box['location'] == pageLocation){
                        hiddenJSON[box['boxId']] = box['bags']
                    }
                }
                populateBoxSelectList(hiddenJSON)
            }
            else{
                //error (ask them to put something in the previous box first)
            }
        }
    })
   

}

export const addEventModalAddBox = () => {
    let boxButton = document.getElementById('modalAddBoxButton');
    
    boxButton.addEventListener('click', async () => {
        let response = await  getBoxes();
        let hiddenJSON = response.data;
        let locations = {};
        let keys = [];
        let largestOverall = 0;
        let largeIndex = -1;

        let largestLocation = 0;
        let largestLocationIndex = -1;
        let pageLocation = document.getElementById('selectLocationList').value;
        for(let i = 0; i < hiddenJSON.length; i++){
            let curr = parseInt(hiddenJSON[i]['boxId'].substring(3))
            let currLocation = hiddenJSON[i]['location']

            if(curr > largestOverall){
                largestOverall = curr;
                largeIndex = i;
            }
            if(curr > largestLocation && currLocation == pageLocation){
                largestLocation = curr;
                largestLocationIndex = i;
            }
            
        }
        if(largestLocationIndex != -1){
            let lastBox = hiddenJSON[largeIndex]['boxId']
            if(Object.keys(hiddenJSON[largestLocationIndex]['bags']).length != 0){
                //add a new Box
                //create new Box Id
                let newBoxNum = parseInt(lastBox.substring(3)) + 1;
                let newBoxId = 'Box' + newBoxNum.toString();
                let toPass = {};
                toPass['boxId'] = newBoxId;
                toPass['bags'] = {};
                toPass['location'] = pageLocation;
                await storeBox(toPass);

                hiddenJSON.push({boxId:newBoxId, bags:{}, location:pageLocation})
                let boxJSONS = hiddenJSON;
                
                hiddenJSON = {};

                for(let i = 0; i < boxJSONS.length; i++){
                    let box = boxJSONS[i]
                    if(box['location'] == pageLocation){
                        hiddenJSON[box['boxId']] = box['bags']
                    }
                }
                populateModalSelect(hiddenJSON);
                let modalSelect = document.getElementById('shippingModalChooseBox');
                modalSelect.value = newBoxId;
                populateBoxSelectList(hiddenJSON)
            }
            else{
                //error (ask them to put something in the previous box first)
            }
        }
    })
   

}

export const populateTubeInBoxList = async () => {
    let boxList = document.getElementById('selectBoxList');
    let selectBoxList = document.getElementById('selectBoxList');
    let currBoxId = selectBoxList.value;
    let response = await  getBoxes();
    let hiddenJSON = response.data;
    let currBox = {};
    for(let i = 0; i < hiddenJSON.length; i++){
        let currJSON = hiddenJSON[i];
        if(currJSON.boxId == currBoxId){
            currBox = currJSON.bags;
        }
    }
    let currList = "";
    
    document.getElementById('BoxNumBlood').innerText = currBoxId;
    let toInsertTable = document.getElementById('currTubeTable')
    let boxKeys = Object.keys(currBox)
    toInsertTable.innerText = '';
    //set the rest of the table up
    let translateNumToType = {
        "0001":"SST/Gold",
        "0002":"SST/Gold",
        "0003":"Heparin/Green",
        "0004":"EDTA/Lavender",
        "0005":"ACD/Yellow",
        "0006":"Urine/Yellow",
        "0007":"Mouthwash Container",
        "0011":"SST/Gold",
        "0012":"SST/Gold",
        "0013":"Heparin/Green",
        "0014":"EDTA/Lavender",
        "0016":"Urine Cup",
        "0021":"SST/Gold",
        "0022":"SST/Gold",
        "0031":"SST/Gold",
        "0032":"SST/Gold",
        "0024":"EDTA/Lavender",
        "0050":"NA",
        "0051":"NA",
        "0052":"NA",
        "0053":"NA",
        "0054":"NA"
    };
    for(let j = 0; j < boxKeys.length; j++){
        let currBagId = boxKeys[j];
        let currTubes = currBox[boxKeys[j]]['arrElements'];
        
        for(let k = 0; k < currTubes.length; k++){

                //get the first element (tube id) from the thingx
                let toAddId = currTubes[k];
                let thisId = toAddId.split(' ');
                let toAddType = 'N/A'
                if(translateNumToType.hasOwnProperty(thisId[1])){
                    toAddType = translateNumToType[thisId[1]];
                }
                var rowCount = toInsertTable.rows.length;
                var row = toInsertTable.insertRow(rowCount);           
                if(j % 2 == 1){
                    row.style['background-color'] = 'lightgrey'
                }
                if(k == 0){
                    row.insertCell(0).innerHTML=currBagId
                }
                else{
                    row.insertCell(0).innerHTML=""
                }
                row.insertCell(1).innerHTML= toAddId;
                row.insertCell(2).innerHTML= toAddType;
                if(k == 0){
                    row.insertCell(3).innerHTML='<input type="button" class="delButton" value = "remove">';
                }
                else{
                    row.insertCell(3).innerHTML="";
                }
                //row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';

                if(k == 0){
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
                        let result = await removeBag(boxList.value, [currBagId])
                        currRow = table.rows[index];
                        while(currRow != undefined && currRow.cells[0].innerText ==""){
                            table.deleteRow(index);
                            currRow = table.rows[index];
                        }
                        let response = await  getAllBoxes();
                        let boxJSONS = response.data;
                        let hiddenJSON = {};
                        for(let i = 0; i < boxJSONS.length; i++){
                            let box = boxJSONS[i]
                            hiddenJSON[box['boxId']] = box['bags']
                        }

                        await populateSpecimensList(hiddenJSON);
                        hideAnimation();
                        //delete bag from json

                    })
                }

        }
    }

}

export const addEventBoxSelectListChanged = () => {
    let selectBoxList = document.getElementById('selectBoxList');
    selectBoxList.addEventListener("change",  async () => {
        showAnimation();
        await populateTubeInBoxList();
        hideAnimation();
    })
}

export const addEventChangeLocationSelect = () => {
    let selectBoxList = document.getElementById('selectLocationList');
    selectBoxList.addEventListener("change",  async () => {
        showAnimation();
        let currLocation = selectBoxList.value;
        let boxJSONS = (await getBoxesByLocation(currLocation)).data;
        /*for(let i = 0; i < boxdata.length; i++){
            console.log(boxdata[i]['location'])
        }*/
        //let boxJSONS = response.data;
        let hiddenJSON = {};
        console.log(boxJSONS)
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSON[box['boxId']] = box['bags']
        }
        populateBoxSelectList(hiddenJSON)
        //console.log(JSON.stringify(boxdata))
        hideAnimation();
    })
}

export const addEventBackToSearch = (id) => {
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if(id !== 'checkOutExit') searchTemplate();
        else location.hash = '#welcome';
    });
};

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
        if(response.code === 200) {
            showNotifications({title: 'New user added!', body: `<b>${data.email}</b> is added as <b>${data.role}</b>`});
            form.reset();
            const users = await biospecimenUsers();
            hideAnimation();
            if(users.code === 200 && users.data.users.length > 0) {
                document.getElementById('usersList').innerHTML = userListTemplate(users.data.users, userEmail);
                addEventRemoveUser();
            }
        }
        else if(response.code === 400 && response.message === 'User with this email already exists') {
            hideAnimation();
            showNotifications({title: 'User already exists!', body: `User with email: <b>${data.email}</b> already exists`}, true);
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
            if(response.code === 200) {
                element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
                showNotifications({title: 'User removed!', body: `User with email <b>${email}</b> is removed.`});
            }
        })
    })
}

export const addEventSelectParticipantForm = (skipCheckIn) => {
    const form = document.getElementById('selectParticipant');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const radios = document.getElementsByName('selectParticipant');
        Array.from(radios).forEach(async radio => {
            if(radio.checked) {
                const connectId = parseInt(radio.value);
                let formData = {};
                formData['connectId'] = connectId;
                formData['siteAcronym'] = document.getElementById('contentBody').dataset.siteAcronym;
                formData['token'] = radio.dataset.token;
                let query = `connectId=${parseInt(connectId)}`;
                showAnimation();
                const response = await findParticipant(query);
                hideAnimation();
                const data = response.data[0];
                if(skipCheckIn) specimenTemplate(data, formData);
                else checkInTemplate(data);
            }
        })
    })
}

export const addEventCheckInCompleteForm = () => {
    const form = document.getElementById('checkInCompleteForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const select = document.getElementById('biospecimenVisitType');
        const connectId = parseInt(select.dataset.connectId);
        const biospecimenVisitType = select.value;
        const token = select.dataset.participantToken;
        let formData = {};
        formData['connectId'] = connectId;
        formData['visitType'] = biospecimenVisitType;
        formData['checkedInAt'] = new Date().toISOString();
        formData['token'] = token;
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        specimenTemplate(data, formData);
    })
};

export const addEventSpecimenLinkForm = (formData) => {
    const form = document.getElementById('specimenLinkForm');
    const specimenSaveExit = document.getElementById('specimenSaveExit');
    const specimenContinue = document.getElementById('specimenContinue');
    const connectId = specimenSaveExit.dataset.connectId || specimenContinue.dataset.connectId;
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;
    const reEnterSpecimen = document.getElementById('reEnterSpecimen');
    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    specimenSaveExit.addEventListener('click', () => {
        btnsClicked(connectId, formData)
    });
    specimenContinue.addEventListener('click', () => {
        btnsClicked(connectId, formData, true)
    });
    reEnterSpecimen.addEventListener('click', () => {
        removeAllErrors();
        form.reset();
    })
}

const btnsClicked = async (connectId, formData, cont) => {
    removeAllErrors();
    const scanSpecimenID = document.getElementById('scanSpecimenID').value;
    const enterSpecimenID1 = document.getElementById('enterSpecimenID1').value;
    const enterSpecimenID2 = document.getElementById('enterSpecimenID2').value;
    let hasError = false;
    let focus = true;
    
    if(scanSpecimenID && enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Provide either Scanned Collection ID or Manually typed.', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Provide either Scanned Collection ID or Manually typed.', focus);
        return;
    }
    else if(!scanSpecimenID && !enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Scan Collection ID or Type in Manually', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Scan Collection ID or Type in Manually', focus);
        return;
    }
    else if(scanSpecimenID && !enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(scanSpecimenID) || scanSpecimenID.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('scanSpecimenID', 'Collection ID must be 9 characters long and in CXA123456 format.', focus);
            focus = false;
            return;
        }
    }
    else if(!scanSpecimenID && enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(enterSpecimenID1) || enterSpecimenID1.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('enterSpecimenID1', 'Collection ID must be 9 characters long and in CXA123456 format.', focus);
            focus = false;
            return;
        }
        if(enterSpecimenID1 !== enterSpecimenID2) {
            hasError = true;
            errorMessage('enterSpecimenID2', 'Does not match with Manually Entered Collection ID', focus);
            return;
        }
    }
    if(document.getElementById('collectionLocation')) formData['Collection_Location'] = document.getElementById('collectionLocation').value;
    formData['820476880'] = scanSpecimenID && scanSpecimenID !== "" ? scanSpecimenID : enterSpecimenID1;
    if(enterSpecimenID1) formData['387108065'] = 353358909
    else formData['387108065'] = 104430631;
    let query = `connectId=${parseInt(connectId)}`;
    showAnimation();
    const response = await findParticipant(query);
    const data = response.data[0];
    const specimenData = (await searchSpecimen(formData['820476880'])).data;
    hideAnimation();
    if(cont) {
        if(specimenData && specimenData.connectId && parseInt(specimenData.connectId) !== data.Connect_ID) {
            showNotifications({title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different connect ID.'}, true)
        }
        else {
            showAnimation();
            await storeSpecimen([formData]);
            hideAnimation();
            tubeCollectedTemplate(data, specimenData ? specimenData : formData);
        }
    }
    else {
        if(specimenData && specimenData.connectId && parseInt(specimenData.connectId) !== data.Connect_ID) {
            showNotifications({title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different connect ID.'}, true)
        }
        else {
            showAnimation();
            await storeSpecimen([formData]);
            showAnimation();
            searchTemplate();
        }
    }
}

export const addEventBiospecimenCollectionFormCntd = (dt, biospecimenData) => {
    const form = document.getElementById('biospecimenCollectionForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        collectionSubmission(dt, biospecimenData, true);
    });
};

export const addEventBiospecimenCollectionForm = (dt, biospecimenData) => {
    const collectionSaveExit = document.getElementById('collectionSaveExit');
    collectionSaveExit.addEventListener('click', () => {
        collectionSubmission(dt, biospecimenData);
    });
};

export const addEventTubeCollectedForm = (data, masterSpecimenId) => {
    const form = document.getElementById('tubeCollectionForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const checkboxes = Array.from(document.getElementsByClassName('tube-collected'));
        let atLeastOneChecked = false;
        checkboxes.forEach(chkbox => {
            if(atLeastOneChecked) return
            if(chkbox.checked) atLeastOneChecked = true;
        });
        if(!atLeastOneChecked) return;
        
        showAnimation();
        const biospecimenData = (await searchSpecimen(masterSpecimenId)).data;

        if(biospecimenData && biospecimenData['tubeCollectedAt'] === undefined) biospecimenData['tubeCollectedAt'] = new Date().toISOString();
        checkboxes.forEach((dt) => {
            if(biospecimenData[`${dt.id}`] === undefined) biospecimenData[`${dt.id}`] = {};
            if(biospecimenData[dt.id] && biospecimenData[dt.id]['593843561'] === 353358909 && dt.checked === false) {
                biospecimenData[`${dt.id}`]['678857215'] = 104430631
                biospecimenData[`${dt.id}`]['label'] = '';
                biospecimenData[`${dt.id}`]['248868659'] = [];
                biospecimenData[`${dt.id}`]['410912345'] = 104430631;
                biospecimenData[`${dt.id}`]['536710547'] = '';
            }
            biospecimenData[`${dt.id}`]['593843561'] = dt.checked ? 353358909 : 104430631;
        });

        // Explicitely specify 2 biohazard bags
        if(biospecimenData['787237543'] === undefined) biospecimenData['787237543'] = { '593843561': 353358909 }
        if(biospecimenData['223999569'] === undefined) biospecimenData['223999569'] = { '593843561': 353358909 }

        await storeSpecimen([biospecimenData]);
        hideAnimation();
        collectProcessTemplate(data, biospecimenData);
    })
}

const collectionSubmission = async (dt, biospecimenData, cntd) => {
    const data = biospecimenData;
    removeAllErrors();
    const inputFields = Array.from(document.getElementsByClassName('input-barcode-id'));
    let hasError = false;
    let focus = true;
    inputFields.forEach(input => {
        const dashboardType = document.getElementById('contentBody').dataset.workflow;
        const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
        const subSiteLocation = biospecimenData.Collection_Location;
        const siteTubesList = siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] : siteSpecificTubeRequirements[siteAcronym][dashboardType]; 
        const tubes = siteTubesList.filter(dt => dt.concept === input.id.replace('Id', ''));
        
        let value = getValue(`${input.id}`);
        const masterID = value.substr(0, 9);
        const tubeID = value.substr(10, 14);
        if(input.required && value.length !== 14) {
            hasError = true;
            errorMessage(input.id, 'Combination of Collection ID and Full Specimen ID should be 14 characters long.', focus);
            focus = false;
        }
        else if(input.required && masterID !== biospecimenData['820476880']) {
            hasError = true;
            errorMessage(input.id, 'Invalid Collection ID.', focus);
            focus = false;
        }
        else if(input.required && tubes.length === 0) {
            hasError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        }
        else if(input.required && (tubes[0].id !== tubeID && !additionalTubeIDRequirement.regExp.test(tubeID))) {
            hasError = true;
            errorMessage(input.id, 'Invalid Full Specimen ID.', focus);
            focus = false;
        }
        data[`${input.id.replace('Id', '')}`]['label'] = `${masterID} ${tubeID}`;
    });
    if(hasError) return;
    data['collectionAdditionalNotes'] = document.getElementById('collectionAdditionalNotes').value;
    Array.from(document.getElementsByClassName('tube-deviated')).forEach(dt => data[dt.id.replace('Deviated', '')]['678857215'] = dt.checked ? 353358909 : 104430631)
    
    showAnimation();
    await storeSpecimen([data]);
    if(cntd) {
        const specimenData = (await searchSpecimen(biospecimenData['820476880'])).data;
        hideAnimation();
        explanationTemplate(dt, specimenData);
    }
    else {
        hideAnimation();
        searchTemplate();
    }
}

const getValue = (id) => document.getElementById(id).value;

const isChecked = (id) => document.getElementById(id).checked;

export const addEventSelectAllCollection = () => {
    const checkbox = document.getElementById('selectAllCollection');
    checkbox.addEventListener('click', () => {
        if(checkbox.checked) Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => chk.checked = true);
        else Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => chk.checked = false);
    })
}

export const addEventNavBarParticipantCheckIn = () => {
    const btn = document.getElementById('navBarParticipantCheckIn');
    if(!btn) return
    btn.addEventListener('click', async () => {
        const connectId = btn.dataset.connectId;
        if(!connectId) return;
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        checkInTemplate(data);
    })
}

export const addEventExplanationFormCntd = (data, masterSpecimenId) => {
    const form = document.getElementById('explanationForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        explanationHandler(data, masterSpecimenId, true);
    });
}

export const addEventExplanationForm = (data, masterSpecimenId) => {
    const explanationSaveExit = document.getElementById('explanationSaveExit');
    explanationSaveExit.addEventListener('click', () => {
        explanationHandler(data, masterSpecimenId);
    });
}

const explanationHandler = async (data, masterSpecimenId, cntd) => {
    const textAreas = document.getElementsByClassName('additional-explanation');
    let formData = {};
    Array.from(textAreas).forEach(ta => {
        if(document.getElementById(ta.id.replace('Explanation', 'Reason')).multiple) {
            formData[`${ta.id.replace('Explanation','Reason')}`] = Array.from(document.getElementById(ta.id.replace('Explanation', 'Reason'))).filter(el => el.selected).map(el => el.value);
        }
        else {
            formData[`${ta.id.replace('Explanation','Reason')}`] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
        }
        formData[`${ta.id}`] = ta.value;
    });
    formData['820476880'] = masterSpecimenId;
    showAnimation();
    await storeSpecimen([formData]);
    if(cntd) {
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        finalizeTemplate(data, specimenData);
    }
    else {
        hideAnimation();
        searchTemplate();
    }
}



export const addEventFinalizeForm = (data, masterSpecimenId) => {
    const finalizedSaveExit = document.getElementById('finalizedSaveExit');
    finalizedSaveExit.addEventListener('click', () => {
        finalizeHandler(data, masterSpecimenId);
    });
}

export const addEventFinalizeFormCntd = (data, masterSpecimenId) => {
    const form = document.getElementById('finalizeForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        finalizeHandler(data, masterSpecimenId, true);
    });
}

const finalizeHandler = async (data, masterSpecimenId, cntd) => {
    let formData = {};
    formData['finalizedAdditionalNotes'] = document.getElementById('finalizedAdditionalNotes').value;
    formData['820476880'] = masterSpecimenId;
    if(cntd) {
        formData['finalized'] = true;
        formData['finalizedAt'] = new Date().toISOString();
        showAnimation();
        await storeSpecimen([formData]);
        showNotifications({title: 'Specimen Finalized', body: 'Collection Finalized Successfully!'});
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        let query = `connectId=${parseInt(specimenData.connectId)}`;
        const response = await findParticipant(query);
        const participantData = response.data[0];
        hideAnimation();
        if(!document.getElementById('participantCheckOut')) location.hash = '#welcome'
        else checkOutScreen(participantData, specimenData);
    }
    else {
        showAnimation();
        await storeSpecimen([formData]);
        hideAnimation();
        searchTemplate();
    }
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
        if(btn.classList.contains('active')) return;
        searchBiospecimenTemplate();
    });
}

export const addEventNavBarShipment = (id) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', async e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        await startShipping();
        
    });
}


export const addEventNavBarBoxManifest = (id) => {
    const btn = document.getElementById(id);
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        if(id == 'viewBoxManifestBlood'){
            //return box 1 info
            boxManifest(document.getElementById('currTubeTable'));
        }
        else if(id == 'viewBoxManifestMouthwash'){
            //return box 2 info
            boxManifest(document.getElementById('mouthwashList'))
        }
    });
}

export const addEventNavBarShippingManifest = (userName) => {
    const btn = document.getElementById('completePackaging');
    document.getElementById('completePackaging').addEventListener('click', async e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        //get table info
        let boxesToShip = [];
        let currTable = document.getElementById('saveTable')
        for (var r = 1; r < currTable.rows.length; r++) {            
            
            let currCheck = currTable.rows[r].cells[0]
            console.log(currCheck.childNodes[0])
            if(currCheck.childNodes[0].checked){
                let currBoxId = currTable.rows[r].cells[3].innerText;
                boxesToShip.push(currBoxId)
            }
            
        }
        console.log(boxesToShip)
        //return box 1 info
        await shippingManifest(boxesToShip, userName);
    });
}
export const populateSelectLocationList = async () => {
    let currSelect = document.getElementById('selectLocationList')
    let response = await getLocationsInstitute();
    console.log(response);
    let list = ''
    for(let i = 0; i < response.length; i++){
        list += '<option>' + response[i] + '</option>';
    }
    if(list == ''){
        list = 'remember to add Box'
    }
    currSelect.innerHTML = list;
}

export const populateBoxManifestTable = (boxId, hiddenJSON) => {
    let currTable = document.getElementById('boxManifestTable');
    let currBox = hiddenJSON[boxId];
    
    let bags = Object.keys(currBox);
    let rowCount = 1;
    let translateNumToType = {
        "0001":"SST/Gold",
        "0002":"SST/Gold",
        "0003":"Heparin/Green",
        "0004":"EDTA/Lavender",
        "0005":"ACD/Yellow",
        "0006":"Urine/Yellow",
        "0007":"Mouthwash Container",
        "0011":"SST/Gold",
        "0012":"SST/Gold",
        "0013":"Heparin/Green",
        "0014":"EDTA/Lavender",
        "0016":"Urine Cup",
        "0021":"SST/Gold",
        "0022":"SST/Gold",
        "0031":"SST/Gold",
        "0032":"SST/Gold",
        "0024":"EDTA/Lavender",
        "0050":"NA",
        "0051":"NA",
        "0052":"NA",
        "0053":"NA",
        "0054":"NA"
    };
    for(let i = 0; i < bags.length; i++){
        let tubes = currBox[bags[i]]['arrElements'];
        for(let j = 0; j < tubes.length; j++){
            let currRow = currTable.insertRow(rowCount);
            if(j == 0){
                currRow.insertCell(0).innerHTML = bags[i];
            }
            else{
                currRow.insertCell(0).innerHTML = '';
            }
            currRow.insertCell(1).innerHTML = tubes[j]
            let thisId = tubes[j].split(' ');
            let toAddType = 'N/A'
            if(translateNumToType.hasOwnProperty(thisId[1])){
                toAddType = translateNumToType[thisId[1]];
            }
            currRow.insertCell(2).innerHTML = toAddType
            rowCount += 1;

        }
    }
    
}

export const populateTrackingQuery = (hiddenJSON) => {
    let boxes = Object.keys(hiddenJSON);
    let toBeInnerHTML = ""
    for(let i = 0; i < boxes.length; i++){
        toBeInnerHTML +=`
        <div class = "row">
                            <div class="form-group" style="margin-top:30px">
                                <label style="float:left;margin-top:5px">`+ boxes[i] +`</label>
                                <div style="float:left;margin-left:30px">
                                    <input class="form-control" type="text" id="` + boxes[i] + 'trackingId' + `" placeholder="Enter/Scan Tracking Number"/> <button class="barcode-btn" type="button" id="masterSpecimenIdBarCodeBtn" data-barcode-input="masterSpecimenId"><i class="fas fa-barcode"></i></button>
                                </div>
                            </div>
                        </div>
                        <br>`
                        /* `
                        <div class = "row">
                            <div class="form-group" style="margin-top:30px">
                                <label style="float:left;margin-top:5px">`+ boxes[i] +`</label>
                                <div style="float:left;margin-left:30px">
                                    <input class="form-control" type="text" id="` + boxes[i] + 'trackingId' + `" placeholder="Enter/Scan Tracking Number"/> <button class="barcode-btn" type="button" id="masterSpecimenIdBarCodeBtn" data-barcode-input="masterSpecimenId"><i class="fas fa-barcode"></i></button>
                                </div>
                            </div>
                        </div>
                        <br>`*/

                        
                            
    }
    document.getElementById("forTrackingNumbers").innerHTML = toBeInnerHTML;
}

export const addEventCompleteButton = (hiddenJSON, userName, tempChecked) => {
    document.getElementById('completeTracking').addEventListener('click', () =>{
        let boxes = Object.keys(hiddenJSON);
        let emptyField= false;
        for(let i = 0; i < boxes.length; i++){
            let boxi = document.getElementById(boxes[i] + "trackingId").value;
            console.log(boxi)
            if(boxi == ''){
                emptyField = true;
                showNotifications({title: 'Missing Fields', body: 'Please fill out required fields!'}, true)
            }
            hiddenJSON[boxes[i]] = {trackingId:boxi, specimens:hiddenJSON[boxes[i]]}
        }
        if(emptyField == false){
            document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON);
            console.log('done')
            finalShipmentTracking(hiddenJSON, userName, tempChecked);
        }
    })
    
}

export const addEventCompleteShippingButton = (hiddenJSON, userName, tempChecked) => {
    document.getElementById('finalizeModalSign').addEventListener('click', async () =>{
        let finalizeTextField = document.getElementById('finalizeSignInput');

        if(finalizeTextField.value === userName){
            let boxes = Object.keys(hiddenJSON);
            console.log(JSON.stringify(boxes));
            await ship(boxes);
            document.getElementById('finalizeModalCancel').click();
            if(tempChecked){
                updateNewTempDate();
            }
            startShipping();
        }
        else{
            let errorMessage = document.getElementById('finalizeModalError');
            errorMessage.style.display = "block";
        }
    })
}

export const populateFinalCheck = (hiddenJSON) => {
    let table = document.getElementById('finalCheckTable');
    let boxes = Object.keys(hiddenJSON);
    for(let i = 0; i < boxes.length; i++){
        let currBox = boxes[i]
        let currShippingNumber = hiddenJSON[boxes[i]]['trackingId']
        let specimenObj = hiddenJSON[boxes[i]]['specimens'];
        let keys = Object.keys(specimenObj);
        let numTubes = 0;
        for(let j = 0; j < keys.length; j++){
            numTubes += specimenObj[keys[j]]['arrElements'].length;
        }
        let row = table.insertRow(i+1);           
        row.insertCell(0).innerHTML= currBox;
        row.insertCell(1).innerHTML= currShippingNumber;
        row.insertCell(2).innerHTML= numTubes;
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
                <div class="col">${data.RcrtCS_Lname_v1r0}, ${data.RcrtCS_Fname_v1r0}</div>
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
                    <strong>Address:</strong> ${data.RcrtUP_AddressLn1_v1r0}${data.RcrtUP_AddressLn2_v1r0 ? ` ${data.RcrtUP_AddressLn2_v1r0}`: ''} ${data.RcrtUP_City_v1r0} ${Object.keys(allStates)[Object.values(allStates).indexOf(parseInt(data.RcrtUP_State_v1r0))]} ${data.RcrtUP_Zip_v1r0}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Email(s):</strong> ${data.RcrtUP_Email1_v1r0 ? data.RcrtUP_Email1_v1r0 : ''}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Phone:</strong> ${data.RcrtUP_Phone1_v1r0 ? data.RcrtUP_Phone1_v1r0 : ''}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Preferred contact method: </strong>
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

export const addEventClearScannedBarcode = () => {
    const clearInputBtn = document.getElementById('clearScanSpecimenID');
    clearInputBtn.hidden = false;
    clearInputBtn.addEventListener('click', () => {
        disableInput('enterSpecimenID1', false);
        disableInput('enterSpecimenID2', false);
        document.getElementById(clearInputBtn.dataset.barcodeInput).value = '';
        clearInputBtn.hidden = true;
    });
}
