import React, { useCallback } from 'react';
//import AvatarEditor from 'react-avatar-editor'
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Image, Button, InputGroup, FormControl, Form } from 'react-bootstrap';
import {SettingOutlined} from '@ant-design/icons'
import {photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex} from '../../Reducer/reducerImgView';
import { setUserByLogin, setWallPostByLogin } from "../../Reducer/reducerViewedUser";
import { addNewWallPost } from '../../Reducer/reducerUserInfo';
import { connect } from 'react-redux';
import WallPost from '../WallPost';
import {Link, Redirect, useLocation } from 'react-router-dom';
import "../../../node_modules/video-react/dist/video-react.css";
import {addToFriend, getFriendsRequest, getRelationShip, responseFriendRequest} from "../Api/serverApi";


class Main extends React.PureComponent
{
    constructor(props)
    {
        super(props);
        this.state = {
            postText: '',
            postFiles: [],
            relationShip: false,
        }
    }

    componentDidMount = () =>
    {
        window.addEventListener('scroll', this.eventScroll);
        let {UserLogin} = this.props.match.params;
        this.props.setUserByLogin(UserLogin, (user) => {
            getRelationShip(this.props.userInfo.token, user.idUserAuth, (result) => {
                this.setState({relationShip: result});
            });
        });
        this.props.setWallPostByLogin(UserLogin);
    }

    componentWillUnmount = () =>
    {
        window.removeEventListener('scroll', this.eventScroll);

    }

    eventScroll = () =>
    {
        this.loadMore(this.props);
    }

    getRightLastOnlineTime = () =>
    {
        if(this.props.viewedUser.user === null)
        {
            return "";
        }
        else
        {
            let lastOnline = new Date(this.props.viewedUser.user.lastOnline);
            if(lastOnline > Date.now() - (60*1000))
                return 'online';
            else if(lastOnline > Date.now() - (3600*1000))
                return 'был(а) в сети час назад';
            else
                return lastOnline.getUTCDate() + "." + (lastOnline.getMonth() + 1) + "." + lastOnline.getFullYear()
                    + " " + lastOnline.getHours() + ":" + lastOnline.getMinutes();
        }
    }

    getRightAvatarPath = () =>
    {
        if(this.props.viewedUser.user !== null && this.props.userInfo.User !== null) {
            if (this.props.viewedUser.user.login === this.props.userInfo.User.login) {
                if (this.props.userInfo.User === null) {
                    return "../un-user.jpg";
                } else {
                    if (this.props.userInfo.User.avatarpath === null)
                        return "../un-user.jpg";
                    else
                        return "http://localhost:8080" + this.props.userInfo.User.avatarpath;
                }
            } else {
                if (this.props.viewedUser.user === null) {
                    return "../un-user.jpg";
                } else {
                    if (this.props.viewedUser.user.avatarpath === null)
                        return "../un-user.jpg";
                    else
                        return "http://localhost:8080" + this.props.viewedUser.user.avatarpath;
                }
            }
        }
    }

    getRigthStatus = () =>
    {
        if (this.props.viewedUser.user === null) {
            return "";
        } else {
            if (this.props.viewedUser.user.status === null)
                return "";
            else
                return this.props.viewedUser.user.status;

        }
    }

    getRightBirthDate = () =>
    {
        if(this.props.viewedUser.user === null)
        {
            return "";
        }
        else
        {
            if(this.props.viewedUser.user.birthDay !== null)
                return <p className="account-status"><span className="font-weight-bold">Дата рождения: </span>{new Date(this.props.viewedUser.user.birthDay).toLocaleDateString()}</p>
            else
                return "";
        }
    }

    getRightAddress = () =>
    {
        if(this.props.viewedUser.user === null)
        {
            return "";
        }
        else
        {
            if(this.props.viewedUser.user.address !== null)
                return <p className="account-status"><span className="font-weight-bold">Адрес: </span>{this.props.viewedUser.user.address}</p>
            else
                return "";
        }
    }

