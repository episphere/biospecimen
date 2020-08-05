export const collectProcessTemplate = (data) => {
    return `
        </br>
        <div class="row">
            <h5>Collection Data Entry</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data.RcrtUP_Lname_v1r0}, ${data.RcrtUP_Fname_v1r0}</div>
                <div class="row">${data.Connect_ID}</div>
            </div>
            <div class="ml-auto form-group">
                Visit: Baseline
            </div>
        </div>
        </br>
        <form id="biospecimenCollectionForm" method="POST">
            <div class="row">
                <table class="table-borderless collection-table">
                    <thead>
                        <tr><th></th><th></th><th><input type="checkbox" id="selectAllCollection"><label for="selectAllCollection">Check All</label></th><th></th></tr>
                        <tr><th>Tube Type</th><th>Scan Tube ID</th><th>Select If Collected</th><th>Select for Deviation</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>(1) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="text" id="tube1Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Blood tubes" data-default-tube-id="0001" id="tube1Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Blood tubes" data-default-tube-id="0001" id="tube1Deviated"></td>
                        </tr>
                        <tr>
                            <td>(2) Red Top Separator</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="text" id="tube2Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Blood tubes" data-default-tube-id="0002" id="tube2Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Blood tubes" data-default-tube-id="0002" id="tube2Deviated"></td>
                        </tr>
                        <tr>
                            <td>(3) Green Top Heparin</br><img src="./static/images/tube2.PNG"></td>
                            <td><input type="text" id="tube3Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Blood tubes" data-default-tube-id="0003" id="tube3Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Blood tubes" data-default-tube-id="0003" id="tube3Deviated"></td>
                        </tr>
                        <tr>
                            <td>(4) Lavender Top EDTA</br><img src="./static/images/tube3.PNG"></td>
                            <td><input type="text" id="tube4Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Blood tubes" data-default-tube-id="0004" id="tube4Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Blood tubes" data-default-tube-id="0004" id="tube4Deviated"></td>
                        </tr>
                        <tr>
                            <td>(5) Yellow Top ACD</br><img src="./static/images/tube1.PNG"></td>
                            <td><input type="text" id="tube5Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Blood tubes" data-default-tube-id="0005" id="tube5Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Blood tubes" data-default-tube-id="0005" id="tube5Deviated"></td>
                        </tr>
                        <tr>
                            <td>(6) Urine</td>
                            <td><input type="text" id="tube6Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Urine" data-default-tube-id="0006" id="tube6Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Urine" data-default-tube-id="0006" id="tube6Deviated"></td>
                        </tr>
                        <tr>
                            <td>(7) Mouthwash</td>
                            <td><input type="text" id="tube7Id" class="form-control" placeholder="Scan/Type in Tube ID"></td>
                            <td><input type="checkbox" class="tube-collected" data-tube-type="Mouthwash" data-default-tube-id="0007" id="tube7Collected"></td>
                            <td><input type="checkbox" class="tube-deviated" data-tube-type="Mouthwash" data-default-tube-id="0007" id="tube7Deviated"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="row">
                <div class="col">
                    <label for="additionalNotes">Additional notes on collection</label>
                    </br>
                    <textarea rows=3 class="form-control" id="additionalNotes"></textarea>
                </div>
            </div>
            </br></br>
            <div classs="row">
                <div class="col">
                    <label>Time all tubes placed in short term storage</label>
                </div>
            </div>

            </br></br>
            <div class="row">
                <div class="col-auto">
                    <button class="btn btn-outline-warning" data-connect-id="${data.Connect_ID}" type="submit" id="collectionSaveExit">Save and Exit</button>
                </div>
                <div class="ml-auto">
                    <button class="btn btn-outline-primary" data-connect-id="${data.Connect_ID}" type="submit" id="collectionNext">Next</button>
                </div>
            </div>
        </form>
    `;
}