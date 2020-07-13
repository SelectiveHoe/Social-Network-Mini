import React from 'react';
import {resetViewedUserToDefault} from '../../Reducer/reducerViewedUser'
import {resetUserInfoToDefault} from '../../Reducer/reducerUserInfo'
import { connect } from 'react-redux'
import {Route, Redirect, Link, BrowserRouter} from 'react-router-dom';
import { withCookies } from 'react-cookie';

class LogOut extends React.Component
{
    constructor(props)
    {
        super(props);
        const { cookies } = this.props;
        cookies.remove('sessionToken', {path: "/"});
        this.props.resetViewedUserToDefault();
        this.props.resetUserInfoToDefault();
        window.location.reload();
    }

    render()
    {
        return (
            <Redirect to="/auth"/>
        );
    }
}

const actionCreators ={
    resetViewedUserToDefault, resetUserInfoToDefault
}


const mapStateToProps = (state) =>
{
    return{
        viewedUser: state.viewedUser,
        userInfo: state.userInfo
    }
}


export default withCookies(connect(mapStateToProps, actionCreators)(LogOut));