    getRightAboutMe = () =>
    {
        if(this.props.viewedUser.user === null)
        {
            return "";
        }
        else
        {
            if(this.props.viewedUser.user.aboutMe !== null)
                return <p className="account-status"><span className="font-weight-bold">Про меня: </span>{this.props.viewedUser.user.aboutMe}</p>
            else
                return "";
        }
    }

    addToFriend = () => {
        addToFriend(this.props.userInfo.token, this.props.viewedUser.user.idUserAuth, (res) => {
            getRelationShip(this.props.userInfo.token, this.props.viewedUser.user.idUserAuth, (result) => {
                this.setState({relationShip: result});
            });
        });
    }

    deleteFromFriends = () => {
        responseFriendRequest(this.props.viewedUser.user.idUserAuth, this.props.userInfo.token, false, (res)=> {
            getRelationShip(this.props.userInfo.token, this.props.viewedUser.user.idUserAuth, (result) => {
                this.setState({relationShip: result});
            });
        });
    }

    underAvatarField = () =>
    {
        if(this.props.viewedUser.user !== null && this.props.userInfo.User !== null)
        {
            if(this.props.viewedUser.user.login === this.props.userInfo.User.login)
            {
                return <Link to="/options" className="btn btn-outline-primary btn-sm"><SettingOutlined style={{fontSize: '20px', marginRight: 5}}/>Настройки</Link>;
            }
            else
            {
                if(!this.state.relationShip) {
                    return <div>
                        <Button size="sm" variant="outline-success change-photo" disabled={this.state.ifInFriends}
                                onClick={this.addToFriend}>Доабвить в друзья</Button>
                        <Button size="sm" variant="outline-danger change-photo"
                                onClick={this.test}>Заблокировать</Button>
                    </div>;
                }
                else
                {
                    if(this.state.relationShip.type === "Friends")
                    {
                        return <div>
                            <Button size="sm" variant="outline-warning change-photo" disabled={this.state.ifInFriends}
                                    onClick={this.deleteFromFriends}>Удалить из друзей</Button>
                            <Button size="sm" variant="outline-danger change-photo"
                                    onClick={this.test}>Заблокировать</Button>
                        </div>;
                    }
                    else if(this.state.relationShip.type == "FriendsReqest")
                    {
                        return <div>
                            <Button size="sm" variant="outline-warning change-photo" disabled={this.state.ifInFriends}
                                    onClick={this.deleteFromFriends}>Убрать заявку</Button>
                            <Button size="sm" variant="outline-danger change-photo"
                                    onClick={this.test}>Заблокировать</Button>
                        </div>;
                    }
                    else if(this.state.relationShip.type == "Blocked")
                    {
                        return (<Button size="sm" variant="outline-success change-photo"
                                        onClick={this.deleteFromFriends}>Разблокировать</Button>);
                    }
                }
            }
        }
        return "";
    }

    addingFiles = (e) =>
    {
        if(e.target.files.length > 10)
        {

        }
        else {
            this.setState({postFiles: e.target.files});
        }
    }

    handleChange = (event) =>
    {
        this.setState({[event.target.name]: event.target.value});
    }

    addPostSubmit = (e) =>
    {
        if(this.state.postFiles.length !== 0 || this.state.postText !== '')
        {
            this.props.addNewWallPost(this.state.postFiles, this.state.postText, this.props.userInfo.User.login);
            this.setState({postFiles: []});
            this.setState({postText: ''});
        }
    }

