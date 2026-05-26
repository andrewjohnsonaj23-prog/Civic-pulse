import { useState } from 'react';
import BottomTabs from './components/BottomTabs';

export default function App() {
  const [activeTab, setActiveTab] = useState('voice');
  const [votes, setVotes] = useState({});

  const handleVote = (id, vote) => {
    setVotes(prev => ({ ...prev, [id]: vote }));
    const n = document.createElement('div');
    n.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl z-50';
    n.textContent = `✅ Voted ${vote} — Added to District 7`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-700 p-5">
        <h1 className="text-3xl font-bold tracking-tighter">Civic Pulse</h1>
        <p className="text-zinc-400 text-sm">District 7 • Nashville, TN</p>
      </div>

      {activeTab === 'voice' && (
        <div className="p-5 space-y-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="px-5 py-1.5 bg-blue-600 text-white rounded-2xl text-sm font-medium whitespace-nowrap">My Feed</div>
            <div className="px-5 py-1.5 bg-zinc-800 rounded-2xl text-sm whitespace-nowrap">Federal</div>
          </div>

          {/* Clean & Simple Card */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-blue-400">FEDERAL • TRENDING</span>
              <span className="text-xs text-zinc-500">14.2k votes</span>
            </div>

            <h3 className="text-[17px] leading-tight font-semibold mb-4">Should Congress approve $25 billion more for southern border security?</h3>
            
            <p className="text-zinc-400 text-[14.5px] mb-8 line-clamp-2">
              Fund barriers, surveillance technology, and additional personnel.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleVote('border', 'YES')} 
                disabled={votes.border}
                className={`py-4 font-semibold rounded-2xl transition-all ${votes.border === 'YES' ? 'bg-emerald-600 ring-2 ring-emerald-400 scale-105' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                YES
              </button>
              <button 
                onClick={() => handleVote('border', 'UNSURE')} 
                disabled={votes.border}
                className={`py-4 font-semibold rounded-2xl transition-all ${votes.border === 'UNSURE' ? 'bg-zinc-500 ring-2 ring-zinc-400' : 'bg-zinc-700 hover:bg-zinc-600'}`}>
                UNSURE
              </button>
              <button 
                onClick={() => handleVote('border', 'NO')} 
                disabled={votes.border}
                className={`py-4 font-semibold rounded-2xl transition-all ${votes.border === 'NO' ? 'bg-red-600 ring-2 ring-red-400' : 'bg-red-600 hover:bg-red-500'}`}>
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bills' && <div className="p-10 text-center text-2xl">📜 Bill Factory</div>}
      {activeTab === 'discuss' && <div className="p-10 text-center text-2xl">💬 Discussions</div>}
      {activeTab === 'reps' && <div className="p-10 text-center text-2xl">👥 My Reps</div>}
      {activeTab === 'impact' && <div className="p-10 text-center text-2xl">📈 Impact</div>}

      <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
