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
                    <a class="nav-link" aria-current="page" href="#participantselection" id="participantSelection">Kit Status</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#kitshipment" id="kitShipment">Kit Shipment</a>
                    </li>
                </ul>`;
  return template;
};
