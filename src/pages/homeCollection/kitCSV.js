import { nonUserNavBar } from "../../navbar.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { showAnimation, hideAnimation, getIdToken, baseAPI, keyToNameCSVObj, conceptIdToHealthProviderAbbrObj, triggerErrorModal, convertISODateTime } from "../../shared.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from '../../fieldToConceptIdMapping.js';
import { receiptedCSVFileTemplate, downloadCSVfile } from '../receipts/csvFileReceipt.js';

export const kitCsvScreen = (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitCsvTemplate(username);
  csvFileButtonSubmit();
  hideAnimation();
};

const kitCsvTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();

  template += `<div id="root root-margin" style="margin-top:3rem;">
              <div id="alert_placeholder"></div>
              ${receiptedCSVFileTemplate()}
              </div>`
  
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar();
};

const csvFileButtonSubmit = () => {
  document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
      e.preventDefault();
      const dateString = document.getElementById("csvDateInput").value + 'T00:00:00.000Z'; 
      showAnimation();
      try {
          const results = await getKitsByReceivedDate(dateString);
          console.log('results', results);
          const modifiedResults = modifyKitQueryResults(results.data);
          console.log('modifiedResults', modifiedResults);
          generateKitCSVData(modifiedResults);
          hideAnimation();
      } catch (e) {
          hideAnimation();
          triggerErrorModal(`Error fetching Kit Data -- ${e.message}`);
      }
  });
}

const getKitsByReceivedDate = async (dateString) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=getKitsByReceivedDate&receivedDateTimestamp=${dateString}`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + idToken,
        },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching kits by received date. ${response.status}`);
    }

    return await response.json();
} catch (e) {
    console.error(e);
    throw new Error(`Error fetching kits by received date: ${e.message}`);
  }

}

const modifyKitQueryResults = (kitsData) => {
  const csvKitArray = [];
  kitsData.forEach(kitData => {
    const sampleCollectionCenter = keyToNameCSVObj[kitData[conceptIds.healthcareProvider]];
    const collectionId = kitData[conceptIds.collection.id]; // CNA899209
    const bsiID = kitData[conceptIds.collection.mouthwashTube1][conceptIds.collection.tube.scannedId]; // CNA899209 0007
    const tubeID = bsiID.split(' ')[1]; // 0007
    const Connect_ID = kitData['Connect_ID'];
    const dateReceived = convertISODateTime(kitData[conceptIds.collection.mouthwashTube1][conceptIds.receivedDateTime]);
    const dateDrawn = convertISODateTime(kitData[conceptIds.dateWithdrawn]);
    const vialMappings = getVialTypesMapping('home', conceptIdToHealthProviderAbbrObj[kitData[conceptIds.healthcareProvider]], tubeID);
    const vialType = vialMappings[0] || '';
    const additivePreservative = vialMappings[1] || '';
    const materialType = vialMappings[2] || '';
    const volume = vialMappings[3] || '';
    const updatedKitResults = {
      'Study ID': 'Connect Study',
      'Sample Collection Center': sampleCollectionCenter,
      'Sample ID': collectionId || '',
      'Sequence': tubeID || '',
      'BSI ID': bsiID || '',
      'Subject ID': Connect_ID || '',
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
    }
    csvKitArray.push(updatedKitResults);
  });

  return csvKitArray;
}

const getVialTypesMapping = (collectionType, site, tubeId) => {
  if (collectionType === 'home') {
    return vialMapping[collectionType]?.[site]?.[tubeId] || ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"];
  }
}

const vialMapping = {
  'home': {
    'henryFordHealth': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'healthPartners': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'kpCO':{
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'kpGA': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'kpHI': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'kpNW': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'sanfordHealth': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'uOfChicagoMed': {
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    },
    'nci':{  // testing only
      '0007' : ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"]
    }
  }
}

const generateKitCSVData = (items) => {
  const csv = 'Study ID, Sample Collection Center, Sample ID, Sequence, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n';
  downloadCSVfile(items, csv, 'Kit-data-export');
}