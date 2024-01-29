import { appState, getSiteAcronym, siteSpecificLocationToConceptId } from './shared.js';
import { specimenCollection } from './tubeValidation.js';
import { conceptIds } from './fieldToConceptIdMapping.js';

/**
 * Update all shipping state variables in startShipping to provide access throughout the shipping dashboard
 * @param {object} availableCollectionsObj - the available specimen collections in the 'Available Collections' table
 * @param {array<string>} availableLocations - the list of locations for the healthcare provider
 * @param {array<object>} allBoxesList - the list of boxes for the healthcare provider
 * @param {array} finalizedSpecimenList - the list of finalized specimens for the healthcare provider
 * @param {string} userName - the name of the logged in user
 */
export const setAllShippingState = (availableCollectionsObj, availableLocations, allBoxesList, finalizedSpecimenList, userName, replacementTubeLabelObj) => {
    const boxesByProviderList = filterUnshippedBoxes(allBoxesList);
    const boxesByLocationList = filterBoxListBoxesByLocation(boxesByProviderList);
    const providerBoxesObj = createBoxAndBagsObj(boxesByProviderList);
    const providerBoxWithSpecimenData = addSpecimenDataToDetailBox(providerBoxesObj, finalizedSpecimenList);
    const detailedProviderBoxes = addBoxDataToDetailBox(providerBoxWithSpecimenData, boxesByProviderList);
    const detailedLocationBoxes = filterDetailBoxesByLocation(detailedProviderBoxes);

    appState.setState({
        allBoxesList: allBoxesList,
        availableCollectionsObj: availableCollectionsObj ?? {},
        availableLocations: availableLocations,
        boxesByLocationList: boxesByLocationList,
        detailedLocationBoxes: detailedLocationBoxes,
        detailedProviderBoxes: detailedProviderBoxes,
        finalizedSpecimenList: finalizedSpecimenList,
        userName: userName,
        replacementTubeLabelObj: replacementTubeLabelObj
    });
}

export const updateShippingStateSelectedLocation = (selectedLocation) => {
    appState.setState({ selectedLocation: selectedLocation });

    const detailedProviderBoxes = appState.getState().detailedProviderBoxes;
    const detailedLocationBoxes = filterDetailBoxesByLocation(detailedProviderBoxes);

    appState.setState({ detailedLocationBoxes: detailedLocationBoxes });
}

/**
 * Update the state for allBoxesList and availableCollectionsObj.
 * Remove the bags from the box.
 * Note: 'unlabelled' bags are stray tubes. They do not get added back to availableCollectionsObj.
 * @param {string} boxId - the box with the bag to be removed.
 * @param {array} bagsToMove - the bags to be removed from the box.
 * @param {object} removeBagResponse - the response array from the remove bag function
 */
export const updateShippingStateRemoveBagFromBox = (boxId, bagId, bagsToMove, removeBagResponse) => {
    addBagToAvailableCollections(boxId, bagId, bagsToMove);
    removeBagFromBox(boxId, bagId, bagsToMove);
    updateFinalizedSpecimenList(removeBagResponse);
}

/**
 * Update the state for allBoxesList and availableCollectionsObj.
 * Add the bag to the box.
 * @param {string} boxId - the boxId of the bag to be added
 * @param {array} bagId - the bagId to be added to the box
 * @param {object} boxToUpdate - the box object to be updated
 * @param {object} updateBoxResponse - the response object from the update box function
 */
export const updateShippingStateAddBagToBox = (boxId, bagId, boxToUpdate, updateBoxResponse) => {
    addBagToBox(boxId, bagId, boxToUpdate);
    removeBagFromAvailableCollections(bagId);
    updateFinalizedSpecimenList([updateBoxResponse]);
}

/**
 * The bag is being removed from the box. Put it back in the availableCollectionsObj
 * Build the bag and specimen data from detailedProviderBoxes data: availableCollectionsObj[bagId]: ['tube1Id', 'tube2Id', 'tube3Id']
 * Isolate the last four digits of tubeId to match availableCollectionsObj format.
 * Move object into availableCollectionsObj
 * If object is 'unlabelled', it is a stray and it belongs in the 'unlabelled' section of availableCollectionsObj.
 * @param {*} boxId - the box with the bag being removed 
 * @param {*} bagsToMove - the bags being removed from the box
 */
