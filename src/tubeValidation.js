const deviationReason1 = {'concept': 472864016, 'label':'Broken (discard do not ship)'}
const deviationReason2 = {'concept': 102695484, 'label':'Cent. clotted <30 minutes'}
const deviationReason3 = {'concept': 912088602, 'label':'Cent. clotted >2 hours'}
const deviationReason4 = {'concept': 861162895, 'label':'Cent. speed/force too high'}
const deviationReason5 = {'concept': 561005927, 'label':'Cent. speed/force too low'}
const deviationReason6 = {'concept': 654002184, 'label':'Cent. spin time too long'}
const deviationReason7 = {'concept': 937362785, 'label':'Cent. spin time too short'}
const deviationReason8 = {'concept': 635875253, 'label':'Gel layer failed/broken'}
const deviationReason9 = {'concept': 242307474, 'label':'Hemolysis present'}
const deviationReason10 = {'concept': 550088682, 'label':'Low Temp/frozen (Temp in comments)'}
const deviationReason11 = {'concept': 690540566, 'label':'High Temp (Temp in comments)'}
const deviationReason12 = {'concept': 956345366, 'label':'Insufficient volume, discard'}
const deviationReason13 = {'concept': 757246707, 'label':'Leaked/spilled'}
const deviationReason14 = {'concept': 728366619, 'label':'Low Volume'}
const deviationReason15 = {'concept': 684617815, 'label':'Mislabeled - discard'}
const deviationReason16 = {'concept': 453343022, 'label':'Other (record in comments)'}
const deviationReason17 = {'concept': 810960823, 'label': 'Discard (record in comments)'}
const deviationReason18 = {'concept': 777486216, 'label': 'Unexpected tube size or type'}
const deviationReason19 = {'concept': 283900611, 'label': 'Mislabeled - resolved'}
const deviationReason20 = {'concept': 982885431, 'label': 'Not found'}
const deviationReason21 = {'concept': 313097539, 'label': 'Outside of tube contaminated'}
const deviationReason22 = {'concept': 742806035, 'label': 'Less than 30 seconds'}

const deviationCollection1 = [deviationReason1, deviationReason2, deviationReason3, deviationReason4, deviationReason5, deviationReason6, deviationReason7, deviationReason8, deviationReason9, deviationReason10, deviationReason11, deviationReason13, deviationReason14, deviationReason15, deviationReason16, deviationReason17, deviationReason18, deviationReason19, deviationReason20, deviationReason21];
const deviationCollection2 = [deviationReason1, deviationReason9, deviationReason10, deviationReason11, deviationReason13, deviationReason14, deviationReason15, deviationReason16, deviationReason17, deviationReason18, deviationReason19, deviationReason20, deviationReason21];
const deviationCollection3 = [deviationReason1, deviationReason10, deviationReason11, deviationReason12, deviationReason13, deviationReason14, deviationReason15, deviationReason16, deviationReason19, deviationReason20, deviationReason21];
const deviationCollection4 = [deviationReason1, deviationReason13, deviationReason14, deviationReason15, deviationReason16, deviationReason19, deviationReason20, deviationReason21, deviationReason22];

const tubeNotCollectedReason1 = {'concept': 234139565, 'label': 'Short draw'};
const tubeNotCollectedReason2 = {'concept': 681745422, 'label': 'Participant refusal'};
const tubeNotCollectedReason3 = {'concept': 745205161, 'label': 'Participant attempted'};
const tubeNotCollectedReason4 = {'concept': 181769837, 'label': 'Other (record in comments)'};
const tubeNotCollectedReason5 = {'concept': 889386523, 'label': 'Supply Unavailable'};

const tubeNotCollectedOptions1 = [tubeNotCollectedReason1, tubeNotCollectedReason2, tubeNotCollectedReason3, tubeNotCollectedReason5, tubeNotCollectedReason4];
const tubeNotCollectedOptions2 = [tubeNotCollectedReason2, tubeNotCollectedReason3, tubeNotCollectedReason5, tubeNotCollectedReason4];

