import { showAnimation, hideAnimation, getAllBoxes, conceptIdToSiteSpecificLocation, ship, searchSpecimenInstitute } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { convertTime } from "../../shared.js";
import { getSpecimenDeviation, fakeObj} from "../../events.js";

export const packagesInTransitScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packagesInTransitTemplate(username, auth, route);
};

let modalData = {}

const packagesInTransitTemplate = async (username, auth, route) => {
    showAnimation();
    const response = await getAllBoxes(`bptl`);
    const searchSpecimenInstituteResponse = await searchSpecimenInstitute()
    hideAnimation();
    
    const allBoxesShippedBySiteAndNotReceived = filterShipped(response.data)
    console.log("🚀 ~ file: packagesInTransit.js:23 ~ packagesInTransitTemplate ~ allBoxesShippedBySiteAndNotReceived:", allBoxesShippedBySiteAndNotReceived)
    
    const searchSpecimenInstituteList = searchSpecimenInstituteResponse?.data ? searchSpecimenInstituteResponse.data : []

    // console.log("getSpecimenDeviation", getSpecimenDeviation(undefined, currTube))

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
    // ${createPackagesInTransitRows(allBoxesShippedBySiteAndNotReceived)}
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
    activeReceiptsNavbar();
    createPackagesInTransitRows(allBoxesShippedBySiteAndNotReceived)
    const manifestModalBodyEl = document.getElementById("manifest-modal-body");
    console.log("🚀 ~ file: packagesInTransit.js:73 ~ packagesInTransitTemplate ~ manifestModalBodyEl:", manifestModalBodyEl)

    const allBoxes = allBoxesShippedBySiteAndNotReceived;
    console.log("🚀 ~ file: packagesInTransit.js:70 ~ packagesInTransitTemplate ~ allBoxes:", allBoxes)

    // // Return an array of an item of grouped bags from GET request***
    const bagsArr = groupAllBags(allBoxes);

    // // Returns an array of summed and grouped bag samples
    const sumSamplesArr = countSamplesArr(bagsArr);

    // // Returns an array --> nested array of grouped samples by index
    const bagSamplesArr = groupSamplesArr(bagsArr);

    // // Returns an array -->  nested array of grouped scanned by names by index
    const scannedByArr = groupScannedByArr(bagsArr, fieldToConceptIdMapping);
    
    // // Returns an array -->  nested array of grouped shipped by
    const shippedByArr = groupShippedByArr(allBoxes)

    // // Returns an array -->  nested array of bag Ids names by index
    const bagIdArr = groupBagIdArr(bagsArr);

    // // Returns an array -->  array of tracking numbers 
    const trackingNumberArr = groupByTrackingNumber(allBoxes)

    // // Returns an array -->  array of siteSpecificLocation

    const siteSpecificLocationArr = groupBySiteSpecificLocation(allBoxes)

    // Object Property Value Shorthand
    // Example: bagsArr and bagsArr:bagsArr are equivalent
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

const filterShipped = (boxes) => {
  // boxes are from searchBoxes endpoint
  if(boxes.length === 0) return []
  const filteredBoxesBySubmitShipmentTimeAndNotReceived = boxes.filter(item => item[fieldToConceptIdMapping["shippingShipDate"]] && !item[fieldToConceptIdMapping["siteShipmentDateReceived"]])
  const sortBoxesBySubmitShipmentTime = filteredBoxesBySubmitShipmentTimeAndNotReceived.sort((a,b) => b[fieldToConceptIdMapping["shippingShipDate"]].localeCompare(a[fieldToConceptIdMapping["shippingShipDate"]]))
  return sortBoxesBySubmitShipmentTime
}

const createPackagesInTransitRows = (boxes) => {
    let template = "";
    // const allBoxes = boxes;
    const boxesShippedNotReceived = boxes
    const bagsArr = groupAllBags(boxesShippedNotReceived);
    const sumSamplesArr = countSamplesArr(bagsArr);
    const tableBodyPackagesInTransit = document.getElementById("tableBodyPackagesInTransit");
    const packagesInTransitTableHeaderRowEl = document.getElementById("packagesInTransitTableHeaderRow");
    const tableHeaderColumnNameList = Array.from(packagesInTransitTableHeaderRowEl.children);

    const siteShipmentReceived = fieldToConceptIdMapping.siteShipmentReceived;
    const yes = fieldToConceptIdMapping.yes;

    for(let i = 0; i < boxesShippedNotReceived.length; i++) {
        const currBoxShippedNotReceived = boxesShippedNotReceived[i];

        if (currBoxShippedNotReceived[siteShipmentReceived] === yes) continue // current box is shipped and received break out of curr iteration
        const rowEle = document.createElement('tr');

        for(let j = 0; j < tableHeaderColumnNameList.length; j++) {
            const cellEle = document.createElement('td')
            const headerName = tableHeaderColumnNameList[j].textContent
            
            switch(headerName) {
                case 'Ship Date':
                    // console.log(i, j,'Ship Date');
                    // const shippingShipDate = currBoxShippedNotReceived[fieldToConceptIdMapping.shippingShipDate]
                    const currBoxShipDate = currBoxShippedNotReceived[fieldToConceptIdMapping.shippingShipDate]
                    cellEle.innerText = currBoxShipDate ? convertTime(currBoxShipDate).split(",")[0] : ''
                    break;
                case 'Tracking Number':
                    // console.log(i, j,'Tracking Number');
                    const currBoxTrackingNumber = currBoxShippedNotReceived[fieldToConceptIdMapping.shippingTrackingNumber] 
                    cellEle.innerText = currBoxTrackingNumber ? currBoxTrackingNumber : ''
                    break;
                case 'Shipped from Site':
                    // console.log(i, j,'Shipped from Site');
                    const siteShipped = currBoxShippedNotReceived['siteAcronym'] ? currBoxShippedNotReceived['siteAcronym'] : ''
                    cellEle.innerText = siteShipped;
                    break;
                case 'Expected Number of Samples':
                    // console.log(i, j,'Expected Number of Samples');
                    const sumSamples = sumSamplesArr[i];
                    cellEle.innerText = sumSamples;
                    break;
                case 'Temperature Monitor':
                    // console.log(i, j,'Temperature Monitor');
                    const tempProbe = fieldToConceptIdMapping.tempProbe
                    const isTempProbeFound = tempProbeFound(currBoxShippedNotReceived[tempProbe]);
                    cellEle.innerText = isTempProbeFound;
                    break;
                case 'Manifest':
                    // console.log(i, j,'Manifest');
                    const buttonEle = document.createElement('button');
                    buttonEle.id = `manifest-button-${i}`
                    buttonEle.className = 'manifest-button btn-primary';
                    buttonEle.textContent = 'Manifest';
                    buttonEle.setAttribute('data-toggle', 'modal')
                    buttonEle.setAttribute('data-target', '#manifestModal')
                    cellEle.appendChild(buttonEle)
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
    // console.log("🚀 ~ file: packagesInTransit.js:150 ~ manifestButton ~ dataObj:", dataObj)
    const buttons = document.getElementsByClassName("manifest-button");
    // console.log("🚀 ~ file: packagesInTransit.js:242 ~ manifestButton ~ buttons:", buttons)
    // DESTRUCTURING dataObj and fieldToConceptIdMapping
    const { sumSamplesArr, bagSamplesArr, scannedByArr, shippedByArr, bagIdArr, trackingNumberArr, siteSpecificLocationArr } = dataObj;
    const { shippingShipDate, shippingLocation, shippingBoxId } = fieldToConceptIdMapping;

    console.log("shippingLocation", shippingLocation)

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
            console.log("modalData", modalData)
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
                siteSpecificLocation
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
        // console.log("modalBody", modalBody)
        manifestModalBodyEl.innerHTML = modalBody;
        // <!-- ${addManifestTableRows(site, boxNumber, bagIdArr, index, groupSamples, groupScannedBy, searchSpecimenInstituteList)} -->
        addManifestTableRows(site, boxNumber, bagIdArr, index, groupSamples, groupScannedBy, searchSpecimenInstituteList, allBoxes)
        
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
  // check if each box has first name and last name concept with length
  // check length of last name and sanitize using trim 
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

const addManifestTableRows = (site, boxNumber, bagIdArr, index, groupSamples, groupScannedBy, searchSpecimenInstituteList, allBoxes) => {
    // console.log("🚀 ~ file: packagesInTransit.js:454 ~ addManifestTableRows ~ index:", index)
    // console.log("🚀 ~ file: packagesInTransit.js:456 ~ addManifestTableRows ~ bagIdArr:", bagIdArr)
    // console.log("🚀 ~ file: packagesInTransit.js:407 ~ addManifestTableRows ~ searchSpecimenInstituteList:", searchSpecimenInstituteList)
    // console.log("🚀 ~ file: packagesInTransit.js:383 ~ addManifestTableRows ~ groupSamples:", groupSamples, site, index)
    const manifestBody = '';
    const rows = '';
    const manifestModalTableBodyEl = document.getElementById('manifestModalTableBody');
    const packagesInTransitModalTableHeaderRowEl = document.getElementById('packagesInTransitModalTableHeaderRow')
    const tableModalHeaderColumnNameList = Array.from(packagesInTransitModalTableHeaderRowEl.children)
    console.log("🚀 ~ file: packagesInTransit.js:463 ~ addManifestTableRows ~ tableModalHeaderColumnNameList:", tableModalHeaderColumnNameList)
    // console.log("🚀 ~ file: packagesInTransit.js:460 ~ addManifestTableRows ~ manifestModalTableBodyEl:", manifestModalTableBodyEl)

    // const tableRowCount = allBoxes.length
    // const groupSample = groupSamples[index]

    
    // const tableRowCount = getDeviationNumberCount(groupSamples, searchSpecimenInstituteList)
    // const manifestTableRowCount = getCurrentTubeTableRowCount(groupSamples, searchSpecimenInstituteList)
    // console.log("🚀 ~ file: packagesInTransit.js:468 ~ addManifestTableRows ~ manifestTableRowCount:", manifestTableRowCount)
    
    // console.log("🚀 ~ file: packagesInTransit.js:464 ~ addManifestTableRows ~ tableRowCount:", tableRowCount)
    // console.log("🚀 ~ file: packagesInTransit.js:462 ~ addManifestTableRows ~ tableRowCount:", tableRowCount)
    /*
    Create a function to count the number of Specimen ID and Deviation Type  -- That will be the number of Row Counts
    - If deviation # > Specimen Id # (Add Specimen Id - deviation type = #'s)
    - If deviation # = Specimen Id #(Add Specimen Id = #)
    - If deviation # < Specimen Id # (In this case no deviation, Add Specimen Id = #)
    */ 

    // bagIdArr --> already grouped for each manifest button
    let greyIndex = 0
    // Needs siteSpecificLocation
    const currBagIdList =  bagIdArr[index];
    // const fullSpecimenIdList = groupSamples
    // console.log("🚀 ~ file: packagesInTransit.js:487 ~ addManifestTableRows ~ fullSpecimenIdList:", fullSpecimenIdList)
    if (!bagIdArr[index].length) return manifestBody;
    
    // else {
    //     bagIdArr[index].forEach((id, indexNum) => {
    //        0 const currGroupSamples = groupSamples[indexNum]
    //         console.log("🚀 ~ file: packagesInTransit.js:414 ~ bagIdArr[index].forEach ~ currGroupSamples:", currGroupSamples)
    //         // If the current index of the bagIds is 0 insert # of samples
    //         if (indexNum === 0) {
    //             rows += `
    //             <tr>
    //                 <td style="text-align:center">
    //                     <p>${boxNumber ? boxNumber.replace("Box", "") : ""}</p>
    //                 </td>
    //                 <td style="text-align:center">
    //                     <p>${id ? id : "N//A"}</p>
    //                 </td>
    //                 <td style="text-align:center">
    //                     ${currGroupSamples.toString().replaceAll(",", `<br>`)}
    //                 </td>
    //                 <td style="text-align:center">
    //                     ${translateNumToDeviation(searchSpecimenInstituteList, currGroupSamples)}
    //                 </td>
    //                 <td style="text-align:center">
    //                     ${groupScannedBy[indexNum].toString().replaceAll(",", `<br>`)}
    //                 </td>
    //             </tr>`
    //         } 
    //         else {
    //             rows += `
    //                 <tr>
    //                     <td style="text-align:center">
    //                     <p></p>
    //                     </td>
    //                     <td style="text-align:center">
    //                     <p>${id ? id : ""}</p>
    //                     </td>
    //                     <td style="text-align:center">
    //                     ${currGroupSamples.toString().replaceAll(",", `<br>`)}
    //                     </td>
    //                     <td style="text-align:center">
    //                     ${translateNumToDeviation(searchSpecimenInstituteList, currGroupSamples)}
    //                     </td>
    //                     <td style="text-align:center">
    //                             ${groupScannedBy[indexNum].toString().replaceAll(",", `<br>`)}
    //                     </td>
    //                 </tr>`
    //         }
    //     });

    
    //     manifestBody = rows;
    //     return manifestBody;
    // }

    /*
    SOLUTION --> NEED TO Dynamically create tr to style the contents
    CREATE LOOP and loop by length of manifestTAbleRowCount
    
    Create tableRow
    create table cell
    insert text content
    Create a switch case using the column headers


    Insert at the end to manifestTableRowCountEl

    Instead of getting the total amount of deviations, we can get the current deviation amount

    tubeId# 1 (Tubes 1, 2) --> 4 Deviation --> 4 Rows
    tubeId# 2 (Tubes 1, 2) --> 2 Deviation --> 2 Rows

    */
    else {
            
            console.log("currBagIdList",index, currBagIdList)
            for (let i = 0; i < currBagIdList.length; i++) { // Table row level
                // create element table row elements
                // const tableRowEl = document.createElement('tr')
                const currFullSpecimenIdList = groupSamples[i]
                let totalDeviationTypeCounter = 0 // counter for number of rows

                for(let j = 0; j < currFullSpecimenIdList.length; j++) {
                    // console.log("🚀 ~ file: packagesInTransit.js:566 ~ addManifestTableRows ~ groupSamples:", currFullSpecimenIdList[j])
                    const currTube = currFullSpecimenIdList[j]
                    const [collectionId, tubeId] = currTube.split(' ')
                    const currAcceptedDeviationList = getSpecimenDeviation(searchSpecimenInstituteList, currTube); // returns individual deviation type in an array
                    if (currAcceptedDeviationList.length) { // Adds to the DeviationTypeCounter
                        totalDeviationTypeCounter += currAcceptedDeviationList.length
                    }
                    // console.log("currAcceptedDeviationList currTube", currAcceptedDeviationList, currTube, totalDeviationTypeCounter) 
                    
                    // Condition to get the last currFullSpecimenIdList iteration, then compare lengths
                    if (j == currFullSpecimenIdList.length - 1) {
                        // console.log("Done at iteration", j)
                        // Write logic for comparing list lengths to determine the number of tr elements to create 
                        const tableRowNumber = getCurrentTubeTableRowCount(currFullSpecimenIdList, totalDeviationTypeCounter)
                        console.log("🚀 ~ file: packagesInTransit.js:584 ~ addManifestTableRows ~ tableRowNumber:", tableRowNumber)

                        // Create elements in another for loop
                        for(let rowIndex = 0; rowIndex < tableRowNumber; rowIndex++) {
                            const tableRowEl = document.createElement('tr')
                            // tableRowEl.textContent = "Hello"
                            for (let tableHeaderIndex = 0; tableHeaderIndex < tableModalHeaderColumnNameList.length; tableHeaderIndex++) {
                                const tableCellEl = document.createElement('td')
                                tableCellEl.textContent = 'TEST'
                                tableRowEl.appendChild(tableCellEl)
                            }
                            
                            manifestModalTableBodyEl.appendChild(tableRowEl)
                        }

                    }
                    // console.log("🚀 ~ file: packagesInTransit.js:570 ~ addManifestTableRows ~ currTube:", currTube)
                    // getCurrentTubeTableRowCount(currTube, currFullSpecimenIdList, searchSpecimenInstituteList)
                }

                
                // if(greyIndex % 2 === 0) tableRowEl.style['background-color'] = "lightgrey";
                // manifestModalTableBodyEl.appendChild(tableRowEl)
            }
            // console.log("🚀 ~ file: packagesInTransit.js:567 ~ addManifestTableRows ~ greyIndex:", greyIndex)
            // greyIndex += 1
        }
};

// const tempProbeFound = (tempProbe) => {
//   if(tempProbe == '104430631') {
//     return "No"
//   }
//   else if(tempProbe == '353358909') {
//     return "Yes"
//   }
//   else return ""
// }
const tempProbeFound = (tempProbe) => {
    const options = {
      '104430631': 'No',
      '353358909': 'Yes'
    };
    return options[tempProbe] || '';
  };

// make a function that takes in acceptedDeviationList

const translateNumToDeviation = (searchSpecimenInstituteList, currGroupSamples) => {
    // ${currTube.toString().replaceAll(",", `<br>`)}
    // Pass groupSamplesArr
    // Extract single tube and pass into getSpecimenDevitaion
    // using list of acceptedDeviationList display entire deviations
    let textContent = ''
    for(const currTube of currGroupSamples) {
        // console.log("currTube", currTube)
        const acceptedDeviationList = getSpecimenDeviation(searchSpecimenInstituteList, currTube)
        // console.log("🚀 ~ file: packagesInTransit.js:488 ~ translateNumToDeviation ~ acceptedDeviationList:", acceptedDeviationList)
        for(const deviation of acceptedDeviationList) {
            textContent += `${deviation}</br>`
        }
    }
    return textContent
}

const getCurrentTubeTableRowCount = (currFullSpecimenIdList, totalDeviationTypeCounter) => {    
    // const samplesList = currTube.flat()
    // const samplesListLength = samplesList.length
    // console.log("🚀 ~ file: packagesInTransit.js:573 ~ getDeviationNumberCount ~ samplesList:", samplesList)
    // let deviationCount = 0
    let totalCountRows = 0
    // for(const currTube of samplesList) {
    //     const [collectionId, tubeId] = currTube.split(' ');
    //     const acceptedDeviationList = getSpecimenDeviation(searchSpecimenInstituteList, currTube)
    //     const deviationListLength = acceptedDeviationList.length
    //     deviationCount += deviationListLength
    // }

    // const acceptedDeviationList = getSpecimenDeviation(searchSpecimenInstituteList, currTube);
    // console.log("🚀 ~ file: packagesInTransit.js:640 ~ getCurrentTubeTableRowCount ~ acceptedDeviationList:", acceptedDeviationList)
    /*
    Compare currFullSpecimenIdList length with acceptedDeviationList length
    */
    
    // LOGIC for sample list count (MODIFY FOR SINGLE CURRENT TUBE)

    // if (samplesListLength > deviationCount) { // samples list length MORE --> deviation Count
    //     totalCountRows = samplesListLength
    // }
    // else if (samplesListLength < deviationCount) {
    //     totalCountRows = deviationCount - samplesListLength
    //     // console.log("🚀 ~ file: packagesInTransit.js:589 ~ getDeviationNumberCount ~ totalCountRows:", totalCountRows)
    // }
    // else {
    //     totalCountRows = samplesListLength 
    // }

    // currFullSpecimenIdList - separate # of tubes from one group list
    // totalDeviationTypeCounter - # of type of deviations from currFullSpecimenIdList 
    const currFullSpecimenIdListLength = currFullSpecimenIdList.length
    if (currFullSpecimenIdListLength > totalDeviationTypeCounter) {
        totalCountRows = currFullSpecimenIdListLength
    }
    else if (currFullSpecimenIdListLength < totalDeviationTypeCounter) {
        totalCountRows = totalDeviationTypeCounter
    } 
    else {
        totalCountRows = currFullSpecimenIdListLength
    }

    console.log("totalCountRows", totalCountRows)
    return totalCountRows
    // console.log("deviationCount", deviationCount,"samplesListLength", samplesListLength, "totalCountRows", totalCountRows, )

}