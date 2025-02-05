import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ApplicationSpinner from 'common/components/applicationSpinner/ApplicationSpinner';
import DocumentTitle from 'react-document-title';
import getMessage from 'common/util/i18nUtils';
import Applikasjonsside from 'app/components/applikasjon/applikasjonsside/Applikasjonsside';

type Props = InjectedIntlProps;

const LoadingScreen: React.StatelessComponent<Props> = (props: Props) => {
    return (
        <Applikasjonsside>
            <DocumentTitle title={getMessage(props.intl, 'dokument.tittel.loadingScreen')} />
            <ApplicationSpinner />
        </Applikasjonsside>
    );
};

export default injectIntl(LoadingScreen);
