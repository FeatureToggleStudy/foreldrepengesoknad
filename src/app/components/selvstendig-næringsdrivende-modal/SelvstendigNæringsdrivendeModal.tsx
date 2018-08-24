import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import Block from 'common/components/block/Block';
import getMessage from 'common/util/i18nUtils';
import { Checkbox } from 'nav-frontend-skjema';
import Input from 'common/components/skjema/wrappers/Input';
import {
    Næring,
    NæringPartial,
    Næringsrelasjon,
    NæringsrelasjonPartial,
    Næringstype
} from '../../types/søknad/SelvstendigNæringsdrivendeInformasjon';
import NæringstypeSpørsmål from '../../spørsmål/NæringstypeSpørsmål';
import { TidsperiodeMedValgfriSluttdato } from 'common/types';
import TidsperiodeBolk from '../../bolker/TidsperiodeBolk';
import ErNæringenRegistrertINorgeSpørsmål from '../../spørsmål/ErNæringenRegistrertINorgeSpørsmål';
import Landvelger from '../landvelger/Landvelger';
import HeltNyIArbeidslivetSpørsmål from '../../spørsmål/HeltNyIArbeidslivetSpørsmål';
import VarigEndringAvNæringsinntektBolk from '../../bolker/VarigEndringAvNæringsinntektBolk';
import NæringsrelasjonBolk from '../../bolker/næringsrelasjon-bolk/NæringsrelasjonBolk';
import HarDuRegnskapsførerSpørsmål from '../../spørsmål/HarDuRegnskapsførerSpørsmål';
import HarDuRevisorSpørsmål from '../../spørsmål/HarDuRevisorSpørsmål';
import { InputChangeEvent } from '../../types/dom/Events';
import { getAndreInntekterTidsperiodeAvgrensninger } from '../../util/validation/fields/andreInntekter';
import { getStillingsprosentRegler } from '../../util/validation/fields/stillingsprosent';
import ModalForm from 'common/components/modalForm/ModalForm';
import { getFloatFromString } from 'common/util/numberUtils';
import { getOrganisasjonsnummerRegler } from '../../util/validation/fields/organisasjonsnummer';
import {
    navnPåNæringenVisible,
    næringRegistrertINorgeVisible,
    næringsinntektVisible,
    organisasjonsnummerVisible,
    næringRegistrertILandVisible,
    stillingsprosentVisible,
    tidsperiodeVisible,
    nyIArbeidslivetVisible,
    varigEndringAvNæringsinntektVisible,
    regnskapsførerBolkVisible,
    revisorBolkVisible,
    kanInnhenteOpplysningerFraRevisorVisible,
    formButtonsVisible
} from './visibilityFns';
import KanInnhenteOpplysningerFraRevisorSpørsmål from '../../spørsmål/KanInnhenteOpplysningerFraRevisorSpørsmål';

export interface SelvstendigNæringsdrivendeModalProps {
    næring?: Næring;
    isOpen: boolean;
    onCancel: () => void;
    onSubmit: (næring: Næring) => void;
}

type Props = SelvstendigNæringsdrivendeModalProps & InjectedIntlProps;

interface State {
    næring: NæringPartial;
}

