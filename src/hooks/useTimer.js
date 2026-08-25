import { useEffect, useRef, useCallback } from 'react';
import { useSurvey } from '../store/SurveyContext';

export function useTimer() {
    const { state, dispatch, clearSession } = useSurvey();
    const warningTimerRef = useRef(null);
    const clearTimerRef = useRef(null);

    const resetTimers = useCallback(() => {
        // Очищаем существующие таймеры
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

        // Не запускаем таймеры, если нет активных ответов
        if (Object.keys(state.currentAnswers).length === 0) return;

        // Таймер предупреждения (25 секунд)
        warningTimerRef.current = setTimeout(() => {
            dispatch({ type: 'SHOW_WARNING' });
        }, 25000);

        // Таймер очистки (35 секунд = 25 + 10)
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