import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";

export const packagesInTransitFromSitesScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packagesInTransitFromSitesTemplate(username, auth, route);
};

const packagesInTransitFromSitesTemplate = async (username, auth, route) => {
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
                                </tbody>
                        </table>
                    </div>
                </div>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
};
