import { useEffect, useState } from "react";
import socket from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { getMessages, sendMessage } from "../store/slices/teacherSlice";

const ChatTab = ({ student }) => {
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { messages } = useSelector(state => state.teacher);

  const [text, setText] = useState("");

  // 🔌 JOIN SOCKET
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", { userId: user._id });
  }, [user]);

  // 📩 FETCH MESSAGES
  useEffect(() => {
    if (!user?._id || !student?._id) return;

    dispatch(
      getMessages({
        senderId: user._id,
        receiverId: student._id,
      })
    );
  }, [student, user, dispatch]);

  // 📥 RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receiveMessage", data => {
      dispatch(
        sendMessage.fulfilled({
          sender: data.senderId,
          message: data.message,
        })
      );
    });

    return () => socket.off("receiveMessage");
  }, [dispatch]);

  // 📤 SEND MESSAGE
  const handleSend = () => {
    if (!text.trim() || !user?._id || !student?._id) return;

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: selectedUser._id,
      message,
    });

    dispatch(
      sendMessage({
        sender: user._id,
        receiver: student._id,
        message: text,
      })
    );

    setText("");
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto border p-3 mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.sender === user._id || msg.senderId === user._id
                ? "text-right"
                : "text-left"
            }`}
          >
            <span className="bg-blue-100 px-3 py-1 rounded">{msg.message}</span>
          </div>
        ))}
      </div>

      {/* ✍️ INPUT */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Type message..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatTab;
