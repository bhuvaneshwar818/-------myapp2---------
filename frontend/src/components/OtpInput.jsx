import React, { useRef } from 'react';

const OtpInput = ({ length = 6, value = "", onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    let newOtp = value.split("");
    newOtp[index] = val.slice(-1);
    const finalOtp = newOtp.join("");
    onChange(finalOtp);

    // Focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        // Clear the current box
        let newOtp = value.split("");
        newOtp[index] = "";
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    onChange(pastedData);
    
    // Auto focus the last filled input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div className="flex gap-2 justify-center w-full">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-10 h-12 text-center text-xl font-bold bg-slate-900/50 border border-white/10 rounded-xl focus:border-primary-500 focus:bg-primary-500/10 outline-none transition-all text-white placeholder-slate-600"
        />
      ))}
    </div>
  );
};

export default OtpInput;
