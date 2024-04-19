export const homeCollectionNavbar = () => {
  let template = ``;
  template += `
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#kitassembly" id="kitAssembly">Kit Assembly</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#printlabels" id="printLabels">Print Labels</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#assignkits" id="assignKits">Assign Kits</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#kitshipment" id="kitShipment">Kit Shipment</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#kitsreceipt" id="kitsReceipt">Kits Receipt</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" aria-current="page" href="#kitscsv" id="kitsCsv">Create .csv File</a>
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

  if (location.hash === "#kitassembly") {
    kitAssemblyNavItem.classList.add("active");
    kitAssemblyNavItem.style.backgroundColor = "#bbcffc85";
    kitAssemblyNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#printlabels") {
  printLabelsNavItem.classList.add("active");
  printLabelsNavItem.style.backgroundColor = "#bbcffc85";
  printLabelsNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#assignkits") {
  assignKitsNavItem.classList.add("active");
  assignKitsNavItem.style.backgroundColor = "#bbcffc85";
  assignKitsNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#kitshipment"){
  kitShipmentNavItem.classList.add("active");
  kitShipmentNavItem.style.backgroundColor = "#bbcffc85";
  kitShipmentNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#kitsreceipt"){
  kitsReceiptNavItem.classList.add("active");
  kitsReceiptNavItem.style.backgroundColor = "#bbcffc85";
  kitsReceiptNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#kitscsv"){
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
