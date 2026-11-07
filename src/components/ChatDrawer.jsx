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
import { PublicChatClient, getChatErrorMessage } from '../llm/publicChatClient.js';
import { callResumeChat, MAX_MESSAGE_CHARS, normalizeStoredMessages } from '../llm/chatService.js';

// Explicit opt-in only: a public Worker endpoint, never a provider key.
const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_PROXY_URL?.trim() || '';

const STORAGE_KEY = 'chat-history-v1';
const INITIAL_LOAD_COUNT = 100;
const LOAD_BATCH_SIZE = 50;

const INITIAL_ASSISTANT_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "You can ask about Zeke's roles, skills, or experience, and I'll answer from his resume data.",
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
  const [retryUntil, setRetryUntil] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const fullHistoryRef = useRef([INITIAL_ASSISTANT_MESSAGE]);
  const visibleStartRef = useRef(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const prependRestoreRef = useRef(null);
  const requestRef = useRef(null);

  const { client, clientError } = useMemo(() => {
    try {
      return { client: new PublicChatClient({ endpoint: CHAT_ENDPOINT, allowLocalhost: import.meta.env.DEV }), clientError: '' };
    } catch (err) {
      return { client: null, clientError: getChatErrorMessage(err) };
    }
  }, []);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (!retryUntil) return undefined;
    const timer = setTimeout(() => setRetryUntil(0), Math.max(0, retryUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [retryUntil]);

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
      stored = normalizeStoredMessages(parsed);
    } catch { /* Restricted browser storage must not break chat. */ }

    if (!stored.length) {
      stored = [INITIAL_ASSISTANT_MESSAGE];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch { /* Keep the conversation in memory only. */ }
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
    } catch { /* Keep the conversation in memory only. */ }
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
    // The synchronous ref also blocks repeated sends before React rerenders.
    if (!trimmed || requestRef.current || retryUntil > Date.now() || !hydrated) return;
    if (inputValue.length > MAX_MESSAGE_CHARS) {
      setError(`Please keep your question to ${MAX_MESSAGE_CHARS} characters.`);
      return;
    }
    if (!client) {
      setError(clientError);
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    const userMessage = makeMessage('user', trimmed);
    const historyWithUser = [...fullHistoryRef.current, userMessage];
    // Persist only successful exchanges. Failed drafts stay editable and do not
    // silently become conversation context in a later request.
    setMessages((prev) => [...prev, userMessage]);
    setError('');
    setIsLoading(true);
    inputRef.current?.blur();
    try {
      const reply = await callResumeChat({ client, messages: historyWithUser, signal: controller.signal });
      if (controller.signal.aborted) return;
      const replyMessage = { ...makeMessage('assistant', reply.text), incomplete: reply.incomplete, truncated: reply.truncated, contextOmitted: reply.contextOmitted };
      persistHistory([...historyWithUser, replyMessage]);
      setMessages((prev) => [...prev, replyMessage]);
      setInputValue('');
    } catch (err) {
      if (controller.signal.aborted) return;
      setMessages(fullHistoryRef.current.slice(visibleStartRef.current));
      setError(getChatErrorMessage(err));
      if (err?.retryAfterSeconds) setRetryUntil(Date.now() + err.retryAfterSeconds * 1000);
    } finally {
      requestRef.current = null;
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const canSend = Boolean(inputValue.trim()) && inputValue.length <= MAX_MESSAGE_CHARS &&
    !isLoading && !clientError && !retryUntil && hydrated;

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
            {isUser ? 'You' : 'AI'}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Model-authored images must not trigger third-party requests.
                img: ({ alt }) => <span>{alt || '[Image omitted]'}</span>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
              }}
            >
              {message.text}
            </ReactMarkdown>
            {!isUser && (message.incomplete || message.truncated) ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                This answer is partial or shortened. Ask a narrower follow-up if you need more detail.
              </Typography>
            ) : null}
            {!isUser && message.contextOmitted ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Only recent messages were included in this reply.
              </Typography>
            ) : null}
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
                Resume assistant · OpenAI
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
              AI can make mistakes. Recent messages go through this site’s chat service to OpenAI; a history copy is saved in this browser. Don’t share private information.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Ask about Zeke's experience"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={Boolean(clientError) || isLoading}
                inputRef={inputRef}
                inputProps={{ maxLength: MAX_MESSAGE_CHARS }}
                helperText={retryUntil ? 'Please wait before sending again.' : `${inputValue.length}/${MAX_MESSAGE_CHARS}`}
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
