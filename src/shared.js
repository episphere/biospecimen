import { userNavBar, adminNavBar, nonUserNavBar } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { shipmentTracking, shippingManifest } from "./pages/shipping.js"
import { addEventClearScannedBarcode, addEventHideNotification } from "./events.js"
import { masterSpecimenIDRequirement, siteSpecificTubeRequirements } from "./tubeValidation.js"
import { workflows } from "./tubeValidation.js";
import { signOut } from "./pages/signIn.js";
import { devSSOConfig } from './dev/identityProvider.js';
import { stageSSOConfig } from './stage/identityProvider.js';
import { prodSSOConfig } from './prod/identityProvider.js';


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
    "958646668":"0013",
    "677469051":"0014",
    "683613884":"0024"
}
 const api = 'https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?';
// const api = 'http://localhost:5001/nih-nci-dceg-connect-dev/us-central1/biospecimen?';

export const inactivityTime = () => {
    let time;
    const resetTimer = () => {
        clearTimeout(time);
        time = setTimeout(() => {
            const resposeTimeout = setTimeout(() => {
                // log out user if they don't respond to warning after 5 minutes.
                signOut();
            }, 300000)
            // Show warning after 20 minutes of no activity.
            const button = document.createElement('button');
            button.dataset.toggle = 'modal';
            button.dataset.target = '#biospecimenModal'

            document.getElementById('root').appendChild(button);
            button.click();
            document.getElementById('root').removeChild(button);

            const header = document.getElementById('biospecimenModalHeader');
            const body = document.getElementById('biospecimenModalBody');

            header.innerHTML = `<h5 class="modal-title">Inactive</h5>`;

            body.innerHTML = `You were inactive for 20 minutes, would you like to extend your session?
                            <div class="modal-footer">
                                <button type="button" title="Close" class="btn btn-dark log-out-user" data-dismiss="modal">Log Out</button>
                                <button type="button" title="Continue" class="btn btn-primary extend-user-session" data-dismiss="modal">Continue</button>
                            </div>`
            
            Array.from(document.getElementsByClassName('log-out-user')).forEach(e => {
                e.addEventListener('click', () => {
                    signOut();
                })
            })
            Array.from(document.getElementsByClassName('extend-user-session')).forEach(e => {
                e.addEventListener('click', () => {
                    clearTimeout(resposeTimeout);
                    resetTimer;
                })
            });
        }, 1200000);
    }
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
};

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

export const updateParticipant = async (array) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=updateParticipantDataNotSite`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body:  JSON.stringify(array),
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
    const IDs = ['dashboard', 'manageUsers', 'shipping', 'reports'];
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
    else  if(route === '#reports') document.getElementById('reports') ? document.getElementById('reports').click() : '';
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

export const shippingPrintManifestReminder = (boxesToShip, userName, tempCheckStatus) => {
  const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    document.getElementById('root').removeChild(button);
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    header.style.borderBottom = 0;
    header.innerHTML = `<h5 class="modal-title"></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="font-size:2rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>`;
    body.innerHTML = `
        <div class="row">
            <div class="col">
                <div style="display:flex; justify-content:center; margin-bottom:1rem;">
                  <i class="fas fa-exclamation-triangle fa-5x" style="color:#ffc107"></i>
                </div>
                <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; "><span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Print Reminder</span> Have you printed the box manifest(s)?</p>
            </div>
        </div>
        <div class="row" style="display:flex; justify-content:center;">
          <button id="shipManifestConfirm" type="button" class="btn btn-primary" data-dismiss="modal" aria-label="Close" style="margin-right:4%; padding:6px 25px;">Yes</button>
          <button type="button" class="btn btn-outline-secondary" data-dismiss="modal" aria-label="Close" style="padding:6px 25px;">No</button>
        </div>
`;
  const shipManifestConfirmButton = document.getElementById("shipManifestConfirm")
  shipManifestConfirmButton.addEventListener("click", async () => {
    await shippingManifest(boxesToShip, userName, tempCheckStatus);
  })
}

