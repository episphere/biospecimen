import { appState } from './shared.js';
import { specimenCollection } from './tubeValidation.js';
import { siteSpecificLocationToConceptId } from './shared.js';

import conceptIds from './fieldToConceptIdMapping.js';

/**
 * Update all shipping state variables in startShipping to provide access throughout the shipping dashboard
 * @param {object} availableCollectionsObj - the available specimen collections in the 'Available Collections' table
 * @param {array<string>} availableLocations - the list of locations for the healthcare provider
 * @param {array<object>} allBoxesList - the list of boxes for the healthcare provider
 * @param {object} detailedProviderBoxes - the list of boxes with bags and specimen data for the healthcare provider
 * @param {array} finalizedSpecimenList - the list of finalized specimens for the healthcare provider
 * @param {string} userName - the name of the logged in user
 */
export const setAllShippingState = (availableCollectionsObj, availableLocations, allBoxesList, /*boxesByLocationList, detailedProviderBoxes,*/ finalizedSpecimenList, userName, selectedLocation) => {

    const boxesByProviderList = filterUnshippedBoxes(allBoxesList);
    const boxesByLocationList = filterBoxesByLocation(boxesByProviderList, selectedLocation);
    //console.log('boxesByLocationList', boxesByLocationList);
    //const allBoxesObj = createBoxAndBagsObj(allBoxesList); // all boxes for the healthcare provider
    const providerBoxesObj = createBoxAndBagsObj(boxesByProviderList); // provider-specific data in the 'select boxes to ship' section
    const providerBoxWithSpecimenData = addSpecimenDataToDetailBox(providerBoxesObj, finalizedSpecimenList);
    const detailedProviderBoxes = addBoxDataToDetailBox(providerBoxWithSpecimenData, boxesByProviderList);
    //console.log('detailedProviderBoxes - startShipping', detailedProviderBoxes);
    //console.log('finalizedSpecimenList - startShipping', finalizedSpecimenList);

    appState.setState({
        availableCollectionsObj: availableCollectionsObj,
        availableLocations: availableLocations,
        allBoxesList: allBoxesList,
        boxesByLocationList: boxesByLocationList,
        detailedProviderBoxes: detailedProviderBoxes,
        finalizedSpecimenList: finalizedSpecimenList,
        userName: userName, //TODO handle this in available places
    });
}

/**
 * Update the state for allBoxesList and availableCollectionsObj.
 * Remove the bags from the box.
 * @param {string} boxId - the box with the bag to be removed.
 * @param {array} bagsToMove - the bags to be removed from the box. 
 */
export const updateShippingStateRemoveBagFromBox = (boxId, bagsToMove) => {
    console.log('updateShippingStateRemoveBag', boxId, bagsToMove);
    addBagToAvailableCollections(boxId, bagsToMove);
    removeBagFromBox(boxId, bagsToMove);
}

/**
 * Update the state for allBoxesList and availableCollectionsObj.
 * Add the bag to the box.
 * @param {string} boxId - the box with the bag to be added
 * @param {array} bagToMove - the bag to be added to the box
 */
export const updateShippingStateAddBagToBox = (boxId, bagToMove) => {
    console.log('updateShippingStateAddBag', boxId, bagToMove);
    addBagToBox(boxId, bagToMove);
    removeBagFromAvailableCollections(boxId, bagToMove);
}

/**
 * The bag is being removed from the box. Put it back in the availableCollectionsObj
 * Build the bag and specimen data from detailedProviderBoxes data: availableCollectionsObj[bagId]: ['tube1Id', 'tube2Id', 'tube3Id']
 * Isolate the last four digits of tubeId to match availableCollectionsObj format.
 * Move object into availableCollectionsObj
 * @param {*} boxId - the box with the bag being removed 
 * @param {*} bagsToMove - the bags being removed from the box
 */
const addBagToAvailableCollections = (boxId, bagsToMove) => {
    const availableCollectionsObj = appState.getState().availableCollectionsObj;
    const detailedProviderBoxes = appState.getState().detailedProviderBoxes;

    for (const bagId of bagsToMove) {
        const collectionToMove = detailedProviderBoxes[boxId][bagId].arrElements;
        const tubeIdArray = collectionToMove.map(tubeId => tubeId.slice(-4));

        availableCollectionsObj[bagId] = tubeIdArray;
    }

    appState.setState({
        availableCollectionsObj: {...availableCollectionsObj},
    });
}

