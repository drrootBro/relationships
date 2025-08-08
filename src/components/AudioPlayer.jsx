import React from "react";

const AudioPlayer = ({ src }) => {
  return (
    <audio controls className="w-full">
      <source src={src} type="audio/mpeg" />
      您的浏览器不支持音频播放。
    </audio>
  );
};

export default AudioPlayer;
