export const siteCollectionNavbar = () => {
    let template = ``;
    template += `
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
            </li>
            <li id="packagesInTransitNavItem" class="nav-item">
                <a class="nav-link" aria-current="page" href="#packagesInTransit" id="packagesInTransit"> Packages in Transit</a>
            </li>
            <li id="packageReceiptNavItem" class="nav-item">
                <a class="nav-link" aria-current="page" href="#sitePackageReceipt" id="sitePackageReceipt">Packages Receipt</a>
            </li>
            <li id="csvFileReceiptNavItem" class="nav-item">
                <a class="nav-link" aria-current="page" href="#csvFileReceipt" id="csvFileReceipt">Create .csv file</a>
            </li>
            <li id="collectionSearchReportsNavItem" class="nav-item">
                <a class="nav-link" aria-current="page" href="#collectionIdSearch" id="collectionIdSearch">Collection ID Search</a>
            </li>
            <li id="bptlShippingReportsNavItem" class="nav-item">
                <a class="nav-link" aria-current="page" href="#bptlShipReports" id="bptlShipReports">Shipping Report</a>
            </li>    
        </ul>
    `;
    return template;
};
