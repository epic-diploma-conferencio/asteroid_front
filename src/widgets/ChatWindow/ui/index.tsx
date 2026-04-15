import type { UUID } from 'crypto';
import { useParams } from 'react-router-dom';

import { useChatMessages, useUserChats } from '@/entities/chat/api/chat.queries';
import { useUploadAttachment } from '@/entities/message/api/message.mutations';
import { useMessageSocket } from '@/entities/message/api/message.socket';
import { MessageList } from '@/entities/message/ui/MessageList';
import { useMe } from '@/entities/user';
import { useSendMessage } from '@/features/send-message/api/send-message.socket';
import { MessageInput } from '@/features/send-message/ui/MessageInput';
import { toFormData } from '@/shared/utils/to-formData';

import { ChatHeader } from './ChatHeader';

import './chat-window.scss';

export const ChatWindow = () => {
  const { chatId } = useParams<{ chatId: UUID }>();

  useMessageSocket();

  const { data, fetchNextPage, hasNextPage } = useChatMessages(chatId!, {});
  const { data: me } = useMe();
  const { data: chatsData } = useUserChats({ size: 20 });
  const sendMessage = useSendMessage();
  const { mutate: uploadAttachment } = useUploadAttachment();

  const messages = (data?.pages.flatMap((page) => page.items) ?? []).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const participant = chatsData?.pages
    .flatMap((p) => p.items)
    .find((c) => c.chatId === chatId)?.participant;

  return (
    <div className="chat-window">
      {participant && <ChatHeader participant={participant} />}
      <MessageList
        messages={messages}
        currentUserLogin={me?.login}
        onScrollTop={() => hasNextPage && fetchNextPage()}
      />
      <MessageInput
        onSendText={(text) => sendMessage(chatId!, text)}
        onSendFile={(file: File) =>
          uploadAttachment({ chatId: chatId!, data: { file: toFormData(file) } })
        }
      />
    </div>
  );
};
