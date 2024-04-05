import { showAnimation, hideAnimation, getIdToken, keyToNameAbbreviationObj, keyToLocationObj, baseAPI, keyToNameCSVObj, formatISODateTimeDateOnly, convertISODateTime, getAllBoxes, conceptIdToSiteSpecificLocation, showNotifications, getCurrentDate, miscTubeIdSet, triggerSuccessModal, getSpecimensInBoxes, findReplacementTubeLabels } from "../../shared.js";
import { conceptIds as fieldToConceptIdMapping } from "../../fieldToConceptIdMapping.js";
import { receiptsNavbar } from "./receiptsNavbar.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeReceiptsNavbar } from "./activeReceiptsNavbar.js";
import { getRecentBoxesShippedBySiteNotReceived } from "./packagesInTransit.js";
import { specimenCollection } from "../../tubeValidation.js";

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

  template += receiptedCSVFileTemplate();
  
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
}

export const receiptedCSVFileTemplate = () => {
  return `<span> <h4 style="text-align: center; margin: 1rem 0;">Receipted CSV File</h4> </span>
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
      try {
        const response = await getAllBoxes(`bptlPackagesInTransit`);
        const specimens = await getSpecimensInBoxes(response.data, true);
        const replacementTubeLabelObj = findReplacementTubeLabels(specimens);
        hideAnimation();
        const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
        let modifiedTransitResults = updateInTransitMapping(allBoxesShippedBySiteAndNotReceived, replacementTubeLabelObj);
        (radioVal === 'xlsx') ? processInTransitXLSXData(modifiedTransitResults) : generateInTransitCSVData(modifiedTransitResults);
      } catch (error) {
        hideAnimation();
        console.error(error);
        triggerErrorModal('Error generating file.  Please try again later');
      }
      
      
    });
});
}

const csvFileButtonSubmit = () => {
    document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
        e.preventDefault();
        const dateFilter = document.getElementById("csvDateInput").value + 'T00:00:00.000Z'; 
        showAnimation();

        try {
            const results = await getSpecimensByReceivedDate(dateFilter);
            const modifiedResults = modifyBSIQueryResults(results.data);
            generateBSIqueryCSVData(modifiedResults);
            hideAnimation();
        } catch (e) {
            hideAnimation();
            showNotifications({ title: 'Error', body: `Error fetching BSI Query Data -- ${e.message}` });
        }
    });
}

const getSpecimensByReceivedDate = async (dateFilter) => {
    try {
        const idToken = await getIdToken();
        const response = await fetch(`${baseAPI}api=getSpecimensByReceivedDate&receivedTimestamp=${dateFilter}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + idToken,
            },
        });

        if (response.status !== 200) {
          throw new Error(`Error fetching specimens by received date. ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error(e);
        throw new Error(`Error fetching specimens by received date: ${e.message}`);
    }
}


/**
 * Tube Id's 0050-0054 are misc tubes. They are used by shipping sites in the event something happened to the original ID label.
 * BPTL wants to know what the original ID label should be (Ex: 0001-0024, 0060, not 0050-0054).
 * These need to be mapped to the key in the specimen object
 */

const modifyBSIQueryResults = (results) => {
    const csvDataArray = [];
    results.forEach(result => {
        const collectionType = result[fieldToConceptIdMapping.collectionType] || fieldToConceptIdMapping.research;
        const healthcareProvider = result[fieldToConceptIdMapping.healthcareProvider] || 'default';
        const specimenKeysArray = result.specimens && Object.keys(result.specimens).length > 0 ? Object.keys(result.specimens) : [];
            for (const specimenKey of specimenKeysArray) {
                let [collectionId = '', tubeId = ''] = result.specimens[specimenKey]?.[fieldToConceptIdMapping.collectionId]?.split(' ') ?? [];
                if (miscTubeIdSet.has(tubeId)) {
                  tubeId = specimenCollection.cidToNum[specimenKey];
                }
                const vialMappings = getVialTypesMappings(tubeId, collectionType, healthcareProvider);
                const csvRowsFromSpecimen = updateResultMappings(result, vialMappings, collectionId, tubeId);
                csvDataArray.push(csvRowsFromSpecimen);
            }
    });

    return csvDataArray;
}

/**
 * Loops through each shipped box & specimen bag. Then grabs essential information and stores the result in an object & pushes the object to an array
 * @param {object} shippedBoxes - Shipped box object contains all the related specimen bags & more
 * @returns {array} Returns an array of objects with essential information for in transit csv
*/ 
const updateInTransitMapping = (shippedBoxes, replacementTubeLabelObj) => {
  let holdProcessedResult = []
  shippedBoxes.forEach(shippedBox => {
    const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
    const specimenBags = Object.values(shippedBox.bags); // store bag content in an array
    
    specimenBags.forEach((specimenBag, index) => {
      specimenBag.arrElements.forEach((fullSpecimenIds, j, specimenBagSize) => { // grab fullSpecimenIds & loop thru content
        if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, fullSpecimenIds)) {
          fullSpecimenIds = replacementTubeLabelObj[fullSpecimenIds];
        }
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
                              '0006':'Urine', '0007': 'Saliva', '0060': 'WHOLE BL'}
  return materialTypeObject[tubeId] ?? '';
}

const vialMapping = {
    research: {
        default: {
            '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
            '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0007': ['15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
    },
    clinical: {
        hfHealth: {
            '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
            '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        hPartners: {
            '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
            '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
            '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        kpCO: {
            '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['6 ml Vacutainer', 'No Additive', 'Urine', '6'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        kpGA: {
            '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0003': ['4.5 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4.5'],
            '0013': ['4.5 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4.5'],
            '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        kpHI: {
            '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0004': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
            '0014': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
            '0024': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        kpNW: {
            '0001': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
            '0002': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
            '0011': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
            '0012': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
            '0021': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
            '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
        default: {
            '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0021': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
            '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
            '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0024': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
            '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
            '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
            '0007': ['15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15'],
            '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
        },
    }
};

const getVialTypesMappings = (tubeId, collectionType, healthcareProvider) => {
    if (!collectionType || !tubeId) {
        console.warn('collectionType or tubeId is missing');
        return ['', '', '', ''];
    }
    
    const collectionTypeString = collectionType === fieldToConceptIdMapping.research ? 'research' : 'clinical';
    const healthcareProviderString = keyToNameAbbreviationObj[healthcareProvider] || 'default';

    if (collectionTypeString === 'research') {
        return vialMapping[collectionTypeString]?.default?.[tubeId] || ['', '', '', ''];
    } else {
        return vialMapping[collectionTypeString]?.[healthcareProviderString]?.[tubeId] || vialMapping[collectionTypeString]?.default?.[tubeId] || ['', '', '', ''];
    }
};

const updateResultMappings = (filteredResult, vialMappings, collectionId, tubeId) => {
    const collectionTypeValue = filteredResult[fieldToConceptIdMapping.collectionType];
    const clinicalDateTime = filteredResult[fieldToConceptIdMapping.clinicalDateTimeDrawn];
    const withdrawalDateTime = filteredResult[fieldToConceptIdMapping.dateWithdrawn];
    
    const sampleCollectionCenter = (collectionTypeValue === fieldToConceptIdMapping.clinical)
        ? (keyToNameCSVObj[filteredResult[fieldToConceptIdMapping.healthcareProvider]] || '')
        : (keyToLocationObj[filteredResult[fieldToConceptIdMapping.collectionLocation]] || '');

    const dateReceived = filteredResult[fieldToConceptIdMapping.dateReceived]
        ? formatISODateTimeDateOnly(filteredResult[fieldToConceptIdMapping.dateReceived])
        : '';

    const dateDrawn = (collectionTypeValue === fieldToConceptIdMapping.clinical)
        ? (clinicalDateTime ? convertISODateTime(clinicalDateTime) : '')
        : (withdrawalDateTime ? convertISODateTime(withdrawalDateTime) : '');

    const vialType = vialMappings[0] || '';
    const additivePreservative = vialMappings[1] || '';
    const materialType = vialMappings[2] || '';
    const volume = vialMappings[3] || '';

    return {
        'Study ID': 'Connect Study',
        'Sample Collection Center': sampleCollectionCenter,
        'Sample ID': collectionId || '',
        'Sequence': tubeId || '',
        'BSI ID': `${collectionId} ${tubeId}` || '',
        'Subject ID': filteredResult['Connect_ID'] || '',
        'Date Received': dateReceived,
        'Date Drawn': dateDrawn,
        'Vial Type': vialType,
        'Additive/Preservative': additivePreservative,
        'Material Type': materialType,
        'Volume': volume,
        'Volume Estimate': 'Assumed',
        'Volume Unit': 'ml (cc)',
        'Vial Warnings': '',
        'Hemolyzed': '',
        'Label Status': 'Barcoded',
        'Visit': 'BL'
    };
};

const generateBSIqueryCSVData = (items) => {
    const csv = 'Study ID, Sample Collection Center, Sample ID, Sequence, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n';
    downloadCSVfile(items, csv, 'BSI-data-export');
}

const generateInTransitCSVData = (items) => {
    const csv = `Ship Date, Tracking Number, Shipped from Site, Shipped from Location, Shipped Date & Time, Expected Number of Samples, Temperature Monitor, Box Number, Specimen Bag ID Type, Full Specimen IDs, Material Type\r\n`;
    downloadCSVfile(items, csv, 'In-Transit-CSV-data-export');
}

// If rowValue contains a comma, quote or newline, enclose in double quotes & replace with inner double quotes
export const downloadCSVfile = (items, csv, title) => {
  const csvData = items.map((item) => {
    const rowData = Object.values(item).map((rowValue) => { // store processed row data
      if (typeof rowValue === 'string' && /[",\n\r]/.test(rowValue)) { // use regex for string handling
        return `"${rowValue.replaceAll('"', '""')}"`; // use replaceAll for reduced code duplication
      }
      return rowValue;
    });
    return rowData.join(',');
  });

  csv += csvData.join('\r\n');
  generateFileToDownload(csv, title, 'csv');
};

/**
 * Process data to the format required by xlsx library. Map function converts each row of inTransitItems into an array of values using Object.values
 * @param {object} inTransitItems - array of objects
 * @returns {array} Returns an array of arrays
*/ 

const processInTransitXLSXData = (inTransitItems) => {
  const header = ['Ship Date', 'Tracking Number', 'Shipped from Site', 'Shipped from Location', 'Shipped Date & Time', 'Expected Number of Samples', 'Temperature Monitor', 'Box Number', 'Specimen Bag ID Type', 'BSI ID', 'Material Type'];
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
  triggerSuccessModal(`${title} file downloaded successfully!`);
}