import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, baseAPI, appState, triggerErrorModal, triggerSuccessModal } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";


const contentBody = document.getElementById("contentBody");

export const printLabelsScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  appState.setState({'totalAddressesLength': 0 })
  await initializeTotalAddressesToPrint();
  printLabelsTemplate(name);
  hideAnimation();
}

const printLabelsTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `<div class="row align-center welcome-screen-div">
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
                        <span> Labels to print: ${ appState.getState().totalAddressesLength || 0 }  </span>
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
  if (appState.getState().totalAddressesLength === 0) triggerErrorModal('No labels to print');
  generateParticipantCsvGetter(name);
};

const initializeTotalAddressesToPrint = async () => {
  try {
    showAnimation();
    const totalAddressCount = await getAddressesToPrintCount();
    appState.setState({'totalAddressesLength': totalAddressCount.data })
  } catch(err) {
    console.error('Error initializing total addresses to print', err);
  } finally {
    hideAnimation();
  }
  
}

export const getAddressesToPrintCount = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=totalAddressesToPrintCount`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

export const getTotalAddressesToPrint = async (limit) => {
  const idToken = await getIdToken();
  let url = `${baseAPI}api=totalAddressesToPrint`;
  if(limit) {
    url += `&limit=${limit}`
  }
  const response = await fetch(url, {
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
    generateCsvButton.addEventListener("click", async () => {
      const totalAddressesLength = appState.getState().totalAddressesLength;
        const numberToPrint = document.getElementById("numberToPrint").value;
        if(!numberToPrint || !totalAddressesLength) {
          triggerErrorModal(`No labels to print`);
        } else if (numberToPrint > totalAddressesLength) {
          triggerErrorModal(`Max labels to print: ${arrayLengthToProcess}`);
        } else {
          const totalAddressesRes = await getTotalAddressesToPrint(numberToPrint);
          if (totalAddressesRes.code === 200) {
              const arrayToProcess = totalAddressesRes.data;
              appState.setState({'totalAddressesLength': totalAddressesLength - numberToPrint }); // No need for another API call
              generateParticipantCsv(arrayToProcess);
              printLabelsTemplate(name);
              triggerSuccessModal('Success!');                 // Display success message
          } else {
            console.error('response', totalAddressesRes);
            triggerErrorModal(`${totalAddressesRes.code} error getting records: ${totalAddressesRes.message}`);
          }
        }
      });
  }
};

const generateParticipantCsv = async (items) => {
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
  link.setAttribute("download",`${new Date().toLocaleDateString()}-participants-labels-export.csv`);
  document.body.appendChild(link);
  document.querySelector("#download-csv").click();
  document.body.removeChild(link);
  const response = await setKitStatusToParticipant(participantsForKitUpdate);
  if (!response) triggerErrorModal('Error while updating participant(s) kit status.')
}

const setKitStatusToParticipant = async (data) => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=kitStatusToParticipant`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}