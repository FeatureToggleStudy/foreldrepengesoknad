import * as React from 'react';
import * as classnames from 'classnames';

import { injectIntl, InjectedIntlProps } from 'react-intl';
import SlettKnapp from '../../../../../common/components/slettKnapp/SlettKnapp';

import './attachment.less';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Lenke from 'nav-frontend-lenker';
import { Attachment } from 'app/components/storage/attachment/types/Attachment';
import { bytesString } from 'app/util/filesize';
import BEMHelper from 'common/util/bem';
import VedleggIkon from 'common/components/ikoner/VedleggIkon';

interface OwnProps {
    attachment: Attachment;
    showFileSize?: boolean;
    onDelete?: (file: Attachment) => void;
}

type Props = OwnProps & InjectedIntlProps;

const Attachment: React.StatelessComponent<Props> = ({ attachment, showFileSize, onDelete, intl }) => {
    const BEM = BEMHelper('attachment');
    const cls = classnames(BEM.block, {
        [BEM.modifier('pending')]: attachment.pending
    });

    return (
        <div className={cls}>
            {attachment.pending && (
                <div className={BEM.element('spinner')}>
                    <NavFrontendSpinner type="S" />
                </div>
            )}
            <VedleggIkon className={BEM.element('icon')} width={20} height={20} />
            <div className={BEM.element('filename')}>
                {attachment.url ? (
                    <Lenke href={attachment.url} target="_blank">
                        {attachment.filename}
                    </Lenke>
                ) : (
                    <React.Fragment>{attachment.filename}</React.Fragment>
                )}
                {showFileSize && <div>{bytesString(attachment.filesize)}</div>}
            </div>
            {onDelete &&
                attachment.uploaded &&
                !attachment.pending && (
                    <span className={BEM.element('deleteButton')}>
                        <SlettKnapp
                            onClick={() => onDelete(attachment)}
                            ariaLabel={intl.formatMessage(
                                { id: 'vedlegg.arialabel.slett' },
                                { navn: attachment.filename }
                            )}
                        />
                    </span>
                )}
        </div>
    );
};

export default injectIntl(Attachment);
