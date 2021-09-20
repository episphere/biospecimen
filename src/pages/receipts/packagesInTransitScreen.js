import { showAnimation, hideAnimation, getAllBoxes } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbarItem.js";

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
                    <span> <h3 style="text-align: center; margin: 1rem 0;">Packages In Transit </h3> </span>
                    <div class="sticky-header" style="overflow:auto;">
                            <table class="table table-bordered" id="packagesInTransitData" 
                                style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                <thead> 
                                    <tr style="top: 0; position: sticky;">
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Ship Date</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Tracking Number</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Shipped from (Site)</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Expected # of Samples</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Manifest</th>
                                    </tr>
                                </thead>   
                                <tbody id="contentBodyPackagesInTransit">
                                    ${createPackagesInTransitRows(response)}
                                </tbody>
                        </table>
                    </div>
                </div>`;

  template += `<div class="modal fade" id="manifestModal" tabindex="-1" aria-labelledby="manifestModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="manifestModalLabel">Manifest Modal</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          ...
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
  console.log("test");
  activeReceiptsNavbar();
};

const createPackagesInTransitRows = (response) => {
  let template = "";
  let bagId = "";

  try {
    if (response.code !== 200) {
      throw "status code not 200!";
    } else {
      const allBoxes = response.data;
      allBoxes.forEach((i) => {
        // console.log(i[fieldToConceptIdMapping.shippingShipDate]);
        // console.log(i[fieldToConceptIdMapping.shippingTrackingNumber]);
        // console.log(i[fieldToConceptIdMapping.shippingSite]);
        // console.log(i);
        // console.log(i.bags);
        // // returns an array of a given object's own enumerable property names
        // console.log(Object.keys(i.bags).length);
        template += `
                      <tr class="packageInTransitRow">
                      <td>${
                        i[fieldToConceptIdMapping.shippingShipDate]
                          ? i[fieldToConceptIdMapping.shippingShipDate]
                          : "N/A"
                      }</td>
                      <td>${
                        i[fieldToConceptIdMapping.shippingTrackingNumber]
                          ? i[fieldToConceptIdMapping.shippingTrackingNumber]
                          : "N/A"
                      }</td>
                      <td>${
                        i[fieldToConceptIdMapping.shippingSite]
                          ? i[fieldToConceptIdMapping.shippingSite]
                          : "N/A"
                      }</td>
                      <td>${Object.keys(i.bags).length}</td>
                      <td><button class="manifest-button" data-toggle="modal" data-target="#manifestModal">Manifest</button></td>
                      </tr>`;
      });
      manifestButton();
      return template;
    }
  } catch (e) {
    console.log(e);
  }
};

const manifestButton = () => {
  let buttons = document.getElementsByClassName("manifest-button");
};
// buttons.forEach((i) => console.log(i));

/* 
STEPS FOR MANIFEST MODAL
1. Add event listener to every manifest button
    - Iterate over getElementsByClassName --> HTMLCollection
2. Pass correct conceptId and values to be rendered on the manifest modal


*/
