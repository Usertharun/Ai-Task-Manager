import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard = ({ tasks, stats }) => {
  const data = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const offset = d.getTimezoneOffset() * 60000;
      const dateStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
      const shortDate = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const planned = tasks.filter(t => t.targetDate === dateStr).length;
      const completed = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)).length;
      
      arr.push({ name: shortDate, Planned: planned, Completed: completed });
    }
    return arr;
  }, [tasks]);

  const productivityScore = useMemo(() => {
    const completed = data.reduce((acc, curr) => acc + curr.Completed, 0);
    const planned = data.reduce((acc, curr) => acc + curr.Planned, 0);
    return planned === 0 ? 0 : Math.round((completed / planned) * 100);
  }, [data]);

  return (
    <div className="dashboard-container animate-entry">
      <div className="dashboard-grid">
         <div className="stat-card level-card">
           <div className="stat-title">Current Level</div>
           <div className="stat-number level-number">Lvl {stats.level}</div>
           <div className="xp-progress-bar">
             <div className="xp-progress" style={{ width: `${Math.min(100, Math.max(0, stats.progressPercent))}%` }}></div>
           </div>
           <div className="xp-label">{Math.floor(stats.xp)} / {Math.floor(stats.nextLevelXpBasis)} XP</div>
         </div>
         
         <div className="stat-card info-card">
           <div className="stat-title">Daily Streak 🔥</div>
           <div className="stat-number">{stats.streak} <span className="stat-subtext">Days</span></div>
         </div>
         
         <div className="stat-card info-card">
           <div className="stat-title">Focus Time 🎯</div>
           <div className="stat-number">{stats.focusTime} <span className="stat-subtext">Mins</span></div>
         </div>

         <div className="stat-card info-card">
           <div className="stat-title">7-Day Completion Rate 📈</div>
           <div className="stat-number" style={{color: productivityScore >= 70 ? 'var(--success)' : 'var(--warning)'}}>
             {productivityScore}%
           </div>
         </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Weekly Productivity Flow</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'var(--glass-border)'}} 
                contentStyle={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--primary-color)', borderRadius: '12px', backdropFilter: 'blur(10px)'}} 
                itemStyle={{fontWeight: 600}}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="Planned" fill="var(--glow-color)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Completed" fill="var(--success)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
