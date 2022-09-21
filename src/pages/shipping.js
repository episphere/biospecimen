import { userAuthorization, removeActiveClass, addEventBarCodeScanner, getBoxes, getAllBoxes, getBoxesByLocation, hideAnimation, showAnimation, showNotifications, getPage, shippingPrintManifestReminder, siteSpecificLocationToConceptId, locationConceptIDToLocationMap, conceptIdToSiteSpecificLocation} from "./../shared.js"
import { addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventAddSpecimenToBox, addEventNavBarSpecimenSearch, 
    populateSpecimensList, addEventNavBarShipment, addEventNavBarBoxManifest, populateBoxManifestTable, populateBoxManifestHeader, populateSaveTable, populateShippingManifestBody,populateShippingManifestHeader, addEventNavBarShippingManifest, populateTrackingQuery, addEventCompleteButton, populateFinalCheck, populateBoxSelectList, addEventBoxSelectListChanged, populateModalSelect, addEventCompleteShippingButton, populateSelectLocationList, 
    addEventChangeLocationSelect, addEventModalAddBox, populateTempNotification, populateTempCheck, populateTempSelect, addEventNavBarTracking, addEventReturnToReviewShipmentContents, populateCourierBox, addEventSaveButton, addEventTrimTrackingNums, addEventCheckValidTrackInputs, addEventPreventTrackingConfirmPaste, addEventSaveContinue, addEventShipPrintManifest, } from "./../events.js";
import { homeNavBar, bodyNavBar, shippingNavBar, unAuthorizedUser} from '../navbar.js';
import conceptIds from '../fieldToConceptIdMapping.js';

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
    "958646668":"0013",
    "677469051":"0014",
    "683613884":"0024",
}

