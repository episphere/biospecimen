import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { performSearch, showAnimation, addBiospecimenUsers, hideAnimation, showNotifications, biospecimenUsers, removeBiospecimenUsers, findParticipant, removeActiveClass, errorMessage, removeAllErrors, storeSpecimen, searchSpecimen, generateBarCode } from './shared.js'
import { searchTemplate, searchBiospecimenTemplate } from './pages/dashboard.js';
import { userListTemplate } from './pages/users.js';
import { checkInTemplate } from './pages/checkIn.js';
import { specimenTemplate } from './pages/specimen.js';
import { collectProcessTemplate, tubeCollectedTemplate } from './pages/collectProcess.js';
import { finalizeTemplate } from './pages/finalize.js';
import { explanationTemplate } from './pages/explanation.js';

export const addEventSearchForm1 = () => {
    const form = document.getElementById('search1');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;
        if(!firstName && !lastName && !dob) return;
        let query = '';
        if(firstName) query += `firstName=${firstName}&`;
        if(lastName) query += `lastName=${lastName}&`;
        if(dob) query += `dob=${dob.replace(/-/g,'')}&`;
        performSearch(query);
    })
};

export const addEventSearchForm2 = () => {
    const form = document.getElementById('search2');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        let query = '';
        if(email) query += `email=${email}`;
        performSearch(query);
    })
};

export const addEventSearchForm3 = () => {
    const form = document.getElementById('search3');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        let query = '';
        if(phone) query += `phone=${phone}`;
        performSearch(query);
    })
};

export const addEventSearchForm4 = () => {
    const form = document.getElementById('search4');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const connectId = document.getElementById('connectId').value;
        let query = '';
        if(connectId) query += `connectId=${connectId}`;
        performSearch(query);
    })
};

export const addEventsearchSpecimen = () => {
    const form = document.getElementById('specimenLookupForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const masterSpecimenId = document.getElementById('masterSpecimenId').value;
        showAnimation();
        const biospecimen = await searchSpecimen(masterSpecimenId);
        if(biospecimen.code !== 200) {
            hideAnimation();
            showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'}, true)
            return
        }
        const biospecimenData = biospecimen.data;
        let query = `connectId=${parseInt(biospecimenData.connectId)}`;
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        if(data.tube1Id === undefined) tubeCollectedTemplate(data, biospecimenData)
        else collectProcessTemplate(data, biospecimenData);
    })
}

export const addEventBackToSearch = (id) => {
    document.getElementById(id).addEventListener('click', searchTemplate)
};

export const addEventHideNotification = (element) => {
    const hideNotification = element.querySelectorAll('.hideNotification');
    Array.from(hideNotification).forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentNode.parentNode.parentNode.parentNode.removeChild(btn.parentNode.parentNode.parentNode);
        });
        setTimeout(() => { btn.dispatchEvent(new Event('click')) }, 8000);
    });
}

export const addEventModalBtn = (role, userEmail) => {
    const btn = document.getElementById("modalBtn");
    btn.addEventListener('click', () => {
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `<h5 class="modal-title">Add user</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>`;

        body.innerHTML = `
            <form id="addNewUser" method="POST">
                <div class="form-group">
                    <label class="col-form-label search-label">Name</label>
                    <input class="form-control" required type="name" id="userName" placeholder="Enter name"/>
                </div>
                <div class="form-group">
                    <label class="col-form-label search-label">Email</label>
                    <input class="form-control" required type="email" id="userEmail" placeholder="Enter name"/>
                </div>
                <div class="form-group">
                    <label class="col-form-label search-label">Role</label>
                    <select class="form-control" required id="userRole">
                        <option value="">-- Select role --</option>
                        ${role === 'admin' ? `
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                        ` : `
                            <option value="user">User</option>
                        `}
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-outline-primary">Add</button>
                </div>
            </form>
        `;
        addEventNewUserForm(userEmail);
    })
};

