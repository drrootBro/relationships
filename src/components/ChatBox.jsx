import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ chatHistory, setChatHistory }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedTool, setRecommendedTool] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  
  // AI 接入函数
  const sendToAI = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', text: message };
    setChatHistory((prev) => [...prev, userMessage, { role: 'ai', text: '正在思考中...' }]);
    setInput(''); // 发送后清空输入框
    setIsTyping(true);

    const chatHistoryForAPI = [...chatHistory, userMessage];
    const prompt = chatHistoryForAPI.map(msg => `${msg.role}: ${msg.text}`).join('\n');

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop(); // 移除 "正在思考中..."
        newHistory.push({ role: 'ai', text: aiResponse || '抱歉，我未能生成回复。' });
        return newHistory;
      });
    } catch (error) {
      console.error("AI API 调用失败:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop();
        newHistory.push({ role: 'ai', text: 'AI 服务暂时不可用，请稍后重试。' });
        return newHistory;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // 情绪分析功能
  const analyzeEmotion = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setEmotionalAnalysis('');

    const prompt = `分析以下句子所表达的情感，请用简单的词汇总结，如“愤怒”、“悲伤”、“困惑”、“平静”、“希望”等，并附上简短的分析理由。句子：“${input}”`;
    
    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const analysis = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      setEmotionalAnalysis(analysis || '无法分析情感。');
    } catch (error) {
      console.error("AI API 调用失败:", error);
      setEmotionalAnalysis('AI 服务暂时不可用。');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 工具推荐功能
  const recommendTool = async () => {
    if (!chatHistory || chatHistory.length < 2) {
      setRecommendedTool('请先进行一些对话，我才能更好地理解你的需求。');
      return;
    }
    setIsRecommending(true);
    setRecommendedTool('');

    const recentChat = chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.text}`).join('\n');
    const prompt = `根据以下最近的聊天内容，从“情感日记”、“关系复盘”和“情绪疏导”这三种工具中，推荐一个最合适的工具给用户，并说明推荐理由。最近的聊天内容：\n${recentChat}`;
    
    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const toolRec = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      setRecommendedTool(toolRec || '无法推荐工具。');
    } catch (error) {
      console.error("AI API 调用失败:", error);
      setRecommendedTool('AI 服务暂时不可用。');
    } finally {
      setIsRecommending(false);
    }
  };

  // 滚动到底部
  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatHistory && chatHistory.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
              <div className="max-w-xs p-3 rounded-xl shadow-sm bg-gray-100 text-gray-800 rounded-bl-none animate-pulse">
                  正在思考中...
              </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        {emotionalAnalysis && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg text-sm text-gray-800">
            <p className="font-semibold mb-1">情感分析结果:</p>
            <p>{emotionalAnalysis}</p>
          </div>
        )}
        {recommendedTool && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-gray-800">
            <p className="font-semibold mb-1">AI 推荐工具:</p>
            <p>{recommendedTool}</p>
          </div>
        )}
        <div className="mb-2 flex space-x-2 justify-end">
          <button
            onClick={analyzeEmotion}
            disabled={isAnalyzing || !input.trim()}
            className="py-2 px-4 text-xs font-semibold rounded-full bg-purple-200 text-purple-800 hover:bg-purple-300 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? '分析中...' : '✨ 情绪分析'}
          </button>
          <button
            onClick={recommendTool}
            disabled={isRecommending || !chatHistory || chatHistory.length < 2}
            className="py-2 px-4 text-xs font-semibold rounded-full bg-green-200 text-green-800 hover:bg-green-300 transition-colors disabled:opacity-50"
          >
            {isRecommending ? '推荐中...' : '✨ 推荐工具'}
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendToAI(input);
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setEmotionalAnalysis(''); // 清除情感分析结果
              setRecommendedTool(''); // 清除工具推荐结果
            }}
            placeholder="请输入你的问题..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus-ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
