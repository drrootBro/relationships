import React from 'react';

export default function Home() {
  return (
    <div className="max-w-xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-2">欢迎来到「关系修复室」</h1>
      <p className="mb-6">她在说话，AI在辅助。你不是一个人面对亲密关系的困惑。</p>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">🎧 今日音频推荐</h2>
        <p className="mt-2 font-medium">为什么丈夫爱妻子还去找小姐</p>
        <p className="text-sm text-gray-600">“他不是不爱你，而是他从未学会如何在亲密中表达欲望。”</p>

        <audio controls className="w-full mt-4">
          <source src="/audio/why-men.mp3" type="audio/mpeg" />
          您的浏览器不支持音频播放。
        </audio>
      </div>

      <div className="mt-8 text-gray-500">
        <p>🧠 跟她聊（AI互动模块）【即将上线】</p>
        <p>📚 做练习（沟通工具）【即将上线】</p>
      </div>
    </div>
  );
}