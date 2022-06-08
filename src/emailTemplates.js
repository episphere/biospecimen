import { urls } from "./shared.js";

export const baselineEmailTemplate = (data) => {
  
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

    return `
        Dear ${data['399159511']},
        <br/>
        <br/>
        Thank you for donating your samples for the Connect for Cancer Prevention Study! Next, please visit the <a href=${appLocation}>MyConnect app</a> to answer the Baseline Blood, Urine, and Mouthwash Sample Survey. This short survey asks questions about the day that you donated samples, so it is important to complete it as soon as you can.
        <br/>
        <br/>
        Have questions? Please contact the <a href=${supportLocation}>Connect Support Center.</a>
        <br/>
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
        <em>This message is private. If you have received it by mistake, please let us know by emailing ConnectSupport@NORC.org, and please kindly delete the message. If you are not the right recipient, please do not share this message with anyone.</em>
    `;
};