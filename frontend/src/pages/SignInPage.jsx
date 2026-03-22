import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Chrome, Shield, Mail, Phone, CheckCircle2 } from 'lucide-react';

import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Modal from '../components/Modal';
import OtpInput from '../components/OtpInput';
import AuthService from '../service/AuthService';



const SignInPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [activeModal, setActiveModal] = useState(null); // 'user' or 'pass' or null
  const [loading, setLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState({ email: '', phone: '', dob: '', username: '' });
  const [resetPhase, setResetPhase] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showRecoveryErrors, setShowRecoveryErrors] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.login(formData.username, formData.password);
      toast.success("Sign-In Successful!");
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="text-primary-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Enter your credentials to access SecureChat</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-2">
          <Input 
            icon={User}
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            valid={formData.username.length > 3}
          />
          <Input 
            type="password"
            icon={Lock}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            valid={formData.password.length >= 8}
          />

          <div className="flex justify-between items-center text-xs mb-6">
            <button type="button" onClick={() => setActiveModal('user')} className="text-primary-500 hover:underline">Forgot Username?</button>
            <button type="button" onClick={() => setActiveModal('pass')} className="text-primary-500 hover:underline">Forgot Password?</button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-900/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-4 text-slate-500 italic">or continue with</span></div>
        </div>

        <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center gap-3 transition-all">
          <Chrome size={20} className="text-red-400" />
          <span className="font-medium">Google OAuth</span>
        </button>

        <p className="text-center text-slate-400 text-sm mt-10">
          Don't have an account? <Link to="/signup" className="text-primary-500 font-bold hover:underline">Sign Up</Link>
        </p>
      </motion.div>

      {/* Forgot Username Modal */}
      <Modal 
        isOpen={activeModal === 'user'} 
        onClose={() => { setActiveModal(null); setShowRecoveryErrors(false); }} 
        title="Recover Username"
      >
        <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed italic border-l-2 border-primary-500 pl-4">
          Provide your details to receive your username via email.
        </p>
        <div className="space-y-4">
          <Input placeholder="Registered Gmail" icon={Mail} value={recoveryData.email} onChange={e => setRecoveryData({...recoveryData, email: e.target.value})} valid={recoveryData.email.includes('@')} error={(showRecoveryErrors && !recoveryData.email.includes('@')) || (recoveryData.email.length > 0 && !recoveryData.email.includes('@'))} />
          <Input placeholder="Phone Number" icon={Phone} value={recoveryData.phone} onChange={e => setRecoveryData({...recoveryData, phone: e.target.value})} valid={recoveryData.phone.length >= 10} error={(showRecoveryErrors && recoveryData.phone.length < 10) || (recoveryData.phone.length > 0 && recoveryData.phone.length < 10)} />
          <Input type="date" value={recoveryData.dob} onChange={e => setRecoveryData({...recoveryData, dob: e.target.value})} valid={!!recoveryData.dob} error={showRecoveryErrors && !recoveryData.dob} />
          <button 
            onClick={async () => {
              if (!recoveryData.email.includes('@') || recoveryData.phone.length < 10 || !recoveryData.dob) {
                setShowRecoveryErrors(true); return;
              }
              setRecoveryLoading(true);
              try {
                await AuthService.forgotUsername(recoveryData.email, recoveryData.phone, recoveryData.dob);
                toast.success("Username sent to your email!");
                setActiveModal(null);
                setShowRecoveryErrors(false);
              } catch (error) {
                toast.error(error.response?.data?.message || "Failed to recover username. Please verify details.");
              } finally { setRecoveryLoading(false); }
            }}
            disabled={recoveryLoading}
            className="w-full py-3 bg-primary-600 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {recoveryLoading ? "Processing..." : "Send Username"}
          </button>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal 
        isOpen={activeModal === 'pass'} 
        onClose={() => { setActiveModal(null); setResetPhase(1); setResetOtp(''); setNewPassword(''); setConfirmNewPassword(''); setShowRecoveryErrors(false); }} 
        title="Reset Password"
      >
        {resetPhase === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed text-center px-4">
              Enter your exact account details to receive an OTP.
            </p>
            <Input placeholder="Username" icon={User} value={recoveryData.username} onChange={e => setRecoveryData({...recoveryData, username: e.target.value})} valid={recoveryData.username.length >= 3} error={(showRecoveryErrors && recoveryData.username.length < 3) || (recoveryData.username.length > 0 && recoveryData.username.length < 3)} />
            <Input placeholder="Registered Gmail" icon={Mail} value={recoveryData.email} onChange={e => setRecoveryData({...recoveryData, email: e.target.value})} valid={recoveryData.email.includes('@')} error={(showRecoveryErrors && !recoveryData.email.includes('@')) || (recoveryData.email.length > 0 && !recoveryData.email.includes('@'))} />
            <button 
              onClick={async () => {
                if (recoveryData.username.length < 3 || !recoveryData.email.includes('@')) {
                  setShowRecoveryErrors(true); return;
                }
                setRecoveryLoading(true);
                try {
                  await AuthService.forgotPassword(recoveryData.username, recoveryData.email);
                  toast.success("OTP sent to your email!");
                  setResetPhase(2);
                } catch (error) {
                  toast.error(error.response?.data?.message || "Database mismatch. Verification failed.");
                } finally { setRecoveryLoading(false); }
              }}
              disabled={recoveryLoading}
              className="w-full py-3 bg-primary-600 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {recoveryLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {resetPhase === 2 && (
          <div className="space-y-4 pb-2">
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed text-center px-4">
              Please enter the 6-digit OTP sent to {recoveryData.email}.
            </p>
            <div className="flex justify-center mb-6">
              <OtpInput value={resetOtp} onChange={setResetOtp} />
            </div>
            <div className="flex justify-center mb-4">
              <button 
                onClick={async () => {
                  try {
                    setResetOtp('');
                    await AuthService.forgotPassword(recoveryData.username, recoveryData.email);
                    toast.success("New OTP sent!");
                  } catch (e) {
                    toast.error("Failed to resend OTP");
                  }
                }}
                className="text-primary-500 hover:text-primary-400 text-sm font-bold hover:underline transition-all"
              >
                Resend OTP
              </button>
            </div>
            <button 
              onClick={async () => {
                if (resetOtp.length !== 6) return;
                setRecoveryLoading(true);
                try {
                  await AuthService.verifyOtp(recoveryData.email, resetOtp);
                  toast.success("OTP Verified!");
                  setShowRecoveryErrors(false);
                  setResetPhase(3);
                } catch (error) {
                  toast.error(error.response?.data?.message || "Invalid OTP");
                } finally { setRecoveryLoading(false); }
              }}
              disabled={recoveryLoading || resetOtp.length !== 6}
              className="w-full py-3 bg-primary-600 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {recoveryLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {resetPhase === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed text-center px-4">
              Enter your new secret password.
            </p>
            <div>
              <Input icon={Lock} type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} valid={newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9!@#$%^&*]/.test(newPassword)} error={(showRecoveryErrors && (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9!@#$%^&*]/.test(newPassword))) || (newPassword.length > 0 && (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9!@#$%^&*]/.test(newPassword)))} />
              
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 mt-2 mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 tracking-wider uppercase">Security Standards</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={newPassword.length >= 8 ? "text-green-500" : "text-slate-600"} />
                    <span className={newPassword.length >= 8 ? "text-slate-200" : "text-slate-500"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-slate-600"} />
                    <span className={/[A-Z]/.test(newPassword) ? "text-slate-200" : "text-slate-500"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={/[0-9!@#$%^&*]/.test(newPassword) ? "text-green-500" : "text-slate-600"} />
                    <span className={/[0-9!@#$%^&*]/.test(newPassword) ? "text-slate-200" : "text-slate-500"}>One digit & special character</span>
                  </div>
                </div>
              </div>
            </div>
            <Input icon={Lock} type="password" placeholder="Confirm Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} valid={confirmNewPassword && newPassword === confirmNewPassword} error={(showRecoveryErrors && newPassword !== confirmNewPassword) || (confirmNewPassword.length > 0 && newPassword !== confirmNewPassword)} />
            <button 
              onClick={async () => {
                if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9!@#$%^&*]/.test(newPassword) || newPassword !== confirmNewPassword) {
                  setShowRecoveryErrors(true); return;
                }
                setRecoveryLoading(true);
                try {
                  await AuthService.resetPassword(recoveryData.email, newPassword);
                  toast.success("Password Reset Successfully!");
                  setActiveModal(null);
                  setResetPhase(1);
                  setResetOtp('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setShowRecoveryErrors(false);
                } catch (error) {
                  toast.error(error.response?.data?.message || "Password Reset failed");
                } finally { setRecoveryLoading(false); }
              }}
              disabled={recoveryLoading}
              className="w-full py-3 bg-primary-600 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {recoveryLoading ? "Resetting..." : "Set New Password"}
            </button>
          </div>
        )}
        
        {resetPhase === 1 && (
          <button onClick={() => { setActiveModal(null); setShowRecoveryErrors(false); }} className="w-full py-2 mt-4 text-slate-500 text-sm hover:text-slate-300 transition-colors">
            Cancel
          </button>
        )}
      </Modal>
    </div>
  );
};

export default SignInPage;
