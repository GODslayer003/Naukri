import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiShield, FiZap, FiStar, FiArrowRight, FiLoader } from 'react-icons/fi';

export default function UnlockDatabaseModal({ isOpen, onClose }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBillingCycle('monthly');
      setSelectedPlan(null);
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate API call for checkout
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const PLANS = [
    {
      name: "Starter",
      desc: "For small teams hiring occasionally",
      price: billingCycle === 'monthly' ? "₹4,999" : "₹49,990",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      features: [
        "View up to 100 profiles/month",
        "Basic search filters",
        "Email support",
        "Standard templates"
      ],
      color: "#3b82f6"
    },
    {
      name: "Pro",
      desc: "For growing companies scaling fast",
      price: billingCycle === 'monthly' ? "₹12,999" : "₹129,990",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      features: [
        "Unlimited profile views",
        "Advanced AI matching",
        "Export 500 resumes/month",
        "Direct outreach to candidates",
        "Priority 24/7 support"
      ],
      color: "#10b981",
      popular: true
    },
    {
      name: "Enterprise",
      desc: "For large agencies and corporates",
      price: billingCycle === 'monthly' ? "₹29,999" : "₹299,990",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      features: [
        "Unlimited everything",
        "Custom API integration",
        "Dedicated account manager",
        "Custom branding templates",
        "Advanced team analytics"
      ],
      color: "#8b5cf6"
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0, 10, 30, 0.75)', backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .ud-modal-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .ud-plan-card { transition: all 0.3s ease; }
        .ud-plan-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: rgba(16, 185, 129, 0.5) !important; }
      `}</style>
      
      <div 
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: isSuccess || selectedPlan ? '500px' : '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          position: 'relative',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f1f5f9', color: '#64748b',
            border: 'none', borderRadius: '50%',
            cursor: 'pointer', transition: 'all 0.2s', zIndex: 10
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}
        >
          <FiX size={20} />
        </button>

        {isSuccess ? (
          // Success State
          <div style={{ padding: '60px 40px', textAlign: 'center', animation: 'scaleIn 0.5s ease' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FiCheckCircle size={40} />
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Access Unlocked!</h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px' }}>
              You now have full access to the MavenJobs candidate database. You can start downloading resumes and contacting candidates immediately.
            </p>
            <button 
              onClick={onClose}
              className="ud-modal-btn"
              style={{
                width: '100%', padding: '16px', background: '#10b981', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
              }}
            >
              Go to Database
            </button>
          </div>
        ) : selectedPlan ? (
          // Checkout State
          <div style={{ padding: '40px', animation: 'scaleIn 0.3s ease' }}>
            <button 
              onClick={() => setSelectedPlan(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to plans
            </button>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Complete Upgrade</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>You are upgrading to the <strong style={{ color: '#0f172a' }}>{selectedPlan}</strong> plan.</p>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px', color: '#475569', fontWeight: 500 }}>
                <span>{selectedPlan} Plan ({billingCycle})</span>
                <span>{PLANS.find(p => p.name === selectedPlan)?.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px', color: '#475569', fontWeight: 500 }}>
                <span>Taxes & Fees</span>
                <span>Calculated at next step</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>
                <span>Total Due Today</span>
                <span>{PLANS.find(p => p.name === selectedPlan)?.price}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="ud-modal-btn"
              style={{
                width: '100%', padding: '16px', background: '#002366', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", 
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                opacity: isProcessing ? 0.8 : 1
              }}
            >
              {isProcessing ? (
                <><FiLoader className="animate-spin" size={18} /> Processing Payment...</>
              ) : (
                <>Pay {PLANS.find(p => p.name === selectedPlan)?.price} <FiArrowRight /></>
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
              <FiShield size={14} /> Secure 256-bit SSL encryption
            </div>
          </div>
        ) : (
          // Plans State
          <div style={{ padding: '50px 40px', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16,185,129,.1)', padding: '6px 14px', borderRadius: '100px', marginBottom: '16px' }}>
                <FiZap size={14} /> Unlimited Access
              </div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '36px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '16px' }}>
                Hire the top 1% talent,<br />faster than ever.
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                Choose the perfect plan to unlock full access to verified candidate profiles and download professional resumes.
              </p>

              {/* Billing Toggle */}
              <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '4px', borderRadius: '100px', marginTop: '32px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: '4px', bottom: '4px', left: billingCycle === 'monthly' ? '4px' : '50%',
                  width: 'calc(50% - 4px)', background: '#fff', borderRadius: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}></div>
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  style={{ position: 'relative', zIndex: 1, padding: '10px 24px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: billingCycle === 'monthly' ? '#0f172a' : '#64748b', cursor: 'pointer', transition: 'color 0.3s' }}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  style={{ position: 'relative', zIndex: 1, padding: '10px 24px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: billingCycle === 'yearly' ? '#0f172a' : '#64748b', cursor: 'pointer', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Yearly <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '100px', fontWeight: 800 }}>Save 20%</span>
                </button>
              </div>
            </div>

            {/* Pricing Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {PLANS.map((plan, i) => (
                <div key={i} className="ud-plan-card" style={{ 
                  background: '#fff', 
                  borderRadius: '20px', 
                  padding: '32px 24px', 
                  border: plan.popular ? '2px solid #10b981' : '1px solid #e2e8f0',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column'
                }}>
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiStar size={12} /> Most Popular
                    </div>
                  )}
                  
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{plan.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', height: '38px' }}>{plan.desc}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{plan.period}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                        <FiCheckCircle size={18} color={plan.color} style={{ flexShrink: 0, marginTop: '1px' }} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSelectPlan(plan.name)}
                    style={{ 
                      width: '100%', padding: '14px', marginTop: '24px',
                      background: plan.popular ? '#10b981' : 'transparent', 
                      color: plan.popular ? '#fff' : plan.color,
                      border: `2px solid ${plan.popular ? '#10b981' : plan.color}`, 
                      borderRadius: '12px', fontSize: '14px', fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
                    }}
                    onMouseEnter={e => { 
                      if (!plan.popular) {
                        e.currentTarget.style.background = plan.color; 
                        e.currentTarget.style.color = '#fff';
                      } else {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.borderColor = '#059669';
                      }
                    }}
                    onMouseLeave={e => { 
                      if (!plan.popular) {
                        e.currentTarget.style.background = 'transparent'; 
                        e.currentTarget.style.color = plan.color;
                      } else {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.borderColor = '#10b981';
                      }
                    }}
                  >
                    Select {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
