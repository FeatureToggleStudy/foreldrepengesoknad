import { Attachment } from 'common/storage/attachment/types/Attachment';
import { Kjønn } from '../../../../types/common';
import { RegistrertAnnenForelder } from '../../../../types/Person';
import { SøkerRolle, Søkersituasjon, SøknadPartial } from '../../../../types/søknad/Søknad';
import { AnnenForelderVisibilityFuncs as func } from '../visibility/visibilitySelectors';
import { ForeldreansvarBarn } from '../../../../types/s\u00F8knad/Barn';

const attachment: Partial<Attachment> = {};

const registrertAnnenForelder: RegistrertAnnenForelder = {
    fnr: '28019400133',
    fornavn: 'FAR',
    etternavn: 'FARSEN',
    kjønn: Kjønn.MANN,
    fødselsdato: new Date('1994-01-27T23:00:00.000Z')
};

const søknad: Partial<SøknadPartial> = {
    type: 'foreldrepenger',
    annenForelder: {
        fnr: '123',
        navn: 'FAR FARSEN',
        skalHaForeldrepenger: true,
        harRettPåForeldrepenger: true
    },
    barn: {
        fødselsdatoer: ['2018-03-28T22:00:00.000Z'],
        antallBarn: 1,
        erBarnetFødt: true
    },
    søker: {
        erAleneOmOmsorg: true,
        andreInntekterSiste10Mnd: [],
        rolle: SøkerRolle.MOR
    },
    harGodkjentVilkår: true,
    harGodkjentOppsummering: false,
    situasjon: Søkersituasjon.FØDSEL,
    temp: {
        søknadenGjelderBarnValg: {
            gjelderAnnetBarn: false,
            valgteBarn: [
                {
                    fornavn: 'BARN',
                    etternavn: 'MORSEN',
                    fnr: '1234',
                    kjønn: Kjønn.KVINNE,
                    fødselsdato: new Date('2018-03-28T22:00:00.000Z'),
                    annenForelder: registrertAnnenForelder
                }
            ]
        },
        registrertAnnenForelder
    }
};

