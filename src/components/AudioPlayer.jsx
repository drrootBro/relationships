import React, { useState } from 'react';

const AudioPlayer = ({ audio, onAudioSelect, currentAudio }) => {
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
        {audio && audio.map((item) => (
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

export default AudioPlayer;
