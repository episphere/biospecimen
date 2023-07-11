tubesCollected.forEach((tube) => {
    if (biospecimenData[tube.id] === undefined) biospecimenData[`${tube.id}`] = {};
    if (biospecimenData[tube.id] && biospecimenData[tube.id]['593843561'] === 353358909 && tube.checked === false) { // collected exists in biospecimen obj and check false
        // biospecimenData[tube.id] = {}; // Original Code
        delete biospecimenData[tube.id][conceptIds.collection.tube.scannedId]; // Tony's code ********** // DELETES OBJECT ID from obj 
    }
    biospecimenData[tube.id]['593843561'] = tube.checked ? 353358909 : 104430631; // changes status of tube "CXA489330 0008"
    const reason = document.getElementById(tube.id + 'Reason');
    const deviated = document.getElementById(tube.id + 'Deviated');
    const deviation = document.getElementById(tube.id + 'Deviation');
    const comment = document.getElementById(tube.id + 'DeviatedExplanation');
    if(reason) { // reason dropdown
        if(reason.value) {
            biospecimenData[tube.id]['883732523'] = parseInt(reason.value); // Select reason tube was not collected
            biospecimenData[tube.id]['338286049'] = comment.value.trim(); // Not collected details (Comments)
            if(biospecimenData[tube.id]['883732523'] === 181769837 && !comment.value.trim()) { // Reason Not Collected (Other) - comments are needed
                hasError = true;
                errorMessage(comment.id, 'Please provide more details', focus);
                focus = false;
                return
            }
        }
        else {
            delete biospecimenData[tube.id]['883732523'];
            delete biospecimenData[tube.id]['338286049'];
        }
    }
    // 787237543 -- 0007
    // 223999569 -- 0009
    
    if(deviated) { // select for deviated checkbox
        if(deviated.checked) {
            biospecimenData[tube.id]['678857215'] = 353358909; // Deviation flag
            biospecimenData[tube.id]['536710547'] = comment.value.trim(); // Provide Deviation Details
        }
        else {
            biospecimenData[tube.id]['678857215'] = 104430631;
            delete biospecimenData[tube.id]['536710547'];
        }

        const tubeData = siteTubesList.filter(td => td.concept === tube.id)[0];
        console.log("🚀 ~ file: events.js:2652 ~ tubesCollected.forEach ~ tubeData:", tube,"----",tubeData)
        // if(tube.id == "703954371" || tube.id == "838567176") { /*DEBUGGING HERE*/
        //     let array = Array.from(deviation)
        //     let filter = Array.from(deviation).filter(dev => dev.selected && dev.selected.value)
        //     console.log("filter --- ", array, filter)
        // }
        const deviationSelections = Array.from(deviation).filter(dev => dev.selected).map(dev => parseInt(dev.value));
        // const deviationSelections = Array.from(deviation).filter(dev => dev.selected && dev.selected.value).map(dev => parseInt(dev.value));
        console.log("🚀 ~ file: events.js:2654 ~ tubesCollected.forEach ~ deviationSelections:", tube, "----",deviationSelections)

        /*
        Break occurs because option.concept does not exist
        Solution: Add back deviations by using the deviations file
        1. Check if current biospecimen[tube.id] has this key "248868659" (Proceed with steps below if not found)
        2. Reference tubeData place all the deviation selections with a default no
        3. Use existing code to check for existing (Yes/No) values in the deviationSelections array for current specimen
        4. Should there be a check for other 

        */
        if(tubeData.deviationOptions) { // Where saving has problems for the editable cells in the first two columns with input fields
            // console.log("biospecimenData breaks after", tube.id,"--",biospecimenData, "--")
            // console.log("tubeData.deviationOptions", tubeData.deviationOptions)
            /*
            Determine if {'0008': '787237543'} and {'0009': '223999569'} check is needed to continue to add the following deviations key 
            */
            // if(!["787237543","223999569"].includes(biospecimenData[tube.id]) && !biospecimenData[tube.id].hasOwnProperty("248868659")) { // Adds deviation concepts to 
            //     // loop over
            //     const deviationObj = {};
            //     const tubeDeviationOptions = tubeData.deviationOptions;
            //     for(const tube of tubeDeviationOptions) {
            //         deviationObj[tube.concept] = 104430631; // set value to default no
            //     }
            //     biospecimenData[tube.id]['248868659'] = deviationObj;
            // }
            tubeData.deviationOptions.forEach(option => {
                // if(tube.id == "703954371" || tube.id == "838567176") {
                // }
                biospecimenData[tube.id]['248868659'][option.concept] = (deviationSelections.indexOf(option.concept) != -1 ? 353358909 : 104430631);
            });
        }
        // If any of the deviations types are found make deviation flag yes
        // 762124027 discard flag
        biospecimenData[tube.id]['762124027'] = (biospecimenData[tube.id]['248868659']['472864016'] === 353358909 || biospecimenData[tube.id]['248868659']['956345366'] === 353358909 || biospecimenData[tube.id]['248868659']['810960823'] === 353358909 || biospecimenData[tube.id]['248868659']['684617815'] === 353358909) ? 353358909 : 104430631;

        if (biospecimenData[tube.id]['248868659']['453343022'] === 353358909 && !comment.value.trim()) { // Deviation- Other / no comment value
            hasError = true;
            errorMessage(comment.id, 'Please provide more details', focus);
            focus = false;
            return
        }
    }
});
if (hasError) return;

