import { Periode, Uttaksperiode, Utsettelsesperiode, Overføringsperiode } from 'app/types/uttaksplan/periodetyper';

interface UttaksdagBase {
    dato: Date;
    periode?: Periode;
}

export interface BruktUttaksdag extends UttaksdagBase {
    periode: Periode;
}

export interface UttaksdagMedUttak extends UttaksdagBase {
    periode: Uttaksperiode | Overføringsperiode | Utsettelsesperiode;
}

export type Uttaksdag = BruktUttaksdag | UttaksdagBase | UttaksdagMedUttak;

export interface Uttaksplan {
    dager: Uttaksdag[];
    familiehendelsesdato: Date;
    førsteDag: Date;
    sisteDag: Date;
}
