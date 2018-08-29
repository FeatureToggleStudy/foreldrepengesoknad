import { Periode, Tidsperiode } from 'uttaksplan/types';
import { sorterPerioder, Tidsperioden, Uttaksdagen } from 'uttaksplan/utils';
import { guid } from 'nav-frontend-js-utils';
import { isBefore, isAfter, isSameDay } from 'date-fns';
import { slåSammenLikePerioder } from 'uttaksplan/utils/planer/UttaksplanBuilder';

export const UttaksplanManuell = (perioder: Periode[]) => new UttaksplanManuellBuilder(perioder);

class UttaksplanManuellBuilder {
    constructor(public perioder: Periode[]) {}

    public leggTilEllerOppdater(periode: Periode) {
        if (periode.id) {
            this.oppdaterPeriode(periode);
            return this;
        }
        this.leggTilPeriode({ ...periode, id: guid() });
        return this;
    }

    public leggTilPeriode(periode: Periode) {
        this.perioder = fjernUttaksdagerFraPerioder(this.perioder, periode);
        this.perioder = [...this.perioder, ...[periode]];
        this.sort();
        this.perioder = slåSammenLikePerioder(this.perioder);
        return this;
    }

    public oppdaterPeriode(periode: Periode) {
        this.slettPeriode(periode)
            .leggTilPeriode(periode)
            .sort();
        return this;
    }

    public slettPeriode(periode: Periode) {
        this.perioder = this.perioder.filter((p) => p.id !== periode.id);
        return this;
    }

    protected sort() {
        this.perioder.sort(sorterPerioder);
    }
}

/**
 * Finner alle Oppholdsperioder som er innenfor tidsrommet
 * til periode. Opphold som ligger innefor periode fjernes,
 * mens de som delvis overlapper får justert tidsrom.
 * @param perioder
 * @param periode
 * @returns Modifisert periodeliste med justert/fjernet opphold
 */
function fjernUttaksdagerFraPerioder(perioder: Periode[], periode: Periode): Periode[] {
    const nyePerioder: Periode[] = [];
    perioder.forEach((p) => {
        if (Tidsperioden(p.tidsperiode).erOmsluttetAv(periode.tidsperiode)) {
            return;
        } else if (Tidsperioden(p.tidsperiode).erUtenfor(periode.tidsperiode)) {
            nyePerioder.push(p);
        } else if (Tidsperioden(periode.tidsperiode).erOmsluttetAv(p.tidsperiode)) {
            fjernTidsperiodeFraPeriode(p, periode.tidsperiode).forEach((p2) => nyePerioder.push(p2));
        } else if (isBefore(p.tidsperiode.fom, periode.tidsperiode.fom)) {
            nyePerioder.push({
                ...p,
                tidsperiode: {
                    fom: p.tidsperiode.fom,
                    tom: Uttaksdagen(periode.tidsperiode.fom).forrige()
                }
            });
        } else {
            nyePerioder.push({
                ...p,
                tidsperiode: {
                    fom: Uttaksdagen(periode.tidsperiode.tom).neste(),
                    tom: p.tidsperiode.tom
                }
            });
        }
    });
    return nyePerioder;
}

/**
 * Fjern dager
 * @param periode
 * @param periode2
 */
function fjernTidsperiodeFraPeriode(periode: Periode, tidsperiode: Tidsperiode): Periode[] {
    const t1 = periode.tidsperiode;

    // Dersom de ikke overlapper
    if (isBefore(t1.tom, tidsperiode.fom) || isAfter(t1.fom, tidsperiode.tom)) {
        return [periode];
    }

    // Total overlapp
    if (isSameDay(t1.fom, tidsperiode.fom) && isSameDay(t1.tom, tidsperiode.tom)) {
        return [];
    }

    if (isSameDay(t1.fom, tidsperiode.fom)) {
        // Samme startdato -> dvs. startdato må flyttes, mens sluttdato er samme
        return [
            {
                ...periode,
                tidsperiode: {
                    ...periode.tidsperiode,
                    fom: Uttaksdagen(tidsperiode.fom).forrige()
                }
            }
        ];
    } else if (isSameDay(t1.tom, tidsperiode.tom)) {
        // Sluttdato er samme, dvs. sluttdato må flyttes, startdato er samme
        return [
            {
                ...periode,
                tidsperiode: {
                    ...periode.tidsperiode,
                    tom: Uttaksdagen(tidsperiode.tom).neste()
                }
            }
        ];
    }
    // Perioden er helt inne i periode
    return [
        {
            ...periode,
            tidsperiode: {
                ...periode.tidsperiode,
                tom: Uttaksdagen(tidsperiode.fom).forrige()
            }
        },
        {
            ...periode,
            id: guid(),
            tidsperiode: {
                ...periode.tidsperiode,
                fom: Uttaksdagen(tidsperiode.tom).neste()
            }
        }
    ];
}

// /**
//  * Legger en periode inn i en periode og forskyver sluttdatoen for perioden
//  * tilsvarende ny periodes varighet
//  * @param periode
//  * @param nyPeriode
//  */
// function splittPeriodeMedPeriode(
//     periode: Periode,
//     nyPeriode: Periode
// ): Periode[] {
//     const dagerIPeriode = tidsperioden(
//         periode.tidsperiode
//     ).getAntallUttaksdager();
//     const dagerForsteDel = tidsperioden({
//         startdato: periode.tidsperiode.startdato,
//         sluttdato: addDays(nyPeriode.tidsperiode.startdato, -1)
//     }).getAntallUttaksdager();
//     let dagerSisteDel = dagerIPeriode - dagerForsteDel;
//     const forste: Periode = {
//         ...periode,
//         tidsperiode: {
//             startdato: periode.tidsperiode.startdato,
//             sluttdato: uttaksdagUtil(nyPeriode.tidsperiode.startdato).forrige()
//         }
//     };
//     const midt: Periode = {
//         ...nyPeriode,
//         tidsperiode: {
//             startdato: uttaksdagUtil(
//                 nyPeriode.tidsperiode.startdato
//             ).denneEllerNeste(),
//             sluttdato: uttaksdagUtil(
//                 nyPeriode.tidsperiode.sluttdato
//             ).denneEllerNeste()
//         }
//     };
//     const startSisteDel: Date = uttaksdagUtil(
//         midt.tidsperiode.sluttdato
//     ).neste();

//     if (perioden(periode).erOpphold()) {
//         dagerSisteDel = dagerSisteDel - perioden(midt).getAntallUttaksdager();
//     }

//     const siste: Periode = {
//         ...periode,
//         id: guid(),
//         tidsperiode: getTidsperiode(startSisteDel, dagerSisteDel)
//     };
//     return [forste, midt, siste];
// }
