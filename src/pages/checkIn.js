import { generateBarCode, removeActiveClass } from "./../shared.js";
import { addEventContactInformationModal, addEventCheckInCompleteForm, addEventBackToSearch } from "./../events.js";

export const checkInTemplate = (data) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarParticipantCheckIn');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');
    console.log('DATA::::::', {data});
    let template = `
        </br>
        <div class="row">
            <h5>Participant check-in</h5>
        </div>
        </br>
        <form method="POST" id="checkInCompleteForm" data-connect-id=${data.Connect_ID}>
            <div class="row">
            <div class="col-md-12">
                    <h5>${data['996038075']}, ${data['399159511'] }</h5>
            </div>
            </div>
            <div class="row">
                    <div class="col-md-5"><select class="custom-select" value="Select Visit"><option>Select Visit</option></select>
                    </div>
                    <div class="col-md-3">
                    <button class="btn btn-outline-primary btn-block text-nowrap" type="submit" id="checkInComplete">Check-In</button>
                    </div>
                <div class="ml-auto">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            <hr/>
            
            <div class="row">
            <div class="col-md-12">
                    <h6>Participant Check-In and Check-Out</h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
            <div class="row"><span class="full-width">Consent</span></div>
            <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
            <div class="row"><span class="full-width">${new Date(data['454445267']).toLocaleString()}</span></div>
            </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
            <div class="row"><span class="full-width">Match Verification</span></div>
            <div class="row"><span class="full-width">${data['821247024'] === 197316935 ? `<i class="fas fa-2x fa-check"></i>`: `<i class="fas fa-2x fa-times"></i>`}</span></div>
            <div class="row"></br></div>
            </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
            <div class="row"><span class="full-width">Not Withdrawn</span></div>
            <div class="row"><span class="full-width">${data['821247024'] === 197316935 ? `<i class="fas fa-2x fa-check"></i>`: `<i class="fas fa-2x fa-times"></i>`}</span></div>
            <div class="row"></br></div>
            </div>
            </div>
            </div>
            <br/>

            <div class="row">
            <div class="col-md-12">
                    <h6>Has SSN been entered? </h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">${true ? 'SSN Entered' : "SSN not entered"}</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            </div>
            <br/>

            <div class="row">
            <div class="col-md-12">
                    <h6>Are Initial Surveys complete?</h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">1</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">2</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">3</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            </div>
            <br/>

            <div class="row">
            <div class="col-md-12">
                    <h6>Baseline sample status</h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">1</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">2</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">3</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            </div>
            <br/>

            <div class="row">
            <div class="col-md-12">
                    <h6>Incentives</h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">1</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            
           
            </div>
            <br/>

            <div class="row">
            <div class="col-md-12">
                    <h6>Baseline Specimen Survey</h6>
            </div>
            </div>
            <div class="row">
            <div class="col-md-4">
            <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">1</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                      </div>
            </div>
            
        
            </div>
            <br/>

            <div class="row" style="display: none;">
                Verify contact information &nbsp;
                <button type="button" class="btn btn-outline-primary" id="contactInformationModal" data-target="#biospecimenModal" data-toggle="modal">Contact Information</button>
            </div>
            
            </br>
            <div class="row info-row">
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Consent</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                        <div class="row"><span class="full-width">${new Date(data['454445267']).toLocaleString()}</span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Match Verification</span></div>
                        <div class="row"><span class="full-width">${data['821247024'] === 197316935 ? `<i class="fas fa-2x fa-check"></i>`: `<i class="fas fa-2x fa-times"></i>`}</span></div>
                        <div class="row"></br></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">SSN entered</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                        <div class="row"><span class="full-width">Not entered</span></div>
                    </div>
                </div>
            </div>
            <div class="row info-row">
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Initial Survey - BOH</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Initial Survey - MRE</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Initial Survey - SAS</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Initial Survey - LAW</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
            </div>
            <div class="row info-row">
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline blood</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline mouthwash</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline urine</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
            </div>
        </form>
    `;
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventContactInformationModal(data);
    addEventBackToSearch('navBarSearch');
    addEventBackToSearch('checkInExit');
    addEventCheckInCompleteForm();
}