export const shippingDashboard = (auth, route, goToSpecimenSearch) => {  
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


export const startShipping = async (userName) => {
    showAnimation();
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let response = await  getBoxes();  // get un-shipped boxes
    let boxList_unshipped = response.data;
    let boxIdAndBags_unshipped = {}; // for transformed box data structure

    //boxIdAndBags-->{"Box1":{"CXA123423 0008:{...}}, "unlabelled":{...}, "Box2":{...}}
    for (const box of boxList_unshipped) {
      const boxId = box[conceptIds.shippingBoxId];
      boxIdAndBags_unshipped[boxId] = box['bags'];
    }

    console.log('boxIdAndBags', boxIdAndBags_unshipped)

    response = await  getAllBoxes();
    const boxList_all = response.data;
    let boxIdAndBags_all = {};
    for (const box of boxList_all) {
        const boxId = box[conceptIds.shippingBoxId];
        boxIdAndBags_all[boxId] = box['bags']
    }
    console.log('all boxes', boxIdAndBags_all);

    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        
        <div class="row">
            <div class="col-lg">
                <h5>Choose your shipping location</h5>
            </div>
        </div>
        <div class="row" style="margin-bottom:10px">
            <div class = "col-lg">
                <select class="selectpicker" id="selectLocationList" style="padding:.25rem">
                </select>
            </div>
        </div>

        <div class="row" style="margin:0;">
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
                </div>
            </div>
        </div>
        <div class="row">
            
        </div>
        <div class="row">
    <div class="col-5">

    <h4 style="text-align:center; margin-bottom:1rem;">Available Collections</h4>
    <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto;" id="specimenPanel">
            <table class = "table" style="width: 100%;margin-bottom:0px;" id="specimenList" >
                <tr>
                    <th>Specimen Bag ID</th>
                    <th># Specimens in Bag</th>
                </tr>
            </table>
    </div>

    <div class="panel panel-default" style="position:absolute; border-style:solid;height:0px;border-width:1px;overflow:auto; top:-100000px; " id="orphansPanel">
            <table class = "table" style="width: 100%; margin-bottom:0px;" id="orphansList" >
                
            </table>
    </div>
    </div>
    <div class="col-7">
        <div style="display:flex; justify-content:space-evenly; align-items:center; margin-bottom:.625rem;">
            <div>
                <h4>View Shipping Box Contents</h4>
            </div>
            <div>
                <select class="selectpicker" id="selectBoxList" name="box-ids" style="padding:0.25rem">
                </select>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto">
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
                    <h4 style="margin-bottom:0.8rem">Select Box or Create New Box</h4>
                    <div id="create-box-success" class="alert alert-success" role="alert" style="display:none;">
                      New box has been created
                    </div>
                    <div id="create-box-error" class="alert alert-danger" role="alert" style="display:none;">
                      Please add a specimen or specimens to last box
                    </div>
                    <select class="selectpicker" id="shippingModalChooseBox" data-new-box="" style="font-size:1.4rem;"></select>
                    <button type="button" class="btn btn-primary" id="modalAddBoxButton">Create New Box</button>
                    
                </div>
                <div class="modal-footer">
                   
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="addToBagButton">Add to Box</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id="shippingModalCancel">Cancel</button>
                </div>  
            </div>
        </div>
    </div>
</div>

    </br>
    <div id="tempTubeReminder" style="color:red;display:none;">
        <p>
            Please put a temperature monitor in the box for shipping
        </p>
    </div>
    <div id="edit">
        <div class="row" style="margin-bottom:.5rem">
          <div class="col-9 no-gutters">
            <h4 style="text-align:start;">Select one or more boxes to ship</h4>
          </div>
          <div class="col-3 no-gutters">
          <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging" style="margin:auto;display:block;">Continue to Review Shipment Contents</button>
          </div>
        </div>
        <div style="border: 1px solid black; overflow: auto; margin-bottom: 0.5rem; height: 400px;">
            <table  class="table table-bordered" style="width:100%;border:1px solid;" id = "saveTable">
            </table>
        </div>
    </div>
    <div class="row" id="checkForTemp">
        <div class="col-lg">
            <input type="checkbox" id="tempMonitorChecked" style="transform: scale(1.5); margin-right:10px; margin-top:5px; margin-left:5px;" checked>
            <label for="tempMonitorChecked">Temperature Monitor is included in this shipment</label><br>
        </div>
    </div>
    `;

    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShippingDash');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateSelectLocationList();
    
    await populateSaveTable(boxIdAndBags_unshipped, boxList_all, userName);
    await populateSpecimensList(boxIdAndBags_all);

    let currLocation = document.getElementById('selectLocationList').value;
    if (currLocation !== 'none') { 
        let currLocationConceptId = siteSpecificLocationToConceptId[currLocation]
        response = await getBoxesByLocation(currLocationConceptId);
        boxList_all = response.data;
        let boxIdAndBags = {};
        for (const box of boxList_all) {
            const boxId = box[conceptIds.shippingBoxId];
            boxIdAndBags[boxId] = box['bags']
        }
        await populateBoxSelectList(boxIdAndBags,userName);
    };

    let tempMonitorCheckedEl = document.getElementById('tempMonitorChecked')
    
    await populateTempNotification();
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarShippingManifest(userName, tempMonitorCheckedEl);
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest", userName)
    addEventChangeLocationSelect(userName);
    addEventAddSpecimenToBox(userName);
    // addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 14, 0);
    addEventModalAddBox(userName);
    hideAnimation();
    //addEventSubmitAddBag();
}

export const boxManifest = async (boxId, userName) => {    
    showAnimation();
    let response = await  getBoxes();
    let boxList = response.data;

    let currBox = {}
    let boxIdAndBags = {};
    for(let i = 0; i < boxList.length; i++){
        let box = boxList[i]
        if(box['132929440'] == boxId){
            currBox = box;
        }
        boxIdAndBags[box['132929440']] = box['bags']
    }
    let currInstitute = currBox.siteAcronym;
    let currLocation = locationConceptIDToLocationMap[currBox['560975149']]["siteSpecificLocation"];
    let currContactInfo = locationConceptIDToLocationMap[currBox['560975149']]["contactInfo"][currInstitute];

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
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
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
        <div class="row" style="margin-top:3.125rem">
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
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarBoxManifest');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
   
// We may not need this anymore:
    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(boxIdAndBags);
    
    //addEventNavBarShipment("returnToPackaging");
    //document.getElementById('boxManifestTable').appendChild(result);
    populateBoxManifestHeader(boxId,boxList,currContactInfo);
    populateBoxManifestTable(boxId,boxIdAndBags);
    addEventNavBarShipment("returnToPackaging", userName);
    document.getElementById('printBox').addEventListener('click', e => {
        window.print();
    });
    addEventNavBarShipment("returnToPackaging", userName);
    //addEventNavBarShippingManifest();
    hideAnimation();
    //addEventNavBarShipment("navBarShippingDash");
    //addEventBackToSearch('backToSearch');
}



export const shippingManifest = async (boxesToShip, userName, tempMonitorThere, currShippingLocationNumber) => {    
    //let tempMonitorThere = document.getElementById('tempMonitorChecked').checked;
    let response = await  getBoxes();
    let boxList = response.data;
    let boxIdAndBags = {};
    let locations = {};
    let site = '';

    for (const box of boxList) {
        const boxId= box[conceptIds.shippingBoxId]
        boxIdAndBags[boxId] = box['bags']
        locations[boxId] = box[conceptIds.shippingLocation];
        site = box['siteAcronym'];
    }
    
    let boxIdAndBagsToDisplay = {};
    let location = ''

    for (const boxId of boxesToShip) {
        boxIdAndBagsToDisplay[boxId] = boxIdAndBags[boxId];
        location = locations[boxId];
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
        <div class="row" id="checkForTemp" style="display:none">
            <input type="checkbox" id="tempMonitorChecked">
            <label for="tempMonitorChecked">Temp Monitor is included in this shipment</label><br>
        </div>
        <div class="row" id="tempCheckList">
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
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarReviewShipmentContents');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    if(tempMonitorThere){
        populateTempSelect(boxesToShip);
    }

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(boxIdAndBags);
    
    
    //document.getElementById('boxManifestTable').appendChild(result);
    
    populateShippingManifestHeader(boxIdAndBagsToDisplay, userName, location, site, currShippingLocationNumber); // populate shipping header via site specfiic location selected from shipping page
    populateShippingManifestBody(boxIdAndBagsToDisplay);
    addEventNavBarShipment("navBarShippingDash", userName);
    await populateTempCheck();
    const btn = document.getElementById('assignTrackingNumberPage'); // assignTracking
    addEventShipPrintManifest('printBox')
    addEventNavBarShipment('returnToPackaging', userName);

    

    document.getElementById('assignTrackingNumberPage').addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        if(tempMonitorThere && document.getElementById('tempBox').value == '') {
            showNotifications({title: 'Missing field!', body: 'Please enter the box where the temperature monitor is being stored.'}, true)
            return;
        }
        //let currChecked = document.getElementById('tempMonitorChecked').checked;
        let currChecked = false;
        if(tempMonitorThere){
            currChecked = document.getElementById('tempBox').value;
        }
        //return box 1 info
        shipmentTracking(boxIdAndBagsToDisplay, userName, currChecked);
    });
    //addEventNavBarShipment("navBarShippingDash");
    //addEventBackToSearch('backToSearch');
}


export const shipmentTracking = async (boxIdAndBags, userName, tempCheckChecked) => {
    showAnimation();

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
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShipmentTracking');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateCourierBox();
    addEventNavBarShipment("returnToPackaging", userName);
    if(Object.keys(boxIdAndBags).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(boxIdAndBags)
    }
    //addEventReturnToShippingManifest('returnToShipping', hiddenJSON, userName, tempCheckChecked)
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBags, userName, tempCheckChecked)
    await populateTrackingQuery(boxIdAndBags);
    addEventTrimTrackingNums()
    addEventPreventTrackingConfirmPaste()
    addEventCheckValidTrackInputs(boxIdAndBags)
    addEventSaveButton(boxIdAndBags);
    addEventCompleteButton(boxIdAndBags, userName, tempCheckChecked);
    //addEventCompleteShippingButton(hiddenJSON);
    //addEventBackToSearch('navBarShippingDash');
    // addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    hideAnimation();
    //addEventSubmitAddBag();
}

export const finalShipmentTracking = (boxIdAndBags, userName, tempChecked, shipmentCourier) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let conversion = {
        '712278213': 'FedEx',
        '149772928': 'World Courier'
    }
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
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2 >Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarFinalizeShipment');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    
 
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarTracking("returnToTracking", userName, boxIdAndBags, tempChecked)
    addEventNavBarTracking("navBarFinalizeShipment", userName, boxIdAndBags, tempChecked)
    if(Object.keys(boxIdAndBags).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(boxIdAndBags)
    }
    populateFinalCheck(boxIdAndBags);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBags, userName)
    addEventCompleteShippingButton(boxIdAndBags, userName, tempChecked, shipmentCourier);
    addEventBackToSearch('navBarShippingDash');
    //addEventBackToSearch('navBarShippingDash');
    //addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    //addEventSubmitAddBag();
}