describe('AnnenForelder visibility tests', () => {
    describe('Main and partials', () => {
        it('should choose between registrertAnnenForelder personalia and annenForelderSkjema', () => {
            expect(func.visRegistrertAnnenForelderBolk.resultFunc(registrertAnnenForelder)).toBeTruthy();
            expect(func.visAnnenForelderPersonaliaSkjema.resultFunc(registrertAnnenForelder)).toBeFalsy();
            expect(func.visRegistrertAnnenForelderBolk.resultFunc(undefined)).toBeFalsy();
            expect(func.visAnnenForelderPersonaliaSkjema.resultFunc(undefined)).toBeTruthy();
        });
        it('Should show visAnnenForelderOppfølging on defined registrertAnnenForelder defined name/fnr', () => {
            expect(func.visAnnenForelderOppfølgingPartial.resultFunc(søknad.annenForelder!, undefined)).toBeTruthy();
            expect(
                func.visAnnenForelderOppfølgingPartial.resultFunc({ navn: 'abc', fnr: '123' }, undefined)
            ).toBeTruthy();
            expect(func.visAnnenForelderOppfølgingPartial.resultFunc({ navn: 'asd', fnr: '' }!, undefined)).toBeFalsy();
            expect(func.visAnnenForelderOppfølgingPartial.resultFunc({ navn: '', fnr: '' }!, undefined)).toBeFalsy();
        });
    });
    describe('Routing visibilities', () => {
        describe('visAnnenForelderErKjentPartial', () => {
            it('Should not render skalFarEllerMedmorHaForeldrepengerSpørsmål when er alene om omsorg and !farEllerMedmor', () => {
                expect(
                    func.visSkalFarEllerMedmorHaForeldrepengerSpørsmål.resultFunc({ erAleneOmOmsorg: true }, false)
                ).toBeTruthy();
                expect(
                    func.visSkalFarEllerMedmorHaForeldrepengerSpørsmål.resultFunc({ erAleneOmOmsorg: false }, false)
                ).toBeFalsy();
                expect(
                    func.visSkalFarEllerMedmorHaForeldrepengerSpørsmål.resultFunc({ erAleneOmOmsorg: false }, true)
                ).toBeFalsy();
            });

            describe('SkalAnnenForelderHaForeldrepengerSpørsmål should render when', () => {
                it('annenForelder har rett på foreldrepenger', () => {
                    expect(
                        func.visSkalAnnenForelderHaForeldrepengerSpørsmål.resultFunc(
                            { skalHaForeldrepenger: true },
                            {},
                            undefined
                        )
                    ).toBeTruthy();
                });
                it('søker is not aleneOmOmsorg and andreForelderHarOpplyst om sin sak', () => {
                    expect(
                        func.visSkalAnnenForelderHaForeldrepengerSpørsmål.resultFunc(
                            {},
                            { erAleneOmOmsorg: false },
                            false
                        )
                    ).toBeTruthy();
                });
            });
            it('SkalAnnenForelderHaForeldrepengerSpørsmål should not render', () => {
                expect(
                    func.visSkalAnnenForelderHaForeldrepengerSpørsmål.resultFunc(
                        { skalHaForeldrepenger: false },
                        {},
                        undefined
                    )
                ).toBeFalsy();
                expect(
                    func.visSkalAnnenForelderHaForeldrepengerSpørsmål.resultFunc({}, { erAleneOmOmsorg: false }, true)
                ).toBeFalsy();
                expect(
                    func.visSkalAnnenForelderHaForeldrepengerSpørsmål.resultFunc({}, { erAleneOmOmsorg: true }, true)
                ).toBeFalsy();
            });

            it('Should render ErMorUførSpørsmål', () => {
                expect(func.visErMorUførSpørsmål.resultFunc({ harRettPåForeldrepenger: false }, true)).toBeTruthy();
                expect(func.visErMorUførSpørsmål.resultFunc({ harRettPåForeldrepenger: false }, false)).toBeFalsy();
                expect(func.visErMorUførSpørsmål.resultFunc({ harRettPåForeldrepenger: true }, true)).toBeFalsy();
                expect(func.visErMorUførSpørsmål.resultFunc({ harRettPåForeldrepenger: true }, false)).toBeFalsy();
            });

            it('Should render infoOmRettigheterOgDelingAvUttaksplan', () => {
                expect(
                    func.visInfoOmRettigheterOgDelingAvUttaksplan.resultFunc({ harRettPåForeldrepenger: true })
                ).toBeTruthy();
                expect(
                    func.visInfoOmRettigheterOgDelingAvUttaksplan.resultFunc({ harRettPåForeldrepenger: false })
                ).toBeFalsy();
            });

            it('Should erDenAndreForelderenInformertSpørsmål', () => {
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc(
                        { erAleneOmOmsorg: false },
                        { harRettPåForeldrepenger: false },
                        true,
                        true
                    )
                ).toBeTruthy();
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc(
                        { erAleneOmOmsorg: false },
                        { harRettPåForeldrepenger: true },
                        true,
                        true
                    )
                ).toBeTruthy();
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc(
                        { erAleneOmOmsorg: true },
                        { harRettPåForeldrepenger: false },
                        true,
                        true
                    )
                ).toBeFalsy();
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc({ erAleneOmOmsorg: true }, {}, true, true)
                ).toBeFalsy();
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc(
                        { erAleneOmOmsorg: false },
                        {},
                        true,
                        false
                    )
                ).toBeFalsy();
                expect(
                    func.visErDenAndreForelderenInformertSpørsmål.resultFunc(
                        { erAleneOmOmsorg: false },
                        {},
                        false,
                        false
                    )
                ).toBeFalsy();
            });

            it('Should render visOmsorgsovertakelseDatoSpørsmål', () => {
                expect(func.visOmsorgsovertakelseDatoSpørsmål.resultFunc({ erAleneOmOmsorg: true })).toBeTruthy();
                expect(func.visOmsorgsovertakelseDatoSpørsmål.resultFunc({ erAleneOmOmsorg: false })).toBeFalsy();
            });

            it('Should render visFarEllerMedmorBolk', () => {
                expect(func.visFarEllerMedmorBolk.resultFunc(true)).toBeTruthy();
                expect(func.visFarEllerMedmorBolk.resultFunc(false)).toBeFalsy();
            });

            it('Should render visOmsorgsovertakelseVedleggSpørsmål', () => {
                const barn: Partial<ForeldreansvarBarn> = { foreldreansvarsdato: new Date() };
                expect(
                    func.visOmsorgsovertakelseVedleggSpørsmål.resultFunc({ erAleneOmOmsorg: true }, barn)
                ).toBeTruthy();
                expect(
                    func.visOmsorgsovertakelseVedleggSpørsmål.resultFunc(
                        { erAleneOmOmsorg: false },
                        { ...barn, foreldreansvarsdato: undefined }
                    )
                ).toBeFalsy();
            });
        });

        describe('AnnenForelderPersonaliaPartial', () => {
            it('Should not render annenForelderKanIkkeOppgisValg when barn.gjelderAdopsjonAvEktefellesBarn', () => {
                expect(func.visAnnenForelderKanIkkeOppgisValg.resultFunc(false)).toBeTruthy();
                expect(func.visAnnenForelderKanIkkeOppgisValg.resultFunc(true)).toBeFalsy();
            });
            it('Should only render fødselsnummerInput when navn has value', () => {
                expect(func.visFødselsnummerInput.resultFunc({ navn: undefined })).toBeFalsy();
                expect(func.visFødselsnummerInput.resultFunc({ navn: '' })).toBeFalsy();
                expect(func.visFødselsnummerInput.resultFunc({ navn: 'a' })).toBeTruthy();
            });
        });

        it('Should show omsorgsovertakelse when omsorgsovertakelse has one or more attachments', () => {
            expect(func.visOmsorgsovertakelse.resultFunc(søknad.barn!)).toBeFalsy();
            expect(func.visOmsorgsovertakelse.resultFunc({ ...søknad.barn, omsorgsovertakelse: [] }!)).toBeFalsy();
            expect(
                func.visOmsorgsovertakelse.resultFunc({
                    ...søknad.barn,
                    omsorgsovertakelse: [attachment as Attachment]
                })
            ).toBeTruthy();
        });
    });
});
