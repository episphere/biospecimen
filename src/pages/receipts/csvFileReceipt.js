import { showAnimation, hideAnimation, getAllBoxes, getIdToken } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar, unAuthorizedUser } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { getFakeResults } from "./fake.js";

export const csvFileReceiptScreen = async (auth, route) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;

  csvFileReceiptTemplate(username, auth, route);
  activeReceiptsNavbar();
  csvFileButtonSubmit();
}

const csvFileReceiptTemplate = async (username, auth, route) => {
  let template = "";

  template += receiptsNavbar();
  template += `<div id="root root-margin" style="margin-top:3rem;">
                  <span> <h3 style="text-align: center; margin: 1rem 0;">Create CSV File</h3> </span>
                  <div class="container-fluid">
                  <div id="alert_placeholder"></div>
                    <div class="card bg-light mb-3 mt-3 mx-auto" style="max-width:50rem;">
                      <div class="card-body" style="padding: 4rem 2.5rem;">
                        <form class="form">
                        <div class="form-group d-flex flex-wrap align-items-center justify-content-center m-0">
                          <label for="csvDateInput" style="display:inline-block;margin-bottom:0; margin-right:5%; font-size:1.3rem;">Enter a Date</label>
                          <input type="date" name="csvDate" id="csvDateInput" describedby="enterEmail" style="margin-right:5%; padding:0.2rem;" value="${getCurrentDate()}" max="${getCurrentDate()}"/>
                          <button id="csvCreateFileButton" class="btn btn-primary">Create File</button>
                        </div>
                        </form>
                      </div>
                    </div>
                  </div>
              </div>`
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
}

const csvFileButtonSubmit = () => {
  document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
    e.preventDefault();
    let dateFilter = document.getElementById("csvDateInput").value
    dateFilter = dateFilter+'T00:00:00.000Z'
    showAnimation();
    const results =  await getBSIQueryData(dateFilter) //getFakeResults();
    hideAnimation();
    let modifiedResults = modifyBSIQueryResults(results.data);
    console.log('modifiedResults', modifiedResults)
    generateBSIqueryCSVData(modifiedResults);

  })
}

const getCurrentDate = () => {
  const currentDate = new Date().toLocaleDateString('en-CA');
  return currentDate;
}
// http://localhost:5001/nih-nci-dceg-connect-dev/us-central1/biospecimen?api=queryBsiData&type=${filter}`, {

