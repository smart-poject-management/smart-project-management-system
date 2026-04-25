import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessages,
  sendMessage,
  receiveMessage,
} from "../store/slices/chatSlice";

const ChatTab = ({ student }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.chat);

  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join", { userId: user._id });
  }, [user]);

  useEffect(() => {
    if (!user?._id || !student?._id) return;

    dispatch(
      getMessages({
        senderId: user._id,
        receiverId: student._id,
      })
    );
  }, [student, user, dispatch]);
  useEffect(() => {
    const handleReceive = (data) => {
      dispatch(
        receiveMessage({
          sender: data.senderId,
          receiver: data.receiverId,
          text: data.text,
          createdAt: data.createdAt,
        })
      );
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [dispatch]);

const handleSend = () => {
  if (!text.trim()) return;

  if (!user?._id || !student?._id) {
    console.log("Missing user or student:", { user, student });
    return;
  }

  const msg = text.trim();

  socket.emit("sendMessage", {
    senderId: user._id,
    receiverId: student._id,
    text: msg,
  });

  dispatch(
    sendMessage({
      sender: user._id,
      receiver: student._id,
      text: msg,
    })
  );

  setText("");
};

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">

      {/* HEADER */}
      <div className="bg-blue-600 text-white p-3 font-semibold">
        Chat
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((msg, i) => {
          const senderId =
            typeof msg.sender === "object"
              ? msg.sender._id
              : msg.sender;

          const isMe = senderId === user._id;

          return (
            <div
              key={i}
              className={`flex mb-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded max-w-[70%] ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 p-2 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Type message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatTab;