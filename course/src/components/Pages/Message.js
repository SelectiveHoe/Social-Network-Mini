import React from 'react';
//import AvatarEditor from 'react-avatar-editor'
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Image,  Button, InputGroup, FormControl} from 'react-bootstrap';
import {} from '../../Reducer/reducerUserInfo'
import { connect } from 'react-redux'
import {getDialogs, getFriends} from "../Api/serverApi";
import {Link} from 'react-router-dom';

class Message extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            dialogsList: [],
            friendsList: []
        };
    }

    componentDidMount = () =>
    {
        document.getElementById("friends-scroller").addEventListener("scroll", this.loadMore);
        getDialogs(this.props.userInfo.token, (dialogs) => {
            this.setState({dialogsList: dialogs});
        });
        getFriends(this.props.userInfo.token, this.state.friendsList.length, 10, (res) => {
            if(res)
                this.setState({friendsList: res});
        });
    }

    componentWillUnmount = () =>
    {
        document.getElementById("friends-scroller").removeEventListener("scroll", this.loadMore);
    }

    loadMore = () => {
        if (document.getElementById("friends-scroller").clientHeight + document.getElementById("friends-scroller").scrollTop === document.getElementById("friends-scroller").scrollHeight) {
            getFriends(this.props.userInfo.token, this.state.friendsList.length, 10, (res) => {
                console.log(this.state.friendsList.length);
                if(res)
                    this.setState({friendsList: this.state.friendsList.concat(res)});
            });
        }
    }

    render()
    {
        document.title = `mini - Message`;
        return (
            <div className="d-flex">
                <div className="col-sm-3 w-100 p-0 mr-1">
                    <span className="comfortaa-font">Друзья:</span>
                    <div id="friends-scroller" className="img-thumbnail" style={{overflow: "auto", maxHeight: 270}}>
                        <hr className="mb-1 mt-1"/>
                        {this.state.friendsList.map(friend => {
                            return (
                                <div>
                                    <Link to={"/message/" + friend.login} style={{height: 40}} className="userFriendItem text-dark smooth-anim d-flex align-content-center userFriendItem smooth-anim mb-1">
                                        <Image className="h-100 w-auto" style={{borderRadius: 20}} src={friend.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + friend.avatarpath}></Image>
                                        <div className="ml-1"><span className="font-weight-bold comfortaa-font">{friend.firstName} {friend.lastName}</span></div>
                                    </Link>
                                    <hr className="mb-1 mt-1"/>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="col-sm-9 flex-column account-info">
                    <span className="comfortaa-font">Чаты:</span>
                    {this.state.dialogsList.map(dialog => {
                        return(
                            <Link to={"/message/" + dialog.login} style={{height: 60}} className="d-flex text-dark img-thumbnail userFriendItem smooth-anim mb-1">
                                <Image className="h-100 w-auto" style={{borderRadius: 30}} src={dialog.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + dialog.avatarpath}></Image>
                                <div className="d-flex flex-column ml-3" style={{overflow: "hidden"}}>
                                    <span className="font-weight-bold comfortaa-font">{dialog.firstName} {dialog.lastName}</span>
                                    <span className="text-muted comfortaa-font"><span className="font-weight-bold">
                                        {dialog.idFrom === this.props.userInfo.User.idUserAuth ? dialog.firstName : "Вы"}:</span> {dialog.messageText}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }
}

const actionCreators ={

  }
  
  
  const mapStateToProps = (state) =>
  {
    return{
        userInfo: state.userInfo,
    }
  }
  
  
  export default connect(mapStateToProps, actionCreators)(Message);