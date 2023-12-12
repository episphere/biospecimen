import { userNavBar, adminNavBar, nonUserNavBar, unAuthorizedUser } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { generateShippingManifest } from "./pages/shipping.js"
import { masterSpecimenIDRequirement, siteSpecificTubeRequirements } from "./tubeValidation.js"
import { workflows, specimenCollection } from "./tubeValidation.js";
import { signOut } from "./pages/signIn.js";
import { devSSOConfig } from './dev/identityProvider.js';
import { stageSSOConfig } from './stage/identityProvider.js';
import { prodSSOConfig } from './prod/identityProvider.js';
import { conceptIds } from './fieldToConceptIdMapping.js';
import { baselineEmailTemplate } from "./emailTemplates.js";


export const urls = {
    'stage': 'biospecimen-myconnect-stage.cancer.gov',
    'prod': 'biospecimen-myconnect.cancer.gov'
}

/**
 * Creates a store object with setState and getState methods
 * @param {object} [initialState={}] -initial state of the store
 */
function createStore(initialState = {}) {
    let state = initialState;
  
    /** @param {object | function} update - an object or a function to update state */
    const setState = (update) => {
      const currSlice = typeof update === 'function' ? update(state) : update;
      if (currSlice !== state) {
        state = { ...state, ...currSlice };
      }
    };
  
    /** @return {object}  */
    const getState = () => state;
  
    return { setState, getState };
  }

export const appState = createStore();

let api = '';

if(location.host === urls.prod) api = 'https://api-myconnect.cancer.gov/biospecimen?';
else if(location.host === urls.stage) api = 'https://api-myconnect-stage.cancer.gov/biospecimen?';
else api = 'https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?';
export const baseAPI = api;

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

export const getDailyParticipant = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${api}api=getDailyReportParticipants`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}



export const updateParticipant = async (dataObj) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=updateParticipantDataNotSite`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body:  JSON.stringify(dataObj),
    });
    
    return await response.json();
}

export const getUserProfile = async (uid) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getUserProfile&uid=${uid}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        }
    });
    
    return await response.json();
}

export const sendClientEmail = async (array) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(array)
    }
    const response = await fetch(`${api}api=sendClientEmail`, requestObj);
    
    return response;
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
    logAPICallStartDev('userAuthorization');
    showAnimation();
    const response = await validateUser();
    logAPICallEndDev('userAuthorization');
    if(response.code === 200) {
        const responseData = response.data;
        if(responseData.role === 'admin' || responseData.role === 'manager') document.getElementById('navbarNavAltMarkup').innerHTML = adminNavBar(name || responseData.email);
        else if(responseData.role === 'user') document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar(name || responseData.email);
        toggleCurrentPage(route);
        hideAnimation();
        return responseData;
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
    const verifiedParticipants = response.data.filter(dt => dt['821247024'] === 197316935);

    if (response.code === 200 && verifiedParticipants.length > 0) {
      searchResults(verifiedParticipants);
    } else if (response.code === 200 && verifiedParticipants.length === 0) {
      showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'});
    }
}

// show notifications in the UI. z-index controls the order of the modal
// zIndex of 1000 is less than loading animation z-index of 9999. set zIndex to 10000 to show notifications on top of loading animation.
// Current use: shimpent completion success notification. Show the success modal above the loading animation.
export const showNotifications = (data, zIndex) => {
    const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    if (zIndex) document.getElementById('biospecimenModal').style.zIndex = zIndex;
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

export const shippingPrintManifestReminder = (boxesToShip, userName, tempCheckStatus, currShippingLocationNumber) => {
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
    await generateShippingManifest(boxesToShip, userName, tempCheckStatus, currShippingLocationNumber);
  })
}