class SelvstendigNæringsdrivendeModal extends React.Component<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State) {
        return SelvstendigNæringsdrivendeModal.buildStateFromProps(
            props,
            state
        );
    }

    static buildStateFromProps(props: Props, state?: State) {
        const { isOpen } = props;

        if (!isOpen) {
            return { næring: props.næring || {} };
        } else {
            return {
                næring:
                    state &&
                    state.næring &&
                    Object.keys(state.næring).length > 0
                        ? state.næring
                        : props.næring || {}
            };
        }
    }

    constructor(props: Props) {
        super(props);

        this.state = SelvstendigNæringsdrivendeModal.buildStateFromProps(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.updateNæring = this.updateNæring.bind(this);
        this.toggleNæringstype = this.toggleNæringstype.bind(this);
        this.handleStillingsprosentBlur = this.handleStillingsprosentBlur.bind(
            this
        );
    }

    updateNæring(næringProperties: NæringPartial): void {
        this.setState({
            næring: {
                ...this.state.næring,
                ...næringProperties
            }
        });
    }

    onSubmit(): void {
        this.props.onSubmit(this.state.næring as Næring);
    }

    toggleNæringstype(næringstype: Næringstype): void {
        const { næring } = this.state;
        const newNæringstyper = ((næring && næring.næringstyper) || []).slice();
        const indexOfNæringstype = newNæringstyper.indexOf(næringstype);

        if (indexOfNæringstype >= 0) {
            newNæringstyper.splice(indexOfNæringstype, 1);
        } else {
            newNæringstyper.push(næringstype);
        }

        this.updateNæring({ næringstyper: newNæringstyper });
    }

    handleStillingsprosentBlur(e: React.FocusEvent<HTMLInputElement>) {
        const pst = getFloatFromString(e.target.value);
        this.updateNæring({
            stillingsprosent: pst ? pst.toFixed(1) : e.target.value
        });
    }

    render() {
        const { intl, isOpen, onCancel } = this.props;
        const { næring } = this.state;
        const {
            navnPåNæringen,
            næringstyper,
            næringsinntekt,
            tidsperiode,
            pågående,
            organisasjonsnummer,
            registrertINorge,
            registrertILand,
            stillingsprosent,
            nyIArbeidslivet,
            harRegnskapsfører,
            harRevisor,
            kanInnhenteOpplsyningerFraRevisor,
            regnskapsfører,
            revisor
        } = næring;

        return (
            <ModalForm
                title={intl.formatMessage({
                    id: 'selvstendigNæringsdrivende.modal.tittel'
                })}
                onSubmit={this.onSubmit}
                onRequestClose={onCancel}
                isOpen={isOpen}
                renderFormButtons={formButtonsVisible(næring)}
                submitLabel={getMessage(intl, 'leggtil')}
                cancelLabel={getMessage(intl, 'avbryt')}>
                <Block>
                    <NæringstypeSpørsmål
                        næringstyper={næringstyper || []}
                        onChange={this.toggleNæringstype}
                    />
                </Block>

                <Block visible={navnPåNæringenVisible(næring)}>
                    <Input
                        label={getMessage(
                            intl,
                            'selvstendigNæringsdrivende.modal.navn'
                        )}
                        required={true}
                        onChange={(e: InputChangeEvent) =>
                            this.updateNæring({
                                navnPåNæringen: e.target.value
                            })
                        }
                        value={navnPåNæringen || ''}
                    />
                </Block>

                <Block visible={organisasjonsnummerVisible(næring)}>
                    <Input
                        label={getMessage(
                            intl,
                            'selvstendigNæringsdrivende.modal.orgnr'
                        )}
                        onChange={(e: InputChangeEvent) =>
                            this.updateNæring({
                                organisasjonsnummer: e.target.value
                            })
                        }
                        maxLength={9}
                        minLength={9}
                        pattern="[0-9]{9}"
                        required={true}
                        value={organisasjonsnummer || ''}
                        validators={getOrganisasjonsnummerRegler(
                            organisasjonsnummer || '',
                            intl
                        )}
                    />
                </Block>

                <Block visible={tidsperiodeVisible(næring)} margin="none">
                    <TidsperiodeBolk
                        tidsperiode={tidsperiode || {}}
                        onChange={(v: TidsperiodeMedValgfriSluttdato) =>
                            this.updateNæring({ tidsperiode: v })
                        }
                        sluttdatoDisabled={pågående}
                        datoAvgrensninger={getAndreInntekterTidsperiodeAvgrensninger(
                            tidsperiode
                        )}
                    />
                </Block>

                <Block visible={tidsperiodeVisible(næring)}>
                    <Checkbox
                        checked={pågående || false}
                        label={getMessage(intl, 'annenInntekt.modal.pågående')}
                        onChange={() => {
                            this.updateNæring({
                                pågående: !pågående,
                                tidsperiode: {
                                    ...tidsperiode,
                                    tom: undefined
                                }
                            });
                        }}
                    />
                </Block>

                <Block visible={næringsinntektVisible(næring)}>
                    <Input
                        label={getMessage(
                            intl,
                            'annenInntekt.spørsmål.næringsinntekt'
                        )}
                        onChange={(e: InputChangeEvent) => {
                            const næringPartial: NæringPartial = {
                                næringsinntekt: e.target.value
                            };
                            this.updateNæring(næringPartial);
                        }}
                        value={næringsinntekt || ''}
                    />
                </Block>

                <Block visible={næringRegistrertINorgeVisible(næring)}>
                    <ErNæringenRegistrertINorgeSpørsmål
                        registrertINorge={registrertINorge}
                        onChange={(v: boolean) =>
                            this.updateNæring({ registrertINorge: v })
                        }
                    />
                </Block>

                <Block visible={næringRegistrertILandVisible(næring)}>
                    <Landvelger
                        onChange={(v: string) =>
                            this.updateNæring({ registrertILand: v })
                        }
                        label={getMessage(
                            intl,
                            'selvstendigNæringsdrivende.modal.registrertILand'
                        )}
                        defaultValue={registrertILand}
                    />
                </Block>

                <Block visible={stillingsprosentVisible(næring)}>
                    <Input
                        bredde="XS"
                        label={getMessage(
                            intl,
                            'selvstendigNæringsdrivende.modal.stillingsprosent'
                        )}
                        onChange={(e: InputChangeEvent) =>
                            this.updateNæring({
                                stillingsprosent: e.target.value
                            })
                        }
                        onBlur={this.handleStillingsprosentBlur}
                        value={stillingsprosent || ''}
                        validators={getStillingsprosentRegler(
                            stillingsprosent || '',
                            intl
                        )}
                        maxLength={4}
                    />
                </Block>

                <Block visible={nyIArbeidslivetVisible(næring)}>
                    <HeltNyIArbeidslivetSpørsmål
                        nyIArbeidslivet={nyIArbeidslivet}
                        onChange={(v: boolean) =>
                            this.updateNæring({
                                nyIArbeidslivet: v
                            })
                        }
                    />
                </Block>
                <Block visible={varigEndringAvNæringsinntektVisible(næring)}>
                    <VarigEndringAvNæringsinntektBolk
                        næring={næring as Næring}
                        onChange={(changedProps: NæringPartial) =>
                            this.updateNæring(changedProps)
                        }
                    />
                </Block>

                <Block visible={regnskapsførerBolkVisible(næring)}>
                    <NæringsrelasjonBolk
                        renderSpørsmål={() => (
                            <HarDuRegnskapsførerSpørsmål
                                harRegnskapsfører={harRegnskapsfører}
                                onChange={(v: boolean) =>
                                    this.updateNæring({
                                        harRegnskapsfører: v
                                    })
                                }
                            />
                        )}
                        oppfølgingsspørsmålSynlig={harRegnskapsfører === true}
                        næringsrelasjon={regnskapsfører || {}}
                        onChange={(v: NæringsrelasjonPartial) =>
                            this.updateNæring({
                                regnskapsfører: v as Næringsrelasjon
                            })
                        }
                    />
                </Block>

                <Block visible={revisorBolkVisible(næring)}>
                    <NæringsrelasjonBolk
                        renderSpørsmål={() => (
                            <HarDuRevisorSpørsmål
                                harRevisor={harRevisor}
                                onChange={(v: boolean) =>
                                    this.updateNæring({
                                        harRevisor: v
                                    })
                                }
                            />
                        )}
                        oppfølgingsspørsmålSynlig={harRevisor === true}
                        næringsrelasjon={revisor || {}}
                        onChange={(v: NæringsrelasjonPartial) =>
                            this.updateNæring({
                                revisor: v as Næringsrelasjon
                            })
                        }
                    />
                </Block>

                <Block
                    visible={kanInnhenteOpplysningerFraRevisorVisible(næring)}>
                    <KanInnhenteOpplysningerFraRevisorSpørsmål
                        kanInnhenteOpplysningerFraRevisor={
                            kanInnhenteOpplsyningerFraRevisor
                        }
                        onChange={(v: boolean) =>
                            this.updateNæring({
                                kanInnhenteOpplsyningerFraRevisor: v
                            })
                        }
                    />
                </Block>
            </ModalForm>
        );
    }
}

export default injectIntl(SelvstendigNæringsdrivendeModal);
