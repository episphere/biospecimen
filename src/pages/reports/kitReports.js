import { kitReportsNavbar } from "./kitReportsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeKitReportsNavbar } from "./activeKitReportsNavbar.js";

export const kitReportsScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitReportsTemplate(username, auth, route);
    plotly();
};

const kitReportsTemplate = async (username, auth, route) => {
    let template = "";

    template += kitReportsNavbar();

    template += `<h3>Reports Screen</h3>`;
    template += `<div id="tester" style="width:600px;height:250px;"></div>
  `;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(username);
    activeKitReportsNavbar();
    // await testPlotly();
};

const plotly = () => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
    document.body.appendChild(script);

    script.addEventListener("load", function () {
        // Plotly loaded
        console.log(Plotly);
        testPlotly();
    });
};

const testPlotly = () => {
    const TESTER = document.getElementById("tester");
    Plotly.newPlot(
        TESTER,
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
