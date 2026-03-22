import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, ArrowRight, Chrome, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import OtpInput from '../components/OtpInput';
import AuthService from '../service/AuthService';


const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', gender: '', dob: '', phone: '', gmail: '',
    username: '', password: '', confirmPassword: ''
  });

  const [otpLoading, setOtpLoading] = useState(false);

  const handleGetOtp = async () => {
    // Strict Phase 1 Validation
    if (formData.firstName.length <= 1 || formData.lastName.length <= 1 || !formData.gender || !formData.dob || formData.phone.length < 10) {
      setShowErrors(true);
      toast.error('Please fill all personal details properly before requesting OTP');
      return;
    }
    if (!formData.gmail.includes('@')) {
      setShowErrors(true);
      toast.error('Please enter a valid Gmail address first');
      return;
    }
    setOtpLoading(true);
    try {
      await AuthService.sendSignupOtp(formData.gmail);
      setOtpSent(true);
      setFormData(prev => ({...prev, otp: ''}));
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const nextPhase = async () => {
    // Basic validation for Phase 1
    if (formData.firstName.length <= 1 || formData.lastName.length <= 1 || !formData.gender || !formData.dob || formData.phone.length < 10 || !formData.gmail.includes('@') || !formData.otp) {
      setShowErrors(true);
      toast.error("Please fill all required fields correctly and verify OTP");
      return;
    }
    
    setOtpLoading(true);
    try {
      await AuthService.verifyOtp(formData.gmail, formData.otp);
      setPhase(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.password || formData.password !== formData.confirmPassword) {
      setShowErrors(true);
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await AuthService.register({
        username: formData.username,
        email: formData.gmail,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob
      });
      toast.success("Registration Successful!");
      
      // Auto-login and redirect
      await AuthService.login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-200 overflow-hidden relative">
      <div className="absolute top-0 -translate-y-1/2 left-0 -translate-x-1/2 w-96 h-96 bg-primary-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 translate-y-1/2 right-0 translate-x-1/2 w-96 h-96 bg-primary-800/20 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-primary-500/10 px-4 py-1.5 rounded-full border border-primary-500/20">
            <Shield className="text-primary-500 w-4 h-4" />
            <span className="text-primary-500 text-xs font-bold tracking-widest uppercase">Secure Enrollment</span>
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-slate-400 mt-2">Step {phase} of 2: {phase === 1 ? 'Personal Details' : 'Account Credentials'}</p>
        </div>

        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${phase >= 1 ? 'bg-primary-500' : 'bg-white/10'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${phase >= 2 ? 'bg-primary-500' : 'bg-white/10'}`}></div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 1 ? (
            <motion.div 
              key="phase1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} valid={formData.firstName.length > 1} error={(showErrors && formData.firstName.length <= 1) || (formData.firstName.length === 1)} />
                <Input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} valid={formData.lastName.length > 1} error={(showErrors && formData.lastName.length <= 1) || (formData.lastName.length === 1)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className={`bg-slate-900/50 border rounded-xl py-2.5 px-4 outline-none transition-all ${showErrors && !formData.gender ? 'border-red-500 text-red-500' : 'border-white/10 text-slate-300 focus:border-primary-500'}`}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="" disabled>Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} valid={!!formData.dob} error={showErrors && !formData.dob} />
              </div>

              <Input icon={Phone} placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} valid={formData.phone.length >= 10} error={(showErrors && formData.phone.length < 10) || (formData.phone.length > 0 && formData.phone.length < 10)} />
              
              <Input icon={Mail} placeholder="Gmail Address" value={formData.gmail} onChange={e => setFormData({...formData, gmail: e.target.value})} valid={formData.gmail.includes('@')} error={(showErrors && !formData.gmail.includes('@')) || (formData.gmail.length > 0 && !formData.gmail.includes('@'))} />
              
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={handleGetOtp}
                  disabled={otpLoading}
                  className="px-6 h-12 flex items-center justify-center bg-primary-600/10 text-primary-500 text-sm font-bold rounded-xl hover:bg-primary-600/20 border border-primary-500/20 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
                >
                  {otpLoading ? "Sending..." : (otpSent ? "Resend OTP" : "Get OTP")}
                </button>
                <div className="flex-1 transition-all duration-300">
                   {otpSent && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                       <OtpInput value={formData.otp || ''} onChange={(otp) => setFormData({...formData, otp})} />
                     </motion.div>
                   )}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <button 
                  onClick={nextPhase}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
                >
                  Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center justify-center gap-2 text-slate-400 text-sm hover:text-white transition-colors py-2">
                  <Chrome size={16} /> Sign up with Google
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="phase2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <Input icon={User} placeholder="Public Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} valid={formData.username.length >= 3} error={(showErrors && formData.username.length < 3) || (formData.username.length > 0 && formData.username.length < 3)} />
            
            <div>
              <p className="text-sm font-medium mb-1.5 text-slate-400">Secret Password</p>
              <Input icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} valid={formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9!@#$%^&*]/.test(formData.password)} error={(showErrors && formData.password.length < 8) || (formData.password.length > 0 && formData.password.length < 8)} />
              
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 mt-2">
                <p className="text-xs font-semibold text-slate-500 mb-3 tracking-wider uppercase">Security Standards</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={formData.password.length >= 8 ? "text-green-500" : "text-slate-600"} />
                    <span className={formData.password.length >= 8 ? "text-slate-200" : "text-slate-500"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={/[A-Z]/.test(formData.password) ? "text-green-500" : "text-slate-600"} />
                    <span className={/[A-Z]/.test(formData.password) ? "text-slate-200" : "text-slate-500"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className={/[0-9!@#$%^&*]/.test(formData.password) ? "text-green-500" : "text-slate-600"} />
                    <span className={/[0-9!@#$%^&*]/.test(formData.password) ? "text-slate-200" : "text-slate-500"}>One digit & special character</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5 text-slate-400">Confirm Password</p>
              <Input icon={Lock} type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} valid={formData.confirmPassword && formData.password === formData.confirmPassword} error={(showErrors && formData.password !== formData.confirmPassword) || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword)} />
            </div>

              <div className="pt-6">
                <button 
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary-900/40 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Complete Registration"}
                </button>
                <button onClick={() => setPhase(1)} className="w-full mt-4 text-slate-500 text-sm hover:text-slate-300 underline underline-offset-4 decoration-slate-700">Go Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-slate-500 text-sm mt-10">
          Already a member? <Link to="/signin" className="text-primary-500 font-bold hover:underline">Sign In Now</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
