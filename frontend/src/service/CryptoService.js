import CryptoJS from 'crypto-js';

const SECRET_KEY = 'secure-chat-fallback-key'; // In a real app, this would be per-session/E2EE

const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const CryptoService = {
    encrypt,
    decrypt
};

export default CryptoService;