export const shippingDuplicateMessage = (duplicateIdNumber) => {
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
                <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; "><span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Duplicate Tracking Numbers${duplicateIdNumber ? `[${duplicateIdNumber}]` : ''}</span> Please enter unique Fedex tracking numbers</p>
            </div>
        </div>
        <div class="row" style="display:flex; justify-content:center;">
          <button id="shipManifestConfirm" type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close" style="margin-right:4%; padding:6px 25px;">Close</button>
        </div>`;
}

export const shippingNonAlphaNumericStrMessage = () => {
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
                  <i class="fas fa fa-times-circle fa-6x" style="color:#d9534f"></i>
                </div>
                <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; "><span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Invalid Input:</span> Please enter only alphanumeric characters</p>
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
    logAPICallStartDev('storeSpecimen');
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
    logAPICallEndDev('storeSpecimen');
    return response.json();
}

export const checkAccessionId = async (data) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }
    const response = await fetch(`${api}api=accessionIdExists`, requestObj);
    return response.json();
}

export const updateSpecimen = async (array) => {
    logAPICallStartDev('updateSpecimen');
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(array)
    }
    const response = await fetch(`${api}api=updateSpecimen`, requestObj);
    logAPICallEndDev('updateSpecimen');
    return response.json();
}

export const checkDerivedVariables = async (participantObjToken) => {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(participantObjToken)
    }
    const response = await fetch(`${api}api=checkDerivedVariables`, requestObj);
    return response.json();
}

export const updateBox = async (box) => {
    try {
        const idToken = await getIdToken();
        const requestObj = {
            method: "POST",
            headers:{
                Authorization:"Bearer "+idToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(convertToFirestoreBox(box)),
        }

        const response = await fetch(`${api}api=updateBox`, requestObj);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to update box:', error);
        throw error;
    }
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

/**
 * Ship boxes
 * @param {object} boxIdToTrackingNumberMap {boxId:trackingNumber}
 * @param {object} shippingData 
 * @returns 
 */
export const ship = async (boxIdToTrackingNumberMap, shippingData) => {
    try {
        const requestBody = JSON.stringify({boxIdToTrackingNumberMap, shippingData});
        const idToken = await getIdToken();
        const requestObj = {
            method: "POST",
            headers:{
                Authorization:"Bearer " + idToken,
                "Content-Type": "application/json"
            },
            body: requestBody,
        }
        
        const response = await fetch(`${api}api=ship`, requestObj);

        return await response.json();
    } catch (error) {
        return {code: 500, message: error.message};
    }
}

export const getPage = async (pageNumber, elementsPerPage, orderBy, filters, source) => {
  try {
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({pageNumber, elementsPerPage, orderBy, filters, source})
    }
    const response = await fetch(`${api}api=getBoxesPagination`, requestObj);
    return response.json();
  } 
  catch (error) {
    return {code: 500, message: error.message};
  }
}

export const bagConceptIdList = [
    conceptIds.bag1,
    conceptIds.bag2,
    conceptIds.bag3,
    conceptIds.bag4,
    conceptIds.bag5,
    conceptIds.bag6,
    conceptIds.bag7,
    conceptIds.bag8,
    conceptIds.bag9,
    conceptIds.bag10,
    conceptIds.bag11,
    conceptIds.bag12,
    conceptIds.bag13,
    conceptIds.bag14,
    conceptIds.bag15,
    conceptIds.bag16,
    conceptIds.bag17,
    conceptIds.bag18,
    conceptIds.bag19,
    conceptIds.bag20,
    conceptIds.bag21,
    conceptIds.bag22,
    conceptIds.bag23,
    conceptIds.bag24,
    conceptIds.bag25,
    conceptIds.bag26,
    conceptIds.bag27,
    conceptIds.bag28,
    conceptIds.bag29,
    conceptIds.bag30,
    conceptIds.bag31,
    conceptIds.bag32,
    conceptIds.bag33,
    conceptIds.bag34,
    conceptIds.bag35,
    conceptIds.bag36,
    conceptIds.bag37,
    conceptIds.bag38,
    conceptIds.bag39,
    conceptIds.bag40,
];
  
const bagConversionKeys = [
  conceptIds.scannedByFirstName,
  conceptIds.scannedByLastName,
  conceptIds.orphanBagFlag,
];

export const convertToOldBox = (inputBox) => {
  // If the box already has a bags property, return early
  if (inputBox.bags) return inputBox;

  // Otherwise, process the bags
  let bags = {};
  let outputBox = { ...inputBox };
  let hasOrphanBag = false;
  let orphanBag = { arrElements: [] };

  for (let bagConceptId of bagConceptIdList) {
    // If there's no bag corresponding to the current bagConceptId, skip to the next one
    if (!inputBox[bagConceptId]) continue;

    // Extract properties from inputBag
    let outputBag = {};
    const inputBag = inputBox[bagConceptId];

    for (let k of bagConversionKeys) {
      if (inputBag[k]) outputBag[k] = inputBag[k];
    }

    // Handle the orphanBag case
    if (inputBag[conceptIds.bagscan_orphanBag]) {
      hasOrphanBag = true;
      orphanBag = { ...orphanBag, ...outputBag };
      orphanBag.arrElements.push(...inputBag[conceptIds.tubesCollected]);
    // Handle the regular bag case
    } else {
      outputBag.arrElements = inputBag[conceptIds.tubesCollected];
      let bagID;

      if (inputBag[conceptIds.bagscan_bloodUrine]) {
        bagID = inputBag[conceptIds.bagscan_bloodUrine];
        outputBag.isBlood = true;
      } else if (inputBag[conceptIds.bagscan_mouthWash]) {
        bagID = inputBag[conceptIds.bagscan_mouthWash];
        outputBag.isBlood = false;
      }
        
      bags[bagID] = outputBag;
    }
      
    // Clean up the outputBox
    delete outputBox[bagConceptId];
  }

  // Handle the orphanBag case
  if (hasOrphanBag) {
    bags['unlabelled'] = orphanBag;
  }

  // Finalize the outputBox
  outputBox.bags = bags;
  const locationConceptID = inputBox[conceptIds.shippingLocation];
  outputBox.siteAcronym = locationConceptIDToLocationMap[locationConceptID]?.siteAcronym || 'Not Found';

  return outputBox;
};

export const convertToFirestoreBox = (inputBox) => {
  let { bags } = inputBox;
  let outputBox = { ...inputBox };
  let bagConceptIDIndex = 0;
  outputBox[conceptIds.containsOrphanFlag] = conceptIds.no;
  delete outputBox.bags;
  const defaultOutputBag = { [conceptIds.bagscan_bloodUrine]: '', [conceptIds.bagscan_mouthWash]: '', [conceptIds.bagscan_orphanBag]: '' };
    
  for (let [bagID, inputBag] of Object.entries(bags)) {
      if (bagConceptIDIndex >= bagConceptIdList.length) break;      
      inputBag.arrElements = Array.from(new Set(inputBag.arrElements));

    if (bagID === 'unlabelled') {
        outputBox[conceptIds.containsOrphanFlag] = conceptIds.yes;       
      for (let tubeID of inputBag.arrElements) {
          let outputBag = {...defaultOutputBag};          
          const bagConceptID = bagConceptIdList[bagConceptIDIndex];
          const keysNeeded = [            
              conceptIds.scannedByFirstName,              
              conceptIds.scannedByLastName,        
              conceptIds.orphanBagFlag,
          ];

        for (let k of keysNeeded) {
          if (inputBag[k]) outputBag[k] = inputBag[k];
        }

        outputBag[conceptIds.bagscan_orphanBag] = tubeID;
        outputBag[conceptIds.orphanBagFlag] = conceptIds.yes;
        outputBag[conceptIds.tubesCollected] = [tubeID];
        outputBox[bagConceptID] = outputBag;
        bagConceptIDIndex++;
      }
    } else {
      let outputBag = {...defaultOutputBag};
      const bagConceptID = bagConceptIdList[bagConceptIDIndex];
      const keysNeeded = [
        conceptIds.scannedByFirstName,
        conceptIds.scannedByLastName,
      ];

      for (let k of keysNeeded) {
        if (inputBag[k]) outputBag[k] = inputBag[k];
      }

      const bagIDEndString = bagID.split(' ')[1];
        if (bagIDEndString === '0008') {  
          outputBag[conceptIds.bagscan_bloodUrine] = bagID;
        } else if (bagIDEndString === '0009') {
            outputBag[conceptIds.bagscan_mouthWash] = bagID;
      }

      outputBag[conceptIds.orphanBagFlag] = conceptIds.no;
      outputBag[conceptIds.tubesCollected] = inputBag.arrElements;
      outputBox[bagConceptID] = outputBag;
      bagConceptIDIndex++;
    }
  }

  let keysToRomove = ['siteAcronym'];
  for (let k of keysToRomove) {
    if (outputBox[k]) delete outputBox[k];
  }
  return outputBox;
};

// Fetches all boxes for site
export const getBoxes = async () => {
  logAPICallStartDev('getBoxes');
  const idToken = await getIdToken();
  const response = await fetch(`${api}api=searchBoxes`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + idToken,
      },
  });
  const res = await response.json();

  const boxesToReturn = res.data
      .map(convertToOldBox)
      .filter(box => box[conceptIds.submitShipmentFlag] !== conceptIds.yes);

  logAPICallEndDev('getBoxes');
  return { data: boxesToReturn };
};

export const getAllBoxes = async (flagValue) => {
    logAPICallStartDev('getAllBoxes');
    const idToken = await getIdToken()
    let flag = ``;

    if (flagValue === `bptl` || flagValue === `bptlPackagesInTransit`) flag = flagValue;
    const response = await fetch(`${api}api=searchBoxes&source=${flag}`, {
        method: 'GET',
        headers: {
        Authorization: 'Bearer ' + idToken,
        }
    });
    let res = await response.json();
    res.data = res.data.map(convertToOldBox);
    logAPICallEndDev('getAllBoxes');
    return res;
};

export const getUnshippedBoxes = async (isBPTL = false) => {
    try {
        const idToken = await getIdToken();  
        let queryString = `${api}api=getUnshippedBoxes`;
        if (isBPTL) queryString += `&isBPTL=${isBPTL}`;
        
        const response = await fetch(queryString, {
            method: 'GET',
            headers: {
            Authorization: 'Bearer ' + idToken,
            }
        });

        if (!response.ok) throw new Error(`Unexpected server error: ${response.status}`);

        const unshippedBoxRes = await response.json();
        unshippedBoxRes.data = unshippedBoxRes.data.map(convertToOldBox);
        return unshippedBoxRes;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Get specimens by boxed status isolates only the specimens that need to be fetched/available in the shipping dashboard.
 * @param {string} boxedStatus - boxed status of the specimens to fetch (notBoxed, partiallyBoxed, or boxed) .
 * @param {*} isBPTL - boolean to indicate if the request is from BPTL.
 * @returns list of specimens.
 */
export const getSpecimensByBoxedStatus = async (boxedStatus, isBPTL = false) => {
    try {
        const idToken = await getIdToken();
        let queryString = `${api}api=getSpecimensByBoxedStatus&boxedStatus=${boxedStatus}`;
        if (isBPTL) queryString += `&isBPTL=${isBPTL}`;
        
        const response = await fetch(queryString, {
            method: 'GET',
            headers: {
            Authorization: 'Bearer ' + idToken,
            }
        });

        if (!response.ok) throw new Error(`Unexpected server error: ${response.status}`);

        const specimensRes = await response.json();
        const hasStrayTubes = boxedStatus === conceptIds.partiallyBoxed.toString();

        return buildAvailableCollectionsObject(specimensRes.data, hasStrayTubes);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Combine the Available Collections objects from the unboxed and partially boxed specimens.
 * @param {object} obj1 - fetched and arranged available collections object.
 * @param {object} obj2 - fetched and arranged available collections object.
 * @returns {object} availableCollectionsObject - combined available collections object without duplicates
 * Get unique keys from both objects. Combine and de-duplicate if key exists in both objects. Else take the key from the object that has it.
 */
export const combineAvailableCollectionsObjects = (obj1, obj2) => {
    const availableCollectionsObject = {};
    const availableCollectionKeys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];

    for (const key of availableCollectionKeys) {
        if (obj1[key] && obj2[key]) {
            availableCollectionsObject[key] = [...new Set([...obj1[key], ...obj2[key]])];
        } else if (obj1[key]) {
            availableCollectionsObject[key] = obj1[key];
        } else {
            availableCollectionsObject[key] = obj2[key];
        }
    }
    return availableCollectionsObject;
}

/**
 * Build the available collections object. Remove unusable tubes.
 * Filter tubes (available collections vs strays) for use in the shipping dashboard.
 * @param {array<object>} specimensList - list of specimens from Firestore.
 * @param {boolean} isPartiallyBoxed - boolean to indicate if the request is for partially boxed specimens. 
 * @returns {object} { availableCollections, specimensList } - available collections object and the updated specimens list.
 * Note: Mouthwash tubes are always solo. They belong in available collections. The tube number is always '0007', the bag number is always '0009'.
 */
const buildAvailableCollectionsObject = (specimensList, isPartiallyBoxed) => {
    if (!specimensList || specimensList.length === 0) return { availableCollections: {}, specimensList: [] };
    const availableCollections = {};
    for (let specimen of specimensList) {
        const usableTubesObj = arrangeFetchedTubes(specimen, isPartiallyBoxed);
        const usableBagKeys = Object.keys(usableTubesObj);
        for (const bagKey of usableBagKeys) {
            if (!availableCollections[bagKey]) {
                availableCollections[bagKey] = [];
            }
            availableCollections[bagKey] = [...availableCollections[bagKey], ...usableTubesObj[bagKey]];
        }
    }
    return { availableCollections, specimensList };
}

/**
 * Handle the fetched specimen docs. Remove the unusable (deviated or missing) tubes, then arrange remaining tubes for available collections and the stray tube list.
 * This function mutates the specimen object from the calling function AND returns the usableTubes object.
 * @param {object} specimen - specimen object.
 * @param {boolean} isPartiallyBoxed - boolean to indicate if the request is for partially boxed specimens.
 * @returns {object} usableTubes - usable tubes from the specimen that are usable
 */
const arrangeFetchedTubes = (specimen, isPartiallyBoxed) => {
    const usableTubes = {};
    
    const collectionId = specimen[conceptIds.collection.id];
    if (!collectionId) return;
    const bloodUrineCollection = `${collectionId} 0008`;
    const mouthwashCollection = `${collectionId} 0009`;
    
    const tubeDataObject = removeUnusableTubes(specimen);
    const allTubeIdsInSpecimen = Object.values(tubeDataObject);

    const allMouthwashTubes = allTubeIdsInSpecimen.filter(tubeId => tubeId.split(' ')[1] === '0007');
    const allBloodUrineTubes = allTubeIdsInSpecimen.filter(tubeId => tubeId.split(' ')[1] !== '0007');
    let strayTubeArray = specimen[conceptIds.strayTubesList] ?? [];

    // Handle mouthwash tubes. Mouthwash tubes always belong in available collections (not the stray tubes list).
    // If mouthwash tube is in stray tubes (this happens for partiallyBoxed specimens when other tubes in the specimen are boxed first),
    // Add it to available collections and remove from stray tubes list.
    if (allMouthwashTubes.length > 0) {
        if (isPartiallyBoxed) {
            // Mouthwash tubes will be in the stray tubes array.
            const index = strayTubeArray.findIndex(str => str.endsWith('0007'));
            if (index !== -1) {
                const mouthwashTube = strayTubeArray[index];
                if (mouthwashTube) {
                    usableTubes[mouthwashCollection] = [mouthwashTube.slice(-4)];
                    strayTubeArray.splice(index, 1);
                }
            }
        } else {
            usableTubes[mouthwashCollection] = allMouthwashTubes.map(str => str.slice(-4));
        }
    }
    
    // Compare all blood/urine tubes to stray tubes list.
    // If all allBloodUrineTubes are in the strayTubesList, add them to available collections and remove from stray tubes list.
    if (allBloodUrineTubes.length > 0) {
        if (isPartiallyBoxed || strayTubeArray.length > 0) {
            const areAllTubesInStrayTubeArray = allBloodUrineTubes.every(tubeId => strayTubeArray.includes(tubeId));
            if (areAllTubesInStrayTubeArray) {
                usableTubes[bloodUrineCollection] = allBloodUrineTubes.map(str => str.slice(-4));
                strayTubeArray = strayTubeArray.filter(tubeId => !allBloodUrineTubes.includes(tubeId));
            }
        } else {
            usableTubes[bloodUrineCollection] = allBloodUrineTubes.map(str => str.slice(-4));
        }
    }
    
    // Assign the 'unlabelled' tubes for use in the available collections object.
    if (strayTubeArray.length !== 0) usableTubes['unlabelled'] = strayTubeArray;

    return usableTubes;
}

const tubeDeviationFlags = [
    conceptIds.collection.deviationType.broken,
    conceptIds.collection.deviationType.discard,
    conceptIds.collection.deviationType.insufficientVolume,
    conceptIds.collection.deviationType.mislabel,
    conceptIds.collection.deviationType.notFound,
];

/**
 * Remove deviated unshippable tubes and missing tubes from the specimen object. Do not remove deviated shippable tubes.
 * @param {object} specimen - specimen object from the Firestore.
 */
const removeUnusableTubes = (specimen) => {
    const tubeDataObject = {};
    tubeLoop: for (const tubeKey of specimenCollection.tubeCidList) {
        const tube = specimen[tubeKey];

        if (!tube || !tube[conceptIds.collection.tube.scannedId]) {
            delete specimen[tubeKey];
            continue;
        }

        if (tube[conceptIds.discardFlag] === conceptIds.yes) {
            delete specimen[tubeKey];
            continue;
        }

        if (tube[conceptIds.collection.tube.isMissing] === conceptIds.yes) {
            delete specimen[tubeKey];
            continue;
        }

        // This is a sanity check, but hasn't been needed in testing. All applicable tubes have been filtered by the discard flag.
        const tubeDeviation = tube[conceptIds.collection.tube.deviation];
        for (const deviationFlag of tubeDeviationFlags) {
            if (tubeDeviation?.[deviationFlag] === conceptIds.yes) {
                delete specimen[tubeKey];
                continue tubeLoop;
            }
        }
        tubeDataObject[tubeKey] = tube[conceptIds.collection.tube.scannedId];  
    };
    return tubeDataObject;
}

/**
 * Get specimens from an array of collectionIds.
 * @param {array<string>} collectionIdsArray - list of collectionIds to fetch specimen documents.
 * @param {*} isBPTL - boolean to indicate if the request is from BPTL.
 * @returns list of specimens objects.
 */
export const getSpecimensByCollectionIds = async (collectionIdsArray, isBPTL = false) => {
  
  if (collectionIdsArray.length === 0) return [];
  const collectionIdQueryString = Array.from(collectionIdsArray).join(',');

  try {
      const idToken = await getIdToken();  
      let queryString = `${api}api=getSpecimensByCollectionIds&collectionIdsArray=${collectionIdQueryString}`;
      if (isBPTL) queryString += `&isBPTL=${isBPTL}`;
      
      const response = await fetch(queryString, {
          method: 'GET',
          headers: {
          Authorization: 'Bearer ' + idToken,
          }
      });

      if (!response.ok) throw new Error(response.statusText);

      const specimensResponse = await response.json();
      return specimensResponse.data;
  } catch (error) {
      console.error(error);
      throw error;
  }
};

/**
 * Get specimens from a list of boxes.
 * @param {array<object>} boxList - list of current unshipped boxes for the shipping dashboard.
 * @param {boolean} isBPTL - boolean to indicate if the request is from BPTL.
 * @returns list of specimens objects with only the specimens in the current boxes.
 */
export const getSpecimensInBoxes = async (boxList, isBPTL = false) => {
  const { tubeIdSet, collectionIdSet } = extractCollectionIdsFromBoxes(boxList);
  if (collectionIdSet.size === 0) return [];
  const collectionIdQueryString = Array.from(collectionIdSet).join(',');

  try {
      const idToken = await getIdToken();  
      let queryString = `${api}api=getSpecimensByCollectionIds&collectionIdsArray=${collectionIdQueryString}`;
      if (isBPTL) queryString += `&isBPTL=${isBPTL}`;
      
      const response = await fetch(queryString, {
          method: 'GET',
          headers: {
          Authorization: 'Bearer ' + idToken,
          }
      });

      if (!response.ok) throw new Error(response.statusText);

      const specimensResponse = await response.json();
      return isolateSpecimensInCurrentBoxes(specimensResponse.data, tubeIdSet);
  } catch (error) {
      console.error(error);
      throw error;
  }
};

/**
 * Extract collectionIds from a list of boxes
 * @param {array} boxList - list of boxes to process
 * @returns {array} - array of unique collectionIds
 * Bag types: 787237543 (Biohazard Blood/Urine), 223999569 (Biohazard Mouthwash), 522094118 (Orphan)
 * For non-unlabelled bag keys, the first element's collectionId represents all collectionIds in the arrElements list.
 */
const extractCollectionIdsFromBoxes = (boxList) => {
    const tubeIdSet = new Set(); 
    const collectionIdSet = new Set();

    boxList.forEach(box => {
        const bagKeys = Object.keys(box.bags);

        bagKeys.forEach(key => {
            const arrElements = box.bags[key]?.arrElements;
            if (arrElements && arrElements.length) {
                if (key === 'unlabelled') {
                    arrElements.forEach(tube => {
                        tubeIdSet.add(tube);
                        const [collectionId] = tube.split(' ');
                        collectionId && collectionIdSet.add(collectionId);
                    });
                } else {
                    const [collectionId] = arrElements[0].split(' ');
                    collectionId && collectionIdSet.add(collectionId);
                    arrElements.forEach(tube => {
                        tubeIdSet.add(tube);
                    });
                }
            }
        });
    });

    return { tubeIdSet, collectionIdSet };
}

const isolateSpecimensInCurrentBoxes = (specimensList, tubeIdSet) => {
    if (!specimensList || specimensList.length === 0) return [];
    const updatedSpecimensList = [];

    for (const specimen of specimensList) {
        for (const tubeId of specimenCollection.tubeCidList) {
            if (!specimen.data[tubeId]) continue;
            if (!specimen.data[tubeId][conceptIds.collection.tube.scannedId] || !tubeIdSet.has(specimen.data[tubeId][conceptIds.collection.tube.scannedId])) {
                delete specimen.data[tubeId];
            }    
        }
        updatedSpecimensList.push(specimen.data);
    }
    return updatedSpecimensList;
}

export const filterDuplicateSpecimensInList = (specimensList) => {
    return specimensList.reduce((acc, curr) => {
        if (!acc.some(obj => obj[conceptIds.collection.id] === curr[conceptIds.collection.id])) {
            acc.push(curr);
        }
        return acc;
    }, []);
}

// searches boxes collection by login site (789843387) and Site-specific location id (560975149)
// filters out any boxes where submitShipmentFlag is true
export const getBoxesByLocation = async (location) => {
    logAPICallStartDev('getBoxesByLocation');
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchBoxesByLocation&location=${location}`, {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({location:location})
    });

    let res = await response.json();
    res.data = res.data.map(convertToOldBox);
    logAPICallEndDev('getBoxesByLocation');
    return res;
}

