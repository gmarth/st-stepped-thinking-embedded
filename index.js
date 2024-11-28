import { eventSource, event_types } from "/script.js";
import { extension_settings } from "/scripts/extensions.js";

import { registerGenerationMutexListeners } from './lib/interconnection.js';

import { initSettings } from "./src/settings/settings.js";
import { updateVisualDebugger } from "./src/debug.js";
import { eventHandlers } from "./src/events.js";

export const extensionName = "st-stepped-thinking-embedded";
export const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

if (!extension_settings[extensionName]) extension_settings[extensionName] = {};
export const extensionSettings = extension_settings[extensionName];

jQuery(async () => {
  await initSettings();
});

registerGenerationMutexListeners();

eventSource.on(event_types.CHAT_CHANGED, eventHandlers.onChatChanged);
eventSource.on(event_types.MESSAGE_RECEIVED, eventHandlers.onMessageReceived);
eventSource.on(event_types.MESSAGE_DELETED, eventHandlers.onMessageDeleted);
eventSource.on(event_types.SETTINGS_UPDATED, eventHandlers.onSettingsUpdated);
eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, eventHandlers.onCharacterMessageRendered);