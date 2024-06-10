export const stageSSOConfig = (email) => { 
    const ssoConfigs = [
        { tenantID: 'NIH-SSO-9q2ao', provider: 'saml.nih-sso', regex: /nih.gov/i },
        { tenantID: 'HP-SSO-1elez', provider: 'saml.healthpartner', regex: /healthpartners.com/i },
        { tenantID: 'HFHS-SSO-eq1fj', provider: 'saml.connect-hfhs', regex: /hfhs.org/i },
        { tenantID: 'SFH-SSO-uetfo', provider: 'saml.connect-sanford', regex: /sanfordhealth.org/i },
        { tenantID: 'UCM-SSO-lrjsp', provider: 'saml.connect-uchicago', regex: /uchicago.edu/i },
        { tenantID: 'NORC-SSO-l80az', provider: 'saml.connect-norc', regex: /norc.org/i },
        { tenantID: 'KP-SSO-ssj7c', provider: 'saml.connect-kp', regex: /kp.org/i },
        { tenantID: 'MFC-SSO-6x4zy', provider: 'saml.connect-mfc', regex: /(marshfieldresearch.org|marshfieldclinic.org)/i },
        { tenantID: 'BSWH-SSO-k4cat', provider: 'saml.connect-bswh', regex: /bswhealth.org/i }
    ];

    for (const ssoConfig of ssoConfigs) {
        if (ssoConfig.regex.test(email)) {
            return { tenantID: ssoConfig.tenantID, provider: ssoConfig.provider };
        }
    }
    
    return { tenantID: '', provider: '' };
}