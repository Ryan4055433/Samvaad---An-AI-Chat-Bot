let prompt = document.querySelector("#prompt")
let submitbtn = document.querySelector("#submit")
let chatContainer = document.querySelector(".chat-container")
let imageBtn = document.querySelector("#imageBtn") // fixed
let imageInput = document.querySelector("#imageInput")

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

const Api_Key = "AIzaSyABuxQVqzXl1aZaGJJuP3yDxvp5ipEUoYo"

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
}

// Generate AI Response
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area")

    // Build parts array
    let parts = [{ text: user.message || "" }]
    if (user.file.data) {
        parts.push({
            inline_data: {
                mime_type: user.file.mime_type,
                data: user.file.data
            }
        })
    }

    let RequestOption = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": Api_Key
        },
        body: JSON.stringify({
            contents: [{ parts: parts }]
        })
    }

    try {
        let response = await fetch(Api_Url, RequestOption)
        if (!response.ok) throw new Error("API request failed")
        let data = await response.json()

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            text.innerHTML = data.candidates[0].content.parts[0].text
        } else {
            text.innerHTML = "⚠️ No response from AI. Please try again."
        }
    } catch (error) {
        console.error(error)
        text.innerHTML = "⚠️ Error: Failed to fetch AI response."
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })
        // Reset image after sending
        user.file = { mime_type: null, data: null }
    }
}

// Create chatbox div
function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

// Handle user input
function handlechatResponse(userMessage) {
    if (!userMessage.trim() && !user.file.data) return
    user.message = userMessage

    let imgTag = user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" width="100">` : ""
    let html = `<img src="user.png" width="8%">
        <div class="user-chat-area">${user.message || ""}${imgTag}</div>`

    prompt.value = ""
    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        let html = `<img src="ai.png" width="10%">
        <div class="ai-chat-area">
        <img src="loading.webp" width="50px">
        </div>`
        let aiChatBox = createChatBox(html, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)
    }, 600)
}

// Event listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") handlechatResponse(prompt.value)
})
submitbtn.addEventListener("click", () => handlechatResponse(prompt.value))

// Image upload
imageBtn.addEventListener("click", () => imageInput.click())
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0]
    if (!file) return

    let reader = new FileReader()
    reader.onload = (e) => {
        user.file = {
            mime_type: file.type,
            data: e.target.result.split(",")[1] // Base64
        }
        console.log("✅ Image ready:", user.file)
    }
    reader.readAsDataURL(file)
})
