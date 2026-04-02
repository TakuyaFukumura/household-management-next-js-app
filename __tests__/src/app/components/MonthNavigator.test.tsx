/**
 * MonthNavigator コンポーネントのテスト
 */
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthNavigator from '@/app/components/MonthNavigator';

describe('MonthNavigator', () => {
    const onPrevMonth = jest.fn();
    const onNextMonth = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('選択中の年月が「YYYY年MM月」形式で表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
            />
        );
        expect(screen.getByText('2025年04月')).toBeInTheDocument();
    });

    it('年をまたぐ月（12月）が正しく表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2024-12"
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
            />
        );
        expect(screen.getByText('2024年12月')).toBeInTheDocument();
    });

    it('前月ボタンをクリックすると onPrevMonth が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: /前月/}));
        expect(onPrevMonth).toHaveBeenCalledTimes(1);
    });

    it('翌月ボタンをクリックすると onNextMonth が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: /翌月/}));
        expect(onNextMonth).toHaveBeenCalledTimes(1);
    });
});
