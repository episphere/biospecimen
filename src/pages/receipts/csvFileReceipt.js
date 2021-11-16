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
  csvFileButtonSubmit();
}

const csvFileReceiptTemplate = async (username, auth, route) => {
  let template = "";

  template += receiptsNavbar();
  template += `<div id="root root-margin" style="margin-top:3rem;">
                  <span> <h3 style="text-align: center; margin: 1rem 0;">Create CSV File</h3> </span>
                  <div class="container-fluid">
                    <div class="card bg-light mb-3 mt-3 mx-auto" style="max-width:50rem;">
                      <div class="card-body" style="padding: 4rem 2.5rem;">
                        <form class="form">
                        <div class="form-group d-flex flex-wrap align-items-center justify-content-center m-0">
                          <label for="csvDateInput" style="display:inline-block;margin-bottom:0; margin-right:5%; font-size:1.3rem;">Enter a Date</label>
                          <input type="date" name="csvDate" id="csvDateInput" describedby="enterEmail" style="margin-right:5%; padding:0.2rem;" value="${getCurrentDate()}" max="${getCurrentDate()}"/>
                          <button id="csvCreateFileButton" class="btn btn-primary">Create File</button>
                        </div>
                        </form>
                      </div>
                    </div>
                  </div>
              </div>`
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
}

const csvFileButtonSubmit = () => {
  document.getElementById("csvCreateFileButton").addEventListener("click", (e)=> {
    e.preventDefault();
    console.log(document.getElementById("csvDateInput").value);
  })
}

const getCurrentDate = () => {
  const currentDate = new Date().toLocaleDateString('en-CA');
  return currentDate;
}

