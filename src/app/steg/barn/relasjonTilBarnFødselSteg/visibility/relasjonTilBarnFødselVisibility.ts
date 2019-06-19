import { RelasjonTilBarFødselVisibilityFunctions as f } from './visibilityFunctions';
import { skalSøkerLasteOppTerminbekreftelse } from '../../../../util/validation/steg/barn';
import { getErSøkerFarEllerMedmor } from '../../../../util/domain/personUtil';
import { ApiState } from '../../../../redux/reducers/apiReducer';
import Søknad from '../../../../types/søknad/Søknad';
import { isUfødtBarn } from '../../../../types/søknad/Barn';

export interface RelasjonTilBarnFødtVisibility {
    fødselsdatoer: boolean;
    fødselsattest: boolean;
}

export interface RelasjonTilBarnUfødtVisibility {
    erMorForSyk: boolean;
    terminbekreftelseDato: boolean;
    terminbekreftelse: boolean;
    termindato: boolean;
}

export interface RelasjonTilBarnFødselStegVisibility {
    hvilketBarnGjelderSøknadenBolk: boolean;
    erBarnetFødt: boolean;
    ufødtBarnPart: boolean;
    fødtBarnPart: boolean;
    født: RelasjonTilBarnFødtVisibility;
    ufødt: RelasjonTilBarnUfødtVisibility;
}

export const getRelasjonTilBarnFødselVisibility = (
    søknad: Søknad,
    api: ApiState
): RelasjonTilBarnFødselStegVisibility => {
    const { søkerinfo } = api;
    const {
        søker,
        barn,
        situasjon,
        ekstrainfo: { søknadenGjelderBarnValg }
    } = søknad;

    const søkerErFarEllerMedmor = getErSøkerFarEllerMedmor(søker.rolle);

    const skalLasteOppTerminbekreftelse = skalSøkerLasteOppTerminbekreftelse(søknad, søkerinfo!);
    const registrerteBarn = søkerinfo!.registrerteBarn || [];

    const hvilketBarnGjelderSøknadenBolk = f.hvilkeBarnGjelderSøknadenBolkVisible(registrerteBarn);
    const erBarnetFødt = f.erBarnetFødtSpørsmålVisible(
        hvilketBarnGjelderSøknadenBolk,
        søknadenGjelderBarnValg ? søknadenGjelderBarnValg.gjelderAnnetBarn : undefined
    );
    const ufødtBarnPart = f.ufødtBarnPartialVisible(erBarnetFødt, barn);
    const fødtBarnPart = f.fødtBarnPartialVisible(erBarnetFødt, barn);

    const fødselsdatoer = f.fødselsdatoerSpørsmålVisible(fødtBarnPart, barn);
    const fødselsattest = f.fødselsattestUploaderVisible(fødselsdatoer, barn);

    const erMorForSyk = f.morForSykSpørsmålVisible(ufødtBarnPart, søkerErFarEllerMedmor);
    const termindato = f.termindatoVisible(ufødtBarnPart, barn);
    const terminbekreftelse =
        isUfødtBarn(barn, situasjon) &&
        f.terminbekreftelsePartialVisible(termindato, barn, skalLasteOppTerminbekreftelse);
    const terminbekreftelseDato = f.terminbekreftelseDatoVisible(terminbekreftelse, barn);

    return {
        hvilketBarnGjelderSøknadenBolk,
        ufødtBarnPart,
        fødtBarnPart,
        erBarnetFødt,
        født: {
            fødselsdatoer,
            fødselsattest
        },
        ufødt: {
            erMorForSyk,
            termindato,
            terminbekreftelse,
            terminbekreftelseDato
        }
    };
};
