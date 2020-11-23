import { removeActiveClass, generateBarCode } from "./../shared.js";
import { addEventFinalizeForm, addEventFinalizeFormCntd, addEventReturnToCollectProcess } from "./../events.js";
import { siteSpecificTubeRequirements, workflows } from "../tubeValidation.js";

export const finalizeTemplate = (data, specimenData) => {
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
                <div class="row">Collection ID: ${specimenData.masterSpecimenId}</div>
                <div class="row">Specimen Collection Date & Time: ${new Date(specimenData.tubeCollectedAt).toLocaleString()}</div>
            </div>
            ${specimenData.visitType ? `
                <div class="ml-auto form-group">
                    Visit: ${specimenData.visitType}
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
                            <td>${obj.collectionChkBox === true ? `${specimenData[`${obj.name}Collected`] === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}` : ``}</td>
                            <td>${specimenData[`${obj.name}Collected`] === true ? `${specimenData.masterSpecimenId} ${specimenData[`${obj.name}Id`]}` : '' }</td>
                            <td>${obj.deviationChkBox === true ? `${specimenData[`${obj.name}Deviated`] === true ? 'Yes' : 'No'}`: ``}</td>
                            <td class="deviation-comments-width">${specimenData[`${obj.name}DeviatedReason`] ? specimenData[`${obj.name}DeviatedReason`] : ''}</td>
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
                        <button class="btn btn-outline-danger" type="button" data-connect-id="${data.Connect_ID}" id="returnToCollectProcess" data-master-specimen-id="${specimenData['masterSpecimenId']}">Return to Collect/Process</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['masterSpecimenId']}" type="button" id="finalizedSaveExit">Save and Exit</button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['masterSpecimenId']}" type="submit" id="finalizedContinue">Review Complete</button>
                    </div>
                </div>
            </form>
        </div>
    `;
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventFinalizeForm(data, specimenData.masterSpecimenId);
    addEventFinalizeFormCntd(data, specimenData.masterSpecimenId);
    addEventReturnToCollectProcess();
}