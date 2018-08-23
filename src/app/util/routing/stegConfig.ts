import Søknad from '../../types/søknad/Søknad';

export enum StegID {
    'INNGANG' = 'inngang',
    'RELASJON_TIL_BARN_FØDSEL' = 'relasjon-til-barn-fodsel',
    'RELASJON_TIL_BARN_ADOPSJON' = 'relasjon-til-barn-adopsjon',
    'RELASJON_TIL_BARN_FORELDREANSVAR' = 'relasjon-til-barn-foreldreansvar',
    'UTENLANDSOPPHOLD' = 'utenlandsopphold',
    'ANNEN_FORELDER' = 'annen-forelder',
    'ANDRE_INNTEKTER' = 'andre-inntekter',
    'UTTAKSPLAN' = 'uttaksplan',
    'OPPSUMMERING' = 'oppsummering'
}

export interface StegConfig {
    [key: string]: StegConfigItem;
}

export interface StegConfigItem {
    tittel: string;
    fortsettKnappLabel: string;
    nesteSteg?: StegID;
    isAvilable?: (søknad: Søknad) => boolean;
    index: number;
}

const stegConfig: StegConfig = {
    [StegID.INNGANG]: {
        tittel: 'Inngang',
        fortsettKnappLabel: 'Fortsett',
        index: 0
    },
    [StegID.RELASJON_TIL_BARN_ADOPSJON]: {
        tittel: 'Relasjon til barn (adopsjon) header',
        fortsettKnappLabel: 'Fortsett',
        nesteSteg: StegID.ANNEN_FORELDER,
        index: 1
    },
    [StegID.RELASJON_TIL_BARN_FORELDREANSVAR]: {
        tittel: 'Relasjon til barn overtakelse av foreldreansvar',
        fortsettKnappLabel: 'Fortsett',
        nesteSteg: StegID.ANNEN_FORELDER,
        index: 1
    },
    [StegID.RELASJON_TIL_BARN_FØDSEL]: {
        tittel: 'Informasjon om barnet',
        fortsettKnappLabel: 'Fortsett',
        nesteSteg: StegID.ANNEN_FORELDER,
        index: 1
    },
    [StegID.ANNEN_FORELDER]: {
        tittel: 'Informasjon om den andre forelderen',
        fortsettKnappLabel: 'Fortsett',
        nesteSteg: StegID.UTTAKSPLAN,
        index: 2
    },
    [StegID.UTTAKSPLAN]: {
        tittel: 'Velkommen til eksempel-uttaksplanen',
        fortsettKnappLabel: 'Gå til oppsummering',
        nesteSteg: StegID.UTENLANDSOPPHOLD,
        index: 3
    },
    [StegID.UTENLANDSOPPHOLD]: {
        tittel: 'Informasjon om utenlandsopphold',
        fortsettKnappLabel: 'Fortsett',
        nesteSteg: StegID.ANDRE_INNTEKTER,
        index: 4
    },
    [StegID.ANDRE_INNTEKTER]: {
        tittel: 'Opplysninger om inntekt',
        fortsettKnappLabel: 'Gå til uttaksplan',
        nesteSteg: StegID.OPPSUMMERING,
        index: 5
    },
    [StegID.OPPSUMMERING]: {
        tittel: 'Oppsummering',
        fortsettKnappLabel: 'Send søknad',
        index: 6
    }
};

export default stegConfig;
