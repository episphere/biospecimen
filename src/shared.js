import { userNavBar, adminNavBar, nonUserNavBar } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { addEventClearScannedBarcode, addEventHideNotification } from "./events.js"
import { masterSpecimenIDRequirement, siteSpecificTubeRequirements } from "./tubeValidation.js"
import { collectProcessTemplate } from "./pages/collectProcess.js";


const conversion = {
    "299553921":"0001",
    "703954371":"0002",
    "838567176":"0003",
    "454453939":"0004",
    "652357376":"0005",
    "973670172":"0006",
    "143615646":"0007",
    "787237543":"0008",
    "223999569":"0009",
    "376960806":"0011",
    "232343615":"0012",
    "589588440":"0021",
    "746999767":"0022",
    "857757831":"0031",
    "654812257":"0032",
    "958646668":"0013",
    "677469051":"0014",
    "683613884":"0024"
}
const api = 'https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?';
// const api = 'http://localhost:8010/nih-nci-dceg-connect-dev/us-central1/biospecimen?';

export const validateUser = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=validateUsers`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const findParticipant = async (query) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getParticipants&type=filter&${query}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const biospecimenUsers = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=users`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const addBiospecimenUsers = async (data) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=addUsers`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

export const removeBiospecimenUsers = async (email) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=removeUser&email=${email}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const getIdToken = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                user.getIdToken().then((idToken) => {
                    resolve(idToken);
            }, (error) => {
                resolve(null);
            });
            } else {
                resolve(null);
            }
        });
    });
};

export const showAnimation = () => {
    if(document.getElementById('loadingAnimation')) document.getElementById('loadingAnimation').style.display = '';
}

export const hideAnimation = () => {
    if(document.getElementById('loadingAnimation')) document.getElementById('loadingAnimation').style.display = 'none';
}

export const userAuthorization = async (route, name) => {
    showAnimation();
    const response = await validateUser();
    if(response.code === 200) {
        const role = response.data.role;
        if(role === 'admin' || role === 'manager') document.getElementById('navbarNavAltMarkup').innerHTML = adminNavBar(name);
        else if(role === 'user') document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar(name);
        toggleCurrentPage(route);
        hideAnimation();
        return role;
    }
    else if(response.code === 401) {
        document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
        document.getElementById('contentBody').innerHTML = 'You do not have required permission to access this dashboard';
        hideAnimation();
    }
}


export const toggleCurrentPage = async (route) => {
    const IDs = ['dashboard', 'manageUsers', 'shipping'];
    IDs.forEach(id => {
        const element = document.getElementById(id);
        if(!element) return;
        element.addEventListener('click', () => {
            removeActiveClass('navbar-nav', 'current-page');
            element.parentNode.parentNode.classList.add('current-page');
            toggleNavbarMobileView();
        });
    });

    if(route === '#dashboard') document.getElementById('dashboard') ? document.getElementById('dashboard').click() : '';
    else if(route === '#manage_users') document.getElementById('manageUsers') ? document.getElementById('manageUsers').click() : '';
    else if(route === '#shipping') document.getElementById('shipping') ? document.getElementById('shipping').click() : '';
}

export const removeActiveClass = (className, activeClass) => {
    let fileIconElement = document.getElementsByClassName(className);
    Array.from(fileIconElement).forEach(elm => {
        elm.classList.remove(activeClass);
    });
}

export const toggleNavbarMobileView = () => {
    const btn = document.querySelectorAll('.navbar-toggler');
    if(btn && btn[0]){
        if(!btn[0].classList.contains('collapsed')) btn[0].click();
    }
}

export const performSearch = async (query) => {
    showAnimation();
    const response = await findParticipant(query);
    hideAnimation();
    const getVerifiedParticipants = response.data.filter(dt => dt['821247024'] === 197316935);
    if(response.code === 200 && getVerifiedParticipants.length > 0) searchResults(getVerifiedParticipants);
    else if(response.code === 200 && getVerifiedParticipants.length === 0) showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
}

export const showNotifications = (data, error) => {
    const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    document.getElementById('root').removeChild(button);
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    header.innerHTML = `<h5 class="modal-title">${data.title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>`;
    body.innerHTML = `
        <div class="row">
            <div class="col">
                ${data.body}
            </div>
        </div>
        </br></br>
        <div class="row">
            <div class="ml-auto" style="margin-right: 1rem;">
                <button type="button" class="btn btn-outline-dark" data-dismiss="modal" aria-label="Close">Close</button>
            </div>
        </div>
`;

    // const div = document.createElement('div');
    // div.classList = ["notification"];
    // div.innerHTML = `
    //     <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
    //         <div class="toast-header">
    //             <strong class="mr-auto ${error ? 'error-heading': ''}">${data.title}</strong>
    //             <button type="button" class="ml-2 mb-1 close hideNotification" data-dismiss="toast" aria-label="Close">&times;</button>
    //         </div>
    //         <div class="toast-body">
    //             ${data.body}
    //         </div>
    //     </div>
    // `
    // document.getElementById('showNotification').appendChild(div);
    // document.getElementsByClassName('container')[0].scrollIntoView(true);
    // addEventHideNotification(div);
}

