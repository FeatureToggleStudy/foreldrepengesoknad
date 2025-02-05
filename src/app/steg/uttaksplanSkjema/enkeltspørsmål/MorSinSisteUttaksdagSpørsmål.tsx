import * as React from 'react';
import DatoInput from 'common/components/skjema/wrappers/DatoInput';
import getMessage from 'common/util/i18nUtils';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import UttaksplanSkjemaSpørsmål, { UttaksplanSkjemaspørsmålProps } from '../UttaksplanSkjemaSpørsmål';
import { uttaksplanDatoavgrensninger } from '../../../util/validation/uttaksplan/uttaksplanDatoavgrensninger';
import { getNavnGenitivEierform } from '../../../util/tekstUtils';

interface OwnProps {
    navnMor: string;
    familiehendelsesdato: Date;
}

type Props = OwnProps & UttaksplanSkjemaspørsmålProps & InjectedIntlProps;

const MorSinSisteUttaksdagSpørsmål: React.StatelessComponent<Props> = ({
    visible,
    navnMor,
    familiehendelsesdato,
    intl
}) => (
    <UttaksplanSkjemaSpørsmål
        visible={visible}
        render={(data, onChange) => (
            <DatoInput
                name="morSinSisteUttaksdag"
                id="morSinSisteUttaksdag"
                label={getMessage(intl, 'spørsmål.morSinSisteUttaksdag.label', {
                    navnMor: getNavnGenitivEierform(navnMor, intl.locale)
                })}
                onChange={(morSinSisteUttaksdag: Date) => onChange({ morSinSisteUttaksdag })}
                dato={data.morSinSisteUttaksdag}
                datoAvgrensinger={uttaksplanDatoavgrensninger.morsSisteUttaksdag(familiehendelsesdato)}
            />
        )}
    />
);

export default injectIntl(MorSinSisteUttaksdagSpørsmål);