    underAccountInfoField = () =>
    {
        if(this.props.viewedUser.user !== null && this.props.userInfo.User !== null)
        {
            if (this.props.viewedUser.user.login === this.props.userInfo.User.login)
            {
                return <div className="img-thumbnail top-space ">
                    <InputGroup >
                        <InputGroup.Prepend>
                            <InputGroup.Text>Текст поста</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl value={this.state.postText} onChange={this.handleChange} name="postText" as="textarea" aria-label="With textarea" />
                    </InputGroup>
                    <ul style={{listStyle: "none"}}><AddedFiles files={this.state.postFiles}/></ul>
                    <div className="d-flex top-space justify-content-end">
                        <label htmlFor="upload-photo" className="btn btn-link btn-sm">Добавить медиа</label>
                        <input type="file" name="photo" id="upload-photo" multiple accept=".jpg,.jpeg,.png,.mp3,.mp4" onChange={this.addingFiles}/>
                        <Button variant="outline-success" size="sm" onClick={this.addPostSubmit}>Добавить пост</Button>
                    </div>
                </div>;
            }
        }
    }

    loadMore(props){
        if(window.location.href.split('/')[3] !== 'users')
        {
            console.log('!== users');
            window.removeEventListener('scroll', this.eventScroll);
        }
        else
        {
            if (window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight) {
                if (props.viewedUser.user !== null) {
                    if(window.location.href.split('/')[4] === this.props.viewedUser.user.login)
                        props.setWallPostByLogin(props.viewedUser.user.login, props.viewedUser.wallPost.length)
                    else
                        window.removeEventListener('scroll', this.eventScroll);
                }
            }
        }
    }

    WallPosts = () =>
    {
        let posts = this.props.viewedUser.wallPost;
        if(posts.length !== 0)
        {
            return posts.map((item) =>
                <div key={item.id} className="img-thumbnail top-space" >
                    <WallPost postContent={item}></WallPost>
                </div>
            );
        }
        else
        {
            return (
                <div className="img-thumbnail top-space" >
                    Тут пока ничего нет...
                </div>
            );
        }
    }

    render()
    {
        if(this.props.userInfo.token === null)
        {
            return(<Redirect to="/Auth"/>);
        }
        document.title = `mini - Main`;
        if(this.props.viewedUser.user !== null) {
            if (this.props.viewedUser.user.login !== this.props.match.params.UserLogin) {
                let {UserLogin} = this.props.match.params;
                this.props.setUserByLogin(UserLogin, (user) => {
                    getRelationShip(this.props.userInfo.token, user.idUserAuth, (result) => {
                        this.setState({relationShip: result});
                    });
                });
                this.props.setWallPostByLogin(UserLogin);
            }
        }
        return (
        <div className="row"> 
        <div className="col-sm-3 d-flex flex-column top-space">  
          <div className="d-flex flex-column justify-content-center">
              <Image src={this.getRightAvatarPath()} className="img-source img-border"/>
              {this.underAvatarField()}
          </div>
        </div>
        <div className="col-sm-9 flex-column account-info top-space">
          <div className="img-thumbnail mt-n1">
            <div className="d-flex">
              <h2 className="account-title mr-auto">
                  {this.props.viewedUser.user === null ? ' ' : this.props.viewedUser.user.firstName + " " + (this.props.viewedUser.user.middleName || " ")  + " " + this.props.viewedUser.user.lastName}
              </h2>
              <p className="account-status">{this.getRightLastOnlineTime()}</p>
            </div>
            <p className="account-status">{this.getRigthStatus()}</p>
            <hr></hr>
              {this.getRightBirthDate()}
              {this.getRightAddress()}
              {this.getRightAboutMe()}
            <hr></hr>
          </div>
            {this.underAccountInfoField()}
            {this.WallPosts()}
        </div>
      </div>
        );
    }
}

function AddedFiles(props) {
    const files = Array.from(props.files);
    for(let i = 0; i < files.length; i++)
    {
        if(i >= 10)
            files.splice(i, 1);
    }
    if(files)
        return files.map(items => <li>{items.name}</li>);
    else
        return " ";
}

const actionCreators ={
    photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex, setUserByLogin, setWallPostByLogin, addNewWallPost
  }

  const mapStateToProps = (state) =>
  {
    return{
        viewer: state.viewer,
        viewedUser: state.viewedUser,
        userInfo: state.userInfo
    }
  }

  export default connect(mapStateToProps, actionCreators)(Main);