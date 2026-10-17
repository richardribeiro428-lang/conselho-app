import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Hash, Volume2, Mic, MicOff, Video, VideoOff, 
  Monitor, MonitorOff, Send, Users, Settings, Plus 
} from 'lucide-react';

const supabaseUrl = 'https://qowdffsjkqewqtmdyzzg.supabase.co';
const supabaseKey = 'sb_publishable_tNulMxIYKRRZoSdCQPopUw_0ewRK29I';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Utilizador' + Math.floor(Math.random() * 1000));
  const [activeChannel, setActiveChannel] = useState('geral');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lógica da Câmara Tradicional
  useEffect(() => {
    if (activeChannel === 'reuniao' && isVideoOn && !isScreenSharing) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Erro ao aceder à câmara", err);
          setIsVideoOn(false);
          alert("O browser bloqueou o acesso à câmara. Por favor, permita o acesso na barra de endereço (ícone do cadeado).");
        });
    } else if (!isScreenSharing) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [activeChannel, isVideoOn, isMicOn, isScreenSharing]);

  // Lógica para Partilhar Ecrã com Áudio
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // Pede acesso ao ecrã e ao áudio do sistema
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsScreenSharing(true);
        setIsVideoOn(false); // Desliga a câmara normal se for ligar o ecrã

        // Quando o utilizador clica em "Parar partilha" na barra do browser
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (videoRef.current) videoRef.current.srcObject = null;
        };
      } catch (err) {
        console.error("Erro ao partilhar ecrã:", err);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert([{ text: newMessage, user_name: username, channel_id: 'geral' }]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-[#313338] text-gray-100 font-sans w-full">
      {/* Barra Lateral de Servidores */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <div className="w-12 h-12 bg-[#5865F2] rounded-[16px] flex items-center justify-center cursor-pointer text-white font-bold text-xl">C</div>
        <div className="w-8 h-[2px] bg-[#313338] rounded-full my-1"></div>
        <div className="w-12 h-12 bg-[#313338] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#23a559] hover:rounded-[16px] transition-all text-[#23a559] hover:text-white">
          <Plus size={24} />
        </div>
      </div>

      {/* Lista de Canais */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
        <div className="h-12 border-b border-[#1f2023] flex items-center px-4 shadow-sm font-semibold">CONSELHO</div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-400 mb-1 px-2 mt-4">CANAIS DE TEXTO</div>
          <div 
            onClick={() => setActiveChannel('geral')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${activeChannel === 'geral' ? 'bg-[#404249] text-gray-100' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-100'}`}
          >
            <Hash size={20} /> geral
          </div>
          
          <div className="text-xs font-semibold text-gray-400 mb-1 px-2 mt-6">CANAIS DE VOZ</div>
          <div 
            onClick={() => setActiveChannel('reuniao')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${activeChannel === 'reuniao' ? 'bg-[#404249] text-gray-100' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-100'}`}
          >
            <Volume2 size={20} /> Reunião
          </div>
        </div>
        
        {/* Painel do Utilizador */}
        <div className="h-[52px] bg-[#232428] flex items-center px-2 gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">{username.charAt(0)}</div>
          <div className="flex-1 text-sm font-semibold truncate">{username}</div>
        </div>
      </div>

      {/* Área Principal (Muda consoante o canal) */}
      <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
        {activeChannel === 'geral' ? (
          <>
            <div className="h-12 border-b border-[#1f2023] flex items-center px-4 gap-2 shadow-sm">
              <Hash size={24} className="text-gray-400" />
              <span className="font-semibold">geral</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-4 hover:bg-[#2e3035] p-2 rounded -mx-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold flex-shrink-0">{msg.user_name?.charAt(0) || 'U'}</div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#f2f3f5]">{msg.user_name}</span>
                    <span className="text-[#dbdee1]">{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4">
              <form onSubmit={handleSendMessage} className="bg-[#383a40] rounded-lg flex items-center px-4 py-2 gap-4">
                <Plus size={24} className="text-gray-400" />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Conversar em #geral"
                  className="flex-1 bg-transparent border-none outline-none text-[#dbdee1]"
                />
                <button type="submit" className="text-gray-400 hover:text-gray-200"><Send size={20} /></button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="h-12 border-b border-[#1f2023] flex items-center px-4 gap-2 shadow-sm">
              <Volume2 size={24} className="text-gray-400" />
              <span className="font-semibold">Reunião</span>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-3xl aspect-video bg-[#1e1f22] rounded-xl overflow-hidden flex items-center justify-center relative shadow-lg">
                {(isVideoOn || isScreenSharing) ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 gap-4">
                    <div className="w-24 h-24 rounded-full bg-[#2b2d31] flex items-center justify-center">
                      <Users size={48} />
                    </div>
                    <p>A câmara e o ecrã estão desligados</p>
                  </div>
                )}
              </div>

              {/* Controlos da Reunião */}
              <div className="flex gap-4">
                {/* Botão Microfone */}
                <button 
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-4 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-[#2b2d31] hover:bg-[#35373c] text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  title="Ligar/Desligar Microfone"
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                {/* Botão Câmara */}
                <button 
                  onClick={() => {
                    if (isScreenSharing) setIsScreenSharing(false);
                    setIsVideoOn(!isVideoOn);
                  }}
                  className={`p-4 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-[#2b2d31] hover:bg-[#35373c] text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  title="Ligar/Desligar Câmara"
                >
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                {/* Botão Partilhar Ecrã (NOVO) */}
                <button 
                  onClick={toggleScreenShare}
                  className={`p-4 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-[#2b2d31] hover:bg-[#35373c] text-white' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'}`}
                  title="Partilhar Ecrã"
                >
                  {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