export const searchSpecimen = async (masterSpecimenId, allSitesFlag) => {
    logAPICallStartDev('searchSpecimen');
    const idToken = await getIdToken();
    const specimenQuery =  `&masterSpecimenId=${masterSpecimenId}` + (allSitesFlag ? `&allSitesFlag=${allSitesFlag}`: ``)
    const response = await fetch(`${api}api=searchSpecimen${specimenQuery}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    logAPICallEndDev('searchSpecimen');
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

export const removeBag = async (boxId, bags) => {
    try {
        const currDate = new Date().toISOString();
        const bagDataToRemove = {boxId: boxId, bags: bags, date: currDate};
        const idToken = await getIdToken();

        const response = await fetch(`${api}api=removeBag`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + idToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bagDataToRemove)
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to remove bag:', error);
        throw error;
    }
};

/**
 * Fetches biospecimen collection data from the database
 * @returns {object|array} returns a response object if response is 200 or an empty array
 */
export const searchSpecimenInstitute = async () => {
    logAPICallStartDev('searchSpecimenInstitute');
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchSpecimen`, {
    method: "GET",
    headers: {
        Authorization:"Bearer "+idToken
        }
    });
    logAPICallEndDev('searchSpecimenInstitute');
    if (response.status === 200) {
        return await response.json();
    } else {
        console.error("searchSpecimenInstitute's responseObject status code not 200!");
        return [];
    }
}

