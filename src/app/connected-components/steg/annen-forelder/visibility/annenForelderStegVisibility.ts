import Søknad from '../../../../types/søknad/Søknad';
import { Søkerinfo } from '../../../../types/søkerinfo';
import AnnenForelder from '../../../../types/søknad/AnnenForelder';
import { Søker } from '../../../../types/søknad/Søker';
import { Barn } from '../../../../types/søknad/Barn';
import Person from '../../../../types/Person';
import { QuestionConfig, Questions, questionIsAnswered, QuestionVisibility } from '../../../../util/questions/Question';
import { erFarEllerMedmor } from '../../../../util/domain/personUtil';

interface AnnenForelderSpørsmålPayload {
    søker: Søker;
    barn: Barn;
    annenForelder: AnnenForelder;
    person: Person;
    søkerErFarEllerMedmor: boolean;
    annenForelderErRegistrert: boolean;
}

export enum AnnenForelderSpørsmålKeys {
    'navnPåAnnenForelder' = 'navnPåAnnenForelder',
    'kanIkkeOppgis' = 'kanIkkeOppgis',
    'fødselsnummer' = 'fødselsnummer',
    'deltOmsorg' = 'deltOmsorg',
    'erAnnenForelderInformert' = 'erAnnenForelderInformert',
    'erMorUfør' = 'erMorUfør',
    'harRettPåForeldrepenger' = 'harRettPåForeldrepenger',
    'datoForAleneomsorg' = 'datoForAleneomsorg'
}

export type AnnenForelderStegVisibility = QuestionVisibility<AnnenForelderSpørsmålKeys>;

const annenForelderSpørsmålConfig: QuestionConfig<AnnenForelderSpørsmålPayload, AnnenForelderSpørsmålKeys> = {
    [AnnenForelderSpørsmålKeys.navnPåAnnenForelder]: {
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.fornavn),
        condition: (props) => props.annenForelderErRegistrert === false,
        isOptional: (props) => props.annenForelder.kanIkkeOppgis === true
    },
    [AnnenForelderSpørsmålKeys.kanIkkeOppgis]: {
        isOptional: () => true,
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.kanIkkeOppgis),
        condition: (props) => props.annenForelderErRegistrert === false
    },
    [AnnenForelderSpørsmålKeys.fødselsnummer]: {
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.fnr),
        condition: (props) => {
            return (
                props.annenForelder.kanIkkeOppgis !== true &&
                props.annenForelderErRegistrert === false &&
                questionIsAnswered(props.annenForelder.fornavn)
            );
        }
    },
    [AnnenForelderSpørsmålKeys.deltOmsorg]: {
        isAnswered: ({ søker }) => questionIsAnswered(søker.erAleneOmOmsorg),
        condition: (props) =>
            props.annenForelder.kanIkkeOppgis !== true &&
            (props.annenForelderErRegistrert === true ||
                ((props.annenForelder.utenlandskFnr !== true && questionIsAnswered(props.annenForelder.fnr)) ||
                    (props.annenForelder.utenlandskFnr === true &&
                        questionIsAnswered(props.annenForelder.bostedsland) &&
                        questionIsAnswered(props.annenForelder.fnr))))
    },
    [AnnenForelderSpørsmålKeys.harRettPåForeldrepenger]: {
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.harRettPåForeldrepenger),
        parentQuestion: AnnenForelderSpørsmålKeys.deltOmsorg,
        condition: (props) => {
            return (
                props.søker.erAleneOmOmsorg === false ||
                (props.søker.erAleneOmOmsorg && props.søkerErFarEllerMedmor === false)
            );
        }
    },
    [AnnenForelderSpørsmålKeys.erMorUfør]: {
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.erUfør),
        parentQuestion: AnnenForelderSpørsmålKeys.harRettPåForeldrepenger,
        condition: (props) =>
            props.søker.erAleneOmOmsorg === false &&
            props.annenForelder.harRettPåForeldrepenger === false &&
            props.søkerErFarEllerMedmor
    },
    [AnnenForelderSpørsmålKeys.erAnnenForelderInformert]: {
        isAnswered: ({ annenForelder }) => questionIsAnswered(annenForelder.erInformertOmSøknaden),
        parentQuestion: AnnenForelderSpørsmålKeys.deltOmsorg,
        condition: (props) => {
            return props.søker.erAleneOmOmsorg === false && props.annenForelder.harRettPåForeldrepenger === true;
        }
    },
    [AnnenForelderSpørsmålKeys.datoForAleneomsorg]: {
        isAnswered: ({ barn }) => barn.datoForAleneomsorg !== undefined,
        parentQuestion: AnnenForelderSpørsmålKeys.deltOmsorg,
        condition: (props) => props.søker.erAleneOmOmsorg === true && props.søkerErFarEllerMedmor === true
    }
};

export const getAnnenForelderStegVisibility = (
    søknad: Partial<Søknad>,
    søkerinfo: Søkerinfo
): QuestionVisibility<AnnenForelderSpørsmålKeys> | undefined => {
    const { annenForelder, søker, barn } = søknad;
    const { person } = søkerinfo;

    if (!søker || !barn || !annenForelder || !person) {
        return undefined;
    }
    const registrertAnnenForelder = søknad.sensitivInfoIkkeLagre
        ? søknad.sensitivInfoIkkeLagre.registrertAnnenForelder
        : undefined;

    const payload: AnnenForelderSpørsmålPayload = {
        søker,
        barn,
        annenForelder,
        person,
        søkerErFarEllerMedmor: erFarEllerMedmor(søker.rolle),
        annenForelderErRegistrert: registrertAnnenForelder !== undefined
    };

    return Questions(annenForelderSpørsmålConfig).getVisbility(payload);
};