export const refusedShippingDeviationConceptList = [deviationReason1.concept, deviationReason12.concept,deviationReason15.concept, deviationReason17.concept, deviationReason20.concept];

export const specimenCollection = {
  numToCid: {
    '0001': '299553921',
    '0002': '703954371',
    '0003': '838567176',
    '0004': '454453939',
    '0005': '652357376',
    '0006': '973670172',
    '0007': '143615646',
    '0008': '787237543',
    '0009': '223999569',
    '0011': '376960806',
    '0012': '232343615',
    '0021': '589588440',
    '0013': '958646668',
    '0014': '677469051',
    '0024': '683613884',
  },
  cidToNum: {
    299553921: '0001',
    703954371: '0002',
    838567176: '0003',
    454453939: '0004',
    652357376: '0005',
    973670172: '0006',
    143615646: '0007',
    787237543: '0008',
    223999569: '0009',
    376960806: '0011',
    232343615: '0012',
    589588440: '0021',
    958646668: '0013',
    677469051: '0014',
    683613884: '0024',
  },
  tubeNumList: [
    '0001',
    '0002',
    '0003',
    '0004',
    '0005',
    '0006',
    '0007',
    // '0008' and '0009' are used as containers for tubes
    '0011',
    '0012',
    '0021',
    '0013',
    '0014',
    '0024',
  ],
  tubeCidList: [
    '299553921',
    '703954371',
    '838567176',
    '454453939',
    '652357376',
    '973670172',
    '143615646',
    // '787237543' and '223999569' are used as containers for tubes
    '376960806',
    '232343615',
    '589588440',
    '958646668',
    '677469051',
    '683613884',
  ],
};

