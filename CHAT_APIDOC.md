# Chat API Documentation - BTA Chat API

This document provides a comprehensive reference for the Chat API, covering both RESTful endpoints and real-time WebSocket communication.

> Updated: 2026-04-10

## 1. Overview
The Chat API facilitates real-time messaging, group management, and AI-powered interactions.

- Base URL: `https://dev-ows-api.telkom-digital.id/v1`
- WebSocket URL: `https://dev-ows-api.telkom-digital.id`
- REST Versioning: All REST routes are prefixed with `/v1`.
- Time format: ISO 8601 timestamps (example: `2024-01-01T10:00:00Z`).

## 2. Authentication
All requests (HTTP and WebSocket) require a valid JWT token.

### 2.1 HTTP Authentication
Include the token in the `Authorization` header:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### 2.2 WebSocket Authentication
Pass the token during the Socket.io handshake:
```javascript
import { io } from "socket.io-client";

const socket = io("https://dev-ows-api.telkom-digital.id", {
  auth: { token: "Bearer <YOUR_JWT_TOKEN>" }
});
```

Notes:
- Token sources supported by server: `handshake.auth.token` or `handshake.headers.authorization`.
- Token formats: `Bearer <jwt>` or `<jwt>`.
- For browser clients, prefer `auth.token` (setting `Authorization` headers is usually not possible for WS handshakes).

## 3. Conventions and Rules

### 3.1 IDs and Types
- All IDs are UUIDs.
- Conversation types in the system: `dm`, `group`, `project`, `document`, `doc_analyze`, `time_machine`, `knowledge`.
- The Create Conversation endpoint accepts: `dm`, `group`, `project`, `document`, `doc_analyze`, `time_machine`.

### 3.2 Content Types
- `application/json` for JSON requests.
- `multipart/form-data` for endpoints that support file uploads.

### 3.3 Idempotency
- `clientMessageId` is required for sending messages.
- Uniqueness is enforced per sender (`sender_id` + `client_message_id`).
- If the same `clientMessageId` is sent again, the existing message is returned.

### 3.4 Mentions
- Mentions can be provided via `@username` inside `content` or via `meta.mentions`.
- The server validates mentions against conversation members.
- The server normalizes mentions into `meta.mentions` as:
```json
[{ "id": "uuid", "name": "User Name", "username": "user" }]
```

### 3.5 File Handling
- File uploads are stored in `meta.file`.
- `meta.file.url` is a presigned URL and may expire (currently 1 hour).
- `meta.file.path` is an internal storage path.

### 3.6 Pagination
- Message lists are returned in descending order by `created_at`.
- Use `cursor` (ISO timestamp) to fetch older messages (`created_at < cursor`).

---

## 4. REST API Reference

### 4.1 Conversations

#### Get Conversations
`GET /conversations`
Retrieve all conversations for the current user.
- Query Params:
  - `includeArchived` (boolean, optional): include archived chats.

**Response: `200 OK`**
```json
[
  {
    "id": "uuid",
    "type": "dm",
    "title": null,
    "photo_url": "https://...",
    "pinned_at": "2024-01-01T10:00:00Z",
    "is_muted": false,
    "is_archived": false,
    "recipient": {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://...",
      "position": "Engineer"
    },
    "last_message": {
      "id": "uuid",
      "content": "Hello world",
      "type": "text",
      "created_at": "2024-01-01T09:59:00Z",
      "sender_id": "uuid",
      "meta": { "file": { "url": "https://..." } },
      "status": "read"
    },
    "unread_count": 2
  }
]
```

#### Create Conversation
`POST /conversations`
- Content-Type: `multipart/form-data`
- Notes:
  - For `dm`, `participantIds` must contain exactly one other user.
  - For `group`, at least one other participant is required.
  - The logged-in user is automatically included.
  - For `group`, the AI bot is automatically added.
  - If a DM already exists for the same two users, the existing conversation is returned.

**Form Fields:**
- `type` (required): `dm` | `group` | `project` | `document` | `doc_analyze` | `time_machine`
- `title` (optional): string
- `participantIds` (required): `string[]` or comma-separated string
- `photo` (optional): file
- `ai_prompt` (optional): string
- `knowledge_policy` (optional): `strict | open | llm` (default: `llm`)
- `knowledge_ids` (optional): `string[]`

**Response: `201 Created`**
Returns the created (or existing) conversation.

#### Update Conversation
`PATCH /conversations/:id`
- Content-Type: `multipart/form-data`
- Admin only (conversation admin or system admin).

