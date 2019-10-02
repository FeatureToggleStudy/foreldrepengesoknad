import * as React from 'react';
import DevBlock from 'common/dev/DevBlock';
import Periodeliste from 'app/components/uttaksplanlegger/components/periodeliste/Periodeliste';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Søknadsinfo } from 'app/selectors/types';
import { Periode } from 'app/types/uttaksplan/periodetyper';

interface Props {
    søknadsinfo: Søknadsinfo;
    perioderSomSkalSendesInn: Periode[];
}

const DevPerioderSomSendesInn: React.StatelessComponent<Props> = ({ søknadsinfo, perioderSomSkalSendesInn }) => (
    <DevBlock alwaysActive={true}>
        <Ekspanderbartpanel tittel="Perioder som sendes inn" apen={true}>
            <Periodeliste
                søknadsinfo={søknadsinfo}
                perioder={perioderSomSkalSendesInn}
                meldingerPerPeriode={{}}
                informasjon={undefined}
                navnPåForeldre={søknadsinfo.navn.navnPåForeldre}
                lastAddedPeriodeId={undefined}
                onReplaceHullWithOpphold={() => null}
                onReplaceHullWithPeriode={() => null}
                deletePeriode={() => null}
                updatePeriode={() => null}
                antallFeriedager={0}
            />
        </Ekspanderbartpanel>
    </DevBlock>
);

export default DevPerioderSomSendesInn;
