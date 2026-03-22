import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, UserX, ArrowLeft, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/';

const Settings = () => {
  const [settings, setSettings] = useState({
    blockIncomingRequests: false,
    isProfilePublic: true,
    hideOnlineStatus: false,
    defaultEvaporationTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/signin');
        return;
      }
      const user = JSON.parse(userStr);
      const res = await axios.get(API_URL + 'settings/privacy', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data) {
        setSettings({
          blockIncomingRequests: res.data.blockIncomingRequests || false,
          isProfilePublic: res.data.isProfilePublic !== undefined ? res.data.isProfilePublic : true,
          hideOnlineStatus: res.data.hideOnlineStatus || false,
          defaultEvaporationTime: res.data.defaultEvaporationTime || 0
        });
      }
    } catch (err) {
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      await axios.put(API_URL + 'settings/privacy', settings, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success("Privacy settings updated successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, description, icon: Icon, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-2xl transition hover:border-white/10">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${value ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-400'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{label}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-primary-500' : 'bg-slate-700'}`}
      >
        <motion.div 
          layout 
          className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm"
          initial={false}
          animate={{ left: value ? '1.75rem' : '0.25rem' }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-2xl mx-auto p-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy & Settings</h1>
            <p className="text-slate-400 text-sm">Control your visibility and secure configurations</p>
          </div>
        </div>

        <div className="space-y-4">
          <Toggle 
            label="Public Profile" 
            description="Allow other users to search and discover your profile" 
            icon={Eye} 
            value={settings.isProfilePublic} 
            onChange={(val) => setSettings({...settings, isProfilePublic: val})} 
          />
          
          <Toggle 
            label="Hide Online Status" 
            description="Prevent others from seeing when you are actively online" 
            icon={Shield} 
            value={settings.hideOnlineStatus} 
            onChange={(val) => setSettings({...settings, hideOnlineStatus: val})} 
          />

          <Toggle 
            label="Block Incoming Requests" 
            description="Automatically reject new connection invitations from anyone" 
            icon={UserX} 
            value={settings.blockIncomingRequests} 
            onChange={(val) => setSettings({...settings, blockIncomingRequests: val})} 
          />

          <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Default Evaporation Timer</h3>
                <p className="text-slate-400 text-xs mt-0.5">Self-destruct messages automatically after this duration</p>
              </div>
              <select 
                value={settings.defaultEvaporationTime}
                onChange={(e) => setSettings({...settings, defaultEvaporationTime: parseInt(e.target.value)})}
                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value={0}>Off</option>
                <option value={60}>1 Minute</option>
                <option value={3600}>1 Hour</option>
                <option value={86400}>24 Hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-primary-900/20"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
