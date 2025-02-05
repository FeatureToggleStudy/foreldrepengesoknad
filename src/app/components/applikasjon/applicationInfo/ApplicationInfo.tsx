import * as React from 'react';
import './applicationInfo.less';
import BEMHelper from 'common/util/bem';

interface BUILDInfo {
    VERSION: string;
}

declare const BUILD: BUILDInfo;

export interface Props {}

const bem = BEMHelper('applicationInfo');

const ApplicationInfo: React.StatelessComponent<Props> = (props) => {
    try {
        return (
            <div className={bem.block} role="presentation" aria-hidden={true}>
                {BUILD.VERSION}
            </div>
        );
    } catch (e) {
        return null;
    }
};

export default ApplicationInfo;