**Form Fields:**
- `title` (optional): string
- `ai_prompt` (optional): string
- `knowledge_policy` (optional): `strict | open | llm`
- `knowledge_ids` (optional): `string[]`
- `avatar` / `photo` (optional): file
- `avatar_url` / `photo_url` (optional): string (alias)

**Response: `200 OK`**
Returns the updated conversation.

#### Delete Conversation (Delete and Recreate)
`DELETE /conversations/:id`
- Deletes the conversation and all associated messages, then recreates a new conversation
  with the same participants and settings.

**Response: `200 OK`**
Returns the newly created conversation (with a new ID).

#### Member Management
- `POST /conversations/:id/members`
  - Body: `{ "userId": "uuid" }`
  - Admin only.
- `DELETE /conversations/:id/members/:userId`
  - Self-leave is allowed.
  - Removing others requires admin.
  - AI bot cannot be removed.
- `PUT /conversations/:id/members/:userId/role`
  - Body: `{ "role": "admin | member" }`
  - Admin only.
- `GET /conversations/:id/members`
  - Returns a list of members with user details (AI bot excluded).

#### Preferences
- `PUT /conversations/:id/pin`: `{ "isPinned": boolean }`
- `PUT /conversations/:id/mute`: `{ "isMuted": boolean }`
- `PUT /conversations/:id/archive`: `{ "isArchived": boolean }`

Responses return the updated conversation member record.

---

### 4.2 Messages

#### Get Messages
`GET /messages/:conversationId`
Retrieve message history with cursor-based pagination.
- Query Params:
  - `limit` (number, default 20)
  - `cursor` (ISO date string of the oldest message received)

**Response: `200 OK`**
```json
{
  "conversation": {
    "id": "uuid",
    "type": "dm",
    "title": null,
    "photo_url": "https://...",
    "pinned_message_id": "uuid",
    "recipient": {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://...",
      "position": "Engineer",
      "last_active_at": "2024-01-01T09:00:00Z"
    },
    "pinned_message": {
      "id": "uuid",
      "content": "Pinned message",
      "type": "text",
      "meta": {},
      "created_at": "2024-01-01T08:00:00Z",
      "sender": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://...",
        "username": "john",
        "position": "Engineer"
      }
    }
  },
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": "uuid",
      "sender": {
        "id": "uuid",
        "name": "John Doe",
        "username": "john",
        "avatar": "https://...",
        "position": "Engineer"
      },
      "client_message_id": "client-123",
      "reply_to_message_id": "uuid",
      "reply_to_message": {
        "id": "uuid",
        "type": "text",
        "content": "Original message",
        "meta": { "file": { "url": "https://..." } },
        "sender": { "id": "uuid", "name": "Jane Doe", "username": "jane" }
      },
      "type": "text",
      "content": "Hello",
      "meta": {
        "mentions": [{ "id": "uuid", "name": "Jane Doe", "username": "jane" }]
      },
      "status": "sent",
      "edited_at": null,
      "created_at": "2024-01-01T09:59:00Z",
      "reactions": [
        {
          "message_id": "uuid",
          "user_id": "uuid",
          "emoji": "👍",
          "user": { "id": "uuid", "name": "Jane Doe", "username": "jane" }
        }
      ]
    }
  ]
}
```

#### Send Message (HTTP Fallback)
`POST /messages`
- Content-Type: `multipart/form-data`

**Form Fields:**
- `conversationId` (required): UUID
- `clientMessageId` (required): string
- `type` (required): `text | image | video | file | voice | sticker | location | contact | system`
- `content` (optional): string
- `replyToMessageId` (optional): UUID
- `meta` (optional): JSON string
- `file` (optional): file (required for non-text types)

**Validation Rules:**
- For `text`, `content` is required.
- For non-text types (except `system`), `file` is required.
- `replyToMessageId` must exist in the same conversation.

**Response: `201 Created`**
Returns the created message.

#### Send Direct Message
`POST /messages/dm`
Creates a DM (if not exists) and sends the first message.
- Content-Type: `multipart/form-data`

**Form Fields:**
- `recipientId` (required): UUID
- `clientMessageId` (required): string
- `type` (required): same as Send Message
- `content` / `file` / `meta`: same rules as Send Message

**Response: `201 Created`**
Returns the created message.

#### Read Receipts
- `PUT /messages/read-all`
  - Marks all messages in all conversations as read for the current user.