const removeBagFromBox = (boxId, bagsToMove) => {
    const allBoxesList = appState.getState().allBoxesList;
    const boxIndex = allBoxesList.findIndex(box => box[conceptIds.shippingBoxId] === boxId);

    if (boxIndex !== -1) { 
        for (const bagId of bagsToMove) {
            delete allBoxesList[boxIndex].bags[bagId];
        }

        appState.setState({
            allBoxesList: [...allBoxesList],
        });
    }
}

const removeBagFromAvailableCollections = (boxId, bagsToMove) => {

}

const addBagToBox = (boxId, bagsToMove) => {

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

    appState.setState({ 
        allBoxesList: updatedAllBoxesList,
        boxesByLocationList: updatedBoxesByLocationList,
        detailedProviderBoxes: detailedProviderBoxes,
    });
}

// const addBagToB = (boxId, bagsToMove) => {
//     const allBoxesList = appState.getState().allBoxesList;
//     const boxIndex = allBoxesList.findIndex(box => box[conceptIds.shippingBoxId] === boxId);

//     if (boxIndex !== -1) { 
//         for (const bagId of bagsToMove) {
//             delete allBoxesList[boxIndex].bags[bagId];
//         }

//         appState.setState({
//             allBoxesList: [...allBoxesList],
//         });
//     }
// }

const filterUnshippedBoxes = (boxList) => {
    return boxList.filter(box => !box[conceptIds.submitShipmentFlag] || box[conceptIds.submitShipmentFlag] !== conceptIds.yes);
}

// retain for future use
const filterBoxesByLocation = (boxList, selectedLocation) => {
    console.log('filterBoxesByLocation', boxList, selectedLocation);
    if (selectedLocation === 'none') return [];
    const selectedLocationConceptId = siteSpecificLocationToConceptId[selectedLocation];
    return boxList.filter(box => box[conceptIds.shippingLocation] === selectedLocationConceptId);
}

const createBoxAndBagsObj = (boxList) => {
    return boxList.reduce((createdObj, boxInList) => {
        const boxId = boxInList[conceptIds.shippingBoxId];
        createdObj[boxId] = boxInList['bags'];

        return createdObj;
    }, {});
}

/**
 * Add specimen details to the box object. This is used in generateBoxManifest (and TODO future: shipping reports)
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
                    specimenDetails['collectionData'] = {};
                    specimenDetails['collectionData'][conceptIds.collection.id] = foundSpecimenDetailsBag[conceptIds.collection.id];
                    specimenDetails['collectionData'][conceptIds.healthcareProvider] = foundSpecimenDetailsBag[conceptIds.healthcareProvider];
                    specimenDetails['collectionData'][conceptIds.collectionLocation] = foundSpecimenDetailsBag[conceptIds.collectionLocation];
                    specimenDetails['collectionData'][conceptIds.collection.note] = foundSpecimenDetailsBag[conceptIds.collection.note];
                    for (let specimenId of bag.arrElements) {
                        const specimenKey = specimenCollection.numToCid[specimenId.split(' ')[1]];    
                        specimenDetails[specimenId] = foundSpecimenDetailsBag[specimenKey] ? foundSpecimenDetailsBag[specimenKey] : {};
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

        const boxData = {};
        boxData[conceptIds.firstBagAddedToBoxTimestamp] = boxInList[conceptIds.firstBagAddedToBoxTimestamp];
        boxData[conceptIds.shippingShipDateModify] = boxInList[conceptIds.shippingShipDateModify];
        boxData[conceptIds.shippingLocation] = boxInList[conceptIds.shippingLocation];
        boxData[conceptIds.loginSite] = boxInList[conceptIds.loginSite];
        boxData[conceptIds.containsOrphanFlag] = boxInList[conceptIds.containsOrphanFlag];
        boxData[conceptIds.shippingBoxId] = boxInList[conceptIds.shippingBoxId];
        boxData[conceptIds.submitShipmentFlag] = boxInList[conceptIds.submitShipmentFlag] ?? conceptIds.no;
        boxData[conceptIds.shippedByFirstName] = boxInList[conceptIds.shippedByFirstName] ?? '';
        boxData['siteAcronym'] = boxInList['siteAcronym'];

        boxAndBagsObj[boxObj]['boxData'] = boxData;
    }

    return boxAndBagsObj;
}
