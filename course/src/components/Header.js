import React from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Navbar, Nav, NavDropdown, Badge, Image} from 'react-bootstrap';
import Viewer from 'react-viewer';
import {Route, Redirect, Link, BrowserRouter, Switch} from 'react-router-dom';
import {photoViewerViewStateAction, changeViewerImgStackAction} from '../Reducer/reducerImgView'
import {changeUserToken, setUserByToken, DeleteFromNotification} from '../Reducer/reducerUserInfo'
import { connect } from 'react-redux'
import {CloseOutlined} from '@ant-design/icons'

import Main from '../components/Pages/Main';
import Friends from '../components/Pages/Friends'
import Message from '../components/Pages/Message'
import Options from '../components/Pages/Options'
import Auth from '../components/Pages/Auth'
import LogOut from '../components/Pages/logOut'
import Chat from '../components/Pages/Chat'
import { withCookies } from 'react-cookie';

class App extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    componentDidMount = () => {

    }

    getRightAvatarPath = () =>
    {
        if(this.props.userInfo.User === null)
        {
            return "../../un-user.jpg";
        }
        else
        {
            if(this.props.userInfo.User.avatarpath === null)
                return "../un-user.jpg";
            else
                return "http://localhost:8080" + this.props.userInfo.User.avatarpath;
        }
    }

    removeNotif = (item) =>
    {
        this.props.DeleteFromNotification(item);
    }

    notification = () =>
    {
        return this.props.userInfo.listNotification.map(notif => {
                if(notif.message === "Добавил вас в друзья")
                {

                    return (<div className="img-thumbnail mb-1 p-2 d-flex"
                                 style={{width: 400, height: 100, overflow: "hidden"}}>
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex flex-row ">
                                <span className="m-0 p-0" style={{fontSize: 10}}>Заявка в друзья</span>
                                <CloseOutlined className="ml-auto" onClick={() => {
                                    this.removeNotif(notif)
                                }}/>
                            </div>
                            <Link to={"/users/" + notif.userLogin} className="text-dark d-flex flex-row w-100"
                                  style={{height: 68}}>
                                <Image style={{height: "100%", borderRadius: "50%"}}
                                       src={notif.avatar === null ? "../un-user.jpg" : "http://localhost:8080" + notif.avatar}/>
                                <div className="d-flex flex-column ml-1">
                                <span className="p-0 m-0 font-weight-bold"
                                      style={{fontSize: 20}}>{notif.userFullName}</span>
                                    <span className="p-0 m-0" style={{fontSize: 15}}>{notif.message}</span>
                                </div>
                            </Link>
                        </div>
                    </div>)

                }
                else {
                    if(window.location.href.split('/')[4] !== notif.userLogin) {
                        return (<div className="smooth-anim img-thumbnail mb-1 p-2 d-flex"
                                     style={{width: 400, height: 100, overflow: "hidden"}}>
                            <div className="d-flex flex-column w-100">
                                <div className="d-flex flex-row ">
                                    <span className="m-0 p-0" style={{fontSize: 10}}>Новое сообщение</span>
                                    <CloseOutlined className="ml-auto" onClick={() => {
                                        this.removeNotif(notif)
                                    }}/>
                                </div>
                                <Link to={"/message/" + notif.userLogin} className="text-dark d-flex flex-row w-100"
                                      style={{height: 68}}>
                                    <Image style={{height: "100%", borderRadius: "50%"}}
                                           src={notif.avatar === null ? "../un-user.jpg" : "http://localhost:8080" + notif.avatar}/>
                                    <div className="d-flex flex-column ml-1">
                                        <span className="p-0 m-0 font-weight-bold"
                                              style={{fontSize: 20}}>{notif.userFullName}</span>
                                        <span className="p-0 m-0" style={{fontSize: 15}}>{notif.message}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>)
                    }
                    else
                        return ('');
                }
            }
        )
    }

    render()
    {
        if(this.props.userInfo.token)
        {
            return <div className="page-sizer">
                <BrowserRouter>
                    <Navbar className="header-btn fixed-top" bg="dark" variant="dark" expand="lg">
                        <div className="container">
                            <Navbar.Brand className="header-main-btn"><Link to={this.props.userInfo.User === null ? ' ' : "/users/" + this.props.userInfo.User.login} className="smooth-anim header-link-main">mini</Link></Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="mr-auto">
                                    <Link to={this.props.userInfo.User === null ? ' ' : "/users/" + this.props.userInfo.User.login} className="smooth-anim header-link">Главная</Link>
                                    <Link to="/message" className="smooth-anim header-link">Сообщения</Link>
                                    <Link to="/friends" className="smooth-anim header-link">Люди</Link>
                                    <Link to="/news" className="smooth-anim header-link">Лента</Link>
                                </Nav>
                                <Nav>
                                    <NavDropdown className="profile-Name smooth-anim padding-zero" title={
                                        <span>{this.props.userInfo.User === null ? ' ' : this.props.userInfo.User.firstName + " "}
                                            <img src={this.getRightAvatarPath()} className="profile-icon"/></span>}
                                                 id="collasible-nav-dropdown">
                                        <NavDropdown.Item><Link to="/options"
                                                                className="smooth-anim header-link">Настройки</Link></NavDropdown.Item>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item><Link to="/LogOut"
                                                                className="smooth-anim header-link">Выход</Link></NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </div>
                    </Navbar>
                    <div className="container page-container">
                        <Viewer
                            id='view'
                            visible={this.props.viewer.isPhotoViewer}
                            onClose={() => {
                                this.props.photoViewerViewStateAction(false);
                            }}
                            images={this.props.viewer.ViewerPhotoStack}
                            activeIndex={this.props.viewer.ViewPhotoIndex}
                            className={'fixed-top'}
                        />
                        <Route path='/users/:UserLogin' component={Main}/>
                        <Route path='/friends' component={Friends}/>
                        <Switch>
                            <Route exact path='/message' component={Message}/>
                            <Route path='/message/:UserLogin' component={Chat}/>
                        </Switch>
                        <Route path='/options' component={Options}/>
                        <Route path='/auth' component={Auth}/>
                        <Route path='/LogOut' component={LogOut}/>
                        <div className="position-fixed smooth-anim m-2 p-2" style={{bottom: 0, left: 0}}>
                            {this.notification()}
                        </div>
                    </div>
                </BrowserRouter>
            </div>;
        }
        else
        {
            return <div className="page-sizer">
                <BrowserRouter>
                    <Navbar className="header-btn fixed-top" bg="dark" variant="dark" expand="lg">
                        <div className="container">
                            <Navbar.Brand className="header-main-btn"><Link to="/Auth" className="smooth-anim header-link-main">mini</Link></Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                            </Navbar.Collapse>
                        </div>
                    </Navbar>
                    <div className="container page-container">
                        <Viewer
                            id='view'
                            visible={this.props.viewer.isPhotoViewer}
                            onClose={() => { this.props.photoViewerViewStateAction(false); } }
                            images={this.props.viewer.ViewerPhotoStack}
                            activeIndex={this.props.viewer.ViewPhotoIndex}
                            className={'fixed-top'}
                        />
                        <Route path='users/:UserLogin' component={Main}/>
                        <Route path='/friends' component={Friends}/>
                        <Route path='/message' component={Message}/>
                        <Route path='/options' component={Options}/>
                        <Route path='/auth' component={Auth}/>
                        <Redirect to="/Auth"/>
                    </div>
                </BrowserRouter>
            </div>
        }
    }
}

const actionCreators ={
    photoViewerViewStateAction, changeViewerImgStackAction, changeUserToken, setUserByToken, DeleteFromNotification
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
