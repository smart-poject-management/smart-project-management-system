import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages, sendMessage, receiveMessage } from "../../store/slices/teacherSlice";
import { Send, Paperclip } from "lucide-react";
import socket from "../../socket";

const AVATAR_COLORS = [
  "#4F46E5", "#7C3AED", "#DB2777", "#059669",
  "#D97706", "#DC2626", "#0284C7", "#65A30D",
];

const avatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const Avatar = ({ name, size = 48 }) => (
  <div
    style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.35 }}
    className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 tracking-wide"
  >
    {getInitials(name)}
  </div>
);

const ChatTeacherTab = ({ student }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const allMessages = useSelector((state) => state.teacher.messages ?? []);

  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  const messages = useMemo(() => {
    if (!user?._id || !student?._id) return [];

    return allMessages.filter((msg) => {
      const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
      const receiverId = typeof msg.receiver === "object" ? msg.receiver?._id : msg.receiver;

      return (
        (senderId === user._id && receiverId === student._id) ||
        (senderId === student._id && receiverId === user._id)
      );
    });
  }, [allMessages, user, student]);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join", { userId: user._id });
  }, [user]);

  useEffect(() => {
    if (!user?._id || !student?._id) return;
    dispatch(getMessages({ senderId: user._id, receiverId: student._id }));
  }, [student, user, dispatch]);

  useEffect(() => {
    const handleReceive = (data) => {
      console.log("📩 RECEIVED:", data);

      if (data.senderId === user?._id) return;

      dispatch(
        receiveMessage({
          sender: data.senderId,
          receiver: data.receiverId,
          text: data.message, // Backend uses 'text'
          createdAt: new Date().toISOString(),
        })
      );
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [dispatch, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !user?._id || !student?._id) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    // Socket emit
    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: student._id,
      message: msgText, // Socket uses 'message'
    });

    dispatch(
      sendMessage({
        sender: user._id,
        receiver: student._id,
        message: msgText,
      })
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <Avatar name={student.name} size={40} />
        <div>
          <h3 className="font-semibold text-slate-800">{student.name}</h3>
          <p className="text-xs text-slate-400">{student.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-8">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg, idx) => {
          const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
          const isTeacher = senderId === user?._id;
          const messageText = msg.text || msg.message;

          return (
            <div key={msg._id || idx} className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  isTeacher
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{messageText}</p>
                <p className={`text-xs mt-1 ${isTeacher ? "text-indigo-200" : "text-slate-400"}`}>
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatTeacherTab;


