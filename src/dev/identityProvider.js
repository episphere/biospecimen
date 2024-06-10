export const devSSOConfig = (email) => { 
    const ssoConfigs = [
        { tenantID: 'NIH-SSO-qfszp', provider: 'saml.nih-sso', regex: /nih.gov/i },
        { tenantID: 'HP-SSO-wb1zb', provider: 'saml.healthpartner', regex: /healthpartners.com/i },
        { tenantID: 'HFHS-SSO-ay0iz', provider: 'saml.connect-hfhs', regex: /hfhs.org/i },
        { tenantID: 'SFH-SSO-cgzpj', provider: 'saml.connect-sanford', regex: /sanfordhealth.org/i },
        { tenantID: 'UCM-SSO-tovai', provider: 'saml.connect-uchicago', regex: /uchicago.edu/i },
        { tenantID: 'NORC-SSO-dilvf', provider: 'saml.connect-norc', regex: /norc.org/i },
        { tenantID: 'KP-SSO-wulix', provider: 'saml.connect-kp', regex: /kp.org/i },
        { tenantID: 'MFC-SSO-fljvd', provider: 'saml.connect-mfc', regex: /(marshfieldresearch.org|marshfieldclinic.org)/i },
        { tenantID: 'BSWH-SSO-y2jj3', provider: 'saml.connect-bswh', regex: /bswhealth.org/i }
    ];

    for (const ssoConfig of ssoConfigs) {
        if (ssoConfig.regex.test(email)) {
            return { tenantID: ssoConfig.tenantID, provider: ssoConfig.provider };
        }
    }
    return { tenantID: '', provider: '' };
}