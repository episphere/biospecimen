import { performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant, errorMessage, removeAllErrors, storeSpecimen, searchSpecimen, generateBarCode, searchSpecimenInstitute, storeBox, getBoxes, ship, getLocationsInstitute, getBoxesByLocation, disableInput, allStates, removeBag, removeMissingSpecimen, getAllBoxes, getNextTempCheck, updateNewTempDate, getParticipantCollections, getSiteTubesLists, getWorflow, collectionSettings} from './shared.js'
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { startShipping, boxManifest, shippingManifest, finalShipmentTracking, shipmentTracking} from './pages/shipping.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { collectProcessTemplate, tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { explanationTemplate } from './pages/explanation.js';
import { additionalTubeIDRequirement, masterSpecimenIDRequirement, siteSpecificTubeRequirements, totalCollectionIDLength } from './tubeValidation.js';
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
            errorMessage('masterSpecimenId', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, true);
            return;
        }
        showAnimation();
        const biospecimen = await searchSpecimen(masterSpecimenId);
        if(biospecimen.code !== 200) {
            hideAnimation();
            showNotifications({title: 'Not found', body: 'Specimen not found!'}, true)
            return
        }
        const biospecimenData = biospecimen.data;
        let query = `connectId=${parseInt(biospecimenData.Connect_ID)}`;
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        if(biospecimenData['410912345'] && biospecimenData['410912345'] === 353358909 && biospecimenData['420757389'] && biospecimenData['420757389'] === 353358909) {
            searchTemplate();
            showNotifications({title: 'Completed', body: 'Specimen is finalized and the Participant is already checked out!'})
        }
        else if(biospecimenData['410912345'] && biospecimenData['410912345'] === 353358909) checkOutScreen(data, biospecimenData);
        else tubeCollectedTemplate(data, biospecimenData)
    })
}

export const getCurrBoxNumber=(j)=>{
    let keys = Object.keys(j);
    let count = 1;
    return keys.length;
}

export const addEventAddSpecimenToBox = (userName) => {
    const form = document.getElementById('addSpecimenForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        document.getElementById('submitMasterSpecimenId').click(); 
    });
    const submitButtonSpecimen = document.getElementById('submitMasterSpecimenId');
    submitButtonSpecimen.addEventListener('click', async e => {
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
                    <th>Full Specimen ID</th>
                    <th>Type/Color</th>
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
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex, foundInOrphan, userName);
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
        hiddenJSON[box['132929440']] = box['bags']
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
                if(biospecimensList[i] != '0007' && biospecimensList[i] != '0008'){
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
                    row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Not in Bag">';

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
                if(biospecimensList[i] == '0007' && biospecimensList[i] != '0009'){
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
                    row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Not in Bag">';

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
            row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "Not in Bag">';

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

export const addEventAddSpecimensToListModalButton=(bagid, tableIndex, isOrphan, userName)=>{
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
            hiddenJSON[box['132929440']] = box['bags']
            locations[box['132929440']] = box['560975149'];
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
            bagid = 'unlabelled'
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
            let currTime = new Date();
            let toPass = {};
            let found = false;
            if(boxIds[i] == boxId){
                for(let j = 0; j < boxJSONS.length; j++){
                    if(boxJSONS[j]['132929440'] == boxIds[i]){
                        if(boxJSONS[j].hasOwnProperty('672863981')){
                            toPass['672863981'] = boxJSONS[j]['672863981'];
                            found = true;
                        }
                        if(boxJSONS[j].hasOwnProperty('555611076')){
                            toPass['555611076'] = boxJSONS[j]['555611076'];
                        }
                    }
                }

                if(found == false){
                    toPass['672863981'] = currTime.toString();
                }
                
                toPass['132929440'] = boxIds[i];
                toPass['bags'] = hiddenJSON[boxIds[i]]
                toPass['560975149'] = locations[boxIds[i]]
                toPass['555611076'] = currTime.toString();
                await storeBox(toPass);
            }
        }

        response = await  getAllBoxes();
        boxJSONS = response.data;
        hiddenJSON = {};
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSON[box['132929440']] = box['bags']
        }
        
            
        await populateTubeInBoxList(userName);
        await populateSpecimensList(hiddenJSON);
        hiddenJSON = {};
        for(let i = 0; i < boxJSONS.length; i++){
            if(!boxJSONS[i].hasOwnProperty('145971562') || boxJSONS[i]['145971562'] != '353358909'){
                let box = boxJSONS[i]
                hiddenJSON[box['132929440']] = box['bags']
            }
           
        }
        await populateSaveTable(hiddenJSON, boxJSONS, userName)
        hideAnimation();
    },{once:true})
    //ppulateSpecimensList();
}

