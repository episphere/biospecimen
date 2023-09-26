export const reportsNavbar = () => {
    let template = ``;
    template += `
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                    </li>
                    <li id="kitsReportsNavItem" class="nav-item">
                        <a class="nav-link" aria-current="page" href="#kitreports" id="kitReports">Reports</a>
                    </li>
                    <li id="collectionSearchReportsNavItem" class="nav-item">
                        <a class="nav-link" aria-current="page" href="#collectionidsearch" id="collectionIdSearch">Collection ID Search</a>
                    </li>
                    <li id="bptlShippingReportsNavItem" class="nav-item">
                        <a class="nav-link" aria-current="page" href="#bptlshipreports" id="bptlShipReports">Shipping Report</a>
                    </li>
                    
                </ul>`;
    return template;
};