export const errorMessage = (id, msg, focus, offset) => {
    const currentElement = document.getElementById(id);
    const parentElement = currentElement.parentNode;
    if(Array.from(parentElement.querySelectorAll('.form-error')).length > 0) return;
    if(msg){
        const div = document.createElement('div');
        div.classList = ['error-text'];
        const span = document.createElement('span');
        span.classList = ['form-error']
        if(offset) span.classList.add('offset-4');
        span.innerHTML = msg;
        div.append(span);
        parentElement.appendChild(div);
    }
    currentElement.classList.add('invalid');
    if(focus) currentElement.focus();
}

export const removeAllErrors = () => {
    const elements = document.getElementsByClassName('form-error');
    Array.from(elements).forEach(element => {
        const errorMsg = element.parentNode;
        const parent = element.parentNode.parentNode;
        parent.removeChild(errorMsg);
    });
    const invalids = document.getElementsByClassName('invalid');
    Array.from(invalids).forEach(element => {
        element.classList.remove('invalid');
    })
}

export const storeSpecimen = async (array) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(array)
    }
    const response = await fetch(`${api}api=addSpecimen`, requestObj);
    return response.json();
}

export const storeBox = async (box) =>{
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(box)
    }
    const response = await fetch(`${api}api=addBox`, requestObj);
    console.log(response)
    return response.json();
}

export const updateNewTempDate = async () =>{
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=updateTempCheckDate`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return response.json();
}

export const ship = async (boxes, shippingData, trackingNumbers) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"boxes": boxes, "shippingData": shippingData, "trackingNumbers":trackingNumbers})
    }
    const response = await fetch(`${api}api=ship`, requestObj);
    console.log(response)
    return response.json();
}

export const getPage = async (pageNumber, numElementsOnPage, orderBy) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"pageNumber": pageNumber, "elementsPerPage": numElementsOnPage, "orderBy":orderBy})
    }
    const response = await fetch(`${api}api=getBoxesPagination`, requestObj);
    console.log('THIS IS THE RESPONSE !@$!@$IGH!@$OIG!@E: ')
    console.log(response)
    return response.json();
}


export const getBoxes = async (box) =>{
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchBoxes`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    let toReturn  = {};
    toReturn["data"] = [];
    let data = res.data;
    console.log("DATA!: " + JSON.stringify(data))
    for(let i = 0; i < data.length; i++){
        let currJSON = data[i];

        if(!currJSON.hasOwnProperty("145971562") || currJSON["145971562"] != '353358909'){
            console.log('weoiubvoisdbvosidvb')
            console.log(JSON.stringify(currJSON))
            console.log(currJSON['145971562'])
            toReturn["data"].push(currJSON);
        }
    }
    console.log(JSON.stringify(res.data))
    return toReturn;
}

export const getAllBoxes = async (box) =>{
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchBoxes`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    return res;
}

export const getBoxesByLocation = async (location) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchBoxesByLocation`, {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({location:location})
    });

    let res = await response.json();
    return res;
}

