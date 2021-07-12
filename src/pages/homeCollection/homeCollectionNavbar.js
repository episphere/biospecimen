export const homeCollectionNavbar = () => {
    let template = ``;
    template += `
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#kitassembly" id="kitAssembly">Kit Assembly</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#printadresses" id="printAdresses">Print Adresses</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#participantselection" id="participantSelection">Participant Selection</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#participantassignmen" id="participantAssignment">Participant Assignment</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#kitshipment" id="kitShipment">Kit Shipment</a>
                    </li>
                </ul>`
    return template;
}