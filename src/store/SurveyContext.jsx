import { createContext, useContext, useReducer, useEffect } from 'react';
import { surveyRepository, sessionRepository, resultsRepository } from '../db/repositories';
import { defaultSurvey } from '../data/defaultSurvey';

const SurveyContext = createContext();

const initialState = {
    survey: null,
    currentAnswers: {},
    sessionId: null,
    startedAt: null,
    lastActivity: null,
    isPending: false,
    showWarning: false,
    isSubmitting: false,
    showSuccess: false,
    error: null,
    loading: true,
};

function surveyReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'LOAD_SURVEY':
            return { ...state, survey: action.payload, loading: false };

        case 'LOAD_SESSION':
            return {
                ...state,
                currentAnswers: action.payload.answers,
                sessionId: action.payload.sessionId,
                startedAt: action.payload.startedAt,
                lastActivity: action.payload.lastActivity,
            };

        case 'SET_ANSWER':
            return {
                ...state,
                currentAnswers: {
                    ...state.currentAnswers,
                    [action.payload.questionId]: action.payload.optionIds,
                },
                lastActivity: new Date().toISOString(),
            };

        case 'CLEAR_ANSWER':
            const { [action.payload.questionId]: removed, ...rest } = state.currentAnswers;
            return {
                ...state,
                currentAnswers: rest,
                lastActivity: new Date().toISOString(),
            };

        case 'SHOW_WARNING':
            return { ...state, showWarning: true };

        case 'HIDE_WARNING':
            return { ...state, showWarning: false };

        case 'CLEAR_SESSION':
            return {
                ...state,
                currentAnswers: {},
                sessionId: null,
                startedAt: null,
                lastActivity: null,
                showWarning: false,
            };

        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };

        case 'SHOW_SUCCESS':
            return { ...state, showSuccess: true };

        case 'HIDE_SUCCESS':
            return { ...state, showSuccess: false };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        default:
            return state;
    }
}

export function SurveyProvider({ children }) {
    const [state, dispatch] = useReducer(surveyReducer, initialState);

    useEffect(() => {
        async function initialize() {
            try {
                let survey = await surveyRepository.getSurvey();
                if (!survey) {
                    await surveyRepository.saveSurvey(defaultSurvey);
                    survey = defaultSurvey;
                }
                dispatch({ type: 'LOAD_SURVEY', payload: survey });

                const session = await sessionRepository.getSession();
                if (session) {
                    const lastActivity = new Date(session.lastActivity);
                    const now = new Date();
                    const diffSeconds = (now - lastActivity) / 1000;

                    if (diffSeconds <= 35) {
                        dispatch({ type: 'LOAD_SESSION', payload: session });
                    } else {
                        await sessionRepository.clearSession();
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
                dispatch({ type: 'SET_ERROR', payload: error.message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }

        initialize();
    }, []);

    useEffect(() => {
        if (state.currentAnswers && Object.keys(state.currentAnswers).length > 0) {
            const session = {
                sessionId: state.sessionId || `session_${Date.now()}`,
                answers: state.currentAnswers,
                startedAt: state.startedAt || new Date().toISOString(),
                lastActivity: state.lastActivity || new Date().toISOString(),
                isPending: state.isPending,
            };

            sessionRepository.saveSession(session);

            if (!state.sessionId) {
                dispatch({ type: 'LOAD_SESSION', payload: session });
            }
        }
    }, [state.currentAnswers, state.lastActivity]);

    const setAnswer = (questionId, optionIds) => {
        if (optionIds.length === 0) {
            dispatch({ type: 'CLEAR_ANSWER', payload: { questionId } });
        } else {
            dispatch({ type: 'SET_ANSWER', payload: { questionId, optionIds } });
        }
    };

    const clearSession = async () => {
        await sessionRepository.clearSession();
        dispatch({ type: 'CLEAR_SESSION' });
    };

    const submitSurvey = async (onSuccess) => {
        dispatch({ type: 'SET_SUBMITTING', payload: true });

        try {
            const answersArray = Object.entries(state.currentAnswers).map(([questionId, optionIds]) => ({
                q: parseInt(questionId),
                a: optionIds,
            }));

            await resultsRepository.saveResult(answersArray);
            await clearSession();

            dispatch({ type: 'SHOW_SUCCESS' });

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 3000);
            }

            setTimeout(() => {
                dispatch({ type: 'HIDE_SUCCESS' });
            }, 3000);

        } catch (error) {
            console.error('Submit error:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка при отправке' });
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    };

    return (
        <SurveyContext.Provider value={{
            state,
            dispatch,
            setAnswer,
            clearSession,
            submitSurvey,
        }}>
            {children}
        </SurveyContext.Provider>
    );
}

export function useSurvey() {
    const context = useContext(SurveyContext);
    if (!context) {
        throw new Error('useSurvey must be used within SurveyProvider');
    }
    return context;
}