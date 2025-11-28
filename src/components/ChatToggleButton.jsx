import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Tooltip } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(106,160,255,0.65); }
  70% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(106,160,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(106,160,255,0); }
`;

const Bubble = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '110%',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  boxShadow: theme.shadows[4],
  fontSize: '0.85rem',
  whiteSpace: 'normal',
  maxWidth: 220,
  zIndex: 10,
}));

function ChatToggleButton({ isOpen, onClick }) {
  const label = isOpen ? 'Close AI chat' : 'Open AI chat';
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (isOpen || hasAnimated) return;
    // Trigger once when the button first appears
    setShowBubble(true);
    setHasAnimated(true);
    const timer = setTimeout(() => setShowBubble(false), 2200);
    return () => clearTimeout(timer);
  }, [isOpen, hasAnimated]);

  return (
    <Tooltip title={label}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {showBubble && (
          <Bubble sx={{ display: { xs: 'none', sm: 'block' } }}>
            Chat with Gemini about Zeke!
          </Bubble>
        )}
        <IconButton
          aria-label={label}
          color="primary"
          onClick={onClick}
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            animation: !isOpen && !hasAnimated ? `${pulse} 1.8s ease-out 0s 2` : 'none',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default ChatToggleButton;
