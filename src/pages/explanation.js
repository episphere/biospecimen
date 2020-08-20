import { addEventExplanationForm, addEventReturnToCollectProcess } from "./../events.js";
import { generateBarCode } from "../shared.js";

export const explanationTemplate = (dt, biospecimenData) => {
    const notCollected = Array.from(document.getElementsByClassName('tube-collected')).filter(dt => dt.checked === false);
    const deviated = Array.from(document.getElementsByClassName('tube-deviated')).filter(dt => dt.checked === true);
    if(notCollected.length > 0 || deviated.length > 0) {
        let template = `</br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${dt.RcrtUP_Lname_v1r0}, ${dt.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            <div class="ml-auto form-group">
                Visit: ${biospecimenData.visitType}
            </div>
        </div>
        </br>
        <form id="explanationForm" method="POST">`;
        let array = [];
        notCollected.forEach(ele => {
            const tubeType = ele.dataset.tubeType;
            if(array.includes(tubeType)) return
            array.push(tubeType);
            template += `<div class="row"><div class="col">${tubeType} not collected</div></div>
                <div class="row"><div class="col">Master Specimen ID: ${biospecimenData['masterSpecimenId']}</div></div>
                
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Provide reason tube(s) was/were not collected:</label>
                        </br>
                        <textarea rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData.bloodTubeNotCollectedExplanation ? biospecimenData.bloodTubeNotCollectedExplanation : ''}</textarea>
                    </div>
                </div>
            `
        })

        if(deviated.length > 0) template += '<div class="row"><div class="col">Deviations</div></div>'
        deviated.forEach(ele => {
            const tubeLabel = ele.dataset.tubeLabel;
            template += `
                <div class="row"><div class="col">Tube Type: ${tubeLabel}</div></div>
                <div class="row"><div class="col">Tube ID: ${biospecimenData['masterSpecimenId']} ${ele.parentNode.parentNode.querySelectorAll('[type="text"]')[0].value}</div></div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Reason">Select Deviation</label>
                        </br>
                        <select class="form-control" required data-connect-id="${dt.Connect_ID}" id="${ele.id}Reason">
                            <option value=""> -- Select deviation  -- </option>
                            <option ${biospecimenData[`${ele.id}Reason`] === 'Mislabeled' ? 'selected' : ''} value="Mislabeled">Mislabeled</option>
                            <option ${biospecimenData[`${ele.id}Reason`] === 'Broken' ? 'selected' : ''} value="Broken">Broken</option>
                            <option ${biospecimenData[`${ele.id}Reason`] === 'Failed get layer' ? 'selected' : ''} value="Failed get layer">Failed get layer</option>
                            <option ${biospecimenData[`${ele.id}Reason`] === 'Other' ? 'selected' : ''} value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Provide deviation detials</label>
                        </br>
                        <textarea rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData[`${ele.id}Explanation`] ? biospecimenData[`${ele.id}Explanation`] : '' }</textarea>
                    </div>
                </div>
                
            `
        });
        template += `
                </br>
                <div class="form-group row">
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['masterSpecimenId']}" id="returnToCollectProcess">Return to Collect/Process</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['masterSpecimenId']}" type="submit" id="explanationSaveExit">Save and Exit</button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['masterSpecimenId']}" type="submit" id="explanationContinue">Next</button>
                    </div>
                </div>
        `
        template += '</form>'
        document.getElementById('contentBody').innerHTML = template;
        generateBarCode('connectIdBarCode', dt.Connect_ID);
        addEventExplanationForm(dt, biospecimenData.masterSpecimenId);
        addEventReturnToCollectProcess();
    }
}