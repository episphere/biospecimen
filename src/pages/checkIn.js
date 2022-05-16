import { generateBarCode, removeActiveClass, visitType, checkedIn, getCheckedInVisit, verificationConversion, participationConversion, surveyConversion, getCollectionsByVisit } from "./../shared.js";
import { addEventContactInformationModal, addEventCheckInCompleteForm, addEventBackToSearch, addEventVisitSelection } from "./../events.js";

export const checkInTemplate = async (data) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarParticipantCheckIn');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    const isCheckedIn = checkedIn(data);
    const visitCollections = isCheckedIn ? await getCollectionsByVisit(data) : '';
    
    let template = `
        </br>
        <div class="row">
            ${isCheckedIn ? `<h5>Participant Check-Out</h5>` : `<h5>Participant Check-In</h5>`}
        </div>
        </br>
        <form method="POST" id="checkInCompleteForm" data-connect-id=${data.Connect_ID}>
            <div class="row">
                <div class="col-md-12">
                    <h5>${data['996038075']}, ${data['399159511']}</h5>
                    <h5>Login Method: ${data['995036844']}</h5>
                </div>
            </div>
            <div class="row">
                <div class="col-md-5">`
                    
                    if(isCheckedIn) {
                        template += `<h5>Visit: ${visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0].visitType}</h5>`
                    }
                    else {
                        template += `<select class="custom-select" id="visit-select">
                                        <option value=""> -- Select Visit -- </option>`;
                                        
                        Array.from(visitType).forEach(option => {
                            template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                        })

                        template += `</select>`;
                    }
                        
                template += `

                </div>
                <div class="col-md-3">
                    <button class="btn btn-outline-primary btn-block text-nowrap" ${!isCheckedIn ? `disabled` : visitCollections && visitCollections.length > 0 ? `` : `disabled`} type="submit" id="checkInComplete">${isCheckedIn ? `Check-Out` : `Check-In`}</button>
                </div>
                <div class="ml-auto">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            <hr/>`
            
        template += participantStatus(data) + 

        `</form>
    `;

    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventContactInformationModal(data);
    addEventBackToSearch('navBarSearch');
    addEventCheckInCompleteForm(isCheckedIn);
    addEventVisitSelection();
}

const participantStatus = (data) => {
    
    return `
        <div class="row">
            <div class="col-md-12">
                <h5>Confirm participant has consented, been verified and has not withdrawn</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Consent</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['919254129'] === 353358909 ? `<i class="fas fa-2x fa-check"></i>` : `<i class="fas fa-2x fa-times"></i>`}</i></span>
                    </div>
                    <div class="row">
                        <span class="full-width">${new Date(data['454445267']).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Verification Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['821247024'] === 197316935 ? `<i class="fas fa-2x fa-check"></i>`: `<i class="fas fa-2x fa-times"></i>`}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${verificationConversion[data['821247024']]}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Participation Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['912301837'] === 208325815 ? `<i class="fas fa-2x fa-check"></i>` : `<i class="fas fa-2x fa-times"></i>`}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${participationConversion[data['912301837']]}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Has SSN been entered? </h5>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <br>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['311580100'] === 353358909 ? 'Full SSN Received' : data['914639140'] === 353358909 ? 'Partial SSN Received' : 'No SSN Entered'}</span>
                    </div>
                    <div class="row">
                        <br>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">SSN Survey Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['126331570']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['126331570'] === 615768760 ? data['943232079'] : data['126331570'] === 231311385 ? data['315032037'] : '<br>'}</span>
                    </div>
                    <div class="row">
                        <br>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Are Initial Surveys complete?</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Background and Overall Health</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['949302066']]}</span>
                    </div>    
                    <div class="row">
                        <span class="full-width">${data['949302066'] === 615768760 ? data['205553981'] : data['949302066'] === 231311385 ? data['517311251'] : '<br>'}</span>
                    </div> 
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Medications, Reproductive Health, Excercise, and Sleep</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['536735468']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['536735468'] === 615768760 ? data['541836531'] : data['536735468'] === 231311385 ? data['832139544'] : ''}</span>
                    </div> 
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Smoking, Alcohol, and Sun Exposure</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['976570371']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['976570371'] === 615768760 ? data['386488297'] : data['976570371'] === 231311385 ? data['770257102'] : '<br>'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Where you live and work</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['663265240']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['663265240'] === 615768760 ? data['452942800'] : data['663265240'] === 231311385 ? data['264644252'] : '<br>'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Baseline sample status</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Blood</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['878865966'] === 353358909 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['878865966'] === 353358909 ? 'Collected' : 'Not Collected'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Mouthwash</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['684635302'] === 353358909 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['684635302'] === 353358909 ? 'Collected' : 'Not Collected'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Urine</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['167958071'] === 353358909 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['167958071'] === 353358909 ? 'Collected' : 'Not Collected' }</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Incentives</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">${data['130371375']['266600170']['731498909'] === 353358909 ? 'Eligible' : 'Not Eligible'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['130371375']['266600170']['731498909'] === 353358909 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['130371375']['266600170']['731498909'] === 353358909 ? data['130371375']['266600170']['787567527'] : '<br/>'}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Baseline Specimen Survey</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Specimen Survey</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['265193023'] === 231311385 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['265193023']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['265193023'] === 615768760 ? data['822499427'] : data['265193023'] === 231311385 ? data['222161762'] : ''}</span>
                    </div>
                 </div>
            </div>
        </div>
            
        <br/>

        <div class="row" style="display: none;">
            Verify contact information &nbsp;
            <button type="button" class="btn btn-outline-primary" id="contactInformationModal" data-target="#biospecimenModal" data-toggle="modal">Contact Information</button>
        </div>
    `;
    
}