const addEventNewUserForm = (userEmail) => {
    const form = document.getElementById('addNewUser');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const array = [];
        let data = {};
        data['name'] = document.getElementById('userName').value;
        data['email'] = document.getElementById('userEmail').value;
        data['role'] = document.getElementById('userRole').value;
        array.push(data)
        showAnimation();
        const response = await addBiospecimenUsers(array);
        if(response.code === 200) {
            showNotifications({title: 'New user added!', body: `<b>${data.email}</b> is added as <b>${data.role}</b>`});
            form.reset();
            const users = await biospecimenUsers();
            hideAnimation();
            if(users.code === 200 && users.data.users.length > 0) {
                document.getElementById('usersList').innerHTML = userListTemplate(users.data.users, userEmail);
                addEventRemoveUser();
            }
        }
        else if(response.code === 400 && response.message === 'User with this email already exists') {
            hideAnimation();
            showNotifications({title: 'User already exists!', body: `User with email: <b>${data.email}</b> already exists`}, true);
        }
    })
}

export const addEventRemoveUser = () => {
    const elements = document.getElementsByClassName('fa-user-minus');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', async () => {
            const email = element.dataset.email;
            showAnimation();
            const response = await removeBiospecimenUsers(email);
            hideAnimation();
            if(response.code === 200) {
                element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
                showNotifications({title: 'User removed!', body: `User with email <b>${email}</b> is removed.`});
            }
        })
    })
}

export const addEventSelectParticipantForm = () => {
    const form = document.getElementById('selectParticipant');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const radios = document.getElementsByName('selectParticipant');
        Array.from(radios).forEach(async radio => {
            if(radio.checked) {
                const connectId = radio.value;
                let query = `connectId=${parseInt(connectId)}`;
                showAnimation();
                const response = await findParticipant(query);
                hideAnimation();
                const data = response.data[0];
                removeActiveClass('navbar-btn', 'active')
                const navBarBtn = document.getElementById('navBarParticipantCheckIn');
                navBarBtn.classList.remove('disabled');
                navBarBtn.classList.add('active');
                document.getElementById('contentBody').innerHTML = checkInTemplate(data);
                generateBarCode('connectIdBarCode', data.Connect_ID);
                addEventContactInformationModal(data);
                addEventBackToSearch('navBarSearch');
                addEventBackToSearch('checkInExit');
                addEventCheckInCompleteForm();
            }
        })
    })
}

const addEventCheckInCompleteForm = () => {
    const form = document.getElementById('checkInCompleteForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        let formData = {};
        const select = document.getElementById('biospecimenVisitType');
        const connectId = parseInt(select.dataset.connectId);
        const biospecimenVisitType = select.value;
        const token = select.dataset.participantToken;
        formData['connectId'] = connectId;
        formData['visitType'] = biospecimenVisitType;
        formData['checkedInAt'] = new Date().toISOString();
        formData['token'] = token;
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        removeActiveClass('navbar-btn', 'active')
        const navBarBtn = document.getElementById('navBarSpecimenLink');
        navBarBtn.classList.remove('disabled');
        navBarBtn.classList.add('active');
        document.getElementById('contentBody').innerHTML = specimenTemplate(data, formData);
        generateBarCode('connectIdBarCode', data.Connect_ID);
        addEventSpecimenLinkForm(formData);
        addEventNavBarParticipantCheckIn();
    })
};

const addEventSpecimenLinkForm = (formData) => {
    const form = document.getElementById('specimenLinkForm');
    const specimenSaveExit = document.getElementById('specimenSaveExit');
    const specimenContinue = document.getElementById('specimenContinue');
    const connectId = specimenSaveExit.dataset.connectId || specimenContinue.dataset.connectId;
    document.getElementById('navBarParticipantCheckIn').dataset.connectId = connectId;
    const reEnterSpecimen = document.getElementById('reEnterSpecimen');
    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    specimenSaveExit.addEventListener('click', () => {
        btnsClicked(connectId, formData)
    });
    specimenContinue.addEventListener('click', () => {
        btnsClicked(connectId, formData, true)
    });
    reEnterSpecimen.addEventListener('click', () => {
        removeAllErrors();
        form.reset();
    })
}

