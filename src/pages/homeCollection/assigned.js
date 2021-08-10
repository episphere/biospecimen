import {
  getIdToken,
  findParticipant,
  showAnimation,
  hideAnimation,
} from "../../shared.js";
import { renderParticipantSelectionHeader } from "./participantSelectionHeaders.js";

const placeholderAssignedData = [
  {
    first_name: "Jolyene",
    last_name: "Cujoh",
    connect_id: "7756917180",
    kit_status: "Status",
    address_1: "34442 Steve Hunt Road",
    address_2: null,
    city: "Miami",
    state: "FL",
    zip_code: 33131,
    date_requested: "08/04/2021",
    usps_tracking_number: 26091708560117153712,
    kit_id: "JSO784103",
    study_site: "KP FL",
  },
  {
    first_name: "Arcueid",
    last_name: "Brunestud",
    connect_id: "1753927180",
    kit_status: "Assigned",
    address_1: "1171 Doe Meadow Drive",
    address_2: null,
    city: "Maryland",
    state: "MD",
    zip_code: 20014,
    date_requested: "08/04/2021",
    usps_tracking_number: 42551059936003641131,
    kit_id: "FGO444100",
    study_site: "KP MD",
  },
];

const assignedParticipants = JSON.parse(
  JSON.stringify([...placeholderAssignedData])
);

export const assignedScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  aassignedTemplate(auth, route);
};

const aassignedTemplate = async (auth, route) => {
  let template = ``;
  template += renderParticipantSelectionHeader();
  template += ` <div class="container-fluid">
                    <div id="root root-margin">
                        <div class="table-responsive">
                        <span> <h3 style="text-align: center;">Assigned</h3> </span>
                            <div class="sticky-header" style="overflow:auto;">
                                <table class="table table-bordered" id="participantData" 
                                    style="margin-bottom:0; position: relative;border-collapse:collapse; box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                                    <thead> 
                                        <tr style="top: 0; position: sticky;">
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">First Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Last Name</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit Status</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Date Requested</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Kit ID</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">USPS Tracking Number</th>
                                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Edit</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                       
                                    </tbody>
                              </table>
                        </div>
                    </div> 
                </div>`;
  document.getElementById("contentBody").innerHTML = template;

  participantSelectionDropdown();
  console.log(assignedParticipants);
};

// Refactor
const participantSelectionDropdown = () => {
  const participantDropdown = document.querySelector(
    ".participantSelectionDropdown"
  );
  participantDropdown.addEventListener("change", (e) => {
    let selection = e.target.value;
    if (selection === "pending") {
      location.hash = "#participantselection";
    } else if (selection === "addressPrinted") {
      location.hash = "#addressPrinted";
    } else if (selection === "assigned") {
      location.hash = "#assigned";
    } else return;
  });
};
