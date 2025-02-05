import * as React from 'react';
import FlervalgSpørsmål, { FlervalgAlternativ } from '../../../../../../common/components/skjema/elements/flervalg-spørsmål/FlervalgSpørsmål';
import {
    OppholdÅrsakType,
    TilgjengeligStønadskonto,
    StønadskontoType
} from '../../../../../types/uttaksplan/periodetyper';
import { InjectedIntlProps, injectIntl, InjectedIntl } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import { getNavnGenitivEierform } from '../../../../../util/tekstUtils';

export interface OwnProps {
    oppholdsårsak: OppholdÅrsakType | undefined;
    navnAnnenForelder: string;
    søkerErFarEllerMedmor: boolean;
    onChange: (årsak: OppholdÅrsakType) => void;
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[];
}

type Props = OwnProps & InjectedIntlProps;

const filterEgenKonto = (konto: TilgjengeligStønadskonto, søkerErFarEllerMedmor: boolean) => {
    return søkerErFarEllerMedmor
        ? konto.konto !== StønadskontoType.Fedrekvote
        : konto.konto !== StønadskontoType.Mødrekvote;
};

const createAlternative = (
    konto: TilgjengeligStønadskonto,
    søkerErFarEllerMedmor: boolean,
    navnAnnenForelder: string,
    intl: InjectedIntl
): FlervalgAlternativ => {
    if (konto.konto === StønadskontoType.Fedrekvote || konto.konto === StønadskontoType.Mødrekvote) {
        return {
            label: getMessage(intl, 'stønadskontotype.foreldernavn.kvote', {
                navn: getNavnGenitivEierform(navnAnnenForelder, intl.locale)
            }),
            value: søkerErFarEllerMedmor
                ? OppholdÅrsakType.UttakMødrekvoteAnnenForelder
                : OppholdÅrsakType.UttakFedrekvoteAnnenForelder
        };
    } else {
        return {
            label: getMessage(intl, 'stønadskontotype.FELLESPERIODE'),
            value: OppholdÅrsakType.UttakFellesperiodeAnnenForelder
        };
    }
};

const getAlternativer = (
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[],
    søkerErFarEllerMedmor: boolean,
    navnAnnenForelder: string,
    intl: InjectedIntl
): FlervalgAlternativ[] => {
    return tilgjengeligeStønadskontoer
        .filter(
            (konto) =>
                filterEgenKonto(konto, søkerErFarEllerMedmor) &&
                konto.konto !== StønadskontoType.ForeldrepengerFørFødsel
        )
        .map((konto) => createAlternative(konto, søkerErFarEllerMedmor, navnAnnenForelder, intl));
};

const OppholdsårsakSpørsmål: React.StatelessComponent<Props> = ({
    oppholdsårsak,
    onChange,
    navnAnnenForelder,
    søkerErFarEllerMedmor,
    tilgjengeligeStønadskontoer,
    intl
}) => (
    <>
        <FlervalgSpørsmål
            navn="oppholdsårsaktype"
            spørsmål={getMessage(intl, 'uttaksplan.skjema.opphold.årsak.spørsmål', { navn: navnAnnenForelder })}
            valgtVerdi={oppholdsårsak}
            onChange={onChange}
            toKolonner={true}
            alternativer={getAlternativer(tilgjengeligeStønadskontoer, søkerErFarEllerMedmor, navnAnnenForelder, intl)}
        />
    </>
);

export default injectIntl(OppholdsårsakSpørsmål);
