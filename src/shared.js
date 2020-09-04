import { userNavBar, adminNavBar, nonUserNavBar, bodyNavBar } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { addEventHideNotification } from "./events.js"

const api = 'https://us-central1-nih-nci-dceg-episphere-dev.cloudfunctions.net/biospecimen?';
// const api = 'http://localhost:8010/nih-nci-dceg-episphere-dev/us-central1/biospecimen?';

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
    const IDs = ['dashboard', 'manageUsers'];
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
    const getVerifiedParticipants = response.data.filter(dt => dt.state.RcrtV_Verification_v1r0 === 1);
    if(response.code === 200 && getVerifiedParticipants.length > 0) searchResults(getVerifiedParticipants);
    else if(response.code === 200 && getVerifiedParticipants.length === 0) showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
}

export const showNotifications = (data, error) => {
    const div = document.createElement('div');
    div.classList = ["notification"];
    div.innerHTML = `
        <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="mr-auto ${error ? 'error-heading': ''}">${data.title}</strong>
                <button type="button" class="ml-2 mb-1 close hideNotification" data-dismiss="toast" aria-label="Close">&times;</button>
            </div>
            <div class="toast-body">
                ${data.body}
            </div>
        </div>
    `
    document.getElementById('showNotification').appendChild(div);
    document.getElementsByClassName('container')[0].scrollIntoView(true);
    addEventHideNotification(div);
}

export const errorMessage = (id, msg, focus) => {
    const currentElement = document.getElementById(id);
    const parentElement = currentElement.parentNode;
    if(Array.from(parentElement.querySelectorAll('.form-error')).length > 0) return;
    if(msg){
        const div = document.createElement('div');
        div.classList = ['row col-md-5 offset-md-4 error-text'];
        const span = document.createElement('span');
        span.classList = ['form-error']
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

export const generateBarCode = (id, connectId) => {
    JsBarcode(`#${id}`, connectId, {height: 30});
}