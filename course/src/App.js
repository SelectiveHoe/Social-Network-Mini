import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Spinner} from 'react-bootstrap';
import Header from './components/Header';
import {photoViewerViewStateAction, changeViewerImgStackAction} from './Reducer/reducerImgView'
import {changeUserToken, setUserByToken, changeIsCookieLoad} from './Reducer/reducerUserInfo'


import { withCookies } from 'react-cookie';
import {connect} from "react-redux";


class App extends React.Component
{
    constructor(props)
    {
        super(props);


    }

    componentDidMount = () =>
    {
        const { cookies } = this.props;
        if(!this.props.userInfo.User) {
            if (!this.props.userInfo.token) {
                if (cookies.get('sessionToken')) {
                    this.props.changeUserToken(cookies.get('sessionToken'));
                    this.props.setUserByToken(cookies.get('sessionToken'), () => {
                        this.props.changeIsCookieLoad(true);
                    });
                }
                else
                {
                    this.props.changeIsCookieLoad(true);
                }
            }
        }
    }

    render()
    {
        return(
            <div>
                {this.props.userInfo.isLoadFromCookieComlpete ? <Header/> : (<div className="d-flex hei-100 justify-content-center w-100"><Spinner className="m-auto " animation="border" variant="primary" /></div>)}
            </div>
        );
    }
}

const actionCreators ={
  photoViewerViewStateAction, changeViewerImgStackAction, changeUserToken, setUserByToken, changeIsCookieLoad
}

const mapStateToProps = (state, ownProps) =>
{
  return{
    viewer: state.viewer,
    userInfo: state.userInfo,
    cookies: ownProps.cookies
  }
}


export default withCookies(connect(mapStateToProps, actionCreators)(App));
