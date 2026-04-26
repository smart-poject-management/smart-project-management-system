import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Loader2 } from "lucide-react";
import {
  getMessages,
  sendMessage,
  receiveMessage,
} from "../../store/slices/chatSlice";
import socket from "../../socket";

const StudentChatTab = ({ supervisor }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const [text, setText] = useState("");

  const { messages, isLoading } = useSelector(state => state.chat);
  const { authUser } = useSelector(state => state.auth);

  // Supervisor (Teacher) ID nikaalna
  const teacherId = supervisor?._id || supervisor;

  useEffect(() => {
    if (teacherId) {
      // 1. Backend se messages fetch karein
      dispatch(getMessages(teacherId));

      // 2. Socket setup
      socket.connect();
      socket.emit("join", { userId: authUser._id });

      // 3. Listen for new messages
      socket.on("newMessage", msg => {
        // Sirf wahi message add karein jo is teacher se aaya ho
        if (msg.sender._id === teacherId || msg.receiver._id === teacherId) {
          dispatch(receiveMessage(msg));
        }
      });

      return () => {
        socket.off("newMessage");
      };
    }
  }, [teacherId, dispatch, authUser._id]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!text.trim()) return;

    dispatch(
      sendMessage({
        receiverId: teacherId,
        text: text.trim(),
      })
    );
    setText("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-20 italic">
            No messages yet. Start a conversation with your supervisor.
          </p>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender?._id === authUser._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border rounded-tl-none"
                  }`}
                >
                  <p>{msg.content || msg.text}</p>
                  <span className="text-[10px] opacity-70 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="bg-white p-4 border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default StudentChatTab;
