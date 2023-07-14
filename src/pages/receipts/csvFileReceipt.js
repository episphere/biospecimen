import { showAnimation, hideAnimation, getIdToken, nameToKeyObj, keyToLocationObj, baseAPI, keyToNameObj, convertISODateTime, formatISODateTime, getAllBoxes, getSiteAcronym, conceptIdToSiteSpecificLocation } from "../../shared.js";
import fieldToConceptIdMapping from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { getRecentBoxesShippedBySiteNotReceived } from "./packagesInTransit.js";

export const csvFileReceiptScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;

  csvFileReceiptTemplate(username);
  activeReceiptsNavbar();
  csvFileButtonSubmit();
  getInTransitFileType();
  loadSheetJScdn();
}

const csvFileReceiptTemplate = async (username) => {
  let template = "";
  template += receiptsNavbar();
  template += `<div id="root root-margin" style="margin-top:3rem;">
                <div id="alert_placeholder"></div>
                <span> <h4 style="text-align: center; margin: 1rem 0;">In Transit</h4> </span>
                <div class="container-fluid">
                  <div class="card bg-light mb-3 mt-3 mx-auto" style="max-width:50rem;">
                    <div class="card-body" style="padding: 4rem 2.5rem;">
                      <form class="form">
                      <div class="form-group d-flex flex-wrap align-items-center justify-content-center m-0">
                          <p></p>
                          <button id="createTransitFile" data-toggle="modal" data-target="#modalShowMoreData" class="btn btn-primary" disabled>Create File</button>
                      </div>
                      </form>
                    </div>
                  </div>
              </div>`

template += `<div class="modal fade" id="modalShowMoreData" data-keyboard="false" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">
              <div class="modal-dialog modal-md modal-dialog-centered" role="document">
                  <div class="modal-content sub-div-shadow">
                      <div class="modal-header" id="modalHeader"></div>
                      <div class="modal-body" id="modalBody"></div>
                  </div>
              </div>
          </div>`

  template += `<span> <h4 style="text-align: center; margin: 1rem 0;">Receipted CSV File</h4> </span>
                  <div class="container-fluid">
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
                  </div>`
  
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
}

const getInTransitFileType = () => {
  document.getElementById("createTransitFile").addEventListener("click", async (e) => {
    e.preventDefault();
    const modalHeaderEl = document.getElementById("modalHeader");
    const modalBodyEl = document.getElementById("modalBody");
    modalHeaderEl.innerHTML = `
                              <h4>Select a format to download In Transit file</h4>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="closeModal">
                              <span aria-hidden="true">&times;</span></button>`

    modalBodyEl.innerHTML =  `<div class="row">
                                <div class="col">
                                      <form>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="xlsx" id="xlsxCheck">
                                          <label class="form-check-label" for="xlsxCheck">
                                            .XLSX (for better readability)
                                          </label>
                                        </div>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="csv" id="csvCheck">
                                          <label class="form-check-label" for="csvCheck">
                                            .CSV (for BSI upload)
                                          </label>
                                        </div>
                                      </form>
                                </div>
                            </div>`
    confirmFileSelection();
  })
}

const confirmFileSelection = () => {
  const radios = document.querySelectorAll('input[name="fileFormat"]');
  radios.forEach(radio => {
    radio.addEventListener('click', async (e) => {
      const radioVal = radio.value;
      document.getElementById('modalShowMoreData').querySelector('#closeModal').click(); // closes modal
      showAnimation();
      const response = await getAllBoxes(`bptl`);
      hideAnimation();
      const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
      let modifiedTransitResults = updateInTransitMapping(allBoxesShippedBySiteAndNotReceived);
      (radioVal === 'xlsx') ? processInTransitXLSXData(modifiedTransitResults) : generateInTransitCSVData(modifiedTransitResults)
    });
});
}

const csvFileButtonSubmit = () => {
  document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
    e.preventDefault();
    let dateFilter = document.getElementById("csvDateInput").value
    dateFilter = dateFilter+'T00:00:00.000Z'
    showAnimation();
    const results = await getBSIQueryData(dateFilter);
    hideAnimation();
    document.getElementById("csvDateInput").value = ``;
    let modifiedResults = modifyBSIQueryResults(results.data);
    generateBSIqueryCSVData(modifiedResults);
  })
}