const btnsClicked = async (connectId, formData, cont) => {
    removeAllErrors();
    const scanSpecimenID = document.getElementById('scanSpecimenID').value;
    const enterSpecimenID1 = document.getElementById('enterSpecimenID1').value;
    const enterSpecimenID2 = document.getElementById('enterSpecimenID2').value;
    let hasError = false;
    let focus = true;
    
    if(scanSpecimenID && enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Provide either Scanned Specimen ID or Manually typed.', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Provide either Scanned Specimen ID or Manually typed.', focus);
        return;
    }
    else if(!scanSpecimenID && !enterSpecimenID1){
        hasError = true;
        errorMessage('scanSpecimenID', 'Please Scan Master Specimen ID or Type in Manually', focus);
        focus = false;
        errorMessage('enterSpecimenID1', 'Please Scan Master Specimen ID or Type in Manually', focus);
        return;
    }
    else if(!scanSpecimenID && enterSpecimenID1){
        if(enterSpecimenID1 !== enterSpecimenID2) {
            hasError = true;
            errorMessage('enterSpecimenID2', 'Does not match with Manually Entered Specimen ID', focus);
            return;
        }
    }
    formData['masterSpecimenId'] = enterSpecimenID1;
    
    let query = `connectId=${parseInt(connectId)}`;
    showAnimation();
    const response = await findParticipant(query);
    const data = response.data[0];
    const specimenData = (await searchSpecimen(formData['masterSpecimenId'])).data;
    hideAnimation();
    if(cont) {
        if(specimenData && specimenData.connectId && specimenData.connectId !== data.Connect_ID) {
            showNotifications({title: 'Master Specimen Id Duplication', body: 'Entered master specimen Id is already associated with a different connect Id.'}, true)
        }
        else {
            showAnimation();
            await storeSpecimen([formData]);
            hideAnimation();
            tubeCollectedTemplate(data, specimenData ? specimenData : formData);
        }
    }
    else {
        if(specimenData && specimenData.connectId && specimenData.connectId !== data.Connect_ID) {
            showNotifications({title: 'Master Specimen Id Duplication', body: 'Entered master specimen Id is already associated with a different connect Id.'}, true)
        }
        else {
            showAnimation();
            await storeSpecimen([formData]);
            showAnimation();
            searchTemplate();
        }
    }
}

export const addEventBiospecimenCollectionForm = (dt, biospecimenData) => {
    const form = document.getElementById('biospecimenCollectionForm');
    const collectionSaveExit = document.getElementById('collectionSaveExit');
    const collectionNext = document.getElementById('collectionNext');
    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    collectionSaveExit.addEventListener('click', () => {
        collectionSubmission(dt, biospecimenData);
    })
    collectionNext.addEventListener('click', () => {
        collectionSubmission(dt, biospecimenData, true);
    });
};

export const addEventTubeCollectedForm = (data, masterSpecimenId) => {
    const form = document.getElementById('tubeCollectionForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        if(!isChecked('tube1Collected') && !isChecked('tube2Collected') && !isChecked('tube3Collected') && !isChecked('tube4Collected') && !isChecked('tube5Collected') && !isChecked('tube6Collected') && !isChecked('tube7Collected')) return;
        showAnimation();
        const biospecimenData = (await searchSpecimen(masterSpecimenId)).data;
        if(biospecimenData.tubeCollectedAt === undefined) biospecimenData['tubeCollectedAt'] = new Date().toISOString();
        Array.from(document.getElementsByClassName('tube-collected')).forEach((dt, index) => {
            biospecimenData[`tube${index+1}Collected`] = dt.checked
            if(!dt.checked) {
                biospecimenData[`tube${index+1}Id`] = '';
            }
        })
        await storeSpecimen([biospecimenData]);
        hideAnimation();
        collectProcessTemplate(data, biospecimenData);
    })
}

