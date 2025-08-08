import React, { useState, useEffect, useRef } from 'react';

// 主应用组件，包含所有子组件和状态管理
const App = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'tools'
  const [currentAudio, setCurrentAudio] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好，我是你的情感修复助手。请告诉我你的问题，或者选择一个音频聆听。' },
  ]);

  // 音频数据
  const audioData = [
    {
      id: 'audio-1',
      title: '爱情与第三者',
      file: 'love-and-mistress.mp3',
      description: '探讨爱情中出现第三者时的心理与应对策略。',
      transcript: "在一段感情中出现第三者，往往会带来巨大的痛苦和困惑。首先，我们需要面对自己的情绪，无论是愤怒、悲伤还是背叛感，这些都是正常的反应。不要压抑它们，可以找一个信任的朋友倾诉，或者写日记。其次，冷静地分析问题。第三者的出现是偶然还是必然？这背后是否隐藏着你们关系中长期存在的问题？比如沟通不畅、缺乏情感连接等。第三，做出决定。是选择修复关系，还是放手？这是一个艰难的选择，但无论如何，都要尊重自己的感受。如果选择修复，双方需要进行真诚的沟通，并寻求专业咨询师的帮助。如果选择放手，也要学会原谅，不是为了对方，而是为了让自己从痛苦中解脱。记住，你值得被爱和尊重。",
    },
    {
      id: 'audio-2',
      title: '无性婚姻，不离婚？',
      file: 'no-sex-no-divorce.mp3',
      description: '分析无性婚姻的困境和维系关系的可能性。',
      transcript: "无性婚姻是一个复杂的议题，它不仅仅是生理需求的问题，更是情感连接、亲密感和生活满意度的体现。当夫妻双方都同意维持无性婚姻时，这可能是一种平衡的选择，他们可能在其他方面找到了共同的价值和快乐，例如共同抚养孩子、经济上的支持或深厚的情感友谊。然而，如果一方有需求而另一方不愿意，这就会成为一个巨大的矛盾。在这种情况下，开放和诚实的沟通至关重要。双方需要探索各自的期望、感受和恐惧。专业的婚姻咨询师可以提供一个安全的环境，帮助他们重新建立连接或找到一个和平的解决方案。最重要的是，夫妻双方必须互相尊重，理解对方的需求和感受，无论最终做出何种决定。",
    },
  ];

  // 工具数据
  const toolsData = [
    {
      id: 'tool-1',
      name: '情感日记',
      description: '记录你的情绪和思考，帮助你更好地理解自己。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7.5 17.5l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
    {
      id: 'tool-2',
      name: '关系复盘',
      description: '引导你回顾关系中的关键事件，总结经验。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      id: 'tool-3',
      name: '情绪疏导',
      description: '提供呼吸练习和冥想指引，帮助你平复心情。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.5C17.25 18 22 13 22 8C22 5.24 19.76 3 17 3C15.28 3 13.81 3.96 12 5.5C10.19 3.96 8.72 3 7 3C4.24 3 2 5.24 2 8C2 13 6.75 18 12 21.5z" />
        </svg>
      ),
    },
  ];

  // AudioPlayer 组件
  const AudioPlayer = ({ audio, onAudioSelect }) => {
    const [audioSummary, setAudioSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // 调用 Gemini API 总结音频内容
    const summarizeAudio = async (transcript) => {
      setIsSummarizing(true);
      const prompt = `请用三到五句话，以通俗易懂的方式总结以下关于两性关系的语音内容。内容：${transcript}`;

      try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        setAudioSummary(summary || '抱歉，未能生成总结。');
      } catch (error) {
        console.error("AI API 调用失败:", error);
        setAudioSummary('AI 服务暂时不可用，请稍后重试。');
      } finally {
        setIsSummarizing(false);
      }
    };

    return (
      <div className="p-4 bg-white rounded-lg shadow-md mb-4 max-h-52 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3 text-gray-800">语音解答库</h2>
        <ul className="space-y-2">
          {audio.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onAudioSelect(item);
                setAudioSummary(''); // 清除旧的总结
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
                currentAudio?.id === item.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </li>
          ))}
        </ul>
        {currentAudio && (
          <div className="mt-4 border-t pt-4 border-gray-200">
            <button
              onClick={() => summarizeAudio(currentAudio.transcript)}
              disabled={isSummarizing}
              className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isSummarizing ? '生成中...' : '✨ 提取要点'}
            </button>
            {audioSummary && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-gray-800">
                <p className="font-semibold mb-1">关键要点:</p>
                <p>{audioSummary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ChatBox 组件
  const ChatBox = () => {
    // 将 input 状态移回 ChatBox 内部，以确保它不会在不必要的渲染中被重置
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
        const apiKey = "";
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
      if (chatHistory.length < 2) {
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
        const apiKey = "";
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
          {chatHistory.map((message, index) => (
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
              disabled={isRecommending || chatHistory.length < 2}
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

  // ToolKit 组件
  const ToolKit = ({ tools }) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">工具箱</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
            >
              <div className="flex items-center space-x-4 mb-4">
                {tool.icon}
                <h3 className="text-xl font-semibold text-gray-800">{tool.name}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased flex justify-center items-center">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        `}
      </style>
      <div className="container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">关系修复室</h1>
          <p className="mt-2 text-lg text-gray-600">你的个人情感顾问</p>
        </header>

        {currentAudio && (
          <div className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">正在播放: {currentAudio.title}</h2>
            <audio controls src={`/audio/${currentAudio.file}`} className="w-full max-w-xl">
              您的浏览器不支持音频播放。
            </audio>
            <p className="mt-2 text-sm text-gray-500">（请确保音频文件已放入 public/audio 目录）</p>
          </div>
        )}

        <div className="flex space-x-2 p-1 bg-white rounded-full shadow-sm mb-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            AI 聊天
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors ${
              activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            工具箱
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AudioPlayer audio={audioData} onAudioSelect={setCurrentAudio} />
          </div>
          <div className="md:col-span-2">
            {activeTab === 'chat' ? <ChatBox /> : <ToolKit tools={toolsData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