export const shippingDuplicateMessage = () => {
  const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    document.getElementById('root').removeChild(button);
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    header.style.borderBottom = 0;
    header.innerHTML = `<h5 class="modal-title"></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="font-size:2rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>`;
    body.innerHTML = `
        <div class="row">
            <div class="col">
                <div style="display:flex; justify-content:center; margin-bottom:1rem;">
                  <i class="fas fa-exclamation-triangle fa-5x" style="color:#ffc107"></i>
                </div>
                <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; "><span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Duplicate Tracking Numbers</span> Please enter unique Fedex tracking numbers</p>
            </div>
        </div>
        <div class="row" style="display:flex; justify-content:center;">
          <button id="shipManifestConfirm" type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close" style="margin-right:4%; padding:6px 25px;">Close</button>
        </div>`;
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

export const removeSingleError = (id) => {
    const elements = document.getElementsByClassName('form-error');
    Array.from(elements).forEach(element => {
        
        const errorMsg = element.parentNode;
        const parent = element.parentNode.parentNode;
        
        if(parent.contains(document.getElementById(id))) parent.removeChild(errorMsg);
        
    });
    const invalids = document.getElementsByClassName('invalid');
    Array.from(invalids).forEach(element => {
        if(element.id === id){
            element.classList.remove('invalid');
        }
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
    return response.json();
}

export const getPage = async (pageNumber, numElementsOnPage, orderBy, filters) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"pageNumber": pageNumber, "elementsPerPage": numElementsOnPage, "orderBy":orderBy, "filters":filters})
    }
    const response = await fetch(`${api}api=getBoxesPagination`, requestObj);
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
    for(let i = 0; i < data.length; i++){
        let currJSON = data[i];

        if(!currJSON.hasOwnProperty("145971562") || currJSON["145971562"] != '353358909'){
            toReturn["data"].push(currJSON);
        }
    }
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
    for(let i = 0; i < arr.length; i++){
        let currJSON = arr[i];
        locations = locations.concat(currJSON['560975149']);
    }
    return locations;
}