- `PUT /messages/read`
  - Body: `{ "conversationId": "uuid", "lastMessageId": "uuid" }`
  - Marks messages in the conversation as read up to `lastMessageId` (optional).

#### Search Messages
- `GET /messages/search/global?q=<query>`
- `GET /messages/search/:conversationId?q=<query>`

Returns up to 50 messages.

#### Forward Message
`POST /messages/:id/forward`
- Body: `{ "conversationIds": ["uuid1", "uuid2"] }`
- Returns the forwarded messages.

#### Reactions
`POST /messages/:id/reactions`
- Body: `{ "emoji": "👍" }`
- Toggles or updates reaction for the current user.

**Response Example:**
```json
{
  "status": "added",
  "emoji": "👍",
  "reaction": {
    "message_id": "uuid",
    "user_id": "uuid",
    "emoji": "👍",
    "user": { "id": "uuid", "name": "Jane Doe", "username": "jane" }
  },
  "conversation_id": "uuid",
  "message_id": "uuid"
}
```

#### Pin Message
`PUT /messages/:id/pin`
- Body: `{ "isPinned": boolean }`
- Returns the updated conversation (with `pinned_message_id`).

#### Edit Message
`PUT /messages/:id`
- Body: `{ "content": "string" }`
- Only the sender can edit.

#### Delete Message
`DELETE /messages/:id`
- Deletes for the current user only (virtual delete).
- To delete for everyone, use WebSocket `message.delete` with `forEveryone: true`.
- The WebSocket ACK for `message.delete` uses event `message.deleted` and includes `forEveryone`.

---

### 4.3 Stickers

#### Get Stickers
`GET /stickers`
Retrieve all available sticker packs.

**Response: `200 OK`**
```json
[
  {
    "id": "uuid",
    "name": "Sticker Pack Name",
    "stickers": [
      { "id": "uuid", "image_url": "https://..." }
    ]
  }
]
```

---

## 5. WebSocket API (Real-time)
The BTA Chat API uses Socket.IO for real-time events. For a deeper Socket.IO-specific guide, see `references/WEBSOCKET.md`.

### 5.1 Response Envelope
Commands should be sent with a Socket.IO acknowledgment callback. The server responds with:

**Success (socketOk / ACK callback):**
```json
{ "ok": true, "event": "event.name", "data": { } }
```

Errors are emitted via the `error` event:

**Error (socketError / `error` event):**
```json
{ "ok": false, "event": "error", "error": { "message": "...", "statusCode": 400 } }
```

> [!NOTE]
> Many “fetch/list/search” actions return data via the ACK callback only (no separate broadcast).

### 5.2 Commands (Frontend → Backend)
Use `socket.emit(event, payload, (res) => ...)`.

> [!NOTE]
> Payloads are validated strictly; unknown fields can be rejected with an `error` event.

