import { Barn, FødtBarn, UfødtBarn, Adopsjonsbarn, ForeldreansvarBarn } from '../../../types/søknad/Barn';
import Søknad, { Søkersituasjon, SøkerRolle } from '../../../types/søknad/Søknad';
import { Periode, TilgjengeligStønadskonto } from '../../../types/uttaksplan/periodetyper';
import { opprettUttaksperioderAleneomsorgMor } from './aleneomsorgMor';
import { opprettUttaksperioderToForeldreEttBarnMor } from './toForeldreEttBarnMor';
import { opprettUttaksperioderAleneomsorgFarEllerMedmor } from './aleneomsorgFarEllerMedmor';

const getFamiliehendelsesdato = (barn: Barn, situasjon: Søkersituasjon): Date | undefined => {
    if (situasjon === Søkersituasjon.FØDSEL) {
        return barn.erBarnetFødt ? (barn as FødtBarn).fødselsdatoer[0] : (barn as UfødtBarn).termindato;
    } else if (situasjon === Søkersituasjon.ADOPSJON) {
        return (barn as Adopsjonsbarn).adopsjonsdato;
    } else if (situasjon === Søkersituasjon.FORELDREANSVAR) {
        return (barn as ForeldreansvarBarn).foreldreansvarsdato;
    }
    return undefined;
};

export const lagMockUttaksplan = (
    søknad: Søknad,
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[]
): Periode[] => {
    const { søker, barn, situasjon, ekstrainfo } = søknad;
    const {
        uttaksplanSkjema: { fellesperiodeukerMor }
    } = ekstrainfo;
    const { erAleneOmOmsorg, rolle } = søker;
    const famDato = getFamiliehendelsesdato(barn, situasjon);
    const fellesUkerMor = fellesperiodeukerMor || 0;

    if (famDato) {
        if (situasjon === Søkersituasjon.FØDSEL) {
            if (erAleneOmOmsorg) {
                if (rolle === SøkerRolle.MOR) {
                    return opprettUttaksperioderAleneomsorgMor(famDato, tilgjengeligeStønadskontoer);
                } else {
                    return opprettUttaksperioderAleneomsorgFarEllerMedmor(famDato, tilgjengeligeStønadskontoer);
                }
            }
            if (!erAleneOmOmsorg) {
                if (rolle === SøkerRolle.MOR) {
                    return opprettUttaksperioderToForeldreEttBarnMor(
                        famDato,
                        fellesUkerMor,
                        tilgjengeligeStønadskontoer
                    );
                } else {
                    return opprettUttaksperioderToForeldreEttBarnMor(
                        famDato,
                        fellesUkerMor,
                        tilgjengeligeStønadskontoer
                    );
                }
            }
        } else if (situasjon === Søkersituasjon.ADOPSJON) {
            if (erAleneOmOmsorg && rolle === SøkerRolle.MOR) {
                const perioder = opprettUttaksperioderAleneomsorgMor(famDato, tilgjengeligeStønadskontoer);
                perioder.shift();
                return perioder;
            }
            if (!erAleneOmOmsorg && rolle === SøkerRolle.MOR) {
                const perioder = opprettUttaksperioderToForeldreEttBarnMor(famDato, 13, tilgjengeligeStønadskontoer);
                perioder.shift();
                return perioder;
            }
        } else if (situasjon === Søkersituasjon.FORELDREANSVAR) {
            if (erAleneOmOmsorg && rolle === SøkerRolle.MOR) {
                const perioder = opprettUttaksperioderAleneomsorgMor(famDato, tilgjengeligeStønadskontoer);
                perioder.shift();
                return perioder;
            }
            if (!erAleneOmOmsorg && rolle === SøkerRolle.MOR) {
                const perioder = opprettUttaksperioderToForeldreEttBarnMor(famDato, 13, tilgjengeligeStønadskontoer);
                perioder.shift();
                return perioder;
            }
        }
    }

    return [];
};
