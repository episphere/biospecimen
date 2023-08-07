import { appState, userAuthorization, removeActiveClass, displayContactInformation, getBoxes, getAllBoxes, hideAnimation, showAnimation, showNotifications, locationConceptIDToLocationMap } from "./../shared.js"
import { addEventBackToSearch, addEventAddSpecimenToBox, populateAvailableCollectionsList, addEventNavBarShipment, addEventNavBarBoxManifest, formatBoxTimestamp, populateBoxManifestTable, populateBoxesToShipTable,
         populateShippingManifestBody,populateShippingManifestHeader, addEventNavBarShippingManifest, populateTrackingQuery, addEventCompleteButton, populateFinalCheck, populateViewShippingBoxContentsList, addEventBoxSelectListChanged,
         addEventCompleteShippingButton, populateSelectLocationList, addEventModalAddBox, populateTempNotification, populateTempCheck, populateTempSelect, addEventNavBarTracking, addEventReturnToReviewShipmentContents,
         populateCourierBox, addEventSaveButton, addEventTrimTrackingNums, addEventCheckValidTrackInputs, addEventPreventTrackingConfirmPaste, addEventReturnToPackaging, addEventShipPrintManifest, addEventTrackingNumberScanAutoFocus } from "./../events.js";
import { homeNavBar, shippingNavBar, unAuthorizedUser} from '../navbar.js';
import { setAllShippingState } from "../shippingState.js";
import conceptIds from '../fieldToConceptIdMapping.js';

