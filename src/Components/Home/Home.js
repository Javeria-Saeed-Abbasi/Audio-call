import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  ListGroupItem,
  Row,
} from 'react-bootstrap'
import CardHeader from 'react-bootstrap/esm/CardHeader'
import avatar1 from '../../images/avtar3.jpg'
import avatar2 from '../../images/avatar4.jpg'
import '../Home/home.css'
import { RxDotFilled } from 'react-icons/rx'
import { FaArrowAltCircleLeft, FaDesktop, FaSearch } from 'react-icons/fa'
import { BsTelephone } from 'react-icons/bs'
import { BsCameraVideo, BsPencilSquare } from 'react-icons/bs'
import { GrSend } from 'react-icons/gr'
// import Chat from "../Conversation/Conversation";
// import Members from "../Members/Members";
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
// import Peer from "simple-peer";
import io from 'socket.io-client'
import Modal from 'react-bootstrap/Modal'
import apiRTC, { UserAgent } from '@apirtc/apirtc'
import $ from 'jquery'

const Home = () => {
  const [show, setShow] = useState(false)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [data, setData] = useState({ name: 'User', img: avatar1 })
  const [hideShow, setHideShow] = useState(false)
  // Modal video  States
  const [callId, setCallId] = useState('')
  const [invitation, setInvitation] = useState('')
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)
  const [connectedSession, setConnectedSession] = useState('')
  // Modal audio States
  const [showModal2, setShowModal2] = useState(false)
  const handleClose2 = () => setShowModal2(false)
  const handleShow2 = () => {
    setShowModal2(true)
  }

  const saveData = (value) => {
    setData(value)
    console.log(value)
  }
  let w = window.innerWidth
  console.log(w)

  apiRTC.setLogLevel(10)

  // var connectedSession = null

  function showAcceptDeclineButtons() {
    setHideShow(true)
    // document.getElementById('accept').style.display = 'inline-block'
    // document.getElementById('decline').style.display = 'inline-block'
  }

  function hideAcceptDeclineButtons() {
    setHideShow(false)
    // $('#accept').off('click')
    // $('#decline').off('click')
    // document.getElementById('accept').style.display = 'none'
    // document.getElementById('decline').style.display = 'none'
  }

  function selectPhonebookItem(idItem) {
    $('#number').val(idItem)
  }

  const userAgent = new UserAgent({
    uri: 'apiKey:' + 'd0cd993e33f71151e3ebf7a18154f9bf',
  })

  useEffect(() => {
    userAgent
      .register()
      .then((session) => {
        console.log(session, 'id')
        session
          .on('contactListUpdate', (updatedContacts) => {
            console.log(updatedContacts)
            setId(session.id)
            updateAddressBook(session)
            setConnectedSession(session)
            console.log(session, 'session')
          })
          .on('incomingCall', function (invitation) {
            console.log('incoming callll')
            // let textAdd = (document.getElementById('incomingCall').innerHTML =
            //   'incoming call')

            callInvitationProcess(invitation)
          })
          .on('incomingScreenSharingCall', function (call) {
            //When client receives an screenSharing call from another user
            console.log('screenSharing received from :', call.getContact().id)
            setCallListeners(call)
            addHangupButton(call.getId())
          })
          .on('incomingScreenSharingCallInvitation', function (invitation) {
            //When client receives an screenSharing call from another user
            console.log('incomingScreenSharingCallInvitation ')
            callInvitationProcess(invitation)
          })
      })
      .catch(function (error) {
        // error
        console.error('User agent registration failed', error)
      })
  }, [])

  function addStreamInDiv(stream, divId, mediaEltId, style, muted) {
    var streamIsVideo = stream.hasVideo()
    console.error('addStreamInDiv - hasVideo? ' + streamIsVideo)

    var mediaElt = null,
      divElement = null,
      funcFixIoS = null,
      promise = null

    if (streamIsVideo === 'false') {
      mediaElt = document.createElement('audio')
    } else {
      mediaElt = document.createElement('video')
    }

    mediaElt.id = mediaEltId
    mediaElt.autoplay = true
    mediaElt.muted = muted
    mediaElt.style.width = style.width
    mediaElt.style.height = style.height

    funcFixIoS = function () {
      var promise = mediaElt.play()

      console.log('funcFixIoS')
      if (promise !== undefined) {
        promise
          .then(function () {
            // Autoplay started!
            console.log('Autoplay started')
            console.error('Audio is now activated')
            document.removeEventListener('touchstart', funcFixIoS)

            $('#status').empty().append('iOS / Safari : Audio is now activated')
          })
          .catch(function (error) {
            // Autoplay was prevented.
            console.error('Autoplay was prevented')
          })
      }
    }

    stream.attachToElement(mediaElt)

    divElement = document.getElementById(divId)
    divElement.appendChild(mediaElt)
    promise = mediaElt.play()

    if (promise !== undefined) {
      promise
        .then(function () {
          // Autoplay started!
          console.log('Autoplay started')
        })
        .catch(function (error) {
          // Autoplay was prevented.
          if (apiRTC.osName === 'iOS') {
            console.info(
              'iOS : Autoplay was prevented, activating touch event to start media play',
            )
            //Show a UI element to let the user manually start playback

            //In our sample, we display a modal to inform user and use touchstart event to launch "play()"
            document.addEventListener('touchstart', funcFixIoS)
            console.error(
              'WARNING : Audio autoplay was prevented by iOS, touch screen to activate audio',
            )
            $('#status')
              .empty()
              .append(
                'WARNING : iOS / Safari : Audio autoplay was prevented by iOS, touch screen to activate audio',
              )
          } else {
            console.error('Autoplay was prevented')
          }
        })
    }
  }
  function setCallListeners(call) {
    call
      .on('localStreamAvailable', function (stream) {
        console.log('localStreamAvailable')
        //document.getElementById('local-media').remove();
        addStreamInDiv(
          stream,
          'local-container',
          'local-media-' + stream.getId(),
          { width: '160px', height: '120px' },
          true,
        )
        stream.on('stopped', function () {
          //When client receives an screenSharing call from another user
          console.error('Stream stopped')
          $('#local-media-' + stream.getId()).remove()
        })
      })
      .on('streamAdded', function (stream) {
        console.log('stream :', stream)
        addStreamInDiv(
          stream,
          'remote-container',
          'remote-media-' + stream.getId(),
          { width: '640px', height: '480px' },
          false,
        )
      })
      .on('streamRemoved', function (stream) {
        // Remove media element
        document.getElementById('remote-media-' + stream.getId()).remove()
      })
      .on('userMediaError', function (e) {
        console.log('userMediaError detected : ', e)
        console.log('userMediaError detected with error : ', e.error)

        //Checking if tryAudioCallActivated
        if (e.tryAudioCallActivated === false) {
          $('#hangup-' + call.getId()).remove()
        }
      })
      .on('desktopCapture', function (e) {
        console.log('desktopCapture event : ', e)
        $('#hangup-' + call.getId()).remove()
      })
      .on('hangup', function () {
        $('#hangup-' + call.getId()).remove()
      })
  }
  function callInvitationProcess(invitation) {
    setInvitation(invitation)
    invitation.on('statusChange', function (statusChangeInfo) {
      console.error('statusChangeInfo :', statusChangeInfo)

      if (statusChangeInfo.status === apiRTC.INVITATION_STATUS_EXPIRED) {
        console.error('INVITATION_STATUS_EXPIRED')
        // Hide accept/decline buttons
        hideAcceptDeclineButtons()
      }
    })
    // let acceptBtn = document.getElementById('accept')
    // console.log(btn, 'btn') //===============================================
    // ACCEPT OR DECLINE
    //===============================================
    // Display accept/decline buttons
    showAcceptDeclineButtons()

    // Add listeners
    // acceptBtn.onclick(() => {})
    $('#accept').on('click', function () {
      //==============================
      // ACCEPT CALL INVITATION
      //==============================

      console.log('hhi')
      if (invitation.getCallType() == 'audio') {
        //When receiving an audio call
        var answerOptions = {
          mediaTypeForIncomingCall: 'AUDIO', //Answering with audio only.
        }
        invitation.accept(null, answerOptions).then(function (call) {
          setCallListeners(call)
          addHangupButton(call.getId())
        })
      } else {
        invitation
          .accept() //Answering with audio and video.
          .then(function (call) {
            setCallListeners(call)
            addHangupButton(call.getId())
          })
      }
      // Hide accept/decline buttons
      hideAcceptDeclineButtons()
    })

    $('#decline').on('click', function () {
      // Decline call invitation
      invitation.decline()
      // Hide accept/decline buttons
      hideAcceptDeclineButtons()
    })

    //   acceptBtn.onclick(() => {
    //   if (invitation.getCallType() == 'audio') {
    //     //When receiving an audio call
    //     var answerOptions = {
    //       mediaTypeForIncomingCall: 'AUDIO', //Answering with audio only.
    //     }
    //     invitation.accept(null, answerOptions).then(function (call) {
    //       setCallListeners(call)
    //       addHangupButton(call.getId())
    //     })
    //   } else {
    //     invitation
    //       .accept() //Answering with audio and video.
    //       .then(function (call) {
    //         setCallListeners(call)
    //         addHangupButton(call.getId())
    //       })
    //   }
    //   // Hide accept/decline buttons
    //   hideAcceptDeclineButtons()
    // })
    // let declineBtn = document.getElementById('decline')
    // console.log(declineBtn)

    // declineBtn.onclick(() => {
    //   console.log('decline')
    //   invitation.decline()
    //   // Hide accept/decline buttons
    //   hideAcceptDeclineButtons()
    // })
  }

  function updateAddressBook(session) {
    console.log('updateAddressBook')

    //var contactListArray = connectedSession.getContactsArray(),
    var contactListArray = session.getOnlineContactsArray(), //Get online contacts
      i = 0

    console.log('contactListArray :', contactListArray)

    //Cleaning addressBook list
    $('#addressBookDropDown').empty()

    for (i = 0; i < contactListArray.length; i += 1) {
      var user = contactListArray[i]
      console.log('userId :', user.getId())
      //Checking if connectedUser is not current user befire adding in addressBook list
      if (user.getId() !== session.apiCCId) {
        $('#addressBookDropDown').append(
          '<li><a href="#" onclick="selectPhonebookItem(' +
            user.getId() +
            ')">' +
            user.getId() +
            '</a></li>',
        )
      }
    }
  }

  function hangupCall(callId) {
    console.log('hangupCall :', callId)
    $('#hangup-' + callId).remove()
    //Getting call from ApiRTC call lists
    var call = connectedSession.getCall(callId)
    call.hangUp()
  }

  function releaseStream(streamId) {
    console.log('releaseStream :', streamId)
    $('#relstream-' + streamId).remove()
    var stream = apiRTC.Stream.getStream(streamId)
    stream.release()
  }

  function addHangupButton(callId1) {
    setCallId(callId1)
    $('#hangupButtons').append(
      '<input id="hangup-' +
        callId1 +
        '" class="btn btn-danger" type="button" value="Hangup-' +
        callId1 +
        '" onclick="hangupCall(' +
        callId1 +
        ')" />',
    )
  }

  function addReleaseStreamButton(streamId) {
    $('#streamButtons').append(
      '<input id="relstream-' +
        streamId +
        '" class="btn btn-info" type="button" value="relstream-' +
        streamId +
        '" onclick="releaseStream(' +
        streamId +
        ')" />',
    )
  }

  //Audio Call establishment
  $('#callAudio').click(function () {
    console.log('hi', connectedSession)

    var contact = connectedSession.getOrCreateContact($('#number').val())
    var callOptions = {
      mediaTypeForOutgoingCall: 'AUDIO',
    }
    var call = contact.call(null, callOptions)
    if (call !== null) {
      setCallListeners(call)
      addHangupButton(call.getId())
    } else {
      console.warn('Cannot establish call')
    }
  })

  //Call establishment
  $('#callVideo').click(function () {
    var contact = connectedSession.getOrCreateContact($('#number').val())
    var call = contact.call()
    if (call !== null) {
      setCallListeners(call)
      addHangupButton(call.getId())
    } else {
      console.warn('Cannot establish call')
    }
  })

  //ScreenSharing establishment
  $('#shareScreen').click(function () {
    console.log('MAIN - Click screenCall')
    var contact = connectedSession.getOrCreateContact($('#number').val())
    var callConfiguration = {}

    if (apiRTC.browser === 'Firefox') {
      callConfiguration.captureSourceType = 'screen'
    } else {
      //Chrome
      callConfiguration.captureSourceType = ['screen', 'window', 'tab', 'audio']
    }

    var call = contact.shareScreen(callConfiguration)
    if (call !== null) {
      setCallListeners(call)
      addHangupButton(call.getId())
    } else {
      console.warn('Cannot establish call')
    }
  })

  return (
    <div>
      <Container fluid className="py-5" style={{ backgroundColor: '#eee' }}>
        <Row>
          <Col md="6" lg="5" xl="4" sm="12" className="mb-4 mb-md-0 ">
            <div
              className="members position-fixed"
              style={{
                display: w <= 414 ? (show ? 'none' : 'block') : 'block',
              }}
            >
              <Card>
                {/* <h5 className="font-weight-bold mb-3 text-center text-lg-start">
            Member
          </h5> */}
                <Card.Body>
                  <ListGroupItem className="mb-0">
                    <li>
                      <div className="input-group form-sm form-1 pl-0 mb-4">
                        <div className="input-group-prepend py-2">
                          <span
                            className="input-group-text purple lighten-3"
                            id="basic-text1"
                          >
                            <FaSearch className="" icon="search" />
                          </span>
                        </div>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Search or start a new chat"
                          aria-label="Search"
                        />
                      </div>
                    </li>
                    <li
                      className="p-2"
                      style={{ backgroundColor: '#eee' }}
                      onClick={() => {
                        setShow(!show)
                        saveData({ name: 'Lee min hoo', img: avatar1 })
                      }}
                    >
                      <a
                        href="#!"
                        className="d-flex justify-content-between text-decoration-none"
                      >
                        <div className="d-flex flex-row">
                          <div className="avatar-img">
                            <img
                              src={avatar1}
                              alt="avatar"
                              className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                            />
                          </div>
                          <div className="user-name">
                            <p className=" mb-0">Lee Min hoo</p>
                            {/* <p className="small text-muted">
                          Hello, Are you there?
                        </p> */}
                          </div>
                        </div>
                        <div className="online">
                          <RxDotFilled color="#008000" />
                          {/* <p className="small text-muted mb-1">Just now</p>
                      <span className="badge bg-danger float-end">1</span> */}
                        </div>
                      </a>
                    </li>
                    <li
                      className="p-2"
                      onClick={() => {
                        setShow(!show)
                        saveData({ name: 'ShadabKhan', img: avatar2 })
                      }}
                    >
                      <a
                        href="#!"
                        className="d-flex justify-content-between text-decoration-none"
                      >
                        <div className="d-flex flex-row">
                          <span className="avatar-img">
                            <img
                              src={avatar2}
                              alt="avatar"
                              className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                            />
                          </span>
                          <div className="user-name">
                            <p className=" mb-0">Shadab Khan</p>
                            {/* <p className="small text-muted">
                          Hello, Are you there?
                        </p> */}
                          </div>
                        </div>
                        <div className="online">
                          <RxDotFilled color="#008000" />
                          {/* <p className="small text-muted mb-1">Just now</p>
                      <span className="badge bg-danger float-end">1</span> */}
                        </div>
                      </a>
                    </li>
                  </ListGroupItem>
                </Card.Body>
              </Card>
            </div>
            {/* <Members /> */}
          </Col>

          <Col md="6" lg="7" xl="8" sm="12">
            <div
              className="user-chat position-fixed"
              style={{
                display: w <= 414 ? (show ? 'block' : 'none') : 'block',
              }}
            >
              <ListGroupItem>
                <li className="p-2 user">
                  <a
                    href="#!"
                    className="d-flex justify-content-between text-decoration-none"
                  >
                    <Button
                      style={{
                        display: w <= 414 ? (show ? 'block' : 'none') : 'none',
                      }}
                      onClick={() => setShow(!show)}
                      className="left-btn"
                    >
                      <FaArrowAltCircleLeft className="arrow-left" />
                    </Button>
                    <div className="d-flex flex-row">
                      <span className="avatar-img">
                        <img
                          src={data.img ? data.img : avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                        />
                      </span>
                      <div className="user-name">
                        <p className="mb-0">{data.name}</p>
                        {/* <p className="small text-muted">
                            Hello, Are you there?
                            </p> */}
                      </div>
                    </div>
                    <div className="online">
                      <span className="feature1">
                        <Button onClick={handleShow2}>
                          <BsTelephone />
                        </Button>
                      </span>
                      <span className="feature2">
                        <Button onClick={handleShow}>
                          <BsCameraVideo />
                        </Button>
                      </span>
                      {/* <p className="small text-muted mb-1">Just now</p>
                        <span className="badge bg-danger float-end">1</span> */}
                    </div>
                  </a>
                </li>
                {/* chatbox */}
                <div className="chat-box py-3 px-3">
                  <div>
                    <li className="d-flex justify-content-end align-items-center mb-2 user1">
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
               <p className="fw-bold mb-0">Lara Croft</p>
               <p className="text-muted small mb-0">
               </p>
             </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">hello</p>
                        </Card.Body>
                        {/* <Card.Footer>
           
               
             </Card.Footer> */}
                      </Card>

                      <span className="avatar-img">
                        <img
                          src={avatar2}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                    </li>
                    <p className="text-muted small text-end mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-start mb-2 user2">
                      <span className="avatar-img avtar-img2">
                        <img
                          src={avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                   
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                    </li>
                    <p className="text-muted small text-start mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-end mb-2 user1">
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Lara Croft</p>
                  <p className="text-muted small mb-0">
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">hello</p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                </Card.Footer> */}
                      </Card>
                      <span className="avatar-img">
                        <img
                          src={avatar2}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                    </li>
                    <p className="text-muted small text-end mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-start mb-2 user2">
                      <span className="avatar-img avtar-img2">
                        <img
                          src={avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                   
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                    </li>
                    <p className="text-muted small text-start mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-end mb-2 user1">
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Lara Croft</p>
                  <p className="text-muted small mb-0">
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">hello</p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                      <span className="avatar-img">
                        <img
                          src={avatar2}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                    </li>
                    <p className="text-muted small text-end mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-start mb-2 user2">
                      <span className="avatar-img avtar-img2">
                        <img
                          src={avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                   
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                    </li>
                    <p className="text-muted small text-start mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>
                  <div>
                    <li className="d-flex justify-content-end mb-2 user1">
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Lara Croft</p>
                  <p className="text-muted small mb-0">
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">hello</p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                      <span className="avatar-img">
                        <img
                          src={avatar2}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                    </li>
                    <p className="text-muted small text-end mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-start mb-2 user2">
                      <span className="avatar-img avtar-img2">
                        <img
                          src={avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                   
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                    </li>
                    <p className="text-muted small text-start mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>
                  <div>
                    <li className="d-flex justify-content-end mb-2 user1">
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Lara Croft</p>
                  <p className="text-muted small mb-0">
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">hello</p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                      <span className="avatar-img">
                        <img
                          src={avatar2}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                    </li>
                    <p className="text-muted small text-end mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>

                  <div>
                    <li className="d-flex justify-content-start mb-2 user2">
                      <span className="avatar-img avtar-img2">
                        <img
                          src={avatar1}
                          alt="avatar"
                          className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                        />
                      </span>
                      <Card className="usercard mx-3">
                        {/* <CardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                   
                  </p>
                </CardHeader> */}
                        <Card.Body>
                          <p className="mb-0">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                        </Card.Body>
                        {/* <Card.Footer>
                <p className="text-muted small mb-0">
                28/12/2022 9:18 AM
                  </p>
                  
                </Card.Footer> */}
                      </Card>
                    </li>
                    <p className="text-muted small text-start mt-0">
                      28/12/2022 9:18 AM
                    </p>
                  </div>
                </div>

                <div className="text-area">
                  <li className="mb-3">
                    <InputGroup>
                      <Form.Control
                        as="textarea"
                        aria-label="With textarea"
                        placeholder="Type your message here"
                      />
                      <InputGroup.Text>
                        <Button color="" rounded="true" className="float-end">
                          <GrSend />
                        </Button>
                      </InputGroup.Text>
                    </InputGroup>
                  </li>
                </div>
              </ListGroupItem>
            </div>
            {/* <Chat /> */}
          </Col>
        </Row>
      </Container>
      {/* Modal video */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Video Calling</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            {/* <legend id="my-number"></legend>
        <div className="row position-absolute">
            <div id="remote-container" className="w-100 bg-dark" >
            </div>
            <div id="local-container" className="bg-danger">
            </div>
        </div> */}
            <div className="video-container">
              <p id="my-number">{id}</p>

              <div className="video my-video bg-dark">
                <div id="remote-container" className="w-100 bg-dark"></div>
              </div>
              <div className="video user-video bg-danger">
                <div id="local-container" className="bg-danger"></div>
              </div>
            </div>
            {/* <div className="myId">
            </div> */}
          </>
        </Modal.Body>
      </Modal>

      {/* Modal Audio */}
      <Modal show={showModal2} onHide={handleClose2}>
        <Modal.Header closeButton>
          <Modal.Title>Audio Calling</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <!-- Begin page content --> */}
          <main role="main" className="container">
            <div className="input-group">
              <span className="input-group-btn">
                <button
                  type="button"
                  id="addressBook"
                  data-toggle="dropdown"
                  className="btn btn-success dropdown-toggle"
                >
                  <span
                    className="fa fa-address-book"
                    aria-hidden="true"
                  ></span>
                </button>
                <ul className="dropdown-menu" id="addressBookDropDown">
                  <li>
                    <a id="client1" href="#">
                      No other connected users
                    </a>
                  </li>
                </ul>
              </span>
              <input
                type="text"
                id="number"
                onChange={(e) => console.log(e)}
                className="form-control"
                placeholder="Username"
                aria-describedby="sizing-addon1"
              />
              <span className="input-group-btn">
                <button
                  type="button"
                  id="callAudio"
                  className="btn btn-success"
                  onClick={() => {
                    setTimeout(() => {
                      console.log('htta', connectedSession)
                      alert('hi')
                      var contact = connectedSession.getOrCreateContact(
                        $('#number').val(),
                      )
                      var call = contact.call()
                      if (call !== null) {
                        setCallListeners(call)
                        addHangupButton(call.getId())
                      } else {
                        console.warn('Cannot establish call')
                      }
                      console.log('hi')
                    }, 1000)
                  }}
                >
                  <BsTelephone />
                </button>
                <button
                  type="button"
                  id="callVideo"
                  className="btn btn-success"
                >
                  <BsCameraVideo />
                </button>
                <button
                  type="button"
                  id="shareScreen"
                  className="btn btn-success"
                >
                  <FaDesktop />
                </button>
              </span>
            </div>

            {hideShow ? (
              <>
                <button
                  type="button"
                  id="accept"
                  onClick={() => {
                    console.log('hhi')
                    console.log(invitation)
                    if (invitation.getCallType() == 'audio') {
                      //When receiving an audio call
                      var answerOptions = {
                        mediaTypeForIncomingCall: 'AUDIO', //Answering with audio only.
                      }
                      invitation
                        .accept(null, answerOptions)
                        .then(function (call) {
                          setCallListeners(call)
                          addHangupButton(call.getId())
                        })
                    } else {
                      invitation
                        .accept() //Answering with audio and video.
                        .then(function (call) {
                          setCallListeners(call)
                          addHangupButton(call.getId())
                        })
                    }
                    // Hide accept/decline buttons
                    hideAcceptDeclineButtons()
                  }}
                  className="btn btn-success"
                >
                  Accept call
                </button>
                <button
                  type="button"
                  id="decline"
                  onClick={() => {
                    invitation.decline()
                    // Hide accept/decline buttons
                    hideAcceptDeclineButtons()
                  }}
                  className="btn btn-danger"
                >
                  Decline call
                </button>
              </>
            ) : null}
            <div className="row position:absolute">
              <div
                id="hangupButtons"
                onClick={() => {
                  console.log('hangupCall :', callId)
                  $('#hangup-' + callId).remove()
                  //Getting call from ApiRTC call lists
                  var call = connectedSession.getCall(callId)
                  console.log(call, 'calluthai')
                  call.hangUp()
                }}
              ></div>
            </div>
            {/* <div className="row position:absolute">
              <div id="incomingCall"></div>
            </div> */}
            <div className="row position:absolute">
              <div id="streamButtons"></div>
            </div>
            <p id="my-number">Your ID: {id}</p>
            <div className="row position:absolute">
              <div id="remote-container w-100"></div>
              <div id="local-container"></div>
            </div>
          </main>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Home