// console.log("This is before the return statement")
// return // remove later
biospecimenData['338570265'] = document.getElementById('collectionAdditionalNotes').value;
if (cntd) {
    if (getWorkflow() === 'clinical') {
        if (biospecimenData['915838974'] === undefined) biospecimenData['915838974'] = new Date().toISOString();
    }
    if (getWorkflow() === 'research') {
        let initials = document.getElementById('collectionInitials')
        if(initials && initials.value.trim().length == 0) {
            errorMessage(initials.id, 'This field is required. Please enter the phlebotomist\'s initials.', focus);
            focus = false;
            return;
        }
        else {
            biospecimenData['719427591'] = initials.value.trim();
        }
    }
}
// console.log("Completed Before HTTP REQUESTS!")
// return
showAnimation();
// console.log("biospecimenData", biospecimenData)
await updateSpecimen([biospecimenData]); // Updates biospecimenData obj and passes to firestore to update changes (Done)

const baselineVisit = (biospecimenData['331584571'] === 266600170); // Select visit to baseline
const clinicalResearchSetting = (biospecimenData['650516960'] === 534621077 || biospecimenData['650516960'] === 664882224); // Collection setting -> Research or clinical
await updateCollectionSettingData(biospecimenData, siteTubesList, formData);
if(baselineVisit && clinicalResearchSetting) {
    await updateBaselineData(siteTubesList, formData); // done checking
}
await checkDerivedVariables({"token": formData["token"]}); // done checking
if (cntd) {
    formData = await getUpdatedParticipantData(formData);
    const specimenData = (await searchSpecimen(biospecimenData['820476880'])).data;
    hideAnimation();
    finalizeTemplate(formData, specimenData);
}
else {
    // Things get updated on the backend but not on the frontend but input fields states don't get updated.
    // Might need to do the checks before this swal or somewhere else??? 
    // As long as a tube was not collected and finalized add back the edit button
    await swal({
        title: "Success",
        icon: "success",
        text: "Collection specimen data has been saved",
        buttons: {
            close: {
                text: "Close",
                value: "close",
                visible: true,
                className: "btn btn-success",
                closeModal: true,
            }
        },
    });
    hideAnimation();
}




