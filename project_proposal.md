# Enabling More Context
One of the big missing features in a lot of the current chatbots is the ability to have a conversation with a chatbot that is able to remember the context of the conversation. Having access to more personal context can really increase the usefulness of chatbot responses and reduce the amount of work required for a user to setup a helpful sesssion with a chatbot.


## Custom Chat Contexts (Chatties?)
Allow users to write down bits of information that they would like the AI to know about them.

### Updating the Schema
Add a new table in [schema.ts](lib/db/schema.ts)

The table should be immutable, meaning that edits should be stored as new rows. This is so that users can easily understand the relationship between a chat session and a "Chatty".

Update the existing "Chat" table to support a reference to the new table.

### Udpating the UI
We will add a new section to the sidebar to allow users to create and manage their "Chatties".
[app-sidebar.tsx](components/app-sidebar.tsx)

A new section will be added to the top of the chat interface to allow users to view the currenty "Chatty" that they are talking to.

The "New Chat" button will be modified to open a dropdown menu that allows users to select from their "Chatties". If none exist the dropdown will not open and a chat will be created without a "Chatty".


## Cross Chat History
Users can specify that a chat session should have access to all previous chats. (defaults to enabled)

### Update the Schema
Update the "Chat" table in [schema.ts](lib/db/schema.ts) to contain a new column (`history_enabled`).

### Migration
We can either backfill all existing chat sessions to have `history_enabled` set to `false` or we can simply treat `null` as `falsy`.

### UI Affordance
At the top of the chat window we will add a slide toggle (or a checkbox) allowing users to enable or disable the feature for the current chat.

### Implementation
We currently send all the messages to the backend each time that [chat.tsx](components/chat.tsx). This won't scale infinitely, but should be fine for a demo. If history is enabled we will load the past N sessions to the client and transmite ALL the messages.

### Future improvments
 * Allow users to currate past chat sessions to use.

 * Distill information learned from chat sessions into a "knowledge graph" and allow users to prune this graph.

 * Load all chat history on the backend to avoid having to transmit large amounts of text back and forth to the client.


