export const receiptsNavbar = () => {
    let template = ``;
    template += `
                  <ul class="nav nav-tabs">
                      <li class="nav-item">
                          <a class="nav-link" aria-current="page" href="#bptl" id="bptl">Home</a>
                      </li>
                      <li class="nav-item">
                      <a class="nav-link" aria-current="page"> Packages in Transit</a>
                      </li>
                      <li class="nav-item">
                      <a class="nav-link" aria-current="page" href="#packagereceipt" id="packageReceipt">Packages Receipt</a>
                      </li>
                      <li class="nav-item">
                      <a class="nav-link" aria-current="page">Create .csv file</a>
                      </li>
                  </ul>`;
    return template;
};
