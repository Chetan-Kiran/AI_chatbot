import React, { useEffect, useState } from 'react'

function AI_Bot() {
  
  const [input, setinput] = useState("");
  const [message, setmessage] = useState(() => {
    const savedMessages = localStorage.getItem("chat-messages");
    return savedMessages? JSON.parse(savedMessages) : [];
  });
  const [loading, setloading] = useState(false);
  
  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(message));
  }, [message]);

  const callAI = async (usermessage) => {
    try{
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b:free",
              messages: [{ role: "user", content: usermessage }],
            }),
          }
        );
        const data = await response.json();
        console.log(data);
        return data.choices?.[0]?.message?.content || "⚠️ No reply from AI.";
    }catch(err){
        return "⚠️ Error connecting to AI.";
    }
  }

  const handelmessage = async() => {
    if(!input.trim()) return;

    const Newmessage = {sender : "user", text:input}
    setmessage((prev) => [...prev, Newmessage]);
    setinput("");
    setloading(true);

    const aiReply = await callAI(input);
    setmessage((prev) => [...prev, {sender: "ai", text: aiReply}]);
    console.log(aiReply);
    setloading(false);
  }

  const resetchat = () =>{
    setmessage([]);
    localStorage.removeItem("chat-messages");
  }

  return (
    <div>
        <div className='container'>
            <div className='chat-box'>
                {message.map((msg, idx) => (
                    <div key={idx} 
                    className={`chat-mesg ${msg.sender === "user" ? "user" : "ai"}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && <div className='chat-mesg ai'>Typing...</div>}
            </div>

            <div className='input-container'>
                <input type="text" 
                value={input}
                onChange={(e) => setinput(e.target.value)}
                placeholder='Type your message here...'
                onKeyDown={(e) => e.key === "Enter" && handelmessage()} />

                <button onClick={handelmessage} className='ai_btn' disabled={loading}>Send</button>
                <button onClick={resetchat}>Reset chat</button>
            </div>
        </div>
    </div>
  )
}

export default AI_Bot