import { homeNavBar } from "./../navbar.js";

export const signIn = () => {
    document.getElementById('contentHeader').innerHTML = '';
    const root = document.getElementById('contentBody');
    if(!root) return;
    root.innerHTML = '';
    const signInDiv = document.createElement('div');
    signInDiv.id = 'signInDiv';
    signInDiv.className = 'row inherit-width';
    const signInDiv2 = document.createElement('div');
    signInDiv2.id = 'signInDiv2';
    signInDiv2.className = 'row inherit-width';
    signInDiv2.innerHTML = `
        </br>
        </br>
        <form id="signInForm" class="inherit-width" method="POST">
            Sign In using SSO(beta)
            <div class="form-group">
                <input class="form-control" autocomplete="off" required type="email" id="signInEmail" placeholder="Enter your organizational email Id">
                </br><button type="submit" class="btn btn-outline-primary">Sign In</button>
            </div>
        </form>
    `;
    root.appendChild(signInDiv); 
    root.appendChild(signInDiv2); 
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#signInDiv', signInConfig());
    document.getElementById('signInForm').addEventListener('submit', e => {
        e.preventDefault();
        const inputValue = document.getElementById('signInEmail').value;
        let tenantID = '', provider = '';
        
        if(/nih.gov/i.test(inputValue)) {
            tenantID = 'NIH-SSO-qfszp';
            provider = 'saml.nih-sso';
        };
        if(/healthpartners.com/i.test(inputValue)) {
            tenantID = 'HP-SSO-wb1zb';
            provider = 'saml.healthpartner';
        };
        const saml = new firebase.auth.SAMLAuthProvider(provider);
        firebase.auth().tenantId = tenantID;
        firebase.auth().signInWithPopup(saml)
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.log(error)
            });
    });
    document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
}

const signInConfig = () => {
    return {
        signInSuccessUrl: '#welcome',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        credentialHelper: 'none'
    }
}

export const signOut = () => {
    firebase.auth().signOut();
    // window.location.hash = '#';
    location.reload();
}