export const searchSpecimen = async (masterSpecimenId) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchSpecimen&masterSpecimenId=${masterSpecimenId}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return response.json();
}

export const getParticipantCollections = async (token) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getParticipantCollections&token=${token}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return response.json();
}

export const removeBag = async(boxId, bags) => {
    let currDate = new Date();
    let toPass = {boxId:boxId, bags:bags, date:currDate.toString()}
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=removeBag`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toPass)
    });
    return await response.json();
    
}

export const searchSpecimenInstitute = async () => {
    //https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=searchSpecimen
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchSpecimen`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });

    let a = await response.json();

    let data = a.data;    
    console.log(';wopiebnvopdivbloisadijvchboiauwehcl;kdscnsoiudchsoefdcivnew: ' + JSON.stringify(data))

    const conversion = {
        "299553921":"0001",
        "703954371":"0002",
        "838567176":"0003",
        "454453939":"0004",
        "652357376":"0005",
        "973670172":"0006",
        "143615646":"0007",
        "787237543":"0008",
        "223999569":"0009",
        "376960806":"0011",
        "232343615":"0012",
        "589588440":"0021",
        "746999767":"0022",
        "857757831":"0031",
        "654812257":"0032",
        "958646668":"0013",
        "677469051":"0014",
        "683613884":"0024"
    }

    /*

        {
            
            820476880: masterSpecimenId
            conversion[search]:{
                shipped:
                otherstuff:
            }


        }
    */
    
    for(let i = 0; i < data.length; i++){
        let currJSON = data[i];
        if(currJSON.hasOwnProperty('787237543')){
            delete currJSON['787237543']
        }
        if(currJSON.hasOwnProperty('223999569')){
            delete currJSON['223999569']
        }
        let keys = Object.keys(currJSON);
        for(let i = 0; i < keys.length; i++){
            if(conversion.hasOwnProperty(keys[i])){
                let iterateJSON = currJSON[keys[i]];
                if(!iterateJSON.hasOwnProperty('593843561') || iterateJSON['593843561'] == '104430631'){
                    delete currJSON[keys[i]]
                }
            }
        }
    }
    return data;
}

export const removeMissingSpecimen = async (tubeId) => {
    //https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=searchSpecimen
    let toPass = {tubeId: tubeId};
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=reportMissingSpecimen`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toPass)
    });
    return await response.json();
}

export const getLocationsInstitute = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getLocations`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    let arr = res.response;
    let locations = [];
    console.log('LOCATIONSTUFFF 0.0 : ' + JSON.stringify(arr));
    for(let i = 0; i < arr.length; i++){
        let currJSON = arr[i];
        locations = locations.concat(currJSON['560975149']);
    }
    return locations;
}

export const getNumPages = async (numPerPage) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getNumBoxesShipped`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    let numBoxes = res.response;
    return Math.ceil(numBoxes/numPerPage)
}

export const getSiteCouriers = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getLocations`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    let arr = res.response;
    let locations = [];
    let siteCouriers = arr[0]['666553960'];
    let conversion = {
        '712278213': 'FedEx',
        '149772928': 'World Courier'
    }
    siteCouriers = siteCouriers.map(id => conversion[id]);
    return siteCouriers;
}

export const getNextTempCheck = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getLocations`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    let res = await response.json();
    let arr = res.response;
    let locations = [];
    let currJSON = arr[0];
    let nextDate = currJSON['nextTempMonitor']
    let todaysDate = new Date();
    let tempDate = new Date(Date.parse(nextDate))
    console.log('DATEweopibvwoidvbsdv: ' + tempDate.toString())
    console.log(todaysDate.toString())
    if(todaysDate >= tempDate){
        return true;
    }
    return false;

}

export const generateBarCode = (id, connectId) => {
    JsBarcode(`#${id}`, connectId, {height: 30});
}

export const siteFullNames = {
    'NCI': 'National Cancer Institute',
    'KPGA': 'Kaiser Permanente Georgia',
    'SFH': 'Sanford Health',
    'UCM': 'University of Chicago Medicine',
    'KPHI': 'Kaiser Permanente Hawaii',
    'MFC': 'Marshfield Clinic',
    'KPNW': 'Kaiser Permanente Northwest',
    'KPCO': 'Kaiser Permanente Colorado',
    'HP': 'HealthPartners',
    'HFHS': 'Henry Ford Health System'
}

