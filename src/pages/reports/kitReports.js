import { kitReportsNavbar } from "./kitReportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeKitReportsNavbar } from "./activeKitReportsNavbar.js";

export const kitReportsScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  kitReportsTemplate(username, auth, route);
};

const kitReportsTemplate = async (username, auth, route) => {
  let template = "";

  template += kitReportsNavbar();

  template += `<h3>Reports Screen</h3>`;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
  activeKitReportsNavbar();
};
