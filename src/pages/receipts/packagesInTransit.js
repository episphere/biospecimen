import { showAnimation, hideAnimation, getAllBoxes, conceptIdToSiteSpecificLocation, searchSpecimenByRequestedSiteAndBoxID, appState } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { convertTime } from "../../shared.js";
import { getSpecimenDeviationReports, getSpecimenCommentsReports } from "../../events.js";

export const packagesInTransitScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packagesInTransitTemplate(username, auth, route);
};

const packagesInTransitTemplate = async (username, auth, route) => {
    showAnimation();
    const response = await getAllBoxes(`bptlPackagesInTransit`); 
    hideAnimation();
    
    const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
    const bagsArr = groupAllBags(allBoxesShippedBySiteAndNotReceived);
    const sumSamplesArr = countSamplesArr(bagsArr);
    const bagSamplesArr = groupSamplesArr(bagsArr);
    const scannedByArr = groupScannedByArr(bagsArr);
    const shippedByArr = groupShippedByArr(allBoxesShippedBySiteAndNotReceived);
    const bagIdArr = groupBagIdArr(bagsArr);
    const trackingNumberArr = groupByTrackingNumber(allBoxesShippedBySiteAndNotReceived);
    const groupByLoginSiteCidArr = groupByLoginSiteCid(allBoxesShippedBySiteAndNotReceived);
    const packagesInTransitDataObject = {
        sumSamplesArr,
        bagSamplesArr,
        scannedByArr,
        shippedByArr,
        bagIdArr,
        trackingNumberArr,
        groupByLoginSiteCidArr,
    };

    appState.setState({packagesInTransitDataObject: packagesInTransitDataObject});
    let template = '';
    
    template += `
    ${receiptsNavbar()}
    <div class="container-fluid">
        <div id="root root-margin">
            <div class="table-responsive">
                <span> <h3 style="text-align: center; margin: 1rem 0;">Packages In Transit</h3> </span>
                <div class="sticky-header" style="overflow:auto;">
                    <table class="table table-bordered" id="packagesInTransitTable"
                        style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                        <thead> 
                            <tr style="top: 0; position: sticky;" id="packagesInTransitTableHeaderRow">
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Ship Date</th>
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Tracking Number</th>
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Shipped from Site</th>
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Expected Number of Samples</th>
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Temperature Monitor</th>
                                <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Manifest</th>
                            </tr>
                        </thead>   
                        <tbody id="tableBodyPackagesInTransit" style="text-align: center; vertical-align: middle;"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="manifestModal" tabindex="-1" aria-labelledby="manifestModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div>
                    <button style="font-size:2.5rem;padding:1rem;" type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div id="manifest-modal-body" class="modal-body"></div>  
            </div>
        </div>
    </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
    activeReceiptsNavbar();
    createPackagesInTransitRows(allBoxesShippedBySiteAndNotReceived, sumSamplesArr);

    const manifestModalBodyEl = document.getElementById("manifest-modal-body");
    manifestButton([...allBoxesShippedBySiteAndNotReceived], bagIdArr, manifestModalBodyEl);
};

/**
 * Get boxes that have been shipped by site and not yet received
 * @param {array} boxes - array of boxes from searchBoxes endpoint with 'bptl' flag
 */
export const getRecentBoxesShippedBySiteNotReceived = (boxes) => {
    // boxes are from searchBoxes endpoint
    if (boxes.length === 0) return [];
    return boxes.sort((a,b) => {
        const shipDateA = a[fieldToConceptIdMapping.shippingShipDate];
        const shipDateB = b[fieldToConceptIdMapping.shippingShipDate];
        return (shipDateA < shipDateB) ? 1 : -1;
    });
}

const createPackagesInTransitRows = (boxes, sumSamplesArr) => {
    let template = "";
    const boxesShippedNotReceived = boxes;
    const tableBodyPackagesInTransit = document.getElementById("tableBodyPackagesInTransit");
    const packagesInTransitTableHeaderRowEl = document.getElementById("packagesInTransitTableHeaderRow");
    const tableHeaderColumnNameArray = Array.from(packagesInTransitTableHeaderRowEl.children);
    const siteShipmentReceived = fieldToConceptIdMapping.siteShipmentReceived;
    const yes = fieldToConceptIdMapping.yes;

    for(let i = 0; i < boxesShippedNotReceived.length; i++) {
        const currBoxShippedNotReceived = boxesShippedNotReceived[i];

        if (currBoxShippedNotReceived[siteShipmentReceived] === yes) continue; 
        const rowEle = document.createElement('tr');

        for (let j = 0; j < tableHeaderColumnNameArray.length; j++) {
            const cellEle = document.createElement('td')
            const headerName = tableHeaderColumnNameArray[j].textContent
            
            switch (headerName) {
                case 'Ship Date':
                    const currBoxShipDate = currBoxShippedNotReceived[fieldToConceptIdMapping.shippingShipDate];
                    cellEle.innerText = currBoxShipDate ? convertTime(currBoxShipDate).split(",")[0] : '';
                    break;

                case 'Tracking Number':
                    const currBoxTrackingNumber = currBoxShippedNotReceived[fieldToConceptIdMapping.shippingTrackingNumber];
                    cellEle.innerText = currBoxTrackingNumber ? currBoxTrackingNumber : '';
                    break;

                case 'Shipped from Site':
                    const siteShipped = currBoxShippedNotReceived['siteAcronym'] ? currBoxShippedNotReceived['siteAcronym'] : '';
                    cellEle.innerText = siteShipped;
                    break;

                case 'Expected Number of Samples':
                    const sumSamples = sumSamplesArr[i];
                    cellEle.innerText = sumSamples;
                    break;

                case 'Temperature Monitor':
                    const tempProbe = fieldToConceptIdMapping.tempProbe;
                    const isTempProbeFound = tempProbeFound(currBoxShippedNotReceived[tempProbe]);
                    cellEle.innerText = isTempProbeFound;
                    break;

                case 'Manifest':
                    const buttonEle = document.createElement('button');
                    buttonEle.className = 'manifest-button btn-primary';
                    buttonEle.textContent = 'Manifest';
                    buttonEle.setAttribute('data-toggle', 'modal');
                    buttonEle.setAttribute('data-target', '#manifestModal');
                    cellEle.appendChild(buttonEle);
                    break;

                default:
                    cellEle.innerText = ''
            }
            rowEle.appendChild(cellEle)
        }
        tableBodyPackagesInTransit.appendChild(rowEle);
    }
    return template;
}

const manifestButton = (allBoxesShippedBySiteAndNotReceived, bagIdArr, manifestModalBodyEl) => {
    const buttons = document.getElementsByClassName("manifest-button");
    const packagesInTransitDataObject = appState.getState().packagesInTransitDataObject;

    Array.from(buttons).forEach((button, index) => {
        button.addEventListener("click", async (e) => {
            let modalBody = '';
            savePackagesInTransitModalData(packagesInTransitDataObject, index, allBoxesShippedBySiteAndNotReceived);
            
            const packagesInTransitModalData = appState.getState().packagesInTransitModalData;
            const {
                site,
                date,
                location,
                boxNumber,
                groupSamples,
                groupShippedBy,
                trackingNumber,
                loginSite
            } = packagesInTransitModalData

            manifestModalBodyEl.innerHTML = modalBody;
            showAnimation();
            const searchSpecimenByRequestedSiteResponse = await searchSpecimenByRequestedSiteAndBoxID(loginSite, boxNumber);
            const searchSpecimenInstituteArray = searchSpecimenByRequestedSiteResponse?.data ?? [];

            modalBody = 
            `<div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <p style="font-size:1.5rem;"><strong>Shipping Manifest</strong></p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <p><strong>Tracking Number:</strong> ${trackingNumber ? trackingNumber : ""} </p>
                    </div>
                    <div class="col-md-4 ml-auto">
                        <p><strong>Site:</strong> ${site ? site : ""} </p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <p><strong>Shipped Date and Time:</strong> ${date ? convertTime(date) : ""}</p>
                    </div>
                    <div class="col-md-4 ml-auto">
                        <p><strong>Location:</strong> ${location ? (conceptIdToSiteSpecificLocation[location].length > 14 ? "<br>" + conceptIdToSiteSpecificLocation[location] : conceptIdToSiteSpecificLocation[location]) : ""}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <p><strong>Sender:</strong><br/>${groupShippedBy[index] ? groupShippedBy[index] : ""}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="table-responsive">
                        <table class="table" id="packagesInTransitModalTable">
                            <thead>
                                <tr id="packagesInTransitModalTableHeaderRow">
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col-">Box Number</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Specimen Bag ID</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Full Specimen ID</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Deviation Type</th>
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Comments</th>
                                </tr>
                            </thead>
                            <tbody id="manifestModalTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>`;
            manifestModalBodyEl.innerHTML = modalBody;
            addManifestTableRows(boxNumber, bagIdArr, index, groupSamples, searchSpecimenInstituteArray);
            hideAnimation()
        });
    });
};

