export const homeCollectionNavbar = () => {
  let template = ``;
  template += `
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitAssembly" id="kitAssembly">Kit Assembly</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#printLabels" id="printLabels">Print Labels</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#assignKits" id="assignKits">Assign Kits</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitShipment" id="kitShipment">Kit Shipment</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitsReceipt" id="kitsReceipt">Kits Receipt</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitsCsv" id="kitsCsv">Create .csv File</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitStatusReports" id="kitStatusReports">Kit Reports</a>
                </li>
            </ul>`;
  return template;
};

export const activeHomeCollectionNavbar = () => {
    const kitAssemblyNavItem = document.getElementById("kitAssembly");
    const printLabelsNavItem = document.getElementById("printLabels");
    const assignKitsNavItem = document.getElementById("assignKits");
    const kitShipmentNavItem = document.getElementById("kitShipment");
    const kitsReceiptNavItem = document.getElementById("kitsReceipt");
    const kitsCsvNavItem = document.getElementById("kitsCsv");
    const kitStatusReportsNavItem = document.getElementById("kitStatusReports");

    if (location.hash === "#kitAssembly") {
        kitAssemblyNavItem.classList.add("active");
        kitAssemblyNavItem.style.backgroundColor = "#bbcffc85";
        kitAssemblyNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#printLabels") {
        printLabelsNavItem.classList.add("active");
        printLabelsNavItem.style.backgroundColor = "#bbcffc85";
        printLabelsNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#assignKits") {
        assignKitsNavItem.classList.add("active");
        assignKitsNavItem.style.backgroundColor = "#bbcffc85";
        assignKitsNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#kitShipment"){
        kitShipmentNavItem.classList.add("active");
        kitShipmentNavItem.style.backgroundColor = "#bbcffc85";
        kitShipmentNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#kitsReceipt"){
        kitsReceiptNavItem.classList.add("active");
        kitsReceiptNavItem.style.backgroundColor = "#bbcffc85";
        kitsReceiptNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#kitsCsv"){
        kitsCsvNavItem.classList.add("active");
        kitsCsvNavItem.style.backgroundColor = "#bbcffc85";
        kitsCsvNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#kitStatusReports" || 
        location.hash === "#allParticipants" || 
        location.hash === "#addressPrinted" || 
        location.hash === "#shipped" ||
        location.hash === "#assigned" ||
        location.hash === "#received") {
        kitStatusReportsNavItem.classList.add("active");
        kitStatusReportsNavItem.style.backgroundColor = "#bbcffc85";
        kitStatusReportsNavItem.style.borderRadius = "4px 4px 0 0";
    }
};
