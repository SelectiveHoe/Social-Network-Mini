import React from 'react';
//import AvatarEditor from 'react-avatar-editor'
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Tabs, Tab, Image} from 'react-bootstrap';
import {} from '../../Reducer/reducerUserInfo'
import {SearchOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons'
import { connect } from 'react-redux'
import {getUsers, searchUsers, getFriends, getFriendsRequest, responseFriendRequest} from "../Api/serverApi";
import {Link} from 'react-router-dom';

class Friends extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            currentPage: 'myFriends',

            findFriendsList: [],
            searchValue: '',
            isSearchInSearchFriends: false,

            friendsRequestList: [],

            friendsList: [],
        };
    }

    componentDidMount = () =>
    {
        window.addEventListener('scroll', this.loadMore);
        getFriends(this.props.userInfo.token, 0, 15, (res) => {
            if(res)
                this.setState({friendsList: res});
         });
    }

    componentWillUnmount = () =>
    {
        window.removeEventListener('scroll', this.loadMore);
    }

    loadMore = () => {
        if (window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight) {
            switch(this.state.currentPage)
            {
                case "myFriends":
                {
                    getFriends(this.props.userInfo.token, this.state.friendsList.length, 15, (res) => {
                        if(res)
                            this.setState({friendsList: this.state.friendsList.concat(res)});
                    });
                }
                    break;
                case "searchFriends":
                {
                    if(this.state.isSearchInSearchFriends)
                    {
                        searchUsers(this.state.searchValue ,this.state.findFriendsList.length, 15, (res) => {
                            if (res) {
                                this.setState({findFriendsList: this.state.findFriendsList.concat(res)});
                            }
                        });
                    }
                    else {
                        getUsers(this.state.findFriendsList.length, 15, (res) => {
                            if (res) {
                                this.setState({findFriendsList: this.state.findFriendsList.concat(res)});
                            }
                        });
                    }
                }
                    break;
                case "requestFriends":
                {

                }
                    break;
            }
        }
    }

    searchHandler = (e) =>
    {
        if(e.keyCode === 13) {
            if(this.state.searchValue !== '')
            {
                this.setState({isSearchInSearchFriends: true});
                searchUsers(this.state.searchValue, 0, 15, (res) => {
                    if(res)
                    {
                        this.setState({findFriendsList: res});
                    }
                });
            }
            else
            {
                this.setState({isSearchInSearchFriends: false});
                getUsers(0, 15, (res) => {
                    if(res) {
                        this.setState({findFriendsList: res});
                    }
                });
            }
        }
    }

    changeTabHandler = (e) => {
        switch(e)
        {
            case "myFriends":
            {
                getFriends(this.props.userInfo.token, 0, 15, (res) => {
                    if(res)
                        this.setState({friendsList: res});
                });
            }
                break;
            case "searchFriends":
            {
                getUsers(0, 15, (res) => {
                    if(res) {
                        this.setState({findFriendsList: res});
                    }
                });
            }
                break;
            case "requestFriends":
            {
                getFriendsRequest(this.props.userInfo.token, (res) => {
                    if(res)
                    {
                        this.setState({friendsRequestList: res});
                    }
                });
            }
                break;
        }
        this.setState({currentPage: e});
    }

    searchValueHandler = (e) => {
        this.setState({searchValue: e.target.value});
    }

    acceptFriendHandler = (idWhoReq) =>
    {
        responseFriendRequest(idWhoReq, this.props.userInfo.token, 'Friends', (res)=> {
            getFriendsRequest(this.props.userInfo.token, (res) => {
                if(res)
                {
                    this.setState({friendsRequestList: res});
                }
            });
        });
    }

    deniedFriendHandler = (idWhoReq) => {
        responseFriendRequest(idWhoReq, this.props.userInfo.token, false, (res)=> {
            getFriendsRequest(this.props.userInfo.token, (res) => {
                if(res)
                {
                    this.setState({friendsRequestList: res});
                }
            });
        });
    }

    render()
    {
        document.title = `mini - Friends`;
        return (
        <div className="row top-space d-flex flex-column">
            <Tabs defaultActiveKey="myFriends" className="d-flex" onSelect={this.changeTabHandler}>
                <Tab tabClassName="text-dark" eventKey="myFriends" title="Мои друзья">
                    <div className="d-flex flex-wrap justify-content-center">
                        {this.state.friendsList.map(friend => {
                            return(
                                <Link to={"/users/" + friend.login } className="ml-1 mt-2 mr-1 img-thumbnail smooth-anim userFriendItem"
                                      style={{width: 220, height: 325}}>
                                    <Image className="w-100 img-source img-border" src={friend.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + friend.avatarpath}></Image>
                                    <hr className="mt-2 mb-2"/>
                                    <div className="d-flex justify-content-center">
                                        <span className="text-center comfortaa-font text-dark">{friend.firstName} {friend.lastName}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </Tab>
                <Tab tabClassName="text-dark" eventKey="searchFriends" title="Поиск людей">
                    <div className="input-group mt-1">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Поиск<SearchOutlined style={{marginLeft: 5}}/></span>
                        </div>
                        <input type="text" className="form-control" onChange={this.searchValueHandler} onKeyUp={this.searchHandler}/>
                    </div>
                    <div className="d-flex flex-wrap justify-content-center">
                        {this.state.findFriendsList.map(user => {
                            return (
                                <Link to={"/users/" + user.login } className="ml-1 mt-2 mr-1 img-thumbnail smooth-anim userFriendItem"
                                         style={{width: 220, height: 325}}>
                                    <Image className="w-100 img-source img-border" src={user.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + user.avatarpath}></Image>
                                    <hr className="mt-2 mb-2"/>
                                    <div className="d-flex justify-content-center">
                                        <span className="text-center comfortaa-font text-dark">{user.firstName} {user.lastName}</span>
                                    </div>
                                </Link>);
                        })}
                    </div>
                </Tab>
                <Tab tabClassName="text-dark" eventKey="requestFriends" title="Заявки в друзья">
                    <div className="d-flex flex-wrap justify-content-center">
                        {this.state.friendsRequestList.length !== 0 ? this.state.friendsRequestList.map(frReq => {
                            return (
                                <div className="mt-1 w-100 d-flex img-thumbnail" style={{height: 250}}>
                                    <Image className="h-100 w-auto img-source img-border" src={frReq.avatarpath === null ? "../un-user.jpg" : "http://localhost:8080" + frReq.avatarpath}></Image>
                                    <div className="d-flex flex-column w-100 ml-1">
                                        <span className="account-title mr-auto" style={{ fontSize: 25}}>{frReq.firstName} {frReq.middleName} {frReq.lastName}</span>
                                        <span className="comfortaa-font text-dark" style={{ fontSize: 15}}>{frReq.status}</span>
                                        {frReq.birthDay ? <span className="comfortaa-font text-dark mt-3" style={{ fontSize: 15}}><span className="font-weight-bold">День рождения:</span> {new Date(frReq.birthDay).toDateString()}</span> : ''}
                                        {frReq.address ? <span className="comfortaa-font text-dark" style={{ fontSize: 15}}><span className="font-weight-bold">Адресс:</span> {frReq.address}</span> : ""}
                                        {frReq.aboutMe ? <span className="comfortaa-font text-dark" style={{ fontSize: 15}}><span className="font-weight-bold">Про меня:</span> {frReq.aboutMe}</span> : ""}
                                    </div>
                                    <div className="d-flex flex-column">
                                        <button className="btn btn-outline-success p-3 h-100" onClick={() => {this.acceptFriendHandler(frReq.idUserAuth)}}>
                                            <CheckOutlined />
                                        </button>
                                        <button className="btn btn-outline-danger p-3 h-100" onClick={() => {this.deniedFriendHandler(frReq.idUserAuth)}}>
                                            <CloseOutlined />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : <div className="mt-5 comfortaa-font">Заявок пока нет...</div>}
                    </div>
                </Tab>
            </Tabs>
        </div>
        );
    }
}


const actionCreators ={

  }
  
  
  const mapStateToProps = (state) =>
  {
    return{
        userInfo: state.userInfo
    }
  }
  
  
  export default connect(mapStateToProps, actionCreators)(Friends);