/**
 * Loops through each box from allBoxesShippedBySiteAndNotReceived array with an existing bag key and pushes bags object to an array
 * @param {array} allBoxesShippedBySiteAndNotReceived
 * @returns {array} Returns an array of all grouped bags. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
*/
const groupAllBags = (allBoxesShippedBySiteAndNotReceived) => {
    const arrBoxes = [];
    allBoxesShippedBySiteAndNotReceived.forEach((box) => {
        const specimenBags = Object.keys(box.bags);
        if (specimenBags.length) {
            arrBoxes.push(box.bags);
        }
    });
    return arrBoxes;
};

/**
 * Loops through each grouped bag and sums the number of samples/specimens in each bag
 * @param {array} bagsArr - Array of grouped bags. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of summed grouped bag samples. Ex. [1, 6, 5, ...]
*/
const countSamplesArr = (bagsArr) => {
    const arrNumSamples = bagsArr.map((groupBag) => {
        let sampleNumber = 0;
        const groupBagKeys = Object.keys(groupBag);

        if (groupBagKeys.length) {
            for (let bag of groupBagKeys) {
                let bagSamples = groupBag[bag].arrElements
                sampleNumber += bagSamples.length;
            }
            return sampleNumber;
        }
    });
    return arrNumSamples;
};

