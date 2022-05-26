import { getIdToken, SSOConfig } from "../shared.js";
import { homeNavBar } from "./../navbar.js";

export const signIn = () => {
    document.getElementById('contentHeader').innerHTML = '';
    const root = document.getElementById('contentBody');
    if(!root) return;
    root.innerHTML = '';
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
    root.appendChild(signInDiv2); 
    document.getElementById('signInForm').addEventListener('submit', e => {
        e.preventDefault();
        const inputValue = document.getElementById('signInEmail').value;
        
        const { tenantID, provider } = SSOConfig(inputValue);
        
        const saml = new firebase.auth.SAMLAuthProvider(provider);
        firebase.auth().tenantId = tenantID;
        firebase.auth().signInWithPopup(saml)
            .then(async (result) => {
                location.hash = '#welcome'
            })
            .catch((error) => {
                console.log(error)
            });
    });
    document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
}

export const signOut = () => {
    firebase.auth().signOut();
    // window.location.hash = '#';
    location.reload();
}