// 331584571.266600170.135591601
/*
Self-Checklist
getWorkflow()
Understand Sample Collected Check all - addEventSelectAllCollection() [DONE]
Understand Save button function
Understand Edit button function - addEventBiospecimenCollectionFormEdit(); [DONE]
Understand Edit All button function - addEventBiospecimenCollectionFormEditAll(; [DONE]
Understand Go to Review button

CXA441336's tube CXA441336 0053 (not editable, not finalized)
- EDITABLE Collection ID's - 
CXA658070
CXA489330 
CXA441336 

Disabled/Enabled inputs when saving 
<td>${tubeCollected && !collectionFinalized ? `
<button 
    class="btn btn-outline-primary" 
    type="button" 
    id="${obj.concept}collectEditBtn">
    Edit
</button>` 
: ``}


*/

/*
tubeCollectedTemplate Cids 

996038075 - lastName
399159511 - firstName
820476880 - collection.tube.isCollected
678166505 - collectionTime
719427591 - phlebotomistInitials
331584571 - selectVisit
410912345 - isFinalized
593843561 - Object Collected
883732523 - selectReasonNotCollected
338286049 - notCollectedDetails



678857215 - isDeviated
331584571 - selectVisit
951355211 - collectionLocation
825582494 - Object ID

915838974 - clinicalDateTimeDrawn
266600170 - baselineVisit
719427591 - phlebotomistInitials
650516960 - collectionSetting
534621077 - Research
664882224 - Clinical
592099155 - bloodCollectionSetting

*/

/*

Tubes

CXA489330 - Partial collection; Not finalized; Not shipped
	
CXA742008 - Partial collection; Finalized; Not shipped
	
CXA441336 - Partial collection; Finalized; Shipped
	
CXA658070 - Complete collection; Not finalized, Not shipped
	
CXA200478 - Complete collection; Finalized; Not shipped
	
CXA885225 - Complete collection; Finalized; Shipped

*/

/*
check these fetch requests going to backend

updateSpecimen - done
updateCollectionSettingData - done 
updateBaselineData - done (similar to updateColelctionSettingData) has POST request
checkDerivedVariables

finalizeTemplate [for contd]  -

~~~~ Difference between the flows of saving on Collection Data Entry page and go to review saving

Check Biospecimen document status of (410912345 - isFinalized) --> yes (353358909) or no (104430631)

*/ 

/*
Check All -> Reason Not Collected ->  Scan Full Specimen Id-> Select For Deviation  --> Deviation Type --> Comments
# --> #Reason --> #Id --> #Deviated --> #Deviation --> #DeviatedExplanation 
*/ 

/*
Note: Having a value in Reason Not Collected does not disable (Scan Full Specimen Id, Select For Deviation, Deviation Type)

Note: Able to change finalize auto generated timestamp where timestamp is already given and all tubes are collected [556788178] changed

Note: Check All button where all check tubes are checked and enabled, press check all again to toggle all tubes to unchecked and disabled (Kind of important)

Expected to have all checkboxes unchecked and inputs, 0009 collected checkbox stays checked
Also, previous selected deviation type selected gets cleared but the comments get enabled

Note: Related to above "Note 3" why how does comments get enabled? (Safety measure?)
593843561 must be no for it to be enabled


Note: No safeguards for going to the "Go to Review page" and finalizing when no collected tubes checked
safeguards only when 0008 is not filled out in the input and one of the blood/urine tubes are checked

When 0001 is finalized but 0008 is not finalized, 0001 can be added on the shipping dashboard 

*/

/*
TODO: Make comments enabled when deviation checked and Deviation type selected has value
*/ 


/*
TEST PLAN FOR FINALIZED TUBES 

1. GET a collection ID that has tubes that are not finalized 
2. Take note of the object that is not finalized
3. Go to the finalized template, finalized tube and save
4. Go to the Collection Data Entry page, check if the object is finalized
5. Also check and compare old and new values of the object (Note: There should be isFinalized - 410912345, with value 353358909 - Yes)


Edit All Button should only enable if edit button exists
Edit All only enables first 4, select for deviation should enable comments if checked

Questions:

What happens when you click review complete and the collection is already complete?

EXTRA: 
Add handling for deviation checklist being checked and deviation being enabled


*/

