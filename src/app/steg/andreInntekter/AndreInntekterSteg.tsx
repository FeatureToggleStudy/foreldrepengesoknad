import * as React from 'react';
import { default as Steg, StegProps } from '../../components/applikasjon/steg/Steg';
import moment from 'moment';
import Block from 'common/components/block/Block';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { StegID } from '../../util/routing/stegConfig';
import { connect } from 'react-redux';
import { AppState } from '../../redux/reducers';
import AndreInntekterBolk from './andreInntekterBolk/AndreInntekterBolk';
import { DispatchProps } from 'common/redux/types';
import søknadActions from '../../redux/actions/søknad/søknadActionCreators';
import getMessage from 'common/util/i18nUtils';
import Søker from '../../types/søknad/Søker';
import FrilanserBolk from './frilanserBolk/FrilanserBolk';
import { FrilansInformasjon } from '../../types/søknad/FrilansInformasjon';
import SelvstendigNæringsdrivendeBolk from './selvstendigNæringsdrivendeModal/selvstendigNæringsdrivendeBolk/SelvstendigNæringsdrivendeBolk';
import { Næring } from '../../types/søknad/SelvstendigNæringsdrivendeInformasjon';
import isAvailable from '../../util/steg/isAvailable';
import { annenInntektErGyldig } from '../../util/validation/steg/annenInntekt';
import Arbeidsforhold from '../../types/Arbeidsforhold';
import InformasjonOmArbeidsforholdWrapper from 'app/steg/andreInntekter/arbeidsforhold-infobox/InformasjonOmArbeidsforholdWrapper';
import visibility from './visibility';
import cleanupAndreInntekterSteg from '../../util/cleanup/cleanupAndreInntekterSteg';
import { HistoryProps } from '../../types/common';
import { SøkerinfoProps } from '../../types/søkerinfo';
import YtelseInfoWrapper from 'app/steg/andreInntekter/ytelserInfobox/InformasjonOmYtelserWrapper';
import { Periode } from 'app/types/uttaksplan/periodetyper';
import { formatDate } from 'app/util/dates/dates';
import VeilederInfo from '../../components/veilederInfo/VeilederInfo';
import { selectSøknadsinfo } from '../../selectors/søknadsinfoSelector';
import {
    uttaksplanInneholderFrilansaktivitet,
    uttaksplanInneholderSelvstendignæringaktivitet
} from 'app/util/uttaksplan';
import { mapMissingAttachmentsOnSøknad } from 'app/util/attachments/missingAttachmentUtil';
import { findAllAttachments } from '../manglendeVedlegg/manglendeVedleggUtil';
import _ from 'lodash';
import { skalViseManglendeVedleggSteg } from '../../util/steg/navigation';
import { selectMissingAttachments } from 'app/selectors/attachmentsSelector';
import { apiActionCreators } from 'app/redux/actions';
import { getAktiveArbeidsforhold } from 'app/api/utils/søkerinfoUtils';

interface StateProps {
    stegProps: StegProps;
    arbeidsforhold: Arbeidsforhold[];
    søker: Søker;
    uttaksplan: Periode[];
    planInneholderFrilansaktivitet: boolean;
    planInneholderSelvstendignæringaktivitet: boolean;
    familiehendelsesdato: Date | undefined;
}

type Props = SøkerinfoProps & HistoryProps & StateProps & InjectedIntlProps & DispatchProps;

