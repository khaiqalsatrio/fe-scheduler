# WebSocket (Socket.IO) Integration Guidance - BTA Chat API

This document describes how frontend clients integrate with the BTA Chat API realtime layer using **Socket.IO**.

> Updated: 2026-04-10

## 1. Getting Started

### 1.1 Connection Details
- **Transport**: Socket.IO (WebSocket + fallback polling)
- **Client library**: `socket.io-client` (v4.x)
- **Socket URL**: `https://<api-host>` (same host as REST, without `/v1`)
- **Default path**: `/socket.io` (Socket.IO default)

Example:
```ts
import { io } from 'socket.io-client';

const socket = io('https://dev-ows-api.telkom-digital.id', {
  transports: ['websocket'],
  auth: { token: 'Bearer <YOUR_JWT_TOKEN>' },
});
```

### 1.2 Authentication (Handshake)
Auth is required. The server reads the token from either:
- `handshake.auth.token` (recommended for browser clients)
- `handshake.headers.authorization` (usually Node.js clients)

Token formats accepted:
- `Bearer <jwt>`
- `<jwt>`

> [!IMPORTANT]
> In browsers, you generally cannot set arbitrary `Authorization` headers for WebSocket handshakes. Use `auth.token`.

### 1.3 Validation Rules (Strict)
Most commands are validated with strict DTO rules:
- Unknown fields are rejected (`forbidNonWhitelisted=true`).
- Types are coerced for some fields (e.g., booleans).

If validation fails, you will receive an `error` event.

---

## 2. Global Event Handling

### 2.1 Connection Lifecycle
```ts
socket.on('connect', () => console.log('connected', socket.id));
socket.on('disconnect', (reason) => console.log('disconnected', reason));
socket.on('connect_error', (err) => console.log('connect_error', err.message));
```

### 2.2 Error Handling
All server-side exceptions are pushed through the `error` event:
```ts
socket.on('error', (res) => {
  // { ok: false, event: "error", error: { message: string, statusCode?: number } }
  console.error(res.error.message, res.error.statusCode);
});
```

---

## 3. Response Envelopes & Patterns

### 3.1 ACK Response (`socketOk`)
Commands should be sent with an ACK callback:
```ts
socket.emit('conversations.get', null, (res) => {
  // { ok: true, event: string, data: any }
  if (!res?.ok) return;
  console.log(res.event, res.data);
});
```

Success envelope:
```json
{ "ok": true, "event": "some.broadcast.event", "data": { "..." : "..." } }
```

### 3.2 Errors (`socketError`)
Errors are emitted as a normal event (not as an ACK):
```json
{ "ok": false, "event": "error", "error": { "message": "...", "statusCode": 400 } }
```

> [!TIP]
> Some commands also broadcast updates (e.g., `message.new`) to other clients. Treat ACK as “your request accepted/processed”, and broadcasts as “state change”.

---

## 4. Rooms & Delivery Semantics

### 4.1 Rooms
- **Personal room**: after a successful authenticated connection, the server joins you to `user:<yourUserId>`.
- **Conversation room**: room name is the raw `conversationId` (UUID). Join it with `conversation.join`.

### 4.2 When to Join a Conversation
Many “state” events are delivered to the personal room (so you still receive them even if you didn’t join the conversation room), but **ephemeral events** rely on conversation rooms:
- `conversation.typing`
- `conversation.reading`

Recommended pattern:
- On opening a chat screen: `conversation.join`
- On leaving the screen: `conversation.leave`
- On reconnect: re-join currently active conversations

---

## 5. Event Catalog

### 5.1 Commands (Client → Server)
All commands below are sent via `socket.emit(event, payload, (res) => ...)`.

Notes:
- Responses come back via the ACK callback as `{ ok: true, event, data }`.
- The `event` in the ACK response is a string label (`res.event`). For most “fetch/list/search” commands there is **no separate broadcast**—the ACK callback is the response.