export const getInstituteSpecimensList = async(hiddenJSON) => {
    //const response = await searchSpecimenInstitute();
    const conversion = {
        "299553921":"0001",
        "703954371":"0002",
        "838567176":"0003",
        "454453939":"0004",
        "652357376":"0005",
        "973670172":"0006",
        "143615646":"0007",
        "787237543":"0008",
        "223999569":"0009",
        "376960806":"0011",
        "232343615":"0012",
        "589588440":"0021",
        "746999767":"0022",
        "857757831":"0031",
        "654812257":"0032",
        "958646668":"0013",
        "677469051":"0014",
        "683613884":"0024"
    }
    let specimenData = await searchSpecimenInstitute();
    console.log('waoikebnp;oisdgbvspoiduvbgaoiwluejfbolafiujbf');
    console.log(JSON.stringify(specimenData));
    //let specimenData = response.data;
    let toReturn = {};
    let checkedOrphans = false;

    for(let i = 0; i < specimenData.length; i++){
        let toExclude8 = [];
        let toExclude9 = [];
        let toExcludeOrphans = [];
        if(specimenData[i].hasOwnProperty('820476880')){
            let boxes = Object.keys(hiddenJSON);
            for(let j = 0; j < boxes.length; j++){
                let specimens = Object.keys(hiddenJSON[boxes[j]]);
                console.log(JSON.stringify(hiddenJSON[boxes[j]]));
                if(specimens.includes(specimenData[i]['820476880'] + ' 0008')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['820476880'] + ' 0008')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude8.push(currList[k].split(/\s+/)[1]);
                    }
                }
                if(specimens.includes(specimenData[i]['820476880'] + ' 0009')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['820476880'] + ' 0009')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude9.push(currList[k].split(/\s+/)[1]);
                    }

                }
                if(checkedOrphans == false){
                    if(specimens.includes('unlabelled')){
                        console.log('ipouaqwjehbdsfnvlkasjdbvloiaksudjvbgoivu')
                        console.log(JSON.stringify( hiddenJSON[boxes[j]]['unlabelled']['arrElements']))
                        let currList =  hiddenJSON[boxes[j]]['unlabelled']['arrElements']
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
            if(conversion.hasOwnProperty(currKey)){
                console.log(conversion[currKey])
                //get number of the tube
                //let tubeNum = currKey.substring(4, currKey.indexOf("Id"));
                let shippedKey = '145971562'
                let missingKey = '258745303'
                let currJSON = specimenData[i][currKey];
                console.log('euiusvdisudvbgosidbvosidv '  + JSON.stringify(currJSON))

                if(currJSON.hasOwnProperty(shippedKey) && currJSON[shippedKey] == '353358909'){
                    if(conversion[currKey] != '0007'){
                        if(toExclude8.indexOf(conversion[currKey]) == -1){
                            console.log('here1')
                            list8.push(conversion[currKey]);
                        }
                    }
                    else{
                        if(toExclude9.indexOf(conversion[currKey]) == -1){
                            list9.push(conversion[currKey]);
                        }
                    }
                }
                else{
                    if(currJSON.hasOwnProperty(missingKey) && currJSON[missingKey] == '353358909'){
                        if(conversion[currKey] != '0007'){
                            if(toExclude8.indexOf(conversion[currKey]) == -1){
                                toExclude8.push(conversion[currKey])
                            }
                        }
                        else{
                            if(toExclude9.indexOf(conversion[currKey]) == -1){
                                toExclude9.push(conversion[currKey])
                            }
                        }
                    }
                    else{
                        if(conversion[currKey] != '0007'){
                            console.log('woiujebgisdubvgsdoiv: ' + conversion[currKey]);
                            console.log(JSON.stringify(currJSON))
                            console.log(currJSON[missingKey])
                            console.log(currJSON[shippedKey])
                            if(toExclude8.indexOf(conversion[currKey]) == -1){
                                console.log('here1')
                                list8.push(conversion[currKey]);
                            }
                        }
                        else{
                            if(toExclude9.indexOf(conversion[currKey]) == -1){
                                list9.push(conversion[currKey]);
                            }
                        }
                    }
                }
            }
        }
        console.log('toInclude/exclude' + specimenData[i]['820476880'])
        console.log(JSON.stringify(list8))
        console.log(JSON.stringify(list9))
        console.log(JSON.stringify(toExclude8))
        console.log(JSON.stringify(toExclude9))
        if(toExclude8.length > 0 && list8.length > 0 && specimenData[i].hasOwnProperty('820476880')){
            //add orphan tubes
            
            //toInsert[specimenData[i]['masterSpecimenId'] + ' 0008'] = list8
            if(!toReturn.hasOwnProperty('unlabelled')){
                //console.log(JSON.stringify(toReturn))
                toReturn['unlabelled'] = []
            }
            for(let j = 0; j < list8.length; j++){
                console.log('oipuwqabe vloi;uajgbdsvolisadujbvsaloidvubasdliuasdvb')
                console.log(list8[j]);
                console.log(JSON.stringify(toExcludeOrphans))
                if(!toExcludeOrphans.includes(list8[j])){
                    toReturn['unlabelled'].push(specimenData[i]['820476880'] + ' ' + list8[j])
                }
            }

        }
        if(toExclude9.length > 0 && list9.length > 0 && specimenData[i].hasOwnProperty('820476880')){
            
            if(!toReturn.hasOwnProperty('unlabelled')){
                //console.log(JSON.stringify(toReturn))
                toReturn['unlabelled'] = []
            }
            for(let j = 0; j < list9.length; j++){
                console.log('oipuwqabe vloi;uajgbdsvolisadujbvsaloidvubasdliuasdvb1')
                console.log(specimenData[i]['820476880'] + ' ' + list9[j]);
                if(!toExcludeOrphans.includes(list9[j])){
                    toReturn['unlabelled'].push(specimenData[i]['820476880'] + ' ' + list9[j])
                }
            }

        }
        if(toExclude8.length == 0 && list8.length > 0 && specimenData[i].hasOwnProperty('820476880')){
            toReturn[specimenData[i]['820476880'] + ' 0008'] = list8;
        }
        if(toExclude9.length == 0 && list9.length > 0 && specimenData[i].hasOwnProperty('820476880')){
            toReturn[specimenData[i]['820476880'] + ' 0009'] = list9;
        }
    }
    
    console.log('THIS IS THE TORETURN: ' + JSON.stringify(toReturn))
    return toReturn;
}

