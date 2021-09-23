import { showAnimation, hideAnimation, getAllBoxes } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
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
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Expected # of Samples</th>
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
    // manifestButton();fcd
    // console.log(response.data);
    // manifestButton(response.data);
};

const createPackagesInTransitRows = (response) => {
    let template = "";

    try {
        if (response.code !== 200) {
            throw "status code not 200!";
        } else {
            const allBoxes = response.data;
            console.log(allBoxes);

            let numberOfSamples = [];
            allBoxes.forEach((i, index) => {
                // Count the number of key properties in the bags array
                // DETERMINES THE # OF BAGS

                // console.log(Object.keys(i.bags).length !== 0);
                // COUNT NUMBER OF SAMPLES***

                // IF NO BAGS ARE ASSOCIATED WITH AN OBJECT'S KEY SKIP AND PUSH TO NUMBEROFSAMPLES
                if (Object.keys(i.bags).length !== 0) {
                    // console.log(Object.keys(i.bags).length !== 0);
                    // console.log(i.bags);
                    // console.log(
                    //     i.bags[Object.keys(i.bags)[0]].arrElements.length
                    // );

                    for (let j = 0; j < Object.keys(i.bags).length; j++) {
                        console.log(j, Object.keys(i.bags).length);
                    }

                    // console.log(numberOfSamples);
                } else {
                    // numberOfSamples = 0;
                    numberOfSamples.push(0);
                }
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
                      <td style="text-align:center;">${""}</td>
                      <td>
                        <button class="manifest-button btn-primary" data-toggle="modal" data-target="#manifestModal" style="margin: 0 auto;display:block;">
                            Manifest
                        </button>
                      </td>
                      </tr>`;
            });
            return template;
        }
    } catch (e) {
        console.log(e);
    }
};

const manifestButton = (data) => {
    const buttons = document.getElementsByClassName("manifest-button");
    // let siteData = "";
    // let dateData = "";
    // let sender = "";
    // let boxNumber = "";
    // let specimenBagId = "";
    // let fullSpecimenId = "";
    // let firstName = "";
    // let lastName = "";
    Array.from(buttons).forEach((button, index) => {
        // Use fieldToConceptIdMapping to grab correct conceptIds
        button.dataset.site = data[index].siteAcronym;
        button.dataset.date = convertTime(
            data[index][fieldToConceptIdMapping.shippingShipDate]
        );
        button.dataset.location =
            data[index][fieldToConceptIdMapping.shippingSite];

        /*
    Add for loop/ for Each
    if (JSON.stringify(refusalObj) === '{}')
    Condition - If bag is empty skip
    */
        button.dataset.firstName =
            data[index].bags[Object.keys(data[index].bags)][
                fieldToConceptIdMapping.shippingFirstName
            ];

        // button.dataset.lName = data[index].bags[Object.keys(data[index].bags)];
        // button.dataset.sender = data[index]
        console.log(index, button.dataset.site);
        console.log(index, button.dataset.date);
        console.log(index, button.dataset.location);
        // console.log(index, button.dataset.fName);
        console.log(
            index,
            data[index].bags[Object.keys(data[index].bags)] ??
                data[index].bags[Object.keys(data[index].bags)]
        );
        // console.log(index, button.dataset.lastName);
        console.log(index, data[index].bags[Object.keys(data[index].bags)]);

        // data.forEach((i, index) => {
        //   button.dataset.siteData = i[fieldToConceptIdMapping.shippingSite];
        //   console.log(index, i[fieldToConceptIdMapping.shippingSite]);
        // });
    });
    // debugger;
    return;
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

// console.log(convertTime());
/* 
STEPS FOR MANIFEST MODAL
1. Add event listener to every manifest button
    - Iterate over getElementsByClassName --> HTMLCollection
2. Pass correct conceptId and values to be rendered on the manifest modal


*/
