import ChatInput from './chat-input';
import ChatPanel from './chat-panel';

const ChatBoard = () => {
  return (
    <div className="rounded-md border p-2 h-[700px] flex flex-col w-full">
      {/* Messages container - scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages will go here */}
        <ChatPanel />
      </div>

      {/* Chat input - fixed at bottom */}
      <div className="mt-2">
        {/* Chat input form will go here */}
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatBoard;
