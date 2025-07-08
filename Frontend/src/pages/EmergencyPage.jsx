import { useState } from "react";
import axios from "axios";

// CSRF helper
function getCSRFToken() {
  const match = document.cookie.match(/csrftoken=([\w-]+)/);
  return match ? match[1] : '';
}

export default function EmergencyPage() {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');

  const handleTrigger = async () => {
    if (isSending || cooldown > 0) return;

    setIsSending(true);
    setMessage('');

    try {
      await axios.post(
        "/api/emergency/alert/",
        { message: "🚨 Alerta de emergência!" },
        {
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
        }
      );

      setMessage("✅ Alerta enviado com sucesso!");
      setCooldown(10); // seconds
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao enviar alerta.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-bold">🚨 Botão de Emergência</h2>
      <button
        onClick={handleTrigger}
        disabled={isSending || cooldown > 0}
        className={`${
          isSending || cooldown > 0 ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
        } text-white px-6 py-4 rounded-xl text-lg`}
      >
        {cooldown > 0 ? `Aguarde ${cooldown}s` : "🔴 Enviar Alerta"}
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