const addBagToAvailableCollections = (boxId, bagId, bagsToMove) => {
    const availableCollectionsObj = appState.getState().availableCollectionsObj;
    const detailedProviderBoxes = appState.getState().detailedProviderBoxes;

    if (bagId === 'unlabelled') {
        const collectionToMove = detailedProviderBoxes[boxId]['unlabelled'].arrElements;
        availableCollectionsObj['unlabelled'].push(...collectionToMove);
    } else {
        for (const bagLabel of bagsToMove) {
            const collectionToMove = detailedProviderBoxes[boxId][bagLabel].arrElements;
            const tubeIdArray = collectionToMove.map(tubeId => tubeId.slice(-4));
    
            availableCollectionsObj[bagLabel] = tubeIdArray;
        }
    }
    
    appState.setState({ availableCollectionsObj });
}

// Remove the bag from the box when user has clicked 'remove bag' in the 'View Shipping Box Contents' table.
const removeBagFromBox = (boxId, bagId, bagsToMove) => {
    const allBoxesList = appState.getState().allBoxesList;
    const boxIndex = allBoxesList.findIndex(box => box[conceptIds.shippingBoxId] === boxId);

    if (boxIndex !== -1) { 
        if (bagId === 'unlabelled') {
            bagsToMove = ['unlabelled'];
        }

        bagsToMove.forEach(bagLabel => {
            delete allBoxesList[boxIndex].bags[bagLabel];
        });

        appState.setState({
            allBoxesList: [...allBoxesList],
        });
    }
}

// Remove the bag from the availableCollectionsObj when it has been added to a box.
// Check if bagId is a direct key in availableCollectionsObj. If not, check if it's and element in the 'unlabelled' array.
const removeBagFromAvailableCollections = (bagId) => {
    const availableCollectionsObj = appState.getState().availableCollectionsObj;

    if (bagId in availableCollectionsObj) {
        delete availableCollectionsObj[bagId];
    } else if (availableCollectionsObj['unlabelled'] && availableCollectionsObj['unlabelled'].includes(bagId)) {
        availableCollectionsObj['unlabelled'] = availableCollectionsObj['unlabelled'].filter(id => id !== bagId);
    }

    appState.setState({ availableCollectionsObj: availableCollectionsObj });
}

// Replace the previous box with the updated box when a bag is added.
// If an existing box is not found, add it to the list.
const addBagToBox = (boxId, bagId, boxToUpdate) => {
    let allBoxesList = [...appState.getState().allBoxesList];
    const availableCollectionsObj = appState.getState().availableCollectionsObj;

    allBoxesList = allBoxesList.map(box => 
        box[conceptIds.shippingBoxId] === boxId ? boxToUpdate : box
    );

    if (!allBoxesList.some(box => box[conceptIds.shippingBoxId] === boxId)) {
        allBoxesList.push(boxToUpdate);
    }

    const strayTubesToAdd = getStrayTubesFromUncheckedModalBoxes(boxToUpdate, bagId);

    if (strayTubesToAdd.length > 0) {
        if (!availableCollectionsObj['unlabelled']) {
            availableCollectionsObj['unlabelled'] = [];
        }
        availableCollectionsObj['unlabelled'].push(...strayTubesToAdd);
    }

    appState.setState({
        allBoxesList,
        availableCollectionsObj
    });
}

const getStrayTubesFromUncheckedModalBoxes = (boxToUpdate, bagId) => {
    const availableCollectionsObj = appState.getState().availableCollectionsObj;
    const tubesInBoxArray = (boxToUpdate.bags[bagId]?.arrElements ?? []).map(tubeId => tubeId.slice(-4));
    if (tubesInBoxArray.length === 0) return [];
    const tubesInAvailableCollectionsList = availableCollectionsObj[bagId];
    const strayTubesForCurrentCollection = tubesInAvailableCollectionsList.filter(tube => !tubesInBoxArray.includes(tube));
    return [...strayTubesForCurrentCollection.map(tubeId => `${bagId.split(' ')[0]} ${tubeId}`)];
}

