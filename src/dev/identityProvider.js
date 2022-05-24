export const devSSOConfig = (tenantID, provider, inputValue) => {
    if(/nih.gov/i.test(inputValue)) {
        tenantID = 'NIH-SSO-qfszp';
        provider = 'saml.nih-sso';
    };
    if(/healthpartners.com/i.test(inputValue)) {
        tenantID = 'HP-SSO-wb1zb';
        provider = 'saml.healthpartner';
    };
    if(/hfhs.org/i.test(inputValue)) {
        tenantID = 'HFHS-SSO-ay0iz';
        provider = 'saml.connect-hfhs';
    };
    if(/sanfordhealth.org/i.test(inputValue)) {
        tenantID = 'SFH-SSO-cgzpj';
        provider = 'saml.connect-sanford';
    };
    if(/uchicago.edu/i.test(inputValue)) {
        tenantID = 'UCM-SSO-tovai';
        provider = 'saml.connect-uchicago';
    };
    if(/norc.org/i.test(inputValue)) {
        tenantID = 'NORC-SSO-dilvf';
        provider = 'saml.connect-norc';
    };
    if(/kp.org/i.test(inputValue)) {
        tenantID = 'KP-SSO-wulix';
        provider = 'saml.connect-kp';
    };
    if(/marshfieldresearch.org/i.test(inputValue) || /marshfieldclinic.org/i.test(inputValue)) {
        tenantID = 'MFC-SSO-fljvd';
        provider = 'saml.connect-mfc'
    };
    return {tenantID, provider}
}