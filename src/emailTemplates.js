import { urls } from "./shared.js";

const getSupportUrls = () => {
    let appLocation = '';
    let supportLocation = '';

    if(location.host === urls.prod) {
        appLocation = "https://myconnect.cancer.gov/";
        supportLocation = "https://myconnect.cancer.gov/support";
    }
    else if(location.host === urls.stage) {
        appLocation = "https://myconnect-stage.cancer.gov/";
        supportLocation = "https://myconnect-stage.cancer.gov/support";
    }
    else {
        appLocation = "https://episphere.github.io/connectApp/";
        supportLocation = "https://episphere.github.io/connectApp/support";
    }
    return { appLocation, supportLocation }
}

const redactEmailLoginInfo = (participantEmail) => {
    const [prefix, domain] = participantEmail.split("@");
    const changedPrefix = prefix.length > 3
        ? prefix.slice(0, 2) + "*".repeat(prefix.length - 3) + prefix.slice(-1)
        : prefix.slice(0, -1) + "*";
    return changedPrefix + "@" + domain;
}

const redactPhoneLoginInfo = (participantPhone) => { return "***-***-" + participantPhone.slice(-4); }

export const baselineEmailTemplate = (data, isClinical) => {
    const { appLocation, supportLocation } = getSupportUrls();

    let loginDetails;
    const addLoginText = `Your login information for the MyConnect app is `
    
    if(data[995036844] === 'phone' && data[348474836]) {
        loginDetails = addLoginText + redactPhoneLoginInfo(data[348474836]) + `.`;
    }
    else if(data[995036844] === 'password' && data[421823980]) {
        loginDetails = addLoginText + redactEmailLoginInfo(data[421823980]) + `.`
    }
    else if(data[995036844] === 'passwordAndPhone' && data[421823980] && data[348474836]) {
        loginDetails = addLoginText + redactEmailLoginInfo(data[421823980]) + ` or ` + redactPhoneLoginInfo(data[348474836]) + `.`
    }
    return `
        Dear ${data['153211406'] || data['399159511']},
        <br/>
        <br/>
        Thank you for donating your samples for the Connect for Cancer Prevention Study! Next, please visit the <a href=${appLocation}>MyConnect app</a> to answer the ${isClinical ? 'Baseline Blood and Urine Sample Survey' : 'Baseline Blood, Urine, and Mouthwash Sample Survey'}. This short survey asks questions about the day that you donated samples, so it is important to complete it as soon as you can.
        <br/>
        <br/>
        A new survey about your experience with COVID-19 is also available on MyConnect. Please complete this survey as soon as you can.
        <br/>
        <br/>
        ${loginDetails} If you forgot your login information or have questions, please contact the <a href=${supportLocation}>Connect Support Center.</a>
       ${returnFooterTemplate()}
    `;
};

export const baselineMWSurveyRemainderTemplate = (ptName) => {
    const { appLocation, supportLocation } = getSupportUrls();
    return `
        Dear ${ptName || 'User'},
        <br/>
        <br/>
        Thank you for completing your mouthwash home collection kit! We have your sample. Next, please share some information about the day you collected your sample. Visit <a href=${appLocation}>MyConnect app</a> and log in using to complete a short survey. This survey asks questions about the day you collected your sample, so it is important to complete it as soon as you can.
        Have questions? Please contact the <a href=${supportLocation}>Connect Support Center.</a>
        ${returnFooterTemplate()}`
}

export const baselineMWKitRemainderTemplate = (ptName) => {
    const { appLocation, supportLocation } = getSupportUrls();
    return `
        Dear ${ptName || 'User'},
        <br/>
        <br/>
        The next step of your Connect participant experience is to collect a mouthwash (saliva) sample at home. We sent you a package with everything you will need to collect your sample. You can expect to get the kit in the next few days.
        <br/>
        <br/>
        When you get the kit, please follow the instructions inside to collect your mouthwash sample and complete your mouthwash sample survey.
        <br/>
        <br/>
        The mouthwash sample is an interesting new way to collect both human cells and microbial cells that are naturally shed in your mouth. Studying this sample may help researchers learn more about the causes of cancer, develop methods for detecting cancer early, and possibly conduct research on other health conditions.
        <br/>
        <br/>
        For more information about collecting your sample, visit <a href=${appLocation}>MyConnect app</a> Have questions? Please contact the <a href=${supportLocation}>Connect Support Center.</a>
        ${returnFooterTemplate()}`

}

const returnFooterTemplate = () => {
    return `<br/>
            <br/>
            Thank you for your commitment to helping us learn how to better prevent cancer.
            <br/>
            <br/>
            Sincerely,
            <br/>
            the Connect team at the National Cancer Institute
            <br/>
            9609 Medical Center Drive, Rockville MD 20850
            <br/>
            <img src="https://raw.githubusercontent.com/episphere/connectApp/master/images/new_logo.png" style="width:150px;height:40px;">
            <br/>
            <br/>
            <em>To protect your information, we follow federal privacy rules, including the <a href="https://www.justice.gov/archives/opcl/overview-privacy-act-1974-2015-edition">Privacy Act</a> and the <a href="https://grants.nih.gov/grants/guide/notice-files/NOT-OD-19-050.html">Common Rule</a>.</em>
            <br/>
            <br/>
            <em>This message is private. If you have received it by mistake, please let us know by emailing ConnectSupport@NORC.org, and please kindly delete the message. If you are not the right recipient, please do not share this message with anyone.</em>`
}