import { showAnimation, hideAnimation, getAllBoxes } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";

export const csvFileReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;

  csvFileReceiptTemplate(username, auth, route);
  activeReceiptsNavbar();
  createCsvFile();
  getCsvDateInput();

  const csvDateInputEl = document.getElementById("csvDateInput");
  console.log(csvDateInputEl)
  csvDateInputEl.innerHTML = getCurrentDate()
  const csvCreateFileButtonEl = document.getElementById("csvCreateFileButton")
  csvCreateFileButtonEl.addEventListener("click",() => {
    console.log(document.getElementById("csvDateInput").value)
  })
}

const csvFileReceiptTemplate = async (username, auth, route) => {
  let template = "";

  template += receiptsNavbar();
  template += `<div id="root root-margin">
                  <span> <h3 style="text-align: center; margin: 1rem 0;">Create CSV File</h3> </span>
                      <div class="container-fluid d-flex flex-wrap align-items-center justify-content-center" style="margin-top:25%;">
                        <p style="display:inline-block;margin-bottom:0; margin-right:5%; font-size:1.3rem;">Enter a Date</p>
                        <input type="date" id="csvDateInput" style="margin-right:5%;" max="${getCurrentDate()};"></input>
                        <button id="csvCreateFileButton">Create File</button>
                      </div>
              </div>`
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
}


const getCsvDateInput = () => {
  const csvDateInputEl = document.getElementById("csvDateInput");
  return csvDateInputEl
}

const createCsvFile = () => {
  document.getElementById
}

const getCurrentDate = () => {
  const currentDate = new Date().toLocaleDateString('en-CA');
  return currentDate
}