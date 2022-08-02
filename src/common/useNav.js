import { useCallback } from 'react';
import { h0 } from './fp';

export default function useNav(departDate, dispatch, prevDate, nextDate) {
    //当出发日期小于等于今天时 禁用向前
    const isPrevDisabled = h0(departDate) <= h0();
    //当出发日期大于今天以后20天时 禁用向后
    const isNextDisabled = h0(departDate) - h0() > 20 * 86400 * 1000;

    const prev = useCallback(() => {
        if (isPrevDisabled) {
            return;
        }
        dispatch(prevDate());
    }, [isPrevDisabled]);

    const next = useCallback(() => {
        if (isNextDisabled) {
            return;
        }
        dispatch(nextDate());
    }, [isNextDisabled]);

    return {
        isPrevDisabled,
        isNextDisabled,
        prev,
        next,
    };
}
