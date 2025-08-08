import React, { useState } from 'react';
import chatPrompts from '../data/chatPrompts';
import audioData from '../data/audioData';

export default function ChatBox() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedKeyword = chatPrompts.find((keyword) =>
      userInput.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
      const matchedResponse = audioData[matchedKeyword];
      setResponse(matchedResponse.text);
      setAudioSrc(matchedResponse.audio);
    } else {
      setResponse('🤔 抱歉，我暂时无法识别你的问题。请尝试使用其他关键词。');
      setAudioSrc(null);
    }

    setUserInput('');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">🗣️ 用户提问界面</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请输入你的问题..."
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          提交
        </button>
      </form>

      {response && (
        <div className="mb-4">
          <p className="font-semibold text-gray-700">💬 回应：</p>
          <p className="text-gray-600">{response}</p>
        </div>
      )}

      {audioSrc && (
        <div>
          <p className="font-semibold text-gray-700">🔊 音频：</p>
          <audio controls src={audioSrc} className="w-full mt-2" />
        </div>
      )}
    </div>
  );
}
