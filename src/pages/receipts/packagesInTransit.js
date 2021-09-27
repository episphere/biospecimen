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
        <div class="modal-body">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <p>Shipping Manifest</p>
                    </div>
                    <div class="col-md-4 ml-auto">
                        <p>Site: NCI </p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <p>Shipped Date and Time: 6/17/2021, 02:23 PM
                        </p>
                    </div>
                    <div class="col-md-4 ml-auto">
                        <p>Location: Main Campus</p>
                    </div>
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <p>Sender: </p>
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
                        <tr>
                            <td style="text-align:center">
                              <p>Box3</p>
                            </td>
                            <td style="text-align:center">
                              <p>CXA111111 0008</p>
                            </td>
                            <td style="text-align:center">
                                <p>CXA111111 0001</p>
                                <p>CXA111111 0002
                                </p>
                                <p>CXA111111 0003</p>
                                <p>CXA111111 0006</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center">
                              <p>Box3 </p>
                            </td>
                            <td style="text-align:center">
                              <p>CXA111111 0008</p>
                            </td>
                            <td style="text-align:center">
                                <p>CXA111111 0001</p>
                                <p>CXA111111 0002
                                </p>
                                <p>CXA111111 0003</p>
                                <p>CXA111111 0006</p>
                            </td>
                        </tr>
                    </tbody>
                  </table>
                </div>
                </div>
            </div>
        </div>  
      </div>
    </div>
  </div>`;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(username);
    activeReceiptsNavbar();

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
    manifestButton([...allBoxes], dataObj);
    // let manifestButtonEl = document.querySelector(".manifest-button");
    // console.log(manifestButtonEl);
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

const manifestButton = (allBoxes, dataObj) => {
    const buttons = document.getElementsByClassName("manifest-button");

    // DESTRUCTURING dataObj and fieldToConceptIdMapping

    const { sumSamplesArr, bagSamplesArr, namesArr, bagIdArr } = dataObj;

    const { shippingSite, shippingShipDate, shippingLocation } =
        fieldToConceptIdMapping;

    // console.log(
    //     "shipping site",
    //     shippingSite,
    //     "shipping ship date",
    //     shippingShipDate,
    //     "shipping Location",
    //     shippingLocation
    // );
    // console.log(bagsArr);
    // let siteData = "";
    // let dateData = "";
    // let sender = "";
    // let boxNumber = "";
    // let specimenBagId = "";
    // let fullSpecimenId = "";
    // let firstName = "";
    // let lastName = "";

    // START-----*****
    // Array.from(buttons).forEach((button, index) => {
    //     // Use fieldToConceptIdMapping to grab correct conceptIds
    //     button.dataset.site = data[index].siteAcronym;
    //     button.dataset.date = convertTime(
    //         data[index][fieldToConceptIdMapping.shippingShipDate]
    //     );
    //     button.dataset.location =
    //         data[index][fieldToConceptIdMapping.shippingSite];

    //     /*
    // Add for loop/ for Each
    // if (JSON.stringify(refusalObj) === '{}')
    // Condition - If bag is empty skip
    // */
    //     button.dataset.firstName =
    //         data[index].bags[Object.keys(data[index].bags)][
    //             fieldToConceptIdMapping.shippingFirstName
    //         ];

    //     // button.dataset.lName = data[index].bags[Object.keys(data[index].bags)];
    //     // button.dataset.sender = data[index]
    //     console.log(index, button.dataset.site);
    //     console.log(index, button.dataset.date);
    //     console.log(index, button.dataset.location);
    //     // console.log(index, button.dataset.fName);
    //     console.log(
    //         index,
    //         data[index].bags[Object.keys(data[index].bags)] ??
    //             data[index].bags[Object.keys(data[index].bags)]
    //     );
    //     // console.log(index, button.dataset.lastName);
    //     console.log(index, data[index].bags[Object.keys(data[index].bags)]);

    //     // data.forEach((i, index) => {
    //     //   button.dataset.siteData = i[fieldToConceptIdMapping.shippingSite];
    //     //   console.log(index, i[fieldToConceptIdMapping.shippingSite]);
    //     // });
    // });
    // debugger;
    // return;
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
        button.dataset.modal = JSON.stringify(modalData);
        console.log(JSON.parse(button.getAttribute("data-modal")));
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
