import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  timestamp: number;
  message: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const wsRef = useRef<any>(null); // WebSocketStream instance
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    connect();
    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connect = async () => {
    try {
      setStatus('connecting');
      // @ts-ignore - WebSocketStream is experimental
      if (typeof WebSocketStream === 'undefined') {
        console.error("WebSocketStream is not supported in this browser.");
        alert("WebSocketStream is not supported! Please use Chrome/Edge or enable experimental web platform features.");
        setStatus('disconnected');
        return;
      }

      // @ts-ignore
      const wss = new WebSocketStream('ws://localhost:8080');
      wsRef.current = wss;

      const { readable, writable } = await wss.connection;
      setStatus('connected');

      writerRef.current = writable.getWriter();
      readerRef.current = readable.getReader();

      readMessages(); // Start reading loop
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus('disconnected');
    }
  };

  const readMessages = async () => {
    const reader = readerRef.current;
    if (!reader) return;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Value is a string (or whatever the protocol is, simple text here)
        // We assume JSON for structured data, or just text.
        // The server echo example was basic text piping.
        // Let's assume we send JSON to match the metadata requirement.
        try {
          const data = typeof value === 'string' ? JSON.parse(value) : value;
          setMessages((prev) => [...prev, data]);
        } catch (e) {
          // If not JSON, treat as raw text
          setMessages((prev) => [...prev, { timestamp: Date.now(), message: String(value) }]);
        }
      }
    } catch (error) {
      console.error("Read error:", error);
    } finally {
      setStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !writerRef.current) return;

    const msg: Message = {
      timestamp: Date.now(),
      message: inputValue.trim()
    };

    try {
      // We send stringified JSON
      await writerRef.current.write(JSON.stringify(msg));
      // Optimistically add to UI? Or wait for echo? 
      // User request implies "messenger", usually send->echo->display or send->display.
      // Since it's an echo server in the current plan, we'll wait for the echo to display it?
      // Or display it immediately as "me".
      // Let's rely on the echo for now to prove round-trip.
      setInputValue('');
    } catch (error) {
      console.error("Write error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md h-[80vh] flex flex-col shadow-lg border-2">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="flex justify-between items-center">
            <span>WebSocketStream Messenger</span>
            <span className={`text-xs px-2 py-1 rounded-full ${status === 'connected' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="flex flex-col bg-accent/50 p-3 rounded-lg max-w-[85%] ml-auto w-full">
                  <span className="text-sm">{msg.message}</span>
                  <span className="text-[10px] text-muted-foreground self-end mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                  No messages yet. Say hello!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t bg-background">
          <div className="flex w-full space-x-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== 'connected'}
            />
            <Button onClick={sendMessage} disabled={status !== 'connected'}>
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