export const getNumPages = async (numPerPage, filter) => {
    
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getNumBoxesShipped`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filter)
    });
    let res = await response.json();
    let numBoxes = res.data;
    return Math.ceil(numBoxes/numPerPage);
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

export const siteContactInformation = {
  "UCM":[{
    "fullName":"Jaime King",
    "email":"jaimeking@bsd.uchicago.edu",
    "phone":["(773) 702-5073"],
  }],
  "MFC":[{
    "fullName":"Jacob Johnston",
    "email":"johnston.jacob@marshfieldclinic.org",
    "phone":["715-898-9444"],
  }],
  "HP":[{
    "fullName":"Erin Schwartz",
    "email":"Erin.C.Schwartz@HealthPartners.com",
    "phone":[
     "Office: (651) 495-6371",
     "Cell: (612) 836-7885"
    ]
  }],
  "SFH":[{
    "fullName":"Kimberly (Kay) Spellmeyer",
    "email":"kimberly.spellmeyer@sanfordhealth.org",
    "phone":["605-312-6100"],
  },{
    "fullName":"DeAnn Witte",
    "email":"deann.witte@sanfordhealth.org",
    "phone":["701-234-6718"],
  }],
  "KPCO":[{
    "fullName":"Brooke Thompson",
    "email":"Brooke.x.thompson@kp.org",
    "phone":["720-369-4316"],
  }],
  "KPHI":[{
    "fullName":"Cyndee Yonehara",
    "email":"Cyndee.H.Yonehara@kp.org",
    "phone":["Mobile: 808-341-5736"],
  }],
  "KPNW":[{
    "fullName":"Sarah Vertrees",
    "email":"sarah.vertrees@kpchr.org",
    "phone":["503-261-4144"],
  }],
  "KPGA":[{
    "fullName":"Brandi Robinson",
    "email":"brandi.e.robinson@kp.org",
    "phone":["470-217-2993"],
  }],
  "HFHS":[{
    "fullName":"Kathleen Dawson",
    "email":"kdawson7@hfhs.org",
    "phone":["248-910-6716"],
  }]
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
                if(elementID === 'accessionID1') {
                    disableInput('accessionID2', true);
                    // addEventClearScannedBarcode('clearScanAccessionID');
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
                            tableIndex = i;
                            biospecimensList = JSON.parse(currRow.cells[2].innerText)
                            foundInShipping = true;
                        }
                        
                    }
                    
                for(let i = 1; i < orphanTable.rows.length; i++){
                        let currRow = orphanTable.rows[i];
                        if(currRow.cells[0]!==undefined && currRow.cells[0].innerText == masterSpecimenId){
                            tableIndex = i;
                            let currTubeNum = currRow.cells[0].innerText.split(' ')[1];
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
                if(!masterSpecimenIDRequirement.regExp.test(barcode.substr(0,masterSpecimenIDRequirement.length))) return;
                if(!elementID) return;
                if(elementID === 'scanSpecimenID') {
                    disableInput('enterSpecimenID1', true);
                    disableInput('enterSpecimenID2', true);
                    // addEventClearScannedBarcode('clearScanSpecimenID');
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
        'KPHI': [{location:'KPHI RRL', concept: 531313956}]
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

export const visitType = [
    {'concept': '266600170', 'visitType': 'Baseline'},
    {'concept': '496823485', 'visitType': 'Follow-up 1'},
    {'concept': '650465111', 'visitType': 'Follow-up 2'},
    {'concept': '303552867', 'visitType': 'Follow-up 3'}
];

export const checkedIn = (data) => {

    let isCheckedIn = false;

    if(data['331584571']) {
        Array.from(visitType).forEach(visit => {
            if(data['331584571'][visit.concept]) {
                if(data['331584571'][visit.concept]['135591601'] && data['331584571'][visit.concept]['135591601'] === 353358909) {
                    isCheckedIn = true;
                }
            }
        });
    }

    return isCheckedIn;
};

export const getCheckedInVisit = (data) => {

    let visitConcept;

    Array.from(visitType).forEach(visit => {
        if(data['331584571'][visit.concept] && data['331584571'][visit.concept]['135591601'] === 353358909) {
            visitConcept = visit.concept;
        }
    });

    return visitConcept;
};

export const checkInParticipant = async (data, visitConcept) => {
    
    let visits;
    const user_uid = data.state.uid;

    if(data['331584571']) {

        visits = data['331584571'];

        if(!visits[visitConcept]) {

            visits[visitConcept] = {
                '840048338': new Date()
            }
        }

        visits[visitConcept]['135591601'] = 353358909;
    }
    else {

        visits = {
            [visitConcept]: {
                '135591601': 353358909,
                '840048338': new Date()
            }
        };
    }

    const checkInData = {
        '331584571': visits,
        uid: user_uid
    };
        
    await updateParticipant(checkInData);
};

export const checkOutParticipant = async (data) => {

    let visits = data['331584571'];
    const checkedInVisit = getCheckedInVisit(data);
    const user_uid = data.state.uid;

    if(checkedInVisit) {

        visits[checkedInVisit]['135591601'] = 104430631;

        if(!visits[checkedInVisit]['343048998']) {
            visits[checkedInVisit]['343048998'] = new Date();
        }

        const checkOutData = {
            '331584571': visits,
            uid: user_uid
        };
         
         await updateParticipant(checkOutData);
    }
};

export const getWorflow = () => document.getElementById('contentBody').dataset.workflow;

export const getSiteTubesLists = (specimenData) => {
    const dashboardType = document.getElementById('contentBody').dataset.workflow;
    const siteAcronym = document.getElementById('contentBody').dataset.siteAcronym;
    const subSiteLocation = siteLocations[dashboardType]?.[siteAcronym] ? siteLocations[dashboardType]?.[siteAcronym]?.filter(dt => dt.concept === specimenData['951355211'])[0]?.location : undefined;
    const siteTubesList = siteSpecificTubeRequirements[siteAcronym]?.[dashboardType]?.[subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym]?.[dashboardType]?.[subSiteLocation] : siteSpecificTubeRequirements[siteAcronym]?.[dashboardType];
    return siteTubesList;
}

export const collectionSettings = {
    534621077: 'research',
    664882224: 'clinical',
    103209024: 'home'
}

export const SSOConfig = (email) => {
    let tenantID = '';
    let provider = '';
    if(location.host === urls.prod) {
        let config = prodSSOConfig(tenantID, provider, email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    else if(location.host === urls.stage) {
        let config = stageSSOConfig(tenantID, provider, email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    else {
        let config = devSSOConfig(tenantID, provider, email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    return { tenantID, provider }
}

export const getParticipantSelection = async (filter) => {
    const idToken = await getIdToken();
    const response = await fetch(`https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=getParticipantSelection&type=${filter}`, 
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + idToken,
      },
    });
    return response.json();
  }
     
export const isDeviceMobile = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(window.navigator.userAgent) ||
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(window.navigator.userAgent) || window.innerWidth < 1300;
export const replaceDateInputWithMaskedInput = (dateInput) => {

  if (dateInput.type !== "date") throw new Error(`${dateInput} must be a input type="date"`);
  dateInput.type = "text";
  dateInput.placeholder = "mm/dd/yyyy";
  dateInput.maxLength = 10;
  dateInput.dataset.maskedInputFormat = "mm/dd/yyyy";
  dateInput.addEventListener("keypress", function (e) {
    
    if (e.keyCode < 47 || e.keyCode > 57) {
      e.preventDefault();
    }
    
    const len = dateInput.value.length;
    
    if (len !== 1 || len !== 3) {
      if (e.keyCode == 47) {
        dateInput.preventDefault();
      }
    }
    
    if (len === 2 || len === 3) {
        dateInput.value += '/';
    }

    if (len === 5) {
        dateInput.value += '/';
    }
  });
};

// Convert ISO to Readable Date and UTC Time (UTC FORMAT TO MATCH BSI)
export const convertTime = (time) => {
    if (!time) {
        return "";
    }
    let formatISO = time;
    const myDate = new Date(formatISO);
    
    return myDate.toLocaleString("en-us", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hourCycle: 'h23',
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const allTubesCollected = (data) => {

    let flag = true; 

    if(data['650516960']) {
        const tubes = workflows[collectionSettings[data['650516960']]];
        tubes.forEach(tube => {
            if(!data[tube['concept']]['593843561'] || data[tube['concept']]['593843561'] !== 353358909 || !data[tube['concept']]['825582494']) {
                flag = false;
            }
        });
    }
    else {
        flag = false;
    }

    return flag;
};

export const displayContactInformation = (site, siteContactInformation) => {
  if(siteContactInformation.hasOwnProperty(site)){
    let contactStr = ""
    contactStr += `<p>Site Contact Information:</p>`
    let numContacts = siteContactInformation[site].length
    // iterate over length of existing site's contact array
    for(let i= 0; i < numContacts;i++) {
    contactStr += `${numContacts > 1 ? "<p>Contact ${i+1}</p>": ""}`
    contactStr += `<p>${siteContactInformation[site][i].fullName}</p>`
    contactStr += `<p>Email: ${siteContactInformation[site][i].email}</p>`
    
    let numPhones = siteContactInformation[site][i].phone.length
    if(numPhones === 1){
      contactStr += `<p>Phone: ${siteContactInformation[site][i].phone}</p>`  
    }
    else if(numPhones > 1){
      contactStr += `<p>Phone:</p>`
      for(let j = 0; j < numPhones; j++){
        contactStr += `<p>${siteContactInformation[site][i].phone[j]}</p>`
      }
    }
    else contactStr+= `<p>Phone:</p>`
  }
    return contactStr
  }
  else return ""
}

export const checkShipForage = async (shipSetForage, boxesToShip) => {
  let forageBoxIdArr = []
  try {
      let value = await localforage.getItem("shipData")
      console.log(value)
      if (value === null) {
          await localforage.setItem("shipData", shipSetForage)
      }
      for (let i in value) {
          forageBoxIdArr.push(value[i].boxId)
      }
      
      let boxMatch = forageBoxIdArr.some(item => boxesToShip.includes(item))
      // Compare forageBoxIdArr with boxesToShip
      // If there is not at least one boxid match from boxesToShip
      if (!boxMatch) {
          await localforage.setItem("shipData", shipSetForage)
      }
  }    
   catch (e) {
      console.log(e)
      await localforage.setItem("shipData", shipSetForage)
  }
}

export const sortBiospecimensList = (biospecimensList, tubeOrder) => {
  const bioArr = []
  // push list of unordered ids
  biospecimensList.forEach(id => { bioArr.push({"tubeId": id}) })
  // sort unordered id list with custom tube order sort
  bioArr.sort((a, b) => tubeOrder.indexOf(a.tubeId) - tubeOrder.indexOf(b.tubeId))
  return bioArr.map(item => item.tubeId)
}
export const checkAlertState = (alertState, createBoxSuccessAlertEl, createBoxErrorAlertEl) => {
  if (typeof alertState === "boolean") {
    if (alertState) {
      createBoxSuccessAlertEl.style.display = createBoxSuccessAlertEl.style.display === "none" ? "" : "none";
      delay(3000).then(() => createBoxSuccessAlertEl.style.display = "none") 
    }
    else {
      createBoxErrorAlertEl.style.display = createBoxErrorAlertEl.style.display === "none" ? "" : "none";
      delay(3000).then(() => createBoxErrorAlertEl.style.display = "none")
    }
  }
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const convertNumsToCondition = (packagedCondition, packageConversion) => {
  let listConditions = ''
  if(!packagedCondition) {
    return listConditions
  }
  packagedCondition.forEach(condition => {
    listConditions +=`<p>${packageConversion[condition]}</p>`}
  )
  
  return listConditions
}

export const checkFedexShipDuplicate = (boxes) => {
  let arr = []
  boxes.forEach(boxId => arr.push(document.getElementById(`${boxId}trackingId`).value))
  let filteredArr = new Set(arr)
  return arr.length !== filteredArr.size
}

export const urls = {
    'stage': 'biospecimen-myconnect-stage.cancer.gov',
    'prod': 'biospecimen-myconnect.cancer.gov'
  }
  