import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import fieldMapping from "../../fieldToConceptIdMapping.js";
import { humanReadableFromISO } from "../../utils.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";

import { fakeParticipants } from "./fakeParticipants.js";

export const printAddressesScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  printaddressesTemplate(auth, route);
};

// Stringify array of objects and parse fake participants Data
const fakeParticipantsData = JSON.parse(JSON.stringify(fakeParticipants));

const printaddressesTemplate = async (auth, route) => {
  showAnimation();
  const response = await findParticipant("firstName=Deanna");
  hideAnimation();
  //   console.log(response);
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center;">Print Addresses </h3> </span>
                        <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Select to print address</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Address 1</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Address 2</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">City</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">State</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Zip Code</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
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
                </div>`;
  document.getElementById("contentBody").innerHTML = template;

  generateParticipantCsvGetter();
  redirectDropdownScreen();
};

const redirectDropdownScreen = () => {
  const a = document.getElementById("btnParticipantSearch");
  a.addEventListener("click", () => {
    const selection = document.getElementById("paticipantSelection");
    if (selection.value === "pending") {
      location.hash = "#participantselection";
    } else if (selection.value === "addressPrinted") {
      location.hash = "#addressPrinted";
    } else if (selection.value === "assigned") {
      location.hash = "#assigned";
    }
  });
};

// TODO: Add this back to <tbody> element ${createParticipantRows(response.data)} ***
const createParticipantRows = (participantRows) => {
  let template = ``;
  participantRows.forEach((i) => {
    template += `
                <tr class="row-color-enrollment-dark participantRow">
                    <td> <input type="checkbox" class="ptSelection" data-participantHolder = ${storeParticipantInfo(
                      i
                    )} name="ptSelection"></td>
                    <td>${i[fieldMapping.fName] && i[fieldMapping.fName]}</td>
                    <td>${i[fieldMapping.lName] && i[fieldMapping.lName]}</td>
                    <td>${i.Connect_ID && i.Connect_ID}</td>
                    <td>Pending</td>
                    <td>${
                      i[fieldMapping.address1] && i[fieldMapping.address1]
                    }</td>
                    <td>${
                      i[fieldMapping.address2] != undefined
                        ? i[fieldMapping.address2]
                        : ``
                    }</td>
                    <td>${i[fieldMapping.city] && i[fieldMapping.city]}</td>
                    <td>${i[fieldMapping.state] && i[fieldMapping.state]}</td>
                    <td>${i[fieldMapping.zip] && i[fieldMapping.zip]}</td>
                    <td>${
                      i[fieldMapping.verficationDate] &&
                      humanReadableFromISO(i[fieldMapping.verficationDate])
                    }</td>
                </tr>`;
  });
  return template;
};

/*
tbody tag - ${createParticipantRows(fakeParticipantsData)}
*/
// const createParticipantRows = (participantRows) => {
//   let template = ``;
//   participantRows.forEach((i) => {
//     // TODO: ADD BACK LATER WHEN REAL DATA IS USED
//     //   template += `
//     //                 <tr class="row-color-enrollment-dark participantRow">
//     //                     <td> <input type="checkbox" class="ptSelection" data-participantHolder = ${storeParticipantInfo(
//     //                       i
//     //                     )} name="ptSelection"></td>
//     //                     <td>${i[fieldMapping.fName] && i[fieldMapping.fName]}</td>
//     //                     <td>${i[fieldMapping.lName] && i[fieldMapping.lName]}</td>
//     //                     <td>${i.Connect_ID && i.Connect_ID}</td>
//     //                     <td>Pending</td>
//     //                     <td>${
//     //                       i[fieldMapping.address1] && i[fieldMapping.address1]
//     //                     }</td>
//     //                     <td>${
//     //                       i[fieldMapping.address2] != undefined
//     //                         ? i[fieldMapping.address2]
//     //                         : ``
//     //                     }</td>
//     //                     <td>${i[fieldMapping.city] && i[fieldMapping.city]}</td>
//     //                     <td>${i[fieldMapping.state] && i[fieldMapping.state]}</td>
//     //                     <td>${i[fieldMapping.zip] && i[fieldMapping.zip]}</td>
//     //                     <td>${
//     //                       i[fieldMapping.verficationDate] &&
//     //                       humanReadableFromISO(i[fieldMapping.verficationDate])
//     //                     }</td>
//     //                 </tr>`;
//     template += `
//                     <tr class="row-color-enrollment-dark participantRow">
//                         <td> <input type="checkbox" class="ptSelection" data-participantHolder = ${storeParticipantInfo(
//                           i
//                         )} name="ptSelection"></td>
//                         <td>${i.first_name}</td>
//                         <td>${i.last_name}</td>
//                         <td>${i.connect_id}</td>
//                         <td>${i.kit_status}</td>
//                         <td>${i.address_1}</td>
//                         <td>${i.address_2}</td>
//                         <td>${i.city}</td>
//                         <td>${i.state}</td>
//                         <td>${i.zip_code}</td>
//                         <td>${i.date_requested}</td>
//                     </tr>`;
//   });

//   return template;
// };

const storeParticipantInfo = (i) => {
  let participantHolder = {};
  participantHolder["firstName"] =
    i[fieldMapping.fName] && i[fieldMapping.fName];
  participantHolder = JSON.stringify(participantHolder);
  return participantHolder;
};

const generateParticipantCsvGetter = () => {
  // const participantRow = Array.from(document.getElementsByClassName('participantRow'));
  // if (participantRow) {
  //     participantRow.forEach(element => {
  //     const checkboxPt = element.getElementsByClassName('ptSelection')[0];
  //     checkboxPt.addEventListener('change', function() {
  //         console.log('r')
  //         if (checkboxPt.checked) {
  //         console.log("Checkbox is checked..", checkboxPt.dataset.participantholder);
  //         } else {
  //         console.log("Checkbox is not checked..");
  //         }
  //     });
  // })}
  const a = document.getElementById("generateCsv");
  if (a) {
    a.addEventListener("click", () => {
      generateParticipantCsv("participantData");
      console.log("2");
    });
  }
};

const generateParticipantCsv = (table_id, separator = ",") => {
  console.log("3");
  // Select rows from table_id
  var rows = document.querySelectorAll("table#" + table_id + " tr");
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      var data = cols[j].innerText
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/(\s\s)/gm, " ");
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(separator));
  }
  var csv_string = csv.join("\n");
  // Download it
  var filename =
    "export_" + table_id + "_" + new Date().toLocaleDateString() + ".csv";
  var link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string)
  );
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

console.log(JSON.parse(JSON.stringify(fakeParticipants)));
