import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Search, Settings, LogOut, Moon, Sun, 
  MessageSquare, ShieldAlert, Wind, UserPlus, 
  Check, X, User, MoreVertical, ArrowRight, Lock, Clock,
  ArrowLeft, Camera, Paperclip, Mic, Send
} from 'lucide-react';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AuthService from '../service/AuthService';
import ConnectionService from '../service/ConnectionService';
import ChatService from '../service/ChatService';
import CryptoService from '../service/CryptoService';




const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]); // All messages for the current session
  const [newMessage, setNewMessage] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' });
  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState(320);

  const startResizing = React.useCallback((mouseDownEvent) => {
    const startWidth = sidebarWidth;
    const startPosition = mouseDownEvent.clientX;

    const doDrag = (mouseMoveEvent) => {
      setSidebarWidth(Math.min(Math.max(250, startWidth + mouseMoveEvent.clientX - startPosition), 500));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
    document.body.style.cursor = 'col-resize';
  }, [sidebarWidth]);

  useEffect(() => {
    if (currentUser) {
      ChatService.connect(handleReceiveMessage);
    }
    return () => ChatService.disconnect();
  }, [currentUser]);

  const handleReceiveMessage = (msg) => {
    if (msg.type === 'SECRET') {
      msg.content = CryptoService.decrypt(msg.content);
    }
    setMessages(prev => [...prev, msg]);
    toast.info(`New message from ${msg.sender.username}`);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    let content = newMessage;
    if (activeTab === 'darkroom') {
      content = CryptoService.encrypt(newMessage);
    }

    const chatMsg = {
      sender: { id: currentUser.id, username: currentUser.username },
      recipient: { id: activeChat.id, username: activeChat.username },
      content: content,
      type: activeTab === 'darkroom' ? 'SECRET' : (activeTab === 'evaporate' ? 'EVAPORATING' : 'NORMAL')
    };

    ChatService.sendMessage(chatMsg);
    
    // For optimistic update, if it was secret, we decrypt it back for display
    const displayMsg = { ...chatMsg, content: newMessage };
    setMessages(prev => [...prev, displayMsg]);
    setNewMessage('');
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadPendingRequests();
    loadSentRequests();
    loadActiveConnections();

    AuthService.ping();
    const pingInterval = setInterval(() => {
      AuthService.ping();
    }, 10000);

    return () => clearInterval(pingInterval);
  }, []);

  const handleSearch = async () => {
    try {
      const res = await ConnectionService.searchUsers(searchQuery);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const res = await ConnectionService.getPendingRequests();
      setPendingRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const loadSentRequests = async () => {
    try {
      const res = await ConnectionService.getSentRequests();
      setSentRequests(res.data);
    } catch (err) {
      console.error("Failed to load sent requests", err);
    }
  };

  const loadActiveConnections = async () => {
    try {
      const res = await ConnectionService.getActiveConnections();
      setActiveConnections(res.data);
    } catch (err) {
      console.error("Failed to load active connections", err);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await ConnectionService.sendConnectionRequest(userId);
      toast.success("Connection request sent!");
      setSearchQuery('');
      loadSentRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await ConnectionService.acceptRequest(requestId);
      toast.success("Request accepted!");
      loadPendingRequests();
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  const handleChangePassword = async () => {
    try {
      await AuthService.changePassword(passwordForm.old, passwordForm.new);
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswordForm({ old: '', new: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    toast.info("Logged out successfully");
    navigate('/');
  };

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="h-screen flex bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        style={{ width: `${sidebarWidth}px` }} 
        className="shrink-0 flex flex-col bg-slate-900/40 backdrop-blur-xl relative"
      >
        {/* Resize Handle */}
        <div 
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary-500/50 transition-colors z-50 group"
        >
          <div className="w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setActiveChat(null);
              setSearchQuery('');
              setActiveTab('chats');
            }}
          >
            <Shield className="text-primary-500 w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight group-hover:text-primary-400 transition-colors">SecureChat</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <MoreVertical size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search active friends..." 
              className="w-full bg-slate-800/80 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-primary-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4 px-2">Connected Users</p>
          
          {/* Active Connection List */}
          {activeConnections.map((user) => (
            <motion.div 
              key={user.id}
              onClick={() => {
                setActiveChat(user);
                setSearchQuery('');
                setActiveTab('chats');
              }}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group ${activeChat?.id === user.id ? 'bg-primary-600/10 border border-primary-500/20' : 'hover:bg-white/5'}`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 font-bold text-slate-400 group-hover:text-primary-500 transition-colors text-lg shadow-inner">
                  {user.username.charAt(0)}
                </div>
                {(user.online === true || user.isOnline === true) && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-[15px] text-slate-200 group-hover:text-primary-400 transition-colors truncate">{user.username}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {activeConnections.length === 0 && (
             <div className="px-4 py-8 text-center text-slate-500 text-xs font-bold opacity-60">
                 No active connections yet.
             </div>
          )}
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="p-4 flex flex-col gap-2 border-t border-white/5 bg-slate-950/20">
          <button 
            onClick={() => setActiveTab('darkroom')}
            className={`p-3 rounded-xl flex items-center justify-start gap-4 transition-all ${activeTab === 'darkroom' ? 'bg-primary-600/10 text-primary-500' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <ShieldAlert size={20} className="shrink-0" />
            <span className="text-sm font-bold tracking-wide truncate">DarkRoom Mode</span>
          </button>
          <button 
            onClick={() => setActiveTab('evaporate')}
            className={`p-3 rounded-xl flex items-center justify-start gap-4 transition-all ${activeTab === 'evaporate' ? 'bg-blue-600/10 text-blue-500' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Wind size={20} className="shrink-0" />
            <span className="text-sm font-bold tracking-wide truncate">Evaporate Mode</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-xl flex items-center justify-start gap-4 transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <Settings size={20} className="shrink-0" />
            <span className="text-sm font-bold tracking-wide truncate">General Settings</span>
          </button>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-3 rounded-xl flex items-center justify-start gap-4 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all group"
          >
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide truncate">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-950 relative">

        {/* Content Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChat ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
              {/* Chat Header Banner */}
              <header className="h-20 shrink-0 border-b border-white/5 flex items-center px-8 bg-slate-900/60 backdrop-blur-md z-10 w-full">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center mr-6 transition-colors group"
                >
                  <ArrowLeft size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </button>
                <div className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 border-2 border-primary-500/30 flex items-center justify-center text-primary-500 font-bold text-lg shadow-lg group-hover:border-primary-500/80 transition-all">
                    {activeChat?.username?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl leading-tight text-white tracking-tight">{activeChat?.username}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online & Secure</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar flex flex-col">
                <div className="mt-auto flex flex-col justify-end space-y-6">
                  {messages.filter(m => (m.sender.id === activeChat.id) || (m.recipient.id === activeChat.id)).map((m, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={idx} 
                      className={`flex ${m.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-4 rounded-3xl shadow-xl ${
                        m.sender.id === currentUser.id 
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-sm' 
                          : 'bg-slate-800/80 backdrop-blur-md border border-white/5 text-slate-100 rounded-bl-sm'
                      } ${m.type === 'SECRET' ? 'ring-1 ring-primary-500/50 shadow-primary-900/20' : ''} ${m.type === 'EVAPORATING' ? 'ring-1 ring-blue-500/50 animate-pulse' : ''}`}>
                        <p className="text-[15px] leading-relaxed font-medium">{m.content}</p>
                        <div className="flex items-center justify-end gap-2 mt-2 opacity-60 text-[9px] font-bold uppercase tracking-widest">
                          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {m.type === 'EVAPORATING' && <span className="text-blue-300">Self-destructing</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {messages.filter(m => (m.sender.id === activeChat.id) || (m.recipient.id === activeChat.id)).length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center py-10 opacity-40">
                      <Shield size={48} className="text-primary-500 mb-4" />
                      <p className="text-sm font-bold text-slate-400">End-to-end encrypted connection established.</p>
                      <p className="text-xs font-medium text-slate-500">Messages are secured and grow upwards automatically.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Message Input Container */}
              <div className="p-6 bg-slate-900/60 backdrop-blur-xl border-t border-white/5 shrink-0">
                <div className="max-w-5xl mx-auto focus-within:ring-1 ring-primary-500/30 rounded-[2rem] transition-all bg-slate-950 p-2 flex items-center gap-2 border border-white/10 shadow-2xl">
                  {/* Left Action Icons */}
                  <button className="w-12 h-12 flex shrink-0 items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                    <Paperclip size={22} className="rotate-45" />
                  </button>
                  <button className="w-12 h-12 flex shrink-0 items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                    <Camera size={22} />
                  </button>

                  {/* Text Input */}
                  <input 
                    type="text" 
                    placeholder="Message..."
                    className="flex-1 bg-transparent border-none px-4 py-3 outline-none text-[15px] text-white placeholder:text-slate-500 font-medium h-12"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />

                  {/* Right Action Icons */}
                  {newMessage.trim() === '' ? (
                    <button className="w-12 h-12 flex shrink-0 items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                      <Mic size={22} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSendMessage}
                      className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-primary-500/25 transition-all transform active:scale-90"
                    >
                      <Send size={20} className="translate-x-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="flex-1 overflow-y-auto p-12">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-8">Settings</h3>
                
                <div className="space-y-8">
                  {/* Profile Card */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-3xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-3xl text-primary-500 font-bold">
                        {currentUser?.username?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">{currentUser?.username}</h4>
                        <p className="text-slate-500 font-medium">{currentUser?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Trust Score</p>
                        <p className="text-xl font-bold text-green-500">98%</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Untrust Score</p>
                        <p className="text-xl font-bold text-red-500">2%</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Breaks</p>
                        <p className="text-xl font-bold text-slate-300">0</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-primary-500" size={20} />
                      <h4 className="font-bold">Security & Privacy</h4>
                    </div>
                    
                    <div className="space-y-4">
                       <button className="w-full text-left p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 flex items-center justify-between group">
                          <div>
                            <p className="font-bold text-sm">Change Password</p>
                            <p className="text-xs text-slate-500 mt-0.5">Update your account password</p>
                          </div>
                          <ArrowRight size={18} className="text-slate-600 group-hover:text-primary-500 transition-all" />
                       </button>
                       <button className="w-full text-left p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 flex items-center justify-between group">
                          <div>
                            <p className="font-bold text-sm">Two-Step Verification</p>
                            <p className="text-xs text-slate-500 mt-0.5">Secure your account with 2FA</p>
                          </div>
                          <Shield size={18} className="text-slate-600 group-hover:text-primary-500 transition-all" />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-16 bg-slate-950 flex flex-col gap-16">
              <div className="flex justify-between items-start w-full">
                {/* Account Details Header */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-800 border-2 border-primary-500/50 flex items-center justify-center text-4xl font-black text-primary-500 shadow-xl shadow-primary-900/40">
                    {currentUser?.username?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-3">{currentUser?.username}</h2>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest"><Shield size={14}/> Trust {currentUser?.trustPercent || 100}%</span>
                      <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest"><ShieldAlert size={14}/> Distrust {currentUser?.untrustPercent || 0}%</span>
                    </div>
                  </div>
                </motion.div>

                {/* Search Bar for New Users */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative group w-[500px] mt-2">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-md flex items-center p-2 rounded-2xl border border-white/10 shadow-2xl">
                    <Search className="text-primary-500 ml-5 mr-3" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search global network for new users..."
                      className="w-full bg-transparent border-none py-3 px-2 text-slate-100 outline-none font-bold text-sm placeholder:text-slate-500 placeholder:font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Dynamic Bottom Area: Either Search Results OR Requests Grid */}
              <div className="flex-1">
                {searchQuery ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-6 flex items-center gap-2"><Search size={14} /> Network Search Results</h3>
                    <div className="grid grid-cols-2 gap-8">
                      {searchResults.map(user => (
                        <div key={user.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary-500/30 transition-all shadow-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-white/5 flex items-center justify-center text-slate-400 font-bold text-lg shadow-lg">
                              {user.username.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-xl text-white mb-1">{user.username}</h4>
                              <div className="flex gap-3 mt-1">
                                <span className="px-2 py-0.5 rounded border border-green-500/20 bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-widest">Trust {user.trustPercent}%</span>
                                <span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-widest">Distrust {user.untrustPercent}%</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => sendRequest(user.id)}
                            className="w-12 h-12 bg-primary-600/10 text-primary-500 border border-primary-500/20 rounded-2xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all active:scale-90"
                          >
                            <UserPlus size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {searchResults.length === 0 && (
                      <div className="w-full py-16 flex flex-col items-center justify-center opacity-50 bg-slate-900/20 border border-dashed border-white/5 rounded-[2rem]">
                        <Search size={48} className="text-slate-600 mb-4" />
                        <p className="text-sm font-bold text-slate-500">No verifiable identities found across the SecureChat network matching "{searchQuery}"</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-12">
                    {/* Incoming Requests */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-6 flex items-center gap-2"><ArrowRight size={14} className="rotate-90" /> Incoming Requests</h3>
                      <div className="space-y-3">
                        {pendingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary-500 font-bold text-sm border border-primary-500/20">
                                {req.user.username.charAt(0)}
                              </div>
                              <span className="font-bold text-sm text-slate-200">{req.user.username}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => acceptRequest(req.id)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><Check size={16} /></button>
                              <button className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
                            </div>
                          </div>
                        ))}
                        {pendingRequests.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 opacity-50">
                            <UserPlus size={32} className="text-slate-600 mb-3" />
                            <p className="text-xs font-bold text-slate-500">No incoming requests</p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Sent Requests */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><ArrowRight size={14} className="-rotate-45" /> Sent Requests</h3>
                      <div className="space-y-3">
                        {sentRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm border border-white/10">
                                {req.connectedUser.username.charAt(0)}
                              </div>
                              <span className="font-bold text-sm text-slate-400">{req.connectedUser.username}</span>
                            </div>
                            <div>
                               <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20 rounded-lg">Pending</span>
                            </div>
                          </div>
                        ))}
                        {sentRequests.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 opacity-50">
                            <Clock size={32} className="text-slate-600 mb-3" />
                            <p className="text-xs font-bold text-slate-500">No outbound requests</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <Modal 
            isOpen={isLogoutModalOpen} 
            onClose={() => setIsLogoutModalOpen(false)} 
            title="Confirm Logout"
          >
            <div className="text-center">
              <p className="text-slate-400 mb-8 font-medium">Are you sure you want to end your secure session?</p>
              <div className="flex gap-4">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all font-bold text-sm">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all font-bold text-sm shadow-xl shadow-red-900/20">Logout</button>
              </div>
            </div>
          </Modal>
        )}

        {isPasswordModalOpen && (
          <Modal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            title="Change Password"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">Old Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary-500/50 transition-all text-sm"
                  value={passwordForm.old}
                  onChange={(e) => setPasswordForm({...passwordForm, old: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">New Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary-500/50 transition-all text-sm"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                />
              </div>
              <button 
                onClick={handleChangePassword}
                className="w-full py-4 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 transition-all font-bold text-sm shadow-xl shadow-primary-900/20"
              >
                Update Password
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
