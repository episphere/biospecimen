import { getIdToken, findParticipant, showAnimation, hideAnimation } from "../../shared.js";
import fieldMapping from "../../fieldToConceptIdMapping.js";
import { humanReadableFromISO } from "../../utils.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";

export const printAddressesScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const username = user.displayName ? user.displayName : user.email;
    printaddressesTemplate(auth, route);
  
}             

const printaddressesTemplate = async (auth, route) => {
    showAnimation();
    const response = await findParticipant('firstName=Deanna');
    hideAnimation()
    console.log('participantsList', response.data)
    let template = ``;
    template += homeCollectionNavbar();
    template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h4 style="text-align: center;">Print Addresses </h4> </span>
                        <div class="sticky-header">
                                <table class="table table-striped" id="participantData">
                                    <thead class="thead-dark sticky-row"> 
                                        <tr>
                                            <th class="sticky-row" scope="col">Select to print address</th>
                                            <th class="sticky-row" scope="col">First Name</th>
                                            <th class="sticky-row" scope="col">Last Name</th>
                                            <th class="sticky-row" scope="col">Connect ID</th>
                                            <th class="sticky-row" scope="col">Kit Status</th>
                                            <th class="sticky-row" scope="col">Street</th>
                                            <th class="sticky-row" scope="col">Address 2</th>
                                            <th class="sticky-row" scope="col">City</th>
                                            <th class="sticky-row" scope="col">State</th>
                                            <th class="sticky-row" scope="col">Zip Code</th>
                                            <th class="sticky-row" scope="col">Date Requested</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                        ${createParticipantRows(response.data)}
                                    </tbody>
                              </table>
                        </div>
                    </div> 
                </div>
                <br />
                <span><h6>Search for a Connect ID:</h6> </span>
                <br />
                <button type="button" id='generateCsv' class="btn btn-success btn-lg">Generate Address File</button>
                <button type="button" class="btn btn-primary btn-lg" style="float: right;">Continue to Participant Selection</button>
                </div>`
    document.getElementById('contentBody').innerHTML = template;
    generateParticipantCsvGetter();
}


const createParticipantRows = (participantRows) => {
    let template = ``;
    participantRows.forEach(i => {
    template += `
                <tr class="row-color-enrollment-dark">
                    <td> <input type="checkbox" id="scales" name="scales"></td>
                    <td>${i[fieldMapping.fName] && i[fieldMapping.fName]}</td>
                    <td>${i[fieldMapping.lName] && i[fieldMapping.lName]}</td>
                    <td>${i.Connect_ID && i.Connect_ID}</td>
                    <td>N/A</td>
                    <td>${i[fieldMapping.address1] && i[fieldMapping.address1]}</td>
                    <td>${i[fieldMapping.address2] != undefined ? i[fieldMapping.address2] : ``}</td>
                    <td>${i[fieldMapping.city] && i[fieldMapping.city]}</td>
                    <td>${i[fieldMapping.state] && i[fieldMapping.state]}</td>
                    <td>${i[fieldMapping.zip] && i[fieldMapping.zip]}</td>
                    <td>${i[fieldMapping.verficationDate] && humanReadableFromISO(i[fieldMapping.verficationDate])}</td>
                </tr>`
            });
    return template;
}

const generateParticipantCsvGetter = () => {
    const a = document.getElementById('generateCsv');
    console.log('1', a)
    if (a) {
        a.addEventListener('click',  () => {
        generateParticipantCsv('participantData');
        console.log('2')
    })
}
}

const generateParticipantCsv = ( table_id, separator = ',' ) => {
    console.log('3')
        // Select rows from table_id
        var rows = document.querySelectorAll('table#' + table_id + ' tr');
        // Construct csv
        var csv = [];
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll('td, th');
            for (var j = 0; j < cols.length; j++) {
                // Clean innertext to remove multiple spaces and jumpline (break csv)
                var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
                // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
                data = data.replace(/"/g, '""');
                // Push escaped string
                row.push('"' + data + '"');
            }
            csv.push(row.join(separator));
        }
        var csv_string = csv.join('\n');
        // Download it
        var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
        var link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('target', '_blank');
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