class AndreInntekterSteg extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.cleanupSteg = this.cleanupSteg.bind(this);
        this.updateSøkerAndSave = this.updateSøkerAndSave.bind(this);
        this.state = {
            harHattAnnenInntekt: undefined
        };
        const { arbeidsforhold, familiehendelsesdato, dispatch } = this.props;

        if (arbeidsforhold.length > 0) {
            dispatch(
                apiActionCreators.fjernInaktiveArbeidsforhold(
                    getAktiveArbeidsforhold(arbeidsforhold, familiehendelsesdato)
                )
            );
        }
    }

    updateSøkerAndSave(søker: Partial<Søker>) {
        this.props.dispatch(søknadActions.updateSøkerAndStorage(søker));
    }

    cleanupSteg() {
        const { søker, dispatch } = this.props;
        dispatch(søknadActions.updateSøker(cleanupAndreInntekterSteg(søker)));
    }

    render() {
        const {
            stegProps,
            søker,
            arbeidsforhold,
            uttaksplan,
            planInneholderFrilansaktivitet,
            planInneholderSelvstendignæringaktivitet,
            dispatch,
            intl
        } = this.props;
        const { harHattAnnenInntektSiste10Mnd } = søker;
        const harArbeidsforhold = arbeidsforhold !== undefined && arbeidsforhold.length > 0;

        return (
            <Steg {...stegProps} onPreSubmit={this.cleanupSteg}>
                <Block
                    header={{
                        title: getMessage(intl, 'annenInntekt.ytelser.label')
                    }}>
                    <YtelseInfoWrapper ytelser={[]} />
                </Block>
                <Block
                    header={{
                        title: getMessage(intl, 'annenInntekt.arbeidsforhold.label'),
                        info: getMessage(intl, 'annenInntekt.arbeidsforhold.infotekst')
                    }}>
                    <InformasjonOmArbeidsforholdWrapper arbeidsforhold={arbeidsforhold} />
                    {harArbeidsforhold &&
                        uttaksplan.length > 0 && (
                            <VeilederInfo
                                messages={[
                                    {
                                        type: 'normal',
                                        contentIntlKey: 'annenInntekt.arbeidsforhold.veileder',
                                        values: {
                                            dato: formatDate(
                                                moment(uttaksplan[0].tidsperiode.fom)
                                                    .subtract(4, 'weeks')
                                                    .toDate()
                                            )
                                        }
                                    }
                                ]}
                            />
                        )}
                </Block>

                <Block hasChildBlocks={true} margin="none">
                    <FrilanserBolk
                        søker={søker}
                        onChangeSøker={(søkerProperties: Søker) => dispatch(søknadActions.updateSøker(søkerProperties))}
                        onChangeFrilansinformasjon={(frilansInformasjon: FrilansInformasjon) =>
                            dispatch(
                                søknadActions.updateSøker({
                                    frilansInformasjon
                                })
                            )
                        }
                        planInneholderFrilansaktivitet={planInneholderFrilansaktivitet}
                    />
                </Block>

                <Block hasChildBlocks={true} margin="none" visible={visibility.selvstendigNæringsdrivendeBolk(søker)}>
                    <SelvstendigNæringsdrivendeBolk
                        harJobbetSomSelvstendigNæringsdrivendeSiste10Mnd={
                            søker.harJobbetSomSelvstendigNæringsdrivendeSiste10Mnd
                        }
                        næringListe={søker.selvstendigNæringsdrivendeInformasjon || []}
                        onChangeSøker={(søkerProperties: Søker) => dispatch(søknadActions.updateSøker(søkerProperties))}
                        onChange={(updatedNæringer: Næring[]) =>
                            this.updateSøkerAndSave({
                                selvstendigNæringsdrivendeInformasjon: updatedNæringer
                            })
                        }
                        planInneholderSelvstendignæringaktivitet={planInneholderSelvstendignæringaktivitet}
                    />
                </Block>

                <Block hasChildBlocks={true} margin="none" visible={visibility.andreInntekterBolk(søker)}>
                    <AndreInntekterBolk
                        harHattAnnenInntektSiste10Mnd={harHattAnnenInntektSiste10Mnd}
                        andreInntekterSiste10Mnd={søker.andreInntekterSiste10Mnd || []}
                        onChangeSøker={(søkerProperties) => dispatch(søknadActions.updateSøker(søkerProperties))}
                        onChange={(andreInntekterSiste10Mnd) =>
                            dispatch(
                                søknadActions.updateSøker({
                                    andreInntekterSiste10Mnd
                                })
                            )
                        }
                    />
                </Block>
            </Steg>
        );
    }
}

const mapStateToProps = (state: AppState, props: Props): StateProps => {
    const { søknad } = state;
    const { history } = props;
    const { søker, uttaksplan } = søknad;
    const { arbeidsforhold } = props.søkerinfo;
    const planInneholderFrilansaktivitet: boolean = uttaksplanInneholderFrilansaktivitet(uttaksplan);
    const planInneholderSelvstendignæringaktivitet: boolean = uttaksplanInneholderSelvstendignæringaktivitet(
        uttaksplan
    );
    const missingAttachments = selectMissingAttachments(state);
    const attachmentMap = findAllAttachments(mapMissingAttachmentsOnSøknad(missingAttachments, _.cloneDeep(søknad)));
    const søknadsinfo = selectSøknadsinfo(state);

    const stegProps: StegProps = {
        id: StegID.ANDRE_INNTEKTER,
        renderFortsettKnapp: annenInntektErGyldig(søker),
        renderFormTag: true,
        history,
        isAvailable: isAvailable(StegID.ANDRE_INNTEKTER, state.søknad, props.søkerinfo, søknadsinfo),
        nesteStegID: skalViseManglendeVedleggSteg(attachmentMap) ? StegID.MANGLENDE_VEDLEGG : StegID.OPPSUMMERING
    };

    const familiehendelsesdato = søknadsinfo !== undefined ? søknadsinfo.søknaden.familiehendelsesdato : undefined;

    return {
        søker,
        arbeidsforhold,
        stegProps,
        uttaksplan,
        planInneholderFrilansaktivitet,
        planInneholderSelvstendignæringaktivitet,
        familiehendelsesdato
    };
};

export default connect<StateProps, {}, {}>(mapStateToProps)(injectIntl(AndreInntekterSteg));
