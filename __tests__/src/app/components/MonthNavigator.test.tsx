/**
 * MonthNavigator コンポーネントのテスト
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthNavigator from '@/app/components/MonthNavigator';

describe('MonthNavigator', () => {
    const onMonthChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('選択中の年が年入力欄に表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        expect(screen.getByRole('combobox', {name: '年'})).toHaveValue('2025');
    });

    it('選択中の月が月入力欄に表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        expect(screen.getByRole('combobox', {name: '月'})).toHaveValue('04');
    });

    it('年をまたぐ月（12月）の年入力欄が正しく表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2024-12"
                onMonthChange={onMonthChange}
            />
        );
        expect(screen.getByRole('combobox', {name: '年'})).toHaveValue('2024');
        expect(screen.getByRole('combobox', {name: '月'})).toHaveValue('12');
    });

    it('前月ボタンをクリックすると前月で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: '前月'}));
        expect(onMonthChange).toHaveBeenCalledWith('2025-03');
    });

    it('翌月ボタンをクリックすると翌月で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: '翌月'}));
        expect(onMonthChange).toHaveBeenCalledWith('2025-05');
    });

    it('1月の前月ボタンをクリックすると前年12月で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-01"
                onMonthChange={onMonthChange}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: '前月'}));
        expect(onMonthChange).toHaveBeenCalledWith('2024-12');
    });

    it('12月の翌月ボタンをクリックすると翌年1月で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-12"
                onMonthChange={onMonthChange}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: '翌月'}));
        expect(onMonthChange).toHaveBeenCalledWith('2026-01');
    });

    it('年入力欄でEnterキーを押すと新しい年で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.change(yearInput, {target: {value: '2030'}});
        fireEvent.keyDown(yearInput, {key: 'Enter'});
        expect(onMonthChange).toHaveBeenCalledWith('2030-04');
    });

    it('年入力欄にフォーカスすると前後10年分の候補が表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.focus(yearInput);
        expect(screen.getByRole('listbox', {name: '年候補'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: '2015年'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: '2035年'})).toBeInTheDocument();
    });

    it('年候補をクリックすると onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.focus(yearInput);
        fireEvent.mouseDown(screen.getByRole('option', {name: '2027年'}));
        expect(onMonthChange).toHaveBeenCalledWith('2027-04');
    });

    it('年入力欄でフォーカスアウトすると新しい年で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.change(yearInput, {target: {value: '2028'}});
        fireEvent.blur(yearInput);
        expect(onMonthChange).toHaveBeenCalledWith('2028-04');
    });

    it('月入力欄でEnterキーを押すと新しい月で onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.change(monthInput, {target: {value: '12'}});
        fireEvent.keyDown(monthInput, {key: 'Enter'});
        expect(onMonthChange).toHaveBeenCalledWith('2025-12');
    });

    it('月入力欄にフォーカスすると12か月分の候補が表示される', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.focus(monthInput);
        expect(screen.getByRole('listbox', {name: '月候補'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: '01月'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: '12月'})).toBeInTheDocument();
    });

    it('月候補をクリックすると onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.focus(monthInput);
        fireEvent.mouseDown(screen.getByRole('option', {name: '09月'}));
        expect(onMonthChange).toHaveBeenCalledWith('2025-09');
    });

    it('月入力欄に1桁の月を入力するとゼロ埋めして onMonthChange が呼ばれる', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.change(monthInput, {target: {value: '3'}});
        fireEvent.blur(monthInput);
        expect(onMonthChange).toHaveBeenCalledWith('2025-03');
    });

    it('範囲外の年（999）を入力すると onMonthChange が呼ばれない', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.change(yearInput, {target: {value: '999'}});
        fireEvent.blur(yearInput);
        expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('範囲外の月（13）を入力すると onMonthChange が呼ばれない', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.change(monthInput, {target: {value: '13'}});
        fireEvent.blur(monthInput);
        expect(onMonthChange).not.toHaveBeenCalled();
    });

    it('空の年入力でフォーカスアウトすると元の年に戻る', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const yearInput = screen.getByRole('combobox', {name: '年'});
        fireEvent.change(yearInput, {target: {value: ''}});
        fireEvent.blur(yearInput);
        expect(onMonthChange).not.toHaveBeenCalled();
        expect(yearInput).toHaveValue('2025');
    });

    it('空の月入力でフォーカスアウトすると元の月に戻る', () => {
        render(
            <MonthNavigator
                selectedMonth="2025-04"
                onMonthChange={onMonthChange}
            />
        );
        const monthInput = screen.getByRole('combobox', {name: '月'});
        fireEvent.change(monthInput, {target: {value: ''}});
        fireEvent.blur(monthInput);
        expect(onMonthChange).not.toHaveBeenCalled();
        expect(monthInput).toHaveValue('04');
    });
});