/**
 * Fetches biospecimen collection data from the database via healthcare provider number and boxId
 * @param {number} requestedSite - healthcare provider/site's number
 * @param {str} boxId - boxId of the box
 * @returns {object} returns a response object of biospecimen documents with matching collection ids from healthcare provider's box id
 */
export const searchSpecimenByRequestedSiteAndBoxId = async (requestedSite, boxId) => {
    logAPICallStartDev('searchSpecimenByRequestedSiteAndBoxId');
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchSpecimen&requestedSite=${requestedSite}&boxId=${boxId}`, {
    method: "GET",
    headers: {
        Authorization:"Bearer "+idToken
        }
    });
    logAPICallEndDev('searchSpecimenByRequestedSiteAndBoxId');
    if (response.status === 200) {
        const responseObject = await response.json();
        return responseObject;
    }
    else {
        console.error("getSpecimensByRequestedSite's responseObject status code not 200!");
        return {data:[]};
    }
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
    logAPICallStartDev('getLocationsInstitute');
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getLocations`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    const res = await response.json();
    const arr = res.response;
    let locations = [];
    for(let i = 0; i < arr.length; i++){
        let currJSON = arr[i];
        locations = locations.concat(currJSON[conceptIds.shippingLocation]);
    }
    logAPICallEndDev('getLocationsInstitute');
    return locations;
}
export const getNumPages = async (numPerPage, filters, source) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getNumBoxesShipped`, {
        method: "POST",
        headers: {
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({filters, source})
    });
    let res = await response.json();
    let numBoxes = res.data;
    return Math.ceil(numBoxes/numPerPage);
  }
  catch (error) {
    return {code: 500, message: error.message};
  }
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
    logAPICallStartDev('generateBarCode');
    JsBarcode(`#${id}`, connectId, {height: 30});
    logAPICallEndDev('generateBarCode');
}

export const getUpdatedParticipantData = async (participantData) => {
    const query = `connectId=${parseInt(participantData['Connect_ID'])}`;
    let responseParticipant = await findParticipant(query);
    return responseParticipant.data[0];
}

export const updateCollectionSettingData = async (biospecimenData, tubes, participantData) => {
    participantData = await getUpdatedParticipantData(participantData);

    let settings;
    let derivedVariables = {};
    let visit = biospecimenData[conceptIds.collection.selectedVisit];

    const bloodTubes = tubes.filter(tube => tube.tubeType === "Blood tube");
    const urineTubes = tubes.filter(tube => tube.tubeType === "Urine");
    const mouthwashTubes = tubes.filter(tube => tube.tubeType === "Mouthwash");

    let bloodTubesLength = 0
    let urineTubesLength = 0
    let mouthwashTubesLength = 0

    if (participantData[conceptIds.collectionDetails]) {
        settings = participantData[conceptIds.collectionDetails];
        if (!settings[visit]) settings[visit] = {};

    } else {
        settings = {
            [visit]: {}
        }
    }

    if (!settings[visit][conceptIds.bloodCollectionSetting]) {
        bloodTubes.forEach(tube => {
            const tubeIsCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes;
            const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
            const isResearch = collectionSetting === conceptIds.research;
            const isClinical = collectionSetting === conceptIds.clinical;
            if(tubeIsCollected) {
                settings[visit][conceptIds.bloodCollectionSetting] = collectionSetting;
                if(isResearch) {
                    settings[visit][conceptIds.baseline.bloodCollectedTime] = biospecimenData[conceptIds.collection.collectionTime];
                }
                else if(isClinical) {
                    settings[visit][conceptIds.clinicalDashboard.bloodCollected] = conceptIds.yes;
                    settings[visit][conceptIds.clinicalDashboard.bloodCollectedTime] = biospecimenData[conceptIds.collection.scannedTime];

                    settings[visit][conceptIds.anySpecimenCollected] = conceptIds.yes;

                    if(!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                        settings[visit][conceptIds.anySpecimenCollectedTime] = biospecimenData[conceptIds.collection.scannedTime];
                    }
                }
                bloodTubesLength += 1
            }
        });
    }
    else if (settings[visit][conceptIds.baseline.bloodCollectedTime] !== '' ||  settings[visit][conceptIds.clinicalDashboard.bloodCollectedTime] !== ''){
        const participantBloodCollected = participantData[conceptIds.baseline.bloodCollected] === conceptIds.yes;
        const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
        const isResearch = collectionSetting === conceptIds.research;
        const isClinical = collectionSetting === conceptIds.clinical;
        let totalBloodTubesAvail = 6; // 6 blood tubes are available. Update this number if more blood tubes are added
        bloodTubes.forEach(tube => {
            const tubeIsNotCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.no;
            if (tubeIsNotCollected && participantBloodCollected) {
                totalBloodTubesAvail -= 1 // counter keeps track of unchecked blood tubes
                if (totalBloodTubesAvail === 0) { // derived variables & timestamp are updated only if all the blood tubes are unchecked
                    delete settings[visit][conceptIds.bloodCollectionSetting];
                    if (isResearch) {
                        delete settings[visit][conceptIds.baseline.bloodCollectedTime];
                    }
                    else if (isClinical) {
                        settings[visit][conceptIds.clinicalDashboard.bloodCollected] = conceptIds.no;
                        delete settings[visit][conceptIds.clinicalDashboard.bloodCollectedTime];

                        if (urineTubesLength === 0 && mouthwashTubesLength === 0) { // the anySpecimenCollected variable will only be updated to NO if mouthwash & urine specimens are not present.
                            settings[visit][conceptIds.anySpecimenCollected] = conceptIds.no;
                            if (!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                                delete settings[visit][conceptIds.anySpecimenCollectedTime];
                            }
                        }
                    }
                    derivedVariables[conceptIds.baseline.bloodCollected] = conceptIds.no;
                    bloodTubesLength = totalBloodTubesAvail;
                }
            }
        })
    }

    if (!settings[visit][conceptIds.urineCollectionSetting]) {
        urineTubes.forEach(tube => {
            const tubeIsCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes;
            const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
            const isResearch = collectionSetting === conceptIds.research;
            const isClinical = collectionSetting === conceptIds.clinical;
    
            if (tubeIsCollected) {
                settings[visit][conceptIds.urineCollectionSetting] = collectionSetting;

                if (isResearch) {
                    settings[visit][conceptIds.baseline.urineCollectedTime] = biospecimenData[conceptIds.collection.collectionTime];
                }
                else if (isClinical) {
                    settings[visit][conceptIds.clinicalDashboard.urineCollected] = conceptIds.yes;
                    settings[visit][conceptIds.clinicalDashboard.urineCollectedTime] = biospecimenData[conceptIds.collection.scannedTime];

                    settings[visit][conceptIds.anySpecimenCollected] = conceptIds.yes;

                    if (!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                        settings[visit][conceptIds.anySpecimenCollectedTime] = biospecimenData[conceptIds.collection.scannedTime];
                    }
                }
                urineTubesLength += 1
            }
        });
    }
    else if (settings[visit][conceptIds.baseline.urineCollectedTime] !== '' ||  settings[visit][conceptIds.clinicalDashboard.urineCollectedTime] !== ''){
        const participantUrineCollected = participantData[conceptIds.baseline.urineCollected] === conceptIds.yes;
        const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
        const isResearch = collectionSetting === conceptIds.research;
        const isClinical = collectionSetting === conceptIds.clinical;
        urineTubes.forEach(tube => {
            const tubeIsNotCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.no;
            if (tubeIsNotCollected && participantUrineCollected) {
                delete settings[visit][conceptIds.urineCollectionSetting];
                if(isResearch) {
                    delete settings[visit][conceptIds.baseline.urineCollectedTime];
                }
                else if (isClinical) {
                    settings[visit][conceptIds.clinicalDashboard.urineCollected] = conceptIds.no;
                    delete settings[visit][conceptIds.clinicalDashboard.urineCollectedTime];

                    if (bloodTubesLength === 0 && mouthwashTubesLength === 0) { // the anySpecimenCollected variable will only be updated to NO if mouthwash & blood specimens are not present.
                        settings[visit][conceptIds.anySpecimenCollected] = conceptIds.no;
                        if (!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                            delete settings[visit][conceptIds.anySpecimenCollectedTime];
                        }
                    }
                }
                derivedVariables[conceptIds.baseline.urineCollected] = conceptIds.no;
            }
            urineTubesLength -= 1
        })
    }


    if (!settings[visit][conceptIds.mouthwashCollectionSetting]) {
        mouthwashTubes.forEach(tube => {
            const isTubeCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes;
            const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
            const isResearch = collectionSetting === conceptIds.research;
            if (isTubeCollected) {
                settings[visit][conceptIds.mouthwashCollectionSetting] = collectionSetting;
                if (isResearch) {
                    settings[visit][conceptIds.baseline.mouthwashCollectedTime] = biospecimenData[conceptIds.collection.collectionTime];
                }
            mouthwashTubesLength += 1
            }
        });
    }
    else if (settings[visit][conceptIds.baseline.mouthwashCollectedTime] !== '' && participantData[conceptIds.baseline.mouthwashCollected] === conceptIds.yes){
        const isParticipantMouthwashCollected = participantData[conceptIds.baseline.mouthwashCollected] === conceptIds.yes;
        mouthwashTubes.forEach(tube => {
            const isTubeNotCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.no;
            if (isTubeNotCollected &&  isParticipantMouthwashCollected) {
                delete settings[visit][conceptIds.mouthwashCollectionSetting]
                if (biospecimenData[conceptIds.collection.collectionSetting] === conceptIds.research) {
                    delete settings[visit][conceptIds.baseline.mouthwashCollectedTime];
                }
                derivedVariables[conceptIds.baseline.mouthwashCollected] = conceptIds.no;
                mouthwashTubesLength -= 1
            }
        })
    }

    let settingData = {
        [conceptIds.collectionDetails]: settings,
        uid: participantData?.state?.uid
    };

    // update derived variable if specimens unchecked after accidently checking them & derived varibales set to yes
    if (Object.keys(derivedVariables).length !== 0) settingData = { ...settingData, ...derivedVariables };

    await updateParticipant(settingData);
}

