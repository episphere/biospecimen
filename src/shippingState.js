import { appState } from './shared.js';
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
export const setAllShippingState = (availableCollectionsObj, availableLocations, allBoxesList, detailedProviderBoxes, finalizedSpecimenList, userName) => {
    appState.setState({
        availableCollectionsObj: availableCollectionsObj,
        availableLocations: availableLocations,
        allBoxesList: allBoxesList,
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
