import React from 'react';
import { connect } from 'react-redux';
import { serverLogin, serverRegister } from '../../Reducer/reducerUserInfo';
import {Redirect, Route} from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Image,  Button, Form, FormControl, Tab, Tabs} from 'react-bootstrap';
import { MDBContainer, MDBRow, MDBCol, MDBIcon, MDBInput } from 'mdbreact';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import { withCookies } from 'react-cookie';
import { compose } from "redux";
import Main from "./Main";

class Auth extends React.Component
{
    constructor(props)
    {
        super(props);
        this.oneWordExp = / /;
        this.emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //должен содержать 1 lowercase символ
        //должен содержать 1 uppercase символ
        //должен быть больше 8 символов
        //должен содержать хтя бы одну цифру
        this.passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

        this.initialState = {
            loginLogin: '',
            loginPassword: '',

            name: '',
            lastName: '',
            login: '',
            email: '',
            password: '',
            reqPassword: '',
            middleName: '',
            birthDay: '',
            address: '',

            nameError: '',
            lastNameError: '',
            loginError: '',
            emailError: '',
            passwordError: '',
            reqPasswordError: '',
            middleNameError: '',
            birthDayError: '',
            addressError: '',
            serverMessageRes: '',
        }
        this.state = this.initialState;
    }

    IsRegValidator = () => {
        if(this.state.name < 2)        
            return false;
        else
        {              
            if(this.state.name > 20)
                return false;
            else
            {  
                if(this.oneWordExp.test(this.state.name))        
                    return false;
            }
        }

        if(this.state.lastName < 2)        
            return false;
        else
        {              
            if(this.state.lastName > 25)
                return false;
            else
            {  
                if(this.oneWordExp.test(this.state.lastName))        
                    return false;
            }
        }

        if(this.state.login < 5)        
            return false;
        else
        {              
            if(this.state.login > 25)
                return false;
            else
            {  
                if(this.oneWordExp.test(this.state.login))
                    return false;
            }
        }

        if(!this.emailRegExp.test(this.state.email))
            return false;

        if(!this.passwordRegExp.test(this.state.password))
            return false;

        if(this.state.reqPassword !== this.state.password)
            return false;

        return true;
    }

    EventRegValidator = (event) => {
        if(event.target.name === 'name')
        {
            if(event.target.value.length < 2)        
                this.setState({nameError: 'Слишком короткое имя.'});
            else
            {              
                if(event.target.value.length > 20)
                    this.setState({nameError: 'Имя должно быть короче 20 символов.'});
                else
                {  
                    if(this.oneWordExp.test(event.target.value))        
                        this.setState({nameError: 'Имя должно состоять из одного слова.'});
                    else
                        this.setState({nameError: ''});
                }
            }
        }

        if(event.target.name === 'lastName')
        {
            if(event.target.value.length < 2)        
                this.setState({lastNameError: 'Слишком короткое Фамилия.'});
            else
            {              
                if(event.target.value.length > 25)
                    this.setState({lastNameError: 'Фамилия должно быть короче 25 символов.'});
                else
                {  
                    if(this.oneWordExp.test(event.target.value))        
                        this.setState({lastNameError: 'Фамилия должна состоять из одного слова.'});
                    else
                        this.setState({lastNameError: ''});
                }
            }
        }

        if(event.target.name === 'login')
        {
            if(event.target.value.length < 5)        
                this.setState({loginError: 'Слишком короткий логин.'});
            else
            {              
                if(event.target.value.length > 25)
                    this.setState({loginError: 'Логин должен быть короче 25 символов.'});
                else
                {  
                    if(this.oneWordExp.test(event.target.value))
                        this.setState({loginError: 'Логин должен состоять из одного слова.'});
                    else
                        this.setState({loginError: ''});
                }
            }
        }

        if(event.target.name === "email")
        {
            if(!this.emailRegExp.test(event.target.value))
                this.setState({emailError: 'Email должен соответствовать шаблону (emailname@domen.reg).'});
            else
                this.setState({emailError: ''});
        }

        if(event.target.name === "password")
        {
            if(!this.passwordRegExp.test(event.target.value))
                this.setState({passwordError: 'Пароль должен быть больше 8 символов содержать 1 цифру, символ в нижнем регистре и символ в верхнем регистре.'});
            else
                this.setState({passwordError: ''});
        }

        if(event.target.name === "reqPassword")
        {
            if(event.target.value !== this.state.password)
                this.setState({reqPasswordError: 'Пароли не совпадают.'});
            else
                this.setState({reqPasswordError: ''});
        }
    };
    
