import * as React from 'react';
import { injectIntl, InjectedIntl } from 'react-intl';
import UttaksplanSkjemaSpørsmål, { UttaksplanSkjemaspørsmålProps } from '../UttaksplanSkjemaSpørsmål';
import { Validator } from 'common/lib/validation/types';
import getMessage from 'common/util/i18nUtils';
import Block from 'common/components/block/Block';
import ValiderbarUkerDagerTeller from 'common/lib/validation/elements/ValiderbarUkerDagerTeller';
import Tittel from '../../../components/elementer/tittel/Tittel';

interface AntallUkerOgDagerFellesperiodeFarMedmorProps {
    antallUkerFellesperiode: number;
    intl: InjectedIntl;
}

type Props = AntallUkerOgDagerFellesperiodeFarMedmorProps & UttaksplanSkjemaspørsmålProps;

const getUkerOgDagerRegler = (
    uker: number = 0,
    maksUker: number,
    dager: number = 0,
    intl: InjectedIntl
): Validator[] => {
    const maksDager = maksUker * 5;
    const valgtAntallDager = uker * 5 + dager;

    return [
        {
            test: () => valgtAntallDager <= maksDager && valgtAntallDager >= 0,
            failText: getMessage(intl, 'valideringsfeil.uttaksplanskjema.forMangeUkerPeriodeFarMedmor', {
                uker: maksUker
            })
        }
    ];
};

const AntallUkerOgDagerFellesperiodeFarMedmorSpørsmål: React.StatelessComponent<Props> = ({
    visible,
    antallUkerFellesperiode,
    intl
}) => (
    <UttaksplanSkjemaSpørsmål
        visible={visible}
        render={(data, onChange) => {
            const { antallUkerFellesperiodeFarMedmor, antallDagerFellesperiodeFarMedmor } = data;

            return (
                <>
                    <Block margin="xxs">
                        <Tittel
                            tittel={getMessage(intl, 'spørsmål.farFellesperiode.label')}
                            info={{
                                tekst: getMessage(intl, 'spørsmål.farFellesperiode.infoboksTekst')
                            }}
                        />
                    </Block>
                    <Block margin="xxs">
                        <ValiderbarUkerDagerTeller
                            validators={getUkerOgDagerRegler(
                                antallUkerFellesperiodeFarMedmor,
                                antallUkerFellesperiode,
                                antallDagerFellesperiodeFarMedmor,
                                intl
                            )}
                            name="farMedmorFellesperiode"
                            ukeLegend={getMessage(intl, 'spørsmål.farFellesperiode.uker.label')}
                            dagLegend={getMessage(intl, 'spørsmål.farFellesperiode.dager.label')}
                            stepperProps={[
                                {
                                    value:
                                        antallUkerFellesperiodeFarMedmor !== undefined
                                            ? antallUkerFellesperiodeFarMedmor
                                            : 0,
                                    min: 0,
                                    max: antallUkerFellesperiode,
                                    onChange: (uker: number) => onChange({ antallUkerFellesperiodeFarMedmor: uker }),
                                    ariaLabel: 'Antall uker'
                                },
                                {
                                    value:
                                        antallDagerFellesperiodeFarMedmor !== undefined
                                            ? antallDagerFellesperiodeFarMedmor
                                            : 0,
                                    min: 0,
                                    max: 4,
                                    onChange: (dager: number) => onChange({ antallDagerFellesperiodeFarMedmor: dager }),
                                    ariaLabel: 'Antall dager'
                                }
                            ]}
                        />
                    </Block>
                </>
            );
        }}
    />
);

export default injectIntl(AntallUkerOgDagerFellesperiodeFarMedmorSpørsmål);
