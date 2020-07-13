import React from 'react';
import AvatarEditor from 'react-avatar-editor'
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {WarningOutlined} from '@ant-design/icons'
import {Image,  Button, Modal, Form} from 'react-bootstrap';
import { updateProfilePhoto, updateProfileInfo} from '../../Reducer/reducerUserInfo'
import { connect } from 'react-redux'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



class Options extends React.Component
{


    constructor(props)
    {
        super(props);

        this.state = {
            showModalWindow: false,
            toNewPhotoProfilePath: null,
            zoom: 1,

            isBtnAwailible: false,

            firstName: this.props.userInfo.User.firstName,
            middleName: this.props.userInfo.User.middleName,
            lastName: this.props.userInfo.User.lastName,
            status: this.props.userInfo.User.status,
            birthDay: new Date(this.props.userInfo.User.birthDay),
            address: this.props.userInfo.User.address,
            aboutMe: this.props.userInfo.User.aboutMe,

            firstNameErr: '',
            middleNameErr: '',
            lastNameErr: '',
            statusErr: '',
            birthDayErr: '',
            addressErr: '',
            aboutMeErr: '',
        }

        this.oneWordExp = / /;
    }

    getRightAvatarPath = () =>
    {
        if(this.props.userInfo.User === null)
        {
            console.log(this.props.userInfo.User.avatarpath)
            return "../un-user.jpg";
        }
        else
        {
            if(this.props.userInfo.User.avatarpath === null)
                return "../un-user.jpg";
            else
                return "http://localhost:8080" + this.props.userInfo.User.avatarpath;
        }
    }

    wheelScroll = (e) =>
    {
        var delta = e.deltaY || e.detail || e.wheelDelta;
        delta = delta / 1000;
        let currzoom = this.state.zoom + delta;
        if(currzoom >= 1 && currzoom <= 5)
            this.setState({zoom: this.state.zoom + delta});
    }
    handleClose = () => this.setState({showModalWindow: false});
    handleShow = () => this.setState({showModalWindow: true});
    handleUploadImg = () => {
        const canvas = this.editor.getImageScaledToCanvas().toDataURL();
        const blobBin = atob(canvas.split(',')[1]);
        const array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        const file=new Blob([new Uint8Array(array)], {type: 'image/png', name: '123'});
        this.props.updateProfilePhoto(file, this.props.userInfo.User.login, this.props.userInfo.token);
        this.handleClose();
    };

    setEditorRef = (editor) => this.editor = editor;

    addingFiles = (e) =>
    {
        console.log(e.target.files[0]);
        this.setState({toNewPhotoProfilePath: e.target.files[0]});
        this.handleShow();
    }

