import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, baseAPI, appState, triggerErrorModal, triggerSuccessModal } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./activeHomeCollectionNavbar.js";


const contentBody = document.getElementById("contentBody");

export const printLabelsScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  appState.setState({'length': 0 })
  await initializeTotalAddressesToPrint();
  printLabelsTemplate(name);
  hideAnimation();
}

const printLabelsTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                  <div class="col">
                  <div id="alert_placeholder"></div>
                    <h3 style="margin:1rem 0 1.5rem;">Print Labels</h3>
                    <div class="container-fluid" style="padding-top: 50px;">     
                    <div class="card">
                      <div class="card-body">
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">How many labels to print?</h3> </span>
                        <div style="text-align: center;  padding-bottom: 25px; "> 
                          <input required type="text" name="numberToPrint" id="numberToPrint"  /> 
                        </div>
                        <span> Labels to print: ${ appState.getState().length || 0}  </span>
                        <br />
                        <div class="mt-4 mb-4" style="display:inline-block;">
                          <button type="button" class="btn btn-primary" id="clearForm" disabled>View All Printed Labels</button>
                          <button type="submit" class="btn btn-primary" id="generateCsv">Download CSV File</button>
                        </div>
                        </div>
                      </div>
                  </div>
                    
                  </div>
                </div>`;

  template += `
        <div style="overflow:auto; height:45vh">
        </div>`;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;
  activeHomeCollectionNavbar();

  generateParticipantCsvGetter(name);
};

const initializeTotalAddressesToPrint = async () => {
  showAnimation();
  const totalAddresses = await getTotalAddressesToPrint();
  appState.setState({'totalAddresses': totalAddresses.data})
  appState.setState({'length': totalAddresses.data.length })
  hideAnimation();
}

export const getTotalAddressesToPrint = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=totalAddressesToPrint`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

const generateParticipantCsvGetter = (name) => {
  const generateCsvButton = document.getElementById("generateCsv");
  if (generateCsvButton) {
    generateCsvButton.addEventListener("click", () => {
        const numberToPrint = document.getElementById("numberToPrint").value;
          if (numberToPrint) {
            const arrayLengthToProcess = appState.getState().length
            if (arrayLengthToProcess >= numberToPrint) {
              const arrayToProcess = appState.getState().totalAddresses
              const remainingArrayToProcess = arrayToProcess.slice(numberToPrint, appState.getState().length)
              appState.setState({totalAddresses: remainingArrayToProcess })
              appState.setState({'length': remainingArrayToProcess.length })
              generateParticipantCsv(arrayToProcess.slice(0, numberToPrint));
              printLabelsTemplate(name);
              triggerSuccessModal('Success!');                 // Display success message
            }
            else {
              triggerErrorModal('Out of bounds!');
            } 
          }
      });
  }
};

const generateParticipantCsv = (items) => {
  let csv = ``;
  let participantsForKitUpdate = []
  csv += `first_name, last_name, address_1, address_2, city, state, zip_code, connect_id, \r\n`
  for (let row = 0; row < (items.length); row++) {
    let keysAmount = Object.keys(items[row]).length
    let keysCounter = 0
    participantsForKitUpdate.push(items[row]['connect_id'])
    for(let key in items[row]) {
      csv += items[row][key] + (keysCounter + 1 < keysAmount ? ',' : '\r\n') 
      keysCounter++
    }
  }
  let link = document.createElement("a");
  link.id = "download-csv";
  link.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(csv));
  link.setAttribute("download",`${new Date().toLocaleDateString()}-participant-address-export.csv`);
  document.body.appendChild(link);
  document.querySelector("#download-csv").click();
  document.body.removeChild(link);
  const response = setKitStatusToParticipant(participantsForKitUpdate);
  if (!response) triggerErrorModal('Error while updating participant(s) kit status.')
}

const setKitStatusToParticipant = async (data) => {
  const idToken = await getIdToken();
  await fetch(`${baseAPI}api=kitStatusToParticipant`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });
}