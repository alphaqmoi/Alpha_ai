# Alpha AI UI Features & Instructions

## Overview
Alpha AI provides a modern, interactive web interface for autonomous trading, chat, and AI-powered productivity. The UI is designed for reliability, user feedback, and seamless integration with the Qmoi model (via HuggingFace or local fallback).

---

## Main Features

### 1. Chat Interface (`/components/chat-interface.tsx`)
- **Conversational AI**: Natural language chat with Alpha AI.
- **Thinking Process Display**: Shows step-by-step AI reasoning for transparency.
- **Speech Recognition**: Voice-to-text input using browser APIs.
- **Feedback Buttons**: Users can rate AI responses (👍/👎).
- **File Upload**: Attach files to chat (future extensibility).
- **Persistent Conversation**: Chat history saved in localStorage.
- **Error Handling**: User-friendly error messages for speech and chat issues.
- **Clear Chat**: One-click reset of conversation.

### 2. Trading Interface (`/components/trading-interface.tsx`)
- **Bitget Integration**: Connect and trade with Bitget API credentials.
- **Auto-Trading**: Toggle background trading with AI model.
- **Manual Trading**: Place trades directly from the UI.
- **Learning Progress**: Visual progress bar for AI model training.
- **Trading History**: Persistent, color-coded trade log (profit/loss).
- **Balance & Asset Value**: Real-time display of account balance and total asset value.
- **Connection Status**: Visual badge for Bitget connection state.
- **Error & Success Alerts**: Prominent, color-coded feedback for all actions.
- **Task Manager**: Inline task progress and status for trading actions.

### 3. Model Status & Training (`/components/model-status.tsx`, `/components/training-status.tsx`)
- **Model Ready Indicator**: Shows if Qmoi/AI model is loaded and ready.
- **Preload Button**: Manually trigger model loading.
- **Training Progress**: Visualize ongoing or completed training.
- **Continuous Learning**: UI reflects if model is in continuous learning mode.

### 4. Voice & Accessibility
- **Voice Model Selection**: Choose from multiple voice options for AI responses.
- **Voice Recorder**: Record and play back user voice input.
- **Accessible Design**: Keyboard navigation, color contrast, and responsive layout.

### 5. Status & Monitoring
- **AI Status Monitor**: Real-time AI/trading/model status dashboard.
- **Backup & Restore**: UI for managing data and model backups.
- **API Capabilities**: Visual summary of all available APIs and endpoints.

---

## Usage Instructions

### Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Chatting with Alpha AI
- Type or use the microphone to send a message.
- Watch the "thinking process" for transparency.
- Give feedback on responses.
- Clear chat anytime.

### Trading
- Enter your Bitget API credentials or use the default.
- Connect to Bitget and view your balance.
- Start auto-trading (requires model learning threshold).
- Place manual trades and view results instantly.
- Monitor trading history and status.

### Model & Training
- Check model status on the dashboard.
- Preload or retrain the model as needed.
- Upload training data for continuous improvement.

### Voice & Accessibility
- Select your preferred voice in settings.
- Use voice input for hands-free operation.

---

## Error Handling & Fallbacks
- If the Qmoi HuggingFace API is not configured, the system falls back to OpenAI (chat) or local Python (trading).
- All errors are shown in the UI with clear, actionable messages.

---

## Advanced Features
- **Background Trading**: Trades can execute in the background, even if the UI is closed (with service worker support).
- **Persistent State**: Most user data and settings are saved locally for seamless experience.
- **Modular UI**: All features are componentized for easy extension and customization.

---

## For Developers
- All UI code is in `/components/`.
- API endpoints are in `/app/api/`.
- Model logic is in `/lib/` and `/Qmoi/`.
- See the main `README.md` for backend/model integration and HuggingFace setup.

---

For any issues or feature requests, please open an issue or pull request on GitHub.
