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

// Do not embed secrets in production builds; only honor a local dev key in non-prod.
const isProd = import.meta.env.PROD;
const ENV_API_KEY = isProd ? '' : import.meta.env.VITE_GEMINI_API_KEY?.trim?.() || '';
const ENV_PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL?.trim?.() || '';
const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim?.() || '';

const GEMINI_API_KEY = ENV_API_KEY; // local dev only; do not ship secrets in production builds
const GEMINI_MODEL = ENV_MODEL || 'gemini-2.5-flash';
const DEFAULT_PROXY_URL = 'https://gemini-proxy.zekenaulty.workers.dev'; // e.g., https://gemini-proxy.yourdomain.workers.dev
const GEMINI_PROXY_URL = ENV_PROXY_URL || DEFAULT_PROXY_URL;

const STORAGE_KEY = 'chat-history-v1';
const INITIAL_LOAD_COUNT = 100;
const LOAD_BATCH_SIZE = 50;
const MAX_SEND_TURNS = 100;

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
  const [hydrated, setHydrated] = useState(false);

  const fullHistoryRef = useRef([INITIAL_ASSISTANT_MESSAGE]);
  const visibleStartRef = useRef(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const prependRestoreRef = useRef(null);

  const client = useMemo(() => {
    const proxyUrl = isProd ? GEMINI_PROXY_URL : ENV_PROXY_URL;
    const proxyLooksLikeGoogle = proxyUrl?.includes('generativelanguage.googleapis.com');

    // Prod: always use the proxy. Dev: use proxy only if it is a non-Google endpoint.
    const useProxy = isProd
      ? true
      : proxyUrl &&
        !proxyUrl.includes('REPLACE') &&
        !proxyLooksLikeGoogle &&
        proxyUrl.startsWith('http');

    const baseUrlOverride =
      !useProxy && proxyLooksLikeGoogle && proxyUrl ? proxyUrl.replace(/\/+$/, '') : undefined;

    if (!useProxy && (!GEMINI_API_KEY || GEMINI_API_KEY.includes('REPLACE'))) {
      return null;
    }

    try {
      const options = {
        apiKey: GEMINI_API_KEY,
        model: GEMINI_MODEL,
        useProxy,
      };

      if (useProxy) {
        options.baseUrl = proxyUrl.replace(/\/+$/, '');
      } else if (baseUrlOverride) {
        options.baseUrl = baseUrlOverride;
      }

      return new GeminiHttpClient(options);
    } catch (err) {
      console.error('Failed to initialize Gemini client', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const useProxy =
      GEMINI_PROXY_URL &&
      !GEMINI_PROXY_URL.includes('REPLACE') &&
      !GEMINI_PROXY_URL.includes('generativelanguage.googleapis.com') &&
      GEMINI_PROXY_URL.startsWith('http');

    if (useProxy && client) {
      setClientError('');
      return;
    }

    if (!useProxy && (!GEMINI_API_KEY || GEMINI_API_KEY.includes('REPLACE'))) {
      setClientError('Set VITE_GEMINI_API_KEY in .env.local (dev only) or configure VITE_GEMINI_PROXY_URL to enable chat replies.');
    } else if (!client) {
      setClientError('Gemini client failed to initialize. Check your API key or proxy URL.');
    } else {
      setClientError('');
    }
  }, [client]);

  useEffect(() => {
    if (prependRestoreRef.current) {
      const el = listRef.current;
      if (el) {
        const { prevHeight, prevTop } = prependRestoreRef.current;
        const nextHeight = el.scrollHeight;
        el.scrollTop = (nextHeight - prevHeight) + prevTop;
      }
      prependRestoreRef.current = null;
      return;
    }

    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let stored = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      stored = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to parse stored chat history', err);
    }

    if (!stored.length) {
      stored = [INITIAL_ASSISTANT_MESSAGE];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (err) {
        console.warn('Failed to initialize chat history', err);
      }
    }

    fullHistoryRef.current = stored;
    const start = Math.max(0, stored.length - INITIAL_LOAD_COUNT);
    visibleStartRef.current = start;
    setMessages(stored.slice(start));
    setHydrated(true);
  }, []);

  const persistHistory = (history) => {
    fullHistoryRef.current = history;
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch (err) {
      console.warn('Failed to persist chat history', err);
    }
  };

  const loadOlderMessages = () => {
    if (!hydrated) return;
    const start = visibleStartRef.current;
    if (start <= 0) return;

    const newStart = Math.max(0, start - LOAD_BATCH_SIZE);
    const olderSlice = fullHistoryRef.current.slice(newStart, start);
    if (!olderSlice.length) return;

    const el = listRef.current;
    if (el) {
      prependRestoreRef.current = {
        prevHeight: el.scrollHeight,
        prevTop: el.scrollTop,
      };
    }

    visibleStartRef.current = newStart;
    setMessages((prev) => [...olderSlice, ...prev]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    if (!client) {
      setError('Chat client not configured. Please set your Gemini API key or proxy URL.');
      return;
    }

    const userMessage = makeMessage('user', trimmed);
    const historyWithUser = [...fullHistoryRef.current, userMessage];

    persistHistory(historyWithUser);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError('');
    setIsLoading(true);
    inputRef.current?.blur();

    try {
      const { text } = await callResumeChat({
        client,
        messages: historyWithUser.slice(-MAX_SEND_TURNS),
      });

      const reply = text?.trim()
        ? text.trim()
        : 'I was unable to generate a reply. Please try again.';

      const replyMessage = makeMessage('model', reply);
      const historyWithReply = [...historyWithUser, replyMessage];
      persistHistory(historyWithReply);
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
          height: { xs: '100dvh', md: '100vh' },
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
            pb: { xs: 'env(safe-area-inset-bottom, 8px)', md: 0 },
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
              minHeight: 0,
              overflowY: 'auto',
              px: 2,
              pb: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              scrollBehavior: 'smooth',
            }}
            ref={listRef}
            onScroll={(event) => {
              if (event.currentTarget.scrollTop < 120) {
                loadOlderMessages();
              }
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

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, pt: 1, pb: 'calc(env(safe-area-inset-bottom, 12px) + 12px)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              AI can make mistakes. Verify important details.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Ask about Zeke's experience"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={Boolean(clientError)}
                inputRef={inputRef}
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
