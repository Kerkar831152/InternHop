import { useRef, useState } from "react";

import type { ChangeEvent, KeyboardEvent } from "react";

import type {
  IntnemMessage,
  IntnemPrompt,
} from "../../types/intnem";

function Intnem() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<IntnemMessage[]>([
    {
      id: 1,
      sender: "intnem",
      text:
        "Hey! I'm Intnem. Send me an internship, hackathon, or question and I'll help you understand it.",
    },
  ]);

  const [image, setImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const prompts: IntnemPrompt[] = [
    {
      title: "Check an opportunity",
      description: "Is this internship worth applying to?",
      icon: "⌕",
      message:
        "Check this opportunity for me and tell me what I should know.",
    },
    {
      title: "Analyze a screenshot",
      description: "Understand a poster or listing",
      icon: "▧",
      message:
        "Analyze this screenshot and explain the opportunity.",
    },
    {
      title: "Verify a hackathon",
      description: "Look for warning signals",
      icon: "✓",
      message:
        "Verify this hackathon and tell me if anything looks suspicious.",
    },
    {
      title: "Ask a question",
      description: "Understand requirements or deadlines",
      icon: "?",
      message:
        "I have a question about an opportunity.",
    },
  ];

  const handleSend = () => {
    const trimmed = message.trim();

    if (!trimmed && !image) {
      return;
    }

    const userMessage: IntnemMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed || "Analyze the attached image.",
    };

    setMessages((current) => [...current, userMessage]);

    setMessage("");

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "intnem",
          text:
            "I'm ready to analyze that. Once the backend is connected, I'll check the opportunity against available evidence and explain the result.",
        },
      ]);
    }, 500);

    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <section className="intnem-section" id="intnem">
      <div className="intnem-bg-orb orb-one"></div>
      <div className="intnem-bg-orb orb-two"></div>

      <div className="section-container">
        <div className="intnem-heading">
          <div>
            <span className="section-label">ASK INTNEM</span>

            <h2>
              Your opportunity
              <span> copilot.</span>
            </h2>

            <p>
              Ask questions, analyze screenshots, or understand
              whether an opportunity deserves your attention.
            </p>
          </div>

          <div className="intnem-heading-mark">
            <span>✦</span>
            <small>AI ASSISTANT</small>
          </div>
        </div>

        <div className="intnem-layout">
          <aside className="intnem-sidebar">
            <div className="intnem-sidebar-header">
              <div className="intnem-symbol">✦</div>

              <div>
                <strong>Intnem</strong>
                <span>
                  <i></i>
                  Online
                </span>
              </div>
            </div>

            <div className="prompt-title">
              START WITH
            </div>

            <div className="prompt-list">
              {prompts.map((prompt) => (
                <button
                  key={prompt.title}
                  className="prompt-card"
                  onClick={() => handlePrompt(prompt.message)}
                >
                  <span className="prompt-icon">
                    {prompt.icon}
                  </span>

                  <span>
                    <strong>{prompt.title}</strong>
                    <small>{prompt.description}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="intnem-sidebar-footer">
              <span>TIP</span>
              <p>
                You can upload a screenshot of a LinkedIn post,
                event poster, or internship listing.
              </p>
            </div>
          </aside>

          <div className="intnem-chat">
            <div className="chat-topbar">
              <div>
                <strong>Opportunity Assistant</strong>
                <span>Ask anything about an opportunity</span>
              </div>

              <div className="chat-status">
                <span></span>
                Ready
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={`chat-message ${
                    chatMessage.sender === "user"
                      ? "user-message"
                      : "intnem-message"
                  }`}
                >
                  {chatMessage.sender === "intnem" && (
                    <div className="chat-avatar">✦</div>
                  )}

                  <div className="message-bubble">
                    <p>{chatMessage.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {image && (
              <div className="chat-attachment">
                <span>▧</span>

                <div>
                  <strong>{image.name}</strong>
                  <small>Image attached</small>
                </div>

                <button
                  onClick={() => {
                    setImage(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div className="chat-input-area">
              <div className="chat-input">
                <input
                  type="text"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Intnem about an internship or hackathon..."
                />

                <button
                  className="chat-send"
                  onClick={handleSend}
                  disabled={!message.trim() && !image}
                >
                  →
                </button>
              </div>

              <div className="chat-input-footer">
                <label className="attach-button">
                  <span>＋</span>
                  Add screenshot

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>

                <span>
                  Intnem may make mistakes. Always review important
                  information.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intnem;