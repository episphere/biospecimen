import { reportsNavbar } from "./reportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReportsNavbar } from "./activeReportsNavbar.js";
import { showAnimation, getSpecimenAndParticipant, hideAnimation, showNotifications, errorMessage, removeAllErrors, appState, validateSpecimenAndParticipantResponse } from '../../shared.js';
import { masterSpecimenIDRequirement } from '../../tubeValidation.js';
import { finalizeTemplate } from '../finalize.js';
import { conceptIds as fieldToConceptIdMapping } from "../../fieldToConceptIdMapping.js";

export const collectionIdSearchScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    appState.setState({ 'username': username });
    collectionIdSearchScreenTemplate(username);
};

export const collectionIdSearchScreenTemplate = async (username) => {
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
    collectionIdSearchBPTL();
};

const collectionIdSearchBPTL = () => {
    const form = document.getElementById('specimenLookupForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        removeAllErrors();

        let masterSpecimenId = document.getElementById('masterSpecimenId').value.toUpperCase();
        if(masterSpecimenId.length > masterSpecimenIDRequirement.length) masterSpecimenId = masterSpecimenId.substring(0, masterSpecimenIDRequirement.length);

        if (masterSpecimenId.startsWith('CHA')) {
            errorMessage('masterSpecimenId', `Error: Future Implementation. Home Collection search is not implemented yet.`, true);
            return;
        }

        if (!masterSpecimenIDRequirement.regExp.test(masterSpecimenId) || masterSpecimenId.length !== masterSpecimenIDRequirement.length) {
            errorMessage('masterSpecimenId', `Collection ID must be ${masterSpecimenIDRequirement.length} characters long and in CXA123456 format.`, true);
            return;
        }
        
        try {
            showAnimation();
            const isBPTL = true; // defined for process clarity.
            const { specimenData, participantData } = await getSpecimenAndParticipant(masterSpecimenId, isBPTL);
            
            if (!validateSpecimenAndParticipantResponse(specimenData, participantData, isBPTL)) return;
            
            localStorage.setItem('workflow', specimenData[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical ? `clinical` : `research`); // Note: this has been in the codebase. Not sure it's necessary.

            // Boolean flag: true; is passed down to finalizeTemplate & to distinguish collection id search from bptl and biospecimen."
            finalizeTemplate(participantData, specimenData, true);

        } catch {
            console.error(`Error in collectionIdSearchBPTL: Couldn't find collection ${masterSpecimenId}.`);
            showNotifications({ title: 'Error: Not found', body: `Error: Couldn't find collection ${masterSpecimenId}.` });
        } finally {
            hideAnimation();
        }
    });
}