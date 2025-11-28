import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Slide,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GeminiHttpClient } from '../llm/geminiHttpClient';
import { callResumeChat } from '../llm/chatService';

const GEMINI_API_KEY = 'AIzaSyBM6LHTnKOLO1QvaUp1Gg9ShMFZcwitwTQ'; //this is an accepted an known security risk key for demo purposes only
const GEMINI_MODEL = 'gemini-2.5-flash';

const INITIAL_ASSISTANT_MESSAGE = {
  id: 'welcome',
  role: 'model',
  text: "You can ask about Zeke's roles, skills, experience, or projects, and I'll answer from his resume data.",
  timestamp: Date.now(),
};

const makeMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  role,
  text,
  timestamp: Date.now(),
});

function ChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([INITIAL_ASSISTANT_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');

  const messagesEndRef = useRef(null);

  const client = useMemo(() => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('REPLACE')) {
      return null;
    }
    try {
      return new GeminiHttpClient({ apiKey: GEMINI_API_KEY, model: GEMINI_MODEL });
    } catch (err) {
      console.error('Failed to initialize Gemini client', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('REPLACE')) {
      setClientError('Set GEMINI_API_KEY in ChatDrawer.jsx to enable chat replies.');
    } else if (!client) {
      setClientError('Gemini client failed to initialize. Check your API key.');
    } else {
      setClientError('');
    }
  }, [client]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    if (!client) {
      setError('Chat client not configured. Please set your Gemini API key.');
      return;
    }

    const userMessage = makeMessage('user', trimmed);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputValue('');
    setError('');
    setIsLoading(true);

    try {
      const { text } = await callResumeChat({
        client,
        messages: nextMessages,
      });

      const reply = text?.trim()
        ? text.trim()
        : 'I was unable to generate a reply. Please try again.';

      const replyMessage = makeMessage('model', reply);
      setMessages((prev) => [...prev, replyMessage]);
    } catch (err) {
      console.error('Gemini chat error', err);
      setError(err?.message || 'Unable to get a response from Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = Boolean(inputValue.trim()) && !isLoading && !clientError;

  const renderMessage = (message) => {
    const isUser = message.role === 'user';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          width: '100%',
        }}
      >
        <Box
          sx={{
            maxWidth: '100%',
            backgroundColor: isUser ? 'primary.dark' : 'background.default',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            px: 2,
            py: 1.5,
            boxShadow: (theme) => theme.shadows[isUser ? 4 : 1],
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {isUser ? 'You' : 'AI (Gemini)'}
          </Typography>
          <Box
            sx={{
              '& p': { marginBottom: 1, '&:last-of-type': { marginBottom: 0 } },
              '& code': {
                fontFamily: 'ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                backgroundColor: 'rgba(255,255,255,0.06)',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              },
              '& pre': {
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 1,
                p: 1,
                overflowX: 'auto',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              },
              '& ul, & ol': { pl: 3, my: 1 },
              '& a': { color: 'primary.light' },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Slide direction="right" in={isOpen} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: { xs: '100%', sm: 340, md: 380 },
          zIndex: (theme) => theme.zIndex.drawer + 2,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2 }}
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Ask about Zeke
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Powered by Gemini ({GEMINI_MODEL})
              </Typography>
            </Box>
            <IconButton aria-label="Close chat" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          <Box sx={{ px: 2, pt: 1 }}>
            {clientError ? (
              <Alert severity="info" sx={{ mb: 1 }}>
                {clientError}
              </Alert>
            ) : null}
            {error ? (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ) : null}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2,
              pb: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {messages.map((message) => renderMessage(message))}
            {isLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Thinking...
                </Typography>
              </Stack>
            ) : null}
            <span ref={messagesEndRef} />
          </Box>

          <Divider />

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, pt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Ask about Zeke's experience"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={Boolean(clientError)}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!canSend}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Slide>
  );
}

export default ChatDrawer;
