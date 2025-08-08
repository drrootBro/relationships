import React from 'react';
import ChatBox from '../components/ChatBox';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <ChatBox />
    </main>
  );
}
