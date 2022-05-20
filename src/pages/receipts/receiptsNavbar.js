export const receiptsNavbar = () => {
    let template = ``;
    template += `
                  <ul class="nav nav-tabs">
                      <li class="nav-item">
                          <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                      </li>
                      <li id="packagesInTransitNavItem" class="nav-item">
                      <a class="nav-link" aria-current="page" href="#packagesintransit" id="packagesInTransit"> Packages in Transit</a>
                      </li>
                      <li id="packageReceiptNavItem" class="nav-item">
                      <a class="nav-link" aria-current="page" href="#packagereceipt" id="packageReceipt">Packages Receipt</a>
                      </li>
                      <li id="csvFileReceiptNavItem" class="nav-item">
                      <a class="nav-link" aria-current="page" href="#csvfilereceipt" id="csvFileReceipt">Create .csv file</a>
                      </li>
                  </ul>`;
    return template;
};
