let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");

// Gemini API details
const Api_Key = "AIzaSyBShypNz6OuGi-TC8tm2lsKzXknZoLnyQM";
const Api_Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Api_Key}`;

// ✅ Free CORS proxy (for testing)
const Proxy_Url = "https://cors-anywhere.herokuapp.com/";

let user = {
  message: null
};

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let RequestOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: user.message }]
        }
      ]
    })
  };

  try {
    // ✅ Pass through CORS proxy
    let response = await fetch(Proxy_Url + Api_Url, RequestOption);
    if (!response.ok) throw new Error("API request failed");

    let data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      let apiResponse = data.candidates[0].content.parts[0].text;
      text.innerHTML = apiResponse.replace(/\n/g, "<br>");
    } else {
      text.innerHTML = "⚠️ No response from AI. Please try again.";
    }
  } catch (error) {
    console.error(error);
    text.innerHTML = "⚠️ Error: Failed to fetch AI response.";
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(userMessage) {
  if (!userMessage.trim()) return;
  user.message = userMessage;

  // user message
  let html = `
    <img src="user.png" width="8%">
    <div class="user-chat-area">${user.message}</div>`;
  prompt.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  // ai message (loading)
  setTimeout(() => {
    let html = `
      <img src="ai.png" width="10%">
      <div class="ai-chat-area">
        <img src="loading.webp" width="50px">
      </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

// event listeners
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handlechatResponse(prompt.value);
  }
});

submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
});
