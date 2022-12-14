import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { h0 } from '../common/fp';
import Header from './Header.jsx';
import './DateSelector.css';

function Day(props) {
    const { day, onSelect } = props;

    //如果day是null渲染一个空的td
    if (!day) {
        return <td className="null"></td>;
    }

    const classes = [];

    const now = h0();

    if (day < now) {
        classes.push('disabled');
    }

    //如果是周末
    if ([0, 6].includes(new Date(day).getDay())) {
        classes.push('weekend');
    }

    const dateString = now === day ? '今天' : new Date(day).getDate();
    return (
        <td className={classnames(classes)} onClick={() => onSelect(day)}>
            {dateString}
        </td>
    );
}

Day.propTypes = {
    day: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
};

function Week(props) {
    const { days, onSelect } = props;

    return (
        <tr className="date-table-days">
            {days.map((day, idx) => {
                return <Day key={idx} day={day} onSelect={onSelect}></Day>;
            })}
        </tr>
    );
}
Week.propTypes = {
    days: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
};

function Month(props) {
    const { startingTimeInMonth, onSelect } = props;

    const startDay = new Date(startingTimeInMonth);
    const currentDay = new Date(startingTimeInMonth);

    let days = [];
    while (currentDay.getMonth() === startDay.getMonth()) {
        days.push(currentDay.getTime());
        currentDay.setDate(currentDay.getDate() + 1);
    }
    //每个月的第一天是星期几 前面补齐多少个空白 （特殊 星期日补齐6个）
    days = new Array(startDay.getDay() ? startDay.getDay() - 1 : 6)
        .fill(null)
        .concat(days);

    const lastDay = new Date(days[days.length - 1]); //获取当月最后一天
    days = days.concat(
        new Array(lastDay.getDay() ? 7 - lastDay.getDay() : 0).fill(null)
    );

    //对每个星期进行分组
    const weeks = [];

    for (let row = 0; row < days.length / 7; ++row) {
        const week = days.slice(row * 7, (row + 1) * 7);
        weeks.push(week);
    }

    return (
        <table className="date-table">
            <thead>
                <tr>
                    <td colSpan="7">
                        <h5>
                            {startDay.getFullYear()}年{startDay.getMonth() + 1}
                            月
                        </h5>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr className="data-table-weeks">
                    <th>周一</th>
                    <th>周二</th>
                    <th>周三</th>
                    <th>周四</th>
                    <th>周五</th>
                    <th className="weekend">周六</th>
                    <th className="weekend">周日</th>
                </tr>
                {weeks.map((week, idx) => {
                    return <Week key={idx} days={week} onSelect={onSelect} />;
                })}
            </tbody>
        </table>
    );
}

Month.propTypes = {
    startingTimeInMonth: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default function DateSelector(props) {
    const { show, onSelect, onBack } = props;

    //获取从当前时间开始连续三个月的第一天
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setDate(1);

    const monthSequence = [now.getTime()];

    now.setMonth(now.getMonth() + 1);
    monthSequence.push(now.getTime());

    now.setMonth(now.getMonth() + 1);
    monthSequence.push(now.getTime());

    return (
        <div className={classnames('date-selector', { hidden: !show })}>
            <Header title="日期选择" onBack={onBack} />
            <div className="date-selector-tables">
                {monthSequence.map(month => {
                    return (
                        <Month
                            key={month}
                            onSelect={onSelect}
                            startingTimeInMonth={month}
                        />
                    );
                })}
            </div>
        </div>
    );
}

DateSelector.propTypes = {
    show: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};
