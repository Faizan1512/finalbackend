//Backup conversation

import '../Styles/MessageForm.css';
import { useState, useEffect, useRef } from 'react';
import { BsFillSendFill } from "react-icons/bs";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { GrAttachment } from "react-icons/gr";
import { IoImagesSharp, IoSettingsSharp } from "react-icons/io5";
import { getmsg } from '../Service/ApiMsg';
import socket from '../socketjs';
import axios from 'axios';
import p1 from '../Img/p1.png';

const Conversation = (props) => {
  const [data, setdata] = useState('');
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sharedImages, setSharedImages] = useState([]);

  const messageContainerRef = useRef(null);
  let selectedUser = {
    ...props.selectedUser,
    messages: [],
  };
  var currentDate = new Date();
  // Get the current timestamp (milliseconds since January 1, 1970)
  var timestamp2 = currentDate.getTime();
  const [messages, setMessages] = useState([]);
  console.log('Selected user object chatwindow compo:', selectedUser);
  let messageContent = '';
  let ref; // Reference to the input field so that it gets cleared every time we submit
  const getContent = (e) => {
    messageContent = e.target.value;
    ref = e;
  };



  const getmsg = async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:4200/messages/${conversationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data);
    }
  };

  useEffect(() => {
    console.log('props.selectedUser.userID', props.selectedUser.userID);
    setMessages([]);
    const fetchMessages = async () => {
      try {
        const response = await getmsg('admin_' + props.selectedUser.userID);
        setMessages(response.messages);
        console.log('Successful message retrieved from database', response);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    if (props.selectedUser) {
      fetchMessages();
    }
  }, [props.selectedUser]);

  const messageEndRef = useRef(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // const scrollToBottom = () => {
  //   if (messageContainerRef.current) {
  //     messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  //   }
  // };
  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }


  const onMessage = (e, content) => {
    e.preventDefault();
    if (content == "" || content == " ") {
      return;
      // return false;
    }
    
    console.log('Message is:', content);
    ref.target.value = '';
    // ref.value = '';
    if (props.selectedUser) {
      socket.emit('private message', {
        content,
        to: props.selectedUser.userID,
      });
      socket.emit('save message', {
        content,
        conversationID: props.selectedUser.userID,
        to: props.selectedUser.userID
      });
      setMessages((messages) => [
        ...messages,
        { toUser: props.selectedUser.username, content, fromSelf: true, timestamp: timestamp2 },
      ]);
    }
    console.log('Message object', messages);
  };

  // function extractUsername(email) {
  //   email = email.split("")
  //   const atIndex = email.indexOf("@");
  //   if (atIndex !== -1) {
  //     return email.substring(0, atIndex);
  //   }
  //   return email;
  // }

  // const sendername = extractUsername(props.selectedUser.username);

  const showMessages = messages.map((message, index) => {
    // console.log("message MAMA",message)
    if (message.hasOwnProperty('fromSelf')) {
      console.log("message.hasOwnProperty('fromSelf')")
      if (message.fromSelf === true &&
        message.toUser === props.selectedUser.username) {
        // Message sent by the current user to the selected user

      
        return (
          <div className='owner-top'>
            <div className='owner'>
              <span>You</span>
              <div className='agent'>
                <p>{message.content}</p>
                <span className='time'>{formatTime(message.timestamp)}</span>
              </div>

            </div>
            {/* <div className="message-time">{formatTime(message.timestamp)}</div> */}
          </div>

        );
      }
      if (message.fromSelf === false &&
        message.fromUser === props.selectedUser.username) {
        // Message sent by the current user to the selected user
        return (
          <div className='outsider'>
            <div className='outside-user'>
              {/* <img src={prf} className='user-img' alt='p1' /> */}
              <img src={p1} className='user-img' alt='p1' />
            </div>
            <div className='user-outside'>
              <span className='sendername'>{props.selectedUser.username}</span>
              <div className='outside-user-message'>
                <p>{message.content}</p>
                <span className='time'>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      }
    } else {
      console.log("WARM WATER")
      if (message.from !== props.selectedUser.userID) {
        // Message sent by someone other than the selected user
        return (
          <div className='owner-top'>
            <div className='owner'>
              <span>You</span>
              <div className='agent'>
                <p>{message.content}</p>
                <span className='time'>{formatTime(message.timestamp)}</span>
              </div>

            </div>
            {/* <div className="message-time">{formatTime(message.timestamp)}</div> */}
          </div>
        );
      }
      if (message.from === props.selectedUser.userID) {
        // Message sent by someone other than the selected user
        return (
          <div className='outsider'>
            <div className='outside-user'>
              {/* <img src={prf} className='user-img' alt='p1' /> */}
              <img src={p1} className='user-img' alt='p1' />
            </div>
            <div className='user-outside'>
              <span className='sendername'>{props.selectedUser.username}</span>
              <div className='outside-user-message'>
                <p>{message.content}</p>
                <span className='time'>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      }

    }

  });


  // Helper function to format time as hh:mm
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  }

  socket.on('private message', ({ content, from }) => {
    console.log(props.connectedUsers);
    let newMessages = {};
    for (let i = 0; i < props.connectedUsers.length; i++) {
      const user = props.connectedUsers[i];
      if (user.userID === from) {
        console.log('Iteration:', i);
        newMessages = {
          fromUser: props.connectedUsers[i].username,
          content,
          fromSelf: false,
        };
        const messagesList = [...messages, newMessages];
        setMessages(messagesList);
      }
    }
  });

  console.log(showMessages);
  console.log('In chatwindow selected user:', props.selectedUser);
  useEffect(() => {
    let typingTimeout;

    socket.on('typing', () => {
      setIsTyping(true);

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    });
  }, []);


function SelectFile(e)
{


}
const handleImageUpload = (e) => {
  const file = e.target.files[0];

  if (file) {
    // Read the file and emit it to the server
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      console.log("iosdvcdsvndsnvsd",imageData)
      const Data=selectedUser.userID
      socket.emit('image', imageData,Data);
    };
    reader.readAsDataURL(file);
  }
};


  // useEffect(() => {
  //   socket.on('typing', (isTyping) => {
  //     setIsTyping(isTyping);
  //   });
  // }, []);
  // useEffect(() => {
  //   // Listen for 'typing' event from the server
  //   socket.on('typing', (typing) => {
  //     setIsTyping(typing);
  //     console.log("kindly Chal jaa",typing)
  //   });
   
  // }, []);
  useEffect(() => {
    // Listen for shared images
    if (socket) {
      socket.on('image', (imageData) => {
        setSharedImages((prevImages) => [...prevImages, imageData]);
      });
    }
  }, [socket]);
  return (
    <>
      <div className="messages-output">
        <div style={{ backgroundColor: '#eee', padding: '10px', textAlign: 'center', marginBottom: '10px', marginTop: '10px' }}>
          {
            props.selectedUser.username &&
            <p>Your Conversation with {props.selectedUser.username}</p>
          }

        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', marginTop: '30px' }}>
          {showMessages}
        </div>

        <div ref={messageEndRef} />
      </div>

      {props.selectedUser.username ?
        <div className='inpput-message'>
          <form onSubmit={(e) => onMessage(e, messageContent)}>
            <div className='form'>
              <div className='in-chat'>
                {/* onKeyDown={EnterKey} */}
                <input placeholder="Send Message" onChange={(e) => getContent(e)} />
                <div className='in-icon'>
                  {/* <MdOutlineEmojiEmotions className='icon' /> */}
                  {/* <IoImagesSharp className='icon' /> */}
                  {/* <GrAttachment className='icon' /> */}
                  {/* <IoSettingsSharp className='icon' /> */}
                </div>
              </div>
              <input type="file" onChange={handleImageUpload} />
              <button type="submit" disabled={!props.selectedUser.userID}><BsFillSendFill className='send' />Send</button>

            </div>
          </form>
        </div >
        :
        <span>Please Select User To Start Conversation</span>
      }
    </>
  );

  // return (
  //   <div>
  //     <input type="file" onChange={handleImageUpload} />

  //     {sharedImages.map((imageData, index) => (
  //       <img key={index} src={imageData} alt={`Shared Image ${index}`} />
  //     ))}
  //   </div>
  // );

};

export default Conversation;
