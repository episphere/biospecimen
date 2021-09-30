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
    const allParticipants = await getAllParticipants();
    hideAnimation();

    const sortParticipantsArr = sortAllParticipants(allParticipants);
    const allParticipantsActiveArr = allParticipantsActive(allParticipants);
    let template = "";
    template += kitReportsNavbar();
    template += ` 
              <div id="root root-margin" style="padding-top: 25px;">
                <h3 style="text-align: center; margin: 1rem 0;">Reports Screen</h3>
                <div class="container-fluid">
                  <div class="d-flex flex-lg-row justify-content-lg-center align-items-lg-center flex-md-column justify-content-md-center align-items-md-center flex-sm-column justify-content-sm-center align-items-sm-center">
                    <div id="bptlKitPieChart"></div>
                    <div id="bptlKitBarChart"></div>
                  </div>
                  
                  <h3 style="margin:1rem 0; text-align:center;">Outstanding Kits</h3>
                  <div class="table-responsive">
                    <div class="sticky-header" style="overflow:auto;margin-bottom:1rem; height:45vh;">
                            <table class="table table-bordered" id="packagesInTransitData" 
                                style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                <thead> 
                                    <tr style="top: 0; position: sticky;">
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Days Out</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Ship Date</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Kit ID</th>
                                        <th class="sticky-row" style="background-color: #f7f7f7; text-align:center;" scope="col">Participant Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${createKitReportRows(sortParticipantsArr)}
                                </tbody>
                        </div>
                    </div>
                </div>
              </div>
  `;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(username);
        activeKitReportsNavbar();
        plotly(bptlMetricsData, allParticipantsActiveArr);
};

const plotly = (bptlMertricsData, allParticipantsActiveArr) => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://cdn.plot.ly/plotly-latest.min.js");
    document.body.appendChild(script);
    script.addEventListener("load", function () {
        renderPlotly(bptlMertricsData, allParticipantsActiveArr);
    });
};

const renderPlotly = async (bptlMertricsData, allParticipantsActiveArr) => {
    bptlMetricsPieChart(bptlMertricsData);
    bptlMetricsBarChart(allParticipantsActiveArr);
};

const bptlMetricsPieChart = (bptlMetricsData) => {
    const data = [
        {
            type: "pie",
            values: [],
            labels: [],
            textinfo: "label+percent",
            textposition: "outside",
            automargin: true,
        },
    ];

    for (let key in bptlMetricsData) {
        
        if (key === "addressPrinted") {
            data[0].labels.push(`${key.replaceAll("addressPrinted","Address Printed")} - ${bptlMetricsData[key]}`);
        }
        else { 
            data[0].labels.push(`${capitalizeFirstLetter(key)} - ${bptlMetricsData[key]}`);
        }
        data[0].values.push(bptlMetricsData[key]);
    }

    const layout = {
        height: 400,
        width: 600,
        legend: {
            x: 1,
            y: 250,
        },
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.newPlot("bptlKitPieChart", data, layout, config);
};

const bptlMetricsBarChart = (allParticipantsActiveArr) => {
    const data = [
        {
            type: "bar",
            x: [],
            y: [],
            marker: {
                color: "rgb(49,130,189)",
                opacity: 0.7,
            },
        },
    ];

    let countUniqueValuesArr = [];
    for (let key in uniqueDaysElapsedObj(allParticipantsActiveArr)) {
        countUniqueValuesArr.push(
            uniqueDaysElapsedObj(allParticipantsActiveArr)[key]
        );
    }

    countUniqueValuesArr.reverse().forEach((i) => {
        data[0].y.push(i);
    });


    //Reverse array items and push to x array
    Object.keys(uniqueDaysElapsedObj(allParticipantsActiveArr))
        .reverse()
        .forEach((i) => {
            data[0].x.push(i);
        });

    const layout = {
        height: 400,
        width: 600,
        title: "Number of Kits Out with Participants",
        xaxis: {
            dtick:2,
            title: {
                text: "Days Out",
                font: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f",
                },
            },
        },
        yaxis: {
            title: {
                text: "Number of Kits",
                font: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f",
                },
            },
        },
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.newPlot("bptlKitBarChart", data, layout, config);
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

const getBPTLMetricsShipped = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=bptlMetricsShipped`, {
        method: "GET",
        headers: {
            Authorization: "Bearer" + idToken,
            "Content-Type": "application/json",
        },
    }).catch((e) => console.log(e));
    const responseObj = await response.json().then((data) => data);
    return responseObj.data;
};

const getAllParticipants = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getParticipantSelection&type=all`, {
        method: "GET",
        headers: {
            Authorization: "Bearer" + idToken,
            "Content-Type": "application/json",
        },
    }).catch((e) => console.log(e));
    const responseObj = await response.json().then((data) => data);
    return responseObj.data;
};

