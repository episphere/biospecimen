import { showAnimation, hideAnimation, getAllBoxes, conceptIdToSiteSpecificLocation, ship, searchSpecimenInstitute } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { convertTime } from "../../shared.js";
import { getSpecimenDeviation} from "../../events.js";

export const packagesInTransitScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packagesInTransitTemplate(username, auth, route);
};

const packagesInTransitTemplate = async (username, auth, route) => {
    showAnimation();
    const response = await getAllBoxes(`bptl`);
    const searchSpecimenInstituteResponse = await searchSpecimenInstitute();
    hideAnimation();
    
    const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
    const searchSpecimenInstituteList = searchSpecimenInstituteResponse.data ?? [];
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
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
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
    createPackagesInTransitRows(allBoxesShippedBySiteAndNotReceived);

    const manifestModalBodyEl = document.getElementById("manifest-modal-body");
    const allBoxes = allBoxesShippedBySiteAndNotReceived;

    // // Return an array of an item of grouped bags from GET request***
    const bagsArr = groupAllBags(allBoxes);

    // // Returns an array of summed and grouped bag samples
    const sumSamplesArr = countSamplesArr(bagsArr);

    // // Returns an array --> nested array of grouped samples by index
    const bagSamplesArr = groupSamplesArr(bagsArr);

    // // Returns an array -->  nested array of grouped scanned by names by index
    const scannedByArr = groupScannedByArr(bagsArr, fieldToConceptIdMapping);
    
    // // Returns an array -->  nested array of grouped shipped by
    const shippedByArr = groupShippedByArr(allBoxes);

    // // Returns an array -->  nested array of bag Ids names by index
    const bagIdArr = groupBagIdArr(bagsArr);

    // // Returns an array -->  array of tracking numbers 
    const trackingNumberArr = groupByTrackingNumber(allBoxes);

    // // Returns an array -->  array of siteSpecificLocation
    const siteSpecificLocationArr = groupBySiteSpecificLocation(allBoxes)

    const dataObj = {
        sumSamplesArr,
        bagSamplesArr,
        scannedByArr,
        shippedByArr,
        bagIdArr,
        trackingNumberArr,
        siteSpecificLocationArr
    };
    manifestButton([...allBoxes], dataObj, manifestModalBodyEl, searchSpecimenInstituteList);
};

/**
 * Returns an array of shipped box items but not yet received and sorts the box items by most recent date
 * @param {array} boxes - array of all boxes from getAllBoxes(`bptl`) function
 * @returns 
 */
export const getRecentBoxesShippedBySiteNotReceived = (boxes) => {
  // boxes are from searchBoxes endpoint
  if(boxes.length === 0) return []
  const filteredBoxesBySubmitShipmentTimeAndNotReceived = boxes.filter(item => item[fieldToConceptIdMapping["shippingShipDate"]] && !item[fieldToConceptIdMapping["siteShipmentDateReceived"]])
  const sortBoxesBySubmitShipmentTime = filteredBoxesBySubmitShipmentTimeAndNotReceived.sort((a,b) => b[fieldToConceptIdMapping["shippingShipDate"]].localeCompare(a[fieldToConceptIdMapping["shippingShipDate"]]))
  return sortBoxesBySubmitShipmentTime;
}

