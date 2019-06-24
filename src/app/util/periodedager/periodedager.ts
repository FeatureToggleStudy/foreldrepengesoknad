import {
    Periode,
    isHull,
    isInfoPeriode,
    isGruppertInfoPeriode,
    PeriodeInfoType,
    isUttaksperiode
} from 'app/types/uttaksplan/periodetyper';
import { Tidsperioden } from '../uttaksplan/Tidsperioden';
import { Uttaksdagen } from '../uttaksplan/Uttaksdagen';
import { Periodene } from '../uttaksplan/Periodene';
import { Forelder, Tidsperiode } from 'common/types';
import moment from 'moment';
import { Uttaksdag, UttaksdagMedUttak } from './types';
import { getFloatFromString } from 'common/util/numberUtils';
import { getUkerOgDagerFromDager } from 'common/util/datoUtils';

export const isPeriodedagMedUttaksinfo = (periodedag: Uttaksdag): periodedag is UttaksdagMedUttak => {
    const { periode } = periodedag;
    return periode !== undefined && !isInfoPeriode(periode) && !isGruppertInfoPeriode(periode) && !isHull(periode);
};

export const isPeriodedagMedPeriode = (periodedag: Uttaksdag): periodedag is UttaksdagMedUttak => {
    const { periode } = periodedag;
    return periode !== undefined;
};

export const getFørsteOgSisteDagFraPerioder = (perioder: Periode[]): Tidsperiode | undefined => {
    return {
        fom: perioder[0].tidsperiode.fom,
        tom: perioder[perioder.length - 1].tidsperiode.tom
    };
};

export const getUtvidetTidsperiode = (
    tidsperiode1: Tidsperiode | undefined,
    tidsperiode2: Tidsperiode | undefined
): Tidsperiode | undefined => {
    if (!tidsperiode1 && !tidsperiode2) {
        return undefined;
    }
    if (!tidsperiode1) {
        return tidsperiode2;
    }
    if (!tidsperiode2) {
        return tidsperiode1;
    }
    return {
        fom: moment.min(moment(tidsperiode1.fom), moment(tidsperiode2.fom)).toDate(),
        tom: moment.max(moment(tidsperiode1.tom), moment(tidsperiode2.tom)).toDate()
    };
};

export const getPeriodedagerForTidsperiode = (tidsperiode: Tidsperiode): Uttaksdag[] => {
    const startDato = Uttaksdagen(tidsperiode.fom).denneEllerNeste();
    const sluttDato = Uttaksdagen(tidsperiode.tom).denneEllerForrige();

    let dato = startDato;
    const dager: Uttaksdag[] = [];
    while (moment(dato).isSameOrBefore(sluttDato)) {
        dager.push({
            dato
        });
        dato = Uttaksdagen(dato).neste();
    }
    return dager;
};

export const getUttaksdager = (perioder: Periode[], tidsperiode?: Tidsperiode): Uttaksdag[] => {
    const tidsperiodeForPerioder = getFørsteOgSisteDagFraPerioder(perioder);
    if (perioder.length > 0 && tidsperiodeForPerioder) {
        const antallUttaksdager = Tidsperioden(tidsperiodeForPerioder).getAntallUttaksdager();
        const tidsperiodeForDager = tidsperiode
            ? getUtvidetTidsperiode(tidsperiode, tidsperiodeForPerioder)
            : tidsperiodeForPerioder;

        const dagerForTidsperiode = tidsperiodeForDager ? getPeriodedagerForTidsperiode(tidsperiodeForDager) : [];
        const { fom } = tidsperiodeForPerioder;

        const periodedager: Uttaksdag[] = [];
        for (let i = 0; i < antallUttaksdager; i++) {
            const dato = Uttaksdagen(fom).leggTil(i);
            const periode = Periodene(perioder).finnPeriodeMedDato(dato);
            if (periode && isGruppertInfoPeriode(periode)) {
                const periodeIGruppe = Periodene(periode.perioder).finnPeriodeMedDato(dato);
                if (periodeIGruppe) {
                    periodedager.push({
                        dato,
                        periode: periodeIGruppe
                    });
                }
            } else {
                periodedager.push({
                    dato,
                    periode
                });
            }
        }
        return slåSammenDager(periodedager, dagerForTidsperiode);
    }
    return [];
};

const erDagMedUttakAnnenForelder = (dag: UttaksdagMedUttak): boolean => {
    return isInfoPeriode(dag.periode) && dag.periode.infotype === PeriodeInfoType.uttakAnnenPart;
};

export const getAntallDagerÅTrekke = (periode: Periode): number => {
    const dager = 1;
    if (isUttaksperiode(periode)) {
        const periodeErGradert = periode.stillingsprosent !== undefined;
        const periodeErSamtidigUttak = periode.samtidigUttakProsent !== undefined;
        if (periodeErSamtidigUttak) {
            return dager * (getFloatFromString(periode.samtidigUttakProsent)! / 100);
        } else if (periodeErGradert) {
            const graderingsProsent = (100 - getFloatFromString(periode.stillingsprosent)!) / 100;
            return dager * graderingsProsent;
        } else {
            return dager;
        }
    }
    return dager;
};

export const testPeriodedager = (perioder: Periode[], opprinneligPlan?: Periode[]) => {
    const periodedager = slåSammenUttaksplaner(perioder, opprinneligPlan || []);
    if (periodedager) {
        const dagerMedUttaksinfo = periodedager.filter(isPeriodedagMedUttaksinfo);
        const farsDager = dagerMedUttaksinfo.filter((dag) => dag.periode.forelder === Forelder.farMedmor);

        const morsDager = periodedager
            .filter(isPeriodedagMedPeriode)
            .filter(
                (dag) =>
                    erDagMedUttakAnnenForelder ||
                    (isPeriodedagMedUttaksinfo(dag) && dag.periode.forelder === Forelder.mor)
            );

        const farsUttak = farsDager.reduce((dager: number, dag: UttaksdagMedUttak) => {
            return dager + getAntallDagerÅTrekke(dag.periode);
        }, 0);

        const morsUttak = morsDager.reduce((dager: number, dag: UttaksdagMedUttak) => {
            return dager + getAntallDagerÅTrekke(dag.periode);
        }, 0);

        console.log(periodedager);
        console.log('Periodedager for mor: ', morsDager.length);
        console.log('Periodedager for farMedmor: ', farsDager.length);

        console.log('dager far: ', farsUttak);
        console.log('dager mor: ', morsUttak, getUkerOgDagerFromDager(morsUttak));
    }
};

export const slåSammenUttaksplaner = (nyPlan: Periode[], opprinneligPlan: Periode[]) => {
    const heleTidsperioden = getUtvidetTidsperiode(
        getFørsteOgSisteDagFraPerioder(nyPlan),
        getFørsteOgSisteDagFraPerioder(opprinneligPlan)
    );
    if (heleTidsperioden) {
        const dagerNyPlan = getUttaksdager(nyPlan, heleTidsperioden);
        const dagerOpprinneligPlan = getUttaksdager(nyPlan, heleTidsperioden);
        const dager = slåSammenDager(dagerNyPlan, dagerOpprinneligPlan);
        return dager;
    }
    return undefined;
};

export const slåSammenDager = (nyeDager: Uttaksdag[], basedager: Uttaksdag[]): Uttaksdag[] => {
    return basedager.map((baseDag, index): Uttaksdag => {
        const nyDag = nyeDager[index];
        return {
            dato: baseDag.dato,
            periode: nyDag.periode ? nyDag.periode : baseDag.periode
        };
    });
};
