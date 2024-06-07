export const prodSSOConfig = (tenantID, provider, inputValue) => {
    if (/nih.gov/i.test(inputValue)) {
        tenantID = 'NIH-SSO-wthvn';
        provider = 'saml.nih-sso';
    };
    if (/healthpartners.com/i.test(inputValue)) {
        tenantID = 'HP-SSO-252sf';
        provider = 'saml.healthpartner';
    }
    if (/sanfordhealth.org/i.test(inputValue)) {
        tenantID = 'SFH-SSO-pb390';
        provider = 'saml.connect-sanford';
    }
    if (/norc.org/i.test(inputValue)) {
        tenantID = 'NORC-SSO-nwvau';
        provider = 'saml.connect-norc-prod';
    }
    if (/kp.org/i.test(inputValue)) {
        tenantID = 'KP-SSO-ii9sr';
        provider = 'saml.connect-kp';
    }
    if (/uchicago.edu/i.test(inputValue)) {
        tenantID = 'UCM-SSO-p4f5m';
        provider = 'saml.connect-uchicago';
    }
    if (/hfhs.org/i.test(inputValue)) {
        tenantID = 'HFHS-SSO-lo99j';
        provider = 'saml.connect-hfhs';
    }
    if (/marshfieldresearch.org/i.test(inputValue) || /marshfieldclinic.org/i.test(inputValue)) {
        tenantID = 'MFC-SSO-tdj17';
        provider = 'saml.connect-mfc'
    }
    if (/bswhealth.org/i.test(inputValue)) {
        tenantID = 'BSWH-SSO-dcoos';
        provider = 'saml.connect-bswh';
    }

    return {tenantID, provider}
}