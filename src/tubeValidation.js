const researchCollections = {
    '0001': {
        'specimenType': 'Serum Separator Tube #1',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0002': {
        'specimenType': 'Serum Separator Tube #2',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0003': {
        'specimenType': 'Heparin Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'Heparin Tube',
        'image': './static/images/tube2.PNG'
    },
    '0004': {
        'specimenType': 'EDTA Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'EDTA Tube',
        'image': './static/images/tube3.PNG'
    },
    '0005': {
        'specimenType': 'ACD Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'ACD Tube',
        'image': './static/images/tube4.PNG'
    },
    '0006': {
        'specimenType': 'Urine Tube',
        'tubeType': 'Urine',
        'readableValue': 'Urine Tube'
    },
    '0007': {
        'specimenType': 'Mouthwash Container',
        'tubeType': 'Mouthwash',
        'readableValue': 'Mouthwash Container'
    },
    '0008': {
        'specimenType': 'Biohazard bag for blood/urine',
        'tubeType': 'Biohazard bag for blood/urine',
        'readableValue': 'Biohazard bag - blood/urine'
    },
    '0009': {
        'specimenType': 'Biohazard bag for mouthwash',
        'tubeType': 'Biohazard bag for mouthwash',
        'readableValue': 'Biohazard bag - mouthwash'
    }
};

const clinicalCollections = {
    '0001': {
        'specimenType': 'Serum Separator Tube #1',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0002': {
        'specimenType': 'Serum Separator Tube #2',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0011': {
        'specimenType': 'Additional Serum Separator Tube #1',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0012': {
        'specimenType': 'Additional Serum Separator Tube #2',
        'tubeType': 'Blood tube',
        'readableValue': 'Serum Separator Tube',
        'image': './static/images/tube1.PNG'
    },
    '0003': {
        'specimenType': 'Heparin Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'Heparin Tube',
        'image': './static/images/tube2.PNG'
    },
    '0013': {
        'specimenType': 'Additional Heparin Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'Heparin Tube',
        'image': './static/images/tube2.PNG'
    },
    '0004': {
        'specimenType': 'EDTA Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'EDTA Tube',
        'image': './static/images/tube3.PNG'
    },
    '0014': {
        'specimenType': 'Additional EDTA Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'EDTA Tube',
        'image': './static/images/tube3.PNG'
    },
    '0005': {
        'specimenType': 'ACD Tube',
        'tubeType': 'Blood tube',
        'readableValue': 'ACD Tube',
        'image': './static/images/tube4.PNG'
    },
    '0008': {
        'specimenType': 'Biohazard bag for blood',
        'tubeType': 'Biohazard bag for blood',
        'readableValue': 'Biohazard bag - blood'
    }
}

export const siteSpecificTubeRequirements = {
    'UCM': researchCollections,
    'NCI': researchCollections,
    'SFH': researchCollections,
    'HFHS': researchCollections,
    'HP': researchCollections,
    'MFC': researchCollections,
    'KPCO': clinicalCollections,
    'KPNW': clinicalCollections,
    'KPGA': clinicalCollections,
    'KPHI': {
        'Oahu': {},
        'non-Oahu': {}
    }
}

// master specimen id eg: CAX123456
export const masterSpecimenIDRequirement = {
    regExp: /^CXA+[0-9]{6}$/,
    length: 9
}

// Additional labels between 0050 - 0054
export const additionalTubeIDRequirement = {
    regExp: /^[00]{2}5[0-4]$/,
    length: 4
}
