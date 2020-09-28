import { removeActiveClass, generateBarCode } from "./../shared.js";
import { addEventFinalizeForm, addEventFinalizeFormCntd, addEventReturnToCollectProcess } from "./../events.js";

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
                <div class="row">Master Specimen ID: ${specimenData.masterSpecimenId}</div>
                <div class="row">Specimen Collection Date & Time: ${new Date(specimenData.tubeCollectedAt).toLocaleString()}</div>
            </div>
            <div class="ml-auto form-group">
                Visit: ${specimenData.visitType}
            </div>
        </div>
        </br>
        <div class="row">
            <table id="finalizeTable" class="table-borderless collection-table">
                <thead>
                    <tr>
                        <th>Tube Type</th>
                        <th>Collected</th>
                        <th>Tube ID</th>
                        <th>Deviation</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>(1) Red Top Separator</td>
                        <td>${specimenData.tube1Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube1Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube1Id}` : '' }</td>
                        <td>${specimenData.tube1Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube1DeviatedReason ? specimenData.tube1DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(2) Red Top Separator</td>
                        <td>${specimenData.tube2Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube2Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube2Id}` : '' }</td>
                        <td>${specimenData.tube2Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube2DeviatedReason ? specimenData.tube2DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(3) Green Top Heparin</td>
                        <td>${specimenData.tube3Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube3Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube3Id}` : '' }</td>
                        <td>${specimenData.tube3Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube3DeviatedReason ? specimenData.tube3DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(4) Lavender Top EDTA</td>
                        <td>${specimenData.tube4Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube4Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube4Id}` : '' }</td>
                        <td>${specimenData.tube4Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube4DeviatedReason ? specimenData.tube4DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(5) Yellow Top ACD</td>
                        <td>${specimenData.tube5Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube5Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube5Id}` : '' }</td>
                        <td>${specimenData.tube5Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube5DeviatedReason ? specimenData.tube5DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(6) Urine</td>
                        <td>${specimenData.tube6Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube6Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube6Id}` : '' }</td>
                        <td>${specimenData.tube6Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube6DeviatedReason ? specimenData.tube6DeviatedReason : ''}</td>
                    </tr>
                    <tr>
                        <td>(7) Mouthwash</td>
                        <td>${specimenData.tube7Collected === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                        <td>${specimenData.tube7Collected === true ? `${specimenData.masterSpecimenId} ${specimenData.tube7Id}` : '' }</td>
                        <td>${specimenData.tube7Deviated === true ? 'Yes' : 'No'}</td>
                        <td class="deviation-comments-width">${specimenData.tube7DeviatedReason ? specimenData.tube7DeviatedReason : ''}</td>
                    </tr>

                    <tr>
                        <td>(8) Blood/Urine Bag</td>
                        <td></td>
                        <td>${specimenData.specimenBag1 ? `${specimenData.masterSpecimenId} ${specimenData.specimenBag1}` : '' }</td>
                        <td></td>
                        <td class="deviation-comments-width"></td>
                    </tr>

                    <tr>
                        <td>(9) Mouthwash Bag</td>
                        <td></td>
                        <td>${specimenData.specimenBag2 ? `${specimenData.masterSpecimenId} ${specimenData.specimenBag2}` : '' }</td>
                        <td></td>
                        <td class="deviation-comments-width"></td>
                    </tr>
                </tbody>
            </table>
            </br>
            <form id="finalizeForm" method="POST">
                <div class="form-group row">
                    <div class="col">
                        <label for="finalizedAdditionalNotes">Additional notes on finalization</label>
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
                        <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['masterSpecimenId']}" type="submit" id="finalizedContinue">Finalize - Ready to Ship</button>
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