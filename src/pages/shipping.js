import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization, removeActiveClass, addEventBarCodeScanner, storeBox, getBoxes, getAllBoxes, getBoxesByLocation, hideAnimation, showAnimation} from "./../shared.js"
import { addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventSelectParticipantForm, addEventAddSpecimenToBox, addEventNavBarSpecimenSearch, populateSpecimensList, addEventNavBarShipment, addEventNavBarBoxManifest, populateBoxManifestTable, populateBoxManifestHeader, populateSaveTable, populateShippingManifestBody,populateShippingManifestHeader, addEventNavBarShippingManifest, populateTrackingQuery, addEventCompleteButton, populateFinalCheck, populateBoxSelectList, addEventAddBox,addEventBoxSelectListChanged, populateModalSelect, addEventCompleteShippingButton, populateSelectLocationList, addEventChangeLocationSelect} from "./../events.js";
import { homeNavBar, bodyNavBar, shippingNavBar} from '../navbar.js';

export const shippingDashboard = (auth, route, goToSpecimenSearch) => {
    console.log('LMAO1')
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName);
            if(!role) return;
            startShipping();
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const startShipping = async () => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    let response = await  getBoxes();
    let boxJSONS = response.data;
    let hiddenJSON = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['boxId']] = box['bags']
    }


    response = await  getAllBoxes();
    boxJSONS = response.data;
    let hiddenJSON1 = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON1[box['boxId']] = box['bags']
    }
    
    
    /*
    if(document.getElementById('shippingHiddenTable') != null){
        hiddenJSON = JSON.parse(document.getElementById('shippingHiddenTable').innerText);
    }
*/
    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        
        <div class="row">
            Choose your location
            </div>
            <div class="row" style="margin-bottom:10px">
            <select class="selectpicker" id="selectLocationList">
                </select>
        </div>

        <div class="row">
            <div class="col-lg">
            To start packing the shipping boxes, scan specimen bag ID or Tube ID here:
                <div class="row form-row">
                    <form id="addSpecimenForm" method="POST" style="width:100%;">
                        <div class="form-group">
                            <input class="form-control" required type="text" id="masterSpecimenId" placeholder="Enter/Scan"/> <button class="barcode-btn" type="button" id="masterSpecimenIdBarCodeBtn" data-barcode-input="masterSpecimenId"><i class="fas fa-barcode"></i></button>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-outline-primary" data-toggle="modal" data-target="#shippingModal" data-backdrop="static">Add specimen to box</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            
        </div>
        <div class="row">
    <div class="col-sm">
    <div class="panel panel-default" style="border-style:solid;height:600px;border-width:1px;overflow:auto;">
            <table class = "table" style="width: 100%" id="specimenList" >
                <tr>
                    <th>Specimen Bag ID</th>
                    <th># Specimens</th>
                </th>
            </table>
    </div>
    </div>
    <div class="col-lg">
        <div class="row" style="margin-bottom:10px;">
            <div class="col" style="width:50%;float:left;">
                <select class="selectpicker" id="selectBoxList">
                </select>
            </div>
            <div class="col" style="width:50%;">
                <button type="button" class="btn btn-primary" style="float:right;" id="addBoxButton">Add Box</button>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto">
                <p id="BoxNumBlood"></p>
                    <table style="width: 100%;" id="currTubeTable">
                    </table>
                </div>
            </div>
        </div>
    </div>



    

    <!-- The Modal -->
    <div class="modal fade" id="shippingModal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content sub-div-shadow">
                <div class="modal-header" id="shippingModalHeader"></div>
                <div class="modal-body" id="shippingModalBody">
                </div>
                <div class="modal-body"> 
                    <h4>Which box this should be added to<h4>
                    <select class="selectpicker" id="shippingModalChooseBox">
                    </select>
                </div>
                <div class="modal-footer">
                   
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="addToBagButton">Save changes</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id="shippingModalCancel">Close</button>
                </div>  
            </div>
        </div>
    </div>
</div>

    </br>
    <div id="edit">
            <table  class="table" style="width:100%;border:1px solid;" id = "saveTable">
                <tr>
                    <th>To Ship</th>
                    <th>Started</th>
                    <th>Last Saved</th>
                    <th>Box Number</th>
                    <th>Contents</th>
                    <th>Box Manifest</th>
                </tr>
            </table>
    </div>
    <div class="row" style="margin-top:50px;margin-bottom:50px;">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;">
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging" style="margin:auto;display:block;">Packaging Complete</button>
            </div>
        </div>

    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    showAnimation();
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = shippingNavBar();
    const navBarBtn = document.getElementById('navBarShippingDash');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateSelectLocationList();
    
    populateSaveTable(hiddenJSON);
    await populateSpecimensList(hiddenJSON1);

    let currLocation = document.getElementById('selectLocationList').value;

    response = await getBoxesByLocation(currLocation);
    boxJSONS = response.data;
    let hiddenJSONLocation = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSONLocation[box['boxId']] = box['bags']
    }
    populateBoxSelectList(hiddenJSONLocation);

    addEventNavBarShipment("navBarShippingDash");
    addEventNavBarShippingManifest();
    addEventAddBox();
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest")
    addEventChangeLocationSelect();
    addEventAddSpecimenToBox();
    addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);

    hideAnimation();
    //addEventSubmitAddBag();
    
}

