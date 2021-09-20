import { showAnimation, hideAnimation, getAllBoxes } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "./../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbarItem.js";

export const packageReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  packageReceiptTemplate(username, auth, route);
};

const packageReceiptTemplate = async (username, auth, route) => {
  let template = "";

  template += receiptsNavbar();

  template += `<h3>PackageReceipt</h3>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
  console.log("test");
  activeReceiptsNavbar();
};
