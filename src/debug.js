import { chat } from "../../../../../script.js";

import { extensionName, extensionSettings, extensionFolderPath } from "../index.js";


export function log(...msg) {
    console.log(`[${extensionName}] `, ...msg);
}

export function warn(...msg) {
    console.warn(`[${extensionName}] `, ...msg);
}

export function error(...msg) {
    console.error(`[${extensionName}] `, ...msg);
}

export function debug(...msg) {
    if (extensionSettings.debugMode) {
        console.debug(`[${extensionName}] `, ...msg);
    }
}

export async function updateVisualDebugger() {
    //const settingsHtml = await $.get(`${extensionFolderPath}/html/settings.html`);
    //$("#extensions_settings").append(settingsHtml);
    // enable but no drawer. create one
    if (extensionSettings.debugVisualizer && $("#thinking-embedded-vis").length === 0) {
        const visualizerHtml = await $.get(`${extensionFolderPath}/html/visualizer.html`);
        $("body").append(visualizerHtml);
        debug("Creating debugging visualizer.", visualizerHtml);
    }
    // disabled but drawer. delete it
    if ((!extensionSettings.debugVisualizer && $("#thinking-embedded-vis").length) || !extensionSettings.enabled) {
        $("#thinking-embedded-vis").remove();
        debug("Deleting debugging visualizer.");
    }

    if (extensionSettings.debugVisualizer) {
        debug("Update debugging visualizer.");
        $("#thinking-embedded-vis").empty();
        $("#thinking-embedded-vis").html('<strong>Chat Elements</strong><table>' +
            chat.map((msg, index) => {
                let item = `<td>[${index}]<td><td> ${msg.name}</td>`;
                item += `<td>${$('#chat').find(`[mesid="${index}"]`).attr('thoughtid') ? $('#chat').find(`[mesid="${index}"]`).attr('thoughtid') : ''}</td>`;
                item += `<td>${$('#chat').find(`[mesid="${index}"]`).attr('relthoughtid') ? $('#chat').find(`[mesid="${index}"]`).attr('relthoughtid') : ''}</td>`;
                item += `<td>${msg.is_thoughts ? '💭' : ''}</td>`;
                item += `<td onclick="$('#chat').find(\`[mesid=\'${index}\']\`).css('display', '');"><div class="fa-solid fa-eye${($('#chat').find(`[mesid="${index}"]`).css('display') === 'none') ? '-slash' : ''}"></div></td>`;
                let hightlighting = `onmouseover="document.getElementById('chat').querySelector(\`[mesid=\'${index}\']\`).style.borderColor = 'rgb(198, 193, 151)';" onmouseleave="document.getElementById('chat').querySelector(\`[mesid=\'${index}\']\`).style.borderColor = '';"`
                if ($('#chat').find(`[mesid="${index}"]`).css('opacity')) {
                    return `<tr  ${hightlighting} style="opacity: ${$('#chat').find(`[mesid="${index}"]`).css('opacity')};">${item}</tr>`;
                }
                return `<tr  ${hightlighting}>${item}</tr>`;
            }).join('') +
            '</table>');
    }
}