const getCurrentDate = () => {
  const currentDate = new Date().toLocaleDateString('en-CA');
  return currentDate;
}

const getBSIQueryData = async (filter) => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=queryBsiData&type=${filter}`, {
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
  let filteredResults = results.filter(result =>  result.length !== 0 && (result[0][fieldToConceptIdMapping.collectionId] !== undefined && 
                        result[0][fieldToConceptIdMapping.collectionId].split(' ')[1] !== '0008' && result[0][fieldToConceptIdMapping.collectionId].split(' ')[1] !== '0009')
                        && result[0][fieldToConceptIdMapping.discardFlag] !== fieldToConceptIdMapping.yes && result[0][fieldToConceptIdMapping.deviationNotFound] !== fieldToConceptIdMapping.yes)
  filteredResults = filteredResults.flat()
  filteredResults.forEach(filteredResult => {
      let vialMappings = getVialTypesMappings(filteredResult)
      updateResultMappings(filteredResult, vialMappings)
  })
  return filteredResults
}

/**
 * Loops through each shipped box & specimen bag. Then grabs essential information and stores the result in an object & pushes the object to an array
 * @param {object} shippedBoxes - Shipped box object contains all the related specimen bags & more
 * @returns {array} Returns an array of objects with essential information for in transit csv
*/ 

const updateInTransitMapping = (shippedBoxes) => {
  let holdProcessedResult = []
  shippedBoxes.forEach(shippedBox => {
    const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
    const specimenBags = Object.values(shippedBox.bags); // store bag content in an array
    
    specimenBags.forEach((specimenBag, index) => {
      specimenBag.arrElements.forEach((fullSpecimenIds, j, specimenBagSize) => { // grab fullSpecimenIds & loop thru content
        let dataHolder = {
          shipDate: shippedBox[fieldToConceptIdMapping.shippingShipDate]?.split("T")[0] || '',
          trackingNumber: shippedBox[fieldToConceptIdMapping.shippingTrackingNumber] || '',
          shippedSite: shippedBox.siteAcronym || '',
          shippedLocation: conceptIdToSiteSpecificLocation[shippedBox[fieldToConceptIdMapping.shippingLocation]] || '',
          shipDateTime: convertISODateTime(shippedBox[fieldToConceptIdMapping.shippingShipDate]) || '',
          numSamples: specimenBagSize.length,
          tempMonitor: shippedBox[fieldToConceptIdMapping.tempProbe] === fieldToConceptIdMapping.yes ? 'Yes' : 'No',
          BoxId: shippedBox[fieldToConceptIdMapping.shippingBoxId] || '',
          specimenBagId: bagKeys[index],
          fullSpecimenIds: fullSpecimenIds,
          materialType: materialTypeMapping(fullSpecimenIds)
        };
        holdProcessedResult.push(dataHolder);        
        })
    });

  })
  return holdProcessedResult
}


/**
 * Maps specimen id to material type based on last 4 digits
 * @param {string} specimenId - Specimen id from each specimen bag
 * @returns {string} Returns material type
*/ 

const materialTypeMapping = (specimenId) => {
  const tubeId = specimenId.split(' ')[1]
  const materialTypeObject = {'0001':'Serum', '0002':'Serum', '0011':'Serum', '0012':'Serum', '0021':'Serum', 
                              '0003': 'WHOLE BL', '0004': 'WHOLE BL', '0005': 'WHOLE BL', '0013': 'WHOLE BL', '0014' : 'WHOLE BL', '0024' : 'WHOLE BL',
                              '0006':'Urine', '0007': 'Saliva'}
  return materialTypeObject[tubeId] ?? '';
}

/**
 * Maps specimen id to material type based on last 4 digits, collection type & health care provider
 * @param {object} filteredResult - Object containg essential information (health care provider, collection type, & more)
 * @returns {array} Returns an array containing all the vial mapping
*/ 

const getVialTypesMappings = (filteredResult) => {
  let vialMappingsHolder = []
  const tubeId = filteredResult[fieldToConceptIdMapping.collectionId].split(' ')[1]
  const collectionType = filteredResult[fieldToConceptIdMapping.collectionType]
  const healthCareProvider = filteredResult[fieldToConceptIdMapping.healthcareProvider]

  if (collectionType === fieldToConceptIdMapping.research && (tubeId === '0001' || tubeId === '0002' )) {
    vialMappingsHolder.push('8.5 mL Serum separator tube', 'SST', 'Serum', '8.5')
  } else if (collectionType === fieldToConceptIdMapping.research && tubeId === '0003') {
    vialMappingsHolder.push('10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10')
  } else if (collectionType === fieldToConceptIdMapping.research && tubeId === '0004') {
    vialMappingsHolder.push('10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10')
  } else if (collectionType === fieldToConceptIdMapping.research && tubeId === '0005') {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'WHOLE BL', '6')
  } else if (collectionType === fieldToConceptIdMapping.research && tubeId === '0006') {
    vialMappingsHolder.push('10 ml Vacutainer', 'No Additive', 'Urine', '10')
  } else if (collectionType === fieldToConceptIdMapping.research && tubeId === '0007') {
    vialMappingsHolder.push('15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15')
  } else if (collectionType === fieldToConceptIdMapping.clinical && (tubeId === '0001' || tubeId === '0002' || tubeId === '0011' || tubeId === '0012' || tubeId === '0021')) {
    vialMappingsHolder.push('5 mL Serum separator tube', 'SST', 'Serum', '5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && (tubeId === '0003' || tubeId === '0013')) {
    vialMappingsHolder.push('4 ml Vacutainer', 'Lithium Heparin', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && (tubeId === '0004' || tubeId === '0014' || tubeId === '0024')) {
    vialMappingsHolder.push('4 ml Vacutainer', 'EDTA = K2', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && tubeId === '0005') {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && tubeId === '0006') {
    vialMappingsHolder.push('6 ml Vacutainer', 'No Additive', 'Urine', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpCO"] && (tubeId === '0001' || tubeId === '0002' || tubeId === '0011' 
  || tubeId === '0012' )) {
    vialMappingsHolder.push('5 mL Serum separator tube', 'SST', 'Serum', '5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpCO"] && (tubeId === '0003' || tubeId === '0013' )) {
    vialMappingsHolder.push('4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpCO"] && (tubeId === '0004' || tubeId === '0014' )) {
    vialMappingsHolder.push('4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpCO"] && (tubeId === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'WHOLE BL', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpCO"] && (tubeId === '0001')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'No Additive', 'Urine', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpNW"] && (tubeId === '0001' || tubeId === '0002' 
  || tubeId === '0011' || tubeId === '0012' || tubeId === '0021' )) {
    vialMappingsHolder.push('3.5 mL Serum separator tube', 'SST', 'Serum', '3.5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpNW"] && (tubeId === '0013' || tubeId === '0003')) {
    vialMappingsHolder.push('4 mL Serum separator tube', 'Lithium Heparin', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpNW"] && (tubeId === '0014' || tubeId === '0004')) {
    vialMappingsHolder.push('4 mL Serum separator tube', 'EDTA = K2', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpNW"] && (tubeId === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpNW"] && (tubeId === '0006')) {
    vialMappingsHolder.push('10 ml Vacutainer', 'No Additive', 'Urine', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpHI"] && (tubeId === '0001' || tubeId === '0002' 
  || tubeId === '0011' || tubeId === '0012')) {
    vialMappingsHolder.push('5 ml Serum separator tube', 'SST', 'Serum', '5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpHI"] && (tubeId === '0003' || tubeId === '0013')) {
    vialMappingsHolder.push('4 mL Vacutainer', 'Lithium Heparin', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpHI"] && (tubeId === '0004' || tubeId === '0014' 
  || tubeId === '0024')) {
    vialMappingsHolder.push('3 mL Vacutainer', 'EDTA = K2', 'Whole BI', '3')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpHI"] && (tubeId === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpHI"] && (tubeId === '0006')) {
    vialMappingsHolder.push('15 ml Nalgene jar', 'No Additive', 'Urine', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpGA"] && (tubeId === '0001' || tubeId === '0002' 
  || tubeId === '0011' || tubeId === '0012' )) {
    vialMappingsHolder.push('5 ml Serum separator tube', 'SST', 'Serum', '5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpGA"] && (tubeId === '0003' || tubeId === '0013')) {
    vialMappingsHolder.push('4.5 mL Vacutainer', 'Lithium Heparin', 'Whole BI', '4.5')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpGA"] && (tubeId === '0004' || tubeId === '0014')) {
    vialMappingsHolder.push('4 mL Vacutainer', 'EDTA = K2', 'Whole BI', '4')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpGA"] && (tubeId === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole BI', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["kpGA"] && (tubeId === '0006')) {
    vialMappingsHolder.push('15 ml Nalgene jar', 'No Additive', 'Urine', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["hfHealth"] && (tubeId === '0001' || tubeId === '0002')) {
    vialMappingsHolder.push('10 ml Serum separator tube', 'SST', 'Serum', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["hfHealth"] && (tubeId === '0003')) {
    vialMappingsHolder.push('10 ml Vacutainer', 'Lithium Heparin', 'Whole Blood', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["hfHealth"] && (tubeId === '0004')) {
    vialMappingsHolder.push('10 ml Vacutainer', 'EDTA', 'Whole Blood', '10')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["hfHealth"] && (tubeId === '0005')) {
    vialMappingsHolder.push('6 ml Vacutainer', 'ACD', 'Whole Blood', '6')
  } else if (collectionType === fieldToConceptIdMapping.clinical && healthCareProvider === nameToKeyObj["hfHealth"] && (tubeId === '0006')) {
    vialMappingsHolder.push('10 ml Vacutainer', 'No Additive', 'Urine', '6')
  } else {
    vialMappingsHolder.push('', '', '', '')
  }

  return vialMappingsHolder
}

const updateResultMappings = (filteredResult, vialMappings) => {
  filteredResult['Study ID'] = 'Connect Study';
  filteredResult['Sample Collection Center'] = (filteredResult[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical) 
              ? keyToNameObj[filteredResult[fieldToConceptIdMapping.healthcareProvider]] : keyToLocationObj[filteredResult[fieldToConceptIdMapping.collectionLocation]];
  filteredResult['Sample ID'] = filteredResult[fieldToConceptIdMapping.collectionId]?.split(' ')[0] || '';
  filteredResult['Sequence #'] = filteredResult[fieldToConceptIdMapping.collectionId]?.split(' ')[1] || '';
  filteredResult['BSI ID'] = filteredResult[fieldToConceptIdMapping.collectionId] || '';
  filteredResult['Subject ID'] = filteredResult['Connect_ID'];
  filteredResult['Date Received'] = formatISODateTime(filteredResult[fieldToConceptIdMapping.dateReceived]) || '';
  filteredResult['Date Drawn'] = (filteredResult[fieldToConceptIdMapping.collectionType] === fieldToConceptIdMapping.clinical) 
              ? convertISODateTime(filteredResult[fieldToConceptIdMapping.clinicalDateTimeDrawn]) || '' : convertISODateTime(filteredResult[fieldToConceptIdMapping.dateWithdrawn]) || '';
  filteredResult['Vial Type'] = vialMappings[0];
  filteredResult['Additive/Preservative'] = vialMappings[1];
  filteredResult['Material Type'] = vialMappings[2];
  filteredResult['Volume'] = vialMappings[3];
  filteredResult['Volume Estimate'] = 'Assumed';
  filteredResult['Voume Unit'] = 'ml (cc)';
  filteredResult['Vial Warnings'] = '';
  filteredResult['Hermolyzed'] = '';
  filteredResult['Label Status'] = 'Barcoded';
  filteredResult['Visit'] = 'BL';
  
  // Delete unwanted properties
  delete filteredResult[fieldToConceptIdMapping.healthcareProvider];
  delete filteredResult[fieldToConceptIdMapping.collectionLocation];
  delete filteredResult['Connect_ID'];
  delete filteredResult[fieldToConceptIdMapping.collectionId];
  delete filteredResult[fieldToConceptIdMapping.dateWithdrawn];
  delete filteredResult[fieldToConceptIdMapping.clinicalDateTimeDrawn];
  delete filteredResult[fieldToConceptIdMapping.dateReceived];
  delete filteredResult[fieldToConceptIdMapping.collectionType];
  delete filteredResult[fieldToConceptIdMapping.discardFlag];
  delete filteredResult[fieldToConceptIdMapping.deviationNotFound];  
}

const generateBSIqueryCSVData = (items) => {
  let csv = ``;
  csv += `Study ID, Sample Collection Center, Sample ID, Sequence #, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n`
  downloadCSVfile(items, csv, 'BSI-data-export')
}

const generateInTransitCSVData = (items) => {
  let csv = ``;
  csv += `Ship Date, Tracking Number, Shipped from Site, Shipped from Location, Shipped Date & Time, Expected Number of Samples, Temperature Monitor, Box Number, Specimen Bag ID Type, Full Specimen IDs, Material Type\r\n`
  downloadCSVfile(items, csv, 'In-Transit-CSV-data-export')
}

const downloadCSVfile = (items, csv, title) => {
  for (let row = 0; row < (items.length); row++) {
    let keysAmount = Object.keys(items[row]).length
    let keysCounter = 0
    for(let key in items[row]) {
      csv += items[row][key] + (keysCounter + 1 < keysAmount ? ',' : '\r\n') 
      keysCounter++
    }}
    generateFileToDownload(csv, title, 'csv')
}

/**
 * Process data to the format required by xlsx library. Map function converts each row of inTransitItems into an array of values using Object.values
 * @param {object} inTransitItems - array of objects
 * @returns {array} Returns an array of arrays
*/ 

const processInTransitXLSXData = (inTransitItems) => {
  const header = ['Ship Date', 'Tracking Number', 'Shipped from Site', 'Shipped from Location', 'Shipped Date & Time', 'Expected Number of Samples', 'Temperature Monitor', 'Box Number', 'Specimen Bag ID Type', 'Full Specimen IDs', 'Material Type'];
  const inTransitData = [header, ...inTransitItems.map(row => Object.values(row))];
  handleXLSXLibrary(inTransitData);
};

/**
 * Loads SheetJS CDN upon Create .csv file selection & then enables create file button upon script onload
 * @param {} 
 * @returns
*/ 

const loadSheetJScdn = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js';
  script.onload = function() {
    document.getElementById("createTransitFile").disabled = false; // enable create file button after the script is successfully loaded
  };
  document.head.appendChild(script);
}

/**
 * Using SheetJS, data gets processed & gets added to XLSX workbook and worksheet. Then triggers xlsx file download
 * @param {array} data - array of arrays
 * @returns
*/ 

const handleXLSXLibrary = (data) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data); // Create a new workbook and worksheet

  XLSX.utils.book_append_sheet(workbook, worksheet, `InTransitExport`); // Add the worksheet to the workbook

  const xlsxFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });  // Convert the workbook to a binary XLSX file

  const blob = new Blob([xlsxFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });  // Create a Blob from the binary data
  generateFileToDownload(blob, 'In-Transit-XLSX-data-export', 'xlsx')
}

/**
 * Generates xlsx or csv file for download
 * @param {array, string, string}
 * @returns
*/ 

const generateFileToDownload = (blob, title, fileType) => {
  const link = document.createElement('a');  // Create a download link
  if (fileType === 'xlsx') {
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute("download",`${getCurrentDate()}-${title}.xlsx`);
  }
  else {
    link.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(blob)}`);
    link.setAttribute("download", `${getCurrentDate()}-${title}.csv`);
  }

  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link);

  // Display success message
  const alertList = document.getElementById('alert_placeholder');
  const template = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      Success!
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
  alertList.innerHTML = template;
}