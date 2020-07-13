import React from 'react';
//import AvatarEditor from 'react-avatar-editor'
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Tabs, Form, Image, Button} from 'react-bootstrap';
import {changeNotification, DeleteFromNotification} from '../../Reducer/reducerUserInfo'
import {SearchOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons'
import { connect } from 'react-redux'
import {getUserByLogin, getMessages, addMessage, uploadFiles, addWallPost} from "../Api/serverApi";
import {Link, Redirect} from 'react-router-dom';
import EachMessage from "../EachMessage";
import {Player} from "video-react";
import {} from "../../Reducer/reducerViewedUser";
import openSocket from "socket.io-client";

class Chat extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            messages: [],
            chatWithThisUser: null,
            isRedirectToMessages: false,
            currHeight: 0,
            files: [],
            messageText: '',
        };

    }

    componentDidMount = () =>
    {
        document.getElementById("chat-window").addEventListener('scroll', this.loadMore);
        let chatWithUserLogin = this.props.location.pathname.split('/')[2];
        if(chatWithUserLogin !== undefined && chatWithUserLogin !== '')
        {
            getUserByLogin(chatWithUserLogin, (res) => {
                if(res) {
                    this.setState({chatWithThisUser: res});
                    getMessages(this.props.userInfo.token, res.idUserAuth, 0, 10, (res) => {
                        this.setState({messages: res}, () => {
                            let chatWindow = document.getElementById("chat-window");
                            chatWindow.scrollTop = chatWindow.scrollHeight;
                        });
                    });
                }
                else
                    this.setState({isRedirectToMessages: true});
            });
        }
        else
            this.setState({isRedirectToMessages: true});
        const socket = openSocket('http://localhost:8080');
        socket.on(`${this.props.userInfo.token}-NewMessage`, this.newMessageRecive);
    }

    newMessageRecive = (notif) =>
    {
        if(notif.userLogin === this.state.chatWithThisUser.login)
        {

            getMessages(this.props.userInfo.token, this.state.chatWithThisUser.idUserAuth, 0, 10, (res) => {
                this.setState({messages: res}, () => {
                    let chatWindow = document.getElementById("chat-window");
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                });
            });
        }
    }

    componentWillUnmount = () =>
    {
        if(document.getElementById("chat-window"))
            document.getElementById("chat-window").removeEventListener('scroll', this.loadMore);
        const socket = openSocket('http://localhost:8080');
        socket.off(`${this.props.userInfo.token}-NewMessage`, this.newMessageRecive);
    }

    loadMore = () => {
        if (document.getElementById("chat-window").scrollTop === 0) {
            this.setState({currHeight: document.getElementById("chat-window").scrollHeight});
            getMessages(this.props.userInfo.token, this.state.chatWithThisUser.idUserAuth, this.state.messages.length, 10, (res) => {
                this.setState({messages: res.concat(this.state.messages)}, () => {
                    document.getElementById("chat-window").scrollTop = document.getElementById("chat-window").scrollHeight - this.state.currHeight;
                });
            });
        }
    }

    getMessages = () =>
    {
        if(this.state.messages.length !== 0)
        {
            return this.state.messages.map(message =>
                <EachMessage key={message.id} messageContent={message} isYou={message.idFrom === this.props.userInfo.User.idUserAuth}></EachMessage>
            );
        }
        else
        {
            return (<div className="text-center bottom mt-5 mb-5 h-100 d-flex flex-column justify-content-end"><div>Тут пока ничего нет...</div></div>);
        }
    }

    addingFiles = (e) =>
    {
        if(e.target.files.length > 10)
        {

        }
        else {
            this.setState({files: e.target.files});
        }
    }

    sendMessage = () =>
    {
        if(this.state.files.length !== 0 || this.state.messageText !== ''){
            let messageText = this.state.messageText;
            uploadFiles(Array.from(this.state.files), this.props.userInfo.User.login, (idFiles) => {
             addMessage(idFiles.data,
                 messageText,
                 this.props.userInfo.token,
                 this.state.chatWithThisUser.idUserAuth,
                 (res) => {
                     getMessages(this.props.userInfo.token, this.state.chatWithThisUser.idUserAuth, 0, 10, (res) => {
                         this.setState({messages: res}, () => {
                             let chatWindow = document.getElementById("chat-window");
                             chatWindow.scrollTop = chatWindow.scrollHeight;
                         });
                     });
                 });
            });
            this.setState({files: []});
            this.setState({messageText: ""});
        }
    }

    messageTextHandler = (e) => {
        this.setState({messageText: e.target.value});
    }

    autoSend = (e) =>
    {
        if(e.keyCode === 13)
        {
            this.sendMessage();
        }
    }

    render()
    {
        document.title = `mini - Chat`;
        if(this.state.isRedirectToMessages)
            return (<Redirect to="/message"/>);

        return (
            <div className="row top-space" >
                <div className="w-100 img-thumbnail p-0 h-50" >
                    <Link to={this.state.chatWithThisUser === null ? '/message' : "/users/" + this.state.chatWithThisUser.login} className="w-auto d-flex justify-content-center">
                        <div className="text-dark" >
                            <Image className="m-1 " style={{borderRadius: 37.5, height:50, width: 50}} src={
                                this.state.chatWithThisUser === null ? "../un-user.jpg" :
                                this.state.chatWithThisUser.avatarpath === null ?
                                    "../un-user.jpg" : "http://localhost:8080" + this.state.chatWithThisUser.avatarpath
                            }></Image>
                            <span className="">
                                {this.state.chatWithThisUser === null ? "" :
                                    this.state.chatWithThisUser.firstName + " " + this.state.chatWithThisUser.lastName}
                            </span>
                        </div>
                    </Link>
                    <hr className="m-0"/>
                    <div id="chat-window" className="flex-column d-flex p-0" style={{overflow: "auto", maxHeight: "60vh"}}>
                        {this.getMessages()}
                    </div>
                </div>
                <div className="w-100 img-thumbnail mt-1" >
                    <div className="d-flex">
                        <Image className="img-source img-border" style={{borderRadius: 37.5, height:75, width: 75}} src={this.props.userInfo.User.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + this.props.userInfo.User.avatarpath}></Image>
                        <Form.Control className="ml-1" style={{minHeight: 75, height: 75}} as="textarea" rows="3" onKeyUp={this.autoSend} onChange={this.messageTextHandler} value={this.state.messageText}/>
                    </div>
                    <div className="d-flex align-content-center justify-content-center">
                        <span className="mt-2 ml-auto">{
                            this.state.files.length === 0 ? "" :
                                this.state.files.length === 1 ? "Закреплён файл." :
                                    this.state.files.length < 5 ? "Закрепленно " + this.state.files.length + " файла." :
                                            "Закрепленно " + this.state.files.length + " файлов."}</span>
                        <div className="ml-auto">
                            <label htmlFor="upload-photo" className="btn btn-link btn-sm">Добавить медиа</label>
                            <input type="file" name="photo" id="upload-photo" multiple accept=".jpg,.jpeg,.png,.mp3,.mp4" onChange={this.addingFiles}/>
                            <Button variant="success" size="sm" onClick={this.sendMessage}>Отправить</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


const actionCreators ={
    DeleteFromNotification
}


const mapStateToProps = (state) =>
{
    return{
        userInfo: state.userInfo
    }
}


export default connect(mapStateToProps, actionCreators)(Chat);