export const updateBaselineData = async (siteTubesList, data) => {
    data = await getUpdatedParticipantData(data);

    const response = await getParticipantCollections(data.token);
    const baselineCollections = response.data.filter(collection => collection['331584571'] === 266600170);

    const bloodTubes = siteTubesList.filter(tube => tube.tubeType === "Blood tube");
    const urineTubes = siteTubesList.filter(tube => tube.tubeType === "Urine");
    const mouthwashTubes = siteTubesList.filter(tube => tube.tubeType === "Mouthwash");

    let bloodCollected = (data['878865966'] === 353358909);
    let urineCollected = (data['167958071'] === 353358909);
    let mouthwashCollected = (data['684635302'] === 353358909);
    let allBaselineCollected = (data['254109640'] === conceptIds.yes);

    baselineCollections.forEach(collection => {

        if(!bloodCollected) {
            bloodTubes.forEach(tube => {
                if(collection[tube.concept]['593843561'] === 353358909) {
                    bloodCollected = true;
                }
            });
        }

        if(!urineCollected) {
            urineTubes.forEach(tube => {
                if(collection[tube.concept]['593843561'] === 353358909) {
                    urineCollected = true;
                }
            });
        }
        if(!mouthwashCollected) {
            mouthwashTubes.forEach(tube => {
                if(collection[tube.concept]['593843561'] === 353358909) {
                    mouthwashCollected = true;
                }
            });
        }
    });

    if (baselineCollections.length > 0 && baselineCollections[0][conceptIds.collection.collectionSetting] === conceptIds.research) {
        allBaselineCollected = bloodCollected && urineCollected && mouthwashCollected;
    }
    else if (baselineCollections.length > 0 && baselineCollections[0][conceptIds.collection.collectionSetting] === conceptIds.clinical) {
        allBaselineCollected = bloodCollected && urineCollected;
    }

    const baselineData = {
        '878865966': bloodCollected ? 353358909 : 104430631,
        '167958071': urineCollected ? 353358909 : 104430631, 
        '684635302': mouthwashCollected ? 353358909 : 104430631,
        '254109640': allBaselineCollected ? conceptIds.yes : conceptIds.no,
        uid: data.state.uid
    };
        
    await updateParticipant(baselineData);
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
    'HP': 'HealthPartners Research Clinic',
    'HFHS': 'Henry Ford Health System',
    'NIH': "National Institutes of Health"
}

export const siteSpecificLocation = {
  "HP Research Clinic" : {"siteAcronym":"HP", "siteCode":531629870, "loginSiteName": "HealthPartners Research Clinic"},
  "Henry Ford Main Campus": {"siteAcronym":"HFHS", "siteCode":548392715, "loginSiteName": "Henry Ford Health System"},
  "Henry Ford West Bloomfield Hospital": {"siteAcronym":"HFHS", "siteCode":548392715, "loginSiteName": "Henry Ford Health System"},
  "Henry Ford Medical Center- Fairlane": {"siteAcronym":"HFHS", "siteCode":548392715, "loginSiteName": "Henry Ford Health System"},
  "HFH Livonia Research Clinic": {"siteAcronym":"HFHS", "siteCode":548392715, "loginSiteName": "Henry Ford Health System"},
  "KPCO RRL": {"siteAcronym":"KPCO", "siteCode":125001209, "loginSiteName": "Kaiser Permanente Colorado"},
  "KPGA RRL":{"siteAcronym":"KPGA", "siteCode":327912200, "loginSiteName": "Kaiser Permanente Georgia"},
  "KPHI RRL": {"siteAcronym":"KPHI", "siteCode":300267574, "loginSiteName": "Kaiser Permanente Hawaii"},
  "KPNW RRL": {"siteAcronym":"KPNW", "siteCode":452412599, "loginSiteName": "Kaiser Permanente Northwest"},
  "Marshfield": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Lake Hallie": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Weston": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Rice Lake": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Wisconsin Rapids": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Colby Abbotsford": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Minocqua": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Merrill": {"siteAcronym":"MFC", "siteCode":303349821, "loginSiteName": "Marshfield Clinic Health System"},
  "Sioux Falls Imagenetics": {"siteAcronym":"SFH", "siteCode":657167265, "loginSiteName": "Sanford Health"},
  "Fargo South University": {"siteAcronym":"SFH", "siteCode":657167265, "loginSiteName": "Sanford Health"},
  "DCAM": {"siteAcronym":"UCM", "siteCode":809703864, "loginSiteName": "University of Chicago Medicine"},
  "Ingalls Harvey": {"siteAcronym":"UCM", "siteCode":809703864, "loginSiteName": "University of Chicago Medicine"},
  "River East": {"siteAcronym":"UCM", "siteCode":809703864, "loginSiteName": "University of Chicago Medicine"},
  "South Loop": {"siteAcronym":"UCM", "siteCode":809703864, "loginSiteName": "University of Chicago Medicine"},
  "Orland Park": {"siteAcronym":"UCM", "siteCode":809703864, "loginSiteName": "University of Chicago Medicine"},
  "Main Campus": {"siteAcronym":"NIH", "siteCode":13, "loginSiteName": "National Cancer Institute"},
  "Frederick": {"siteAcronym":"NIH", "siteCode":13, "loginSiteName": "National Cancer Institute"},
}

