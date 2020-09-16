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
            const reasonLabel = tubeType === 'Blood tubes' ? 'bloodTubeNotCollectedReason' : tubeType === 'Urine' ? 'urineTubeNotCollectedReason' : 'mouthWashTubeNotCollectedReason';
            template += `<div class="row"><div class="col"><strong>${tubeType} not collected</strong></div></div>
                <div class="row"><div class="col">Master Specimen ID: ${biospecimenData['masterSpecimenId']}</div></div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Reason">Provide reason tube(s) was/were not collected:</label>
                        </br>
                        <select class="form-control" required data-connect-id="${dt.Connect_ID}" id="${ele.id}Reason">
                            <option value=""> -- Select reason  -- </option>
                            <option ${biospecimenData[reasonLabel] === 'short draw' ? 'selected' : ''} value="short draw">Short draw</option>
                            <option ${biospecimenData[reasonLabel] === 'participant refusal' ? 'selected' : ''} value="participant refusal">Participant refusal</option>
                            <option ${biospecimenData[reasonLabel] === 'participant unable' ? 'selected' : ''} value="participant unable">Participant unable</option>
                            <option ${biospecimenData[reasonLabel] === 'other' ? 'selected' : ''} value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Provide details</label>
                        </br>
                        <textarea required rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData.bloodTubeNotCollectedExplanation ? biospecimenData.bloodTubeNotCollectedExplanation : ''}</textarea>
                    </div>
                </div>
                </br>
            `
        })

        if(deviated.length > 0) template += '<div class="row"><div class="col"><strong>Deviations</strong></div></div>'
        deviated.forEach(ele => {
            const tubeLabel = ele.dataset.tubeLabel;
            template += `
                <div class="row"><div class="col">Tube Type: <strong>${tubeLabel}</strong></div></div>
                <div class="row"><div class="col">Tube ID: ${biospecimenData['masterSpecimenId']} ${ele.parentNode.parentNode.querySelectorAll('[type="text"]')[0].value}</div></div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Reason">Select Deviation</label>
                        </br>
                        <select class="form-control" required data-connect-id="${dt.Connect_ID}" id="${ele.id}Reason" multiple="multiple">
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('broken') ? 'selected' : ''} value="broken">Broken</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('failed get layer') ? 'selected' : ''} value="failed get layer">Failed get layer</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('hemolyzed') ? 'selected' : ''} value="hemolyzed">Hemolyzed</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('improper temperature – please include details below') ? 'selected' : ''} value="improper temperature – please include details below">Improper temperature – please include details below</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('mislabeled') ? 'selected' : ''} value="mislabeled">Mislabeled</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('tube not filled') ? 'selected' : ''} value="tube not filled">Tube not filled</option>
                            <option ${biospecimenData[`${ele.id}Reason`] && biospecimenData[`${ele.id}Reason`].includes('other') ? 'selected' : ''} value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Provide deviation detials</label>
                        </br>
                        <textarea required rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData[`${ele.id}Explanation`] ? biospecimenData[`${ele.id}Explanation`] : '' }</textarea>
                    </div>
                </div>
                </br>
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