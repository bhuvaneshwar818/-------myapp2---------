import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Search, Settings, LogOut, Moon, Sun, 
  MessageSquare, ShieldAlert, Wind, UserPlus, 
  Check, X, User, MoreVertical, ArrowRight, Lock
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
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]); // All messages for the current session
  const [newMessage, setNewMessage] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' });
  const navigate = useNavigate();

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

  const sendRequest = async (userId) => {
    try {
      await ConnectionService.sendConnectionRequest(userId);
      toast.success("Connection request sent!");
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
      <aside className="w-[30%] border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-primary-500 w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">SecureChat</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <MoreVertical size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4 px-2">Connected Users</p>
          
          {/* Mock Connection List */}
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => setActiveChat({ id: i + 100, username: `User_${i}42` })}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group ${activeChat?.id === i + 100 ? 'bg-primary-600/10 border border-primary-500/20' : 'hover:bg-white/5'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                  <User size={24} className="text-slate-500" />
                </div>
                <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-950 rounded-full shadow-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-sm truncate">User_{i}42</h4>
                  <span className="text-[10px] text-slate-500">12:45 PM</span>
                </div>
                <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">Hey, is this encrypted?</p>
              </div>
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg shadow-primary-900/40">
                {i}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="p-4 grid grid-cols-4 gap-2 border-t border-white/5 bg-slate-950/20">
          <button 
            onClick={() => setActiveTab('darkroom')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${activeTab === 'darkroom' ? 'bg-primary-600/10 text-primary-500' : 'hover:bg-white/5 text-slate-500'}`}
          >
            <ShieldAlert size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">DarkRoom</span>
          </button>
          <button 
            onClick={() => setActiveTab('evaporate')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${activeTab === 'evaporate' ? 'bg-blue-600/10 text-blue-500' : 'hover:bg-white/5 text-slate-500'}`}
          >
            <Wind size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Evaporate</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-500'}`}
          >
            <Settings size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Settings</span>
          </button>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-3 rounded-xl flex flex-col items-center gap-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-950 relative">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-500 uppercase font-bold text-sm">
              {currentUser?.username?.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-lg">{currentUser?.username}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="relative w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Find users by username..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:border-primary-500/50 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {searchQuery ? (
            <div className="flex-1 overflow-y-auto p-12">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-8">Search Results for "{searchQuery}"</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map(user => (
                    <div key={user.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:border-primary-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                          <User size={30} className="text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{user.username}</h4>
                          <div className="flex gap-4 mt-1">
                            <div className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Trust {user.trustPercent}%</div>
                            <div className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Distrust {user.untrustPercent}%</div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendRequest(user.id)}
                        className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                      >
                        <UserPlus size={16} /> Send Request
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && <p className="text-slate-500 font-medium">No users found.</p>}
                </div>
              </motion.div>
            </div>
          ) : activeChat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {messages.filter(m => (m.sender.id === activeChat.id) || (m.recipient.id === activeChat.id)).map((m, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: m.sender.id === currentUser.id ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className={`flex ${m.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      m.sender.id === currentUser.id 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'
                    } ${m.type === 'SECRET' ? 'border border-primary-500/30' : ''} ${m.type === 'EVAPORATING' ? 'border border-blue-500/30 animate-pulse' : ''}`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <div className="flex items-center justify-between mt-2 opacity-50 text-[9px] font-bold uppercase tracking-widest">
                        <span>{m.type}</span>
                        {m.type === 'EVAPORATING' && <span>Self-destructing...</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-6 bg-slate-900/40 border-t border-white/5">
                <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Type your secure message..."
                      className="w-full bg-slate-800 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary-500/50 transition-all text-sm"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-900/40 hover:bg-primary-700 transition-all active:scale-90"
                  >
                    <ArrowRight size={24} />
                  </button>
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
            <div className="flex-1 overflow-y-auto p-12">
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                  <MessageSquare size={40} className="text-slate-700" />
                </div>
                <h3 className="text-2xl font-bold mb-4">No active conversation</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Select a friend from the sidebar or search for a new contact to start chatting securely.</p>
                
                <div className="mt-12 w-full p-8 rounded-3xl border border-dashed border-white/10 text-left">
                  <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-primary-500">Incoming Requests</h4>
                  <div className="space-y-4">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                            <User size={20} className="text-slate-600" />
                          </div>
                          <span className="font-bold text-sm">{req.user.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => acceptRequest(req.id)} className="w-9 h-9 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><Check size={20} /></button>
                          <button className="w-9 h-9 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                        </div>
                      </div>
                    ))}
                    {pendingRequests.length === 0 && <p className="text-xs text-slate-500 font-medium">No pending requests.</p>}
                  </div>
                </div>
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
