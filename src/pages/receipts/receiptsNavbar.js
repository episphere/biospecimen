export const receiptsNavbar = () => {
  let template = ``;
  template += `
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" aria-current="page" href=""#packagesintransit" id="packagesintransit">Packages in Transit from Sites</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#packagerecepit" id="packageReceipt">Package Receipt</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#createCSVFile" id="createCSVFile">Create .csv File</a>
                    </li>
                </ul>`;
  return template;
};