export const populateSpecimensList = async (hiddenJSON) => {
    let specimenObject = await getInstituteSpecimensList(hiddenJSON);
    let specimenData = await searchSpecimenInstitute();
    //let specimenData = response.data
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
        if(list[i] != "unlabelled"){
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

    if(orphansIndex != -1 && specimenObject['unlabelled'].length > 0){

        orphanPanel.style.display = 'block'
        specimenPanel.style.height = '400px'
        
        let toInsert = specimenObject['unlabelled'];
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
                showAnimation();
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
                console.log(currTubeId + 'foianbeoivbeoib')
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


                let response = await  getAllBoxes();
                let boxJSONS = response.data;
                let hiddenJSON = {};
                for(let i = 0; i < boxJSONS.length; i++){
                    let box = boxJSONS[i]
                    hiddenJSON[box['132929440']] = box['bags']
                }

                await populateSpecimensList(hiddenJSON);
                //delete bag from json
                hideAnimation();

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

    let currJSON = {};
    for(let i =0;i < hiddenJSON.length; i++){
        if(hiddenJSON[i]['132929440'] == boxId){
            console.log('91283ghr9iubgv0987g23bfouwegvo87weub')
            currJSON = hiddenJSON[i]
        }
    }
    console.log(JSON.stringify(currJSON))

    let newP = document.createElement("p");
    newP.innerHTML = boxId + " Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);

    let toInsertDate = ''
    if(currJSON.hasOwnProperty('672863981')){
        let dateStarted = Date.parse(currJSON['672863981'])
        
        let currentdate = new Date(dateStarted); 
        console.log('oaliwjbdvlicakjbdvoilasudvb ' + JSON.stringify(hiddenJSON))
        let ampm = parseInt(currentdate.getHours())/12 >= 1 ? "PM" : "AM"; 
        let hour = parseInt(currentdate.getHours())%12;
        toInsertDate =  (currentdate.getMonth()+1) + "/"
                        + currentdate.getDate()  + "/" 
                        + currentdate.getFullYear() + " "  
                        + hour.toString()+ ":"  
                        + currentdate.getMinutes() + ampm;

    }
    let toInsertDate2 = ''
    if(currJSON.hasOwnProperty('555611076')){
        let dateStarted = Date.parse(currJSON['555611076'])
        
        let currentdate = new Date(dateStarted); 
        console.log('oaliwjbdvlicakjbdvoilasudvb ' + JSON.stringify(hiddenJSON))
        let ampm = parseInt(currentdate.getHours())/12 >= 1 ? "PM" : "AM"; 
        let hour = parseInt(currentdate.getHours())%12;
        toInsertDate2 =  (currentdate.getMonth()+1) + "/"
                        + currentdate.getDate()  + "/" 
                        + currentdate.getFullYear() + " "  
                        + hour.toString()+ ":"  
                        + currentdate.getMinutes() + ampm;

    }
    newP = document.createElement("p");
    newP.innerHTML = "Date Started: " + toInsertDate;
    document.getElementById('boxManifestCol1').appendChild(newP);
    newP = document.createElement("p");
    newP.innerHTML = "Last Modified: " + toInsertDate2;
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

export const populateTempSelect = (boxes) => {
    let boxDiv = document.getElementById("tempCheckList");
    boxDiv.style.display = "block";
    boxDiv.innerHTML = `<p>Select the box that contains the temp monitor</p>
    <select name="tempBox" id="tempBox">`;

    let toPopulate = document.getElementById('tempBox')
    for(let i = 0; i<  boxes.length; i++){
        var opt = document.createElement("option");
        opt.value= boxes[i];
        opt.innerHTML = boxes[i]; 
     
        // then append it to the select element
        toPopulate.appendChild(opt);
    }
}

export const populateSaveTable = (hiddenJSON, boxJSONS, userName) => {
    let table = document.getElementById("saveTable");
    table.innerHTML = `<tr>
                        <th>To Ship</th>
                        <th>Started</th>
                        <th>Last Modified</th>
                        <th>Box Number</th>
                        <th>Location</th>
                        <th>Contents</th>
                        <th>View/Print Box Manifest</th>
                    </tr>`
    console.log(table.innerHTML)
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
            currRow.insertCell(0).innerHTML=`<input type="checkbox" class="markForShipping" style="transform: scale(1.5);">`
            let dateStarted = '';
            let lastModified = '';
            let thisLocation = '';

            for(let j = 0; j < boxJSONS.length; j++){
                console.log('BWVIBLOISD BGV LOIVBGWEOLVI WBGEVOLWIBVGDV' + boxJSONS[j]['132929440'])
                if(boxJSONS[j]['132929440'] == boxes[i]){
                    if(boxJSONS[j].hasOwnProperty('672863981')){
                        let timestamp = Date.parse(boxJSONS[j]['672863981']);
                        let newDate = new Date(timestamp);
                        let am = 'AM'
                        if(newDate.getHours() >= 12){
                            am = 'PM'
                        }
                        let minutesTag = newDate.getMinutes();
                        if(minutesTag < 10){
                            minutesTag = '0' + minutesTag;
                        }
                        dateStarted = (newDate.getMonth() + 1) + '/' + (newDate.getDate()) + '/' + newDate.getFullYear() + ' ' + ((newDate.getHours() + 11)%12 + 1) + ':' + minutesTag + ' ' + am;
                        //dateStarted = boxJSONS[j]['672863981'];
                    }
                    if(boxJSONS[j].hasOwnProperty('555611076')){
                        let timestamp = Date.parse(boxJSONS[j]['555611076']);
                        let newDate = new Date(timestamp);
                        let am = 'AM'
                        if(newDate.getHours() >= 12){
                            am = 'PM'
                        }
                        let minutesTag = newDate.getMinutes();
                        if(minutesTag < 10){
                            minutesTag = '0' + minutesTag;
                        }
                        lastModified = (newDate.getMonth() + 1) + '/' + (newDate.getDate()) + '/' + newDate.getFullYear() + ' ' + ((newDate.getHours() + 11)%12 + 1)  + ':' + minutesTag + ' ' + am;
                        //lastModified = boxJSONS[j]['555611076']

                    }
                    if(boxJSONS[j].hasOwnProperty('560975149')){
                        thisLocation = boxJSONS[j]['560975149'];
                    }
                }
            }
            currRow.insertCell(1).innerHTML= dateStarted;
            currRow.insertCell(2).innerHTML= lastModified;
            currRow.insertCell(3).innerHTML= boxes[i];
            currRow.insertCell(4).innerHTML = thisLocation;
            //get num tubes
            let currBox = hiddenJSON[boxes[i]];
            let numTubes = 0;
            let boxKeys=Object.keys(currBox);
            for(let j = 0; j < boxKeys.length; j++ ){
                numTubes += currBox[boxKeys[j]]['arrElements'].length;
            }
            currRow.insertCell(5).innerHTML= numTubes.toString() + " tubes";
            currRow.insertCell(6).innerHTML= '<input type="button" class="boxManifestButton" value = "Box Manifest"/>';
            
            //boxes[i]

            let currBoxButton = currRow.cells[6].getElementsByClassName("boxManifestButton")[0];
            
            currBoxButton.addEventListener("click", async e => {
                var index = e.target.parentNode.parentNode.rowIndex;
                var table = document.getElementById("shippingModalTable");
                //bring up edit on the corresponding table
                
                await boxManifest(boxes[i], userName);


                //addEventNavBarBoxManifest("viewBoxManifestBlood")
                //if(hiddenJSON[boxes[i]])
                //table.deleteRow(index);
            })
        }    
    }
    console.log('I was found here this many times!')
    console.log(table.innerHTML)
}

export const populateTempNotification = async () => {
    
    let checkDate = false;
    //let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('tempTubeReminder');
    if(checkDate == true){
        toToggle.style.display='block';
    }
    else{
        toToggle.style.display='none';
    }
}

export const populateTempCheck = async () => {
    let checkDate = false;
    //let checkDate = await getNextTempCheck();
    let toToggle = document.getElementById('checkForTemp');
    if(checkDate == true){
        toToggle.style.display='block';
    }
    else{
        toToggle.style.display='none';
    }
}

export const populateShippingManifestHeader = (hiddenJSON, userName, location, site) => {
    let column1 = document.getElementById("boxManifestCol1")
    let column2 = document.getElementById("boxManifestCol3")

    console.log('weoibnsoidvbsodlvibaoiwbgeoiv')
    console.log(JSON.stringify(hiddenJSON))

    console.log(JSON.stringify(hiddenJSON))
    let newP = document.createElement("p");
    newP.innerHTML = "Shipment Manifest";
    document.getElementById('boxManifestCol1').appendChild(newP);

    //let date = "";
    let currentdate = new Date(); 
    let ampm = parseInt(currentdate.getHours())/12 >= 1 ? "PM" : "AM"; 
    let hour = (currentdate.getHours() - 1 + 12)%12 + 1;
    let minutes = currentdate.getMinutes();
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    let datetime =  (currentdate.getMonth()+1) + "/"
                    + currentdate.getDate()  + "/" 
                    + currentdate.getFullYear() + " "  
                    + hour.toString()+ ":"  
                    + minutes + ampm;
    newP = document.createElement("p");
    newP.innerHTML = "Current Date/Time: " + datetime;
    document.getElementById('boxManifestCol1').appendChild(newP);
    
    newP = document.createElement("p");
    newP.innerHTML = "Sender: " + userName;
    document.getElementById('boxManifestCol1').appendChild(newP);

    newP = document.createElement("p");
    newP.innerHTML = "Site: " + site;
    document.getElementById('boxManifestCol3').appendChild(newP);

    newP = document.createElement("p");
    newP.innerHTML = "Location: " + location;
    document.getElementById('boxManifestCol3').appendChild(newP);

} 

export const populateShippingManifestBody = (hiddenJSON) =>{
    let table = document.getElementById("shippingManifestTable");
    let boxes = Object.keys(hiddenJSON);
    let currRowIndex = 1;
    let greyIndex = 0;
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
                if(hiddenJSON[boxes[i]][specimen].hasOwnProperty('scanner') && k == 0){
                    currRow.insertCell(3).innerHTML = hiddenJSON[boxes[i]][specimen]['scanner']
                }
                else{
                    currRow.insertCell(3).innerHTML = '';
                }
                if(greyIndex % 2 == 0){
                    currRow.style['background-color'] = "lightgrey";
                }
                
                currRowIndex+=1;
            
            }
                greyIndex += 1;
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

export const populateBoxSelectList = async (hiddenJSON, userName) => {
    let boxList = document.getElementById('selectBoxList');
    let selectBoxList = document.getElementById('selectBoxList');
    let list = ''
    console.log('iewjudbvoiduvb' + JSON.stringify(hiddenJSON));
    let keys = Object.keys(hiddenJSON).sort(compareBoxIds);
    for(let i = 0; i < keys.length; i++){
        list += '<option>' + keys[i] + '</option>';
    }
    if(list == ''){
        await addNewBox(userName);
        return;
    }
    boxList.innerHTML = list;

    let currBoxId = selectBoxList.value;
    if(currBoxId != ''){
    let currBox = hiddenJSON[currBoxId];
        
    
    //document.getElementById('BoxNumBlood').innerText = currBoxId;
    let toInsertTable = document.getElementById('currTubeTable')
    let boxKeys = Object.keys(currBox)
    toInsertTable.innerHTML = ` <tr>
                                    <th style = "border-bottom:1px solid;">Specimen Bag ID</th>
                                    <th style = "border-bottom:1px solid;">Full Specimen ID</th>
                                    <th style = "border-bottom:1px solid;">Type/Color</th>
                                    <th style = "border-bottom:1px solid;"></th>
                                </tr>`;
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
                    row.insertCell(3).innerHTML='<input type="button" class="delButton" value = "remove bag" style="margin-top:2px;margin-bottom:2px">';
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
                            hiddenJSON[box['132929440']] = box['bags']
                        }

                        await populateSpecimensList(hiddenJSON);
                        hiddenJSON = {};
                        for(let i = 0; i < boxJSONS.length; i++){
                            if(!boxJSONS[i].hasOwnProperty('145971562') || boxJSONS[i]['145971562'] != '353358909'){
                                let box = boxJSONS[i]
                                hiddenJSON[box['132929440']] = box['bags']
                            }
                        
                        }
                        await populateSaveTable(hiddenJSON, boxJSONS, userName)
                        hideAnimation();
                        //delete bag from json

                    })
                }

        }
    }
    }
    
}

