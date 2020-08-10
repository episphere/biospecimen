export const finalizeTemplate = (data, specimenData) => {
    console.log(specimenData)
    let template = '';

    template += `
        <div class="row">
            <h5>Finalize Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">Connect ID: ${data.Connect_ID}</div>
                <div class="row">Master Specimen ID: ${specimenData.masterSpecimenId}</div>
            </div>
            <div class="ml-auto form-group">
                Visit: ${specimenData.visitType}
            </div>
        </div>
        </br>
    `;
    document.getElementById('contentBody').innerHTML = template;
}