#### Conversations
| Event | Purpose | Payload | ACK `res.event` |
| --- | --- | --- | --- |
| `conversations.get` | List user conversations | `null` | `conversations.list` |
| `conversation.join` | Join a conversation room (UUID room) | `{ "conversationId": "uuid" }` | `conversation.joined` |
| `conversation.leave` | Leave a conversation room (does **not** remove membership) | `{ "conversationId": "uuid" }` | `conversation.left` |
| `conversation.create` | Create a conversation | `{ "type": "dm, group, project, document, doc_analyze, time_machine", "participantIds": ["uuid"], "title?": "string", "ai_prompt?": "string" }` | `conversation.created` |
| `conversation.update` | Update conversation metadata | `{ "conversationId": "uuid", "title?": "string", "avatar_url?": "string", "photo_url?": "string", "ai_prompt?": "string" }` | `conversation.updated` |
| `conversation.delete` | Delete & recreate conversation | `{ "conversationId": "uuid" }` | `conversation.recreated` |
| `conversation.pin` | Pin/unpin a conversation (per-user) | `{ "conversationId": "uuid", "isPinned": true }` | `conversation.pinned` |
| `conversation.mute` | Mute/unmute a conversation (per-user) | `{ "conversationId": "uuid", "isMuted": true }` | `conversation.muted` |
| `conversation.archive` | Archive/unarchive a conversation (per-user) | `{ "conversationId": "uuid", "isArchived": true }` | `conversation.archived` |
| `conversation.members.get` | List members | `{ "conversationId": "uuid" }` | `conversation.members.list` |
| `conversation.member.add` | Add member | `{ "conversationId": "uuid", "userId": "uuid" }` | `conversation.member.added` |
| `conversation.member.remove` | Remove member | `{ "conversationId": "uuid", "userId": "uuid" }` | `conversation.member.removed` |
| `conversation.member.role` | Update member role | `{ "conversationId": "uuid", "userId": "uuid", "role": "admin or member" }` | `conversation.member.role_updated` |
| `conversation.typing` | Typing indicator (ephemeral) | `{ "conversationId": "uuid" }` | `conversation.typing` |
| `conversation.reading` | Reading indicator (ephemeral) | `{ "conversationId": "uuid" }` | `conversation.reading` |

#### Messages
| Event | Purpose | Payload | ACK `res.event` |
| --- | --- | --- | --- |
| `message.send` | Send message to conversation | `{ "conversationId": "uuid", "clientMessageId": "string", "type": "text, image, video, file, voice, sticker, location, contact, system", "content?": "string", "replyToMessageId?": "uuid", "meta?": {} }` | `message.ack` |
| `message.dm` | Send direct message (creates/reuses DM conversation) | `{ "recipientId": "uuid", "clientMessageId": "string", "type": "text, image, video, file, voice, sticker, location, contact, system", "content?": "string", "replyToMessageId?": "uuid", "meta?": {} }` | `message.ack` |
| `messages.get` | List messages (pagination) | `{ "conversationId": "uuid", "limit?": 20, "cursor?": "2024-01-01T10:00:00.000Z" }` | `messages.list` |
| `messages.search` | Search messages within a conversation | `{ "conversationId": "uuid", "query": "string" }` | `messages.search.result` |
| `messages.search.global` | Search messages across conversations | `{ "query": "string" }` | `messages.search.global.result` |
| `messages.read_all` | Mark all messages as read (for current user) | `null` | `messages.read_all` |
| `message.delivered` | Mark message delivered | `{ "messageId": "uuid" }` | `message.delivered` |
| `message.read` | Mark read up to last message | `{ "conversationId": "uuid", "lastMessageId?": "uuid" }` | `message.read` |
| `message.edit` | Edit message | `{ "messageId": "uuid", "content": "string" }` | `message.updated` |
| `message.delete` | Delete message | `{ "messageId": "uuid", "forEveryone": true }` | `message.deleted` |
| `message.pin` | Pin/unpin message | `{ "messageId": "uuid", "isPinned": true }` | `message.pinned` |
| `message.reaction` | React/unreact | `{ "messageId": "uuid", "emoji": "👍" }` | `message.reaction` |
| `message.forward` | Forward a message to one or more conversations | `{ "messageId": "uuid", "conversationIds": ["uuid"] }` | `message.forwarded` |

#### Presence
| Event | Purpose | Payload | ACK `res.event` |
| --- | --- | --- | --- |
| `presence.heartbeat` | Keep online status alive (TTL-based) | `null` | `presence.pulse` |

> [!NOTE]
> `message.send` is rate-limited (per-user). When exceeded, the server emits `error` with status `429`.

### 5.2 Legacy Commands (Backward Compatibility)
These are accepted, but prefer the modern names:
- `join` → same as `conversation.join`
- `typing` → same as `conversation.typing`
- `heartbeat` → same as `presence.heartbeat`

### 5.3 Server Push Events (Server → Client)
These events are emitted by the server asynchronously. Subscribe with `socket.on(event, handler)`.

> [!NOTE]
> Results from “fetch/list/search” commands (e.g., `conversations.get`, `messages.get`) come through the ACK callback only.