const createPackagesInTransitRows = (boxes) => {
    let template = "";
    const boxesShippedNotReceived = boxes;
    const bagsArr = groupAllBags(boxesShippedNotReceived);
    const sumSamplesArr = countSamplesArr(bagsArr);
    const tableBodyPackagesInTransit = document.getElementById("tableBodyPackagesInTransit");
    const packagesInTransitTableHeaderRowEl = document.getElementById("packagesInTransitTableHeaderRow");
    const tableHeaderColumnNameList = Array.from(packagesInTransitTableHeaderRowEl.children);
    const siteShipmentReceived = fieldToConceptIdMapping.siteShipmentReceived;
    const yes = fieldToConceptIdMapping.yes;

    for(let i = 0; i < boxesShippedNotReceived.length; i++) {
        const currBoxShippedNotReceived = boxesShippedNotReceived[i];

        if (currBoxShippedNotReceived[siteShipmentReceived] === yes) continue; 
        const rowEle = document.createElement('tr');

        for (let j = 0; j < tableHeaderColumnNameList.length; j++) {
            const cellEle = document.createElement('td')
            const headerName = tableHeaderColumnNameList[j].textContent
            
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
                    buttonEle.id = `manifest-button-${i}`
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

const manifestButton = (allBoxes, dataObj, manifestModalBodyEl, searchSpecimenInstituteList) => {
    const buttons = document.getElementsByClassName("manifest-button");
    const { sumSamplesArr, bagSamplesArr, scannedByArr, shippedByArr, bagIdArr, trackingNumberArr, siteSpecificLocationArr } = dataObj;
    const { shippingShipDate, shippingLocation, shippingBoxId } = fieldToConceptIdMapping;

    Array.from(buttons).forEach((button, index) => {
        let modalData = {
            site: "",
            date: "",
            location: "",
            scannedByArr,
            boxNumber: "",
            sumSamplesArr,
            bagSamplesArr,
            bagIdArr,
            groupSamples: "",
            groupScannedBy: "",
            groupShippedBy: "",
            trackingNumber: "",
            siteSpecificLocation: "",
        };

        modalData.site = allBoxes[index].siteAcronym;
        modalData.date = allBoxes[index][shippingShipDate];
        modalData.location = allBoxes[index][shippingLocation];
        modalData.boxNumber = allBoxes[index][shippingBoxId];
        modalData.groupSamples = bagSamplesArr[index];
        modalData.groupScannedBy = scannedByArr[index];
        modalData.groupShippedBy = shippedByArr;
        modalData.trackingNumber = trackingNumberArr[index];
        modalData.siteSpecificLocation = siteSpecificLocationArr[index]

        // Stringify modalData to be parsed later
        button.dataset.modal = JSON.stringify(modalData);
        button.dataset.buttonIndex = `manifest-button-${index}`;
        button.addEventListener("click", (e) => {
            const parsedModalData = JSON.parse(e.target.getAttribute("data-modal"));
            const {
                site,
                date,
                location,
                boxNumber,
                bagIdArr,
                groupSamples,
                groupScannedBy,
                groupShippedBy,
                trackingNumber,
            } = parsedModalData;

            const modalBody = 
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
                                    <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Scanned By</th>
                                </tr>
                            </thead>
                            <tbody id="manifestModalTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        manifestModalBodyEl.innerHTML = modalBody;
        addManifestTableRows(boxNumber, bagIdArr, index, groupSamples, groupScannedBy, searchSpecimenInstituteList);
        });
    });
};

// Return an array of an item of grouped bags from GET request***
const groupAllBags = (allBoxes) => {
    const arrBoxes = [];
    // Object.keys --> Copies Keys and stores into array
    // If Key(bags) has a length push bag of objects, else an empty {}
    allBoxes.forEach((box) => {
        Object.keys(box.bags).length ? arrBoxes.push(box.bags) : arrBoxes.push(box.bags)
    });
    return arrBoxes;
};

const countSamplesArr = (bagsArr) => {
    const arrNumSamples = [];
    bagsArr.forEach((bag) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let sampleNumber = 0;
            for (let j = 0; j < Object.keys(bag).length; j++) {
                sampleNumber += bag[Object.keys(bag)[j]].arrElements.length;
                if (j === Object.keys(bag).length - 1) {
                    arrNumSamples.push(sampleNumber);
                }
            }
        } else {
            arrNumSamples.push(0);
        }
    });
    return arrNumSamples;
};

const groupSamplesArr = (bagsArr) => {
    const arrSamples = [];
    bagsArr.forEach((bag) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let groupSamples = [];
            for (let j = 0; j < Object.keys(bag).length; j++) {
                groupSamples.push(bag[Object.keys(bag)[j]].arrElements);
                if (j === Object.keys(bag).length - 1) {
                    groupSamples.concat(bag[Object.keys(bag)[j]].arrElements);
                    arrSamples.push(groupSamples);
                }
            }
        } else {
            arrSamples.push([]);
        }
    });
    return arrSamples;
};