export const addEventBarCodeScanner = (id, start, end) => {
    const liveStreamConfig = {
        inputStream: {
            type : "LiveStream",
            constraints: {
                facingMode: "environment" // or "user" for the front camera
            }
        },
        locator: {
            patchSize: "x-large",
            halfSample: true
        },
        numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
        decoder: {
            "readers":["code_128_reader"]
        },
        locate: true
    };
    
    document.getElementById(id).addEventListener('click', () => {
        const btn = document.createElement('button');
		btn.dataset.toggle = 'modal';
		btn.dataset.target = '#livestream_scanner';
		btn.hidden = true;
		document.body.appendChild(btn);
        btn.click();
        document.body.removeChild(btn);
        Quagga.init(
			liveStreamConfig, 
			(err) => {
				if (err) {
					Quagga.stop();
					return;
				}
				Quagga.start();
			}
		);
        Quagga.onProcessed(result => {
            const drawingCtx = Quagga.canvas.ctx.overlay;
            const drawingCanvas = Quagga.canvas.dom.overlay;
     
            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(box => {
                        return box !== result.box;
                    }).forEach(box => {
                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                    });
                }
     
                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                }
     
                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                }
            }
        });
        
        Quagga.onDetected(result => {
            if (result.codeResult.code){
                const barcode = result.codeResult.code;
                const elementID = document.activeElement.dataset.barcodeInput;
                console.log(elementID)
                if(elementID === 'accessionID1') {
                    disableInput('accessionID2', true);
                    addEventClearScannedBarcode('clearScanAccessionID');
                    document.getElementById(elementID).value = result.codeResult.code;
                    Quagga.stop();
                    document.querySelector('[data-dismiss="modal"]').click();
                    return
                };
                if(elementID === 'masterSpecimenId') {
                    disableInput('masterSpecimenId', true);
                    document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end) : result.codeResult.code;
                    Quagga.stop();
                    document.getElementById('closeBarCodeScanner').click();
                    const masterSpecimenId = document.getElementById('masterSpecimenId').value;
                    if(masterSpecimenId == ''){
                        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
                        return
                    }
                    let masterIdSplit = masterSpecimenId.split(/\s+/);
                    let foundInOrphan = false;
                    //get all ids from the hidden
                    let shippingTable = document.getElementById('specimenList')
                    let orphanTable = document.getElementById('orphansList')
                    let biospecimensList = []
                    let tableIndex = -1;
                    let foundInShipping = false;
                    for(let i = 1; i < shippingTable.rows.length; i++){
                        let currRow = shippingTable.rows[i];
                        if(currRow.cells[0]!==undefined && currRow.cells[0].innerText == masterSpecimenId){
                            console.log(currRow.cells[2].innerText)
                            tableIndex = i;
                            biospecimensList = JSON.parse(currRow.cells[2].innerText)
                            foundInShipping = true;
                            console.log('owikebnvolekidbnvpowivbhnwspolivkbnh')
                            console.log(JSON.stringify(biospecimensList))
                        }
                        
                    }
                    
                for(let i = 1; i < orphanTable.rows.length; i++){
                        let currRow = orphanTable.rows[i];
                        if(currRow.cells[0]!==undefined && currRow.cells[0].innerText == masterSpecimenId){
                            //console.log(currRow.cells[2].innerText)
                            tableIndex = i;
                            let currTubeNum = currRow.cells[0].innerText.split(' ')[1];
                            console.log(currTubeNum)
                            biospecimensList = [currTubeNum];
                            foundInOrphan = true;
                        }
                        
                    }

                    if(biospecimensList.length == 0){
                        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
                        return
                    }
                    else{
                        document.getElementById('submitMasterSpecimenId').click(); 
                    }
                    document.querySelector('[data-dismiss="modal"]').click();
                    return;
                };
                console.log('barcode: ' + barcode)
                if(!masterSpecimenIDRequirement.regExp.test(barcode.substr(0,masterSpecimenIDRequirement.length))) return;
                if(!elementID) return;
                if(elementID === 'scanSpecimenID') {
                    disableInput('enterSpecimenID1', true);
                    disableInput('enterSpecimenID2', true);
                    addEventClearScannedBarcode('clearScanSpecimenID');
                }
                document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end) : result.codeResult.code;
                Quagga.stop();
                document.querySelector('[data-dismiss="modal"]').click();
            }
            else {
                disableInput('enterSpecimenID1', false);
                disableInput('enterSpecimenID2', false);
            }
        });
        
        Array.from(document.getElementsByClassName('close-modal')).forEach(element => {
            element.addEventListener('click', () => {
                if (Quagga){
                    Quagga.stop();
                }
                document.querySelector('[data-dismiss="modal"]').click();
            })
        });
    });
}