const tube0001 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube1',
    'concept': specimenCollection.numToCid['0001'],
    'id': '0001',
    'tubeColor': 'Gold',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection1,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0002 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube2',
    'concept': specimenCollection.numToCid['0002'],
    'id': '0002',
    'tubeColor': 'Gold',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection1,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0011 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube11',
    'concept': specimenCollection.numToCid['0011'],
    'id': '0011',
    'tubeColor': 'Gold',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection1,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0012 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube12',
    'concept': specimenCollection.numToCid['0012'],
    'id': '0012',
    'tubeColor': 'Gold',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection1,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0021 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube21',
    'concept': specimenCollection.numToCid['0021'],
    'id': '0021',
    'tubeColor': 'Gold',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection1,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0003 = {
    'specimenType': 'Heparin Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Heparin Tube',
    'image': './static/images/tube2.PNG',
    'name': 'tube3',
    'concept': specimenCollection.numToCid['0003'],
    'id': '0003',
    'tubeColor': 'Green',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0013 = {
    'specimenType': 'Heparin Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Heparin Tube',
    'image': './static/images/tube2.PNG',
    'name': 'tube13',
    'concept': specimenCollection.numToCid['0013'],
    'id': '0013',
    'tubeColor': 'Green',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0004 = {
    'specimenType': 'EDTA Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'EDTA Tube',
    'image': './static/images/tube3.PNG',
    'name': 'tube4',
    'concept': specimenCollection.numToCid['0004'],
    'id': '0004',
    'tubeColor': 'Lavendar',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0014 = {
    'specimenType': 'EDTA Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'EDTA Tube',
    'image': './static/images/tube3.PNG',
    'name': 'tube14',
    'concept': specimenCollection.numToCid['0014'],
    'id': '0014',
    'tubeColor': 'Lavendar',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0024 = {
    'specimenType': 'EDTA Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'EDTA Tube',
    'image': './static/images/tube3.PNG',
    'name': 'tube24',
    'concept': specimenCollection.numToCid['0024'],
    'id': '0024',
    'tubeColor': 'Lavendar',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0005 = {
    'specimenType': 'ACD Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'ACD Tube',
    'image': './static/images/tube4.PNG',
    'name': 'tube5',
    'concept': specimenCollection.numToCid['0005'],
    'id': '0005',
    'tubeColor': 'Yellow',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0006 = {
    'specimenType': 'Urine Tube/Container',
    'tubeType': 'Urine',
    'readableValue': 'Urine Tube/Container',
    'name': 'tube6',
    'concept': specimenCollection.numToCid['0006'],
    'id': '0006',
    'tubeColor': 'Yellow',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection3,
    'tubeNotCollectedOptions': tubeNotCollectedOptions2
};

const tube0007 = {
    'specimenType': 'Mouthwash Container',
    'tubeType': 'Mouthwash',
    'readableValue': 'Mouthwash Container',
    'name': 'tube7',
    'concept': specimenCollection.numToCid['0007'],
    'id': '0007',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection4,
    'tubeNotCollectedOptions': tubeNotCollectedOptions2
};

const tube0008 = {
    'specimenType': 'Biohazard bag blood/urine',
    'tubeType': 'Biohazard bag for blood',
    'readableValue': 'Biohazard bag - blood',
    'image': '',
    'name': 'tube8',
    'concept': specimenCollection.numToCid['0008'],
    'id': '0008',
    'collectionChkBox': true,
    'deviationChkBox': false
};

const tube0009 = {
    'specimenType': 'Biohazard bag mouthwash',
    'tubeType': 'Biohazard bag for mouthwash',
    'readableValue': 'Biohazard bag - mouthwash',
    'name': 'tube9',
    'concept': specimenCollection.numToCid['0009'],
    'id': '0009',
    'collectionChkBox': true,
    'deviationChkBox': false
};

export const workflows = {
    research : [
        tube0001,
        tube0002,
        tube0003,
        tube0004,
        tube0005,
        tube0006,
        tube0007,
        tube0008,
        tube0009
    ],
    clinical : [
        tube0001,
        tube0002,
        tube0011,
        tube0012,
        tube0021,
        tube0003,
        tube0013,
        tube0004,
        tube0014,
        tube0024,
        tube0005,
        tube0006,
        tube0008
    ]
};

export const siteSpecificTubeRequirements = {
    'UCM': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'NIH': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'SFH': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'HFHS': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'HP': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'MFC': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'KPCO': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'KPNW': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'KPGA': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'KPHI': {
        'research': workflows.research,
        'clinical': workflows.clinical
    }
}

export const totalCollectionIDLength = 14;

// Collection ID eg: CAX123456
export const masterSpecimenIDRequirement = {
    regExp: /^CX[A-Z]{1}[0-9]{6}$/,
    length: 9
}

// Additional labels between 0050 - 0054
export const additionalTubeIDRequirement = {
    regExp: /^00+5[0-4]$/,
    length: 4
}

export const tubes = [
  tube0001,
  tube0002,
  tube0003,
  tube0004,
  tube0005,
  tube0006,
  tube0007,
  tube0008,
  tube0009,
  tube0011,
  tube0012,
  tube0013,
  tube0014,
  tube0021,
  tube0024,
];


export const getTubesToConceptsMap = () => ({ ...specimenCollection.numToCid });

export const getConceptsToTubesMap = () => ({ ...specimenCollection.cidToNum });

export const getTubeList = () => {
  return tubes.map((tube) => tube.id);
};

export const getConceptList = () => {
  return tubes.map((tube) => tube.concept);
};

const getUniqueDeviationReasonsList = () => {
    const sumDeviationCollections = [...deviationCollection1, ...deviationCollection2, ...deviationCollection3, ...deviationCollection4];
    const seenConcepts = new Set();
    
    return sumDeviationCollections.filter( deviationCollection => {
        if(seenConcepts.has(deviationCollection.concept)) return false;
        else {
            seenConcepts.add(deviationCollection.concept)
            return true;
        }
    })
}
export const deviationReasons = getUniqueDeviationReasonsList();