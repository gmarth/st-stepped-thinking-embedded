import { chat, saveChatConditional, substituteParams } from "../../../../../script.js";
import { getContext } from "../../../../extensions.js";

import { log, debug, error } from "./debug.js";
import { extensionSettings } from "../index.js";

export function embedThoughtToMessage(mesId) {
    const mes_text = $('#chat').find(`[mesid="${mesId}"]`).find(".mes_block").find(".mes_text");

    // remove existing embedded thought first
    if ($('#chat').find(`[mesid="${mesId}"]`).find(".mes_embedded_thought").length > 0) {
        $('#chat').find(`[mesid="${mesId}"]`).find(".mes_embedded_thought").remove();
        $('#chat').find(`[mesid="${mesId}"]`).find(".mes_thoughts_edit").remove();
    }

    let thought_element = extensionSettings.embeddedThoughtsTemplate;

    const thoughts = extractThought(chat[mesId - 1].mes);
    thought_element = thought_element.replace('{{thoughs}}',
        thoughts.map((thought, index) => {
            let parsed_thought = []
            if (extensionSettings.parsingEnabled) {
                parsed_thought = parseThought(thought, chat[mesId].name);
                debug('Trying to parse thought.', parsed_thought);
            }
            if (parsed_thought.length) {
                debug('Parsed thought', parsed_thought);
                return parsed_thought;
            } else {
                return extensionSettings.embeddedThoughtTemplate.replace('{{thought}}', thought);
            }
        }).join('')
    );

    const mes_embedded_thought = $("<div>").addClass("mes_embedded_thought");
    mes_embedded_thought.html(thought_element);

    // Add Edit button to extra Buttons
    // const edit_button = $('<a>').html('Edit Thought')
    // mes_embedded_thought.append(edit_button)
    const edit_button = $('<div>');
    edit_button.addClass("mes_button mes_thoughts_edit fa-solid fa-comment interactable");
    edit_button.on('click', () => editThoughtsBegin(mesId));
    $('#chat').find(`[mesid="${mesId}"]`).find(".extraMesButtons").prepend(edit_button);
    // append edit textarea to it

    mes_text.before(mes_embedded_thought);
}

function editThoughtsBegin(mesId) {
    debug("EDITING MESSAGE", mesId);

    // Textarea
    $('#chat').find(`[mesid="${mesId}"]`).find(".mes_embedded_thought").empty();
    const mes_embedded_thought_textarea = $("<textarea>");
    mes_embedded_thought_textarea.addClass("edit_textarea mdHotkeys");
    $('#chat').find(`[mesid="${mesId}"]`).find(".mes_embedded_thought").append(mes_embedded_thought_textarea);

    // Scrolling fixed with code from SillyTavern and i have no idea why that works....
    mes_embedded_thought_textarea.val(chat[mesId - 1].mes);
    mes_embedded_thought_textarea.height(0);
    mes_embedded_thought_textarea.height(mes_embedded_thought_textarea[0].scrollHeight);
    mes_embedded_thought_textarea.focus();
    mes_embedded_thought_textarea[0].setSelectionRange(
        String(mes_embedded_thought_textarea.val()).length,
        String(mes_embedded_thought_textarea.val()).length
    );


    // Change Button
    const save_button = $('<input>').attr('value', 'Save').addClass("menu_button interactable");
    save_button.on('click', () => editThoughtsSave(mesId));
    $('#chat').find(`[mesid="${mesId}"]`).find(".mes_embedded_thought").append(save_button);

}

async function editThoughtsSave(mesId) {
    const context = getContext();

    debug("SAVE THOUGHT", mesId);
    chat[mesId - 1].mes = $('#chat').find(`[mesid="${mesId}"]`).find("textarea").val();
    debug("Edited Thought ", chat[mesId - 1].mes);

    // updateViewMessageIds();
    await saveChatConditional();
    embedThoughtToMessage(mesId);
}

export function embedThoughtsToChat() {
    chat.map((msg, mesId) => {
        if (msg.is_thoughts)
            $('#chat').find(`[mesid="${mesId}"]`).css('display', 'none');
        if (!msg.is_thoughts && mesId !== 0 && chat[mesId - 1].is_thoughts)
            embedThoughtToMessage(mesId);
    });
}

export function deleteEmbeddedThoughtsFromChat() {
    $(".mes_embedded_thought").remove();
    chat.map((msg, mesId) => {
        if (msg.is_thoughts)
            $('#chat').find(`[mesid="${mesId}"]`).css('display', '');
    });
}


export function deleteRelatedThought(mesId) {
    if (mesId === 0)
        return;

    // WIll delete any message before the deleted one which is a thought. In a perfect world, this will be fine...
    if (chat[mesId - 1].is_thoughts) {
        debug('Deleting thought.', mesId - 1);
        const context = getContext();
        context.executeSlashCommands(`/cut ${mesId - 1}`);
    }
}

function extractThought(thought) {
    //const regex = /```md\s*(.*?)\s*```/gs;
    const regex = new RegExp(extensionSettings.extractRegex, 'gs');
    const matches = [...thought.matchAll(regex)];
    return matches.map(match => match[1]);
}

function parseThought(thought, char) {
    // plist
    const regex = new RegExp(substituteParams(extensionSettings.plistRegex), 'g');
    //debug('Plist regex: ', extensionSettings.plistRegex.replace('{{char}}', char))
    let match;
    let thoughts = '';
    while ((match = regex.exec(thought)) !== null) {
        thoughts += extensionSettings.plistEmbeddedThoughtTemplate.replace('{{attribute}}', match[1]).replace('{{value}}', match[2])
    }
    return thoughts;

    const matches = [...thought.matchAll(regex)];
    return matches.map(match => match[1]);
}