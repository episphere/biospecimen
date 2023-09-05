import { reportsNavbar } from "./reportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReportsNavbar } from "./activeReportsNavbar.js";
import { showAnimation, hideAnimation, showNotifications,findParticipant, errorMessage, removeAllErrors, searchSpecimen, appState } from '../../shared.js';
import { masterSpecimenIDRequirement } from '../../tubeValidation.js';
import { finalizeTemplate } from '../finalize.js';
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { startReport } from "../reportsQuery.js";

export const bptlShipReportsScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    appState.setState({ 'username': username });
    bptlShipReportsScreenTemplate(username);
};

export const bptlShipReportsScreenTemplate = async (username) => {
    let template = "";
    template += reportsNavbar();
    template += ` 
              <div id="root root-margin" style="padding-top: 25px;">
                <h3 style="text-align: center; margin: 1rem 0;">Shipping Report Screen</h3>
                    <div>
                        ${startReport('bptlShippingReport')}
                    </div>
              </div>

  `;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
    activeReportsNavbar();
   
};