#### Conversations
| Event | Meaning | Payload |
| --- | --- | --- |
| `conversation.created` | Conversation created/added | Conversation object |
| `conversation.updated` | Conversation updated | Conversation object |
| `conversation.deleted` | Conversation deleted and replaced | `{ "conversationId": "uuid", "replacedByConversationId": "uuid" }` |
| `conversation.pinned` | Pin state changed (per-user) | Conversation object |
| `conversation.muted` | Mute state changed (per-user) | Conversation object |
| `conversation.archived` | Archive state changed (per-user) | Conversation object |
| `conversation.member.added` | Member added | `{ "conversationId": "uuid", "member": { "...": "..." } }` |
| `conversation.member.removed` | Member removed | `{ "conversationId": "uuid", "userId": "uuid", "removedBy": "uuid" }` |
| `conversation.member.role_updated` | Member role updated | `{ "conversationId": "uuid", "member": { "...": "..." } }` |
| `conversation.typing` | Someone typing (room-scoped) | `{ "userId": "uuid", "conversationId": "uuid", "position": "string" }` |
| `conversation.reading` | Someone reading (room-scoped) | `{ "userId": "uuid", "conversationId": "uuid", "position": "string" }` |

#### Messages
| Event | Meaning | Payload |
| --- | --- | --- |
| `message.new` | New message | Message object (server also attaches `status` and `delivery_state`) |
| `message.ack` | ACK for a client message | `{ "clientMessageId": "string", "id?": "uuid", "status": "sent or failed", "timestamp?": "date", "error?": "string", "retryable?": true }` |
| `message.updated` | Message edited | Message object |
| `message.deleted` | Message deleted | `{ "messageId": "uuid", "conversationId": "uuid" }` |
| `message.pinned` | Pin state changed | `{ "messageId": "uuid", "isPinned": true, "conversationId": "uuid" }` |
| `message.reaction` | Reaction changed | Reaction object |
| `message.delivered` | Delivery receipt | `{ "messageId": "uuid", "userId": "uuid", "conversationId": "uuid" }` |
| `message.read` | Read receipt | `{ "conversationId": "uuid", "userId": "uuid", "lastMessageId?": "uuid" }` |
| `messages.read_all` | All read for current user | `{ "userId": "uuid" }` |
| `message.mention` | Mention notification | `{ "conversationId": "uuid", "messageId": "uuid", "userId": "uuid", "senderId": "uuid" }` |
| `ai.thinking` | AI is preparing a response | `{ "conversationId": "uuid", "userId": "00000000-0000-0000-0000-000000000000" }` |
| `ai.thinking.stop` | AI finished/stopped thinking | `{ "conversationId": "uuid", "userId": "00000000-0000-0000-0000-000000000000" }` |

#### Presence
| Event | Meaning | Payload |
| --- | --- | --- |
| `presence.update` | Online/offline change | `{ "userId": "uuid", "status": "online or offline", "position": "string" }` |

#### Errors
| Event | Meaning | Payload |
| --- | --- | --- |
| `error` | Any server error | `{ "ok": false, "event": "error", "error": { "message": "string", "statusCode?": 400 } }` |

---

## 6. Integration Examples

### 6.1 Join Room on Open Chat
```ts
socket.emit('conversation.join', { conversationId }, (res) => {
  if (res?.ok) console.log('joined', res.data.conversationId);
});
```

### 6.2 Send Message with Optimistic UI + ACK
```ts
socket.emit(
  'message.send',
  { conversationId, clientMessageId, type: 'text', content: 'Hello' },
  (res) => {
    if (!res?.ok) return;
    // res.event === "message.ack"
    // res.data: { clientMessageId, id, conversationId, status, timestamp }
  },
);

socket.on('message.ack', (ack) => {
  // Sent/failed status updates can also arrive via this broadcast.
});
```

### 6.3 Typing Indicator
```ts
socket.emit('conversation.typing', { conversationId });
socket.on('conversation.typing', (data) => {
  // { userId, conversationId, position }
});
```

### 6.4 Heartbeat (Recommended)
Send every ~30–45 seconds to keep presence alive (server TTL is 60 seconds):
```ts
setInterval(() => socket.emit('presence.heartbeat'), 30_000);
```

### 6.5 Fetch Messages (ACK-only)
```ts
socket.emit('messages.get', { conversationId, limit: 20 }, (res) => {
  if (!res?.ok) return;
  // res.event === "messages.list"
  // res.data: paginated list (see REST docs for shape)
});
```

---

## 7. Troubleshooting

### 7.1 Common Errors
- `Unauthorized` (401): missing/invalid JWT in handshake (`auth.token`).
- `You are not a member of this conversation` (403): trying to join/send/typing in a conversation you are not a member of.
- Validation errors (400): payload shape is wrong (unknown fields, wrong UUID format, missing required fields).
- Rate limit (429): too many `message.send` in a short time.

### 7.2 “I don’t receive typing/reading”
- Make sure both sides called `conversation.join` for the active conversation.
- The sender does **not** receive their own `conversation.typing` / `conversation.reading` broadcast (it is sent to “others in the room”).

### 7.3 “My ACK callback never fires”
- On server errors, the gateway emits the `error` event and may not invoke the ACK callback.
- For events with no payload, pass `null` when you want an ACK: `socket.emit('conversations.get', null, cb)`.