export const shippingDashboard = (auth, route) => {
    console.log("calling shippingDashboard");  
    auth.onAuthStateChanged(async user => {
        if (user) {
            console.time('userAuthorization');
            const responseData = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            console.timeEnd('userAuthorization');
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


// Initialize the shipping page.
// Check for a stored location, else wait for a location to be selected, then build the page
export const startShipping = async (userName, loadFromState = false, currBoxId) => {    
    console.log('START SHIPPING', currBoxId);
    buildNavAndHeaderDOM();

    const storedLocation = getStoredLocationOnInit();

    buildShippingDOM();
    await buildShippingInterface(storedLocation, userName, loadFromState, currBoxId);
}

const buildNavAndHeaderDOM = () => {
    const navBarParticipantCheckIn = document.getElementById('navBarParticipantCheckIn');
    if (navBarParticipantCheckIn) navBarParticipantCheckIn.classList.add('disabled');

    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShippingDash');
    navBarBtn.classList.add('active');
}

// Build the DOM for the shipping page.
const buildShippingDOM = async () => {
    document.getElementById('contentBody').innerHTML = `
        ${renderShippingHiddenTable()}
        ${renderShippingLocationSelector()}
        ${renderScanOrEnterSpecimenId()}
        ${renderCollectionsContentsAndBoxes()}
        ${renderTempMonitorCheckbox()}
    `;
}

/**
 * NOTE: getAllBoxesList is used because the larger filter iterates ALL boxes and removes specimens that belong to the shipped boxes ¯\_(ツ)_/¯
 * This will run asyncronously when pulling new data (loadFromState = false) and synchronously when loading from state (loadFromState = true).
 * @param {string} selectedLocation - the user's selected location from local storage.
 * @param {*} userName - the logged-in userName.
 * @param {*} loadFromState - whether to load data from state or from the server.
 */
const buildShippingInterface = async (selectedLocation, userName, loadFromState, currBoxId) => {    
    console.log('calling - BUILD SHIPPING INTERFACE');
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

    setAllShippingState(availableCollectionsObj, availableLocations, allBoxesList, finalizedSpecimenList, userName, selectedLocation);

    populateViewShippingBoxContentsList(currBoxId), // 'View Shipping Box Contents' section
    populateBoxesToShipTable(), // 'Select boxes to ship' section
    addShippingEventListeners();
    populateTempNotification();

    hideAnimation();
}

//TODO: use state for userName refs
const addShippingEventListeners = () => {
    const userName = appState.getState().userName;
    const tempMonitorCheckedEl = document.getElementById('tempMonitorChecked');
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarShippingManifest(userName, tempMonitorCheckedEl);
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest", userName); //TODO does this get used?
    addEventLocationSelect("selectLocationList", "shipping_location");
    addEventAddSpecimenToBox();
    addEventModalAddBox();
}

const getStoredLocationOnInit = () => {
    return JSON.parse(localStorage.getItem('selections'))?.shipping_location ?? 'none';
}

/**
 * Location selection event listener. Remove the event listener if it was previously added, then add the event listener back.
 * This makes sure the listener is only added once.
 * @param {string} elemId - the id of the element to add the event listener to 
 * @param {*} pageAndElement - the page and element to store in local storage
 * @param {*} userName - the user name to store in local storage
 */
const addEventLocationSelect = (elemId, pageAndElement) => {
    const selectionChangeHandler = (event) => {
        const selection = event.target.value;
        const prevSelections = JSON.parse(localStorage.getItem('selections'));
        localStorage.setItem('selections', JSON.stringify({...prevSelections, [pageAndElement] : selection}));
        if (selection && selection !== 'none') {
            const currBoxId = document.getElementById('selectBoxList').value;
            startShipping(appState.getState().userName, true, currBoxId);
        }
    };

    const element = document.getElementById(elemId);
    if (element) {
        element.removeEventListener("change", selectionChangeHandler);
        element.addEventListener("change", selectionChangeHandler);
    }
}

const renderShippingHiddenTable = () => {
    return `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
    `;
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

//TODO orphan panel is always hidden
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
        <div class="row" style="margin-bottom:.5rem">
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

//TODO: move boxManifest items to separate file
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

    addEventReturnToPackaging("returnToPackaging", appState.getState().userName);
}

export const populateBoxManifestHeader = (currBox, currContactInfo) => {
    if(!currBox) return;

    const currKeys = Object.keys(currBox).filter(key => key !== 'boxData' && key !== 'undefined');
    const numBags = currKeys.length;
    const numTubes = currKeys.reduce((acc, bagKey) => acc + currBox[bagKey]['arrElements'].length, 0);

    const boxId = currBox.boxData[conceptIds.shippingBoxId];
    const boxStartedTimestamp = formatBoxTimestamp(currBox.boxData[conceptIds.firstBagAddedToBoxTimestamp]);
    const boxLastModifiedTimestamp = formatBoxTimestamp(currBox.boxData[conceptIds.shippingShipDateModify]);

    renderBoxManifestHeader(boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currContactInfo);
}

const renderBoxManifestHeader = (boxId, boxStartedTimestamp, boxLastModifiedTimestamp, numBags, numTubes, currContactInfo) => {
    const boxManifestCol1 = document.getElementById('boxManifestCol1');
    const boxManifestCol3 = document.getElementById('boxManifestCol3');
    
    // PParent divs
    const div1 = document.createElement("div");
    const div3 = document.createElement("div");
    
    // List of data to be appended
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
    
    // Function to create elements from data
    const createElements = (data, parent) => {
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
    
    createElements(dataCol1, div1);
    createElements(dataCol3, div3);
    
    // Append parent divs to the target elements
    boxManifestCol1.appendChild(div1);
    boxManifestCol3.appendChild(div3);
}

const renderBoxManifestTemplate = (currInstitute, currLocation) => {
    return `
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

/**
 * 
 * @param {string[]} boxIdArray
 * @param {string} userName
 * @param {boolean} isTempMonitorIncluded
 * @param {*} currShippingLocationNumber
 */
export const shippingManifest = async (boxIdArray, userName, isTempMonitorIncluded, currShippingLocationNumber) => {
    let response = await  getBoxes();
    let boxArray = response.data;
    let boxIdAndBagsObj = {};
    let locations = {};
    let site = '';

    for (const box of boxArray) {
        const boxId= box[conceptIds.shippingBoxId]
        boxIdAndBagsObj[boxId] = box['bags']
        locations[boxId] = box[conceptIds.shippingLocation];
        site = box['siteAcronym'];
    }
    
    let boxIdAndBagsObjToDisplay = {};
    let location = ''

    for (const boxId of boxIdArray) {
        boxIdAndBagsObjToDisplay[boxId] = boxIdAndBagsObj[boxId];
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

    if(isTempMonitorIncluded){
        populateTempSelect(boxIdArray);
    }

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(boxIdAndBagsObj);
    
    
    //document.getElementById('boxManifestTable').appendChild(result);
    
    populateShippingManifestHeader(userName, site, currShippingLocationNumber); // populate shipping header via site specfiic location selected from shipping page
    populateShippingManifestBody(boxIdAndBagsObjToDisplay);
    addEventNavBarShipment("navBarShippingDash", userName);
    await populateTempCheck();
    const btn = document.getElementById('assignTrackingNumberPage'); // assignTracking
    addEventShipPrintManifest('printBox')
    addEventNavBarShipment('returnToPackaging', userName);

    

    document.getElementById('assignTrackingNumberPage').addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;

        const tempBoxElement = document.getElementById('tempBox');

        if (isTempMonitorIncluded && tempBoxElement.value === '') {
            showNotifications({title: 'Missing field!', body: 'Please enter the box where the temperature monitor is being stored.'}, true)
            return;
        }

        let boxWithTempMonitor = '';
        if( isTempMonitorIncluded){
            boxWithTempMonitor = tempBoxElement.value;
        }

        shipmentTracking(boxIdAndBagsObjToDisplay, userName, boxWithTempMonitor);
    });
}


export const shipmentTracking = async (boxIdAndBagsObj, userName, boxWithTempMonitor) => {
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
    if(Object.keys(boxIdAndBagsObj).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(boxIdAndBagsObj)
    }
    //addEventReturnToShippingManifest('returnToShipping', hiddenJSON, userName, tempCheckChecked)
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName, boxWithTempMonitor)
    await populateTrackingQuery(boxIdAndBagsObj);
    addEventTrimTrackingNums()
    addEventTrackingNumberScanAutoFocus()
    addEventPreventTrackingConfirmPaste()
    addEventCheckValidTrackInputs(boxIdAndBagsObj)
    addEventSaveButton(boxIdAndBagsObj);
    addEventCompleteButton(boxIdAndBagsObj, userName, boxWithTempMonitor);
    //addEventCompleteShippingButton(hiddenJSON);
    //addEventBackToSearch('navBarShippingDash');
    // addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    hideAnimation();
    //addEventSubmitAddBag();
}

export const finalShipmentTracking = (boxIdAndBagsObj, userName, boxWithTempMonitor, shipmentCourier) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');

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
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2 >Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarFinalizeShipment');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    
 
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarTracking("returnToTracking", userName, boxIdAndBagsObj, boxWithTempMonitor)
    addEventNavBarTracking("navBarFinalizeShipment", userName, boxIdAndBagsObj, boxWithTempMonitor)
    if(Object.keys(boxIdAndBagsObj).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(boxIdAndBagsObj)
    }
    populateFinalCheck(boxIdAndBagsObj);
    addEventReturnToReviewShipmentContents('navBarReviewShipmentContents', boxIdAndBagsObj, userName)
    addEventCompleteShippingButton(boxIdAndBagsObj, userName, boxWithTempMonitor, shipmentCourier);
    addEventBackToSearch('navBarShippingDash');
}