const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const fetchGeminiText = async (prompt) => {
  if (!API_KEY || API_KEY.trim() === '') {
    throw new Error('No Gemini API Key provided in environment config.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Error: ${errText}`);
  }
  
  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini returned no response chunk.");
  }

  return data.candidates[0].content.parts[0].text.trim();
};

export const generateTasks = async (goal) => {
  const prompt = `Deconstruct the following user goal into a list of 3-5 distinct, logical, and highly actionable tasks.
Output ONLY a raw JSON array of objects with exactly this format (no markdown code blocks):
[{"title": "string", "description": "string", "category": "Work", "priority": "High"}]
Categories: Work, Study, Personal. Priorities: High, Medium, Low.
User Goal: ${goal}`;
  
  const text = await fetchGeminiText(prompt);
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
     const parsed = JSON.parse(cleaned);
     return Array.isArray(parsed) ? parsed : parsed.tasks || [];
  } catch(e) {
     throw new Error("Failed to parse task generation output. Try again.");
  }
};

export const breakTask = async (title, description) => {
  const prompt = `Break this task into 3–5 simple actionable subtasks in plain text bullet points (starting with "- "):
Task Title: ${title}
Task Description: ${description || "None"}`;

  const text = await fetchGeminiText(prompt);
  
  // Convert text response into usable array
  return text.split('\n')
    .map(line => line.trim().replace(/^-\s*/, '').replace(/^\*\s*/, ''))
    .filter(line => line.length > 3)
    .map(t => ({ title: t }));
};

export const chatWithAssistant = async (history, tasks, stats) => {
  const pendingTasks = tasks.filter(t => !t.completed).map(t => ({
     title: t.title, priority: t.priority, estimate: t.estimate
  }));

  const context = `You are a productivity assistant. Answer briefly and clearly.
CURRENT APP STATE:
- Pending Tasks: ${JSON.stringify(pendingTasks)}
- Gamification Level: ${stats?.level || 1}
Do not output raw JSON arrays. Respond beautifully in normal conversational text.`;

  const historyText = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
  const finalPrompt = `${context}\n\nCHAT HISTORY LOG:\n${historyText}\n\nAssistant:`;

  return await fetchGeminiText(finalPrompt);
};
