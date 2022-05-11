import { showAnimation, hideAnimation, getAllBoxes, conceptIdToSiteSpecificLocation } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { convertTime } from "../../shared.js";

export const packagesInTransitScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packagesInTransitTemplate(username, auth, route);
};

const packagesInTransitTemplate = async (username, auth, route) => {
    showAnimation();
    const response = await getAllBoxes(`bptl`);
    hideAnimation();
    const allShipped = filterShipped(response.data)

    let template = "";
    template += receiptsNavbar();

    template += `<div class="container-fluid">
                <div id="root root-margin">
                    <div class="table-responsive">
                    <span> <h3 style="text-align: center; margin: 1rem 0;">Packages In Transit</h3> </span>
                    <div class="sticky-header" style="overflow:auto;">
                            <table class="table table-bordered" id="packagesInTransitData" 
                                style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                <thead> 
                                    <tr style="top: 0; position: sticky;">
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Ship Date</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Tracking Number</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Shipped from Site</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Expected Number of Samples</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Temperature Monitor</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Manifest</th>
                                    </tr>
                                </thead>   
                                <tbody id="contentBodyPackagesInTransit">
                                    ${createPackagesInTransitRows(allShipped)}
                                </tbody>
                        </table>
                    </div>
                </div>`;

    template += `<div class="modal fade" id="manifestModal" tabindex="-1" aria-labelledby="manifestModalLabel" aria-hidden="true">
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
    const manifestModalBodyEl = document.getElementById("manifest-modal-body");

    const allBoxes = allShipped;

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

    // Object Property Value Shorthand
    // Example: bagsArr and bagsArr:bagsArr are equivalent
    const dataObj = {
        sumSamplesArr,
        bagSamplesArr,
        scannedByArr,
        shippedByArr,
        bagIdArr,
    };
    manifestButton([...allBoxes], dataObj, manifestModalBodyEl);
};

const filterShipped = (boxes) => {
  // boxes are from searchBoxes endpoint
  if(boxes.length === 0) {
    return []
  } 
  let filteredBoxes = boxes.filter(item => item[fieldToConceptIdMapping["shippingShipDate"]])
  let sortShipped = filteredBoxes.sort((a,b) => b[fieldToConceptIdMapping["shippingShipDate"]].localeCompare(a[fieldToConceptIdMapping["shippingShipDate"]]))
  return sortShipped
}

const createPackagesInTransitRows = (boxes) => {
    let template = "";
            const allBoxes = boxes;

            // Return a filtered array of an item of grouped bags from GET request***
            const bagsArr = groupAllBags(allBoxes);

            // Returns an array of summed and grouped bag samples
            const sumSamplesArr = countSamplesArr(bagsArr);
            // Populate Cells with Data
            allBoxes.forEach((box, index) => {
                if (box[fieldToConceptIdMapping.siteShipmentReceived] != fieldToConceptIdMapping.yes) {
                template += `
                      <tr class="packageInTransitRow">
                      <td style="text-align:center;">${
                          box[fieldToConceptIdMapping.shippingShipDate]
                              ? convertTime(box[fieldToConceptIdMapping.shippingShipDate]).split(",")[0] : ""
                      }</td>
                      <td style="text-align:center;">${
                          box[fieldToConceptIdMapping.shippingTrackingNumber] ? box[fieldToConceptIdMapping.shippingTrackingNumber] : ""
                      }</td>
                      <td style="text-align:center;">${box.siteAcronym ? box.siteAcronym : ""}</td>
                      <td style="text-align:center;">${sumSamplesArr[index]}</td>
                      <td style="text-align:center;">${tempProbeFound(box[fieldToConceptIdMapping["tempProbe"]])}</td>
                      <td>
                        <button class="manifest-button btn-primary" data-toggle="modal" data-target="#manifestModal" style="margin: 0 auto;display:block;">
                            Manifest
                        </button>
                      </td>
                      </tr>`;
            }});
            return template;
}

const manifestButton = (allBoxes, dataObj, manifestModalBodyEl) => {
    const buttons = document.getElementsByClassName("manifest-button");
    
    // DESTRUCTURING dataObj and fieldToConceptIdMapping
    const { sumSamplesArr, bagSamplesArr, scannedByArr, shippedByArr, bagIdArr } = dataObj;
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
            groupShippedBy: ""
        };

        modalData.site = allBoxes[index].siteAcronym;
        modalData.date = allBoxes[index][shippingShipDate];
        modalData.location = allBoxes[index][shippingLocation];
        modalData.boxNumber = allBoxes[index][shippingBoxId];
        modalData.groupSamples = bagSamplesArr[index];
        modalData.groupScannedBy = scannedByArr[index];
        modalData.groupShippedBy = shippedByArr;

        // Stringify modalData to be parsed later
        button.dataset.modal = JSON.stringify(modalData);
        button.dataset.buttonIndex = `manifest-button-${index}`;
        button.addEventListener("click", (e) => {
            let parsedModalData = JSON.parse(e.target.getAttribute("data-modal"));
            let {
                site,
                date,
                location,
                boxNumber,
                bagIdArr,
                groupSamples,
                groupScannedBy,
                groupShippedBy
            } = parsedModalData;

            let modalBody = `<div class="container-fluid">
            <div class="row">
                <div class="col-md-4">
                    <p style="font-size:1.3rem;"><strong>Shipping Manifest</strong></p>
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
                    <p><strong>Location:</strong> ${location ? conceptIdToSiteSpecificLocation[location] : ""}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Sender:</strong><br/>${groupShippedBy[index] ? groupShippedBy[index] : ""}</p>
                </div>
            </div>
            <div class="row">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                        <tr>
                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col-">Box Number</th>
                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Specimen Bag ID</th>
                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Full Specimen ID</th>
                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Scanned By</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addManifestTableRows(boxNumber, bagIdArr, index, groupSamples, groupScannedBy)}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>`;
        manifestModalBodyEl.innerHTML = modalBody;
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
    if(shippedByFirstName.length > 0 && shippedByLastName > 0) {
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

const addManifestTableRows = (boxNumber, bagIdArr, index, groupSamples, groupScannedBy) => {
    let manifestBody = ``;
    let rows = ``;
    if (!bagIdArr[index].length) {
        return manifestBody;
    } else {
        bagIdArr[index].forEach((id, indexNum) => {
            // If the current index of the bagIds is 0 insert # of samples
            if (indexNum === 0) {
                rows += `<tr>
                <td style="text-align:center">
                <p>${boxNumber ? boxNumber.replace("Box", "") : ""}</p>
                </td>
                <td style="text-align:center">
                    <p>${id ? id : "N//A"}</p>
                </td>
                <td style="text-align:center">
                    ${groupSamples[indexNum].toString().replaceAll(",", `<br>`)}
                </td>
                <td style="text-align:center">
                    ${groupScannedBy[indexNum].toString().replaceAll(",", `<br>`)}
                </td>
                </tr>`;
            } else {
                rows += `<tr>
                <td style="text-align:center">
                <p></p>
                </td>
                <td style="text-align:center">
                    <p>${id ? id : ""}</p>
                </td>
                <td style="text-align:center">
                    ${groupSamples[indexNum].toString().replaceAll(",", `<br>`)}
                </td>
                <td style="text-align:center">
                    ${groupScannedBy[indexNum].toString().replaceAll(",", `<br>`)}
                </td>
                </tr>`;
            }
        });
        manifestBody = rows;
        return manifestBody;
    }
};

const tempProbeFound = (tempProbe) => {
  if(tempProbe == '104430631') {
    return "No"
  }
  else if(tempProbe == '353358909') {
    return "Yes"
  }
  else return ""
}