    setAvatarPhoto = () =>
    {
        return(
        <Modal show={this.state.showModalWindow}
               onHide={this.handleClose}
               backdrop="static"
               keyboard={false} >
            <Modal.Header closeButton>
                <Modal.Title>Обработка фото</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex w-100 h-100">
                <AvatarEditor
                    id="avaEdit"
                    ref={this.setEditorRef}
                    image={this.state.toNewPhotoProfilePath}
                    width={1000}
                    height={1000}
                    border={50}
                    borderRadius={500}
                    color={[0, 0, 0, 0.4]} // RGBA
                    scale={this.state.zoom}
                    rotate={0}
                    onWheel={this.wheelScroll}
                    style={{borderRadius: 135, width:255, height: 255, margin: "auto"}}
                />
            </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose} >
                    Отмена
                </Button>
                <Button variant="primary" onClick={this.handleUploadImg}>
                    Обновить
                </Button>
            </Modal.Footer>
        </Modal>
        );
    }

    changeHandler = event => {
        this.setState({ [event.target.name]: event.target.value ? event.target.value : null }, () => {
            this.setState({isBtnAwailible: this.isFormValid()})
        });
    };

    birthDayChangeHandler = date => {
        this.setState({birthDay: date}, () => {
            this.setState({isBtnAwailible: this.isFormValid()})
        });
    }

    isFormValid = () =>
    {
        let isValid = true;
        if(this.state.firstName === null)
        {
            this.setState({firstNameErr: 'Имя не может быть пустым'});
            isValid = false;
        }
        else
            {
            if (this.state.firstName.length < 2) {
                this.setState({firstNameErr: 'Имя слишком короткое'});
                isValid = false;
            } else {
                if (this.state.firstName.length > 20) {
                    this.setState({firstNameErr: 'Имя слишком длинное'});
                    isValid = false;
                } else {
                    if (this.oneWordExp.test(this.state.firstName)) {
                        this.setState({firstNameErr: 'Имя должно состоять из одного слова'});
                        isValid = false;
                    } else {
                        this.setState({firstNameErr: ''});
                    }
                }
            }
        }

        if(this.state.middleName !== null)
        {
            if (this.state.middleName.length < 2) {
                this.setState({middleNameErr: 'Имя слишком короткое'});
                isValid = false;
            } else {
                if (this.state.middleName.length > 20) {
                    this.setState({middleNameErr: 'Имя слишком длинное'});
                    isValid = false;
                } else {
                    if (this.oneWordExp.test(this.state.middleName)) {
                        this.setState({middleNameErr: 'Имя должно состоять из одного слова'});
                        isValid = false;
                    } else {
                        this.setState({middleNameErr: ''});
                    }
                }
            }
        }
        else
            this.setState({middleNameErr: ''});

        if(this.state.lastName === null)
        {
            this.setState({lastNameErr: 'Имя не может быть пустым'});
            isValid = false;
        }
        else
        {
            if (this.state.lastName.length < 2) {
                this.setState({lastNameErr: 'Имя слишком короткое'});
                isValid = false;
            } else {
                if (this.state.lastName.length > 20) {
                    this.setState({lastNameErr: 'Имя слишком длинное'});
                    isValid = false;
                } else {
                    if (this.oneWordExp.test(this.state.lastName)) {
                        this.setState({lastNameErr: 'Имя должно состоять из одного слова'});
                        isValid = false;
                    } else {
                        this.setState({lastNameErr: ''});
                    }
                }
            }
        }

        if(this.state.status !== null)
        {
            if (this.state.status.length > 200) {
                this.setState({statusErr: 'Ваш статус слишком длинный'});
                isValid = false;
            } else {
                this.setState({statusErr: ''});
            }
        }
        else
            this.setState({statusErr: ''});

        if(this.state.address !== null)
        {
            if (this.state.address.length > 100) {
                this.setState({addressErr: 'Адрес слишком длинный'});
                isValid = false;
            } else {
                this.setState({addressErr: ''});
            }
        }
        else
            this.setState({addressErr: ''});

        if(this.state.aboutMe !== null)
        {
            if (this.state.aboutMe.length > 255) {
                this.setState({aboutMeErr: 'Поле обо мне слишком длинный'});
                isValid = false;
            } else {
                this.setState({aboutMeErr: ''});
            }
        }
        else
            this.setState({aboutMeErr: ''});


        let isSomethingChange = false;
        if(this.state.firstName !== this.props.userInfo.User.firstName)
            isSomethingChange = true;
        if(this.state.middleName !== this.props.userInfo.User.middleName)
            isSomethingChange = true;
        if(this.state.lastName !== this.props.userInfo.User.lastName)
            isSomethingChange = true;
        if(this.state.status !== this.props.userInfo.User.status)
            isSomethingChange = true;
        if(this.state.birthDay.toDateString() !== new Date(this.props.userInfo.User.birthDay).toDateString())
            isSomethingChange = true;
        if(this.state.aboutMe !== this.props.userInfo.User.aboutMe)
            isSomethingChange = true;
        if(this.state.address !== this.props.userInfo.User.address)
            isSomethingChange = true;
        return isSomethingChange && isValid;
    }

    SaveChanges = () =>
    {
        this.props.updateProfileInfo({
            firstName: this.state.firstName,
            middleName: this.state.middleName,
            lastName: this.state.lastName,
            status: this.state.status,
            birthDay: this.state.birthDay.toDateString(),
            address: this.state.address,
            aboutMe: this.state.aboutMe,
        }, this.props.userInfo.token, this.props.userInfo.User.login, () => {
            this.setState({isBtnAwailible: false});
        });

    }

    render()
    {
        document.title = `mini - Options`;
        return (
        <div className="row top-space">
            <div className="col-sm-3 d-flex flex-column top-space">
                <div className="d-flex flex-column justify-content-center">
                    <Image src={this.getRightAvatarPath()} className="img-source img-border"/>
                    {this.setAvatarPhoto()}
                    <label htmlFor="upload-photo" className="btn btn-primary w-100 btn-sm">Обновить фото профиля</label>
                    <input type="file" name="photo" id="upload-photo" accept=".jpg,.jpeg,.png"
                           onChange={this.addingFiles}/>
                </div>
            </div>
            <div className="col-sm-9 flex-column account-info top-space">
                <div className="d-flex">
                    <Form.Control className="mr-1" size="sm" type="text" placeholder="Имя" value={this.state.firstName} name="firstName"  onChange={this.changeHandler}/>
                    <Form.Control className="mr-1" size="sm" type="text" placeholder="Отчество" value={this.state.middleName} name="middleName"  onChange={this.changeHandler}/>
                    <Form.Control  size="sm" type="text" placeholder="Фамилия" value={this.state.lastName} name="lastName"  onChange={this.changeHandler}/>
                </div>
                <div className="d-flex">
                    <div className="w-100"><p className="text-danger" style={{fontSize: 14}}>{this.state.firstNameErr}</p></div>
                    <div className="w-100"><p className="text-danger" style={{fontSize: 14}}>{this.state.middleNameErr}</p></div>
                    <div className="w-100"><p className="text-danger" style={{fontSize: 14}}>{this.state.lastNameErr}</p></div>
                </div>
                <Form.Control className="mt-1" size="sm" type="text" placeholder="Статус" value={this.state.status} name="status"  onChange={this.changeHandler}/>
                <p className="text-danger" style={{fontSize: 14}}>{this.state.statusErr}</p>
                <hr/>
                <div className="d-flex w-100">
                    <span>День рождения: </span>
                    <DatePicker className="ml-1 form-control form-control-sm"
                                selected={this.state.birthDay}
                                name="birthDay"
                                onChange={this.birthDayChangeHandler}
                                minDate={new Date(new Date().getFullYear() - 120, 0, 1)}
                                maxDate={new Date(new Date().getFullYear() - 5, 0, 1)}
                    />
                </div>
                <p className="text-danger" style={{fontSize: 14}}>{this.state.birthDayErr}</p>
                <Form.Control className="mt-1" size="sm" type="text" placeholder="Адрес" value={this.state.address} name="address"  onChange={this.changeHandler}/>
                <p className="text-danger" style={{fontSize: 14}}>{this.state.addressErr}</p>
                <Form.Control className="mt-1" size="sm" type="text" placeholder="Обо мне" value={this.state.aboutMe} name="aboutMe"  onChange={this.changeHandler}/>
                <p className="text-danger" style={{fontSize: 14}}>{this.state.aboutMeErr}</p>
                <hr/>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-sm btn-success" disabled={!this.state.isBtnAwailible} onClick={this.SaveChanges}>Сохранить</button>
                </div>
            </div>
        </div>
        );
    }
}

const actionCreators ={
    updateProfilePhoto, updateProfileInfo
  }
  
  
  const mapStateToProps = (state) =>
  {
    return{
        userInfo: state.userInfo
    }
  }
  
  
  export default connect(mapStateToProps, actionCreators)(Options);