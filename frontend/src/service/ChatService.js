import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;

const connect = (onMessageReceived, onConnected) => {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    
    // Disable debug logging in production
    stompClient.debug = () => {};

    stompClient.connect({}, (frame) => {
        const user = JSON.parse(localStorage.getItem('user'));
        stompClient.subscribe(`/user/${user.username}/queue/messages`, (payload) => {
            onMessageReceived(JSON.parse(payload.body));
        });
        if (onConnected) onConnected();
    }, (error) => {
        console.error('STOMP Connection Error', error);
    });
};

const sendMessage = (message) => {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    }
};

const disconnect = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};

const ChatService = {
    connect,
    sendMessage,
    disconnect
};

export default ChatService;
