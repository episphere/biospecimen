import { addEventExplanationForm, addEventExplanationFormCntd, addEventReturnToCollectProcess } from "./../events.js";
import { generateBarCode, getWorflow, visitType } from "../shared.js";
import { finalizeTemplate } from "./finalize.js";
import { workflows } from "../tubeValidation.js";

export const explanationTemplate = (dt, biospecimenData) => {
    const notCollected = Array.from(document.getElementsByClassName('tube-collected')).filter(dt => dt.checked === false);
    const deviated = Array.from(document.getElementsByClassName('tube-deviated')).filter(dt => dt.checked === true);
    const tubes = workflows[getWorflow()];
    if(notCollected.length > 0 || deviated.length > 0) {
        let template = `</br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${dt['996038075']}, ${dt['399159511']}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            ${biospecimenData['331584571'] ? `
                <div class="ml-auto form-group">
                    Visit: ${visitType[biospecimenData['331584571']]}
                </div>
            ` : ``
            }
        </div>
        </br>
        <form id="explanationForm" method="POST">`;
        let array = [];
        notCollected.forEach(ele => {
            const notCollectedOptions = tubes.filter(tube => tube.concept === ele.id)[0].tubeNotCollectedOptions
            const tubeType = ele.dataset.tubeType;
            if(array.includes(tubeType)) return
            array.push(tubeType);
            template += `<div class="row"><div class="col"><strong>${tubeType} not collected</strong></div></div>
                <div class="row"><div class="col">Collection ID: ${biospecimenData['820476880']}</div></div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Reason">Provide reason tube(s) was/were not collected:</label>
                        </br>
                        <select class="form-control" required data-connect-id="${dt.Connect_ID}" id="${ele.id}Reason">
                            <option value=""> -- Select reason  -- </option>`
                            notCollectedOptions.forEach(obj => {
                                template += `<option ${biospecimenData[`${ele.id}`]['883732523'] == `${obj.concept}` ? 'selected' : ''} value="${obj.concept}">${obj.label}</option>`;
                            })
                        template += `</select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Details (Optional)</label>
                        </br>
                        <textarea rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData[`${ele.id}`]['338286049'] ? biospecimenData[`${ele.id}`]['338286049'] : ''}</textarea>
                    </div>
                </div>
                </br>
            `
        })

        if(deviated.length > 0) template += '<div class="row"><div class="col"><strong>Deviations</strong></div></div>'
        deviated.forEach(ele => {
            const tubeId = ele.id.replace('Deviated', '');
            const deviationOptions = tubes.filter(tube => tube.concept === tubeId)[0].deviationOptions;
            const tubeLabel = ele.dataset.tubeLabel;
            template += `
                <div class="row"><div class="col">Tube Type: <strong>${tubeLabel}</strong></div></div>
                <div class="row"><div class="col">Full Specimen ID: ${ele.parentNode.parentNode.querySelectorAll('[type="text"]')[0].value}</div></div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Reason">Select Deviation</label>
                        </br>
                        <select class="form-control" required data-connect-id="${dt.Connect_ID}" id="${ele.id}Reason" multiple="multiple">`
                            for(let obj of deviationOptions){
                                template += `<option ${biospecimenData[tubeId]['248868659'] && biospecimenData[tubeId]['248868659'].includes(obj.concept) ? 'selected' : ''} value="${obj.concept}">${obj.label}</option>`
                            };

                        template +=`</select>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col">
                        <label for="${ele.id}Explanation">Details (Optional)</label>
                        </br>
                        <textarea rows=3 class="form-control additional-explanation" id="${ele.id}Explanation">${biospecimenData[tubeId]['536710547'] ? biospecimenData[tubeId]['536710547'] : '' }</textarea>
                    </div>
                </div>
                </br>
            `
        });
        template += `
                </br>
                <div class="form-group row">
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['820476880']}" id="returnToCollectProcess">${getWorflow() === 'research' ? 'Return to Process' : 'Return to Labeling and Receipt'}</button>
                    </div>
                    <div class="ml-auto">
                        <button class="btn btn-outline-warning" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['820476880']}" type="button" id="explanationSaveExit">Exit</button>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary" data-connect-id="${dt.Connect_ID}" data-master-specimen-id="${biospecimenData['820476880']}" type="submit" id="explanationContinue">Next</button>
                    </div>
                </div>
        `
        template += '</form>'
        document.getElementById('contentBody').innerHTML = template;
        generateBarCode('connectIdBarCode', dt.Connect_ID);
        addEventExplanationForm(dt, biospecimenData);
        addEventExplanationFormCntd(dt, biospecimenData);
        addEventReturnToCollectProcess();
    }
    else {
        finalizeTemplate(dt, biospecimenData);
    }
}