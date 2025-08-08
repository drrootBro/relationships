import React, { useState } from "react";
import { triggerKeywords } from "../data/chatPrompts";
import { audioResponses } from "../data/audioData";
import AudioPlayer from "./AudioPlayer";

const ChatBox = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = () => {
    const matched = triggerKeywords.find(keyword => userInput.includes(keyword));
    if (matched) {
      const audio = audioResponses["no-sex-no-divorce"];
      setResponse(audio);
    } else {
      setResponse({
        intro: "我还在学习如何理解你的问题，可以试着描述得更具体一些吗？"
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="请输入你的问题..."
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
        提交
      </button>

      {response && (
        <div className="space-y-4 mt-4">
          <p>{response.intro}</p>
          {response.file && <AudioPlayer src={response.file} />}
          {response.followUp && <p>{response.followUp}</p>}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
