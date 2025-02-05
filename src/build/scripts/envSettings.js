const fsExtra = require('fs-extra');

function createEnvSettingsFile(settingsFile) {
    fsExtra.ensureFile(settingsFile).then((f) => {
        fsExtra.writeFileSync(
            settingsFile,
            `window.appSettings = {
                APP_VERSION: '${process.env.APP_VERSION}',
                REST_API_URL: '${process.env.FORELDREPENGESOKNAD_API_URL}',
                UTTAK_API_URL: '${process.env.FP_UTTAK_SERVICE_URL}',
                LOGIN_URL: '${process.env.LOGINSERVICE_URL}',
                FEATURE_LOGGING:  '${process.env.FEATURE_LOGGING}',
                FEATURE_VIS_PERIODER_SOM_SENDES_INN:  '${process.env.FEATURE_VIS_PERIODER_SOM_SENDES_INN}',
                FEATURE_VIS_INFOSKRIV:  '${process.env.FEATURE_VIS_INFOSKRIV}',
            };`
        );
    });
}
module.exports = createEnvSettingsFile;
