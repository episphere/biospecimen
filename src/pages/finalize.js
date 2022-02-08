import { removeActiveClass, generateBarCode, visitType, getSiteTubesLists, getWorflow, getCheckedInVisit } from "./../shared.js";
import { addEventFinalizeForm, addEventFinalizeFormCntd, addEventReturnToCollectProcess } from "./../events.js";

export const finalizeTemplate = (data, specimenData) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarReview');
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');
    let template = '';

    template += `
        <div class="row">
            <h5>Finalize Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data['996038075']}, ${data['399159511']}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
                <div class="row">Collection ID: ${specimenData['820476880']}</div>
                <div class="row">Specimen Collection Date & Time: ${new Date(specimenData['678166505']).toLocaleString()}</div>
            </div>
            ${specimenData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType.filter(visit => visit.concept == specimenData['331584571'])[0].visitType}
                </div>
            ` : ``
            }
        </div>
        </br>
        <div class="row">
            <table id="finalizeTable" class="table-borderless collection-table">
                <thead>
                    <tr>
                        <th>Specimen Type</th>
                        ${getWorflow() === 'clinical' ? `<th>Received</th>`:`<th>Collected</th>`}
                        ${getWorflow() === 'research' ? `<th>Reason</th>` : ''}
                        <th>Full Specimen ID</th>
                        <th>Deviation</th>
                        <th>Deviation Type</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>`
                const siteTubesList = getSiteTubesLists(specimenData)
                siteTubesList.forEach((obj) => {

                    const notCollectedOptions = siteTubesList.filter(tube => tube.concept === obj.concept)[0].tubeNotCollectedOptions;
                    let deviationSelections = [];

                    if(obj.deviationOptions) {
                        obj.deviationOptions.forEach(option => {
                            if(specimenData[obj.concept]['248868659'][option.concept] === 353358909) deviationSelections.push(option.label);
                        });
                    }

                    template += `
                        <tr>
                            <td>${obj.specimenType}</td>
                            <td>${obj.collectionChkBox === true ? `${specimenData[`${obj.concept}`]['593843561'] === 353358909 ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}` : ``}</td>
                            ${getWorflow() === 'research' ? `<td>${specimenData[`${obj.concept}`]['883732523'] ? notCollectedOptions.filter(option => option.concept == specimenData[`${obj.concept}`]['883732523'])[0].label : ''}</td>` : ''}
                            <td>${specimenData[`${obj.concept}`]['593843561'] === 353358909 && specimenData[`${obj.concept}`]['825582494'] ? `${specimenData[`${obj.concept}`]['825582494']}` : '' }</td>
                            <td>${obj.deviationChkBox === true ? `${specimenData[`${obj.concept}`]['678857215'] === 353358909 ? 'Yes' : 'No'}`: ``}</td>
                            <td class="deviation-comments-width">${deviationSelections ? deviationSelections : ''}</td>
                            <td class="deviation-comments-width">${specimenData[`${obj.concept}`]['536710547'] ? specimenData[`${obj.concept}`]['536710547'] : specimenData[`${obj.concept}`]['338286049'] ? specimenData[`${obj.concept}`]['338286049'] : ''}</td>
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
                        <textarea rows=3 disabled class="form-control" id="finalizedAdditionalNotes">${specimenData['338570265'] ? `${specimenData['338570265']}` : ''}</textarea>
                    </div>
                </div>
                </br>
                <div class="form-group row">
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" type="button" data-connect-id="${data.Connect_ID}" id="returnToCollectProcess" data-master-specimen-id="${specimenData['820476880']}">${getWorflow() === 'research' ? 'Return to Tube Collection' : 'Return to Labeling and Scanning'}</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" data-master-specimen-id="${specimenData['820476880']}" type="button" id="finalizedSaveExit">Exit</button>
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