const addNewBox = async  (userName) => {
    let response = await  getAllBoxes();
    let hiddenJSON = response.data;
    let locations = {};
    let keys = [];
    let largestOverall = 0;
    let largeIndex = -1;

    let largestLocation = 0;
    let largestLocationIndex = -1;
    let pageLocation = document.getElementById('selectLocationList').value;
    for(let i = 0; i < hiddenJSON.length; i++){
        let curr = parseInt(hiddenJSON[i]['132929440'].substring(3))
        let currLocation = hiddenJSON[i]['560975149']

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
        let lastBox = hiddenJSON[largeIndex]['132929440']
        if(Object.keys(hiddenJSON[largestLocationIndex]['bags']).length != 0){
            //add a new Box
            //create new Box Id
            let newBoxNum = parseInt(lastBox.substring(3)) + 1;
            let newBoxId = 'Box' + newBoxNum.toString();
            let toPass = {};
            toPass['132929440'] = newBoxId;
            toPass['bags'] = {};
            toPass['560975149'] = pageLocation;
            await storeBox(toPass);

            hiddenJSON.push({boxId:newBoxId, bags:{}, location:pageLocation})
            let boxJSONS = hiddenJSON;
            
            hiddenJSON = {};

            for(let i = 0; i < boxJSONS.length; i++){
                let box = boxJSONS[i]
                if(box['560975149'] == pageLocation){
                    hiddenJSON[box['132929440']] = box['bags']
                }
            }
            await populateBoxSelectList(hiddenJSON, userName)
        }
        else{
            //error (ask them to put something in the previous box first)
        }
    }
    else{
        //add a new Box
        //create new Box Id
        let lastBox = '1'
        if(largeIndex != -1){
            lastBox = hiddenJSON[largeIndex]['132929440']
        }
        let newBoxNum = parseInt(lastBox.substring(3)) + 1;
        console.log('xd')
        let newBoxId = 'Box' + newBoxNum.toString();
        let toPass = {};
        toPass['132929440'] = newBoxId;
        toPass['bags'] = {};
        toPass['560975149'] = pageLocation;
        await storeBox(toPass);

        hiddenJSON.push({boxId:newBoxId, bags:{}, location:pageLocation})
        let boxJSONS = hiddenJSON;
        
        hiddenJSON = {};

        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            if(box['560975149'] == pageLocation){
                hiddenJSON[box['132929440']] = box['bags']
            }
        }
        await populateBoxSelectList(hiddenJSON, userName)
        
    }

}

