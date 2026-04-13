/**
 * Shared Type Definitions for ChatAja!
 */

export interface User {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  position?: string;
  last_active_at?: string;
}

export interface MessageMeta {
  file?: {
    url: string;
    name: string;
    mimetype: string;
    size?: number;
    path?: string;
  };
  mentions?: User[];
}

export interface FileAsset {
  url: string;
  name: string;
  type: string;
}

export interface MessageReaction {
  message_id: string;
  user_id: string;
  emoji: string;
  user?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: User;
  client_message_id?: string;
  reply_to_message_id?: string;
  reply_to_message?: {
    id: string;
    type: string;
    content: string;
    sender: { id: string; name: string; username?: string };
  };
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'sticker' | 'location' | 'contact' | 'system';
  content?: string;
  meta?: MessageMeta;
  status?: 'sent' | 'delivered' | 'read';
  edited_at?: string | null;
  created_at: string;
  reactions?: MessageReaction[];
  
  // UI Specific fields (Compatibility aliases)
  text: string; 
  time: string;
  replyTo?: {
    name: string;
    text: string;
    id?: string;
  };
  file?: FileAsset;
  isMine?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  senderName?: string;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user: User;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group' | 'project' | 'document' | 'doc_analyze' | 'time_machine';
  title: string | null;
  photo_url: string | null;
  pinned_at: string | null;
  is_muted: boolean;
  is_archived: boolean;
  recipient?: User;
  last_message?: Message | null;
  unread_count: number;
  is_online?: boolean;
}

// UI specific type for Chat List
export interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  isGroup?: boolean;
  avatar?: string;
  isPinned?: boolean;
}
