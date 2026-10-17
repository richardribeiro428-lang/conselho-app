import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Hash,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Send,
  Users,
  Settings,
  Plus,
} from 'lucide-react';

// Substitua com as suas credenciais do Supabase
const supabaseUrl = 'https://qowdffsjkqewqtmdyzzg.supabase.co';
const supabaseKey = 'sb_publishable_tNulMxIYKRRZoSdCQPopUw_0ewRK29I';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState(
    'Utilizador' + Math.floor(Math.random() * 1000)
  );
  const messagesEndRef = useRef(null);

  // Carregar mensagens e ouvir em tempo real
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ text: newMessage, user_name: username, channel_id: 'geral' }]);

    if (!error) setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-[#313338] text-gray-100 font-sans">
      {/* Barra Lateral de Servidores */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-[#5865F2] rounded-[16px] flex items-center justify-center cursor-pointer text-white font-bold text-xl hover:rounded-[16px] transition-all">
          C
        </div>
        <div className="w-8 h-[2px] bg-[#313338] rounded-full my-1"></div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#23a559] hover:rounded-[16px] transition-all text-[#23a559] hover:text-white">
          <Plus size={24} />
        </div>
      </div>

      {/* Lista de Canais */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="h-12 border-b border-[#1f2023] flex items-center px-4 shadow-sm font-semibold">
          CONSELHO
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-400 mb-1 px-2 mt-4 flex items-center gap-1">
            CANAIS DE TEXTO
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#404249] text-gray-100 rounded cursor-pointer">
            <Hash size={20} className="text-gray-400" /> geral
          </div>

          <div className="text-xs font-semibold text-gray-400 mb-1 px-2 mt-6 flex items-center gap-1">
            CANAIS DE VOZ
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:bg-[#35373c] hover:text-gray-100 rounded cursor-pointer transition-colors">
            <Volume2 size={20} /> Reunião
          </div>
        </div>

        {/* Painel do Utilizador */}
        <div className="h-[52px] bg-[#232428] flex items-center px-2 gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            {username.charAt(0)}
          </div>
          <div className="flex-1 text-sm font-semibold truncate">
            {username}
          </div>
          <div className="flex gap-1 text-gray-400">
            <Mic size={18} className="cursor-pointer hover:text-gray-200" />
            <Settings
              size={18}
              className="cursor-pointer hover:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Área de Chat principal */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h-12 border-b border-[#1f2023] flex items-center px-4 gap-2 shadow-sm">
          <Hash size={24} className="text-gray-400" />
          <span className="font-semibold">geral</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-4 hover:bg-[#2e3035] p-2 rounded -mx-2"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold flex-shrink-0">
                {msg.user_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-[#f2f3f5]">
                    {msg.user_name}
                  </span>
                </div>
                <span className="text-[#dbdee1]">{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <form
            onSubmit={handleSendMessage}
            className="bg-[#383a40] rounded-lg flex items-center px-4 py-2 gap-4"
          >
            <Plus
              size={24}
              className="text-gray-400 cursor-pointer hover:text-gray-200"
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Conversar em #geral"
              className="flex-1 bg-transparent border-none outline-none text-[#dbdee1] placeholder-gray-500"
            />
            <button
              type="submit"
              className="text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