/**
 * Loops through each grouped bag and pushes the samples/specimens in each bag to an array
 * @param {array} bagsArr - Array of grouped bags. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of grouped bag samples. Ex. [[{…}], [{…}, {…}], ...]
*/

const groupSamplesArr = (bagsArr) => {
    const arrSamples = [];
    bagsArr.forEach((groupBag) => {
        let groupSamples = [];
        const bagKeys = Object.keys(groupBag);

        if (bagKeys.length) {
            for (let bag of bagKeys) {
                groupSamples.push(groupBag[bag].arrElements)
            }
            arrSamples.push(groupSamples);
        }
    });
    return arrSamples;
};

/**
 * Loops through each grouped bag and pushes the scanned by names in each bag to an array
 * @param {array} bagsArr - Array of grouped bags. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of grouped bag scanned by names. Ex. [[""], ["", ""], ...]
*/
const groupScannedByArr = (bagsArr) => {
    const { scannedByFirstName, scannedByLastName } = fieldToConceptIdMapping;
    const arrNames = [];
    bagsArr.forEach((bag) => {
        let groupNames = [];
        const bagKeys = Object.keys(bag);

        bagKeys.forEach((bagKey) => {
            const currentBag = bag[bagKey];
            if (currentBag[scannedByFirstName] && currentBag[scannedByLastName]) {
                groupNames.push(currentBag[scannedByFirstName] + " " + currentBag[scannedByLastName]);
            } else if (currentBag[scannedByFirstName]) {
                groupNames.push(currentBag[scannedByFirstName]);
            }
        });
        arrNames.push(groupNames.length ? groupNames : []);
    });
    return arrNames;
};

/**
 * Loops through each box from allBoxesShippedBySiteAndNotReceived and pushes shipper's identity to an array 
 * @param {array} allBoxesShippedBySiteAndNotReceived - Array of grouped boxes. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of shipper identities. Ex.["shipper1", "shipper2", ...]
 * 
*/
const groupShippedByArr = (allBoxesShippedBySiteAndNotReceived) => {
    const arrShippedBy = [];
    allBoxesShippedBySiteAndNotReceived.forEach(box => {
    let shippedByFirstName = box[fieldToConceptIdMapping.shippedByFirstName].trim()
    let shippedByLastName = box[fieldToConceptIdMapping.shippedByLastName]?.trim() ?? ''
    if (shippedByFirstName.length > 0 && shippedByLastName > 0) {
        arrShippedBy.push(shippedByFirstName + " " + shippedByLastName)
    } else if (shippedByFirstName.length > 0) {
        arrShippedBy.push(shippedByFirstName)
    } else arrShippedBy.push("");
    });
    return arrShippedBy;
}

