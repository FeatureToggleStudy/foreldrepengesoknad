import axios from 'axios';
import { SøknadForInnsending } from '../types/søknad/Søknad';
import Environment from '../../app/Environment';
import { AppState } from '../redux/reducers';
import { storageParser } from '../util/storage/parser';
import { formaterDato, formaterStønadskontoParamsDatoer } from 'common/util/datoUtils';
import { StorageKvittering } from '../types/StorageKvittering';
import AxiosInstance from './apiInterceptor';

export interface GetTilgjengeligeStønadskontoerParams {
    antallBarn: number;
    morHarRett: boolean;
    farHarRett: boolean;
    dekningsgrad: '100' | '80';
    termindato?: Date;
    fødselsdato?: Date;
    omsorgsovertakelsesdato?: Date;
    morHarAleneomsorg?: boolean;
    farHarAleneomsorg?: boolean;
    startdatoUttak: Date;
}

const uttakBaseUrl = Environment.UTTAK_API_URL;
const sendSøknadUrl = '/soknad';
const sendEndringssøknadUrl = '/soknad/endre';

function getSøkerinfo() {
    return AxiosInstance.get('/sokerinfo');
}

const getSaker = () => {
    return AxiosInstance.get('/innsyn/saker');
};

const getEksisterendeSak = (saksnummer: string) => {
    return AxiosInstance.get('/innsyn/uttaksplan', {
        withCredentials: true,
        params: { saksnummer }
    });
};

const getEksisterendeSakMedFnr = (fnr: string) => {
    return AxiosInstance.get('/innsyn/uttaksplanannen', {
        params: { annenPart: fnr }
    });
};

function getUttakskontoer(params: GetTilgjengeligeStønadskontoerParams) {
    const {
        antallBarn,
        farHarRett,
        morHarRett,
        dekningsgrad,
        fødselsdato,
        termindato,
        omsorgsovertakelsesdato,
        morHarAleneomsorg,
        farHarAleneomsorg,
        startdatoUttak
    } = params;

    const urlParams = {
        farHarRett,
        morHarRett,
        morHarAleneomsorg: morHarAleneomsorg || false,
        farHarAleneomsorg: farHarAleneomsorg || false,
        dekningsgrad,
        antallBarn,
        fødselsdato: formaterStønadskontoParamsDatoer(fødselsdato, 'YYYYMMDD'),
        termindato: formaterStønadskontoParamsDatoer(termindato, 'YYYYMMDD'),
        omsorgsovertakelseDato: formaterStønadskontoParamsDatoer(omsorgsovertakelsesdato, 'YYYYMMDD'),
        startdatoUttak: formaterDato(startdatoUttak, 'YYYYMMDD')
    };

    return axios.get(`${uttakBaseUrl}/konto`, {
        timeout: 15 * 1000,
        params: urlParams
    });
}

function sendSøknad(søknad: SøknadForInnsending) {
    const url = søknad.erEndringssøknad ? sendEndringssøknadUrl : sendSøknadUrl;

    return AxiosInstance.post(url, søknad, {
        withCredentials: true,
        timeout: 120 * 1000,
        headers: {
            'content-type': 'application/json;'
        }
    });
}

function getStoredAppState() {
    return AxiosInstance.get('/storage', {
        transformResponse: storageParser
    });
}

function storeAppState(state: Partial<AppState>) {
    const { søknad, common } = state;
    return AxiosInstance.post('/storage', { søknad, common }, { withCredentials: true });
}

function deleteStoredAppState() {
    return AxiosInstance.delete('/storage', { withCredentials: true });
}

function sendStorageKvittering(storageKvittering: StorageKvittering) {
    return AxiosInstance.post('/storage/kvittering/foreldrepenger', storageKvittering, {
        withCredentials: true,
        timeout: 15 * 1000
    });
}

function getStorageKvittering() {
    return AxiosInstance.get('/storage/kvittering/foreldrepenger', {
        withCredentials: true,
        timeout: 15 * 1000
    });
}

const log = (error: any) => {
    return axios.post('/log', error, {
        timeout: 15 * 1000,
        withCredentials: true,
        headers: {
            'content-type': 'application/json'
        }
    });
};

const Api = {
    getSøkerinfo,
    getSaker,
    getUttakskontoer,
    sendSøknad,
    getStoredAppState,
    storeAppState,
    deleteStoredAppState,
    sendStorageKvittering,
    getStorageKvittering,
    getEksisterendeSak,
    getEksisterendeSakMedFnr,
    log
};

export default Api;
