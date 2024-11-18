import { userNavBar, adminNavBar, nonUserNavBar, unAuthorizedUser } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { generateShippingManifest } from "./pages/shipping.js";
import { masterSpecimenIDRequirement, siteSpecificTubeRequirements, workflows, specimenCollection } from "./tubeValidation.js";
import { signOut } from "./pages/signIn.js";
import { devSSOConfig } from './dev/identityProvider.js';
import { stageSSOConfig } from './stage/identityProvider.js';
import { prodSSOConfig } from './prod/identityProvider.js';
import { conceptIds } from './fieldToConceptIdMapping.js';

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
    const response = await fetch(`${api}api=getFilteredParticipants&${query}`, {
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

export const sendInstantNotification = async (requestData) => {
  const idToken = await getIdToken();
  const requestObj = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };
  const resp = await fetch(`${api}api=sendInstantNotification`, requestObj);
  const respJson = await resp.json();
    if (!resp.ok) {
      triggerErrorModal(`Error occurred when sending out notification, with message "${respJson.message}".`);
  }

  return respJson;
};

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

/**
 * Show a notification modal with cancel and continue options. Initial use in BPTL receipted shipment flow. See storeSpecimenPackageReceipt() for usage example.
 * @param {object} message - message object with title and body.
 * @param {*} zIndex - z-index of the modal.
 * @param {function} onCancel - callback function to execute on cancel. Example: reset the UI.
 * @param {function} onContinue - callback function to execute on continue. Example: process a retry POST request.
 */
export const showNotificationsCancelOrContinue = (message, zIndex, onCancel, onContinue) => {
    const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    if (zIndex) document.getElementById('biospecimenModal').style.zIndex = zIndex;
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    const continueButtonText = message.continueButtonText || 'Continue';
    const cancelButtonText = message.cancelButtonText || 'Cancel';
    header.innerHTML = `<h5 class="modal-title">${message.title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>`;
    body.innerHTML = `
        <div class="row">
            <div class="col">
                ${message.body}
            </div>
        </div>
        <br><br>
        <div class="row">
            <div class="ml-auto" style="margin-right: 1rem;">
                <button type="button" class="btn btn-outline-dark" id="modalCancelBtn" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="modalContinueBtn">Continue</button>
            </div>
        </div>`;

    document.getElementById('modalCancelBtn').addEventListener('click', () => {
        closeBiospecimenModal();
        if (onCancel) onCancel();
    });

    document.getElementById('modalContinueBtn').addEventListener('click', async () => {
        try {
            closeBiospecimenModal();
            if (onContinue) await onContinue();
        } catch (error) {
            console.error('Error in modalContinueBtn event listener:', error);
            showNotifications({ title: 'Error', body: `Error: please try again. ${error}` });
        }
    });

    document.getElementById('root').removeChild(button);
};

/**
 * Build a list of user-selectable items. User selection continues process.
 * Initial used in BPTL receipted shipment flow. See storeSpecimenPackageReceipt() -> handleDuplicateTrackingNumbers() for usage example.
 * @param {object} message - modal message object with title and body. 
 * @param {array<object>} items - array of items to display in the modal. Each item has properties id, originSite, shipDate, and receivedDate.
 * @param {*} onCancel - callback function to execute on cancel. Example: reset the UI.
 * @param {*} onContinue - callback function to execute on continue. Example: process a retry POST request.
 * @param {*} zIndex - z-index of the modal.
 * Detail of items list: [{}, {}, {}, ...] where each item has shape {id: string, shipmentTimestamp:string, originSite: string, shipDate: string, receivedDate: string}.
 * The shipmentTimestamp is an ISO 8601 string. Pass through for Firestore query.
 */
export const showNotificationsSelectableList = (message, items, onCancel, onContinue, zIndex) => {
    const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';

    document.getElementById('root').appendChild(button);
    button.click();
    if (zIndex) document.getElementById('biospecimenModal').style.zIndex = zIndex;
    
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    header.innerHTML = `
        <h5 class="modal-title">${message.title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
    
    // Generate list of items
    const modalBodyText = `
        <div class="row">
            <div class="col">
                ${message.body}
            </div>
        </div><br><br>`;

    const errorMessageText = `
        <div id="modalErrorMessage" style="color: red; display: none; font-size: 1.5em;"></div><br>`;

    let itemListHtml = '<ul class="list-group">';
    items.forEach((item, index) => {
        itemListHtml += `
            <li class="list-group-item list-group-item-action" data-index="${index}">
                ${item.id} | ${item.originSite}<br>
                Ship Date: ${item.shipDate}<br>
                Received Date: ${item.receivedDate}<br>
            </li>`;
    });
    itemListHtml += '</ul><br><br>';

    const modalBodyButtons = `
        <div class="row">
            <div class="ml-auto" style="margin-right: 1rem;">
                <button type="button" class="btn btn-outline-dark" id="modalCancelBtn" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="modalContinueBtn">Continue</button>
            </div>
        </div>`;

    // Set body content
    body.innerHTML = modalBodyText + errorMessageText+ itemListHtml + modalBodyButtons;
    const errorMessageDiv = document.getElementById('modalErrorMessage'); // This div is hidden by default

    // Add event listeners to each list item
    const listItems = body.querySelectorAll('.list-group-item');

    listItems.forEach(item => {
        item.addEventListener('click', function() {
            listItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            errorMessageDiv.style.display = 'none';
        });
    });

    document.getElementById('modalCancelBtn').addEventListener('click', () => {
        closeBiospecimenModal();
        if (onCancel) onCancel();
    });

    document.getElementById('modalContinueBtn').addEventListener('click', async () => {
        const selectedItemIndex = body.querySelector('.list-group-item.active')?.getAttribute('data-index');
        if (selectedItemIndex) {
            errorMessageDiv.style.display = 'none';
            closeBiospecimenModal();
            if (onContinue) await onContinue(items[selectedItemIndex]);
        } else {
            errorMessageDiv.textContent = 'Please select an item from the list.';
            errorMessageDiv.style.display = 'block';
        }
    });
    document.getElementById('root').removeChild(button);
};

/**
 * Display confirmation modal to the user and returns a promise with the user's choice.
 *  
 * @param {string} collectionID - the collection ID to display in the modal.
 * @param {string} firstName - the participant's first name to display in the modal.
 * @returns {Promise<string>} - the user's choice on button click: 'cancel', 'back', or 'confirmed'.
*/
export const showConfirmationModal =  (collectionID, firstName) => {
    return new Promise((resolve) => {
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('modal', 'fade');
        modalContainer.id = 'confirmationModal';
        modalContainer.tabIndex = '-1';
        modalContainer.role = 'dialog';
        modalContainer.setAttribute('aria-labelledby', 'exampleModalCenterTitle');
        modalContainer.setAttribute('aria-hidden', 'true');
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-dialog', 'modal-dialog-centered');
        modalContent.setAttribute('role', 'document');

        const modalBody = `
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Collection ID</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Collection ID: ${collectionID}</p>
                    <p>Confirm ID is correct for participant: ${firstName}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" data-result="cancel">Cancel</button>
                    <button type="button" class="btn btn-info" data-result="back" data-dismiss="modal">Confirm and Exit</button>
                    <button type="button" class="btn btn-success" data-result="confirmed" data-dismiss="modal">Confirm and Continue</button>
                </div>
            </div>
        `;

        modalContent.innerHTML = modalBody;
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);

        modalContainer.classList.add('show');
        modalContainer.style.display = 'block';
        modalContainer.addEventListener('click', (event) => {
            const result = event.target.getAttribute('data-result');
            if (result) 
            {
                document.body.removeChild(modalContainer);
                resolve(result);
            }
        });
    });
};

export const showTimedNotifications = (data, zIndex, timeInMilliseconds = 2600) => {
    const button = document.createElement('button');
    button.dataset.target = '#biospecimenModal';
    button.dataset.toggle = 'modal';
    const rootElement = document.getElementById('root');
    rootElement.appendChild(button);
    button.click();

    if (zIndex) {
        document.getElementById('biospecimenModal').style.zIndex = zIndex;
    }
    rootElement.removeChild(button);
    const header = document.getElementById('biospecimenModalHeader');
    const body = document.getElementById('biospecimenModalBody');
    header.innerHTML = `<h5 class="modal-title text-center">${data.title}</h5>`;
    body.innerHTML = `
        <div class="row">
            <div class="col text-center">${data.body}
            </div>
        </div>
        </br></br>
        <div class="row">
            <div class="ml-auto" style="margin-right: 1rem;">
                <button type="button" class="btn btn-outline-dark" data-dismiss="modal" aria-label="Close" style="display:none">Close</button>
            </div>
        </div>`;

    // Programmatically close the modal on a timer.
    setTimeout(() => {
        dismissBiospecimenModal()
    }, timeInMilliseconds);
};

const closeBiospecimenModal = () => {
    const modal = document.getElementById('biospecimenModal');
    const backdrop = document.querySelector('.modal-backdrop');

    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeAttribute('role');

    if (backdrop) {
        backdrop.style.display = 'none';
        backdrop.classList.remove('show');
    }

    document.body.classList.remove('modal-open');
};

/**
 * Targets close button on biospecimen bootstrap modal and closes it. Can be used to close and dismiss modal for other buttons on the modal.
 * */  
export const dismissBiospecimenModal = () => { 
    const closeButton = document.querySelector('#biospecimenModal .btn[data-dismiss="modal"]');

    if (closeButton) closeButton.click();
}

export const errorMessage = (id, msg, focus, offset, icon) => {
    const currentElement = document.getElementById(id);
    const parentElement = currentElement.parentNode;
    if (Array.from(parentElement.querySelectorAll('.form-error')).length > 0) return;
    if (msg){
        const div = document.createElement('div');
        div.classList = ['error-text'];
        if (icon) { 
            const iconElement = document.createElement('i');
            iconElement.classList = ['fa fa-exclamation-circle'];
            iconElement.style.color = 'red';
            iconElement.style.marginRight = '.2rem';
            div.appendChild(iconElement);
        }
        const span = document.createElement('span');
        span.classList = ['form-error']
        if (offset) span.classList.add('offset-4');
        span.innerHTML = msg;
        div.append(span);
        parentElement.appendChild(div);
    }
    currentElement.classList.add('invalid');
    if (focus) currentElement.focus();
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

// Distinct from updateSpecimen in that this triggers a larger workflow which also
// updates the participant and gets the derived variables
// while updateSpecimen only updates a specimen record
export const submitSpecimen = async (biospecimenData, participantData, siteTubesList) => {
    // Used when submitting specimen to update both participant and specimen data
    const idToken = await getIdToken();
    let requestObj = {
        method: "POST",
        headers:{
            Authorization:"Bearer "+idToken,
            "Content-Type": "application/json"
        },
        body:  JSON.stringify({biospecimenData, participantData, siteTubesList}),
    }
    const response = await fetch(`${api}api=submitSpecimen`, requestObj);
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
        pageNumber -= 1; // Firestore uses 0-based indexing, the Biospecimen 'reports' module uses page numbers (1-based indexing).

        const idToken = await getIdToken();
        let requestObj = {
            method: "POST",
            headers: {
                Authorization: "Bearer " + idToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pageNumber, elementsPerPage, orderBy, filters, source })
        }
        const response = await fetch(`${api}api=getBoxesPagination`, requestObj);
        return response.json();
    }
    catch (error) {
        return { code: 500, message: error.message };
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
            availableCollections[bagKey].specimen = specimen;
        }
    }
    return { availableCollections, specimensList };
}

/**
 * Build the available collections object. Remove unusable tubes.
 * Filter tubes (available collections vs strays) for use in the shipping dashboard.
 * @param {array<object>} specimensList - list of specimens from Firestore.
 * @returns {object} { availableCollections, specimensList } - available collections object and the updated specimens list.
 * Note: Mouthwash tubes are always solo. They belong in available collections. The tube number is always '0007', the bag number is always '0009'.
 */
export const findReplacementTubeLabels = (specimensList) => {
    if (!specimensList || specimensList.length === 0) return { availableCollections: {}, specimensList: [] };
    const replacementTubeLabels = {};
    const replacementLabelRegExp = new RegExp('005[0-4]$');
    for (let specimen of specimensList) {
        const collectionId = specimen[conceptIds.collection.id];
        if (!collectionId) continue;

        const tubeDataObject = removeUnusableTubes(specimen);
        Object.keys(tubeDataObject).forEach(tubeCid => {
            let scannedTubeLabel = tubeDataObject[tubeCid];
            if (replacementLabelRegExp.test(scannedTubeLabel)) {
                replacementTubeLabels[scannedTubeLabel] = collectionId + ' ' + specimenCollection.cidToNum[tubeCid];
            }
        })
        
    }
    return replacementTubeLabels;
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
    const allTubeIdsInSpecimen = Object.keys(tubeDataObject);

    const allMouthwashTubes = allTubeIdsInSpecimen
        .filter(cid => cid === conceptIds.collection.mouthwashTube1.toString())
        .map(cid => tubeDataObject[cid].split(' ')[1]);
    const allBloodUrineTubes = allTubeIdsInSpecimen
        .filter(cid => cid !== conceptIds.collection.mouthwashTube1.toString())
        .map(cid => tubeDataObject[cid].split(' ')[1]);
    let strayTubeArray = specimen[conceptIds.strayTubesList] ?? [];

    // Handle mouthwash tubes. Mouthwash tubes always belong in available collections (not the stray tubes list).
    // If mouthwash tube is in stray tubes (this happens for partiallyBoxed specimens when other tubes in the specimen are boxed first),
    // Add it to available collections and remove from stray tubes list.
    if (allMouthwashTubes.length > 0) {
        const allMouthwashTubesFullIds = allMouthwashTubes.map(tubeId => collectionId + ' ' + tubeId);
        
        if (isPartiallyBoxed) {
            // If the collection is partially boxed and the mouthwash tube is in the stray tube list, add it to available collections and remove from stray tubes list.
            // If it isn't in the stray tubes list, it's already boxed. Skip it.
            if (allMouthwashTubesFullIds.some(fullTubeId => strayTubeArray.includes(fullTubeId))) {
                const index = strayTubeArray.findIndex(str => str.endsWith('0007'));
                if (index !== -1) {
                    const mouthwashTube = strayTubeArray[index];
                    if (mouthwashTube) {
                        usableTubes[mouthwashCollection] = [mouthwashTube.slice(-4)];
                        strayTubeArray.splice(index, 1);
                    }
                // If Mouthwash tube is not found under 0007, search under replacement tube values 0050-0054
                } else if (miscTubeIdSet.has(allMouthwashTubes[0])){
                    const mouthwashTube = allMouthwashTubes[0];
                    usableTubes[mouthwashCollection] = [mouthwashTube.slice(-4)];
                    const tubeIdToFilter = collectionId + ' ' + mouthwashTube;
                    strayTubeArray = strayTubeArray.filter(tubeId => tubeId !== tubeIdToFilter);
                }
            }
        // It the collection is not boxed, assign directly.
        } else {
            usableTubes[mouthwashCollection] = allMouthwashTubes.map(str => str.slice(-4));
        }
    }
    
    // Compare all blood/urine tubes to stray tubes list.
    // If all allBloodUrineTubes are in the strayTubesList, add them to available collections and remove from stray tubes list.
    // If all tubes are not in the strayTubesList, some are are already boxed. The remaining tubes belong in the stray tubes list (usableTubes['unlabelled']).
    if (allBloodUrineTubes.length > 0) {
        // If the collection is partially boxed, check whether all blood/urine tubes are in the stray tubes list.
        if (isPartiallyBoxed || strayTubeArray.length > 0) {
            const allBloodUrineTubesFullIds = allBloodUrineTubes.map(tubeId => collectionId + ' ' + tubeId);
            const areAllTubesInStrayTubeArray = allBloodUrineTubesFullIds.every(tubeId => strayTubeArray.includes(tubeId));
            if (areAllTubesInStrayTubeArray) {
                usableTubes[bloodUrineCollection] = allBloodUrineTubes.map(str => str.slice(-4));
                strayTubeArray = strayTubeArray.filter(tubeId => !allBloodUrineTubesFullIds.includes(tubeId));
            }
        // If the collection is not boxed, assign directly.
        } else {
            usableTubes[bloodUrineCollection] = allBloodUrineTubes.map(str => str.slice(-4));
        }
    }
    
    // Assign the 'unlabelled' tubes for use in the available collections object.
    if (strayTubeArray.length !== 0) usableTubes['unlabelled'] = strayTubeArray;

    return usableTubes;
}

/**
 * Creates an easy lookup dictionary for specimens by the bag/tube ID
 * Partially boxed status does not matter
 * 
 * @param {array<object>} specimensList - list of biospecimens from Firestore.
 *  @returns {object} object keyed by bag ID
 */
export const createBagToSpecimenDict = (specimensList) => {
    if (!specimensList || specimensList.length === 0) return {};

    const specimenLookupDict = {};
    for (let specimen of specimensList) {
        const usableTubes = arrangeFetchedTubes(specimen, false);
        const usableBagKeys = Object.keys(usableTubes);

        for (const bagKey of usableBagKeys) {
            specimenLookupDict[bagKey] = specimen;
        }
    }

    return specimenLookupDict;
}

const tubeDeviationFlags = [
    conceptIds.collection.deviationType.broken,
    conceptIds.collection.deviationType.discard,
    conceptIds.collection.deviationType.insufficientVolume,
    conceptIds.collection.deviationType.mislabel,
    conceptIds.collection.deviationType.notFound,
];

export const miscTubeIdSet = new Set(['0050', '0051', '0052', '0053', '0054']);

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

/**
 * Filter out duplicate specimens from the combined list of boxed, unboxed, and partially boxed specimens.
 * If the collectionId already exists in uniqueSpecimens, check all tubes in the specimen and add the missing tubes to uniqueSpecimens[collectionId].
 * @param {Array} specimensList - list of specimens to filter (may contain duplicates).
 * @returns {Array} - list of unique specimens.
 */
export const filterDuplicateSpecimensInList = (specimensList) => {
    const uniqueSpecimens = {};

    specimensList.forEach(specimen => {
        const collectionId = specimen[conceptIds.collection.id];
        
        if (uniqueSpecimens[collectionId]) {
            specimenCollection.tubeCidList.forEach(tubeCid => {
                if (!uniqueSpecimens[collectionId][tubeCid] && specimen[tubeCid] && specimen[tubeCid][conceptIds.collection.tube.scannedId]) {
                    uniqueSpecimens[collectionId][tubeCid] = specimen[tubeCid];
                }
            });
        } else {
            uniqueSpecimens[collectionId] = specimen;
        }
    });

    // Convert the object values back to an array
    return Object.values(uniqueSpecimens);
}

// searches boxes collection by login site (789843387) and Site-specific location id (560975149)
// filters out any boxes where submitShipmentFlag is true
export const getBoxesByLocation = async (location) => {
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
    return res;
}

/**
 * Collection ID search for editing unfinalized collections returns specimenData and participantData.
 * @param {string} collectionId - collectionId to search for in Firestore biospecimen collection.
 * @param {boolean} isBPTL - indicates if the request is from BPTL.
 * @returns 
 */
export const getSpecimenAndParticipant = async (collectionId, isBPTL = false) => {
    showAnimation();
    try {
        const idToken = await getIdToken();
        const specimenQuery = `&collectionId=${collectionId}` + (isBPTL ? `&isBPTL=${isBPTL}` : '')
        const response = await fetch(`${api}api=getSpecimenAndParticipant${specimenQuery}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + idToken
            }
        });

        const responseJSON = await response.json();

        if (!responseJSON.data || responseJSON.data.length !== 2) {
            throw new Error(responseJSON.message);
        }

        hideAnimation();
        const [specimenData, participantData] = responseJSON.data;
        return { specimenData, participantData };
    } catch (error) {
        hideAnimation();
        console.error(`Error retrieving specimen and participant. ${error}`);
        throw error;
    }
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
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=searchSpecimen&requestedSite=${requestedSite}&boxId=${boxId}`, {
    method: "GET",
    headers: {
        Authorization:"Bearer "+idToken
        }
    });

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
    const siteAcronym = arr[0].siteAcronym;
    
    let locations = [];
    for (let i = 0; i < arr.length; i++) {
        let currJSON = arr[i];
        locations = locations.concat(currJSON[conceptIds.shippingLocation]);
    }
    
    if (siteAcronym === 'BSWH') locations.sort((a, b) => a.localeCompare(b));

    logAPICallEndDev('getLocationsInstitute');
    // For the purposes of 1008 we are filtering out some locations.
    // This will require more discussion for a long-term implementation
    locations = locations.filter(loc => 
        ['River East', 'South Loop', 'Orland Park', 'Henry Ford West Bloomfield Hospital', 'Henry Ford Medical Center- Fairlane'].indexOf(loc) === -1
        // 'Henry Ford Medical Center- Fairlane' has inconsistent spacing across environments: play it safe by omitting any combination of "Henry Ford" and "Fairlane"
        && (!loc.includes('Fairlane') || !loc.includes('Henry Ford')) 
    );
    return locations;
}

/**
 * Fetch the box count and calculate the number of pages to display on the reports screen (for pagination feature).
 * @param {number} numPerPage - number of boxes to display per page on the reports screen.
 * @param {object} filters - filters to apply to the report.
 * @param {string} source - source of the report (null or 'bptlShippingReport').
 * @returns {number} - number of pages to display on the reports screen.
 */
export const getNumPages = async (numPerPage, filters, source) => {
    try {
        const idToken = await getIdToken();
        const response = await fetch(`${api}api=getNumBoxesShipped`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + idToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ filters, source })
        });
        let res = await response.json();
        let numBoxes = res.data;
        return Math.ceil(numBoxes / numPerPage);
    }
    catch (error) {
        return { code: 500, message: error.message };
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
    JsBarcode(`#${id}`, connectId, { height: 30 });
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

    const collectionSetting = biospecimenData[conceptIds.collection.collectionSetting];
    const isResearch = collectionSetting === conceptIds.research;
    const isClinical = collectionSetting === conceptIds.clinical;

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
        const totalBloodTubesAvail = bloodTubes.filter((tube) => biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes);
        if (totalBloodTubesAvail.length === 0 && participantBloodCollected) {
            delete settings[visit][conceptIds.bloodCollectionSetting]; // derived variables & timestamp are updated only if all the blood tubes are unchecked
            if (isResearch) {
                delete settings[visit][conceptIds.baseline.bloodCollectedTime];
            }
            else if (isClinical) {
                settings[visit][conceptIds.clinicalDashboard.bloodCollected] = conceptIds.no;
                delete settings[visit][conceptIds.clinicalDashboard.bloodCollectedTime];

                if (urineTubesLength === 0 && mouthwashTubesLength === 0) { // anySpecimenCollected variable will only be updated to NO if mouthwash & urine specimens are not present.
                    settings[visit][conceptIds.anySpecimenCollected] = conceptIds.no;
                    if (!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                        delete settings[visit][conceptIds.anySpecimenCollectedTime];
                    }
                }
            }
            derivedVariables[conceptIds.baseline.bloodCollected] = conceptIds.no;
            bloodTubesLength = totalBloodTubesAvail.length;
        }
    }

    if (!settings[visit][conceptIds.urineCollectionSetting]) {
        urineTubes.forEach(tube => {
            const tubeIsCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes;
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
    else if (settings[visit][conceptIds.baseline.urineCollectedTime] !== '' ||  settings[visit][conceptIds.clinicalDashboard.urineCollectedTime] !== '') {
        const participantUrineCollected = participantData[conceptIds.baseline.urineCollected] === conceptIds.yes;
        const totalUrineTubesAvail = urineTubes.filter((tube) => biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes);
        if (totalUrineTubesAvail.length === 0 && participantUrineCollected) {
            delete settings[visit][conceptIds.urineCollectionSetting];
            if(isResearch) {
                delete settings[visit][conceptIds.baseline.urineCollectedTime];
            }
            else if (isClinical) {
                settings[visit][conceptIds.clinicalDashboard.urineCollected] = conceptIds.no;
                delete settings[visit][conceptIds.clinicalDashboard.urineCollectedTime];

                if (bloodTubesLength === 0 && mouthwashTubesLength === 0) { // anySpecimenCollected variable will only be updated to NO if mouthwash & blood specimens are not present.
                    settings[visit][conceptIds.anySpecimenCollected] = conceptIds.no;
                    if (!(settings[visit][conceptIds.anySpecimenCollectedTime])) {
                        delete settings[visit][conceptIds.anySpecimenCollectedTime];
                    }
                }
            }
            derivedVariables[conceptIds.baseline.urineCollected] = conceptIds.no;
            urineTubesLength = totalUrineTubesAvail.length;
        }  
    }

    if (!settings[visit][conceptIds.mouthwashCollectionSetting]) {
        mouthwashTubes.forEach(tube => {
            const isTubeCollected = biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes;
            if (isTubeCollected) {
                settings[visit][conceptIds.mouthwashCollectionSetting] = collectionSetting;
                if (isResearch) {
                    settings[visit][conceptIds.baseline.mouthwashCollectedTime] = biospecimenData[conceptIds.collection.collectionTime];
                }
            mouthwashTubesLength += 1
            }
        });
    }
    else if (settings[visit][conceptIds.baseline.mouthwashCollectedTime] !== '' && participantData[conceptIds.baseline.mouthwashCollected] === conceptIds.yes) {
        const isParticipantMouthwashCollected = participantData[conceptIds.baseline.mouthwashCollected] === conceptIds.yes;
        const totalMouthwasTubesAvail = mouthwashTubes.filter((tube) => biospecimenData[tube.concept][conceptIds.collection.tube.isCollected] === conceptIds.yes);
        if (totalMouthwasTubesAvail.length === 0 &&  isParticipantMouthwashCollected) {
            delete settings[visit][conceptIds.mouthwashCollectionSetting]
            if (isResearch) {
                delete settings[visit][conceptIds.baseline.mouthwashCollectedTime];
            }
            derivedVariables[conceptIds.baseline.mouthwashCollected] = conceptIds.no;
            mouthwashTubesLength = totalMouthwasTubesAvail.length;
        }
    }

    let settingData = {
        [conceptIds.collectionDetails]: settings,
        uid: participantData?.state?.uid
    };

    // Update derived variables to 'NO' from 'YES'. After specimens, are unchecked after checking them.
    settingData = { ...settingData, ...derivedVariables };
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

        if (!bloodCollected) {
            bloodTubes.forEach(tube => {
                if (collection[tube.concept]?.['593843561'] === 353358909) {
                    bloodCollected = true;
                }
            });
        } 
        if (!urineCollected) {
            urineTubes.forEach(tube => {
                if (collection[tube.concept]?.['593843561'] === 353358909) {
                    urineCollected = true;
                }
            });
        }
        if (!mouthwashCollected) {
            mouthwashTubes.forEach(tube => {
                if (collection[tube.concept]?.['593843561'] === 353358909) {
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


export const healthProviderAbbrToConceptIdObj = {
    "kpNW": 452412599,
    "hPartners" : 531629870,
    "sanfordHealth": 657167265,
    "hfHealth": 548392715,
    "maClinic": 303349821,
    "kpCO": 125001209,
    "uChiM": 809703864,
    "nci": 13,
    "kpHI": 300267574,
    "kpGA": 327912200,
    "kpCO": 125001209,
    "healthPartners" : 531629870,
    "sanfordHealth": 657167265,
    "henryFordHealth": 548392715,
    "marshfieldClinic": 303349821,
    "uOfChicagoMed": 809703864,
    "nci": 13,
    "BSWH": 472940358,
    "allResults": 1000
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
    'BSWH': 'Baylor Scott & White Health',
    'NIH': "National Institutes of Health"
}

export const siteSpecificLocation = {
  "HP Research Clinic" : {"siteAcronym":"HP", "siteCode": healthProviderAbbrToConceptIdObj.healthPartners, "loginSiteName": "HealthPartners Research Clinic"},
  "HP Park Nicollet": {"siteAcronym": "HP", "siteCode": healthProviderAbbrToConceptIdObj.healthPartners, "loginSiteName": "HealthPartners Research Clinic"},
  "Henry Ford Main Campus": {"siteAcronym":"HFHS", "siteCode": healthProviderAbbrToConceptIdObj.henryFordHealth, "loginSiteName": "Henry Ford Health System"},
  "Henry Ford West Bloomfield Hospital": {"siteAcronym":"HFHS", "siteCode":healthProviderAbbrToConceptIdObj.henryFordHealth, "loginSiteName": "Henry Ford Health System"},
  "Henry Ford Medical Center- Fairlane": {"siteAcronym":"HFHS", "siteCode":healthProviderAbbrToConceptIdObj.henryFordHealth, "loginSiteName": "Henry Ford Health System"},
  "HFH Livonia Research Clinic": {"siteAcronym":"HFHS", "siteCode":healthProviderAbbrToConceptIdObj.henryFordHealth, "loginSiteName": "Henry Ford Health System"},
  "HFH Pop-Up": {"siteAcronym": "HFHS", "siteCode": healthProviderAbbrToConceptIdObj.henryFordHealth, "loginSiteName": "Henry Ford Health System"},
  "KPCO RRL": {"siteAcronym":"KPCO", "siteCode": healthProviderAbbrToConceptIdObj.kpCO, "loginSiteName": "Kaiser Permanente Colorado"},
  "KPGA RRL":{"siteAcronym":"KPGA", "siteCode": healthProviderAbbrToConceptIdObj.kpGA, "loginSiteName": "Kaiser Permanente Georgia"},
  "KPHI RRL": {"siteAcronym":"KPHI", "siteCode": healthProviderAbbrToConceptIdObj.kpHI, "loginSiteName": "Kaiser Permanente Hawaii"},
  "KPNW RRL": {"siteAcronym":"KPNW", "siteCode":healthProviderAbbrToConceptIdObj.kpNW, "loginSiteName": "Kaiser Permanente Northwest"},
  "Marshfield": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Lake Hallie": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Weston": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Rice Lake": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Wisconsin Rapids": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Colby Abbotsford": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Minocqua": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Merrill": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "MF Pop-Up": {"siteAcronym":"MFC", "siteCode": healthProviderAbbrToConceptIdObj.marshfieldClinic, "loginSiteName": "Marshfield Clinic Health System"},
  "Sioux Falls Imagenetics": {"siteAcronym":"SFH", "siteCode": healthProviderAbbrToConceptIdObj.sanfordHealth, "loginSiteName": "Sanford Health"},
  "Fargo South University": {"siteAcronym":"SFH", "siteCode": healthProviderAbbrToConceptIdObj.sanfordHealth, "loginSiteName": "Sanford Health"},
  "Bismarck Medical Center": {"siteAcronym": "SFH", "siteCode": healthProviderAbbrToConceptIdObj.sanfordHealth, "loginSiteName": "Sanford Health"},
  "Sioux Falls Sanford Center": {"siteAcronym": "SFH", "siteCode": healthProviderAbbrToConceptIdObj.sanfordHealth, "loginSiteName": "Sanford Health"},
  "DCAM": {"siteAcronym":"UCM", "siteCode": healthProviderAbbrToConceptIdObj.uOfChicagoMed, "loginSiteName": "University of Chicago Medicine"},
  "Ingalls Harvey": {"siteAcronym":"UCM", "siteCode": healthProviderAbbrToConceptIdObj.uOfChicagoMed, "loginSiteName": "University of Chicago Medicine"},
  "River East": {"siteAcronym":"UCM", "siteCode": healthProviderAbbrToConceptIdObj.uOfChicagoMed, "loginSiteName": "University of Chicago Medicine"},
  "South Loop": {"siteAcronym":"UCM", "siteCode": healthProviderAbbrToConceptIdObj.uOfChicagoMed, "loginSiteName": "University of Chicago Medicine"},
  "Orland Park": {"siteAcronym":"UCM", "siteCode": healthProviderAbbrToConceptIdObj.uOfChicagoMed, "loginSiteName": "University of Chicago Medicine"},
  "BCC- HWC": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "FW All Saints": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "BCC- Fort Worth": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "BCC- Plano": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "BCC- Worth St": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "BCC- Irving": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "NTX Biorepository": {"SiteAcronym":"BSWH", "siteCode": healthProviderAbbrToConceptIdObj.BSWH, "loginSiteName": "Baylor Scott & White Health"},
  "Main Campus": {"siteAcronym":"NIH", "siteCode": healthProviderAbbrToConceptIdObj.nci, "loginSiteName": "National Cancer Institute"},
  "Frederick": {"siteAcronym":"NIH", "siteCode": healthProviderAbbrToConceptIdObj.nci, "loginSiteName": "National Cancer Institute"},

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
  [conceptIds.nameToKeyObj.hpPN]: {
    siteSpecificLocation: 'HP Park Nicollet',
    siteAcronym: 'HP',
    siteCode: `${healthProviderAbbrToConceptIdObj.healthPartners}`,
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
  [conceptIds.nameToKeyObj.hfhPU]: {
    siteSpecificLocation: 'HFH Pop-Up"',
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
  567969985:{
    siteSpecificLocation: 'MF Pop-Up',
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
  [conceptIds.nameToKeyObj.sfBM]: {
    siteSpecificLocation: 'Bismarck Medical Center',
    siteAcronym: 'SFH',
    siteCode: `${healthProviderAbbrToConceptIdObj.sanfordHealth}`,
    siteTeam: 'Sanford Connect Study Team',
    loginSiteName: 'Sanford Health',
    email: 'connectstudy@sanfordhealth.org',
  },
  [conceptIds.nameToKeyObj.sfSC]: {
    siteSpecificLocation: 'Sioux Falls Sanford Center',
    siteAcronym: 'SFH',
    siteCode: `${healthProviderAbbrToConceptIdObj.sanfordHealth}`,
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
    723351427: {
        siteSpecificLocation: 'BCC- HWC',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    807443231: {
        siteSpecificLocation: 'FW All Saints',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    288564244: {
        siteSpecificLocation: 'BCC- Fort Worth',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    475614532: {
        siteSpecificLocation: 'BCC- Plano',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    809370237: {
        siteSpecificLocation: 'BCC- Worth St',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    856158129: {
        siteSpecificLocation: 'BCC- Irving',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org',
    },
    436956777: {
        siteSpecificLocation: 'NTX Biorepository',
        siteAcronym: 'BSWH',
        siteCode: '472940358',
        siteTeam: 'BSWH Connect Study Team',
        loginSiteName: 'Baylor Scott & White Health',
        email: 'connectbiospecimen@BSWHealth.org'
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
  567969985: 'MF Pop-Up',
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
  [conceptIds.nameToKeyObj.hpPN]: "HP Park Nicollet",
  [conceptIds.nameToKeyObj.hfhPU]: "HFH Pop-Up",
  [conceptIds.nameToKeyObj.sfBM]: "Bismarck Medical Center",
  [conceptIds.nameToKeyObj.sfSC]: "Sioux Falls Sanford Center",
  723351427: "BCC- HWC",
  807443231: "FW All Saints",
  288564244: "BCC- Fort Worth",
  475614532: "BCC- Plano",
  809370237: "BCC- Worth St",
  856158129: "BCC- Irving",
  436956777: "NTX Biorepository",
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
  "MF Pop-Up": 567969985,
  "Lake Hallie": 698283667,
  "Sioux Falls Imagenetics": 589224449,
  "DCAM": 777644826, 
  "Main Campus": 111111111,
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
  "Frederick": 222222222,
  "HP Park Nicollet": conceptIds.nameToKeyObj.hpPN,
  "HFH Pop-Up": conceptIds.nameToKeyObj.hfhPU,
  "Bismarck Medical Center": conceptIds.nameToKeyObj.sfBM,
  "Sioux Falls Sanford Center": conceptIds.nameToKeyObj.sfSC,
  "BCC- HWC": 723351427,
  "FW All Saints": 807443231,
  "BCC- Fort Worth": 288564244,
  "BCC- Plano": 475614532,
  "BCC- Worth St": 809370237,
  "BCC- Irving": 856158129,
  "NTX Biorepository": 436956777,
}

export const conceptIdToHealthProviderAbbrObj = {
  452412599: "kpNW",
  531629870: "healthPartners",
  657167265: "sanfordHealth",
  548392715: "henryFordHealth",
  303349821: "marshfieldClinic",
  125001209: "kpCO",
  809703864: "uOfChicagoMed",
  13: "nci",
  300267574: "kpHI",
  327912200: "kpGA",
  1000: "allResults",
}

// Retain keyToNameObj for finalize template.
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
    327912200 : "Kaiser Permanente Georgia",
    472940358: "Baylor Scott & White Health"
}

// Use keyToNameCSVObj for clinical collections in CSV files - Kit and Package Receipt.
export const keyToNameCSVObj = {
    452412599 : "Kaiser Permanente NW RRL",
    531629870 : "HealthPartners Clinical",
    657167265 : "Sanford Clinical",
    548392715 : "Henry Ford Clinical",
    303349821 : "Marshfield Clinical",
    125001209 : "Kaiser Permanente Colorado RRL",
    809703864 : "University of Chicago Clinical",
    13 : "National Cancer Institute",
    300267574 : "Kaiser Permanente Hawaii RRL",
    327912200 : "Kaiser Permanente GA RRL",
    472940358: "Baylor Scott & White Health"
}

export const keyToLocationObj = 
{
    777644826: "UC-DCAM",
    692275326: "Marshfield",
    567969985: "MF Pop-Up",
    698283667: "Lake Hallie",
    834825425: "HP Research Clinic",
    [conceptIds.nameToKeyObj.hpPN] : "HP Park Nicollet",
    736183094: "HFH K-13 Research Clinic",
    886364332: "Henry Ford Health Pavilion",
    706927479: "HFH Livonia Research Clinic",
    [conceptIds.nameToKeyObj.hfhPU] : "HFH Pop-Up",
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
    [conceptIds.nameToKeyObj.sfBM] : "Bismarck Medical Center",
    [conceptIds.nameToKeyObj.sfSC] : "Sioux Falls Sanford Center",
    723351427: 'BCC- HWC',
    807443231: 'FW All Saints',
    288564244: 'BCC- Fort Worth',
    475614532: 'BCC- Plano',
    809370237: 'BCC- Worth St',
    856158129: 'BCC- Irving',
    436956777: 'NTX Biorepository',
    111111111: "NIH",
    13: "NCI"

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
    '884452262': 'Data destroyed',
    '458508122': 'Refused all future activities',
    '618686157': 'Deceased'
};

export const surveyConversion = {
    '789467219': 'Not Yet Eligible', 
    '972455046': 'Not Started',
    '615768760': 'Started',
    '231311385': 'Submitted'
};

const cidToLangMapper = {
  [conceptIds.english]: "english",
  [conceptIds.spanish]: "spanish",
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
                            biospecimensList = JSON.parse(currRow.cells[3].innerText)
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
        'UCM': [{location: 'UC-DCAM', concept: 777644826}, {location: 'Ingalls Harvey', concept: 145191545},
                {location: 'UCM Pop-Up', concept: 319518299}, {location: 'Orland Park', concept: 940329442}          
              ],
        'MFC': [{location: 'Marshfield', concept: 692275326}, {location: 'Lake Hallie', concept: 698283667}, {location: 'Weston', concept: 813701399}, {location: 'Rice Lake', concept: 691714762}, 
                {location: 'Wisconsin Rapids', concept: 487512085}, {location: 'Colby Abbotsford', concept: 983848564}, {location: 'Minocqua', concept: 261931804}, {location: 'Merrill', concept: 665277300},
                {location: 'MF Pop-Up', concept: 567969985}
              ],
        'HP': [{location: 'HP Research Clinic', concept: 834825425}, 
                {location: 'HP Park Nicollet', concept: conceptIds.nameToKeyObj.hpPN}],
        // HFH Pop-up
        'HFHS': [{location: 'HFH K-13 Research Clinic', concept: 736183094}, {location: 'HFH Cancer Pavilion Research Clinic', concept: 886364332},
                {location: 'HFH Livonia Research Clinic', concept: 706927479},
                {location: 'HFH Pop-Up', concept: conceptIds.nameToKeyObj.hfhPU}],
        // Bismarck
        'SFH': [{location: 'Sioux Falls Imagenetics', concept: 589224449}, {location: 'Fargo South University', concept: 467088902}, {location: 'Bismarck Medical Center', concept: conceptIds.nameToKeyObj.sfBM}, {location: 'Sioux Falls Sanford Center', concept: conceptIds.nameToKeyObj.sfSC}],

        'BSWH': [{location: 'BCC- HWC', concept: 723351427}, 
                {location: 'FW All Saints', concept: 807443231}, 
                {location: 'BCC- Fort Worth', concept: 288564244}, 
                {location: 'BCC- Plano', concept: 475614532}, 
                {location: 'BCC- Worth St', concept: 809370237}, 
                {location: 'BCC- Irving', concept: 856158129}, 
                {location: 'NTX Biorepository', concept: 436956777}],

        'NIH': [{location: 'NIH-1', concept: 111111111}, {location: 'NIH-2', concept: 222222222}]

    },
    'clinical': {
        'KPHI': [{location:'KPHI RRL', concept: 531313956}],
        'UCM': [{location: 'River East', concept: 489380324}, {location: 'South Loop', concept: 120264574}]
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
  const uid = data.state.uid;
  let shouldSendBioEmail = false;

  if (data[conceptIds.collection.selectedVisit]) {
    visits = data[conceptIds.collection.selectedVisit];
    if (!visits[visitConcept]) {
      if (visitConcept === conceptIds.baseline.visitId.toString()) shouldSendBioEmail = true;

      visits[visitConcept] = {
        [conceptIds.checkInDateTime]: new Date(),
      };
    }

    visits[visitConcept][conceptIds.checkInComplete] = conceptIds.yes;
  } else {
    shouldSendBioEmail = true;

    visits = {
      [visitConcept]: {
        [conceptIds.checkInComplete]: conceptIds.yes,
        [conceptIds.checkInDateTime]: new Date(),
      },
    };
  }

  const checkInData = {
    [conceptIds.collection.selectedVisit]: visits,
    uid,
  };

  if (shouldSendBioEmail) {
    const loginDetails = getLoginDetails(data);
    if (!loginDetails) {
      triggerErrorModal("Login details not found for this participant. Please check user profile data.");

      return;
    }

    const preferredLanguage = cidToLangMapper[data[conceptIds.preferredLanguage]] || "english";
    const requestData = {
      category: "Baseline Research Biospecimen Survey Reminders",
      attempt: "1st contact",
      email: data[conceptIds.preferredEmail],
      token: data.token,
      uid: data.state.uid,
      connectId: data.Connect_ID,
      preferredLanguage,
      substitutions: {
        loginDetails,
        firstName: data[conceptIds.prefName] || data[conceptIds.firstName] || "User",
      },
    };

    await sendInstantNotification(requestData);
  }

  await updateParticipant(checkInData);
};

const getEmailLoginInfo = (participantEmail) => {
  const [prefix, domain] = participantEmail.split("@");
  const changedPrefix =
    prefix.length > 3
      ? prefix.slice(0, 2) + "*".repeat(prefix.length - 3) + prefix.slice(-1)
      : prefix.slice(0, -1) + "*";
  return changedPrefix + "@" + domain;
};

const getPhoneLoginInfo = (participantPhone) => {
  return "***-***-" + participantPhone.slice(-4);
};

export const getLoginDetails = (data) => {
  if (data[conceptIds.signInMechanism] === "phone" && data[conceptIds.authenticationPhone]) {
    return getPhoneLoginInfo(data[conceptIds.authenticationPhone]);
  }

  if (data[conceptIds.signInMechanism] === "password" && data[conceptIds.authenticationEmail]) {
    return getEmailLoginInfo(data[conceptIds.authenticationEmail]);
  }

  if (data[conceptIds.signInMechanism] === "passwordAndPhone" && data[conceptIds.authenticationEmail] && data[conceptIds.authenticationPhone]) {
    return getPhoneLoginInfo(data[conceptIds.authenticationPhone]) + ", " + getEmailLoginInfo(data[conceptIds.authenticationEmail]);
  }

  return "";
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

export const participantCanCheckIn = (data) => {
    return data[conceptIds.withdrewConsent] !== conceptIds.yes &&
        data[conceptIds.revokedHIPAA] !== conceptIds.yes &&
        data[conceptIds.destroyData] !== conceptIds.yes &&
        data[conceptIds.dataDestroyed] !== conceptIds.yes;
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
    let siteTubesList = siteSpecificTubeRequirements[siteAcronym]?.[dashboardType]?.[subSiteLocation] ? siteSpecificTubeRequirements[siteAcronym]?.[dashboardType]?.[subSiteLocation] : siteSpecificTubeRequirements[siteAcronym]?.[dashboardType];
    //After March 1, 2024 the ACD tubes will expire and no longer be collected
    if (+new Date() >= +new Date('2024-02-20T00:00:00.000')) {
        siteTubesList = siteTubesList.filter((tube) => tube.id !== '0005');
    }
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
        let config = prodSSOConfig(email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    else if(location.host === urls.stage) {
        let config = stageSSOConfig(email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    else {
        let config = devSSOConfig(email);
        tenantID = config.tenantID;
        provider = config.provider;
    }
    return { tenantID, provider }
}

/**
 * fetch request to get an array of participants's data based on the biomouthwash kit's kit status
 * @param {string} type - the kit status type as concept Id
 * @returns {Array} - an array of custom objects based on participant's kit status
*/

export const getParticipantsByKitStatus = async (kitStatus) => {
    try {
        const idToken = await getIdToken();
        const response = await fetch(`${api}api=getParticipantsByKitStatus&type=${kitStatus}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + idToken,
            },
        });
        return response.json();
    } catch (error) {
        console.error("Failed to get participants by kit status", error);
        throw new Error("Failed to get participants by kit status"); 
    }
};

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

/**
 * ISO 8601 DateTime to human readable date time (UTC).
 * @param {string} isoDateTime - ISO 8601 string from Firestore.
 * @returns {string} - UTC DateTime in a human readable format: MM/DD/YYYY HH:MM
 */
export const convertISODateTime = (isoDateTime) => {
    const date = new Date(isoDateTime);
    return setZeroDateTime(date.getUTCMonth() + 1) + '/' + setZeroDateTime(date.getUTCDate()) + '/' + date.getUTCFullYear() + ' ' + setZeroDateTime(date.getUTCHours()) + ':' + setZeroDateTime(date.getUTCMinutes())
};

/**
 * Convert ISO 8601 DateTime to human readable date time (Local).
 * @param {string} isoDateTime - ISO DateTime (UTC)
 * @returns {string} - Local DateTime in a human readable format: either MM/DD/YYYY HH:MM
 */
export const convertISODateTimeToLocal = (isoDateTime) => {
    const date = new Date(isoDateTime);
    const month = setZeroDateTime(date.getMonth() + 1);
    const day = setZeroDateTime(date.getDate());
    const year = date.getFullYear();
    const hours = setZeroDateTime(date.getHours());
    const minutes = setZeroDateTime(date.getMinutes());

    return `${month}/${day}/${year} ${hours}:${minutes}`;
};

// append 0 before min. if single digit min. or hour
const setZeroDateTime = (dateTimeInput) => {
    return dateTimeInput < 10 ? '0' + dateTimeInput : dateTimeInput.toString();
};

export const formatISODateTimeDateOnly = (dateReceived) => {
    let extractDate = dateReceived.split("T")[0]
    extractDate = extractDate.split('-')
    const formattedDateTimeStamp = extractDate[1]+'/'+extractDate[2]+'/'+extractDate[0]
    return formattedDateTimeStamp
}

export const capsEnforcer = (elemArr) => {
    elemArr.forEach(elemId => {
        let elem = document.getElementById(elemId);
        if (elem) {
            elem.addEventListener('input', (e) => {
                elem.value = (e.target.value + '').toUpperCase();
            });
        }
    });
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

export const autoTabInputField = ( inputFieldSource, inputFieldDestination ) => {
    document.getElementById(inputFieldSource)?.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            document.getElementById(inputFieldDestination)?.focus();
        }
    })
}

export const autoTabAcrossArray = (autoTabArr) => {
    for(let i = 0; i < autoTabArr.length - 1; i++) {
        autoTabInputField(autoTabArr[i], autoTabArr[i + 1]);
    }
}

export const performQCcheck = (inputBox2, inputBox1, errorTag, errorMsg) => {
    const checkInputBox2 = document.getElementById(inputBox2);
    if (errorMsg === "") {
      document.getElementById(errorTag).innerHTML = `` 
    }
    if (checkInputBox2) {
      checkInputBox2.addEventListener("input", (e) => {
        const checkInputBox2Value = e.target.value.trim();
        const checkInputBox1Value = document.getElementById(inputBox1).value.trim();
        if (checkInputBox2Value !== checkInputBox1Value) {
          document.getElementById(errorTag).innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i>
                                                        <span style="color:red;">${errorMsg}</span>`
        }
        else {
          document.getElementById(errorTag).innerHTML = ``
        }
      })
    }
};

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
    
    if (sendBaselineEmail) {
        const loginDetails = getLoginDetails(data);
        if (!loginDetails) {
            triggerErrorModal("Login details not found for this participant. Please check user profile data.");

            return;
        }

        const preferredLanguage = cidToLangMapper[data[conceptIds.preferredLanguage]] || "english";
        const requestData = {
            category: "Baseline Clinical Blood and Urine Sample Survey Reminders",
            attempt: "1st contact",
            email: data[conceptIds.preferredEmail],
            token: data.token,
            uid: data.state.uid,
            connectId: data.Connect_ID,
            preferredLanguage,
            substitutions: {
                loginDetails,
                firstName: data[conceptIds.prefName] || data[conceptIds.firstName] || "User",
            }
        };
        
        await sendInstantNotification(requestData);
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
    if (alertList) {
    alertList.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
        </div>`;
    }
}

export const triggerSuccessModal = (message) => {
    const alertList = document.getElementById("alert_placeholder");
    if (alertList) {
        alertList.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
            </div>`;
    }
}

export const checkTrackingNumberSource = () => {
    const scannedBarcode = document.getElementById("scannedBarcode");
    const showMsg = document.getElementById('showMsg');
    if (!scannedBarcode) {
      return;
    }
    scannedBarcode.addEventListener("input", (e) => {
      const input = e.target.value.trim();
      if (input.length === 0) {
        showMsg.innerHTML = "";
        return;
      }
      if (input.length === 22 || input.length === 20) {
        showMsg.innerHTML = `<i class="fa fa-check-circle" style="font-size: 14px; color: blue;"></i>
                            <span style="color: black;">USPS</span>`;
      } else if (input.length === 12) {
        showMsg.innerHTML = `<i class="fa fa-check-circle" style="font-size: 14px; color: orange;"></i>
                            <span style="color: black;">FedEx</span>`;
      } else if (input.length === 34) {
        e.target.value = input.slice(-12);
        showMsg.innerHTML = `<i class="fa fa-check-circle" style="font-size: 14px; color: orange;"></i>
                            <span style="color: black;">FedEx</span>`;
      } else {
        showMsg.innerHTML = "";
      }
    
    // Additional checks can be added here if needed
    //   if (uspsFirstThreeNumbersCheck(input) || (input.length === 34 && uspsFirstThreeNumbersCheck(input))) {
    //     document.getElementById('showMsg').innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i> USPS`
    //     return
    //   }
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

export const validIso8601Format = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
 /**
 * Traverse two objects and compare values. Useful for checking if changes have been made to a data structure or the values within it.
 * @param {object} originalData - The original object to compare against (deep copy prior to edits).
 * @param {object} currentData - The current object to compare against after edits (on form submission or similar).
 * @returns {boolean} - True if the objects are different in shape or values. False if they are the same.
 */
export const hasObjectChanged = (originalData, currentData) => {
    // Check if both are the same value (for primitives & same object refs)
    if (originalData === currentData) {
        return false;
    }

    const areBothObjects = (obj) => (typeof obj === 'object' && obj !== null);
    if (!areBothObjects(originalData) || !areBothObjects(currentData)) {
        return originalData !== currentData;
    }

    if (Array.isArray(originalData) !== Array.isArray(currentData)) {
        return true;
    }

    // If both are arrays
    if (Array.isArray(originalData) && Array.isArray(currentData)) {
        if (originalData.length !== currentData.length) {
            return true;
        }
        for (let i = 0; i < originalData.length; i++) {
            if (hasObjectChanged(originalData[i], currentData[i])) {
                return true;
            }
        }
        return false;
    }

    // If both are objects, check for added or removed keys, then recursively check each key.
    const originalKeys = Object.keys(originalData);
    const currentKeys = Object.keys(currentData);
    if (originalKeys.length !== currentKeys.length) {
        return true;
    }

    for (const key of originalKeys) {
        if (!(key in currentData)) {
            return true;
        }

        if (hasObjectChanged(originalData[key], currentData[key])) {
            return true;
        }
    }

    // No changes detected
    return false;
};

/**
 * Specimen Re-finalization (found strays) - check if a tube is being added to a collection.
 * @param {object} originalSpecimenData - specimen data before editing form.
 * @param {object} currentSpecimenData - specimen data after editing form.
 * @returns {array} - list of tubes that have been added.
 * Why is this needed?: Re-finalization impacts the specimen collection's boxedStatus, which is used for determining collections to fetch in the shipping dashboard.
 */
export const getAddedStrayTubes = (originalSpecimenData, currentSpecimenData) => {
    const originalCollectedTubesSet = new Set(
        Object.keys(originalSpecimenData).filter(key =>
            specimenCollection.tubeCidList.includes(key) && originalSpecimenData[key][conceptIds.collection.tube.isCollected] === conceptIds.yes
        )
    );

    return Object.keys(currentSpecimenData).filter(key =>
        specimenCollection.tubeCidList.includes(key) &&
        currentSpecimenData[key][conceptIds.collection.tube.isCollected] === conceptIds.yes &&
        !originalCollectedTubesSet.has(key)).map(tubeKey => currentSpecimenData[tubeKey][conceptIds.collection.tube.scannedId]
    );
}

/**
 * Helper function for collectionId search (getSpecimenAndParticipant()).
 * @param {object} specimenData - specimen data object.
 * @param {object} participantData - participant data object.
 * @param {boolean} isBPTL - True if user is BPTL. False otherwise.
 * @returns {boolean} - True if both objects are found. False if either is missing.
 */
export const validateSpecimenAndParticipantResponse = (specimenData, participantData, isBPTL = false) => {
    if (!specimenData || !participantData) {
        if (!specimenData) showNotifications({ title: 'Not found', body: 'Specimen not found!' });
        else showNotifications({ title: 'Not found', body: 'Participant not found!' });
        return false;
    }

    // No need to check workflow if isBPTL -- they can access all collections.
    if (isBPTL) return true;

    // Check if the collection is on the correct dashboard.
    if (getWorkflow() === 'research' && specimenData[conceptIds.collection.collectionSetting] !== conceptIds.research) {
        hideAnimation();
        showNotifications({ title: 'Incorrect Dashboard', body: 'Clinical Collections cannot be viewed on Research Dashboard' });
        return false;
    } else if (getWorkflow() === 'clinical' && specimenData[conceptIds.collection.collectionSetting] !== conceptIds.clinical) {
        hideAnimation();
        showNotifications({ title: 'Incorrect Dashboard', body: 'Research Collections cannot be viewed on Clinical Dashboard' });
        return false;
    }

    return true;
}

export const showModalNotification = (title, body, closeButtonName, continueButtonName, continueAction) => {
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal', 'fade');
    modalContainer.id = 'checkinCheckoutModal'; 
    modalContainer.tabIndex = '-1';
    modalContainer.role = 'dialog';
    modalContainer.setAttribute('aria-labelledby', 'customModalTitle');
    modalContainer.setAttribute('aria-hidden', 'true');
  
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-dialog', 'modal-dialog-centered');
    modalContent.setAttribute('role', 'document');
  
    modalContent.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          ${body}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-dark" data-dismiss="modal" id="closeBtn">${closeButtonName}</button>
          <button type="button" class="btn btn-success" data-value="confirmed" data-dismiss="modal" id="continueBtn">${continueButtonName}</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(modalContainer);
    modalContainer.appendChild(modalContent);
    modalContainer.classList.add('show');
    modalContainer.style.display = 'block';

    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn && modalContainer){ 
        closeBtn.addEventListener('click', async () => { 
            document.body.removeChild(modalContainer); }); 
        }
        else {
            console.error('Close button or modal container is null.'); 
        }    
        
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn && modalContainer){ 
        continueBtn.addEventListener('click', async () => { 
            continueAction();
            document.body.removeChild(modalContainer); }); 
        }
        else {
            console.error('Close button or modal container is null.'); 
        }  
};
