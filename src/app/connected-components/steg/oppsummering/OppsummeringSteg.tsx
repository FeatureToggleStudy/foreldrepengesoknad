import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { BekreftCheckboksPanel } from 'nav-frontend-skjema';

import Steg, { StegProps } from '../../../components/steg/Steg';

import { AppState } from '../../../redux/reducers';
import { DispatchProps } from 'common/redux/types';
import { HistoryProps } from '../../../types/common';
import Person from '../../../types/Person';
import getMessage from 'common/util/i18nUtils';

import søknadActions from '../../../redux/actions/søknad/søknadActionCreators';
import Søknad from '../../../types/søknad/Søknad';
import { Periode } from 'uttaksplan/types';
import { apiActionCreators } from '../../../redux/actions';
import routeConfig from '../../../util/routing/routeConfig';
import { StegID } from '../../../util/routing/stegConfig';
import summaryActionCreators from '../../../redux/actions/summary/summaryActionCreators';
import OppsummeringWrapper from 'common/components/oppsummering/OppsummeringWrapper';
import { cleanUpSøknad } from '../../../util/søknad/cleanup';
import { ForeldrepengesøknadResponse } from '../../../types/ForeldrepengesøknadResponse';

interface StateProps {
    person: Person;
    søknad: Søknad;
    kvittering?: ForeldrepengesøknadResponse;
    godkjenteSteg: {};
    stegProps: StegProps;
    perioder: Periode[];
}

type Props = StateProps & InjectedIntlProps & DispatchProps & HistoryProps;
class OppsummeringSteg extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.sendSøknad = this.sendSøknad.bind(this);
    }

    componentDidUpdate(previousProps: Props, newProps: Props) {
        if (this.props.kvittering) {
            this.props.history.push(
                `${routeConfig.APP_ROUTE_PREFIX}søknad-sendt`
            );
        }
    }

    sendSøknad() {
        const { søknad, perioder, dispatch } = this.props;
        dispatch(
            apiActionCreators.sendSøknad({
                ...cleanUpSøknad(søknad),
                uttaksplan: [...(perioder || [])]
            })
        );
    }

    confirmSteg(stegID: StegID) {
        const { dispatch } = this.props;
        dispatch(summaryActionCreators.approveSteg(stegID));
    }

    render() {
        const {
            søknad,
            person,
            godkjenteSteg,
            stegProps,
            dispatch,
            intl
        } = this.props;
        if (person === undefined) {
            return null;
        }

        return (
            <Steg {...stegProps} onSubmit={this.sendSøknad}>
                <OppsummeringWrapper
                    className="blokk-m"
                    person={person}
                    søknad={søknad}
                    godkjenteSteg={godkjenteSteg}
                    confirmSteg={(stegID: StegID) => this.confirmSteg(stegID)}
                />
                <BekreftCheckboksPanel
                    className="blokk-m"
                    checked={søknad.harGodkjentOppsummering}
                    label={getMessage(intl, 'oppsummering.samtykke')}
                    onChange={() => {
                        dispatch(
                            søknadActions.updateSøknad({
                                harGodkjentOppsummering: !søknad.harGodkjentOppsummering
                            })
                        );
                    }}
                />
            </Steg>
        );
    }
}

const mapStateToProps = (state: AppState, props: Props): StateProps => {
    const søknad = state.søknad;
    const person = state.api.person as Person;
    const stegProps: StegProps = {
        id: StegID.OPPSUMMERING,
        renderFortsettKnapp: søknad.harGodkjentOppsummering, // TODO check if all steps is approved.
        history: props.history
    };

    return {
        person,
        søknad,
        godkjenteSteg: state.summary.godkjenteSteg,
        perioder: state.uttaksplan.uttaksplan.perioder,
        kvittering: state.api.kvittering,
        stegProps
    };
};

export default connect<StateProps, {}, {}>(mapStateToProps)(
    injectIntl(OppsummeringSteg)
);
