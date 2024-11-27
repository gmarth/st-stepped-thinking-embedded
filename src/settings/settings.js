import { saveSettingsDebounced } from "../../../../../../script.js";

import { extensionFolderPath, extensionSettings } from "../../index.js";
import { debug, updateVisualDebugger } from "../debug.js";
import { embedThoughtsToChat, deleteEmbeddedThoughtsFromChat } from "../embedded.js";
import { defaultSettings } from "./defaultSettings.js";
//import { updateTrackerPreview } from "../trackerUI.js";
//import { generationCaptured } from "../../lib/interconnection.js";

/**
 * Checks if the extension is enabled.
 * @returns {boolean} True if enabled, false otherwise.
 */
export async function isEnabled() {
    debug("Checking if extension is enabled:", extensionSettings.enabled);
    return extensionSettings.enabled;
}

// #endregion

// #region Settings Initialization

/**
 * Initializes the extension settings by merging default and existing settings.
 */
export async function initSettings() {
    const settings = JSON.parse(JSON.stringify(extensionSettings));
    Object.assign(extensionSettings, defaultSettings, settings);
    saveSettingsDebounced();

    await loadSettingsUI();
}

/**
 * Sets the initial values of the settings UI elements.
 */
async function loadSettingsUI() {
    const settingsHtml = await $.get(`${extensionFolderPath}/html/settings.html`);
    $("#extensions_settings").append(settingsHtml);

    setSettingsInitialValues();
    registerSettingsListeners();
}

/**
 * Sets the initial values of the settings UI elements.
 */
function setSettingsInitialValues() {
    $("#thoughts_embedded_enable").prop("checked", extensionSettings.enabled);
    $("#thoughts_embedded_extract_regex").val(extensionSettings.extractRegex);
    $("#thoughts_embedded_thoughts_template").val(extensionSettings.embeddedThoughtsTemplate);
    $("#thoughts_embedded_thought_template").val(extensionSettings.embeddedThoughtTemplate);
    $("#thoughts_embedded_parsing_enable").prop("checked", extensionSettings.parsingEnabled);
    $("#thoughts_embedded_parsing_plist_regex").val(extensionSettings.plistRegex);
    $("#thoughts_embedded_thought_plist_template").val(extensionSettings.plistEmbeddedThoughtTemplate);
    $("#thoughts_embedded_debug").prop("checked", extensionSettings.debugMode);
    $("#thoughts_embedded_debug_vis").prop("checked", extensionSettings.debugVisualizer);
}

/**
 * Registers event listeners for the settings UI elements.
 */
function registerSettingsListeners() {
    $("#thoughts_embedded_enable").on("input", onSettingCheckboxInput("enabled"));
    $("#thoughts_embedded_extract_regex").on("input", onSettingInputareaInput("extractRegex"));
    $("#thoughts_embedded_thoughts_template").on("input", onSettingInputareaInput("embeddedThoughtsTemplate"));
    $("#thoughts_embedded_thought_template").on("input", onSettingInputareaInput("embeddedThoughtTemplate"));
    $("#thoughts_embedded_parsing_enable").on("input", onSettingCheckboxInput("parsingEnabled"));
    $("#thoughts_embedded_parsing_plist_regex").on("input", onSettingInputareaInput("plistRegex"));
    $("#thoughts_embedded_thought_plist_template").on("input", onSettingInputareaInput("plistEmbeddedThoughtTemplate"));
    $("#thoughts_embedded_debug").on("input", onSettingCheckboxInput("debugMode"));
    $("#thoughts_embedded_debug_vis").on("input", onSettingCheckboxInput("debugVisualizer"));
}

// #endregion

// #region Event Handlers

/**
 * Handles changes to checkbox settings.
 * @param {string} settingName - The name of the setting.
 * @returns {function} The event handler function.
 */
function onSettingCheckboxInput(settingName) {
    return function () {
        debug("Setting checkbox input:", settingName);
        const value = Boolean($(this).prop("checked"));
        extensionSettings[settingName] = value;
        saveSettingsDebounced();
        if (settingName === "enabled") {
            if (value) {
                embedThoughtsToChat();
            } else {
                deleteEmbeddedThoughtsFromChat();
            }
            updateVisualDebugger();
        }
        if (settingName === "debugVisualizer")
            updateVisualDebugger();
    };
}

/**
 * Handles input changes to textarea settings.
 * @param {string} settingName - The name of the setting.
 * @returns {function} The event handler function.
 */
function onSettingInputareaInput(settingName) {
    return function () {
        debug("Setting input area input:", settingName);
        const value = $(this).val();
        extensionSettings[settingName] = value;
        saveSettingsDebounced();
        if (settingName === "mesTrackerTemplate") {
            updateTrackerPreview(true, value);
        }
    };
}

/**
 * Handles input changes to numeric settings.
 * @param {string} settingName - The name of the setting.
 * @returns {function} The event handler function.
 */
function onSettingNumberInput(settingName) {
    return function () {
        debug("Setting number input:", settingName);
        let value = parseFloat($(this).val());

        // Handle invalid number input (e.g., empty or NaN)
        if (isNaN(value)) {
            debug("Invalid number input. Setting value to 0 by default.");
            value = 0;
        }

        extensionSettings[settingName] = value;
        saveSettingsDebounced();
    };
}

// #endregion