const collectionSubmission = async (dt, biospecimenData, cntd) => {
    const data = {};
    const tube1Id = getValue('tube1Id');
    const tube2Id = getValue('tube2Id');
    const tube3Id = getValue('tube3Id');
    const tube4Id = getValue('tube4Id');
    const tube5Id = getValue('tube5Id');
    const tube6Id = getValue('tube6Id');
    const tube7Id = getValue('tube7Id');

    data['tube1Id'] = tube1Id;
    data['tube2Id'] = tube2Id;
    data['tube3Id'] = tube3Id;
    data['tube4Id'] = tube4Id;
    data['tube5Id'] = tube5Id;
    data['tube6Id'] = tube6Id;
    data['tube7Id'] = tube7Id;
    
    data['collectionAdditionalNotes'] = document.getElementById('collectionAdditionalNotes').value;
    Array.from(document.getElementsByClassName('tube-deviated')).forEach((dt, index) => data[`tube${index+1}Deviated`] = dt.checked)
    
    
    if(biospecimenData.masterSpecimenId) data['masterSpecimenId'] = biospecimenData.masterSpecimenId;
    showAnimation();
    await storeSpecimen([data]);
    if(cntd) {
        const specimenData = (await searchSpecimen(biospecimenData.masterSpecimenId)).data;
        hideAnimation();
        explanationTemplate(dt, specimenData);
    }
    else {
        hideAnimation();
        searchTemplate();
    }
}

const getValue = (id) => document.getElementById(id).value;

const isChecked = (id) => document.getElementById(id).checked;

export const addEventSelectAllCollection = () => {
    const checkbox = document.getElementById('selectAllCollection');
    checkbox.addEventListener('click', () => {
        if(checkbox.checked) Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => chk.checked = true);
        else Array.from(document.getElementsByClassName('tube-collected')).forEach(chk => chk.checked = false);
    })
}

const addEventNavBarParticipantCheckIn = () => {
    const btn = document.getElementById('navBarParticipantCheckIn');
    btn.addEventListener('click', async () => {
        const connectId = btn.dataset.connectId;
        if(!connectId) return;
        removeActiveClass('navbar-btn', 'active')
        btn.classList.remove('disabled');
        btn.classList.add('active');
        let query = `connectId=${parseInt(connectId)}`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        const data = response.data[0];
        document.getElementById('contentBody').innerHTML = checkInTemplate(data);
        generateBarCode('connectIdBarCode', data.Connect_ID);
        addEventContactInformationModal(data);
        addEventBackToSearch('navBarSearch');
        addEventBackToSearch('checkInExit');
        addEventCheckInCompleteForm();
    })
}

export const addEventExplanationForm = (data, masterSpecimenId) => {
    const form = document.getElementById('explanationForm');
    const explanationSaveExit = document.getElementById('explanationSaveExit');
    const explanationContinue = document.getElementById('explanationContinue');
    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    explanationSaveExit.addEventListener('click', () => {
        explanationHandler(data, masterSpecimenId);
    });
    explanationContinue.addEventListener('click', () => {
        explanationHandler(data, masterSpecimenId, true);
    });
}

