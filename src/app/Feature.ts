import Environment from './Environment';

export enum Feature {
    logging = 'FEATURE_LOGGING',
    visPerioderSomSendesInn = 'FEATURE_VIS_PERIODER_SOM_SENDES_INN'
    /** Nye features må også registreres i ./Environment */
}

export const isFeatureEnabled = (feature: Feature): boolean => {
    if (Environment[feature] && Environment[feature].toLowerCase() === 'on') {
        return true;
    }
    return false;
};
