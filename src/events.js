import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant, removeActiveClass, errorMessage, removeAllErrors, storeSpecimen, searchSpecimen, generateBarCode, addEventBarCodeScanner, getIdToken, searchSpecimenInstitute} from './shared.js'
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { startShipping, boxManifest, shippingManifest, finalShipmentTracking} from './pages/shipping.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { collectProcessTemplate, tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { explanationTemplate } from './pages/explanation.js';
import { masterSpecimenIDRequirement } from './tubeValidation.js';

export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
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
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const masterSpecimenId = document.getElementById('masterSpecimenId').value;
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
        if(data.tube1Id === undefined) tubeCollectedTemplate(data, biospecimenData)
        else collectProcessTemplate(data, biospecimenData);
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
        //showAnimation();
        let mouthwashList = document.getElementById("mouthwashList")
        let bloodUrineList = document.getElementById("bloodUrineList")

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
                    <th>Tube Id</th>
                    <th>Type</th>
                    <th></th>
                </tr>
            </thead>
        </table>
        `;
        let masterIdSplit = masterSpecimenId.split(/\s+/);

        //get all ids from the hidden
        let shippingTable = document.getElementById('specimenList')
        let biospecimensList = []
        let tableIndex = -1;
        for(let i = 1; i < shippingTable.rows.length; i++){
            let currRow = shippingTable.rows[i];
            if(currRow.cells[0].innerText == masterSpecimenId){
                console.log(currRow.cells[2].innerText)
                tableIndex = i;
                biospecimensList = JSON.parse(currRow.cells[2].innerText)
                
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
        createShippingModalBody(biospecimensList, masterSpecimenId)
        addEventAddSpecimensToListModalButton(masterSpecimenId, tableIndex);
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
                bloodUrineList.add(option)
            }
        }

        for (var i=0; i<specimenList.length; i++) {
            if (specimenList.options[i].value == masterSpecimenId)
                specimenList.remove(i);
        }
        */
    })
}

export const createShippingModalBody = (biospecimensList, masterBiospecimenId) => {
    //let keys = Object.keys(biospecimenData)
    /*let tubes = [];
    for(let i = 0; i < biospecimensList.length; i++){
        let currData = biospecimenData[keys[i]];
        let re = /tube[0-9]*Id/
        if(biospecimensList[i].match(re) != null){
            tubes.push(biospecimenData[keys[i]]);
        }
    }*/
    let tubeTable = document.getElementById("shippingModalTable")
    let currSplit = masterBiospecimenId.split(/\s+/);
    let currBag = [];
    let empty = true;
    if(currSplit.length >= 2 && currSplit[1] == '0008'){
        //look for all non-moutwash (0007)
        for(let i = 0; i < biospecimensList.length; i++){
            if(biospecimensList[i] != '0007'){
                empty = false;
                currBag.push(biospecimensList[i])
                var rowCount = tubeTable.rows.length;
                var row = tubeTable.insertRow(rowCount);           
                row.insertCell(0).innerHTML= currSplit[0] + ' ' + biospecimensList[i];
                row.insertCell(1).innerHTML= "abc";
                row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "remove">';

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
                row.insertCell(1).innerHTML= "abc";
                row.insertCell(2).innerHTML= '<input type="button" class="delButton" value = "remove">';

                let currDeleteButton = row.cells[2].getElementsByClassName("delButton")[0];
                currDeleteButton.addEventListener("click", async e => {
                    var index = e.target.parentNode.parentNode.rowIndex;
                    var table = document.getElementById("shippingModalTable");
                    table.deleteRow(index);
                })
                
            }
        }
    }
    if(empty){
        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
        document.getElementById('shippingCloseButton').click();
        hideAnimation();
        return
    }
    
}

export const addEventAddSpecimensToListModalButton=(bagid, tableIndex)=>{
    let submitButton = document.getElementById('addToBagButton')
    submitButton.addEventListener('click', e =>{
        e.preventDefault();

        let hiddenJSON = {};
        let isBlood = true;
        if(document.getElementById('shippingHiddenTable') != null){
            hiddenJSON = JSON.parse(document.getElementById('shippingHiddenTable').innerText);
        }
        let nextBoxNum = Object.keys(hiddenJSON).length + 1;

        console.log('trigger')
        //push the things into the right box
        //first get all elements still left
        let tubeTable = document.getElementById("shippingModalTable");
        let numRows = tubeTable.rows.length;
        let toInsertTable = null;
        let bagSplit = bagid.split(/\s+/);
        let boxId = ""
        if(bagSplit.length >=2){
            if(bagSplit[1] == "0009"){
                //push into mouthwash table
                toInsertTable = document.getElementById("mouthwashList") 
                isBlood = false;
                if(document.getElementById('BoxNumMouthwash').innerText == ''){
                    boxId = "Box" + nextBoxNum.toString()
                    document.getElementById('BoxNumMouthwash').innerText = boxId
                }
                else{
                    boxId = document.getElementById('BoxNumMouthwash').innerText;
                }
            }
            else{
                toInsertTable = document.getElementById("bloodUrineList") 
                if(document.getElementById('BoxNumBlood').innerText == ''){
                    boxId = "Box" + nextBoxNum.toString()
                    document.getElementById('BoxNumBlood').innerText = boxId
                }
                else{
                    boxId = document.getElementById('BoxNumBlood').innerText;
                }

            }
        }

        let toDelete = [];

        for(let i = 1; i < numRows; i++){
            //get the first element (tube id) from the thingx
            let toAddId = tubeTable.rows[i].cells[0].innerText;
            let toAddType = tubeTable.rows[i].cells[1].innerText;
            var rowCount = toInsertTable.rows.length;
            var row = toInsertTable.insertRow(rowCount);           
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
            
            if(i == 1){
                row.insertCell(0).innerHTML=bagid
            }
            else{
                row.insertCell(0).innerHTML=""
            }
            row.insertCell(1).innerHTML= toAddId;
            row.insertCell(2).innerHTML= toAddType;
            row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';

            let currDeleteButton = row.cells[3].getElementsByClassName("delButton")[0];
            currDeleteButton.addEventListener("click", async e => {
                var index = e.target.parentNode.parentNode.rowIndex;
                var table = e.target.parentNode.parentNode.parentNode.parentNode;
                
                let currRow = table.rows[index];
                
                if(currRow.cells[0].innerText != ""){
                    if(index < table.rows.length-1){
                        if(table.rows[index + 1].cells[0].innerText ==""){
                            table.rows[index+1].cells[0].innerText = currRow.cells[0].innerText;
                        }
                    }
                }
                table.deleteRow(index);
                
                let boxes = Object.keys(hiddenJSON);
                for(let j = 0; j < boxes.length; j++){
                    if(hiddenJSON[boxes[j]].hasOwnProperty(bagid)){
                        let currObj = hiddenJSON[boxes[j]][bagid];
                        let currArr = currObj['arrElements'];
                        if(currArr.indexOf(toAddId) != -1){
                            currArr.splice(currArr.indexOf(toAddId), 1)
                            document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON);
                            document.getElementById('specimenList').innerHTML = ` <tr>
                                                                                    <th>Specimen Bag ID</th>
                                                                                    <th># Specimens</th>
                                                                                </th>`;
                            populateSpecimensList(hiddenJSON)
                        }
                    }
                }

            })

        }
        
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON);

        let shippingTable = document.getElementById('specimenList')
        let currArr = JSON.parse(shippingTable.rows[tableIndex].cells[2].innerText);
        for (let i = 0; i < toDelete.length; i++){
            let currDel = toDelete[i];
            console.log(currArr.indexOf(toDelete[i]))
            currArr.splice(currArr.indexOf(toDelete[i]),1);
        }
        console.log(currArr.length)
        if(currArr.length == 0){
            shippingTable.deleteRow(tableIndex);
        }
        else{
            shippingTable.rows[tableIndex].cells[2].innerText = JSON.stringify(currArr);
            shippingTable.rows[tableIndex].cells[1].innerText = currArr.length;
        }
        /*
        for(let i = 1; i < shippingTable.rows.length; i++){
            let currRow = shippingTable.rows[i];
            if(currRow.cells[0].innerText == masterSpecimenId){
                console.log(currRow.cells[2].innerText)
                tableIndex = i;
                biospecimensList = JSON.parse(currRow.cells[2].innerText)
                
            }
        }*/
        //e.target.removeEventListener('click');
    },{once:true})
    //ppulateSpecimensList();
}

export const getInstituteSpecimensList = async(hiddenJSON) => {
    const response = await searchSpecimenInstitute();
    let specimenData = response.data;
    console.log(JSON.stringify(specimenData))
    let toReturn = {};
    console.log(JSON.stringify(hiddenJSON))
    for(let i = 0; i < specimenData.length; i++){
        let toExclude8 = [];
        let toExclude9 = [];
        if(specimenData[i].hasOwnProperty('masterSpecimenId')){
            let boxes = Object.keys(hiddenJSON);
            for(let j = 0; j < boxes.length; j++){
                let specimens = Object.keys(hiddenJSON[boxes[j]]);
                console.log(specimens)
                console.log(specimenData[i]['masterSpecimenId'])
                if(specimens.includes(specimenData[i]['masterSpecimenId'] + ' 0008')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['masterSpecimenId'] + ' 0008')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude8.push(currList[k].split(/\s+/)[1]);
                    }
                }
                if(specimens.includes(specimenData[i]['masterSpecimenId'] + ' 0009')){
                    let currList =  hiddenJSON[boxes[j]][specimens[specimens.indexOf(specimenData[i]['masterSpecimenId'] + ' 0000')]]['arrElements']
                    for(let k = 0; k < currList.length; k++){
                        toExclude9.push(currList[k].split(/\s+/)[1]);
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
                if(shippedKey != -1){
                    if(specimenData[i][keys[shippedKey]] == false){
                        if(specimenData[i][currKey] != '0007'){
                            
                            if(toExclude8.indexOf(specimenData[i][currKey]) == -1){
                                list8.push(specimenData[i][currKey])
                            }
                        }
                        else{
                            console.log(toExclude9);
                            console.log(specimenData[i][currKey])
                            console.log(toExclude9.indexOf(specimenData[i][currKey]))
                            if(toExclude9.indexOf(specimenData[i][currKey]) == -1){
                                list9.push(specimenData[i][currKey]);
                            }
                        }
                    }
                }
            }
        }
        if(list8.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            toReturn[specimenData[i]['masterSpecimenId'] + ' 0008'] = list8;
        }
        if(list9.length > 0 && specimenData[i].hasOwnProperty('masterSpecimenId')){
            toReturn[specimenData[i]['masterSpecimenId'] + ' 0009'] = list9;
        }
    }
    return toReturn;
}

export const populateSpecimensList = async (hiddenJSON) => {
    let specimenObject = await getInstituteSpecimensList(hiddenJSON);
    showAnimation();
    const response = await searchSpecimenInstitute();
    let specimenData = response.data
    for(let i = 0; i < specimenData.length; i++){
        //let specimenData = 
        
    }
    let list = Object.keys(specimenObject);
    //console.log(JSON.stringify(curr));
    //let list = ["KW123456 0008", "KW123456 0009"]
    list.sort();
    
    var specimenList = document.getElementById("specimenList");

    

    for(let i = 0; i < list.length; i++){
        var rowCount = specimenList.rows.length;
        var row = specimenList.insertRow(rowCount);           
        row.insertCell(0).innerHTML= list[i];
        row.insertCell(1).innerHTML = specimenObject[list[i]].length;
        let hiddenChannel = row.insertCell(2)
        hiddenChannel.innerHTML = JSON.stringify(specimenObject[list[i]]);
        hiddenChannel.style.display = "none";
    }
    hideAnimation();
    /*
    for(let i = 0; i < list.length; i++){
        var option = document.createElement("option");
        option.text = list[i];
        specimenList.add(option)
    }*/

}

export const populateBoxManifestHeader= (result) => {
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

export const populateSaveTable = (hiddenJSON) => {
    let table = document.getElementById("saveTable");
    let boxes = Object.keys(hiddenJSON)
    for(let i = 0; i < boxes.length; i++){
        let currRow = table.insertRow(i+1);
        currRow.insertCell(0).innerHTML= '';
        currRow.insertCell(1).innerHTML= '';
        currRow.insertCell(2).innerHTML= boxes[i];
        //get num tubes
        let currBox = hiddenJSON[boxes[i]];
        let numTubes = 0;
        let boxKeys=Object.keys(currBox);
        for(let j = 0; j < boxKeys.length; j++ ){
            numTubes += currBox[boxKeys[j]]['arrElements'].length;
        }
        currRow.insertCell(3).innerHTML= numTubes.toString() + " tubes";
        currRow.insertCell(4).innerHTML= '<input type="button" class="editButton" value = "Edit">';
        let currEditButton = currRow.cells[4].getElementsByClassName("editButton")[0];
        currEditButton.addEventListener("click", async e => {
            var index = e.target.parentNode.parentNode.rowIndex;
            var table = document.getElementById("shippingModalTable");
            //bring up edit on the corresponding table
            let currBox = hiddenJSON[boxes[i]];
            document.getElementById('BoxNumBlood').innerText = boxes[i];
            let toInsertTable = document.getElementById('bloodUrineList')
            if(boxKeys.length > 0 && boxKeys[0]['isBlood'] == false){
                toInsertTable = document.getElementById('mouthwashList')
            }
            toInsertTable.innerText = '';
            //set the rest of the table up
            for(let j = 0; j < boxKeys.length; j++){
                let currBagId = boxKeys[j];
                let currTubes = currBox[boxKeys[j]]['arrElements'];
                
                for(let k = 0; k < currTubes.length; k++){

                        //get the first element (tube id) from the thingx
                        let toAddId = currTubes[k];
                        let toAddType = 'abc';
                        var rowCount = toInsertTable.rows.length;
                        var row = toInsertTable.insertRow(rowCount);           
                        
                        if(i == 1){
                            row.insertCell(0).innerHTML=bagid
                        }
                        else{
                            row.insertCell(0).innerHTML=""
                        }
                        row.insertCell(1).innerHTML= toAddId;
                        row.insertCell(2).innerHTML= toAddType;
                        row.insertCell(3).innerHTML= '<input type="button" class="delButton" value = "remove">';
            
                        let currDeleteButton = row.cells[3].getElementsByClassName("delButton")[0];
                        currDeleteButton.addEventListener("click", async e => {
                            var index = e.target.parentNode.parentNode.rowIndex;
                            var table = e.target.parentNode.parentNode.parentNode.parentNode;
                            
                            let currRow = table.rows[index];
                            
                            if(currRow.cells[0].innerText != ""){
                                if(index < table.rows.length-1){
                                    if(table.rows[index + 1].cells[0].innerText ==""){
                                        table.rows[index+1].cells[0].innerText = currRow.cells[0].innerText;
                                    }
                                }
                            }
                            table.deleteRow(index);
                        })
                }
            }
            


            //if(hiddenJSON[boxes[i]])
            //table.deleteRow(index);
        })
        //boxes[i]
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
                console.log(currRowIndex)
                currRowIndex+=1;
            
            }

        }

    }
}

export const addEventBackToSearch = (id) => {
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        searchTemplate();
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
                    <input class="form-control" required type="name" id="userName" placeholder="Enter name"/>
                </div>
                <div class="form-group">
                    <label class="col-form-label search-label">Email</label>
                    <input class="form-control" required type="email" id="userEmail" placeholder="Enter name"/>
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

export const addEventSelectParticipantForm = () => {
    const form = document.getElementById('selectParticipant');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const radios = document.getElementsByName('selectParticipant');
        Array.from(radios).forEach(async radio => {
            if(radio.checked) {
                const connectId = radio.value;
                let query = `connectId=${parseInt(connectId)}`;
                showAnimation();
                const response = await findParticipant(query);
                hideAnimation();
                const data = response.data[0];
                removeActiveClass('navbar-btn', 'active')
                const navBarBtn = document.getElementById('navBarParticipantCheckIn');
                navBarBtn.classList.remove('disabled');
                navBarBtn.classList.add('active');
                document.getElementById('contentBody').innerHTML = checkInTemplate(data);
                generateBarCode('connectIdBarCode', data.Connect_ID);
                addEventContactInformationModal(data);
                addEventBackToSearch('navBarSearch');
                addEventBackToSearch('checkInExit');
                addEventCheckInCompleteForm();
            }
        })
    })
}

const addEventCheckInCompleteForm = () => {
    const form = document.getElementById('checkInCompleteForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        let formData = {};
        const select = document.getElementById('biospecimenVisitType');
        const connectId = parseInt(select.dataset.connectId);
        const biospecimenVisitType = select.value;
        const token = select.dataset.participantToken;
        formData['connectId'] = connectId;
        formData['visitType'] = biospecimenVisitType;
        formData['checkedInAt'] = new Date().toISOString();
        formData['token'] = token;
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        removeActiveClass('navbar-btn', 'active')
        const navBarBtn = document.getElementById('navBarSpecimenLink');
        navBarBtn.classList.remove('disabled');
        navBarBtn.classList.add('active');
        document.getElementById('contentBody').innerHTML = specimenTemplate(data, formData);
        addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, 9, 0);
        generateBarCode('connectIdBarCode', data.Connect_ID);
        addEventSpecimenLinkForm(formData);
        addEventNavBarParticipantCheckIn();
    })
};

const addEventSpecimenLinkForm = (formData) => {
    const form = document.getElementById('specimenLinkForm');
    const specimenSaveExit = document.getElementById('specimenSaveExit');
    const specimenContinue = document.getElementById('specimenContinue');
    const connectId = specimenSaveExit.dataset.connectId || specimenContinue.dataset.connectId;
    document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;
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
        errorMessage('scanSpecimenID', 'Please Provide either Scanned Specimen ID or Manually typed.', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Provide either Scanned Specimen ID or Manually typed.', focus);
        return;
    }
    else if(!scanSpecimenID && !enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Scan Master Specimen ID or Type in Manually', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Scan Master Specimen ID or Type in Manually', focus);
        return;
    }
    else if(scanSpecimenID && !enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(scanSpecimenID) || scanSpecimenID.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('scanSpecimenID', 'Specimen ID must be 9 characters long and in CXA123456 format.', focus);
            focus = false;
            return;
        }
    }
    else if(!scanSpecimenID && enterSpecimenID1) {
        if(!masterSpecimenIDRequirement.regExp.test(enterSpecimenID1) || enterSpecimenID1.length !== masterSpecimenIDRequirement.length) {
            hasError = true;
            errorMessage('enterSpecimenID1', 'Specimen ID must be 9 characters long and in CXA123456 format.', focus);
            focus = false;
            return;
        }
        if(enterSpecimenID1 !== enterSpecimenID2) {
            hasError = true;
            errorMessage('enterSpecimenID2', 'Does not match with Manually Entered Specimen ID', focus);
            return;
        }
    }
    formData['masterSpecimenId'] = scanSpecimenID ? scanSpecimenID : enterSpecimenID1;
    
    let query = `connectId=${parseInt(connectId)}`;
    showAnimation();
    const response = await findParticipant(query);
    const data = response.data[0];
    const specimenData = (await searchSpecimen(formData['masterSpecimenId'])).data;
    hideAnimation();
    if(cont) {
        if(specimenData && specimenData.connectId && specimenData.connectId !== data.Connect_ID) {
            showNotifications({title: 'Master Specimen Id Duplication', body: 'Entered master specimen Id is already associated with a different connect Id.'}, true)
        }
        else {
            showAnimation();
            await storeSpecimen([formData]);
            hideAnimation();
            tubeCollectedTemplate(data, specimenData ? specimenData : formData);
        }
    }
    else {
        if(specimenData && specimenData.connectId && specimenData.connectId !== data.Connect_ID) {
            showNotifications({title: 'Master Specimen Id Duplication', body: 'Entered master specimen Id is already associated with a different connect Id.'}, true)
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
        if(!isChecked('tube1Collected') && !isChecked('tube2Collected') && !isChecked('tube3Collected') && !isChecked('tube4Collected') && !isChecked('tube5Collected') && !isChecked('tube6Collected') && !isChecked('tube7Collected')) return;
        showAnimation();
        const biospecimenData = (await searchSpecimen(masterSpecimenId)).data;
        if(biospecimenData.tubeCollectedAt === undefined) biospecimenData['tubeCollectedAt'] = new Date().toISOString();
        Array.from(document.getElementsByClassName('tube-collected')).forEach((dt, index) => {
            biospecimenData[`tube${index+1}Collected`] = dt.checked
            if(!dt.checked) {
                biospecimenData[`tube${index+1}Id`] = '';
            }
        })
        await storeSpecimen([biospecimenData]);
        hideAnimation();
        collectProcessTemplate(data, biospecimenData);
    })
}

const collectionSubmission = async (dt, biospecimenData, cntd) => {
    const data = {};
    const tube1Id = getValue('tube1Id');
    const tube2Id = getValue('tube2Id');
    const tube3Id = getValue('tube3Id');
    const tube4Id = getValue('tube4Id');
    const tube5Id = getValue('tube5Id');
    const tube6Id = getValue('tube6Id');
    const tube7Id = getValue('tube7Id');

    data['tube1Id'] = tube1Id;
    data['tube2Id'] = tube2Id;
    data['tube3Id'] = tube3Id;
    data['tube4Id'] = tube4Id;
    data['tube5Id'] = tube5Id;
    data['tube6Id'] = tube6Id;
    data['tube7Id'] = tube7Id;
    
    data['collectionAdditionalNotes'] = document.getElementById('collectionAdditionalNotes').value;
    Array.from(document.getElementsByClassName('tube-deviated')).forEach((dt, index) => data[`tube${index+1}Deviated`] = dt.checked)
    
    
    if(biospecimenData.masterSpecimenId) data['masterSpecimenId'] = biospecimenData.masterSpecimenId;
    showAnimation();
    await storeSpecimen([data]);
    if(cntd) {
        const specimenData = (await searchSpecimen(biospecimenData.masterSpecimenId)).data;
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

const addEventNavBarParticipantCheckIn = () => {
    const btn = document.getElementById('navBarParticipantCheckIn');
    btn.addEventListener('click', async () => {
        const connectId = btn.dataset.connectId;
        if(!connectId) return;
        removeActiveClass('navbar-btn', 'active')
        btn.classList.remove('disabled');
        btn.classList.add('active');
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        document.getElementById('contentBody').innerHTML = checkInTemplate(data);
        generateBarCode('connectIdBarCode', data.Connect_ID);
        addEventContactInformationModal(data);
        addEventBackToSearch('navBarSearch');
        addEventBackToSearch('checkInExit');
        addEventCheckInCompleteForm();
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
        if(ta.id.includes('tube1Collected') || ta.id.includes('tube2Collected') || ta.id.includes('tube3Collected') || ta.id.includes('tube4Collected') || ta.id.includes('tube5Collected')) {
            formData['bloodTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['bloodTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('tube6Collected')) {
            formData['urineTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['urineTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('tube7Collected')) {
            formData['mouthWashTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['mouthWashTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('Deviated')) {
            formData[ta.id] = ta.value;
            const tmpId = ta.id.replace('Explanation', 'Reason');
            formData[tmpId] = Array.from(document.getElementById(tmpId).options).filter(el => el.selected).map(el => el.value);
        }
    });
    formData['masterSpecimenId'] = masterSpecimenId;
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
    const form = document.getElementById('finalizeForm');
    const finalizedSaveExit = document.getElementById('finalizedSaveExit');
    const finalizedContinue = document.getElementById('finalizedContinue');

    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    finalizedSaveExit.addEventListener('click', () => {
        finalizeHandler(data, masterSpecimenId);
    });
    finalizedContinue.addEventListener('click', () => {
        finalizeHandler(data, masterSpecimenId, true);
    });
}

const finalizeHandler = async (data, masterSpecimenId, cntd) => {
    let formData = {};
    formData['finalizedAdditionalNotes'] = document.getElementById('finalizedAdditionalNotes').value;
    formData['masterSpecimenId'] = masterSpecimenId;
    if(cntd) {
        formData['finalized'] = true;
        formData['finalizedAt'] = new Date().toISOString();
        showAnimation();
        await storeSpecimen([formData]);
        hideAnimation();
        showNotifications({title: 'Specimen Finalized', body: 'Specimen finalized successfully!'});
        searchTemplate();
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
    btn.addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        startShipping();
    });
}


export const addEventNavBarBoxManifest = (id) => {
    const btn = document.getElementById(id);
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        if(id == 'viewBoxManifestBlood'){
            //return box 1 info
            boxManifest(document.getElementById('bloodUrineList'));
        }
        else if(id == 'viewBoxManifestMouthwash'){
            //return box 2 info
            boxManifest(document.getElementById('mouthwashList'))
        }
    });
}

export const addEventNavBarShippingManifest = () => {
    const btn = document.getElementById('completePackaging');
    document.getElementById('completePackaging').addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
            //return box 1 info
            shippingManifest();
    });
}


export const populateBoxManifestTable = (result) => {
    let currTable = document.getElementById('boxManifestTable');
    
    let rows = result.rows;
    console.log(rows)
    for(let i = 0; i < rows.length; i++){
        let currRow = currTable.insertRow(i+1);
        let row = rows[i];   
        currRow.insertCell(0).innerHTML= row.cells[0].innerText;
        currRow.insertCell(1).innerHTML= row.cells[1].innerText;
        currRow.insertCell(2).innerHTML= row.cells[2].innerText;
    }
    
}

export const populateTrackingQuery = (hiddenJSON) => {
    let boxes = Object.keys(hiddenJSON);
    let toBeInnerHTML = ""
    for(let i = 0; i < boxes.length; i++){
        toBeInnerHTML += `
                            <div class="form-group" style="margin-top:30px">
                                <label style="float:left;margin-top:5px">`+ boxes[i] +`</label>
                                <div style="float:left;margin-left:30px">
                                    <input class="form-control" type="text" id="` + boxes[i] + 'trackingId' + `" placeholder="Enter/Scan Tracking Number"/> <button class="barcode-btn" type="button" id="masterSpecimenIdBarCodeBtn" data-barcode-input="masterSpecimenId"><i class="fas fa-barcode"></i></button>
                                </div>
                            </div>`
    }
    document.getElementById("forTrackingNumbers").innerHTML = toBeInnerHTML;
}

export const addEventCompleteButton = (hiddenJSON) => {
    document.getElementById('completeTracking').addEventListener('click', () =>{
        let boxes = Object.keys(hiddenJSON);
    
        for(let i = 0; i < boxes.length; i++){
            let boxi = document.getElementById(boxes[i] + "trackingId").value;
            hiddenJSON[boxes[i]] = {trackingId:boxi, specimens:hiddenJSON[boxes[i]]}
        }
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON);
        finalShipmentTracking();
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

const addEventContactInformationModal = (data) => {
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
