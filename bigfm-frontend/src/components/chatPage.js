import { alpha, Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChartRenderer from './ChartRenderer'; // 🔥 you must import your renderer

export default function ConversationView() {
  const usercode = "12345"; // keep same
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const historyLoaded = useRef(false);

  // ------------------ LOAD CHAT HISTORY ------------------
  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;

    const fetchHistory = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.get(`${baseURL}/analyze/history/${usercode}`);
        const rows = res.data?.history || [];

        if (rows.length === 0) {
          setMessages([
            {
              id: 'empty',
              role: 'ai',
              type: 'text',
              content: "Hello! I'm your Conversation AI. How can I help you today?",
              ts: new Date().toISOString(),
            },
          ]);
          return;
        }

        // 🔥 FIX: Convert backend history => chat bubbles
        const formatted = rows.flatMap((r, idx) => {
          const hasBoth = r.role === "assistant" && r.message && r.response;
          if (hasBoth) {
            return [
              {
                id: `${idx}-user`,
                role: 'user',
                type: 'text',
                content: r.message,
                ts: r.created_at
              },
              {
                id: `${idx}-ai`,
                role: 'ai',
                type: r.response.type,
                content: r.response.type === 'chart' ? '' : r.response.response,
                chart: r.response.type === 'chart' ? r.response : null,
                ts: r.created_at
              }
            ];
          }

          return {
            id: idx,
            role: r.role === "assistant" ? "ai" : "user",
            type: r.response?.type || "text",
            content: r.response?.response || r.message,
            chart: r.response?.type === "chart" ? r.response : null,
            ts: r.created_at
          };
        });

        setMessages(formatted);
      } catch {
        setError('Failed to load chat history');
      }
    };

    fetchHistory();
  }, [usercode]);

  // ------------------ SEND MESSAGE ------------------
  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = {
      id: `${Date.now()}-u`,
      role: 'user',
      type: 'text',
      content: q,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${baseURL}/analyze`, { query: q, userid: usercode });

      const backend = res.data;

      if (backend.type === 'text') {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            role: 'ai',
            type: 'text',
            content: backend.response,
            ts: new Date().toISOString(),
          },
        ]);
      } else if (backend.type === 'chart') {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a`,
            role: 'ai',
            type: 'chart',
            chart: backend,
            ts: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // ------------------ UI ------------------
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 1 ,display:'flex', alignItems:'center',gap:0.5}}>
        Conversation
        <Typography variant="body2" color="text.secondary">
        Chat with your AI assistant — ask any business question.
      </Typography>
      </Typography>
      

      {/* MESSAGES */}
      <Stack spacing={1.5} sx={{ pb: 6, height: 'calc(100% - 123px)', overflowY: 'auto' }}>
        {messages.map((m) => (
          <Box key={m.id} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Stack direction="row" spacing={1} sx={{ maxWidth: '72%' }}>
              {m.role === 'ai' && <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>}
              <Paper
                sx={(t) => ({
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: m.role === 'user' ? alpha(t.palette.primary.main, 0.08) : t.palette.background.paper,
                  border: '1px solid',
                  borderColor: m.role === 'user' ? alpha(t.palette.primary.main, 0.25) : 'divider',
                })}
              >
                {/* 🔥 Text */}
                {m.type === 'text' && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </Typography>
                )}

                {/* 🔥 Chart Support */}
                {m.type === 'chart' && <ChartRenderer data={m.chart} />}
              </Paper>
              {m.role === 'user' && <Avatar sx={{ bgcolor: 'grey.300' }}>U</Avatar>}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* INPUT */}
      <Box component="form" onSubmit={handleSend}>
        <Stack direction="row" spacing={1.25}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything like: Top brands last week?"
            fullWidth
          />
          <Button type="submit" disabled={loading} variant="contained">
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
        {error && (
          <Typography color="error" fontSize="0.85rem" mt={1}>
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
