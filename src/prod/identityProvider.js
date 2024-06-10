export const prodSSOConfig = (email) => { 
    const ssoConfigs = [
        { tenantID: 'NIH-SSO-wthvn', provider: 'saml.nih-sso', regex: /nih.gov/i },
        { tenantID: 'HP-SSO-252sf', provider: 'saml.healthpartner', regex: /healthpartners.com/i },
        { tenantID: 'SFH-SSO-pb390', provider: 'saml.connect-sanford', regex: /sanfordhealth.org/i },
        { tenantID: 'NORC-SSO-nwvau', provider: 'saml.connect-norc-prod', regex: /norc.org/i },
        { tenantID: 'KP-SSO-ii9sr', provider: 'saml.connect-kp', regex: /kp.org/i },
        { tenantID: 'UCM-SSO-p4f5m', provider: 'saml.connect-uchicago', regex: /uchicago.edu/i },
        { tenantID: 'HFHS-SSO-lo99j', provider: 'saml.connect-hfhs', regex: /hfhs.org/i },
        { tenantID: 'MFC-SSO-tdj17', provider: 'saml.connect-mfc', regex: /(marshfieldresearch.org | marshfieldclinic.org)/i },
        { tenantID: 'BSWH-SSO-dcoos', provider: 'saml.connect-bswh', regex: /bswhealth.org/i }
    ];

    for (const ssoConfig of ssoConfigs) {
        if (ssoConfig.regex.test(email)) {
            return { tenantID: ssoConfig.tenantID, provider: ssoConfig.provider };
        }
    }
    
    return { tenantID: '', provider: '' };
}