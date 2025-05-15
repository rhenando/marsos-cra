// File: ChatMessages.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { Send, Paperclip, FileText, Image, User } from "react-feather";
import { useTranslation } from "react-i18next";

const ChatMessages = ({ messages, onSendMessage }) => {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState(currentUser?.displayName || "You");
  const [showAttachments, setShowAttachments] = useState(false);
  const chatBoxRef = useRef(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!currentUser?.displayName) {
      const fetchUserName = async () => {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserName(userSnap.data().name || "You");
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
        }
      };
      fetchUserName();
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, userName);
      setNewMessage("");
    }
  };

  return (
    <div className='d-flex flex-column h-100'>
      {/* Chat Messages */}
      <div
        ref={chatBoxRef}
        className='px-3 py-2'
        style={{
          backgroundColor: "#f0f2f5",
          overflowY: "auto",
          height: "50vh",
          maxHeight: "50vh",
          borderRadius: "6px",
        }}
      >
        {messages.length === 0 ? (
          <p className='text-center text-muted small mt-4'>
            {t("chat.noMessages")}
          </p>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUser?.uid;
            return (
              <div
                key={index}
                className={`d-flex mb-2 ${
                  isCurrentUser
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className='px-3 py-2 rounded-3 shadow-sm'
                  style={{
                    backgroundColor: isCurrentUser ? "#d9fdd3" : "#ffffff",
                    color: "#111",
                    maxWidth: "75%",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <div>{msg.message}</div>
                  <div
                    className='text-end mt-1'
                    style={{
                      fontSize: "0.7rem",
                      color: "#555",
                    }}
                  >
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleString(i18n.language, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Section */}
      <div
        className='border-top px-3 py-2 bg-white'
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Attachment Icon */}
        <div className='position-relative me-2'>
          <button
            className='btn p-0'
            style={{ border: "none", background: "transparent" }}
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Paperclip size={20} color='#2c6449' />
          </button>

          {showAttachments && (
            <div
              className='position-absolute d-flex flex-column gap-2 p-2 shadow rounded'
              style={{
                top: "-140px",
                left: "-10px",
                background: "#fff",
                zIndex: 100,
                width: "140px",
              }}
            >
              <button className='btn btn-light d-flex align-items-center gap-2 p-2'>
                <Image size={16} color='#2c6449' />
                <span className='small'>{t("chat.attachPhoto")}</span>
              </button>
              <button className='btn btn-light d-flex align-items-center gap-2 p-2'>
                <FileText size={16} color='#2c6449' />
                <span className='small'>{t("chat.attachDocument")}</span>
              </button>
              <button className='btn btn-light d-flex align-items-center gap-2 p-2'>
                <User size={16} color='#2c6449' />
                <span className='small'>{t("chat.attachContact")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Single-line input with rounded style */}
        <input
          type='text'
          className='form-control border-0 me-2'
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: "20px",
            fontSize: "0.875rem",
            padding: "0.5rem 1rem",
          }}
          placeholder={t("chat.placeholder")}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend();
              e.preventDefault();
            }
          }}
        />

        {/* Send Button */}
        <button
          className='btn p-0 d-flex align-items-center justify-content-center'
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
          }}
          onClick={handleSend}
        >
          <Send size={20} color='#2c6449' />
        </button>
      </div>
    </div>
  );
};

export default ChatMessages;
