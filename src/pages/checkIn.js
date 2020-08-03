export const checkInTemplate = (data) => {
    return `
        </br>
        <div class="row">
            <h5>Participant check-in</h5>
        </div>
        </br>
        <form method="POST" id="checkInCompleteForm">
            <div class="row">
                <div class="col">
                    <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                    <div class="row">${data.Connect_ID}</div>
                </div>
                <div class="ml-auto form-group">
                    <label for="biospecimenVisitType">Visit</label>
                    <select class="form-control" required data-connect-id="${data.Connect_ID}" id="biospecimenVisitType">
                        <option value=""> -- Select Visit -- </option>
                        <option value="baseline">Baseline</option>
                    </select>
                </div>
            </div>
            
            </br>
            <div class="row info-row">
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Consent</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-check"></i></span></div>
                        <div class="row"><span class="full-width">${new Date(data.RcrtCS_ConsentSumit_v1r0).toLocaleString()}</span></div>
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
                        <div class="row"><span class="full-width">Baseline module 1</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline module 2</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline module 3</span></div>
                        <div class="row"><span class="full-width"><i class="fas fa-2x fa-times"></i></span></div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="col-md-12 info-box">
                        <div class="row"><span class="full-width">Baseline module 4</span></div>
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
            </br>
            <div class="row">
                <div class="col">
                    <button class="btn btn-outline-dark" id="checkInExit"><i class="fas fa-arrow-left"></i> Exit</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-primary" type="submit" id="checkInComplete">Check-In complete</button>
                </div>
            </div>
        </form>
    `
}