// NESTED GROUP SCANNED BY INDEX***
const groupScannedByArr = (bagsArr, fieldToConceptIdMapping) => {
    const arrNames = [];
    const { scannedByFirstName, scannedByLastName } = fieldToConceptIdMapping;
    bagsArr.forEach((bag) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let groupNames = [];
            for (let j = 0; j < Object.keys(bag).length; j++) {
              // First name and last name exist
              if(bag[Object.keys(bag)[j]][scannedByFirstName] && bag[Object.keys(bag)[j]][scannedByLastName]){
                groupNames.push([
                  bag[Object.keys(bag)[j]][scannedByFirstName] +
                  " " +
                  bag[Object.keys(bag)[j]][scannedByLastName],]);
                if (j === Object.keys(bag).length - 1) {
                  // COMBINE TWO SEPARATE ARRAYS OF FULL NAME INTO ONE ARRAY
                  groupNames.concat([
                      bag[Object.keys(bag)[j]][scannedByFirstName] +
                      " " +
                      bag[Object.keys(bag)[j]][scannedByLastName],]);
                  arrNames.push(groupNames);
                }
              }
              // only First name exists
              else if(bag[Object.keys(bag)[j]][scannedByFirstName]) {
                groupNames.push([
                  bag[Object.keys(bag)[j]][scannedByFirstName],
                ]);
                if (j === Object.keys(bag).length - 1) {
                  // COMBINE TWO SEPARATE ARRAYS OF FULL NAME INTO ONE ARRAY
                  groupNames.concat([
                      bag[Object.keys(bag)[j]][scannedByFirstName],
                  ]);
                  arrNames.push(groupNames);
                }
              } 
            }
        } else {
            arrNames.push([]);
        }
    });
    return arrNames;
};

const groupShippedByArr = (allBoxes) => {
  const arrShippedBy = []
  allBoxes.forEach(box => {
    let shippedByFirstName = box[fieldToConceptIdMapping.shippedByFirstName].trim()
    let shippedByLastName = box[fieldToConceptIdMapping.shippedByLastName]?.trim() ?? ''
    if (shippedByFirstName.length > 0 && shippedByLastName > 0) {
      arrShippedBy.push(shippedByFirstName + " " + shippedByLastName)
    }
    else if (shippedByFirstName.length > 0) {
      arrShippedBy.push(shippedByFirstName)
    }
    else arrShippedBy.push("")
  })
  return arrShippedBy
}

// NESTED GROUP BAGS BY INDEX***
const groupBagIdArr = (bagsArr) => {
    const arrBagId = [];
    bagsArr.forEach((bag, index) => {
        arrBagId.push(Object.keys(bag));
    });
    return arrBagId;
};

const groupByTrackingNumber = (allBoxes) => {
    const arrTrackingNums = []
    allBoxes.forEach((box,index) => {
      if(box[fieldToConceptIdMapping["shippingTrackingNumber"]]) {
        let trackingNumber = box[fieldToConceptIdMapping["shippingTrackingNumber"]]
        arrTrackingNums.push(trackingNumber)
      }
    })
    return arrTrackingNums;
}

const groupBySiteSpecificLocation = (allBoxes) => {
    const siteSpecificLocationArr = [];
    allBoxes.forEach(box => {
        const siteSpecificLocation = box[fieldToConceptIdMapping["shippingLocation"]];
        if (siteSpecificLocation) siteSpecificLocationArr.push(siteSpecificLocation);
    })
    return siteSpecificLocationArr
}

