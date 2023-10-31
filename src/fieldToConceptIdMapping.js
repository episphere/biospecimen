export default {
    firstName: 399159511,
    prefName: 153211406,
    middleName: 231676651,
    lastName: 996038075,
    birthMonth: 564964481,
    birthDay: 795827569,
    birthYear: 544150384,
    address1: 521824358,
    address2: 442166669,
    city: 703385619,
    state: 634434746,
    zip: 892050548,
    verficationDate: 914594314,
    submitShipmentFlag: 145971562,
    firstBagAddedToBoxTimestamp: 672863981,
    shippingShipDateModify: 555611076,
    shippingTrackingNumber: 959708259,
    shippingBoxId: 132929440,
    shippingLocation: 560975149,
    scannedByFirstName: 469819603,
    scannedByLastName: 618036638,
    shippedByFirstName: 948887825, //TODO: this is actually shipperEmail. Update all refs in next release (cleanup)
    shippedByLastName: 885486943, //TODO: this has been removed from the data dictionary remove in next release (cleanup)
    shipmentCourier: 666553960,
    "FedEx": 712278213,
    "World Courier": 149772928,

    shippingShipDate: 656548982,
    packageCondition: 238268405,
    coldPacksNone: 405513630,
    coldPacksInsufficient: 909529446,
    coldPacksWarm: 595987358,
    damagedContainer: 678483571,
    damagedVials: 387564837,
    improperPackaging: 847410060,
    manifestNotProvided: 853876696,
    manifestDoNotMatch: 922995819,
    noPreNotification: 842171722,
    participantRefusal: 442684673,
    shipmentDelay: 958000780,
    vialsEmpty: 631290535,
    vialsIncorrectMaterialType: 200183516,
    vialsMissingLabels: 399948893,
    other: 933646000,
    packageGood: 679749262,
    crushed: 121149986,
    materialThawed: 289322354, 
    noRefrigerant: 613022284,
    siteShipmentComments: 870456401,
    siteShipmentDateReceived: 926457119,
    siteShipmentReceived: 333524031,
    tempProbe: 105891443,
    yes: 353358909,
    no: 104430631,
    
    // collection id
    collectionId: 825582494,
    dateReceived: 926457119,
    dateWithdrawn: 678166505,
    collectionType: 650516960,
    research: 534621077,
    clinical: 664882224,
    loginSite: 789843387,
    healthcareProvider: 827220437,
    discardFlag: 762124027,
    deviationNotFound: 982885431,
    clinicalDateTimeDrawn: 915838974,

    // biospecimen collection
    collection: {
        id: 820476880,
        selectedVisit: 331584571,
        note: 338570265,
        isFinalized: 410912345,
        finalizedTime: 556788178,
        accessionId: 646899796,
        collectionSetting: 650516960,
        collectionTime: 678166505,
        scannedTime: 915838974,
        receivedDate: 926457119,
        urineAccessNumber: 928693120,
        reasonNotCollectedOther: 181769837,
        phlebotomistInitials: 719427591,
        mouthwashBagScan: 223999569,
        mouthwashTube1: 143615646,
        bloodUrineBagScan: 787237543,
        
        tube: {
            isCollected: 593843561,
            isMissing: 258745303,
            deviation: 248868659,
            isDeviated: 678857215,
            isDiscarded: 762124027,
            scannedId: 825582494,
            dateReceived: 926457119,
            deviationComments: 536710547,
            optionalNotCollectedDetails: 338286049,
            selectReasonNotCollected: 883732523,
        },

        deviationType: {
            broken: 472864016,
            insufficientVolume: 956345366,
            discard: 810960823,
            mislabel: 684617815,
            notFound: 982885431,
            other: 453343022,
        },
    },
    checkOutDateTime: 343048998,
    checkInDateTime: 840048338,

    // not shipped specimen deviation id
    brokenSpecimenDeviation: 472864016,
    discardSpecimenDeviation: 810960823,
    insufficientVolumeSpecimenDeviation: 956345366, 
    mislabelledDiscardSpecimenDeviation: 684617815,
    notFoundSpecimenDeviation: 982885431,

    // shipment id
    bag1: 650224161,
    bag2: 136341211,
    bag3: 503046679,
    bag4: 313341808,
    bag5: 668816010,
    bag6: 754614551,
    bag7: 174264982,
    bag8: 550020510,
    bag9: 673090642,
    bag10: 492881559,
    bag11: 536728814,
    bag12: 309413330,
    bag13: 357218702,
    bag14: 945294744,
    bag15: 741697447,
    bag16: 125739724,
    bag17: 989380048,
    bag18: 446995300,
    bag19: 137286816,
    bag20: 977670846,
    bag21: 563435337,
    bag22: 807530964,
    bag23: 898078094,
    bag24: 866824332,
    bag25: 456471969,
    bag26: 288387838,
    bag27: 335054951,
    bag28: 235683703,
    bag29: 390934489,
    bag30: 753716110,
    bag31: 669598671,
    bag32: 699864022,
    bag33: 986589527,
    bag34: 417623038,
    bag35: 725915890,
    bag36: 956354350,
    bag37: 925165180,
    bag38: 832614280,
    bag39: 301569492,
    bag40: 685888031,
    bagscan_bloodUrine: 787237543,
    bagscan_mouthWash: 223999569,
    bagscan_orphanBag: 522094118,
    orphanBagFlag: 255283733, // inside bag/container/ thing flag
    containsOrphanFlag: 842312685, // orphan flag for box 
    tubesCollected: 234868461,
    hpResearchClinic: 834825425,
    hfhs_mainCampus: 752948709,
    hfhs_westBloomfieldHospital: 570271641,
    hfhs_fairlane: 838480167,
    kpco_rrl: 763273112,
    kpga_rrl: 767775934,
    kphi_rrl: 531313956,
    kpnw_rrl: 715632875,
    marshfield: 692275326,
    sfCancerCenter: 589224449,
    dcam: 777644826,
    nci_mainCampus: 111111111,
    nci_frederick: 222222222,
    siteCode: 789843387,

    collectionLocation: 951355211,
    bloodCollectionSetting: 592099155,
    urineCollectionSetting: 718172863,
    mouthwashCollectionSetting: 915179629,

    modules: {
        module1: {
            status: 949302066
        },
        module2: {
            status: 536735468
        },
        module3: {
            status: 976570371
        },
        module4: {
            status: 663265240
        },

        notStarted: 972455046,
        started: 615768760,
        submitted: 231311385
    },

    REASON_NOT_COLLECTED: 883732523,
    REASONS: {
        PARTICIPANT_REFUSAL: 681745422
    },

    baseline: {
        visitId: 266600170,
        bloodCollected: 878865966,
        bloodCollectedTime: 561681068,
        urineCollected: 167958071,
        urineCollectedTime: 847159717,
        mouthwashCollected: 684635302,
        mouthwashCollectedTime: 448660695
    },

    collectionDetails: 173836415,

    clinicalDashboard: {
        bloodCollected: 534041351,
        bloodCollectedTime: 398645039,
        urineCollected: 210921343,
        urineCollectedTime: 541311218
    },

    anySpecimenCollected: 316824786,
    anySpecimenCollectedTime: 740582332,

    clinicalSite: {
        bloodCollected: 693370086
    },

    collectionLocationMapping: {
        777644826 : 'UC-DCAM',
        692275326 : 'Marshfield',
        813701399 : 'Weston',
        698283667 : 'Lake Hallie',
        834825425 : 'HP Research Clinic',
        736183094 : 'HFH K-13 Research Clinic',
        886364332 : 'HFH Cancer Pavilion Research Clinic',
        706927479 : 'HFH Livonia Research Clinic',
        589224449 : 'Sioux Falls Imagenetics',
        145191545 : 'Ingalls Harvey',
        489380324 : 'River East',
        319518299 : 'UCM Pop-Up',
        940329442 : 'Orland Park',
        567969985 : 'MF Pop-Up',
        120264574 : 'South Loop',
        691714762 : 'Rice Lake',
        487512085 : 'Wisconsin Rapids',
        983848564 : 'Colby Abbotsford',
        261931804 : 'Minocqua',
        665277300 : 'Merrill',
        111111111 : 'NIH/NCI',
        807835037 : 'Other'
    },

    nameToKeyObj : {
        'ucDcam': 777644826,
        'marshfield': 692275326,
        'weston': 813701399,
        'lakeHallie': 698283667,
        'hpRC': 834825425,
        'hfhKRC': 736183094,
        'hfhLRC': 706927479,
        'hfhPRC': 886364332,
        'sfImag': 589224449,
        'ingHar': 145191545,
        'rivEas': 489380324,
        'soLo': 120264574,
        'riLa': 691714762,
        'wisRapids': 487512085,
        'colAbb': 983848564,
        'mino': 261931804,
        'merr': 665277300,
        'nci': 111111111,
        'other': 807835037,
        "ucmPopUp": 319518299,
        "orPark": 940329442,
        "mfPopUp": 567969985,
        'all': 1000

    },
    boxedStatus: 771580890,
    notBoxed: 657483796,
    partiallyBoxed: 775512390,
    boxed: 210720511,
    strayTubesList: 742186726,

    // home collection
    supplyKitTrackingNum: 531858099,
    supplyKitId: 690210658,
    returnKitId: 194252513,
    collectionCupId: 259846815,
    collectionCardId: 786397882,
    UKID: 687158491,
    kitType: 379252329



};

