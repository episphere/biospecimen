const deviationReason1 = {'concept': 472864016, 'label':'Broken'}
const deviationReason2 = {'concept': 102695484, 'label':'Centrifuge - did not clot at least 30 minutes'}
const deviationReason3 = {'concept': 912088602, 'label':'Centrifuge - clotted for longer than 2 hours'}
const deviationReason4 = {'concept': 861162895, 'label':'Centrifuge - speed/force too high'}
const deviationReason5 = {'concept': 561005927, 'label':'Centrifuge - speed/force too low'}
const deviationReason6 = {'concept': 654002184, 'label':'Centrifuge - improper time of spinning (too long)'}
const deviationReason7 = {'concept': 937362785, 'label':'Centrifuge - improper time of spinning (too short)'}
const deviationReason8 = {'concept': 635875253, 'label':'Failed/broken gel layer'}
const deviationReason9 = {'concept': 242307474, 'label':'Hemolyzed'}
const deviationReason10 = {'concept': 550088682, 'label':'Temp too low/frozen (put lowest temp & duration in comments)'}
const deviationReason11 = {'concept': 690540566, 'label':'Temp too high (put highest temp & duration in comments)'}
const deviationReason12 = {'concept': 956345366, 'label':'Insufficient volume - not enough volume to transfer to urine tube (discard)'}
const deviationReason13 = {'concept': 757246707, 'label':'Leaked/spilled'}
const deviationReason14 = {'concept': 728366619, 'label':'Low volume - (tube/container partially filled but still usable)'}
const deviationReason15 = {'concept': 806820884, 'label':'Mislabeled'}
const deviationReason16 = {'concept': 453343022, 'label':'Other'}

const deviationCollection1 = [deviationReason1, deviationReason2, deviationReason3, deviationReason4, deviationReason5, deviationReason6, deviationReason7, deviationReason8, deviationReason9, deviationReason10, deviationReason11, deviationReason13, deviationReason14, deviationReason15, deviationReason16];
const deviationCollection2 = [deviationReason1, deviationReason9, deviationReason10, deviationReason11, deviationReason13, deviationReason14, deviationReason15, deviationReason16];
const deviationCollection3 = [deviationReason1, deviationReason10, deviationReason11, deviationReason12, deviationReason13, deviationReason14, deviationReason15, deviationReason16];
const deviationCollection4 = [deviationReason1, deviationReason13, deviationReason14, deviationReason15, deviationReason16];

const tubeNotCollectedReason1 = {'concept': 234139565, 'label': 'Short draw'};
const tubeNotCollectedReason2 = {'concept': 681745422, 'label': 'Participant refusal'};
const tubeNotCollectedReason3 = {'concept': 745205161, 'label': 'Participant unable'};
const tubeNotCollectedReason4 = {'concept': 181769837, 'label': 'Other'};

const tubeNotCollectedOptions1 = [tubeNotCollectedReason1, tubeNotCollectedReason2, tubeNotCollectedReason3, tubeNotCollectedReason4];
const tubeNotCollectedOptions2 = [tubeNotCollectedReason2, tubeNotCollectedReason3, tubeNotCollectedReason4];

const tube0001 = {
    'specimenType': 'Serum Separator Tube',
    'tubeType': 'Blood tube',
    'readableValue': 'Serum Separator Tube',
    'image': './static/images/tube1.PNG',
    'name': 'tube1',
    'concept': '299553921',
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
    'concept': '703954371',
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
    'concept': '376960806',
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
    'concept': '232343615',
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
    'concept': '589588440',
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
    'concept': '838567176',
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
    'concept': '958646668',
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
    'concept': '454453939',
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
    'concept': '677469051',
    'id': '0014',
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
    'concept': '652357376',
    'id': '0005',
    'tubeColor': 'Yellow',
    'collectionChkBox': true,
    'deviationChkBox': true,
    'deviationOptions': deviationCollection2,
    'tubeNotCollectedOptions': tubeNotCollectedOptions1
};

const tube0006 = {
    'specimenType': 'Urine Tube',
    'tubeType': 'Urine',
    'readableValue': 'Urine Tube',
    'name': 'tube6',
    'concept': '973670172',
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
    'concept': '143615646',
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
    'concept': '787237543',
    'id': '0008',
    'collectionChkBox': false,
    'deviationChkBox': false
};

const tube0009 = {
    'specimenType': 'Biohazard bag mouthwash',
    'tubeType': 'Biohazard bag for mouthwash',
    'readableValue': 'Biohazard bag - mouthwash',
    'name': 'tube9',
    'concept': '223999569',
    'id': '0009',
    'collectionChkBox': false,
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
        tube0003,
        tube0013,
        tube0004,
        tube0014,
        tube0005,
        tube0008
    ]
};

export const siteSpecificTubeRequirements = {
    'UCM': {
        'research': workflows.research,
        'clinical': workflows.clinical
    },
    'NCI': {
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