export const updateShippingStateCreateBox = (boxToAdd) => {
    const boxList = appState.getState().allBoxesList;
    const boxesByLocationList = appState.getState().boxesByLocationList;
    const finalizedSpecimenList = appState.getState().finalizedSpecimenList;

    const updatedAllBoxesList = [...boxList, boxToAdd];
    const updatedBoxesByLocationList = [...boxesByLocationList, boxToAdd]; 
    const locationBoxesObj = createBoxAndBagsObj(updatedBoxesByLocationList); // provider-specific data in the 'select boxes to ship' section
    const locationBoxWithSpecimenData = addSpecimenDataToDetailBox(locationBoxesObj, finalizedSpecimenList);
    const detailedProviderBoxes = addBoxDataToDetailBox(locationBoxWithSpecimenData, updatedBoxesByLocationList);
    const detailedLocationBoxes = filterDetailBoxesByLocation(detailedProviderBoxes);

    appState.setState({ 
        allBoxesList: updatedAllBoxesList,
        boxesByLocationList: updatedBoxesByLocationList,
        detailedLocationBoxes: detailedLocationBoxes,
        detailedProviderBoxes: detailedProviderBoxes,
    });
}

/**
 * Update the finalizedSpecimenList state for changes in boxedStatus and strayTubesList after updateBox and removeBag operations.
 * @param {array<object>} specimenData - the list of specimen update objects to be updated in the finalizedSpecimenList. Properties in each object: { collectionId, boxedStatus, strayTubesList }. 
 */
const updateFinalizedSpecimenList = (specimenData) => {
    const finalizedSpecimenList = appState.getState().finalizedSpecimenList;

    for (let specimen of specimenData) {
        const specimenToUpdate = finalizedSpecimenList.find(specimenInList => specimenInList[conceptIds.collection.id] === specimen[conceptIds.collection.id]);

        if (specimenToUpdate) {
            const updatedSpecimen = { ...specimen };
            delete updatedSpecimen[conceptIds.collection.id];
            Object.assign(specimenToUpdate, updatedSpecimen);
        }
    }

    appState.setState({ finalizedSpecimenList });
}

const filterUnshippedBoxes = (boxList) => {
    return boxList.filter(box => box[conceptIds.submitShipmentFlag] !== conceptIds.yes);
}

const filterDetailBoxesByLocation = (detailedProviderBoxes) => {
    const selectedLocation = appState.getState().selectedLocation;
    const detailedLocationBoxes = { ...detailedProviderBoxes };

    if (selectedLocation === 'none') return {};
    const selectedLocationConceptId = siteSpecificLocationToConceptId[selectedLocation];

    for (let boxKey in detailedLocationBoxes) {
        if (!detailedLocationBoxes[boxKey].boxData || detailedLocationBoxes[boxKey].boxData[conceptIds.shippingLocation] !== selectedLocationConceptId) {
            delete detailedLocationBoxes[boxKey];
        }
    }

    return detailedLocationBoxes;
}

const filterBoxListBoxesByLocation = (boxList) => {
    const selectedLocation = appState.getState().selectedLocation;
    if (selectedLocation === 'none') return [];
    const selectedLocationConceptId = siteSpecificLocationToConceptId[selectedLocation];
    return boxList.filter(box => box[conceptIds.shippingLocation] === selectedLocationConceptId);
}

const createBoxAndBagsObj = (boxList) => {
    return boxList.reduce((createdObj, boxInList) => {
        const boxId = boxInList[conceptIds.shippingBoxId];
        const bags = { ...boxInList['bags'] };

        delete bags['undefined'];

        if (boxId) {
            createdObj[boxId] = bags;
        }

        return createdObj;
    }, {});
}