| Event | Payload | ACK `res.event` | Notes |
| :--- | :--- | :--- | :--- |
| `conversations.get` | `null` | `conversations.list` | List conversations (ACK-only). |
| `conversation.join` | `{ "conversationId": "uuid" }` | `conversation.joined` | Join a conversation room. |
| `conversation.leave` | `{ "conversationId": "uuid" }` | `conversation.left` | Leave a conversation room (does not remove membership). |
| `conversation.create` | `{ "type": "dm", "title?": "...", "participantIds": ["uuid"], "ai_prompt?": "..." }` | `conversation.created` | Same rules as REST create (websocket DTO is a subset). |
| `conversation.update` | `{ "conversationId": "uuid", "title?": "...", "avatar_url?": "...", "photo_url?": "...", "ai_prompt?": "..." }` | `conversation.updated` | Admin only. |
| `conversation.delete` | `{ "conversationId": "uuid" }` | `conversation.recreated` | Delete + recreate (members get `conversation.deleted`). |
| `conversation.pin` | `{ "conversationId": "uuid", "isPinned": true }` | `conversation.pinned` | Preference (current user). |
| `conversation.mute` | `{ "conversationId": "uuid", "isMuted": true }` | `conversation.muted` | Preference (current user). |
| `conversation.archive` | `{ "conversationId": "uuid", "isArchived": true }` | `conversation.archived` | Preference (current user). |
| `conversation.member.add` | `{ "conversationId": "uuid", "userId": "uuid" }` | `conversation.member.added` | Admin only. |
| `conversation.member.remove` | `{ "conversationId": "uuid", "userId": "uuid" }` | `conversation.member.removed` | Self-leave allowed; removing others requires admin. |
| `conversation.member.role` | `{ "conversationId": "uuid", "userId": "uuid", "role": "admin or member" }` | `conversation.member.role_updated` | Admin only. |
| `conversation.members.get` | `{ "conversationId": "uuid" }` | `conversation.members.list` | Members list (ACK-only). |
| `message.send` | `{ "conversationId": "uuid", "clientMessageId": "...", "type": "text", "content?": "...", "replyToMessageId?": "uuid", "meta?": {} }` | `message.ack` | Rate-limited (5 messages per second). |
| `message.dm` | `{ "recipientId": "uuid", "clientMessageId": "...", "type": "text", "content?": "..." }` | `message.ack` | Creates/reuses DM conversation if needed. |
| `messages.get` | `{ "conversationId": "uuid", "limit?": 20, "cursor?": "2024-01-01T09:00:00Z" }` | `messages.list` | `limit` is 1-100 (ACK-only). |
| `messages.search` | `{ "conversationId": "uuid", "query": "text" }` | `messages.search.result` | Up to 50 results (ACK-only). |
| `messages.search.global` | `{ "query": "text" }` | `messages.search.global.result` | Up to 50 results (ACK-only). |
| `messages.read_all` | `null` | `messages.read_all` | Marks all as read (also pushes `messages.read_all` to your personal room). |
| `message.forward` | `{ "messageId": "uuid", "conversationIds": ["uuid1"] }` | `message.forwarded` | Forwarded messages are delivered via `message.new`. |
| `message.delivered` | `{ "messageId": "uuid" }` | `message.delivered` | Marks a message delivered. |
| `message.read` | `{ "conversationId": "uuid", "lastMessageId?": "uuid" }` | `message.read` | Marks messages read. |
| `message.edit` | `{ "messageId": "uuid", "content": "..." }` | `message.updated` | Sender only. |
| `message.delete` | `{ "messageId": "uuid", "forEveryone": true }` | `message.deleted` | `forEveryone=true` is sender-only; broadcast payload may omit `forEveryone`. |
| `message.pin` | `{ "messageId": "uuid", "isPinned": true }` | `message.pinned` | Pin/unpin message. |
| `message.reaction` | `{ "messageId": "uuid", "emoji": "👍" }` | `message.reaction` | Toggle/update reaction. |
| `conversation.typing` | `{ "conversationId": "uuid" }` | `conversation.typing` | Room-scoped typing indicator. |
| `conversation.reading` | `{ "conversationId": "uuid" }` | `conversation.reading` | Room-scoped reading indicator. |
| `presence.heartbeat` | `null` | `presence.pulse` | Keep presence alive (TTL-based, ~60s). Send every ~30–45s. |

Legacy command aliases are supported: `join`, `typing`, `heartbeat`.

> [!TIP]
> Join the conversation room (`conversation.join`) while viewing a chat to receive room-scoped events like typing/reading, receipts, message edits/deletes/pins, and AI “thinking” signals.

### 5.3 Server Push Events (Backend → Frontend)
Subscribe with `socket.on(event, handler)`.