export const boxManifest = async (boxId) => {    

    let response = await  getBoxes();
    let boxJSONS = response.data;
    let hiddenJSON = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['boxId']] = box['bags']
    }

    /*
    let boxIds = Object.keys(hiddenJSON);
    console.log(boxIds);    
    for(let i = 0; i < boxIds.length; i++){
        let toPass = {};
        toPass['boxId'] = boxIds[i];
        toPass['bags'] = hiddenJSON[boxIds[i]]
        storeBox(toPass);
    }
    */
   

    let template = `
        </br>
        <div id="shippingHiddenTable" style="display:none">
            <table>

            </table>
        </div>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <p>Site</p>
                <p>NCI</p>
            </div>
        </div>
        <div class="row">
            <table id="boxManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Tube ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Type</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
                </tr>
            </table>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
            </div>
        </div>
        `;
    const navBarBtn = document.getElementById('navBarBoxManifest');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('navbar-btn', 'active')

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(hiddenJSON);
    
    addEventNavBarShipment("returnToPackaging");
    //document.getElementById('boxManifestTable').appendChild(result);
    populateBoxManifestHeader(boxId,hiddenJSON);
    populateBoxManifestTable(boxId,hiddenJSON);
    addEventNavBarShipment("returnToPackaging");
    addEventNavBarShippingManifest();
    //addEventNavBarShipment("navBarShippingDash");
    //addEventSelectParticipantForm();
    //addEventBackToSearch('backToSearch');
}



export const shippingManifest = async (boxesToShip) => {    

    let response = await  getBoxes();
    let boxJSONS = response.data;
    let hiddenJSON = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['boxId']] = box['bags']
    }

    let toDisplayJSON = {};
    for(let i = 0; i < boxesToShip.length; i++){
        let currBox = boxesToShip[i];
        toDisplayJSON[currBox] = hiddenJSON[currBox];
    }

    let template = `
        </br>
        <div id="shippingHiddenTable" style="display:none">
            <table>

            </table>
        </div>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <p>abc</p>
                <p>abc</p>
            </div>
        </div>
        <div class="row">
            <table id="shippingManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Box Number</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Tube ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
                </tr>
            </table>
        </div>
        
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Full Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging">Continue</button>
            </div>
        </div>`;
        /*
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging">Packaging Complete</button>
            </div>
        </div>
        `;*/
    const navBarBtn = document.getElementById('navBarShippingManifest');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    removeActiveClass('navbar-btn', 'active')

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(hiddenJSON);
    
    
    //document.getElementById('boxManifestTable').appendChild(result);
    
    populateShippingManifestHeader(toDisplayJSON);
    populateShippingManifestBody(toDisplayJSON);
    const btn = document.getElementById('completePackaging');
    document.getElementById('completePackaging').addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
            //return box 1 info
            shipmentTracking(toDisplayJSON);
    });
    //addEventNavBarShipment("navBarShippingDash");
    //addEventSelectParticipantForm();
    //addEventBackToSearch('backToSearch');
}


export const shipmentTracking = (hiddenJSON) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    
    /*
    let hiddenJSON = {};
    if(document.getElementById('shippingHiddenTable') != null){
        hiddenJSON = JSON.parse(document.getElementById('shippingHiddenTable').innerText);
    }
*/



    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg">
                Shipment Courier
                </br>
                <button type="submit" class="btn btn-outline-primary" id="chooseCourier">FedEx</button>
            </div>
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg">
                Shipment Tracking Numbers:
                </br>
                <div class="col-lg" id="forTrackingNumbers">
                    
                </div>
            </div>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Home</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Save and Exit</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completeTracking">Save and Continue</button>
            </div>
        </div>

    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = shippingNavBar();
    const navBarBtn = document.getElementById('navBarShipmentTracking');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    
    
    if(Object.keys(hiddenJSON).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON)
    }
    populateTrackingQuery(hiddenJSON);
    addEventCompleteButton(hiddenJSON);
    //addEventCompleteShippingButton(hiddenJSON);
    //addEventBackToSearch('navBarShippingDash');
    addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    //addEventSubmitAddBag();
}

export const finalShipmentTracking = (hiddenJSON) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg" id="numBoxes">
            </div>
        </div>
        <div class="row" style="margin-top:50px">
            <p>Shipment Courier: FedEx</p>
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
                </tr>
            </table>
        </div>
        
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Home</button>
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
                        Are you sure?
                    </div>
                    <div class="modal-body" id="finalizeModalBody">
                        
                    </div>
                    <div class="modal-body"> 
                        <h4>Please type in "Ship" to confirm: <h4>
                        <input type="text" id="finalizeSignInput">
                        </input>
                        <p id="finalizeModalError" style="color:red;display:none;">
                            *Please type in "Ship"
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
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = shippingNavBar();
    const navBarBtn = document.getElementById('navBarShipmentTracking');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    
    
    if(Object.keys(hiddenJSON).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON)
    }
    populateFinalCheck(hiddenJSON);
    addEventCompleteShippingButton(hiddenJSON);;
    addEventBackToSearch('navBarShippingDash');
    //addEventBackToSearch('navBarShippingDash');
    //addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    //addEventSubmitAddBag();
}