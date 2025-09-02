let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imageInput=document.querySelector("#imageInput")

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

const Api_Key = "AIzaSyABuxQVqzXl1aZaGJJuP3yDxvp5ipEUoYo"

let user={
    message:null,
    imageBase64:null,
    mimeType:null
}
 
async function generateResponse(aiChatBox) {
    let text=aiChatBox.querySelector(".ai-chat-area")

    let parts = [{ "text": user.message }]
    if(user.imageBase64){
        parts.push({
            "inline_data": {
                "mime_type": user.mimeType,
                "data": user.imageBase64
            }
        })
    }

    let RequestOption={
        method:"POST",
        headers:{
            "Content-Type" : "application/json",
            "X-goog-api-key" : Api_Key
        },
        body:JSON.stringify({
            "contents":[{ "parts": parts }]
        })
    }

    try {
        let response= await fetch(Api_Url,RequestOption)
        if(!response.ok) throw new Error("API request failed")
        let data=await response.json()

        if(data.candidates && data.candidates[0].content.parts[0].text){
            let apiResponse=data.candidates[0].content.parts[0].text
            text.innerHTML=apiResponse
        } else {
            text.innerHTML="⚠️ No response from AI. Please try again."
        }
    }
    catch(error){
        console.error(error)
        text.innerHTML="⚠️ Error: Failed to fetch AI response."
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        // reset image after sending
        user.imageBase64 = null
        user.mimeType = null
    }
}

function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}

function handlechatResponse(userMessage){
    if(!userMessage.trim() && !user.imageBase64) return
    user.message=userMessage

    let html=`<img src="user.png" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.imageBase64 ? `<img src="data:${user.mimeType};base64,${user.imageBase64}" width="100">` : ""}
    </div>`

    prompt.value=""
    let userChatBox=createChatBox(html,"user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

    setTimeout(()=>{
        let html=`<img src="ai.png" width="10%">
        <div class="ai-chat-area">
        <img src="loading.webp" width="50px">
        </div>`
        let aiChatBox=createChatBox(html,"ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)
    },600)
}

// 📌 Enter दबाने से message भेजो
prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)
    }
})

// 📌 Button से message भेजो
submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})

// 📌 Image upload handler
imageInput.addEventListener("change",()=>{
    const file=imageInput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
        user.mimeType=file.type
        user.imageBase64=e.target.result.split(",")[1] // सिर्फ base64 part
    }
    reader.readAsDataURL(file)
})
