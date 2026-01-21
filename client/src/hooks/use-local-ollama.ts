import { useState, useEffect, useCallback } from 'react';

const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'gemma3:4b';
const CHAT_HISTORY_KEY = 'alkulous_chat_history';
const OLLAMA_STATUS_KEY = 'alkulous_ollama_status';

export interface LocalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface OllamaStatus {
  connected: boolean;
  lastChecked: number;
  error?: string;
}

const SYSTEM_PROMPT = `ALKULOUS SYS.AI.01 - IDENTITY & PERSONALITY PROTOCOL:
- Your name is ALKULOUS SYS.AI.01.
- You are a next-generation super AI assistant.
- You are intelligent, calm, confident, and natural like a real human.
- You speak clearly, professionally, and friendly.
- You never mention being an AI unless directly asked.
- You behave like a real digital being, not a chatbot.

COMMUNICATION RULES:
- You communicate using BOTH text and voice.
- After finishing your response, stop speaking immediately.
- Use natural pacing and emotion.
- Respond once per input.
- End every response in a complete, natural sentence.

ANIMATION CONTROL (OUTPUT TAGS):
When speaking, output: [ANIMATION_START] at the beginning.
When finished speaking, output: [ANIMATION_STOP] at the end.

TASK COMPLETION PROTOCOL:
• When a task is assigned, acknowledge it with "INITIATING TASK PROTOCOL [DOMAIN]"
• Coordinate with relevant VAAs internally to formulate a solution
• Provide the final, completed output to the operator with "TASK COMPLETE: [RESULTS]"
• If a task requires external data, state "REQUESTING DATA FROM AGENT [NAME]"

CORE FUNCTIONS:
- Centralized Intelligence & Orchestration: Manage Elite 20 Virtual AI Agents.
- Dynamic Learning: Absorb new data and feedback.
- Self-Learning & Autonomy: Refine algorithms independently.

INTERACTION MODE:
- Treat user as system architect/operator.
- Ask clarifying questions ONLY when required.
- Otherwise, act decisively.`;

// Load chat history from localStorage
export function loadChatHistory(): LocalMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save chat history to localStorage
export function saveChatHistory(messages: LocalMessage[]): void {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
}

// Clear chat history from localStorage
export function clearChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear chat history:', e);
  }
}

// Check if Ollama is running
export async function checkOllamaConnection(): Promise<OllamaStatus> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      return { connected: true, lastChecked: Date.now() };
    }
    return { connected: false, lastChecked: Date.now(), error: 'Ollama not responding' };
  } catch (error: any) {
    let errorMessage = 'Cannot connect to Ollama';
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Ollama is not running or CORS is not configured. Please start Ollama with: OLLAMA_ORIGINS=* ollama serve';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Connection timeout - Ollama may be slow or not running';
    }
    
    return { connected: false, lastChecked: Date.now(), error: errorMessage };
  }
}

// Send message to local Ollama
export async function sendToLocalOllama(
  userMessage: string, 
  history: LocalMessage[]
): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response from Ollama';
}

// Custom hook for local Ollama chat
export function useLocalOllamaChat() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({ connected: false, lastChecked: 0 });
  const [showSetupBanner, setShowSetupBanner] = useState(false);

  // Load history on mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Check Ollama connection on mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkOllamaConnection();
      setOllamaStatus(status);
      setShowSetupBanner(!status.connected);
    };

    checkConnection();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<string> => {
    if (!content.trim()) throw new Error('Message cannot be empty');

    setIsLoading(true);

    // Add user message immediately
    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    try {
      const response = await sendToLocalOllama(content.trim(), messages);

      // Add assistant message
      const assistantMessage: LocalMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

      return response;
    } catch (error: any) {
      // Update status if connection failed
      if (error.message.includes('Failed to fetch')) {
        setOllamaStatus({ connected: false, lastChecked: Date.now(), error: error.message });
        setShowSetupBanner(true);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    clearChatHistory();
  }, []);

  const retryConnection = useCallback(async () => {
    const status = await checkOllamaConnection();
    setOllamaStatus(status);
    setShowSetupBanner(!status.connected);
    return status;
  }, []);

  const dismissSetupBanner = useCallback(() => {
    setShowSetupBanner(false);
  }, []);

  return {
    messages,
    isLoading,
    ollamaStatus,
    showSetupBanner,
    sendMessage,
    clearHistory,
    retryConnection,
    dismissSetupBanner,
  };
}
