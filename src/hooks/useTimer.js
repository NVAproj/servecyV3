import { useEffect, useRef, useCallback } from 'react';
import { useSurvey } from '../store/SurveyContext';

export function useTimer() {
    const { state, dispatch, clearSession } = useSurvey();
    const warningTimerRef = useRef(null);
    const clearTimerRef = useRef(null);

    const resetTimers = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

        if (Object.keys(state.currentAnswers).length === 0) return;

        warningTimerRef.current = setTimeout(() => {
            dispatch({ type: 'SHOW_WARNING' });
        }, 25000);


        clearTimerRef.current = setTimeout(() => {
            clearSession();
        }, 35000);
    }, [state.currentAnswers, dispatch, clearSession]);

    useEffect(() => {
        resetTimers();

        // Очистка при размонтировании
        return () => {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        };
    }, [state.currentAnswers, resetTimers]);

    const continueSession = () => {
        dispatch({ type: 'HIDE_WARNING' });
        resetTimers();
    };

    return { continueSession };
}