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
                        <a class="nav-link" aria-current="page" href="#kit_status_reports" id="kitStatusReports">Kit Reports</a>
                  </li>
                </ul>`;
  return template;
};
