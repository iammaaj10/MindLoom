'use client';

import React, { useEffect, useState } from 'react';
import { getSkills } from '@/app/actions/skills';

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills().then(res => {
      if (res.success && res.skills) {
        setSkills(res.skills);
      }
      setLoading(false);
    });
  }, []);

  const calculateProgress = (xp: number, level: number) => {
    const xpNeeded = level * 100;
    return Math.min(100, Math.max(0, (xp / xpNeeded) * 100));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#030303] relative">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-12">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 flex items-center gap-4">
              Skill Trees
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                BETA
              </span>
            </h1>
            <p className="text-[14px] text-zinc-400 mt-3 max-w-2xl leading-relaxed">
              Your neural profile. You automatically earn Experience Points (XP) and unlock masteries by exploring new topics and interacting with your Knowledge Graph.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : skills.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center border border-white/10 shadow-2xl">
              <svg className="w-8 h-8 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">No Skills Unlocked Yet</h2>
            <p className="text-[14px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Analyze documents or ask the AI questions to automatically start earning XP.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-12 pr-4">
            {skills.map((skill) => {
              const progress = calculateProgress(skill.xp, skill.level);
              return (
                <div key={skill._id} className="group relative rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
                  
                  {/* Card Inner Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-cyan-500/0 group-hover:from-indigo-500/5 group-hover:to-cyan-500/5 transition-colors duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          Domain
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{skill.topic}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <span className="text-[16px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                          L{skill.level}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[12px] font-medium text-zinc-400">
                        <span>Level Progress</span>
                        <span className="text-zinc-500"><strong className="text-white font-semibold">{skill.xp}</strong> / {skill.level * 100} XP</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 inset-shadow-sm">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-out relative" 
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>

                    {skill.unlockedPerks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-4">Masteries</div>
                        <div className="flex flex-wrap gap-2.5">
                          {skill.unlockedPerks.map((perk: string, j: number) => (
                            <span key={j} className="px-3 py-1.5 text-[11px] font-medium text-white/90 bg-white/5 border border-white/10 rounded-xl shadow-sm backdrop-blur-md">
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
