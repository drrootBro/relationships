// src/pages/Home.jsx
import React from 'react';

export default function Home() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>欢迎来到「关系修复室」</h1>
      <p style={styles.subtitle}>
        他在说话，AI在辅助。你不是一个人面对亲密关系的困惑。
      </p>

      <section style={styles.section}>
        <h2>🎧 今日音频推荐</h2>
        <p>为什么丈夫爱妻子还去找小姐</p>
        <blockquote style={styles.quote}>
          “他不是不爱你，而是他从未学会如何在亲密中表达欲望。”
        </blockquote>
        <audio controls src="/audio/sexenergy.mp3" style={styles.audio} />
      </section>

      <section style={styles.section}>
        <h2>🧠 跟他聊（AI互动模块）</h2>
        <p>【即将上线】</p>
      </section>

      <section style={styles.section}>
        <h2>📚 做练习（沟通工具）</h2>
        <p>【即将上线】</p>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
    lineHeight: '1.6',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#555',
  },
  section: {
    marginBottom: '2rem',
  },
  quote: {
    fontStyle: 'italic',
    color: '#888',
    margin: '1rem 0',
  },
  audio: {
    width: '100%',
  },
};
