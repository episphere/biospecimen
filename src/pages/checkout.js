import { addEventBackToSearch, addEventCheckOutComplete, addEventQRCodeBtn } from "../events.js";
import { generateBarCode, removeActiveClass } from "./../shared.js";

export const checkOutScreen = (data, specimenData) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('participantCheckOut');
    navBarBtn.classList.remove('disabled');
    navBarBtn.classList.add('active');
    let template = '';
    template += `
        <div class="row">
            <h5>Participant Check Out</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data['996038075']}, ${data['399159511']}</div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <strong>Status of biospecimen questionnaires.</strong>
            </div>
        </div>
        </br>
        <div class="row info-row">
            <div class="col-md-3">
                <div class="col-md-12 info-box">
                    <div class="row"><span class="full-width">Blood/Urine Questionnaire</span></div>
                    <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                </div>
            </div>
        </div>
        <div class="row info-row">
            <div class="col-md-3">
                <div class="col-md-12 info-box">
                    <div class="row"><span class="full-width">Mouthwash Questionnaire</span></div>
                    <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                </div>
            </div>
        </div>
        <div class="row info-row">
            <div class="col-md-3">
                <strong>Incentives</strong>
                <div class="col-md-12 info-box">
                    <div class="row"><span class="full-width">Not Eligible</span></div>
                    <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                </div>
            </div>
        </div>
        <div class="row info-row">
            <div class="col-md-3">
                <div class="col-md-12 info-box">
                    <div class="row"><span class="full-width">Baseline Module 3</span></div>
                    <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    <div class="row"><span class="full-width">Not Completed</span></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="col-md-12 info-box">
                    <div class="row"><span class="full-width">Baseline Module 4</span></div>
                    <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    <div class="row"><span class="full-width">Not Completed</span></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <button class="btn btn-outline-dark" id="checkInExit"><i class="fas fa-arrow-left"></i> Exit</button>
            </div>
            <div class="ml-auto">
                <button class="btn btn-outline-primary" id="checkOutExit">Check-Out complete</button>
            </div>
        </div>
    `;
    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToSearch('checkInExit');
    addEventCheckOutComplete(specimenData);
    addEventQRCodeBtn();
}