import React, { useEffect } from 'react';
import { ShieldAlert, Mail, Phone, Globe, LogOut } from 'lucide-react';
import { Button } from '../components/ui';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubscriptionExpired = () => {
  const { config } = useConfig();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="max-w-md w-full space-y-4">
        
        {/* Main Status Card */}
        <div className="border border-slate-300 rounded-3xl p-8 bg-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
              <ShieldAlert size={28} className="text-red-600" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">Subscription Expired</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Access to your workspace has been restricted. Your plan reached its end on 
              <span className="text-slate-900 font-bold ml-1">{config?.subscriptionExpiry || '2026-01-01'}</span>.
            </p>

            {/* Support Info Grid */}
            <div className="w-full space-y-2 mb-6">
              <SupportLink 
                icon={Mail} 
                label="Email Support" 
                value="support@sparkpair.dev" 
                href="mailto:support@sparkpair.dev" 
              />
              <SupportLink 
                icon={Phone} 
                label="Contact Sales" 
                value="+92 316 5825495" 
                href="tel:+923165825495" 
              />
              <SupportLink 
                icon={Globe} 
                label="Billing Portal" 
                value="sparkpair.dev" 
                href="https://sparkpair.dev" 
              />
            </div>

            <div className="w-full pt-6 border-t border-slate-300 flex flex-col gap-3">
              <Button 
                variant="dark"
                size='lg'
                onClick={() => window.open('https://sparkpair.dev', '_blank')}
              >
                Renew Subscription
              </Button>
              <Button 
                variant="outline" 
                size='lg'
                onClick={() => {logout(); navigate('/login')}}
                icon={LogOut}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Minimalist Footer Branding */}
        <div className="flex items-center justify-between px-4 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Powered by SparkPair
          </p>
          <div className="h-[1px] flex-1 mx-4 bg-slate-300" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable Professional Link Component
const SupportLink = ({ icon: Icon, label, value, href }) => (
  <a 
    href={href}
    className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all duraion-300 group"
  >
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-slate-400 group-hover:text-slate-600 transition-all duraion-300" />
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-all duraion-300">{value}</span>
  </a>
);

export default SubscriptionExpired;