    changeHandler = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.EventRegValidator(event);
      };

    submit = (e) =>
    {
        e.preventDefault();
        if(this.IsRegValidator())
        {
            //отправка запроса на сервер
            this.props.serverRegister({
                login: this.state.login,
                firstName: this.state.name,
                lastName: this.state.lastName,
                password: this.state.password,
                email: this.state.email,
            });
            console.log('valid');
        }
        else
        {
        }
    }

    InSubmit = (e) => {
        e.preventDefault();
        this.props.serverLogin(this.state.loginLogin, this.state.loginPassword, this.props.cookies);
    }


    render()
    {
        if(this.props.userInfo.User !== null)
        {
            return(<Redirect to={"/users/" + this.props.userInfo.User.login}/>);
        }

        document.title = `mini - Auth`;
        return (
        <div className="row d-flex comfortaa-font">
            <div className="w-100">
                <Tabs defaultActiveKey="entry" id="uncontrolled-tab-example">
                    <Tab eventKey="entry" title="Вход" className="mx-auto">
                        <div className="col-12 col-md-8 mx-auto top-space">
                            <MDBContainer>
                                <form onSubmit={this.InSubmit}>
                                    <p className="h5 text-center mb-4">Вход</p>
                                    <div className="grey-text">
                                    <MDBInput label="Введите логин" icon="user" group type="text" validate error="wrong" success="right" name="loginLogin" onChange={this.changeHandler}/>
                                    <MDBInput label="Введите пароль" icon="key" group type="password" validate error="wrong" success="right" name="loginPassword" onChange={this.changeHandler}/>
                                    <p className="text-center text-warning">{this.props.userInfo.serverMessage}</p>
                                    </div>
                                    <div className="text-center">
                                    <input className='btn btn-primary' type="submit" value="Вход">
                                                                            </input>
                                    </div>
                                </form>
                            </MDBContainer>
                        </div>
                    </Tab>
                    <Tab eventKey="register" title="Регистрация" >
                        <div className="top-space">
                            <MDBContainer>
                                <form onSubmit={this.submit}>
                                    <p className="h5 text-center mb-4">Регистрация</p>
                                    <p className="h6">Обязательные поля</p>
                                    <hr></hr>
                                    <div className="col-12 col-md-8 mx-auto grey-text">
                                        <MDBInput label="Имя" icon="address-card" name="name" onChange={this.changeHandler} group type="text"   error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.nameError}</p>
                                        <MDBInput label="Фамилия" icon="address-book" name="lastName" onChange={this.changeHandler} group type="text"  error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.lastNameError}</p>
                                        <MDBInput label="Логин" icon="user-alt" name="login" onChange={this.changeHandler} group type="text"  error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.loginError}</p>
                                        <MDBInput label="Почта" icon="envelope" name="email" onChange={this.changeHandler} group type="email"  error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.emailError}</p>
                                        <MDBInput label="Пароль" icon="unlock" name="password" onChange={this.changeHandler} group type="password"  error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.passwordError}</p>
                                        <MDBInput label="Подтвердите пароль" name="reqPassword" onChange={this.changeHandler} icon="unlock-alt" group type="password"  error="wrong" success="right" />
                                        <p className="text-danger mb-0">{this.state.reqPasswordError}</p>
                                        <p className="text-center text-warning">{this.props.userInfo.serverMessage}</p>
                                    </div>
                                    <div className="text-center">
                                        <input className='btn btn-primary' type="submit" value="Регистрация">
                                                                                    </input>
                                    </div>
                                </form>
                            </MDBContainer>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </div>
        );
    }
}

const actionCreators = {
    serverLogin, serverRegister
}

const mapStateToProps = (state, ownProps) =>
{
    return{
        userInfo: state.userInfo,
        cookies: ownProps.cookies
    }
}

export default compose(withCookies, connect(mapStateToProps, actionCreators))(Auth);