export const locationConceptIDToLocationMap = {
  834825425: {
    siteSpecificLocation: 'HP Research Clinic',
    siteAcronym: 'HP',
    siteCode: '531629870',
    siteTeam: 'HealthPartners Connect Study Team',
    loginSiteName: 'HealthPartners Research Clinic',
    email: 'communityresearchdepartment@healthpartners.com',
  },
  752948709: {
    siteSpecificLocation: 'Henry Ford Main Campus',
    siteAcronym: 'HFHS',
    siteCode: '548392715',
    siteTeam: 'Henry Ford Connect Study Team',
    loginSiteName: 'Henry Ford Health System',
    email: 'ConnectBioHFH@hfhs.org',
  },
  570271641: {
    siteSpecificLocation: 'Henry Ford West Bloomfield Hospital',
    siteAcronym: 'HFHS',
    siteCode: '548392715',
    siteTeam: 'Henry Ford Connect Study Team',
    loginSiteName: 'Henry Ford Health System',
    email: 'ConnectBioHFH@hfhs.org',
  },
  838480167: {
    siteSpecificLocation: 'Henry Ford Medical Center-Fairlane',
    siteAcronym: 'HFHS',
    siteCode: '548392715',
    siteTeam: 'Henry Ford Connect Study Team',
    loginSiteName: 'Henry Ford Health System',
    email: 'ConnectBioHFH@hfhs.org',
  },
  706927479: {
    siteSpecificLocation: 'HFH Livonia Research Clinic',
    siteAcronym: 'HFHS',
    siteCode: '548392715',
    siteTeam: 'Henry Ford Connect Study Team',
    loginSiteName: 'Henry Ford Health System',
    email: 'ConnectBioHFH@hfhs.org',
  },
  763273112: {
    siteSpecificLocation: 'KPCO RRL',
    siteAcronym: 'KPCO',
    siteCode: '125001209',
    siteTeam: 'KPCO Connect Study Team',
    loginSiteName: 'Kaiser Permanente Colorado',
    email: 'Connect-Study-KPCO@kp.org',
  },
  767775934: {
    siteSpecificLocation: 'KPGA RRL',
    siteAcronym: 'KPGA',
    siteCode: '327912200',
    siteTeam: 'KPGA Connect Study Team',
    loginSiteName: 'Kaiser Permanente Georgia',
    email: 'KPGAConnectBio@kp.org',
  },
  531313956: {
    siteSpecificLocation: 'KPHI RRL',
    siteAcronym: 'KPHI',
    siteCode: '300267574',
    siteTeam: 'KPHI Connect Study Team',
    loginSiteName: 'Kaiser Permanente Hawaii',
    email: 'ConnectBioKPHI@KaiserPermanente.onmicrosoft.com'
  },
  715632875: {
    siteSpecificLocation: 'KPNW RRL',
    siteAcronym: 'KPNW',
    siteCode: '452412599',
    siteTeam: 'KPNW Connect Study Team',
    loginSiteName: 'Kaiser Permanente Northwest',
    email: 'CHR_Connect_KPNW_Bio@kpchr.org',
  },
  692275326: {
    siteSpecificLocation: 'Marshfield',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  698283667:{
    siteSpecificLocation: 'Lake Hallie',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  813701399:{
    siteSpecificLocation: 'Weston',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  691714762:{
    siteSpecificLocation: 'Rice Lake',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  487512085:{
    siteSpecificLocation: 'Wisconsin Rapids',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  983848564:{
    siteSpecificLocation: 'Colby Abbotsford',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  261931804:{
    siteSpecificLocation: 'Minocqua',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  665277300:{
    siteSpecificLocation: 'Merrill',
    siteAcronym: 'MFC',
    siteCode: '303349821',
    siteTeam: 'Marshfield Connect Study Team',
    loginSiteName: 'Marshfield Cancer Center',
    email: 'connectstudy@marshfieldresearch.org'
  },
  589224449: {
    siteSpecificLocation: 'Sioux Falls Imagenetics',
    siteAcronym: 'SFH',
    siteCode: '657167265',
    siteTeam: 'Sanford Connect Study Team',
    loginSiteName: 'Sanford Health',
    email: 'connectstudy@sanfordhealth.org',
  },
  467088902: {
    siteSpecificLocation: 'Fargo South University',
    siteAcronym: 'SFH',
    siteCode: '657167265',
    siteTeam: 'Sanford Connect Study Team',
    loginSiteName: 'Sanford Health',
    email: 'connectstudy@sanfordhealth.org',
  },
  777644826: {
    siteSpecificLocation: 'DCAM',
    siteAcronym: 'UCM',
    siteCode: '809703864',
    siteTeam: 'UChicago Connect Study Team',
    loginSiteName: 'University of Chicago Medicine',
    email: 'connectbiospecimen@bsd.uchicago.edu',
  },
  145191545: {
    siteSpecificLocation: 'Ingalls Harvey',
    siteAcronym: 'UCM',
    siteCode: '809703864',
    siteTeam: 'UChicago Connect Study Team',
    loginSiteName: 'University of Chicago Medicine',
    email: 'connectbiospecimen@bsd.uchicago.edu',
  },
  489380324: {
    siteSpecificLocation: 'River East',
    siteAcronym: 'UCM',
    siteCode: '809703864',
    siteTeam: 'UChicago Connect Study Team',
    loginSiteName: 'University of Chicago Medicine',
    email: 'connectbiospecimen@bsd.uchicago.edu',
  },
  120264574: {
    siteSpecificLocation: 'South Loop',
    siteAcronym: 'UCM',
    siteCode: '809703864',
    siteTeam: 'UChicago Connect Study Team',
    loginSiteName: 'University of Chicago Medicine',
    email: 'connectbiospecimen@bsd.uchicago.edu',

  },
  940329442: {
    siteSpecificLocation: 'Orland Park',
    siteAcronym: 'UCM',
    siteCode: '809703864',
    siteTeam: 'UChicago Connect Study Team',
    loginSiteName: 'University of Chicago Medicine',
    email: 'connectbiospecimen@bsd.uchicago.edu',
  },
  111111111: {
    siteSpecificLocation: 'Main Campus',
    siteAcronym: 'NIH',
    siteCode: '13',
    siteTeam: "NIH Connect Study Team",
    loginSiteName: 'National Cancer Institute',
    email: "connectstudytest@email.com",
  },
  222222222: {
    siteSpecificLocation: 'Frederick',
    siteAcronym: 'NIH',
    siteCode: '13',
    siteTeam: "NIH Connect Study Team",
    loginSiteName: 'National Cancer Institute',
    email: "connectstudytest@email.com",
    },
};

export const conceptIdToSiteSpecificLocation = {
  834825425: "HP Research Clinic",
  752948709: "Henry Ford Main Campus",
  570271641: "Henry Ford West Bloomfield Hospital",
  838480167: "Henry Ford Medical Center- Fairlane",
  706927479: "HFH Livonia Research Clinic",
  763273112: "KPCO RRL",
  767775934: "KPGA RRL",
  531313956: "KPHI RRL",
  715632875: "KPNW RRL",
  692275326: "Marshfield",
  698283667: "Lake Hallie",
  813701399: "Weston",
  145191545: "Ingalls Harvey",
  489380324: "River East",
  120264574: "South Loop",
  940329442: "Orland Park",
  691714762: "Rice Lake",
  487512085: "Wisconsin Rapids",
  983848564: "Colby Abbotsford",
  261931804: "Minocqua",
  665277300: "Merrill",
  467088902: "Fargo South University",
  589224449: "Sioux Falls Imagenetics",
  777644826: "DCAM",
  111111111: "Main Campus",
  222222222: "Frederick",
}

export const siteSpecificLocationToConceptId = {
  "HP Research Clinic": 834825425,
  "Henry Ford Main Campus": 752948709,
  "Henry Ford West Bloomfield Hospital": 570271641,
  "Henry Ford Medical Center- Fairlane": 838480167,
  "KPCO RRL": 763273112,
  "KPGA RRL": 767775934,
  "KPHI RRL": 531313956,
  "KPNW RRL": 715632875,
  "Marshfield": 692275326,
  "Lake Hallie": 698283667,
  "Sioux Falls Imagenetics": 589224449,
  "DCAM": 777644826, 
  "Main Campus": 111111111,
  "Frederick": 222222222,
  "HFH Livonia Research Clinic": 706927479,
  "Weston": 813701399,
  "Ingalls Harvey": 145191545,
  "River East": 489380324,
  "South Loop": 120264574,
  "Orland Park": 940329442,
  "Rice Lake": 691714762,
  "Wisconsin Rapids": 487512085,
  "Colby Abbotsford": 983848564,
  "Minocqua": 261931804,
  "Merrill": 665277300,
  "Fargo South University": 467088902,
}

export const nameToKeyObj = 
{
    "kpNW": 452412599,
    "hPartners" : 531629870,
    "snfrdHealth": 657167265,
    "hfHealth": 548392715,
    "maClinic": 303349821,
    "kpCO": 125001209,
    "uChiM": 809703864,
    "nci": 13,
    "kpHI": 300267574,
    "kpGA": 327912200,
    "allResults": 1000
}

export const keyToNameAbbreviationObj = {
  452412599: "kpNW",
  531629870: "hPartners",
  657167265: "snfrdHealth",
  548392715: "hfHealth",
  303349821: "maClinic",
  125001209: "kpCO",
  809703864: "uChiM",
  13: "nci",
  300267574: "kpHI",
  327912200: "kpGA",
  1000: "allResults",
}

export const keyToNameObj = 
{
    452412599 : "Kaiser Permanente Northwest",
    531629870 : "HealthPartners Research Clinic",
    657167265 : "Sanford Health",
    548392715 : "Henry Ford Health System",
    303349821 : "Marshfield Clinic",
    125001209 : "Kaiser Permanente Colorado",
    809703864 : "University of Chicago Medicine",
    13 : "National Cancer Institute",
    300267574 : "Kaiser Permanente Hawaii",
    327912200 : "Kaiser Permanente Georgia"
}

export const keyToLocationObj = 
{
    777644826: "UC-DCAM",
    692275326: "Marshfield",
    567969985: "MF Pop-Up",
    698283667: "Lake Hallie",
    834825425: "HP Research Clinic",
    736183094: "HFH K-13 Research Clinic",
    886364332: "Henry Ford Health Pavilion",
    706927479: "HFH Livonia Research Clinic",
    813701399: "Weston",
    145191545: "Ingalls Harvey",
    489380324: "River East",
    120264574: "South Loop",
    319518299: "UCM Pop-Up",
    940329442: "Orland Park",
    691714762: "Rice Lake",
    487512085: "Wisconsin Rapids",
    983848564: "Colby Abbotsford",
    261931804: "Minocqua",
    665277300: "Merrill",
    467088902: "Fargo South University",
    589224449: "Sioux Falls Imagenetics",
    111111111: "NIH",
    13:"NCI"
}

export const verificationConversion = {
    '875007964': 'Not Yet Verified',
    '197316935': 'Verified',
    '219863910': 'Cannot Be Verified',
    '922622075': 'Duplicate',
    '160161595': 'Outreach Maxed Out'
};

export const participationConversion = {
    '208325815': 'No Refusal',
    '622008261': 'Refused some activities',
    '872012139': 'Revoked HIPAA only',
    '854021266': 'Withdrew consent',
    '241236037': 'Destroy data',
    '458508122': 'Refused all future activities',
    '618686157': 'Deceased'
};

export const surveyConversion = {
    '972455046': 'Not Started',
    '615768760': 'Started',
    '231311385': 'Submitted'
};

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
                    document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end-1) : result.codeResult.code;
                    Quagga.stop();
                    document.querySelector('[data-dismiss="modal"]').click();
                    return
                }
                if(elementID === 'accessionID3') {
                    disableInput('accessionID4', true);
                    // addEventClearScannedBarcode('clearScanAccessionID');
                    document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end-1) : result.codeResult.code;
                    Quagga.stop();
                    document.querySelector('[data-dismiss="modal"]').click();
                    return
                }
                if(elementID === 'masterSpecimenId') {
                    disableInput('masterSpecimenId', true);
                    document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end) : result.codeResult.code;
                    Quagga.stop();
                    document.getElementById('closeBarCodeScanner').click();
                    const masterSpecimenId = document.getElementById('masterSpecimenId').value;
                    if(masterSpecimenId == ''){
                        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'})
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
                        showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'})
                        return
                    }
                    else{
                        document.getElementById('submitMasterSpecimenId').click(); 
                    }
                    document.querySelector('[data-dismiss="modal"]').click();
                    return;
                }
                if(!masterSpecimenIDRequirement.regExp.test(barcode.substr(0,masterSpecimenIDRequirement.length))) return;
                if(!elementID) return;
                if(elementID === 'scanSpecimenID') {
                    document.getElementById(elementID).dataset.isscanned = 'true';
                }
                document.getElementById(elementID).value = start !== undefined && end !== undefined ? result.codeResult.code.substr(start, end-1) : result.codeResult.code;
                Quagga.stop();
                document.querySelector('[data-dismiss="modal"]').click();
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
        'UCM': [{location: 'UC-DCAM', concept: 777644826}, {location: 'Ingalls Harvey', concept: 145191545}, {location: 'River East', concept: 489380324}, {location: 'South Loop', concept: 120264574},
                {location: 'UCM Pop-Up', concept: 319518299}, {location: 'Orland Park', concept: 940329442}          
              ],
        'MFC': [{location: 'Marshfield', concept: 692275326}, {location: 'Lake Hallie', concept: 698283667}, {location: 'Weston', concept: 813701399}, {location: 'Rice Lake', concept: 691714762}, 
                {location: 'Wisconsin Rapids', concept: 487512085}, {location: 'Colby Abbotsford', concept: 983848564}, {location: 'Minocqua', concept: 261931804}, {location: 'Merrill', concept: 665277300},
                {location: 'MF Pop-Up', concept: 567969985}
              ],
        'HP': [{location: 'HP Research Clinic', concept: 834825425}],
        'HFHS': [{location: 'HFH K-13 Research Clinic', concept: 736183094}, {location: 'HFH Cancer Pavilion Research Clinic', concept: 886364332},
                {location: 'HFH Livonia Research Clinic', concept: 706927479}],
        'SFH': [{location: 'Sioux Falls Imagenetics', concept: 589224449}, {location: 'Fargo South University', concept: 467088902}],
        'NIH': [{location: 'NIH-1', concept: 111111111}, {location: 'NIH-2', concept: 222222222}]
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
        if(data['331584571'] && data['331584571'][visit.concept] && data['331584571'][visit.concept]['135591601'] === 353358909) {
            visitConcept = visit.concept;
        }
    });

    return visitConcept;
};

