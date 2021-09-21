import { showAnimation, hideAnimation } from "../../shared.js";
import { kitReportsNavbar } from "./kitReportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeKitReportsNavbar } from "./activeKitReportsNavbar.js";
import { getIdToken } from "../../shared.js";

// API
const api =
  "https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?";

export const kitReportsScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  kitReportsTemplate(username, auth, route);
};

const kitReportsTemplate = async (username, auth, route) => {
  showAnimation();
  const bptlMetricsData = await getBPTLMetrics();
  hideAnimation();
  let template = "";

  template += kitReportsNavbar();
  template += ` 
              <h3 style="text-align: center; margin: 1rem 0;">Reports Screen</h3>
              <div class="container-fluid">
                <div id="tester1" style="width:50%x;height:250px;"></div>
                <div id="tester2" style="width:50%;height:250px;"></div>
              </div>
  `;

  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
  activeKitReportsNavbar();
  // await testPlotly();
  console.log(bptlMetricsData);
  plotly(bptlMetricsData);
};

const plotly = (bptlMertricsData) => {
  const script = document.createElement("script");
  script.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
  document.body.appendChild(script);

  script.addEventListener("load", function () {
    // Plotly loaded
    console.log(Plotly);
    testPlotly();
  });
};

const testPlotly = async () => {
  const TESTER1 = document.getElementById("tester1");
  const TESTER2 = document.getElementById("tester2");
  await Plotly.newPlot(
    TESTER1,
    [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
      },
    ],
    {
      margin: { t: 0 },
    }
  );
  await Plotly.newPlot(
    TESTER2,
    [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
      },
    ],
    {
      margin: { t: 0 },
    }
  );
};

/*
==================================================
GET METHOD REQUEST - FETCH BPTL METRICS
==================================================
*/

const getBPTLMetrics = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${api}api=bptlMetrics`, {
    method: "GET",
    headers: {
      Authorization: "Bearer" + idToken,
      "Content-Type": "application/json",
    },
  }).catch((e) => console.log(e));

  const responseObj = await response.json().then((data) => data);
  return responseObj.data[0];
};
