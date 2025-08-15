'use client';

import { useState, useEffect } from 'react';
import Step1Reason from './Step1Reason';
import Step2Downsell from './Step2Downsell';
import Step3Confirmation from './Step3Confirmation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function pickVariant(): 'A' | 'B' {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] & 1) === 0 ? 'A' : 'B';
}

const api = {
  getABTestVariant: async (userId: string) => {
    const { data: existing } = await supabase
      .from('cancellations')
      .select('downsell_variant')
      .eq('user_id', userId)
      .eq('status', 'started')
      .maybeSingle();

    if (existing) return { variant: existing.downsell_variant as 'A' | 'B', showDownsell: existing.downsell_variant === 'B' };

    const variant = pickVariant();
    const { data: subs } = await supabase.from('subscriptions').select('id').eq('user_id', userId).single();
    await supabase.from('cancellations').insert({
      user_id: userId,
      subscription_id: subs?.id,
      downsell_variant: variant,
      status: 'started'
    });
    return { variant, showDownsell: variant === 'B' };
  },

  applyDiscount: async (cancellationId: string) => {
    await supabase.from('cancellations').update({ accepted_downsell: true, status: 'downsell_accepted' }).eq('id', cancellationId);
  },

  submitCancellation: async (cancellationId: string, reason: string, userId: string) => {
    await supabase.from('cancellations').update({ reason, status: 'confirmed' }).eq('id', cancellationId);
    await supabase.from('subscriptions').update({ pending_cancellation: true }).eq('user_id', userId);
  }
};

function CancellationFlowModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: { id: string; email: string } | null }) {
  const [step, setStep] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancellationId, setCancellationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    const init = async () => {
      const { data: existing } = await supabase.from('cancellations').select('*').eq('user_id', user.id).eq('status', 'started').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (existing) {
        setVariant(existing.downsell_variant as 'A' | 'B');
        setCancellationId(existing.id);
      } else {
        const chosenVariant = pickVariant();
        const { data: created } = await supabase.from('cancellations').insert({
          user_id: user.id,
          subscription_id: (await supabase.from('subscriptions').select('id').eq('user_id', user.id).single()).data?.id,
          downsell_variant: chosenVariant,
          status: 'started'
        }).select().single();
        setVariant(chosenVariant);
        setCancellationId(created?.id || null);
      }
      setStep(1);
      setUserAnswer('');
      setOfferAccepted(false);
    };
    init();
  }, [isOpen, user]);

  const handleStep1 = (answer: string) => { setUserAnswer(answer); if (variant === 'B' && answer === 'still_looking') setStep(2); else setStep(3); };
  const handleAcceptOffer = async () => { if (!cancellationId) return; setLoading(true); await api.applyDiscount(cancellationId); setOfferAccepted(true); setStep(3); setLoading(false); };
  const handleDeclineOffer = () => setStep(3);
  const handleConfirmCancel = async () => { if (!cancellationId || !user) return; setLoading(true); await api.submitCancellation(cancellationId, userAnswer, user.id); setLoading(false); onClose(); alert('Subscription cancelled successfully.'); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Reason onNext={handleStep1} onClose={onClose} />;
      case 2: return <Step2Downsell onAccept={handleAcceptOffer} onDecline={handleDeclineOffer} onBack={handleBack} onClose={onClose} loading={loading} />;
      case 3: return <Step3Confirmation offerAccepted={offerAccepted} onConfirm={handleConfirmCancel} onBack={handleBack} onClose={onClose} loading={loading} />;
      default: return null;
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">{renderStep()}</div>;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.from('users').select('id,email').limit(1).single();
        if (userError || !userData) throw userError || new Error('User not found');
        setUser(userData);

        const { data: subData, error: subError } = await supabase.from('subscriptions').select('*').eq('user_id', userData.id).single();
        if (subError) console.error(subError);
        setSubscription(subData);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => { setIsSigningOut(true); setTimeout(() => setIsSigningOut(false), 1000); };
  const handleClose = () => console.log('Navigate to jobs');

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <div className="flex space-x-3">
                <button onClick={handleClose} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#8952fc] rounded-lg hover:bg-[#7b40fc] transition-colors">Back to jobs</button>
                <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50" disabled={isSigningOut}>{isSigningOut ? 'Signing out...' : 'Sign out'}</button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-md text-gray-900">{loading ? 'Loading...' : user?.email}</p>
              </div>

              {subscription && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Subscription status</p>
                    {subscription.status === 'active' && !subscription.isTrialSubscription && !subscription.cancelAtPeriodEnd && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">Active</span>
                    )}
                  </div>
                  {subscription.status === 'active' && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Next payment</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Support & Settings */}
          <div className="px-6 py-6 border-b border-gray-200 space-y-4">
            <button onClick={() => console.log('Support contact clicked')} className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#8952fc] text-white rounded-lg hover:bg-[#7b40fc] transition-colors">Contact support</button>

            <button onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm">
              Manage Subscription
              <span className={`w-4 h-4 ml-2 transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvancedSettings ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <button onClick={() => console.log('Update card clicked')} className="w-full px-4 py-3 bg-white border rounded-lg text-gray-700 hover:bg-gray-50">Update payment method</button>
                <button onClick={() => console.log('Invoice history clicked')} className="w-full px-4 py-3 bg-white border rounded-lg text-gray-700 hover:bg-gray-50">View billing history</button>
                <button onClick={() => setShowCancelModal(true)} className="w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Cancel Migrate Mate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancellationFlowModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} user={user} />
    </div>
  );
}
