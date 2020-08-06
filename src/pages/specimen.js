export const specimenTemplate = (data) => {
    return `
        </br>
        <div class="row">
            <h5>Specimen Link</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: ${data.Connect_ID}</div>
            </div>
            <div class="ml-auto form-group">
                Visit: Baseline
            </div>
        </div>
        </br>
        <form id="specimenLinkForm" method="POST">
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan Master Specimen ID</label>
                <input type="text" class="form-control col-md-5" placeholder="Scan in Master Specimen ID from Label Sheet Label" id="scanSpecimenID"/>
            </div>
            </br>
            <div class="form-group row">
                If it can't be scanned:
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID1">Manually Enter Master Specimen ID</label>
                <input type="text" class="form-control col-md-5" placeholder="Manually Enter in Master Specimen ID from Label Sheet Label" id="enterSpecimenID1"/>
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="enterSpecimenID2">Re-enter Master Specimen ID</label>
                <input type="text" class="form-control col-md-5" placeholder="Re-enter Master Specimen ID" id="enterSpecimenID2"/>
            </div>

            <div class="form-group row">
                Is the Master Specimen ID correct for the participant?
            </div>
            <div class="form-group row">
                <div class="col-auto">
                    <button class="btn btn-outline-danger" id="reEnterSpecimen">No: Re-enter Master Specimen ID</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="submit" id="specimenSaveExit">Yes: Save and Exit</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="submit" id="specimenContinue">Yes: Continue</button>
                </div>
            </div>
        </form>
        </br>
    `;
}