import * as React from 'react';
import { FormattedHTMLMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import Input from 'common/components/skjema/wrappers/Input';
import Block from 'common/components/block/Block';
import { getFloatFromString } from 'common/util/numberUtils';
import Arbeidsforhold from '../../../../../types/Arbeidsforhold';
import JaNeiSpørsmål from '../../../../../../common/components/skjema/elements/ja-nei-spørsmål/JaNeiSpørsmål';
import { Arbeidsform, Uttaksperiode, Periode } from '../../../../../types/uttaksplan/periodetyper';
import { RecursivePartial } from '../../../../../types/Partial';
import HvorSkalDuJobbeSpørsmål from '../../../../../spørsmål/HvorSkalDuJobbeSpørsmål';
import { UttakSpørsmålKeys, UttakSpørsmålVisibility } from '../uttakFormConfig';
import { getStillingsprosentRegler } from '../../../../../util/validation/stillingsprosent';
import { getVarighetString } from 'common/util/intlUtils';
import { finnAntallDagerÅTrekke } from '../../../../../util/uttaksPlanStatus';
import { Perioden } from '../../../../../util/uttaksplan/Perioden';
import VeilederInfo from 'app/components/veilederInfo/VeilederInfo';
import ArbeideHelgInfo from './ArbeideHelgInfo';

interface OwnProps {
    onChange: (periode: RecursivePartial<Uttaksperiode>) => void;
    periode: Uttaksperiode;
    visibility: UttakSpørsmålVisibility;
    visAntallDagerUttak: boolean;
    arbeidsforhold?: Arbeidsforhold[];
}

type Props = OwnProps & InjectedIntlProps;

class GradertUttakForm extends React.Component<Props> {
    handleStillingsprosentChange(stillingsprosent: string) {
        const { onChange } = this.props;
        const pst = getFloatFromString(stillingsprosent);
        onChange({
            stillingsprosent: pst ? pst.toFixed(1) : stillingsprosent
        });
    }

    render() {
        const { periode, arbeidsforhold, visibility, intl, onChange, visAntallDagerUttak } = this.props;

        const pst = getFloatFromString(periode.stillingsprosent || '');
        const uttaksdager = Perioden(periode as Periode).getAntallUttaksdager();
        const varighet =
            pst && uttaksdager
                ? getMessage(intl, 'gradert.uttak.varighet', {
                      varighet: getVarighetString(finnAntallDagerÅTrekke(periode as Periode), intl)
                  })
                : undefined;

        const visAntallDagerUttakInfo = visAntallDagerUttak && varighet !== undefined;
        return (
            <>
                <Block>
                    <JaNeiSpørsmål
                        navn="ønskerDuGradertUttak"
                        spørsmål={getMessage(intl, 'uttaksperiode.gradert.skalDuHarGradering')}
                        valgtVerdi={periode.gradert}
                        onChange={(ønskerGradering) =>
                            onChange({ gradert: ønskerGradering, erArbeidstaker: ønskerGradering ? false : undefined })
                        }
                        hjelpetekst={<FormattedHTMLMessage id="uttaksperiode.gradert.skalDuHarGradering.hjelpetekst" />}
                        clsName="onskerDuGradertuttak"
                    />
                </Block>

                <Block visible={visibility.isVisible(UttakSpørsmålKeys.stillingsprosent)}>
                    <Block margin={varighet ? 'xxs' : 'none'}>
                        <Input
                            name="utsettelse-stillingsprosent"
                            bredde="XS"
                            label={getMessage(intl, 'stillingsprosent')}
                            onChange={(v: string) =>
                                onChange({
                                    stillingsprosent: v
                                })
                            }
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                                this.handleStillingsprosentChange(e.target.value)
                            }
                            value={periode.stillingsprosent || ''}
                            maxLength={4}
                            validators={getStillingsprosentRegler(false, periode.stillingsprosent || '', intl)}
                        />
                    </Block>
                    {visAntallDagerUttakInfo && <div className="comment">{varighet}</div>}
                </Block>

                <Block visible={visibility.isVisible(UttakSpørsmålKeys.hvorSkalDuJobbe)}>
                    <HvorSkalDuJobbeSpørsmål
                        arbeidsforhold={arbeidsforhold || []}
                        onChange={(orgnumre, arbeidsformer) =>
                            onChange({
                                orgnumre,
                                arbeidsformer,
                                erArbeidstaker: arbeidsformer.includes(Arbeidsform.arbeidstaker)
                            })
                        }
                        arbeidsformer={periode.arbeidsformer || []}
                        orgnumre={periode.orgnumre || []}
                    />
                </Block>
                <Block
                    visible={
                        !!periode.gradert && periode.arbeidsformer !== undefined && periode.arbeidsformer.length > 0
                    }>
                    <VeilederInfo
                        messages={[
                            {
                                type: 'normal',
                                contentIntlKey: periode.erArbeidstaker
                                    ? 'vedlegg.veileder.dokumentasjonAvArbeidVedGradering'
                                    : 'uttaksplan.infoTilFrilansOgSelvstendig',
                                formatContentAsHTML: true,
                                values: {
                                    prosent: pst
                                }
                            }
                        ]}
                    />
                    <ArbeideHelgInfo />
                </Block>
            </>
        );
    }
}

export default injectIntl(GradertUttakForm);
