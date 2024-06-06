import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./App.module.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim()) {
      const newMessage = { text: inputValue, sender: "user", response: "" };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue("");
      setIsStreaming(true);

      try {
        const response = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputValue }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          receivedMessage += decoder.decode(value);
          const messagesFromServer = receivedMessage.split("\n");
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1].response = messagesFromServer[0];
            if (messagesFromServer.length > 1) {
              for (let i = 1; i < messagesFromServer.length; i++) {
                updatedMessages.push({ text: "", sender: "bot", response: messagesFromServer[i] });
              }
            }
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsStreaming(false);
      }
    }
  }, [inputValue]);

  const handleClearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSendMessage]);

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.messageList}>
          {messages.map((message, index) => (
            <div key={index} className={styles.messageContainer}>
              <div
                className={`${styles.message} ${
                  message.sender === "user" ? styles.userMessage : styles.botMessage
                }`}
              >
                {message.text}
              </div>
              {message.sender === "user" && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  {message.response}
                </div>
              )}
            </div>
          ))}
          {isStreaming && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              {messages[messages.length - 1].response}
            </div>
          )}
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className={styles.input}
          />
          <button onClick={handleSendMessage} className={styles.sendButton}>
            Send
          </button>
          <button onClick={handleClearChat} className={styles.clearButton}>
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
