import { reportsNavbar } from "./reportsNavbar.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeReportsNavbar } from "./activeReportsNavbar.js";
import { appState } from '../../shared.js';
import { startReport } from "../reportsQuery.js";

export const bptlShipReportsScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName || user.email;
    appState.setState({ username });
    bptlShipReportsScreenTemplate(username);
};

export const bptlShipReportsScreenTemplate = async (username) => {
    const template = ` ${reportsNavbar()}
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