const sortAllParticipants = (allParticipants) => {
    const participantsActive = allParticipants.filter(
        (element) => element["participation_status"] === "active"
    );
    const participantsWithdrawal = allParticipants.filter(
        (element) => element["participation_status"] === "withdraw"
    );

    const participantsActiveSortDateAsc = participantsActive.sort((a, b) =>
        a.time_stamp < b.time_stamp ? -1 : a.time_stamp > b.time_stamp ? 1 : 0
    );
    const participantsWithdrawalSortDateAsc = participantsWithdrawal.sort(
        (a, b) => a.time_stamp < b.time_stamp ? -1 : a.time_stamp > b.time_stamp ? 1 : 0
    );

    // MERGE BOTH ARRAYS
    return participantsActiveSortDateAsc.concat(
        participantsWithdrawalSortDateAsc
    );
};

const allParticipantsActive = (allParticipants) => {
    const participantsActive = allParticipants.filter(
        (element) => element["participation_status"] === "active"
    );

    const participantsActiveSortDateAsc = participantsActive.sort((a, b) =>
        a.time_stamp < b.time_stamp ? -1 : a.time_stamp > b.time_stamp ? 1 : 0
    );
    return participantsActiveSortDateAsc;
};

/*
==================================================
UTIL FUNCTIONS 
==================================================
*/

const createKitReportRows = (participantRows) => {
    let template = ``;
    participantRows.forEach((item) => {
        template += `
                        <tr class="row-color-enrollment-dark participantRow">
                            <td style="text-align:center;">${daysBetween(
                                item.time_stamp
                            )}</td>
                            <td style="text-align:center;">${convertTime(
                                item.time_stamp
                            )}</td>
                            <td style="text-align:center;">${
                                item.supply_kitId
                            }</td>
                            <td style="text-align:center;">${
                                item.participation_status
                            }</td>
                        </tr>`;
    });
    return template;
};

const uniqueDaysElapsedObj = (allParticipantsActiveArr) => {
    let daysElapsedArr = [];
    allParticipantsActiveArr.forEach((item) => {
        daysElapsedArr.push(daysBetween(item.time_stamp));
    });
    
    const countObj = daysElapsedArr.reduce(
        (acc, value) => ({
            ...acc,
            [value]: (acc[value] || 0) + 1,
        }),
        {}
    );
    return countObj;
};

// Calculate Number of days between current date and date provided
const daysBetween = (
    date1String,
    date2String = new Date().toISOString().toLocaleString()
) => {
    const d1 = new Date(date1String);
    const d2 = new Date(date2String);
    return Math.floor((d2 - d1) / (1000 * 3600 * 24));
};

const convertTime = (time) => {
    if (!time) {
        return "";
    }
    let utcSeconds = time;
    let myDate = new Date(utcSeconds);
    const dateAndTime = myDate.toLocaleString("en-us", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const date = dateAndTime.split(",")[0];
    return date;
};

const capitalizeFirstLetter = word => word && word[0].toUpperCase() + word.slice(1)