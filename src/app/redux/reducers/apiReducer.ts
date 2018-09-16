import { ApiActionKeys, ApiActionTypes } from '../actions/api/apiActionDefinitions';
import { Kvittering } from '../../types/Kvittering';
import { Søkerinfo } from '../../types/søkerinfo';
import { TilgjengeligStønadskonto } from '../../types/uttaksplan/periodetyper';

export interface ApiState {
    søkerinfo?: Søkerinfo;
    isLoadingSøkerinfo: boolean;
    isLoadingAppState: boolean;
    isLoadingTilgjengeligeStønadskontoer: boolean;
    søknadSendingInProgress: boolean;
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[];
    kvittering?: Kvittering;
    error: any;
}

export type ApiStatePartial = Partial<ApiState>;

const getDefaultState = (): ApiState => ({
    isLoadingSøkerinfo: false,
    isLoadingAppState: false,
    isLoadingTilgjengeligeStønadskontoer: false,
    søknadSendingInProgress: false,
    tilgjengeligeStønadskontoer: [],
    error: {
        networkError: false
    }
});

const apiReducer = (state = getDefaultState(), action: ApiActionTypes): ApiStatePartial => {
    switch (action.type) {
        case ApiActionKeys.UPDATE_API:
            return {
                ...state,
                ...action.payload
            };
        case ApiActionKeys.GET_SØKERINFO:
            return {
                ...state,
                isLoadingSøkerinfo: true
            };
        case ApiActionKeys.GET_TILGJENGELIGE_STØNADSKONTOER:
            return {
                ...state,
                isLoadingTilgjengeligeStønadskontoer: true
            };
        case ApiActionKeys.GET_STORED_APP_STATE:
            return {
                ...state,
                isLoadingAppState: true
            };
        case ApiActionKeys.DELETE_STORED_APP_STATE:
            return {
                ...state,
                isLoadingAppState: true
            };
    }
    return state;
};

export default apiReducer;
