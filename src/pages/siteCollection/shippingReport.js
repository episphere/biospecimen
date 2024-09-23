import { siteCollectionNavbar } from "./siteCollectionNavbar.js";
import { activeSiteCollectionNavbar } from "./activeSiteCollectionNavbar.js";
import { nonUserNavBar } from "../../navbar.js";
import { appState } from '../../shared.js';
import { startReport } from "../reportsQuery.js";

export const bptlShipReportsScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName || user.email;

    appState.setState({
        username,
        reportData: {
            currReportPageNum: null,
            reportPageBoxData: null,
            numReportPages: null
        }
    });

    bptlShipReportsScreenTemplate(username);
};

// Source: bptlShippingReport; the flag is passed down to startReport & various helper functions
// to distinguish shipping report functionality from bptl and biospecimen."

export const bptlShipReportsScreenTemplate = async (username) => {
    const template = `${siteCollectionNavbar()}
        <div id="root root-margin" style="padding-top: 25px;">
        <h3 style="text-align: center; margin: 1rem 0;">Site Shipping Report</h3>
            <div>
                ${startReport('bptlShippingReport')}
            </div>
        </div>
    `;

    document.getElementById("contentBody").innerHTML = await template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
    activeSiteCollectionNavbar();
};

