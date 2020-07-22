export const checkInTemplate = (data) => {
    console.log(data);
    return `
        </br>
        <div class="row">
            <h5>Participant check-in</h5>
        </div>
        </br>
        <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
        <div class="row">${data.Connect_ID}</div>
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
        <div>
        
        </div>

    `
}