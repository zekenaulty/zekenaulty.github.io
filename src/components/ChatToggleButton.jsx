import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip } from '@mui/material';

function ChatToggleButton({ isOpen, onClick }) {
  const label = isOpen ? 'Close AI chat' : 'Open AI chat';

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        color="primary"
        onClick={onClick}
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default ChatToggleButton;