export const disableInput = (id, disable) => {
    document.getElementById(id).disabled = disable
    disable === true ? document.getElementById(id).classList.add('disabled') : document.getElementById(id).classList.remove('disabled');
}

export const siteLocations = {
    'research': {
        'UCM': [{location: 'UC-DCAM', concept: 777644826}],
        'MFC': [{location: 'Marshfield', concept: 692275326}, {location: 'Lake Hallie', concept: 698283667}],
        'HP': [{location: 'HP Research Clinic', concept: 834825425}],
        'HFHS': [{location: 'HFHS Research Clinic (Main Campus)', concept: 736183094}],
        'SFH': [{location: 'SF Cancer Center LL', concept: 589224449}],
        'NCI': [{location: 'NCI-1', concept: 111111111}, {location: 'NCI-2', concept: 222222222}]
    },
    'clinical': {
        'KPHI': [{location:'Oahu', concept: 945449846}, {location: 'Non-Oahu', concept: 704199032}]
    }
}

export const allStates = {
    "Alabama":1,
    "Alaska":2,
    "Arizona":3,
    "Arkansas":4,
    "California":5,
    "Colorado":6,
    "Connecticut":7,
    "Delaware":8,
    "District of Columbia": 9,
    "Florida":10,
    "Georgia":11,
    "Hawaii":12,
    "Idaho":13,
    "Illinois":14,
    "Indiana":15,
    "Iowa":16,
    "Kansas":17,
    "Kentucky":18,
    "Louisiana":19,
    "Maine":20,
    "Maryland":21,
    "Massachusetts":22,
    "Michigan":23,
    "Minnesota":24,
    "Mississippi":25,
    "Missouri":26,
    "Montana":27,
    "Nebraska":28,
    "Nevada":29,
    "New Hampshire":30,
    "New Jersey":31,
    "New Mexico":32,
    "New York":33,
    "North Carolina":34,
    "North Dakota":35,
    "Ohio":36,
    "Oklahoma":37,
    "Oregon":38,
    "Pennsylvania":39,
    "Rhode Island":40,
    "South Carolina":41,
    "South Dakota":42,
    "Tennessee":43,
    "Texas":44,
    "Utah":45,
    "Vermont":46,
    "Virginia":47,
    "Washington":48,
    "West Virginia":49,
    "Wisconsin":50,
    "Wyoming":51,
    "NA": 52
}

export const visitType = {
    '153098257': 'Baseline'
}

export const getWorflow = () => document.getElementById('contentBody').dataset.workflow;

export const getSiteTubesLists = (specimenData) => {
    const dashboardType = document.getElementById('contentBody').dataset.workflow;
    const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
    const subSiteLocation = siteLocations[dashboardType][siteAcronym] ? siteLocations[dashboardType][siteAcronym].filter(dt => dt.concept === specimenData[dashboardType === 'research' ? '951355211' : '525480516'])[0].location : undefined;
    const siteTubesList = siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym][dashboardType][subSiteLocation] : siteSpecificTubeRequirements[siteAcronym][dashboardType];
    return siteTubesList;
}

export const collectionSettings = {
    534621077: 'research',
    664882224: 'clinical',
    103209024: 'home'
}
