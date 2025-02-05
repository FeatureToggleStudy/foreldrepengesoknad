import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getMessage from 'common/util/i18nUtils';
import JaNeiSpørsmål from '../../common/components/skjema/elements/ja-nei-spørsmål/JaNeiSpørsmål';

export enum MorForSyk {
    'FOR_SYK' = 'forSyk',
    'IKKE_FOR_SYK' = 'ikkeForSyk'
}

interface MorForSykSpørsmålProps {
    erMorForSyk?: boolean;
    onChange: (erBarnetFødt: boolean) => void;
}

type Props = MorForSykSpørsmålProps & InjectedIntlProps;

const MorForSykSpørsmål = (props: Props) => {
    const { onChange, erMorForSyk, intl } = props;

    return (
        <JaNeiSpørsmål
            spørsmål={getMessage(intl, 'morForSykSpørsmål.spørsmål')}
            navn="morForSykSpørsmål"
            valgtVerdi={erMorForSyk}
            onChange={(verdi) => onChange(verdi)}
        />
    );
};

export default injectIntl(MorForSykSpørsmål);
