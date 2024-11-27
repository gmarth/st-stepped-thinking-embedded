import { chat } from "../../../../../script.js";

import { generationCaptured } from "../lib/interconnection.js"

import { log, updateVisualDebugger } from "./debug.js";
import { isEnabled } from "./settings/settings.js"
import { embedThoughtToMessage, embedThoughtsToChat, deleteRelatedThought } from "./embedded.js"

/**
 * Event handler for when a message is received.
 * @param {number} mesId - The message ID.
 */
async function onMessageReceived(mesId) {
    if (!await isEnabled() || !chat[mesId]) return;
    log("MESSAGE_RECEIVED", mesId);
    updateVisualDebugger();
    //await addTrackerToMessage(mesId);
}

/**
 * Event handler for when a message is received.
 * @param {number} mesId - The message ID.
 */
async function onMessageDeleted(mesId) {
    if (!await isEnabled()) return;
    log("MESSAGE_DELETED", mesId);
    deleteRelatedThought(mesId);
    updateVisualDebugger();
    //await addTrackerToMessage(mesId);
}

/**
 * Event handler for when the chat changes.
 * @param {object} args - The event arguments.
 */
async function onChatChanged(args) {
    if (!await isEnabled()) return;
    log("CHAT_CHANGED", args);
    embedThoughtsToChat();
    updateVisualDebugger();
}

/**
 * Event handler for when the chat changes.
  */
async function onSettingsUpdated() {
    if (!await isEnabled()) return;
    log("SETTINGS_UPDATED");
    embedThoughtsToChat();
}

/**
 * Event handler for when a character's message is rendered.
 */
async function onCharacterMessageRendered(mesId) {
    if (!await isEnabled() || !chat[mesId]) return;
    log("CHARACTER_MESSAGE_RENDERED");
    //if (chat[mesId].is_thoughts) {
    //$('#chat').find(`[mesid="${mesId}"]`).css('display', 'none');
    //}
    if (!chat[mesId].is_thoughts && mesId !== 0 && chat[mesId - 1].is_thoughts) {
        embedThoughtToMessage(mesId);
    }
}

async function onGenerationMutexReleased() {

}

export const eventHandlers = {
    onMessageReceived,
    onMessageDeleted,
    onChatChanged,
    onSettingsUpdated,
    onCharacterMessageRendered,
};