const api = 'https://us-central1-nih-nci-dceg-episphere-dev.cloudfunctions.net/';
// const api = 'http://localhost:8010/nih-nci-dceg-episphere-dev/us-central1/';

export const validateUser = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}biospecimen?api=validateUsers`, {
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