/**
 * Add specimen details to the box object. This is used in generateBoxManifest.
 * @param {object} boxAndBagsObj - the basic box object with bag ids and tube ids (arrElements)
 * @param {object} finalizedSpecimenList - the list of specimen data where finalized === true
 * @returns {object} - the box object with specimen details added
 * iterate through the box object, focusing on each bag in the box.
 * for each bag, find the specimen bag id (first element in the arrElements array)
 * find the specimen details for that specimen bag id in the finalizedSpecimenList
 * add the specimen details to the box object (collectionId, healthcareProvider, collectionLocation, collection.note, and detailed specimen data for each specimenId in arrElements)
 */
const addSpecimenDataToDetailBox = (boxAndBagsObj, finalizedSpecimenList) => {
    const specimenBagLookup = finalizedSpecimenList.reduce((acc, specimen) => {
        acc[specimen[conceptIds.collection.id]] = specimen;
        return acc;
    }, {});
    
    for (let boxObj in boxAndBagsObj) {
        const box = boxAndBagsObj[boxObj];
        for (let bagId in box) {
            const bag = box[bagId];
            const specimenDetails = boxAndBagsObj[boxObj][bagId]['specimenDetails'] = {};
            if (bag.arrElements && bag.arrElements.length > 0) {
                const specimenBagId = bag.arrElements[0].split(' ')[0];
                const foundSpecimenDetailsBag = specimenBagLookup[specimenBagId];
                if (foundSpecimenDetailsBag) {
                    specimenDetails['collectionData'] = {
                        [conceptIds.collection.id]: foundSpecimenDetailsBag[conceptIds.collection.id],
                        [conceptIds.healthcareProvider]: foundSpecimenDetailsBag[conceptIds.healthcareProvider],
                        [conceptIds.collectionLocation]: foundSpecimenDetailsBag[conceptIds.collectionLocation],
                        [conceptIds.collection.note]: foundSpecimenDetailsBag[conceptIds.collection.note],
                        [conceptIds.boxedStatus]: foundSpecimenDetailsBag[conceptIds.boxedStatus],
                        [conceptIds.strayTubesList]: foundSpecimenDetailsBag[conceptIds.strayTubesList],
                    };
                    
                    for (let specimenId of bag.arrElements) {
                        const specimenKey = specimenCollection.numToCid[specimenId.split(' ')[1]];    
                        specimenDetails[specimenId] = foundSpecimenDetailsBag[specimenKey] ?? {};
                    }
                }
            }
            boxAndBagsObj[boxObj][bagId]['specimenDetails'] = specimenDetails;
        }
    }

    return boxAndBagsObj;
}

const addBoxDataToDetailBox = (boxAndBagsObj, boxList) => {
    const boxListLookup = boxList.reduce((acc, box) => {
        acc[box[conceptIds.shippingBoxId]] = box;
        return acc;
    }, {});

    for (let boxObj in boxAndBagsObj) {
        const boxInList = boxListLookup[boxObj];

        const boxData = {
            [conceptIds.firstBagAddedToBoxTimestamp]: boxInList[conceptIds.firstBagAddedToBoxTimestamp],
            [conceptIds.shippingShipDateModify]: boxInList[conceptIds.shippingShipDateModify],
            [conceptIds.shippingLocation]: boxInList[conceptIds.shippingLocation],
            [conceptIds.loginSite]: boxInList[conceptIds.loginSite],
            [conceptIds.containsOrphanFlag]: boxInList[conceptIds.containsOrphanFlag],
            [conceptIds.shippingBoxId]: boxInList[conceptIds.shippingBoxId],
            [conceptIds.submitShipmentFlag]: boxInList[conceptIds.submitShipmentFlag] ?? conceptIds.no,
            [conceptIds.siteShipmentReceived]: boxInList[conceptIds.siteShipmentReceived] ?? conceptIds.no,
            [conceptIds.shippedByFirstName]: boxInList[conceptIds.shippedByFirstName] ?? '',
            'siteAcronym': boxInList['siteAcronym'] || getSiteAcronym(),
        };

        boxAndBagsObj[boxObj]['boxData'] = boxData;
    }

    return boxAndBagsObj;
}
