import { useState } from "react";

function Intnem() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !image) {
      return;
    }

    console.log("Message:", message);
    console.log("Image:", image);

    setMessage("");
    setImage(null);
  };

  return (
    <section className="intnem" id="intnem">
      <div className="intnem-header">
        <div className="intnem-brand">
          <div className="intnem-logo">✦</div>

          <div>
            <h2>Intnem</h2>
            <p>Your opportunity assistant</p>
          </div>
        </div>
      </div>

      <div className="intnem-options">
        <button onClick={() => setMessage("Check this opportunity for me.")}>
          Check an opportunity
        </button>

        <button onClick={() => setMessage("Analyze this screenshot.")}>
          Analyze a screenshot
        </button>

        <button onClick={() => setMessage("Verify this hackathon.")}>
          Verify a hackathon
        </button>

        <button onClick={() => setMessage("I have a question about an opportunity.")}>
          Ask a question
        </button>
      </div>

      {image && (
        <div className="intnem-image-preview">
          <span>{image.name}</span>

          <button onClick={() => setImage(null)}>
            Remove
          </button>
        </div>
      )}

      <div className="intnem-input-area">
        <label className="intnem-upload">
          📎
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>

        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Ask Intnem about an internship or hackathon..."
        />

        <button
          className="intnem-send"
          onClick={handleSend}
          disabled={!message.trim() && !image}
        >
          Send
        </button>
      </div>
    </section>
  );
}

export default Intnem;