const addManifestTableRows = (boxNumber, bagIdArr, index, groupSamples, groupScannedBy, searchSpecimenInstituteList) => {
    const manifestBody = '';
    const manifestModalTableBodyEl = document.getElementById('manifestModalTableBody');
    const packagesInTransitModalTableHeaderRowEl = document.getElementById('packagesInTransitModalTableHeaderRow');
    const tableModalHeaderColumnNameList = Array.from(packagesInTransitModalTableHeaderRowEl.children);

    // currBagIdList - Ex. [CXA426800 0008, CXA426800 0009]
    const currBagIdList =  bagIdArr[index];

    if (!bagIdArr[index].length) return manifestBody;
    else {
            for (let i = 0; i < currBagIdList.length; i++) {
                // currFullSpecimenIdList - Ex. [CXA426800 0001, CXA426800 0002, ...]
                const currFullSpecimenIdList = groupSamples[i];
                const currSpecimenBagId = currBagIdList[i];
                const currScannedByName =  groupScannedBy[i];
                const fullSpecimenIdDeviationObj = {};

                for (let j = 0; j < currFullSpecimenIdList.length; j++) {
                    const currTube = currFullSpecimenIdList[j];
                    const currAcceptedDeviationList = getSpecimenDeviation(searchSpecimenInstituteList, currTube);
                    const currFullSpecimenIdListLength = currFullSpecimenIdList.length;
                    let currFullSpecimenIdListCounter = 0;

                    fullSpecimenIdDeviationObj[currTube] = currAcceptedDeviationList;

                    if (j === currFullSpecimenIdList.length - 1) {
                        const tableRowNumber = currFullSpecimenIdListLength;

                        for (let rowIndex = 0; rowIndex < tableRowNumber; rowIndex++) {
                            const tableRowEl = document.createElement('tr');
                            if(i % 2 === 0) tableRowEl.style.backgroundColor = 'lightgrey'
                            
                            for (let tableModalHeaderIndex = 0; tableModalHeaderIndex < tableModalHeaderColumnNameList.length; tableModalHeaderIndex++) { 
                                const cellEl = document.createElement('td');
                                const headerName = tableModalHeaderColumnNameList[tableModalHeaderIndex].textContent;
                                const currFullSpecimenIdListLength = currFullSpecimenIdList.length;
                                let currTubeDeviationListCounter = 0;

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
                                        if ( currFullSpecimenIdListCounter !== currFullSpecimenIdListLength) {
                                            const currFullSpecimenId = currFullSpecimenIdList[currFullSpecimenIdListCounter];
                                            cellEl.textContent = currFullSpecimenId;
                                            currFullSpecimenIdListCounter += 1;
                                        }
                                        else {
                                            cellEl.textContent = ''
                                        }
                                        break;

                                    case 'Deviation Type':
                                        const currFullSpecimenId = currFullSpecimenIdList[rowIndex];
                                        // fullSpecimenIdDeviationObj Ex. { CXA854612 0001:['Hemolsysis Present'],... }
                                        const currDeviationTypeList = fullSpecimenIdDeviationObj[currFullSpecimenId] ? fullSpecimenIdDeviationObj[currFullSpecimenId] : [];
                                        if (currDeviationTypeList.length) {
                                            let deviationTextContent = '';
                                            for(let currDeviationType of currDeviationTypeList) {
                                                deviationTextContent += `${currDeviationType} <br><br>`
                                            }
                                            cellEl.innerHTML = deviationTextContent;
                                            currTubeDeviationListCounter += 1;
                                        }
                                        else {
                                            cellEl.textContent = '';
                                        }
                                        break;

                                    case 'Scanned By':
                                        if (rowIndex === 0) cellEl.textContent = currScannedByName;
                                        else {
                                            cellEl.textContent = '';
                                        }
                                        break;

                                    default:
                                        cellEl.textContent = '';
                                }
                                tableRowEl.appendChild(cellEl)
                            }
                            manifestModalTableBodyEl.appendChild(tableRowEl)
                        }
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