export const addEventAddBox = (userName) => {
    let boxButton = document.getElementById('addBoxButton');
    boxButton.addEventListener('click', async () => {
        showAnimation();
        await addNewBox(userName);
        let currLocation = document.getElementById('selectLocationList').value;
        let response = await getBoxesByLocation(currLocation);
        let boxJSONS = response.data;
        let hiddenJSONLocation = {};
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSONLocation[box['132929440']] = box['bags']
        }
        await populateBoxSelectList(hiddenJSONLocation,userName);
        hideAnimation()
    })
   

}

export const addEventModalAddBox = (userName) => {
    let boxButton = document.getElementById('modalAddBoxButton');
    
    boxButton.addEventListener('click', async () => {
        showAnimation();
        await addNewBox(userName);
        let currLocation = document.getElementById('selectLocationList').value;
        let response = await getBoxesByLocation(currLocation);
        let boxJSONS = response.data;
        let hiddenJSONLocation = {};
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSONLocation[box['132929440']] = box['bags']
        }
        await populateBoxSelectList(hiddenJSONLocation,userName);
        hideAnimation()
    })
   

}

export const populateTubeInBoxList = async (userName) => {
    let boxList = document.getElementById('selectBoxList');
    let selectBoxList = document.getElementById('selectBoxList');
    let currBoxId = selectBoxList.value;
    let response = await  getBoxes();
    let hiddenJSON = response.data;
    let currBox = {};
    for(let i = 0; i < hiddenJSON.length; i++){
        let currJSON = hiddenJSON[i];
        if(currJSON['132929440'] == currBoxId){
            currBox = currJSON.bags;
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
                    row.insertCell(3).innerHTML='<input type="button" class="delButton" value = "remove bag" style="margin-top:2px;margin-bottom:2px;">';
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
                            hiddenJSON[box['132929440']] = box['bags']
                        }

                        await populateSpecimensList(hiddenJSON);
                        hiddenJSON = {};
                        for(let i = 0; i < boxJSONS.length; i++){
                            if(!boxJSONS[i].hasOwnProperty('145971562') || boxJSONS[i]['145971562'] != '353358909'){
                                let box = boxJSONS[i]
                                hiddenJSON[box['132929440']] = box['bags']
                            }
                        
                        }
                        await populateSaveTable(hiddenJSON, boxJSONS, userName)
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

export const addEventChangeLocationSelect = (userName) => {
    let selectBoxList = document.getElementById('selectLocationList');
    selectBoxList.addEventListener("change",  async () => {
        showAnimation();
        let currLocation = selectBoxList.value;
        let boxJSONS = (await getBoxesByLocation(currLocation)).data;
        /*for(let i = 0; i < boxdata.length; i++){
            console.log(boxdata[i]['560975149'])
        }*/
        //let boxJSONS = response.data;
        let hiddenJSON = {};
        console.log(boxJSONS)
        for(let i = 0; i < boxJSONS.length; i++){
            let box = boxJSONS[i]
            hiddenJSON[box['132929440']] = box['bags']
        }
        await populateBoxSelectList(hiddenJSON, userName)
        //console.log(JSON.stringify(boxdata))
        hideAnimation();
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
        await storeSpecimen([specimenData]);
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
                formData['Connect_ID'] = connectId;
                formData['siteAcronym'] = document.getElementById('contentBody').dataset.siteAcronym;
                formData['token'] = radio.dataset.token;
                let query = `connectId=${parseInt(connectId)}`;
                showAnimation();
                const response = await findParticipant(query);
                const data = response.data[0];
                if(skipCheckIn) {
                    const collections = (await getParticipantCollections(data.token)).data;
                    specimenTemplate(data, formData, collections);
                }
                else checkInTemplate(data);
                hideAnimation();
            }
        })
    })
}