//==================================================================================================================
// DETERMINE HOW EDIT BUTTON RENDERS FOR CERTAIN ROWS

/* biospecimen Data */
/*
obj = {
    "143615646": {
        "248868659": {
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "684617815": 104430631,
            "728366619": 104430631,
            "742806035": 353358909,
            "757246707": 104430631,
            "982885431": 104430631
        },
        "536710547": "",
        "593843561": 353358909,
        "678857215": 353358909,
        "762124027": 104430631,
        "825582494": "CXA658070 0007"
    },
    "223999569": {
        "593843561": 353358909,
        "825582494": "CXA658070 0009"
    },
    "299553921": {
        "248868659": {
            "102695484": 353358909,
            "242307474": 104430631,
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 104430631,
            "561005927": 104430631,
            "635875253": 104430631,
            "654002184": 104430631,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "777486216": 104430631,
            "810960823": 104430631,
            "861162895": 104430631,
            "912088602": 104430631,
            "937362785": 104430631,
            "982885431": 104430631
        },
        "536710547": "",
        "593843561": 353358909,
        "678857215": 353358909,
        "762124027": 104430631,
        "825582494": "CXA658070 0001"
    },
    "331584571": 266600170,
    "338570265": "",
    "454453939": {
        "248868659": {
            "242307474": 104430631,
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 104430631,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "777486216": 104430631,
            "810960823": 104430631,
            "982885431": 104430631
        },
        "593843561": 353358909,
        "678857215": 104430631,
        "762124027": 104430631,
        "825582494": "CXA658070 0004"
    },
    "650516960": 534621077,
    "652357376": {
        "248868659": {
            "242307474": 104430631,
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 104430631,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "777486216": 104430631,
            "810960823": 104430631,
            "982885431": 104430631
        },
        "593843561": 353358909,
        "678857215": 104430631,
        "762124027": 104430631,
        "825582494": "CXA658070 0005"
    },
    "678166505": "2023-04-07T15:28:14.798Z",
    "703954371": {
        "248868659": {
            "102695484": 353358909,
            "242307474": 353358909,
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 353358909,
            "561005927": 353358909,
            "635875253": 353358909,
            "654002184": 353358909,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "777486216": 104430631,
            "810960823": 104430631,
            "861162895": 353358909,
            "912088602": 353358909,
            "937362785": 353358909,
            "982885431": 104430631
        },
        "536710547": "",
        "593843561": 353358909,
        "678857215": 353358909,
        "762124027": 104430631,
        "825582494": "CXA658070 0002"
    },
    "719427591": "GB",
    "787237543": {
        "593843561": 353358909,
        "825582494": "CXA658070 0008"
    },
    "820476880": "CXA658070",
    "827220437": 13,
    "838567176": {
        "248868659": {
            "242307474": 104430631,
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 104430631,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "777486216": 104430631,
            "810960823": 104430631,
            "982885431": 104430631
        },
        "593843561": 353358909,
        "678857215": 104430631,
        "762124027": 104430631,
        "825582494": "CXA658070 0003"
    },
    "951355211": 111111111,
    "973670172": {
        "248868659": {
            "283900611": 104430631,
            "313097539": 104430631,
            "453343022": 104430631,
            "472864016": 104430631,
            "550088682": 104430631,
            "684617815": 104430631,
            "690540566": 104430631,
            "728366619": 104430631,
            "757246707": 104430631,
            "956345366": 104430631,
            "982885431": 104430631
        },
        "593843561": 353358909,
        "678857215": 104430631,
        "762124027": 104430631,
        "825582494": "CXA658070 0006"
    },
    "Connect_ID": 7525826043,
    "siteAcronym": "NIH",
    "id": "25c35e8a-8f1d-4e43-b178-8dc218c49942",
    "token": "bcb953fa-b34e-4a90-9a63-8a71555479c9"
}
*/