export const checkInParticipant = async (data, visitConcept) => {
    
    let visits;
    const user_uid = data.state.uid;
    let sendBioEmail = false;

    if(data['331584571']) {

        visits = data['331584571'];

        if(!visits[visitConcept]) {

            if(visitConcept === '266600170') sendBioEmail = true;

            visits[visitConcept] = {
                '840048338': new Date()
            }
        }

        visits[visitConcept]['135591601'] = 353358909;
    }
    else {
        sendBioEmail = true;

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
        
    if(sendBioEmail) {
        const emailData = {
            email: data['869588347'],
            subject: "Please complete a short survey about your samples",
            message: baselineEmailTemplate(data),
            notificationType: "email",
            time: new Date().toISOString(),
            attempt: "1st contact",
            category: "Biospecimen Survey Reminder",
            token: data.token,
            uid: data.state.uid,
            read: false
        };
        
        await(sendClientEmail(emailData));
    }

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

export const getCollectionsByVisit = async (data) => {

    const visit = getCheckedInVisit(data);
    let collections = [];

    const response = await getParticipantCollections(data.token);

    if (response.data.length > 0) {
        response.data.forEach(col => {
            if(col['331584571'] == visit) collections.push(col);
        });
    }

    return collections;
};

export const getWorkflow = () => document.getElementById('contentBody').dataset.workflow ?? localStorage.getItem('workflow');
export const getSiteAcronym = () => document.getElementById('contentBody').dataset.siteAcronym ?? localStorage.getItem('siteAcronym');
export const getSiteCode = () => document.getElementById('contentBody').dataset.siteCode ?? localStorage.getItem('siteCode');

export const getSiteTubesLists = (biospecimenData) => {
    const dashboardType = getWorkflow();
    const siteAcronym = getSiteAcronym();
    const subSiteLocation = siteLocations[dashboardType]?.[siteAcronym] ? siteLocations[dashboardType]?.[siteAcronym]?.filter(dt => dt.concept === biospecimenData[conceptIds.collectionLocation])[0]?.location : undefined;
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
  dateInput.type = "text";
  dateInput.placeholder = "mm/dd/yyyy";
  dateInput.maxLength = 10;
  dateInput.addEventListener("keypress", function (e) {
    // Only allows number inputs and deletes
    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
    }

    const len = dateInput.value.length;
    if (len === 2 || len === 5) {
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

export const retrieveDateFromIsoString = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${month}/${day}/${year}`;
}

export const allTubesCollected = (data) => {

    let flag = true; 

    if(data[conceptIds.collection.collectionSetting]) {
        const tubes = workflows[collectionSettings[data[conceptIds.collection.collectionSetting]]];
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

export const displayManifestContactInfo = (currShippingLocationNumberObj) => {
    return `<p style="font-weight:bold">Site Contact Information:</p>
            <p>${currShippingLocationNumberObj.siteTeam}</p>
            <p>Email: ${currShippingLocationNumberObj.email}</p>`;
}

export const convertDateReceivedinISO = (date) => { // ("YYYY-MM-DD" to ISO format DateTime)
    return new Date(date).toISOString();
}

export const checkShipForage = async (shipSetForage, boxesToShip) => {
  let forageBoxIdArr = []
  try {
      let value = await localforage.getItem("shipData")

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
      console.error(e)
      await localforage.setItem("shipData", shipSetForage)
  }
}

// Modify to change tube order, tube ordered by color
const tubeOrder = [      
  "0001", //"SST/Gold or Red"
  "0002", //"SST/Gold or Red"
  "0011", //"SST/Gold or Red"
  "0012", //"SST/Gold or Red"
  "0021", //"SST/Gold or Red"
  "0022", //"SST/Gold or Red"
  "0031", //"SST/Gold or Red"
  "0032", //"SST/Gold or Red"
  "0003", //"Heparin/Green"
  "0013", //"Heparin/Green"
  "0004", //"EDTA/Lavender"
  "0014", //"EDTA/Lavender"
  "0024", //"EDTA/Lavender"
  "0005", //"ACD/Yellow",
  "0060", //"Streck Tube"
  "0006", //"Urine/Yellow"
  "0016", //"Urine Cup"
  "0007", //"Mouthwash Container"
  "0050", //"Replacement label" - used for tubes 0001-0024, 0060 when original label is damaged/missing/unusable
  "0051", //"Replacement label" - same as 0050
  "0052", //"Replacement label" - same as 0050
  "0053", //"Replacement label" - same as 0050
  "0054", //"Replacement label" - same as 0050
];

export const sortBiospecimensList = (biospecimensList) => {
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

export const convertConceptIdToPackageCondition = (packagedCondition, packageConditionConversion) => {
  let listConditions = ''
  if(!packagedCondition) return listConditions
  for(let i = 0; i < packagedCondition.length; i++) {
    let isLastItem = false;
    if(i+1 === packagedCondition.length) { // if last item equals the final item
      isLastItem = true
      if(isLastItem) listConditions += `<p>${packageConditionConversion[packagedCondition[i]]}</p>`
    }
    else {
      listConditions += `<p>${packageConditionConversion[packagedCondition[i]]},</p>`
    }

  }
  return listConditions
}

export const checkFedexShipDuplicate = (boxes) => {
  let arr = []
  boxes.forEach(boxId => arr.push(document.getElementById(`${boxId}trackingId`).value))
  let filteredArr = new Set(arr)
  return arr.length !== filteredArr.size
}
  
export const checkDuplicateTrackingIdFromDb = async (boxes) => {
    let isExistingTrackingId = false;
    
    for (const boxId of boxes) {
    
        let trackingId = document.getElementById(`${boxId}trackingId`).value;
        let numBoxesShipped = await getNumPages(5, {trackingId});
        if (numBoxesShipped > 0) {
            isExistingTrackingId = trackingId;
            break;
        }
    }
    return isExistingTrackingId;
}

export const checkNonAlphanumericStr = (boxes) => {
  let regExp = /^[a-z0-9]+$/i
  let arr = []
  boxes.forEach(boxId => arr.push(document.getElementById(`${boxId}trackingId`).value))
  for (let i = 0; i< arr.length; i++) {
    //check if str is not alphanumeric
    if(!regExp.test(arr[i])) {
      return true
    }
  }
}

export const translateNumToType = {
  "0001": "SST/Gold or Red",
  "0002": "SST/Gold or Red",
  "0003": "Heparin/Green",
  "0004": "EDTA/Lavender",
  "0005": "ACD/Yellow",
  "0060": "Streck/Black-Tan",
  "0006": "Urine/Yellow",
  "0007": "Mouthwash Container",
  "0011": "SST/Gold or Red",
  "0012": "SST/Gold or Red",
  "0013": "Heparin/Green",
  "0014": "EDTA/Lavender",
  "0016": "Urine Cup",
  "0021": "SST/Gold or Red",
  "0022": "SST/Gold or Red",
  "0031": "SST/Gold or Red",
  "0032": "SST/Gold or Red",
  "0024": "EDTA/Lavender",
  "0050": "NA",
  "0051": "NA",
  "0052": "NA",
  "0053": "NA",
  "0054": "NA"
};

export const convertISODateTime = (isoDateTime) => {
    const date = new Date(isoDateTime);
    return setZeroDateTime(date.getUTCMonth() + 1) + '/' + setZeroDateTime(date.getUTCDate()) + '/' + date.getUTCFullYear() + ' ' + setZeroDateTime(date.getUTCHours()) + ':' + setZeroDateTime(date.getUTCMinutes())
};

// append 0 before min. if single digit min. or hour
const setZeroDateTime = (dateTimeInput) => {
    return dateTimeInput < 10 ? '0' + dateTimeInput : dateTimeInput.toString();
};

export const formatISODateTime = (dateReceived) => {
    let extractDate = dateReceived.split("T")[0]
    extractDate = extractDate.split('-')
    const formattedDateTimeStamp = extractDate[1]+'/'+extractDate[2]+'/'+extractDate[0]
    return formattedDateTimeStamp
}

export const numericInputValidator = (elemArr) => {
    elemArr.forEach(elem => {
        if (document.getElementById(elem)) {
            document.getElementById(elem).addEventListener('input', (e) => {
                document.getElementById(elem).value = e.target.value.replace(/\D+/g, '');
            })
        }
    })
}

export const collectionInputValidator = (elemArr) => {
    elemArr.forEach(elem => {
        if (document.getElementById(elem)) {
            document.getElementById(elem).addEventListener('input', (e) => {
                document.getElementById(elem).value = e.target.value.substr(0,9);
            })
        }
    })
}

export function addSelectionEventListener(elemId, pageAndElement) {
    document.getElementById(elemId).addEventListener("change", (event) => {
        const selection = event.target.value;
        const prevSelections = JSON.parse(localStorage.getItem('selections'));
        localStorage.setItem('selections', JSON.stringify({...prevSelections, [pageAndElement] : selection}));
    });

}

export const checkSurveyEmailTrigger = async (data, visitType) => {
    const response = await getParticipantCollections(data.token);
    let sendBaselineEmail = false;

    if (response.data.length > 0) {
        // filter based on visit type (331584571) and collection type as 'clinical' (664882224)
        const collections = response.data.filter(res => res['331584571'] == visitType && res['650516960'] == 664882224);
        if(collections.length == 1) sendBaselineEmail = true;
    } 
    
    if(sendBaselineEmail) {
        const emailData = {
            email: data['869588347'],
            subject: "Please complete a short survey about your samples",
            message: baselineEmailTemplate(data, true),
            notificationType: "email",
            time: new Date().toISOString(),
            attempt: "1st contact",
            category: "Baseline Clinical Biospecimen Survey Reminder",
            token: data.token,
            uid: data.state.uid,
            read: false
        };
        
        await sendClientEmail(emailData);
    }
}

export const restrictNonBiospecimenUser = () => {
  document.getElementById("contentBody").innerHTML = "Authorization failed you lack permissions to use this dashboard!";
  document.getElementById("navbarNavAltMarkup").innerHTML = unAuthorizedUser();
}

export const isDev = () => !(location.host === urls.prod || location.host === urls.stage);

export const logAPICallStartDev = (funcName) => {
  if (isDev()) {
    console.log(`calling ${funcName}`);
    console.time(funcName);
  }
}

export const logAPICallEndDev = (funcName) => {
  if (isDev()) {
    console.timeEnd(funcName);
  }
}

export const getDataAttributes = (el) => { return el.getAttribute('data-sitekey'); }

export const getSiteMostRecentBoxId = async () => {
    try{
        const idToken = await getIdToken();
        const response = await fetch(`${api}api=getSiteMostRecentBoxId`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + idToken,
            },
        });

        return await response.json();

    } catch (e) {
        console.error('Error getting site\'s most recent box id', e);
        throw new Error(`Error getting site's most recent box id: ${e.message}`);
    }
}

export const addBoxAndUpdateSiteDetails = async (boxAndSiteData) => {
    try {
        const idToken = await getIdToken();
        const response = await fetch(`${api}api=addBoxAndUpdateSiteDetails`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + idToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(boxAndSiteData),
        });
        
        return await response.json();

    } catch (e) {
        console.error('Error adding box', e);
        return null;
    }
}

export const triggerErrorModal = (message) => {
    const alertList = document.getElementById("alert_placeholder");
    alertList.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
        </div>`;
}

export const triggerSuccessModal = (message) => {
    const alertList = document.getElementById("alert_placeholder");
    alertList.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
        </div>`;
}

export const checkTrackingNumberSource = () => {
    const scannedBarcode = document.getElementById("scannedBarcode");
    if (!scannedBarcode) {
      return;
    }
    scannedBarcode.addEventListener("input", (e) => {
      const input = e.target.value.trim();
      const showMsg = document.getElementById('showMsg');
      if (input.length === 0) {
        showMsg.innerHTML = "";
        return;
      }
      if (input.length === 22 || input.length === 20) {
        showMsg.innerHTML = `<i class="fa fa-check-circle" style="font-size: 14px; color: blue;"></i>USPS`;
        return;
      }
      if (input.length === 12) {
        showMsg.innerHTML = `<i class="fa fa-check-circle" style="font-size: 14px; color: orange;"></i>FedEx`;
        return;
      }
    //   if (uspsFirstThreeNumbersCheck(input) || (input.length === 34 && uspsFirstThreeNumbersCheck(input))) {
    //     document.getElementById('showMsg').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`
    //     return
    //   }
      showMsg.innerHTML = "";
    });
}

/**
 * We've had isolated instances where sites save a new collection and placeholder tube data is missing from the biospecimenData object (specifically with the addition of streck tubes).
 * This is a sanity check to compare expected vs existing data. If expected data is missing, we build the placeholder data. 
 * @param {Array<object>} siteTubesList - list of tubes expected at the site. 
 * @param {object} biospecimenData - biospecimenData object (specimen collection).
 */
export const checkTubeDataConsistency = (siteTubesList, biospecimenData) => {
    siteTubesList?.forEach((tube) => {
        // Check for tube.concept in biospecimenData keys. If missing, build the placeholder data.
        if (!biospecimenData[tube.concept]) {
            biospecimenData[tube.concept] = {
                [conceptIds.collection.tube.isCollected]: conceptIds.no,
                [conceptIds.collection.tube.isDeviated]: conceptIds.no,
                [conceptIds.discardFlag]: conceptIds.no,
                [conceptIds.collection.tube.deviation]: getDefaultDeviationOptions(tube.deviationOptions),
            };
            console.error('Issue: Tube not found in biospecimenData. Building placeholder data.', tube, 'Tube ConceptID:', tube.concept, '| Tube Details:', biospecimenData[tube.concept]);
        }
    });
};

/**
 * Build out a single tube's placeholder data. This is a backup in case of an unexpected loading sequence in the collection entry process.
 * @param {object} stockTubeData - tube object from siteTubesList. 
 * @param {object} biospecimenTubeData - tube object from biospecimenData.
 */
export const fixMissingTubeData = (stockTubeData, biospecimenTubeData) => {
    Object.assign(biospecimenTubeData, {
        [conceptIds.collection.tube.isCollected]: conceptIds.no,
        [conceptIds.collection.tube.isDeviated]: conceptIds.no,
        [conceptIds.discardFlag]: conceptIds.no,
        [conceptIds.collection.tube.deviation]: getDefaultDeviationOptions(stockTubeData.deviationOptions),
    });
    console.error('Issue: Tube not found in biospecimenData. Building placeholder data.', stockTubeData, '| Tube Details:', biospecimenTubeData);
};

const getDefaultDeviationOptions = (deviationOptions) => {
    if (!deviationOptions || deviationOptions.length === 0) return {};

    const defaultDeviationOptions = {};
    deviationOptions.forEach(option => {
        defaultDeviationOptions[option.concept] = conceptIds.no;
    });
    return defaultDeviationOptions;
};

export const processResponse = async (response) => {
    const data = await response.json();
    return data.response;
}

export const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-CA');
}
  