const explanationHandler = async (data, masterSpecimenId, cntd) => {
    const textAreas = document.getElementsByClassName('additional-explanation');
    let formData = {};
    Array.from(textAreas).forEach(ta => {
        if(ta.id.includes('tube1Collected') || ta.id.includes('tube2Collected') || ta.id.includes('tube3Collected') || ta.id.includes('tube4Collected') || ta.id.includes('tube5Collected')) {
            formData['bloodTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['bloodTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('tube6Collected')) {
            formData['urineTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['urineTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('tube7Collected')) {
            formData['mouthWashTubeNotCollectedReason'] = document.getElementById(ta.id.replace('Explanation', 'Reason')).value;
            formData['mouthWashTubeNotCollectedExplanation'] = ta.value;
        }
        if(ta.id.includes('Deviated')) {
            formData[ta.id] = ta.value;
            const tmpId = ta.id.replace('Explanation', 'Reason');
            formData[tmpId] = Array.from(document.getElementById(tmpId).options).filter(el => el.selected).map(el => el.value);
        }
    });
    formData['masterSpecimenId'] = masterSpecimenId;
    showAnimation();
    await storeSpecimen([formData]);
    if(cntd) {
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        finalizeTemplate(data, specimenData);
    }
    else {
        hideAnimation();
        searchTemplate();
    }
}

export const addEventFinalizeForm = (data, masterSpecimenId) => {
    const form = document.getElementById('finalizeForm');
    const finalizedSaveExit = document.getElementById('finalizedSaveExit');
    const finalizedContinue = document.getElementById('finalizedContinue');

    form.addEventListener('submit', e => {
        e.preventDefault();
    });
    finalizedSaveExit.addEventListener('click', () => {
        finalizeHandler(data, masterSpecimenId);
    });
    finalizedContinue.addEventListener('click', () => {
        finalizeHandler(data, masterSpecimenId, true);
    });
}

const finalizeHandler = async (data, masterSpecimenId, cntd) => {
    let formData = {};
    formData['finalizedAdditionalNotes'] = document.getElementById('finalizedAdditionalNotes').value;
    formData['masterSpecimenId'] = masterSpecimenId;
    if(cntd) {
        formData['finalized'] = true;
        formData['finalizedAt'] = new Date().toISOString();
        showAnimation();
        await storeSpecimen([formData]);
        hideAnimation();
        showNotifications({title: 'Specimen Finalized', body: 'Specimen finalized successfully!'});
        searchTemplate();
    }
    else {
        showAnimation();
        await storeSpecimen([formData]);
        hideAnimation();
        searchTemplate();
    }
}

export const addEventReturnToCollectProcess = () => {
    const btn = document.getElementById('returnToCollectProcess');
    btn.addEventListener('click', async () => {
        const masterSpecimenId = btn.dataset.masterSpecimenId;
        const connectId = btn.dataset.connectId;
        showAnimation();
        let query = `connectId=${parseInt(connectId)}`;
        const response = await findParticipant(query);
        const data = response.data[0];
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        tubeCollectedTemplate(data, specimenData);
    })
};

export const addEventBackToTubeCollection = (data, masterSpecimenId) => {
    const btn = document.getElementById('backToTubeCollection');
    btn.addEventListener('click', async () => {
        showAnimation();
        const specimenData = (await searchSpecimen(masterSpecimenId)).data;
        hideAnimation();
        tubeCollectedTemplate(data, specimenData);
    })
}

export const addEventNavBarSpecimenSearch = () => {
    const btn = document.getElementById('navBarSpecimenSearch');
    btn.addEventListener('click', () => {
        if(btn.classList.contains('active')) return;
        searchBiospecimenTemplate();
    });
}

const addEventContactInformationModal = (data) => {
    const btn = document.getElementById('contactInformationModal');
    btn.addEventListener('click', () => {
        const header = document.getElementById('biospecimenModalHeader');
        const body = document.getElementById('biospecimenModalBody');
        header.innerHTML = `<h5 class="modal-title">Contact Information</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>`;
        body.innerHTML = `
            <div class="row">
                <div class="col">${data.RcrtCS_Lname_v1r0}, ${data.RcrtCS_Fname_v1r0}</div>
                <div class="ml-auto">Connect ID: <svg id="connectIdBarCodeModal"></svg></div>
            </div>
            <div class="row">
                <div class="col">
                    <button class="btn btn-outline-primary disabled" disabled>EDIT</button>
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col">
                    <strong>Address:</strong> ${data.RcrtUP_AddressLn1_v1r0}${data.RcrtUP_AddressLn2_v1r0 ? ` ${data.RcrtUP_AddressLn2_v1r0}`: ''} ${data.RcrtUP_City_v1r0} ${Object.keys(allStates)[Object.values(allStates).indexOf(parseInt(data.RcrtUP_State_v1r0))]} ${data.RcrtUP_Zip_v1r0}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Email(s):</strong> ${data.RcrtUP_Email1_v1r0}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Phone:</strong> ${data.RcrtUP_Phone1_v1r0}
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <strong>Preferred contact method: </strong>
                </div>
            </div>
            </br>
            <div class="row">
                <div class="col">
                    <button type="button" class="btn btn-outline-success" data-dismiss="modal" aria-label="Close">
                        Information verified
                    </button>
                </div>
            </div>
        `;
        generateBarCode('connectIdBarCodeModal', data.Connect_ID);
    });
};
