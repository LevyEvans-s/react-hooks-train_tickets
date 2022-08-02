/* eslint-disable no-sequences */
import React, { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import URI from 'urijs';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../common/Header';
import Nav from '../common/Nav';
import Detail from '../common/Detail';
import Candidate from './Candidate';
// import Schedule from './Schedule'
import './App.css';
import useNav from '../common/useNav';
import {
    setDepartStation,
    setArriveStation,
    setTrainNumber,
    setDepartDate,
    setSearchParsed,
    prevDate,
    nextDate,
    setDepartTimeStr,
    setArriveTimeStr,
    setArriveDate,
    setDurationStr,
    setTickets,
    toggleIsScheduleVisible,
} from './actions';
import dayjs from 'dayjs';
import { h0 } from '../common/fp';
import { TrainContext } from './context';

const Schedule = lazy(() => import('./Schedule'));

function App(props) {
    const {
        departDate,
        arriveDate,
        departTimeStr,
        arriveTimeStr,
        departStation,
        arriveStation,
        trainNumber,
        durationStr,
        tickets,
        isScheduleVisible,
        searchParsed,
        dispatch,
    } = props;

    const onBack = useCallback(() => {
        window.history.back();
    }, []);

    useEffect(() => {
        const queries = URI.parseQuery(window.location.search);
        const {
            aStation,
            dStation,
            date, //date是字符串 store中需要一个时间戳
            trainNumber,
        } = queries;

        dispatch(setDepartStation(dStation));
        dispatch(setArriveStation(aStation));
        dispatch(setTrainNumber(trainNumber));
        dispatch(setDepartDate(h0(dayjs(date).valueOf()))); //先转换成时间戳再去除小时分钟秒

        dispatch(setSearchParsed(true)); //解析URL后方可执行网络请求
    }, []);

    //修改网页标题为车次
    useEffect(() => {
        document.title = trainNumber;
    }, [trainNumber]);

    //发起网络请求
    useEffect(() => {
        if (!searchParsed) {
            return;
        }

        const url = new URI('/rest/ticket')
            .setSearch('date', dayjs(departDate).format('YYYY-MM-DD'))
            .setSearch('trainNumber', trainNumber)
            .toString();

        fetch(url)
            .then(response => response.json())
            .then(result => {
                const { detail, candidates } = result;

                const {
                    departTimeStr,
                    arriveTimeStr,
                    arriveDate,
                    durationStr,
                } = detail;

                dispatch(setDepartTimeStr(departTimeStr));
                dispatch(setArriveTimeStr(arriveTimeStr));
                dispatch(setArriveDate(arriveDate));
                dispatch(setDurationStr(durationStr));
                dispatch(setTickets(candidates));
            });
    }, [searchParsed, departDate, trainNumber]);

    //useNav hook引入Nav状态
    const {isPrevDisabled, isNextDisabled, prev, next } = useNav(
        departDate,
        dispatch,
        prevDate,
        nextDate
    );

    const detailCbs = useMemo(() => {
        return bindActionCreators(
            {
                toggleIsScheduleVisible,
            },
            dispatch
        );
    }, []);
    if (!searchParsed) {
        return null;
    }

    return (
        <div className="app">
            <div className="header-wrapper">
                <Header title={trainNumber} onBack={onBack} />
            </div>
            <div className="nav-wrapper">
                <Nav
                    date={departDate}
                    isPrevDisabled={isPrevDisabled}
                    isNextDisabled={isNextDisabled}
                    prev={prev}
                    next={next}
                />
            </div>
            <div className="detail-wrapper">
                <Detail
                    departDate={departDate}
                    arriveDate={arriveDate}
                    departTimeStr={departTimeStr}
                    arriveTimeStr={arriveTimeStr}
                    trainNumber={trainNumber}
                    departStation={departStation}
                    arriveStation={arriveStation}
                    durationStr={durationStr}
                >
                    <span className="left"></span>
                    <span
                        className="schedule"
                        onClick={() => detailCbs.toggleIsScheduleVisible()}
                    >
                        时刻表
                    </span>
                    <span className="right"></span>
                </Detail>
            </div>
            <TrainContext.Provider
                value={(trainNumber, departStation, arriveStation, departDate)}
            >
                <Candidate tickets={tickets} />
            </TrainContext.Provider>
            {isScheduleVisible && (
                <div
                    className="mask"
                    onClick={() => dispatch(toggleIsScheduleVisible())}
                >
                    <Suspense fallback={<div>loading</div>}>
                        <Schedule
                            date={departDate}
                            trainNumber={trainNumber}
                            departStation={departStation}
                            arriveStation={arriveStation}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return { dispatch };
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
