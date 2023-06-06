import { reportsNavbar } from "./reportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReportsNavbar } from "./activeReportsNavbar.js";
import { showAnimation, hideAnimation, showNotifications,findParticipant, errorMessage, removeAllErrors, searchSpecimen, appState } from '../../shared.js';
import { masterSpecimenIDRequirement } from '../../tubeValidation.js';
import { finalizeTemplate } from '../finalize.js';
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";

export const collecionIdSearchScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    appState.setState({ 'username': username });
    collecionIdSearchScreenTemplate(username);
};

export const collecionIdSearchScreenTemplate = async (username, auth, route) => {
    let template = "";
    template += reportsNavbar();
    template += ` 
              <div id="root root-margin" style="padding-top: 25px;">
                <h3 style="text-align: center; margin: 1rem 0;">Collection ID Search</h3>
                <div class="row">
                    <div class="col-lg">
                        <div class="row form-row">
                            <form id="specimenLookupForm" method="POST">
                                <div class="form-group">
                                    <label class="search-label">Collection ID</label>
                                    <input class="form-control" autocomplete="off" required type="text" id="masterSpecimenId" placeholder="Enter/Scan Collection ID"/>
                                </div>
                                <div class="form-group">
                                    <button type="submit" class="btn btn-outline-primary">Search</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
              </div>
  `;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
    activeReportsNavbar();
    searchSpecimenEvent();
};

const searchSpecimenEvent = () => {
    const form = document.getElementById('specimenLookupForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        removeAllErrors();
        let masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase();

        if(masterSpecimenId.length > masterSpecimenIDRequirement.length) masterSpecimenId = masterSpecimenId.substring(0, masterSpecimenIDRequirement.length);

        if (!masterSpecimenIDRequirement.regExp.test(masterSpecimenId) || masterSpecimenId.length !== masterSpecimenIDRequirement.length) {
            errorMessage('masterSpecimenId', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, true);
            return;
        }
        showAnimation();
        const biospecimen = await searchSpecimen(masterSpecimenId, true);
        if (biospecimen.code !== 200) {
            hideAnimation();
            showNotifications({ title: 'Not found', body: 'Specimen not found!' }, true)
            return
        }
        const biospecimenData = biospecimen.data;
        let query = `connectId=${parseInt(biospecimenData.Connect_ID)}&allSiteSearch=${true}`;
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        localStorage.setItem('workflow', biospecimenData[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical ? `clinical` : `research`);
        finalizeTemplate(data, biospecimenData, true);
    })
}