export const workflows = {
    research : [
        {
            'specimenType': 'Serum Separator Tube #1',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube1',
            'id': '0001'
        },
        {
            'specimenType': 'Serum Separator Tube #2',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube2',
            'id': '0002'
        },
        {
            'specimenType': 'Heparin Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'Heparin Tube',
            'image': './static/images/tube2.PNG',
            'name': 'tube3',
            'id': '0003'
        },
        {
            'specimenType': 'EDTA Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'EDTA Tube',
            'image': './static/images/tube3.PNG',
            'name': 'tube4',
            'id': '0004'
        },
        {
            'specimenType': 'ACD Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'ACD Tube',
            'image': './static/images/tube4.PNG',
            'name': 'tube5',
            'id': '0005'
        },
        {
            'specimenType': 'Urine Tube',
            'tubeType': 'Urine',
            'readableValue': 'Urine Tube',
            'name': 'tube6',
            'id': '0006'
        },
        {
            'specimenType': 'Mouthwash Container',
            'tubeType': 'Mouthwash',
            'readableValue': 'Mouthwash Container',
            'name': 'tube7',
            'id': '0007'
        },
        {
            'specimenType': 'Biohazard bag for blood/urine',
            'tubeType': 'Biohazard bag for blood/urine',
            'readableValue': 'Biohazard bag - blood/urine',
            'name': 'tube8',
            'id': '0008'
        },
        {
            'specimenType': 'Biohazard bag for mouthwash',
            'tubeType': 'Biohazard bag for mouthwash',
            'readableValue': 'Biohazard bag - mouthwash',
            'name': 'tube9',
            'id': '0009'
        }
    ],
    clinical : [
        {
            'specimenType': 'Serum Separator Tube #1',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube1',
            'id': '0001'   
        },
        {
            'specimenType': 'Serum Separator Tube #2',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube2',
            'id': '0002'
        },
        {
            'specimenType': 'Additional Serum Separator Tube #1',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube11',
            'id': '0011'
        },
        {
            'specimenType': 'Additional Serum Separator Tube #2',
            'tubeType': 'Blood tube',
            'readableValue': 'Serum Separator Tube',
            'image': './static/images/tube1.PNG',
            'name': 'tube12',
            'id': '0012'
        },
        {
            'specimenType': 'Heparin Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'Heparin Tube',
            'image': './static/images/tube2.PNG',
            'name': 'tube3',
            'id': '0003'
        },
        {
            'specimenType': 'Additional Heparin Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'Heparin Tube',
            'image': './static/images/tube2.PNG',
            'name': 'tube13',
            'id': '0013'
        },
        {
            'specimenType': 'EDTA Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'EDTA Tube',
            'image': './static/images/tube3.PNG',
            'name': 'tube4',
            'id': '0004'
        },
        {
            'specimenType': 'Additional EDTA Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'EDTA Tube',
            'image': './static/images/tube3.PNG',
            'name': 'tube14',
            'id': '0014'
        },
        {
            'specimenType': 'ACD Tube',
            'tubeType': 'Blood tube',
            'readableValue': 'ACD Tube',
            'image': './static/images/tube4.PNG',
            'name': 'tube5',
            'id': '0005'
        },
        {
            'specimenType': 'Biohazard bag for blood',
            'tubeType': 'Biohazard bag for blood',
            'readableValue': 'Biohazard bag - blood',
            'image': '',
            'name': 'tube8',
            'id': '0008'
        }
    ]
};



export const siteSpecificTubeRequirements = {
    'UCM': workflows.research,
    'NCI': workflows.research,
    'SFH': workflows.research,
    'HFHS': workflows.research,
    'HP': workflows.research,
    'MFC': workflows.research,
    'KPCO': workflows.clinical,
    'KPNW': workflows.clinical,
    'KPGA': workflows.clinical,
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
    regExp: /^00+5[0-4]$/,
    length: 4
}
