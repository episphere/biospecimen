export const stageSSOConfig = (tenantID, provider, inputValue) => {
    if(/nih.gov/i.test(inputValue)) {
        tenantID = 'NIH-SSO-9q2ao';
        provider = 'saml.nih-sso';
    };
    if(/healthpartners.com/i.test(inputValue)) {
        tenantID = 'HP-SSO-1elez';
        provider = 'saml.healthpartner';
    };
    if(/sanfordhealth.org/i.test(inputValue)) {
        tenantID = 'SFH-SSO-uetfo';
        provider = 'saml.connect-sanford';
    };
    if(/norc.org/i.test(inputValue)) {
        tenantID = 'NORC-SSO-l80az';
        provider = 'saml.connect-norc';
    };
    if(/kp.org/i.test(inputValue)) {
        tenantID = 'KP-SSO-ssj7c';
        provider = 'saml.connect-kp';
    };
    if(/uchicago.edu/i.test(inputValue)) {
        tenantID = 'UCM-SSO-lrjsp';
        provider = 'saml.connect-uchicago';
    };
    if(/hfhs.org/i.test(inputValue)) {
        tenantID = 'HFHS-SSO-eq1fj';
        provider = 'saml.connect-hfhs';
    };
    return {tenantID, provider}
}