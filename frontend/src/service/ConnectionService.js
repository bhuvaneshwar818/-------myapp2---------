import axios from 'axios';

const API_USER_URL = '/api/users/';
const API_CONN_URL = '/api/connections/';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
};

const searchUsers = (query) => {
    return axios.get(API_USER_URL + 'search', { 
        params: { query },
        headers: getAuthHeader()
    });
};

const sendConnectionRequest = (targetId) => {
    return axios.post(API_CONN_URL + `request/${targetId}`, {}, {
        headers: getAuthHeader()
    });
};

const getPendingRequests = () => {
    return axios.get(API_CONN_URL + 'pending', {
        headers: getAuthHeader()
    });
};

const getSentRequests = () => {
    return axios.get(API_CONN_URL + 'sent', {
        headers: getAuthHeader()
    });
};

const acceptRequest = (requestId) => {
    return axios.post(API_CONN_URL + `accept/${requestId}`, {}, {
        headers: getAuthHeader()
    });
};

const ConnectionService = {
    searchUsers,
    sendConnectionRequest,
    getPendingRequests,
    getSentRequests,
    acceptRequest
};

export default ConnectionService;