/**
 * Loops through each box and adds bag ids to an array
 * @param {array} allBoxesShippedBySiteAndNotReceived - Array of grouped boxes. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of grouped bag ids. Ex.[["CXA456873 0009"], ["CXA458003 0008", "CXA458003 0009"], ...]
*/
const groupBagIdArr = (bagsArr) => {
    const arrBagId = [];
    bagsArr.forEach((bag) => {
        const bagKeys = Object.keys(bag);
        arrBagId.push(bagKeys);
    });
    return arrBagId;
};

/**
 * Loops through each box and adds tracking number of box to an array
 * @param {array} allBoxesShippedBySiteAndNotReceived - Array of grouped boxes. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of tracking number strings. Ex.["123456789999", "123321456654", ...] 
 */
const groupByTrackingNumber = (allBoxesShippedBySiteAndNotReceived) => {
    const arrTrackingNums = []
    allBoxesShippedBySiteAndNotReceived.forEach((box) => {
        if (box[fieldToConceptIdMapping["shippingTrackingNumber"]]) {
            let trackingNumber = box[fieldToConceptIdMapping["shippingTrackingNumber"]]
            arrTrackingNums.push(trackingNumber)
        }
    })
    return arrTrackingNums;
}

/**
 * Loops through each box and adds login site to an array
 * @param {array} allBoxesShippedBySiteAndNotReceived - Array of grouped boxes. Ex.[({CXA456873 0009: {…}}), {CXA458003 0008: {…}, CXA458003 0009: {…}}]
 * @returns {array} Returns an array of login site numbers as a number data type. Ex.[ 13, 303349821, ...]
*/ 
const groupByLoginSiteCid = (allBoxesShippedBySiteAndNotReceived) => {
    const { loginSite } = fieldToConceptIdMapping;
    const boxLoginSiteArr = [];
    allBoxesShippedBySiteAndNotReceived.forEach(box => {
        const boxLoginSite = box[loginSite];
        if (boxLoginSite) boxLoginSiteArr.push(boxLoginSite);
    })
    return boxLoginSiteArr;
}

const addManifestTableRows = (boxNumber, bagIdArr, index, groupSamples, searchSpecimenInstituteArray) => {
    const manifestBody = '';
    const manifestModalTableBodyEl = document.getElementById('manifestModalTableBody');
    const packagesInTransitModalTableHeaderRowEl = document.getElementById('packagesInTransitModalTableHeaderRow');
    const tableModalHeaderColumnNameArray = Array.from(packagesInTransitModalTableHeaderRowEl.children);
    // currBagIdArray - Ex. [CXA426800 0008, CXA426800 0009]
    const currBagIdArray =  bagIdArr[index];

    if (currBagIdArray.length === 0) return manifestBody;
    for (let i = 0; i < currBagIdArray.length; i++) {
        // currFullSpecimenIdArray - Ex. [CXA426800 0001, CXA426800 0002, ...]
        const currSpecimenBagId = currBagIdArray[i];
        const currFullSpecimenIdArray = groupSamples[i];
        const fullSpecimenIdDeviationObj = {};
        

        for (let j = 0; j < currFullSpecimenIdArray.length; j++) {
            const currTube = currFullSpecimenIdArray[j];
            const currAcceptedDeviationArray = getSpecimenDeviationReports(searchSpecimenInstituteArray, currTube);
            const currFullSpecimenIdArrayLength = currFullSpecimenIdArray.length;
            let currFullSpecimenIdArrayCounter = 0;

            fullSpecimenIdDeviationObj[currTube] = currAcceptedDeviationArray;
            if (j === currFullSpecimenIdArray.length - 1) {
                const tableRowNumber = currFullSpecimenIdArrayLength;

                for (let rowIndex = 0; rowIndex < tableRowNumber; rowIndex++) {
                    const tableRowEl = document.createElement('tr');
                    if (i % 2 === 0) tableRowEl.style.backgroundColor = 'lightgrey';
                    const currFullSpecimenId = currFullSpecimenIdArray[rowIndex];
                    const currSpecimenComments = getSpecimenCommentsReports(searchSpecimenInstituteArray, currFullSpecimenId);

                    for (let tableModalHeaderIndex = 0; tableModalHeaderIndex < tableModalHeaderColumnNameArray.length; tableModalHeaderIndex++) { 
                        const cellEl = document.createElement('td');
                        const headerName = tableModalHeaderColumnNameArray[tableModalHeaderIndex].textContent;
                        const currFullSpecimenIdArrayLength = currFullSpecimenIdArray.length;
                        let currTubeDeviationArrayCounter = 0;

                        switch (headerName) {

                            case 'Box Number':
                                if (rowIndex === 0) cellEl.textContent = boxNumber;
                                else {
                                    cellEl.textContent = '';
                                }
                                break;

                            case 'Specimen Bag ID':
                                if (rowIndex === 0) cellEl.textContent = currSpecimenBagId;
                                else {
                                    cellEl.textContent = '';
                                }
                                break;

                            case 'Full Specimen ID':
                                if (currFullSpecimenIdArrayCounter !== currFullSpecimenIdArrayLength) {
                                    const currFullSpecimenId = currFullSpecimenIdArray[currFullSpecimenIdArrayCounter];
                                    cellEl.textContent = currFullSpecimenId;
                                    currFullSpecimenIdArrayCounter += 1;
                                } else {
                                    cellEl.textContent = ''
                                }
                                break;

                            case 'Deviation Type':
                                const currFullSpecimenId = currFullSpecimenIdArray[rowIndex];
                                // fullSpecimenIdDeviationObj Ex. { CXA854612 0001:['Hemolsysis Present'],... }
                                const currDeviationTypeArray = fullSpecimenIdDeviationObj[currFullSpecimenId] ?? [];
                                if (currDeviationTypeArray.length > 0) {
                                    let deviationTextContent = '';
                                    for (const currDeviationType of currDeviationTypeArray) {
                                        deviationTextContent += `${currDeviationType} <br>`;
                                    }
                                    cellEl.classList.add("deviation-type-cell");
                                    cellEl.innerHTML = deviationTextContent;
                                    currTubeDeviationArrayCounter += 1;
                                } else {
                                    cellEl.textContent = '';
                                }
                                break;

                            case 'Comments': 
                                if (currFullSpecimenIdArrayCounter !== currFullSpecimenIdArrayLength + 1 && currSpecimenComments.length) {
                                    cellEl.classList.add("comments-cell");
                                    cellEl.textContent = currSpecimenComments;
                                } else {
                                    cellEl.textContent = ''
                                }
                                break;

                            default:
                                cellEl.textContent = '';
                        }
                        tableRowEl.appendChild(cellEl);
                    }
                    manifestModalTableBodyEl.appendChild(tableRowEl);
                }
            }
        }
    }
};

