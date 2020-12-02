import { removeActiveClass, generateBarCode, visitType } from "./../shared.js";
import { addEventFinalizeForm, addEventFinalizeFormCntd, addEventReturnToCollectProcess } from "./../events.js";
import { siteSpecificTubeRequirements, workflows } from "../tubeValidation.js";

export const finalizeTemplate = (data, specimenData) => {
    console.log(specimenData)
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenFinalize');
    navBarBtn.classList.remove('disabled');
    navBarBtn.classList.add('active');
    let template = '';

    template += `
        <div class="row">
            <h5>Finalize Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${specimenData['820476880']}</div>
                <div class="row">Specimen Collection Date & Time: ${new Date(specimenData['678166505']).toLocaleString()}</div>
            </div>
            ${specimenData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType[specimenData['331584571']]}
                </div>
            ` : ``
            }
        </div>
        </br>
        <div class="row">
            <table id="finalizeTable" class="table-borderless collection-table">
                <thead>
                    <tr>
                        <th>Tube Type</th>
                        ${document.getElementById('contentBody').dataset.workflow && document.getElementById('contentBody').dataset.workflow === 'clinical' ? `<th>Received</th>`:`<th>Collected</th>`}
                        <th>Full Specimen ID</th>
                        <th>Deviation</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>`
                const dashboardType = document.getElementById('contentBody').dataset.workflow;
                const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
                const subSiteLocation = specimenData.Collection_Location;
                const siteTubesList = siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] : siteSpecificTubeRequirements[siteAcronym][dashboardType]; 
                siteTubesList.forEach((obj, index) => {
                    template += `
                        <tr>
                            <td>(${index+1}) ${obj.specimenType}</td>
                            <td>${obj.collectionChkBox === true ? `${specimenData[`${obj.concept}`]['593843561'] === 353358909 ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}` : ``}</td>
                            <td>${specimenData[`${obj.concept}`]['593843561'] === 353358909 ? `${specimenData[`${obj.concept}`]['825582494']}` : '' }</td>
                            <td>${obj.deviationChkBox === true ? `${specimenData[`${obj.concept}`]['678857215'] === 353358909 ? 'Yes' : 'No'}`: ``}</td>
                            <td class="deviation-comments-width">${specimenData[`${obj.concept}`]['248868659'] ? specimenData[`${obj.concept}`]['248868659'].map(concept => obj.deviationOptions.filter(dt => dt.concept === concept)[0].label) : ''}</td>
                        </tr>
                    `
                });
                template +=`
                </tbody>
            </table>
            </br>
            <form id="finalizeForm" method="POST">
                <div class="form-group row">
                    <div class="col">
                        <label for="finalizedAdditionalNotes">Additional Notes (Optional)</label>
                        </br>
                        <textarea rows=3 class="form-control" id="finalizedAdditionalNotes">${specimenData.finalizedAdditionalNotes ? `${specimenData.finalizedAdditionalNotes}` : ''}</textarea>
                    </div>
                </div>
                </br>
                <div class="form-group row">
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" type="button" data-connect-id="${data.Connect_ID}" id="returnToCollectProcess" data-master-specimen-id="${specimenData['820476880']}">Return to Collect/Process</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['820476880']}" type="button" id="finalizedSaveExit">Save and Exit</button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['820476880']}" type="submit" id="finalizedContinue">Review Complete</button>
                    </div>
                </div>
            </form>
        </div>
    `;
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventFinalizeForm(specimenData);
    addEventFinalizeFormCntd(specimenData);
    addEventReturnToCollectProcess();
}