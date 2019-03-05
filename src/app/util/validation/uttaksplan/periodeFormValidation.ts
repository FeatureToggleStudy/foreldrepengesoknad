import moment from 'moment';
import { getVariantFromPeriode, UtsettelseFormPeriodeType } from '../../../components/utsettelse-form/UtsettelseForm';
import { getErSøkerFarEllerMedmor } from '../../domain/personUtil';
import { getVelgbareStønadskontotyper } from '../../uttaksplan/stønadskontoer';
import { Søker } from '../../../types/søknad/Søker';
import {
    TilgjengeligStønadskonto,
    Periode,
    Periodetype,
    UtsettelseÅrsakType,
    Utsettelsesperiode,
    isUttaksperiode
} from '../../../types/uttaksplan/periodetyper';
import AnnenForelder from '../../../types/søknad/AnnenForelder';
import { PeriodeValideringsfeil, PeriodeValideringErrorKey } from '../../../redux/reducers/uttaksplanValideringReducer';
import {
    getUtsettelseFormVisibility,
    UtsettelseFormPayload
} from '../../../components/utsettelse-form/utsettelseFormConfig';
import { UttakFormPayload, getUttakFormVisibility } from '../../../components/uttak-form/uttakFormConfig';
import { uttakTidsperiodeErGyldig, periodeErInnenDeFørsteSeksUkene } from './uttakTidsperiodeValidation';
import { Søkersituasjon } from 'app/types/søknad/Søknad';
import { isValidTidsperiode } from '../../uttaksplan/Tidsperioden';
import { gradertUttaksperiodeErUgyldig } from './uttakGraderingValidation';
import { samtidigUttaksperiodeErUgyldig } from './uttakSamtidigUttakProsentValidation';
import { isFeatureEnabled, Feature } from 'app/Feature';
import { erUtsettelseÅrsakTypeGyldigForStartdato } from 'app/util/uttaksplan/regler/erUtsettelseÅrsakGyldigForStartdato';

const erUtsettelsePgaArbeidEllerFerie = (periode: UtsettelseFormPeriodeType): periode is Utsettelsesperiode => {
    return (
        periode.type === Periodetype.Utsettelse &&
        (periode.årsak === UtsettelseÅrsakType.Ferie || periode.årsak === UtsettelseÅrsakType.Arbeid)
    );
};

const validerUtsettelseForm = (payload: UtsettelseFormPayload): PeriodeValideringsfeil[] | undefined => {
    const { periode, familiehendelsesdato } = payload;
    const { tidsperiode, årsak } = periode;

    let fom;
    if (tidsperiode) {
        fom = tidsperiode.fom;
    }

    const visibility = getUtsettelseFormVisibility(payload);
    if (isValidTidsperiode(tidsperiode) === false) {
        return [
            {
                feilKey: PeriodeValideringErrorKey.UGYLDIG_TIDSPERIODE
            }
        ];
    }

    if (erUtsettelsePgaArbeidEllerFerie(periode) && fom && årsak) {
        if (
            isFeatureEnabled(Feature.ferieOgArbeidTilbakeITid) &&
            periodeErInnenDeFørsteSeksUkene(periode, familiehendelsesdato)
        ) {
            return [
                {
                    feilKey: PeriodeValideringErrorKey.UGYLDIG_ÅRSAK_OG_TIDSPERIODE
                }
            ];
        } else if (
            !isFeatureEnabled(Feature.ferieOgArbeidTilbakeITid) &&
            !erUtsettelseÅrsakTypeGyldigForStartdato(periode.årsak, fom as Date)
        ) {
            return [
                {
                    feilKey: PeriodeValideringErrorKey.UGYLDIG_ÅRSAK_OG_TIDSPERIODE_GAMMEL
                }
            ];
        }
    }

    if (moment(fom as Date).isBefore(moment(familiehendelsesdato))) {
        return [
            {
                feilKey: PeriodeValideringErrorKey.UTSETTELSE_FØR_FORELDREPENGER_FØR_FØDSEL
            }
        ];
    }

    if (visibility.areAllQuestionsAnswered()) {
        return undefined;
    }
    return [
        {
            feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT
        }
    ];
};

const validerUttakForm = (payload: UttakFormPayload): PeriodeValideringsfeil[] | undefined => {
    const visibility = getUttakFormVisibility(payload);
    const valideringsfeil: PeriodeValideringsfeil[] = [];

    if (isUttaksperiode(payload.periode) && payload.periode.konto === undefined) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.STØNADSKONTO_MANGLER });
    }

    if (uttakTidsperiodeErGyldig(payload.periode, payload.familiehendelsesdato) === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_TIDSPERIODE });
    }
    if (gradertUttaksperiodeErUgyldig(payload.periode)) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_GRADERING_VERDI });
    }
    if (samtidigUttaksperiodeErUgyldig(payload.periode, payload.søkerErFarEllerMedmor)) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_SAMTIDIG_UTTAK_PROSENT });
    }
    if (visibility.areAllQuestionsAnswered() === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT });
    }
    return valideringsfeil.length === 0 ? undefined : valideringsfeil;
};

export const validerPeriodeForm = (
    periode: Periode,
    søker: Søker,
    annenForelder: AnnenForelder,
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[],
    familiehendelsesdato: Date,
    situasjon: Søkersituasjon,
    erDeltUttak: boolean
): PeriodeValideringsfeil[] | undefined => {
    const søkerErFarEllerMedmor = getErSøkerFarEllerMedmor(søker.rolle);
    if (periode.type === Periodetype.Hull) {
        return undefined;
    }
    if (
        periode.type === Periodetype.Overføring ||
        periode.type === Periodetype.Uttak ||
        periode.type === Periodetype.Opphold
    ) {
        return validerUttakForm({
            periode,
            velgbareStønadskontotyper: getVelgbareStønadskontotyper(tilgjengeligeStønadskontoer),
            kanEndreStønadskonto: true,
            annenForelderHarRett: annenForelder.harRettPåForeldrepenger,
            søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
            søkerErFarEllerMedmor,
            morErUfør: søkerErFarEllerMedmor === false && annenForelder.erUfør,
            familiehendelsesdato,
            situasjon,
            erDeltUttak
        });
    }
    return validerUtsettelseForm({
        periode,
        variant: getVariantFromPeriode(periode),
        søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
        søkerErFarEllerMedmor: getErSøkerFarEllerMedmor(søker.rolle),
        annenForelder,
        familiehendelsesdato
    });
};
