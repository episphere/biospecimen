import { userDashboard } from "../dashboard.js";
import { getIdToken, showAnimation, hideAnimation } from "../../shared.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";

export const packageReceiptScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    packageReceiptTemplate(username, auth, route);
    activeReceiptsNavbar();
    checkCourierType();
    formSubmit();
    cancelChanges();
};

const packageReceiptTemplate = async (name, auth, route) => {
    let template = ``;
    template += receiptsNavbar();
    template += `  <div id="root root-margin" style="padding-top: 25px;">
                      <div id="alert_placeholder"></div>
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">Package Receipt</h3> </span>
                      <form method="post" class="mt-3" id="configForm">
                        <h5 style="text-align: left;">Receive Packages</h5>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="scannedBarcode">Scan FedEx/USPS Barcode</label>
                            <div style="display:inline-block;">
                              <input autocomplete="off" required class="col-md-8" type="text" id="scannedBarcode" style="width: 600px;">
                              <span id='courierType' style="padding-left: 10px;"></span>
                            </div>
                        </div>
                        
                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="packageConditionSelection">Select Package Condition</label>
                             <div style="display:inline-block; max-width:90%;"> 
                                <select required class="col form-control" id="packageCondition" style="width:100%" multiple="multiple">
                                    <option id="select-dashboard" value="">-- Select Package Condition --</option>
                                    <option id="select-noIcePack" value="noIcePack">No Ice Pack</option>
                                    <option id="select-warmIcePack" value="warmIcePack">Warm Ice Pack</option>
                                    <option id="select-incorrectMaterialTypeSent" value="incorrectMaterialTypeSent">Incorrect Material Type Sent</option>
                                    <option id="select-noLabelonVials" value="noLabelonVials">No Label on Vials</option>
                                    <option id="select-returnedEmptyVials" value="returnedEmptyVials">Returned Empty Vials</option>
                                    <option id="select-participantRefusal" value="participantRefusal">Participant Refusal</option>
                                    <option id="select-crushed" value="crushed">Crushed</option>
                                    <option id="select-damagedContainer" value="damagedContainer">Damaged Container (outer and inner)</option>
                                    <option id="select-materialThawed" value="materialThawed">Material Thawed</option>
                                    <option id="select-insufficientIce" value="insufficientIce">Insufficient Ice</option>
                                    <option id="select-improperPackaging" value=improperPackaging">Improper Packaging</option>
                                    <option id="select-damagedVials" value="damagedVials">Damaged Vials</option>
                                    <option id="select-other" value="other">Other</option>
                                    <option id="select-noPreNotification" value="noPreNotification">No Pre-notification</option>
                                    <option id="select-noRefrigerant" value="noRefrigerant">No Refrigerant</option>
                                    <option id="select-improperManifest" value="improperManifest">Improper/Incorrect Manifest</option> 
                                    <option id="select-infoDoNotMatch" value="infoDoNotMatch">Vial/Paperwork info do not match</option>
                                    <option id="select-shipmentDelay" value="shipmentDelay">Shipment Delay</option>
                                    <option id="select-noManifestProvided" value="noManifestProvided">No Manifest provided</option>
                                </select>
                           </div>
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4">Comment</label>
                            <textarea class="col-md-8" required id="receivePackageComments" cols="30" rows="3"></textarea>
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                            <input autocomplete="off" required class="col-md-8 form-control" type="date" type="text" id="dateReceived">
                        </div>

                        <h5 style="text-align: left;">Collection Card Data Entry</h5>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4">Collecton ID</label>
                             <input autocomplete="off" class="col-md-8" type="text" id="collectionId">
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4" for="dateCollectionCard">Enter Collection Date from Collection Card</label>
                            <input autocomplete="off" class="col-md-8 form-control" type="date" id="dateCollectionCard">
                        </div>

                        <div class="row form-group">
                        <label class="col-form-label col-md-4" for="timeCollectionCard">Enter Collection Time from Collection Card</label>
                        <input autocomplete="off" class="col-md-8 form-control" type="time" step="1" id="timeCollectionCard">
                    </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4">Check if card not included in assignment</label>
                            <input type="checkbox" name="collectionCheckBox" id="collectionCheckBox">
                        </div>

                        <div class="row form-group">
                            <label class="col-form-label col-md-4">Comments on Card Returned</label>
                            <textarea class="col-md-8" id="collectionComments" cols="30" rows="3"></textarea>
                        </div>
                        
                        <div class="mt-4 mb-4" style="display:inline-block;">
                            <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                            <button type="submit" class="btn btn-primary" id="save">Save</button>
                        </div>

                    </form>
                   
                </div>`;
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML =
        nonUserNavBar(name);
};

const checkCourierType = () => {
    const a = document.getElementById("scannedBarcode");
    if (a) {
        a.addEventListener("change", () => {
            a.value.trim().length <= 12
                ? (document.getElementById(
                      "courierType"
                  ).innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> FEDEX`)
                : (document.getElementById(
                      "courierType"
                  ).innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`);
        });
    }
};

const formSubmit = () => {
    const form = document.getElementById("configForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const obj = {};
        obj["scannedBarcode"] = document
            .getElementById("scannedBarcode")
            .value.trim();
        obj["packageCondition"] = document
            .getElementById("packageCondition")
            .value.trim();
        obj["receivePackageComments"] = document
            .getElementById("receivePackageComments")
            .value.trim();
        obj["dateReceived"] = document.getElementById("dateReceived").value;
        if (document.getElementById("collectionId").value) {
            obj["collectionId"] = document.getElementById("collectionId").value;
            obj["dateCollectionCard"] =
                document.getElementById("dateCollectionCard").value;
            obj["timeCollectionCard"] =
                document.getElementById("timeCollectionCard").value;
            document.getElementById("collectionCheckBox").checked === true
                ? (obj["collectionCheckBox"] = true)
                : (obj["collectionCheckBox"] = false);
            obj["collectionComments"] =
                document.getElementById("collectionComments").value;
        }

        storePackageReceipt(obj);
    });
};

const cancelChanges = () => {
    const cancelChanges = document.getElementById("clearForm");
    cancelChanges.addEventListener("click", (e) => {
        document.getElementById("courierType").innerHTML = ``;
        document.getElementById("scannedBarcode").value = "";
        document.getElementById("packageCondition").value = "";
        document.getElementById("receivePackageComments").value = "";
        document.getElementById("dateReceived").value = "";

        if (document.getElementById("collectionId").value) {
            document.getElementById("collectionId").value = "";
            document.getElementById("dateCollectionCard").value = "";
            document.getElementById("timeCollectionCard").value = "";
            document.getElementById("collectionCheckBox").checked = false;
            document.getElementById("collectionComments").value = "";
        }
    });
};

const storePackageReceipt = async (data) => {
    showAnimation();
    const idToken = await getIdToken();
    const response = await await fetch(
        `https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=storeReceipt`,
        {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Authorization: "Bearer " + idToken,
                "Content-Type": "application/json",
            },
        }
    );
    hideAnimation();
    if (response.status === 200) {
        let alertList = document.getElementById("alert_placeholder");
        let template = ``;
        template += `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                  Response saved!
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>`;
        alertList.innerHTML = template;
        return true;
    } else {
        alert("Error");
    }
};