const getBSIQueryData = async (filter) => {
  const idToken = await getIdToken();
  const response = await fetch(`https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/biospecimen?api=queryBsiData&type=${filter}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer" + idToken,
    },
  });

  try {
    if (response.status === 200) {
      const bsiQueryData = await response.json();
      return bsiQueryData
    } 
  } catch (e) { // if error return an empty array
    console.log(e);
    return [];
  }
};


const modifyBSIQueryResults = (results) => {
  results.forEach( i => {
    let vialMappings = getVialTypesMappings(i)
    console.log('vialMappings', vialMappings)
    updateResultMappings(i, vialMappings)
  })
  return results
}

const getVialTypesMappings = (i) => {
  let vialMappingsHolder = []
  if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research  && i['siteAcronym'] === '' && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' )) {
    vialMappingsHolder.push('10 mL Serum separator tube', 'SST', 'Serum', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research && i['siteAcronym'] === '' && i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003') {
    vialMappingsHolder.push('10 ml Vacutainer', 'Lithium Heparin', 'Whole Bl', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research && i['siteAcronym'] === '' && i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004') {
    vialMappingsHolder.push('10 ml Vacutainer', 'EDTA', 'Whole Bl', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research && i['siteAcronym'] === '' && i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005') {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole Bl', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research && i['siteAcronym'] === '' && i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0006') {
    vialMappingsHolder.push('10 ml Vacutainer', 'No Additive', 'Urine', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.research && i['siteAcronym'] === '' && i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0007') {
    vialMappingsHolder.push('15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Colorado'
      && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0011'
      || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0012' )) {
    vialMappingsHolder.push('5 mL Serum separator tube', 'SST', 'Serum', '5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Colorado'
  && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0013' )) {
    vialMappingsHolder.push('4 ml Vacutainer', 'Lithium Heparin', 'Whole Bl', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Colorado'
  && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0014' )) {
    vialMappingsHolder.push('4 ml Vacutainer', 'EDTA', 'Whole Bl', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Colorado'
  && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole Bl', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Colorado'
  && (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'No Additive', 'Urine', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Northwest' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0011' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0012' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0021' )) {
    vialMappingsHolder.push('3.5 mL Serum separator tube', 'SST', 'Serum', '3.5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Northwest' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0013' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003')) {
    vialMappingsHolder.push('4 mL Serum separator tube', 'Lithium Heparin', 'Whole BI', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Northwest' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0014' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004')) {
    vialMappingsHolder.push('4 mL Serum separator tube', 'EDTA', 'Whole BI', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Northwest' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Northwest' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0006')) {
    vialMappingsHolder.push('10 ml Vacutainer', 'No Additive', 'Urine', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001') || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0011' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0012') {
    vialMappingsHolder.push('5 ml Serum separator tube', 'SST', 'Serum', '5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003') || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0013') {
    vialMappingsHolder.push('4 mL Vacutainer', 'Lithium Heparin', 'Whole BI', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004') || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0014' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0024') {
    vialMappingsHolder.push('3 mL Vacutainer', 'EDTA', 'Whole BI', '3')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004') || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0014' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0024') {
    vialMappingsHolder.push('3 mL Vacutainer', 'EDTA', 'Whole BI', '3')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Hawaii' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0006')) {
    vialMappingsHolder.push('15 ml Nalgene jar', 'No Additive', 'Urine', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Georgia' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0011' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0012' )) {
    vialMappingsHolder.push('5 ml Serum separator tube', 'SST', 'Serum', '5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Georgia' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0013')) {
    vialMappingsHolder.push('4.5 mL Vacutainer', 'Lithium Heparin', 'Whole BI', '4.5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Georgia' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0014')) {
    vialMappingsHolder.push('4 mL Vacutainer', 'EDTA', 'Whole BI', '4')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Georgia' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Kaiser Permanente Georgia' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0006')) {
    vialMappingsHolder.push('15 ml Nalgene jar', 'No Additive', 'Urine', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Henry Ford Health System' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0001' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0002' 
  || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0011' || i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0012' )) {
    vialMappingsHolder.push('5 ml Serum separator tube', 'SST', 'Serum', '5')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Henry Ford Health System' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0003')) {
    vialMappingsHolder.push('10 mL Vacutainer', 'Lithium Heparin', 'Whole BI', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Henry Ford Health System' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0004')) {
    vialMappingsHolder.push('10 mL Vacutainer', 'EDTA', 'Whole BI', '10')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Henry Ford Health System' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  }
  else if (i[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical && i['siteAcronym'] === 'Henry Ford Health System' && 
  (i[fieldToConceptIdMapping.collectionId].split(' ')[1] === '0006')) {
    vialMappingsHolder.push('15 ml Nalgene jar', 'No Additive', 'Urine', '10')
  }
  else{}
  

  return vialMappingsHolder
}

const updateResultMappings = (i, vialMappings) => {
  i['Study ID'] = 'Connect Study'
  i['Sample Collection Center'] = i.siteAcronym
  i['Sample ID'] = i[fieldToConceptIdMapping.collectionId] != undefined ? i[fieldToConceptIdMapping.collectionId].split(' ')[0] : ``
  i['Sequence #'] = i[fieldToConceptIdMapping.collectionId] != undefined ? i[fieldToConceptIdMapping.collectionId].split(' ')[1] : ``
  i['BSI ID'] = i[fieldToConceptIdMapping.collectionId] != undefined ? i[fieldToConceptIdMapping.collectionId] : ``
  i['Subject ID'] = i['Connect_ID']
  i['Date Drawn'] = i[fieldToConceptIdMapping.dateWithdrawn]
  i['Vial Type'] = vialMappings[0]
  i['Additive/Preservative'] = vialMappings[1]
  i['Material Type'] = vialMappings[2]
  i['Volume'] = vialMappings[3]
  i['Volume Estimate'] = 'Assumed'
  i['Voume Unit'] = 'ml (cc)'
  i['Vial Warnings'] = ''
  i['Hermolyzed'] = ''
  i['Label Status'] = 'Barcoded'
  i['Visit'] = 'BL'
  delete i['siteAcronym']
  delete i['Connect_ID']
  delete i[fieldToConceptIdMapping.collectionId]
  delete i[fieldToConceptIdMapping.dateWithdrawn]
  delete i[fieldToConceptIdMapping.collectionType]
}

const generateBSIqueryCSVData = (items) => {
  let csv = ``;
  csv += `Study ID, Sample Collection Center, Sample ID, Sequence #, BSI ID, Subject ID, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n`
  for (let row = 0; row < (items.length); row++) {
    let keysAmount = Object.keys(items[row]).length
    let keysCounter = 0
    for(let key in items[row]) {
        csv += items[row][key] + (keysCounter + 1 < keysAmount ? ',' : '\r\n') 
      keysCounter++
    }}
    let link = document.createElement("a");
    link.id = "download-csv";
    link.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(csv));
    link.setAttribute("download",`${new Date().toLocaleDateString()}-BSI-data-export.csv`);
    document.body.appendChild(link);
    document.querySelector("#download-csv").click();
    document.body.removeChild(link);
    let alertList = document.getElementById("alert_placeholder");
    let template = ``;
    template += `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              Success!
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
            </div>`;
    alertList.innerHTML = template;
  
}