const tempProbeFound = (tempProbe) => {
    const options = {
        '104430631': 'No',
        '353358909': 'Yes'
    };
    return options[tempProbe] || '';
};

/**
 * Creates the object packagesInTransitModalData and stores it in state
 * @param {object} packagesInTransitDataObject - stored object in state with array values for each key, ex. { sumSamplesArr: [], bagSamplesArr: [], ... } 
 * @param {number} index - index of modal button 
 * @param {array} allBoxesShippedBySiteAndNotReceived - array of objects with all boxes shipped by site and not received sorted by most recent data
*/

const savePackagesInTransitModalData = (packagesInTransitDataObject, index, allBoxesShippedBySiteAndNotReceived ) => {
    const { bagSamplesArr, shippedByArr, trackingNumberArr, groupByLoginSiteCidArr } = packagesInTransitDataObject
    const { shippingShipDate, shippingLocation, shippingBoxId } = fieldToConceptIdMapping;
    
    let packagesInTransitModalData = {
        site: "",
        date: "",
        location: "",
        boxNumber: "",
        groupSamples: "",
        groupShippedBy: "",
        trackingNumber: "",
        loginSite: "",
    }

    packagesInTransitModalData.site = allBoxesShippedBySiteAndNotReceived[index].siteAcronym;
    packagesInTransitModalData.date = allBoxesShippedBySiteAndNotReceived[index][shippingShipDate];
    packagesInTransitModalData.location = allBoxesShippedBySiteAndNotReceived[index][shippingLocation];
    packagesInTransitModalData.boxNumber = allBoxesShippedBySiteAndNotReceived[index][shippingBoxId];
    packagesInTransitModalData.groupSamples = bagSamplesArr[index];
    packagesInTransitModalData.groupShippedBy = shippedByArr;
    packagesInTransitModalData.trackingNumber = trackingNumberArr[index];
    packagesInTransitModalData.loginSite = groupByLoginSiteCidArr[index];

    appState.setState({ packagesInTransitModalData: packagesInTransitModalData });
}