export const addEventCheckInCompleteForm = () => {
    const form = document.getElementById('checkInCompleteForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        let formData = {};
        formData['siteAcronym'] = document.getElementById('contentBody').dataset.siteAcronym;
        formData['962267121'] = new Date().toISOString();
        formData['135591601'] = 353358909;
        let query = `connectId=${parseInt(form.dataset.connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        const data = response.data[0];
        const collections = (await getParticipantCollections(data.token)).data;
        hideAnimation();
        specimenTemplate(data, formData, collections);
    })
};

export const addEventSpecimenLinkForm = formData => {
    const specimenSaveExit = document.getElementById('specimenSaveExit');
    const specimenContinue = document.getElementById('specimenContinue');
    const connectId = specimenSaveExit.dataset.connectId || specimenContinue.dataset.connectId;
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;
    specimenSaveExit.addEventListener('click', () => {
        btnsClicked(connectId, formData)
    });
}

export const addEventSpecimenLinkFormCntd = (formData) => {
    const form = document.getElementById('specimenLinkForm');
    const specimenSaveExit = document.getElementById('specimenSaveExit');
    const specimenContinue = document.getElementById('specimenContinue');
    const connectId = specimenSaveExit.dataset.connectId || specimenContinue.dataset.connectId;
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        btnsClicked(connectId, formData, true);
    });
};

const btnsClicked = async (connectId, formData, cont) => {
    removeAllErrors();
    const scanSpecimenID = document.getElementById('scanSpecimenID').value;
    const enterSpecimenID1 = document.getElementById('enterSpecimenID1').value;
    const enterSpecimenID2 = document.getElementById('enterSpecimenID2').value;
    const accessionID1 = document.getElementById('accessionID1');
    const accessionID2 = document.getElementById('accessionID2');
    const select = document.getElementById('biospecimenVisitType');
    let hasError = false;
    let focus = true;
    if(accessionID1 && accessionID1.value && !accessionID2.value && !accessionID2.classList.contains('disabled')) {
        hasError = true;
        errorMessage('accessionID2', 'Please re-type Accession ID from tube.', focus, true);
        focus = false;
    }
    else if(accessionID1 && accessionID1.value && accessionID2.value && accessionID1.value !== accessionID2.value) {
        hasError = true;
        errorMessage('accessionID2', 'Accession ID doesn\'t match', focus, true);
        focus = false;
    }
    if(scanSpecimenID && enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Provide either Scanned Collection ID or Manually typed.', focus, true);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Provide either Scanned Collection ID or Manually typed.', focus, true);
    }
    else if(!scanSpecimenID && !enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Scan Collection ID or Type in Manually', focus, true);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Scan Collection ID or Type in Manually', focus, true);
    }
    else if(scanSpecimenID && !enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(scanSpecimenID) || scanSpecimenID.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('scanSpecimenID', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, focus, true);
            focus = false;
        }
    }
    else if(!scanSpecimenID && enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(enterSpecimenID1) || enterSpecimenID1.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('enterSpecimenID1', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, focus, true);
            focus = false;
        }
        if(enterSpecimenID1 !== enterSpecimenID2) {
            hasError = true;
            errorMessage('enterSpecimenID2', 'Does not match with Manually Entered Collection ID', focus, true);
        }
    }
    if(hasError) return;

    if(document.getElementById('collectionLocation')) formData[getWorflow() === 'research' ? '951355211' : '525480516'] = parseInt(document.getElementById('collectionLocation').value);
    const collectionID = scanSpecimenID && scanSpecimenID !== "" ? scanSpecimenID : enterSpecimenID1;
    const r = confirm(`Is the Collection ID - ${collectionID} correct for the participant?`);
    if(!r) return;
    formData['820476880'] = collectionID;
    formData['650516960'] = getWorflow() === 'research' ? 534621077 : 664882224;
    if(enterSpecimenID1) formData['387108065'] = 353358909
    else formData['387108065'] = 104430631;
    if(accessionID1 && accessionID1.value) {
        formData['646899796'] = accessionID1.value;
        formData['148996099'] = 353358909;
    }
    if(select) formData['331584571'] = parseInt(select.value);
    formData['Connect_ID'] = parseInt(document.getElementById('specimenLinkForm').dataset.connectId);
    formData['token'] = document.getElementById('specimenLinkForm').dataset.participantToken;
    let query = `connectId=${parseInt(connectId)}`;
    showAnimation();
    const response = await findParticipant(query);
    const data = response.data[0];
    const specimenData = (await searchSpecimen(formData['820476880'])).data;
    hideAnimation();
    if(specimenData && specimenData.Connect_ID && parseInt(specimenData.Connect_ID) !== data.Connect_ID) {
        showNotifications({title: 'Collection ID Duplication', body: 'Entered Collection ID is already associated with a different connect ID.'}, true)
        return;
    }

    if(cont) {
        showAnimation();
        await storeSpecimen([formData]);
        const biospecimenData = (await searchSpecimen(formData['820476880'])).data;
        hideAnimation();
        tubeCollectedTemplate(data, biospecimenData);
    }
    else {
        showAnimation();
        await storeSpecimen([formData]);
        hideAnimation();
        searchTemplate();
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
        if(getWorflow() === 'research' && biospecimenData['678166505'] === undefined) biospecimenData['678166505'] = new Date().toISOString();
        checkboxes.forEach((dt) => {
            if(biospecimenData[`${dt.id}`] === undefined) biospecimenData[`${dt.id}`] = {};
            if(biospecimenData[dt.id] && biospecimenData[dt.id]['593843561'] === 353358909 && dt.checked === false) {
                biospecimenData[`${dt.id}`] = {};
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
        const siteTubesList = getSiteTubesLists(biospecimenData)
        const tubes = siteTubesList.filter(dt => dt.concept === input.id.replace('Id', ''));
        
        let value = getValue(`${input.id}`);
        const masterID = value.substr(0, masterSpecimenIDRequirement.length);
        const tubeID = value.substr(masterSpecimenIDRequirement.length + 1, totalCollectionIDLength);
        
        if(input.required && value.length !== totalCollectionIDLength) {
            hasError = true;
            errorMessage(input.id, `Combination of Collection ID and Full Specimen ID should be ${totalCollectionIDLength} characters long.`, focus);
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
        if(additionalTubeIDRequirement.regExp.test(tubeID))  data[`${input.id.replace('Id', '')}`]['226562200'] = 353358909;
        
        if(input.required) data[`${input.id.replace('Id', '')}`]['825582494'] = `${masterID} ${tubeID}`;
    });
    if(hasError) return;
    data['338570265'] = document.getElementById('collectionAdditionalNotes').value;
    Array.from(document.getElementsByClassName('tube-deviated')).forEach(dt => data[dt.id.replace('Deviated', '')]['678857215'] = dt.checked ? 353358909 : 104430631)
    
    showAnimation();
    
    if(cntd) {
        if(getWorflow() === 'clinical') {
            data['539197670'] = 353358909;
            if(data['915838974'] === undefined) data['915838974'] = new Date().toISOString();
        }
        await storeSpecimen([data]);
        const specimenData = (await searchSpecimen(biospecimenData['820476880'])).data;
        hideAnimation();
        explanationTemplate(dt, specimenData);
    }
    else {
        await storeSpecimen([data]);
        hideAnimation();
        searchTemplate();
    }
}

const getValue = (id) => document.getElementById(id).value.trim();

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

export const addEventExplanationFormCntd = (data, biospecimenData) => {
    const form = document.getElementById('explanationForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        explanationHandler(data, biospecimenData, true);
    });
}

export const addEventExplanationForm = (data, biospecimenData) => {
    const explanationSaveExit = document.getElementById('explanationSaveExit');
    explanationSaveExit.addEventListener('click', () => {
        explanationHandler(data, biospecimenData);
    });
}

const explanationHandler = async (data, biospecimenData, cntd) => {
    removeAllErrors();
    const masterSpecimenId = biospecimenData['820476880'];
    const textAreas = document.getElementsByClassName('additional-explanation');
    let hasError = false;
    let focus = true;
    Array.from(textAreas).forEach(ta => {
        const tubeId = ta.id.replace('Explanation','').replace('Deviated', '');
        if(document.getElementById(ta.id.replace('Explanation', 'Reason')).multiple) { // Deviation
            biospecimenData[tubeId]['248868659'] = Array.from(document.getElementById(ta.id.replace('Explanation', 'Reason'))).filter(el => el.selected).map(el => parseInt(el.value));
            biospecimenData[tubeId]['536710547'] = ta.value.trim();
            // Discard tube
            if(biospecimenData[tubeId]['248868659'].includes(472864016) || biospecimenData[tubeId]['248868659'].includes(956345366)) {
                biospecimenData[tubeId]['762124027'] = 353358909
            }
            else {
                biospecimenData[tubeId]['762124027'] = 104430631
            }
            if(biospecimenData[tubeId]['248868659'].includes(453343022) && !ta.value.trim()) { // If other is selected, make text area mandatory.
                hasError = true;
                errorMessage(ta.id, 'Please provide more details', focus);
                focus = false;
                return
            }
        }
        else { // Tubes not collected
            biospecimenData[tubeId]['883732523'] = parseInt(document.getElementById(ta.id.replace('Explanation', 'Reason')).value);
            biospecimenData[tubeId]['338286049'] = ta.value.trim();
            if(biospecimenData[tubeId]['883732523'] === 181769837 && !ta.value.trim()) {
                hasError = true;
                errorMessage(ta.id, 'Please provide more details', focus);
                focus = false;
                return;
            }
        }
    });
    if(hasError) return;
    showAnimation();
    await storeSpecimen([biospecimenData]);
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
    const masterSpecimenId = biospecimenData['820476880']
    let formData = {};
    biospecimenData['260133861'] = document.getElementById('finalizedAdditionalNotes').value;
    
    if(cntd) {
        biospecimenData['410912345'] = 353358909;
        biospecimenData['556788178'] = new Date().toISOString();
        showAnimation();
        await storeSpecimen([biospecimenData]);
        showNotifications({title: 'Specimen Finalized', body: 'Collection Finalized Successfully!'});
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        let query = `connectId=${parseInt(specimenData.Connect_ID)}`;
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

export const addEventNavBarShipment = (id, userName) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', async e => {
        e.stopPropagation();
        let navButton = document.getElementById('navBarShippingDash')
        if(navButton.classList.contains('active')) return;
        await startShipping(userName);
        
    });
}


export const addEventNavBarBoxManifest = (id, userName) => {
    const btn = document.getElementById(id);
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        if(id == 'viewBoxManifestBlood'){
            //return box 1 info
            boxManifest(document.getElementById('currTubeTable'), userName);
        }
        else if(id == 'viewBoxManifestMouthwash'){
            //return box 2 info
            boxManifest(document.getElementById('mouthwashList'), userName)
        }
    });
}

export const addEventNavBarShippingManifest = (userName, tempChecked) => {
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
        await shippingManifest(boxesToShip, userName, tempChecked);
    });
}

export const addEventReturnToShippingManifest = (element, hiddenJSON, userName, tempChecked) => {
    const btn = document.getElementById(element);
    document.getElementById(element).addEventListener('click', async e => {
        let boxesToShip = Object.keys(hiddenJSON)
        //return box 1 info
        await shippingManifest(boxesToShip, userName, tempChecked);
    });
}

export const addEventNavBarTracking = (element, userName, hiddenJSON, tempChecked) => {
    let btn = document.getElementById('navBarShipmentTracking');
    document.getElementById(element).addEventListener('click', async e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        let keys = Object.keys(hiddenJSON)
        for(let i = 0; i < keys.length; i++){
            hiddenJSON[keys[i]] = hiddenJSON[keys[i]]['specimens']
        }
        //return box 1 info
        shipmentTracking(hiddenJSON, userName, tempChecked);
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
            console.log('wpoeifhn;posdiuvgbhnasloidkvubnaslikovuhbasnvo ' + JSON.stringify(currBox[bags[i]]))
            if(currBox[bags[i]].hasOwnProperty('scanner') && j == 0){
                currRow.insertCell(3).innerHTML = currBox[bags[i]]['scanner'];
            }
            else{
                currRow.insertCell(3).innerHTML = '';
            }
            if(i % 2 == 0){
                currRow.style['background-color'] = "lightgrey";
            }
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
            startShipping(userName);
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
                    <strong>Address:</strong> ${data['521824358']}${data['442166669'] ? ` ${data['442166669']}`: ''} ${data['703385619']} ${data['634434746']} ${data['892050548']}
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

export const addEventClearScannedBarcode = (id) => {
    const clearInputBtn = document.getElementById(id);
    clearInputBtn.hidden = false;
    clearInputBtn.addEventListener('click', () => {
        clearInputBtn.dataset.enableInput.split(',').forEach(ele => disableInput(ele, false));
        document.getElementById(clearInputBtn.dataset.barcodeInput).value = '';
        clearInputBtn.hidden = true;
    });
}

export const addEventCntdToCollectProcess = () => {
    const btns = document.getElementsByClassName('continue-collect-process');
    Array.from(btns).forEach(btn => {
        btn.addEventListener('click', async () => {
            const connectID = btn.dataset.connectId;
            const collectionID = btn.dataset.collectionId;
            let query = `connectId=${parseInt(connectID)}`;
            showAnimation();
            const response = await findParticipant(query);
            const data = response.data[0];
            const specimenData = (await searchSpecimen(collectionID)).data;
            hideAnimation();
            tubeCollectedTemplate(data, specimenData);
        });
    })
}