| Event | Data | Notes |
| :--- | :--- | :--- |
| `message.new` | `Message` | Delivered to participants (conversation room and personal rooms). |
| `message.ack` | `{ "clientMessageId": "...", "id?": "uuid", "conversationId?": "uuid", "status": "sent|failed", "timestamp?": "...", "error?": "...", "retryable?": true }` | Status updates for your sends (may arrive even if you also used ACK callback). |
| `message.updated` | `Message` | Room-scoped (requires `conversation.join`). |
| `message.deleted` | `{ "messageId": "uuid", "conversationId": "uuid" }` | Room-scoped (requires `conversation.join`). |
| `message.pinned` | `{ "messageId": "uuid", "isPinned": boolean, "conversationId": "uuid" }` | Room-scoped (requires `conversation.join`). |
| `message.reaction` | `ReactionResult` | Delivered to participants. |
| `message.delivered` | `{ "messageId": "uuid", "conversationId": "uuid", "userId": "uuid" }` | Room-scoped (requires `conversation.join`). |
| `message.read` | `{ "conversationId": "uuid", "userId": "uuid", "lastMessageId?": "uuid" }` | Room-scoped for others; also pushed to the reader’s personal room. |
| `messages.read_all` | `{ "userId": "uuid" }` | Personal-room only (current user). |
| `message.mention` | `{ "conversationId": "uuid", "messageId": "uuid", "userId": "uuid", "senderId": "uuid" }` | Personal-room only (mentioned user). |
| `conversation.created` | `Conversation` | Delivered to participants. |
| `conversation.updated` | `Conversation` | Delivered to participants. |
| `conversation.deleted` | `{ "conversationId": "uuid", "replacedByConversationId": "uuid" }` | Personal-room notification to previous members. |
| `conversation.pinned` | `ConversationMember` | Personal-room only (current user). |
| `conversation.muted` | `ConversationMember` | Personal-room only (current user). |
| `conversation.archived` | `ConversationMember` | Personal-room only (current user). |
| `conversation.member.added` | `{ "conversationId": "uuid", "member": ConversationMember }` | Delivered to participants. |
| `conversation.member.removed` | `{ "conversationId": "uuid", "userId": "uuid", "removedBy": "uuid" }` | Delivered to participants; removed user is also kicked from the room. |
| `conversation.member.role_updated` | `{ "conversationId": "uuid", "member": ConversationMember }` | Delivered to participants. |
| `conversation.typing` | `{ "conversationId": "uuid", "userId": "uuid", "position": "..." }` | Room-scoped to others (requires `conversation.join`). |
| `conversation.reading` | `{ "conversationId": "uuid", "userId": "uuid", "position": "..." }` | Room-scoped to others (requires `conversation.join`). |
| `presence.update` | `{ "userId": "uuid", "status": "online|offline", "position": "..." }` | Presence change for contacts in shared conversations. |
| `ai.thinking` | `{ "conversationId": "uuid", "userId": "uuid" }` | Room-scoped (requires `conversation.join`). |
| `ai.thinking.stop` | `{ "conversationId": "uuid", "userId": "uuid" }` | Room-scoped (requires `conversation.join`). |
| `error` | `{ "ok": false, "event": "error", "error": { "message": "...", "statusCode": 400 } }` | Any server-side error. |

### 5.4 Delivery and Read Flow
- After receiving `message.new`, clients should emit `message.delivered`.
- When a user reads the conversation, emit `message.read` with `conversationId` and optional `lastMessageId`.

---

## 6. Data Objects

### 6.1 Conversation (List Item)
```json
{
  "id": "uuid",
  "type": "dm",
  "title": "...",
  "photo_url": "https://...",
  "pinned_at": "2024-01-01T10:00:00Z",
  "is_muted": false,
  "is_archived": false,
  "recipient": { "id": "uuid", "name": "...", "avatar": "...", "position": "..." },
  "last_message": { "id": "uuid", "content": "...", "type": "text", "created_at": "...", "sender_id": "uuid", "meta": {}, "status": "sent" },
  "unread_count": 0
}
```

### 6.2 Conversation Member
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "user_id": "uuid",
  "role": "admin",
  "joined_at": "2024-01-01T10:00:00Z",
  "pinned_at": null,
  "is_muted": false,
  "is_archived": false,
  "user": {
    "id": "uuid",
    "name": "...",
    "email": "...",
    "position": "...",
    "avatar": "...",
    "username": "...",
    "nik": "..."
  }
}
```

### 6.3 Message
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "sender": { "id": "uuid", "name": "...", "username": "...", "avatar": "...", "position": "..." },
  "client_message_id": "client-123",
  "reply_to_message_id": "uuid",
  "reply_to_message": { "id": "uuid", "type": "text", "content": "...", "sender": { "id": "uuid", "name": "..." } },
  "type": "text",
  "content": "...",
  "meta": {
    "mentions": [{ "id": "uuid", "name": "...", "username": "..." }],
    "file": { "name": "file.pdf", "size": 123, "mimetype": "application/pdf", "path": "bucket/key", "url": "https://..." }
  },
  "status": "sent",
  "edited_at": null,
  "created_at": "2024-01-01T10:00:00Z",
  "reactions": [
    { "message_id": "uuid", "user_id": "uuid", "emoji": "👍", "user": { "id": "uuid", "name": "..." } }
  ]
}
```

---

## 7. Error Handling

### 7.1 HTTP Errors
Errors returned by REST endpoints follow this structure:
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Error details",
  "timestamp": "2024-01-01T10:00:00Z",
  "path": "/v1/messages"
}
```

### 7.2 WebSocket Errors
Errors emitted through WebSocket:
```json
{
  "ok": false,
  "event": "error",
  "error": {
    "message": "Error details",
    "statusCode": 403
  }
}
```
