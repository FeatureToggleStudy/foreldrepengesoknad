import * as React from 'react';
import ChildSVG from 'app/components/uttaksplanlegger/components/childSvg/ChildSVG';
import PersonMedSnakkeboble from 'common/components/personMedSnakkeboble/PersonMedSnakkeboble';
import { FormattedMessage } from 'react-intl';

export interface Props {}

const TomUttaksplanInfo: React.StatelessComponent<Props> = (props) => (
    <PersonMedSnakkeboble
        dialog={{
            text: <FormattedMessage id="uttaksplan.tomPlan" />
        }}
        stil="kompakt"
        fyltBakgrunn={false}
        personRenderer={() => <ChildSVG />}
    />
);

export default TomUttaksplanInfo;
