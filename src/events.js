import { findParticipant, showAnimation, hideAnimation } from './shared.js'
import { searchResults, searchTemplate } from './pages/dashboard.js';

export const addEventSearchForm = () => {
    const form = document.getElementById('search1');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;

        let query = '';
        if(firstName) query += `firstName=${firstName}&`;
        if(lastName) query += `lastName=${lastName}&`;
        if(dob) query += `dob=${dob.replace(/-/g,'')}&`;
        showAnimation();
        const response = await findParticipant(query);
        hideAnimation();
        if(response.code === 200) searchResults(response.data);
    })
};

export const addEventBackToSearch = () => {
    document.getElementById('backToSearch').addEventListener('click', searchTemplate)
}