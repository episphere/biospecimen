import { showAnimation, hideAnimation, getAllBoxes } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";

export const packagesInTransitScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packagesInTransitTemplate(username, auth, route);
};

const packagesInTransitTemplate = async (username, auth, route) => {
    showAnimation();
    const response = await getAllBoxes();
    hideAnimation();
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
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Shipped from (Site)</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Expected Number of Samples</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Manifest</th>
                                    </tr>
                                </thead>   
                                <tbody id="contentBodyPackagesInTransit">
                                    ${createPackagesInTransitRows(response)}
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
        <div id="manifest-modal-body" class="modal-body">
            
        </div>  
      </div>
    </div>
  </div>`;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(username);
    activeReceiptsNavbar();
    const manifestModalBodyEl = document.getElementById("manifest-modal-body");
    console.log(manifestModalBodyEl);
    // response.data ? console.log(true) : console.log(false);
    // manifestButton();
    // console.log(response.data);
    const allBoxes = response.data;
    // console.log("allBoxes", allBoxes);

    // // Return an array of an item of grouped bags from GET request***
    const bagsArr = groupAllBags(allBoxes);

    // // Returns an array of summed and grouped bag samples
    const sumSamplesArr = countSamplesArr(bagsArr);

    // // Returns an array --> nested array of grouped samples by index
    const bagSamplesArr = groupSamplesArr(bagsArr);
    // console.log("bagSamplesArr", bagSamplesArr);

    // // Returns an array -->  nested array of grouped names by index
    const namesArr = groupNamesArr(bagsArr, fieldToConceptIdMapping);
    // console.log("namesArr", namesArr);

    // // Returns an array -->  nested array of bag Ids names by index
    const bagIdArr = groupBagIdArr(bagsArr);
    // console.log("bagIdArr", bagIdArr);

    // Object Property Value Shorthand
    // Example: bagsArr and bagsArr:bagsArr are equivalent
    const dataObj = {
        sumSamplesArr,
        bagSamplesArr,
        namesArr,
        bagIdArr,
    };
    // console.log(bagsArr);
    manifestButton([...allBoxes], dataObj, manifestModalBodyEl);
};

const createPackagesInTransitRows = (response) => {
    let template = "";
    console.log(response);
    try {
        if (response.code !== 200) {
            throw "status code not 200!";
        } else {
            const allBoxes = response.data;
            // console.log(allBoxes);
            /* 
            ==================================
            INSERT NEW CODE - START
            ==================================
            */

            // // Return an array of an item of grouped bags from GET request***
            const bagsArr = groupAllBags(allBoxes);
            // console.log("bagsArr", bagsArr);

            // // Returns an array of summed and grouped bag samples
            const sumSamplesArr = countSamplesArr(bagsArr);
            // console.log("sumSamplesArr", sumSamplesArr);

            // // Returns an array --> nested array of grouped samples by index
            // const bagSamplesArr = groupSamplesArr(bagsArr);
            // console.log("bagSamplesArr", bagSamplesArr);

            // // Returns an array -->  nested array of grouped names by index
            // const namesArr = groupNamesArr(bagsArr, fieldToConceptIdMapping);
            // console.log("namesArr", namesArr);

            // // Returns an array -->  nested array of bag Ids names by index
            // const bagIdArr = groupBagIdArr(bagsArr);
            // console.log("bagIdArr", bagIdArr);
            /*
            ==================================
            INSERT NEW CODE - END
            ==================================
            */

            // Populate Cells with Data
            allBoxes.forEach((i, index) => {
                template += `
                      <tr class="packageInTransitRow">
                      <td style="text-align:center;">${
                          i[fieldToConceptIdMapping.shippingShipDate]
                              ? convertTime(
                                    i[fieldToConceptIdMapping.shippingShipDate]
                                ).split(",")[0]
                              : "N/A"
                      }</td>
                      <td style="text-align:center;">${
                          i[fieldToConceptIdMapping.shippingTrackingNumber]
                              ? i[
                                    fieldToConceptIdMapping
                                        .shippingTrackingNumber
                                ]
                              : "N/A"
                      }</td>
                      <td style="text-align:center;">${
                          i[fieldToConceptIdMapping.shippingSite]
                              ? i[fieldToConceptIdMapping.shippingSite]
                              : "N/A"
                      }</td>
                      <td style="text-align:center;">${
                          sumSamplesArr[index]
                      }</td>
                      <td>
                        <button class="manifest-button btn-primary" data-toggle="modal" data-target="#manifestModal" style="margin: 0 auto;display:block;">
                            Manifest
                        </button>
                      </td>
                      </tr>`;
            });
        }

        return template;
    } catch (e) {
        console.log(e);
    }
};

const manifestButton = (allBoxes, dataObj, manifestModalBodyEl) => {
    const buttons = document.getElementsByClassName("manifest-button");

    // DESTRUCTURING dataObj and fieldToConceptIdMapping

    const { sumSamplesArr, bagSamplesArr, namesArr, bagIdArr } = dataObj;

    const { shippingSite, shippingShipDate, shippingLocation } =
        fieldToConceptIdMapping;

    Array.from(buttons).forEach((button, index) => {
        // console.log(button);
        let modalData = {
            site: "",
            date: "",
            location: "",
            namesArr,
            sumSamplesArr,
            bagSamplesArr,
            bagIdArr,
        };

        // console.log(modalData);
        modalData.site = allBoxes[index][shippingSite];
        modalData.date = allBoxes[index][shippingShipDate];
        modalData.location = allBoxes[index][shippingLocation];
        // Stringify modalData to be parsed later
        button.dataset.modal = JSON.stringify(modalData);
        button.dataset.buttonIndex = `manifest-button-${index}`;
        // console.log(JSON.parse(button.getAttribute("data-modal")));
        // let parsedModalData = JSON.parse(button.getAttribute("data-modal"));
        // manifestContent(parsedModalData, manifestModalBodyEl, index);
        button.addEventListener("click", (e) => {
            // console.log(e.target.getAttribute("data-modal"));
            let parsedModalData = JSON.parse(
                e.target.getAttribute("data-modal")
            );

            let {
                site,
                date,
                location,
                namesArr,
                sumSamplesArr,
                bagSamplesArr,
                bagIdArr,
            } = parsedModalData;
            console.log(parsedModalData);
            // console.log(bagIdArr);
            // console.log(index, namesArr, namesArr[index]);
            // console.log(site);
            let modalBody = `<div class="container-fluid">
            <div class="row">
                <div class="col-md-4">
                    <p>Shipping Manifest</p>
                </div>
                <div class="col-md-4 ml-auto">
                    <p>Site: ${site ? site : "N/A"} </p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p>Shipped Date and Time: ${
                        date ? convertTime(date) : "N/A"
                    }
                    </p>
                </div>
                <div class="col-md-4 ml-auto">
                    <p>Location:${location ? location : "N/A"}</p>
                </div>
            </div>
            <div class="row">
            <div class="col-md-4">
                <p>Sender: ${namesArr[index] ? namesArr[index] : "N/A"}</p>
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
                    </tr>
                </thead>
                <tbody>
                    ${addManifestTableRows(
                        bagIdArr,
                        sumSamplesArr,
                        bagSamplesArr,
                        index
                    )}
                </tbody>
            </table>
            </div>
            </div>
        </div>`;
            manifestModalBodyEl.innerHTML = modalBody;
        });
    });
};

// Convert utc in Seconds to readable Date
const convertTime = (time) => {
    if (!time) {
        return "";
    }
    let utcSeconds = time;
    const myDate = new Date(utcSeconds);
    return myDate.toLocaleString("en-us", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Return an array of an item of grouped bags from GET request***
const groupAllBags = (allBoxes) => {
    const arrBoxes = [];
    // Object.keys --> Copies Keys and stores into array
    // If Key(bags) has a length push bag of objects, else an empty {}
    allBoxes.forEach((box) => {
        Object.keys(box.bags).length
            ? arrBoxes.push(box.bags)
            : arrBoxes.push(box.bags);
    });
    return arrBoxes;
};

const countSamplesArr = (bagsArr) => {
    const arrNumSamples = [];
    // NOTE: index is current index of bagsArr
    bagsArr.forEach((bag, index) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let sampleNumber = 0;
            for (let j = 0; j < Object.keys(bag).length; j++) {
                /*
                IMPORTANT FOR GETTING LIST OF ALL BAG ELEMENTS LATER (REUSABILITY)
                console.log(index, bag[Object.keys(bag)[j]].arrElements);
                */
                sampleNumber += bag[Object.keys(bag)[j]].arrElements.length;

                if (j === Object.keys(bag).length - 1) {
                    // console.log(index, sampleNumber);
                    arrNumSamples.push(sampleNumber);
                }
            }
        } else {
            // console.log(index, Object.keys(bag), "empty bag");
            arrNumSamples.push(0);
        }
    });
    return arrNumSamples;
};

const groupSamplesArr = (bagsArr) => {
    const arrSamples = [];
    // NOTE: index is current index of bagsArr
    bagsArr.forEach((bag, index) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let groupSamples = [];
            for (let j = 0; j < Object.keys(bag).length; j++) {
                // console.log(index, bag[Object.keys(bag)[j]]);
                /*
                IMPORTANT FOR GETTING LIST OF ALL BAG ELEMENTS LATER (REUSABILITY)
                console.log(index, bag[Object.keys(bag)[j]].arrElements);
                */
                // console.log(index, bag[Object.keys(bag)[j]].arrElements);
                groupSamples.push(bag[Object.keys(bag)[j]].arrElements);

                if (j === Object.keys(bag).length - 1) {
                    groupSamples.concat(bag[Object.keys(bag)[j]].arrElements);
                    arrSamples.push(groupSamples);
                }
            }
        } else {
            // console.log(index, Object.keys(bag), "empty bag");
            arrSamples.push([]);
        }
    });
    // console.log(arrSamples)
    return arrSamples;
};

// NESTED GROUP NAMES BY INDEX***
const groupNamesArr = (bagsArr, fieldToConceptIdMapping) => {
    const arrNames = [];
    const { shippingFirstName, shippingLastName } = fieldToConceptIdMapping;
    // NOTE: index is current index of bagsArr
    bagsArr.forEach((bag, index) => {
        //DETERMINE IF ARRAY IS EMPTY, IF NOT KEEP LOOPING INSIDE, ELSE PUSH 0 VALUE***
        if (Object.keys(bag).length) {
            let groupNames = [];
            for (let j = 0; j < Object.keys(bag).length; j++) {
                groupNames.push([
                    bag[Object.keys(bag)[j]][shippingFirstName] +
                        " " +
                        bag[Object.keys(bag)[j]][shippingLastName],
                ]);

                if (j === Object.keys(bag).length - 1) {
                    // COMBINE TWO SEPARATE ARRAYS OF FULL NAME INTO ONE ARRAY
                    groupNames.concat([
                        bag[Object.keys(bag)[j]][shippingFirstName] +
                            " " +
                            bag[Object.keys(bag)[j]][shippingLastName],
                    ]);
                    arrNames.push(groupNames);
                }
            }
        } else {
            arrNames.push([]);
        }
    });
    return arrNames;
};

// NESTED GROUP BAGS BY INDEX***
const groupBagIdArr = (bagsArr) => {
    const arrBagId = [];

    bagsArr.forEach((bag, index) => {
        // console.log(index, Object.keys(bag));
        arrBagId.push(Object.keys(bag));
    });
    // console.log(arrSamples)
    return arrBagId;
};

const addManifestTableRows = (
    bagIdArr,
    sumSamplesArr,
    bagSamplesArr,
    index
) => {
    // console.log(index, bagIdArr[index].length);
    // console.log(bagIdArr[index].length === 0);
    let manifestBody = ``;
    let rows = ``;
    if (!bagIdArr[index].length) {
        // console.log("No bag ids", bagIdArr[index]);

        return manifestBody;
    } else {
        // console.log(bagIdArr[index].length);
        // console.log(bagIdArr);
        bagIdArr[index].forEach((id, indexNum) => {
            // If the current index of the bagIds is 0 insert # of samples
            console.log(indexNum);
            if (indexNum === 0) {
                rows += `<tr>
                <td style="text-align:center">
                <p>${sumSamplesArr ? sumSamplesArr[index] : "N/A"}</p>
                </td>
                <td style="text-align:center">
                <p>${id ? id : "N//A"}</p>
                </td>
                <td style="text-align:center">
                    ${insertSamples(bagSamplesArr, indexNum)}
                </td>
                </tr>`;
            } else {
                rows += `<tr>
                <td style="text-align:center">
                <p></p>
                </td>
                <td style="text-align:center">
                <p>${id ? id : "N/A"}</p>
                </td>
                <td style="text-align:center">
                ${insertSamples(bagSamplesArr, indexNum)}
                </td>
                </tr>`;
            }
        });
        manifestBody = rows;
        return manifestBody;
    }
};

const insertSamples = (bagSamplesArr, indexNum) => {
    let samples = ``;
    console.log(bagSamplesArr);
    for (let i = 0; i < bagSamplesArr.length; i++) {
        // console.log(bagSamplesArr[i], bagSamplesArr[i].length);
        if (bagSamplesArr[i].length === 1) {
            bagSamplesArr[i].forEach((sample, num) => {
                // console.log("index", num, sample[num]);
                samples += `<p>${sample[num]}</p>`;
            });
            // console.log(samples);
            return samples;
        }
        for (let j = 0; j < bagSamplesArr[i].length; j++) {
            // console.log(i, j, bagSamplesArr[i][j]);
            // bagSamplesArr[i][j].forEach((sample) => {
            //     sample += `<p>${sample}<p>`;
            // });
        }
    }
    // console.log(samples);
    return samples;
};
