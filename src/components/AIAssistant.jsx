import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithAssistant } from '../services/aiService';

export const AIAssistant = ({ tasks, stats }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse history", e);
    }
    return [
      { role: 'assistant', content: "Hello! I'm your dedicated AI. I have full context of your gamification state and pending tasks. How can I help optimize your flow today?" }
    ];
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputVal('');
    setIsLoading(true);

    try {
      const reply = await chatWithAssistant(newHistory, tasks, stats);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Erase all conversational context?")) {
      setMessages([{ role: 'assistant', content: "Memory cleared. What's the new plan?" }]);
    }
  };

  return (
    <div className="assistant-docker">
      <div className="assistant-header" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{fontSize: '1rem', margin: 0, background: 'var(--ai-gradient)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 800}}>🤖 AI Assistant</h3>
        <button onClick={clearHistory} className="assistant-clear-btn" title="Clear History" style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 }}>🗑️</button>
      </div>
      
      <div className="assistant-messages" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.map((m, idx) => (
          <div key={idx} className={`assistant-bubble ${m.role}`}>
             {m.role === 'assistant' ? (
               <div className="markdown-content">
                 <ReactMarkdown>{m.content}</ReactMarkdown>
               </div>
             ) : (
               m.content
             )}
          </div>
        ))}
        {isLoading && (
           <div className="assistant-bubble assistant typing">
              <div className="loading-spinner small" style={{borderColor: 'var(--primary-color)', borderTopColor: 'transparent', margin: '0.2rem auto'}}></div>
           </div>
        )}
      </div>

      <div className="assistant-chips" style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
         <button onClick={() => handleSend("What should I do next?")} style={{ background: 'var(--card-bg)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>What's next?</button>
         <button onClick={() => handleSend("Analyze my productivity")} style={{ background: 'var(--card-bg)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Analyze Stats</button>
      </div>

      <div className="assistant-input-row" style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '0.6rem 1rem', outline: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }}
        />
        <button onClick={() => handleSend()} disabled={!inputVal.trim() || isLoading} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-color)', border: 'none', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>↑</button>
      </div>
    </div>
  );
};
