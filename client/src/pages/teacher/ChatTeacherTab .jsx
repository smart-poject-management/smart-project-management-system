import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, User, Loader2 } from "lucide-react";
import {
  getMessages,
  sendMessage,
  receiveMessage,
} from "../../store/slices/chatSlice";
import socket from "../../socket";
const ChatTeacherTab = ({ student }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const [text, setText] = useState("");
  const { messages, isLoading } = useSelector(state => state.chat);
  const { authUser } = useSelector(state => state.auth);

  useEffect(() => {
    if (student?._id) {
      dispatch(getMessages(student._id));
      socket.emit("join", { userId: authUser._id });
      const handleNewMessage = msg => {
        if (msg.sender._id === student._id || msg.receiver._id === student._id) {
          dispatch(receiveMessage(msg));
        }
      };
      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [student?._id, dispatch, authUser._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!text.trim()) return;

    dispatch(
      sendMessage({
        receiverId: student._id,
        text: text.trim(),
      })
    );

    setText("");
  };

  return (
    <div className="flex flex-col h-[550px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{student?.name}</p>
            <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Active Chat
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F1F5F9]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm italic">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender?._id === authUser._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1.5 opacity-60 font-medium ${isMe ? "text-right" : "text-left"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center"
      >
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your message..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl 
                     transition-all shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatTeacherTab;