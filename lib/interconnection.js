import { extensionName } from '../index.js';
import { eventSource } from '../../../../../script.js';
import { log, debug } from '../src/debug.js';

const NO_CAPTURES = '';
const generationMutexEvents = {
    MUTEX_CAPTURED: 'GENERATION_MUTEX_CAPTURED',
    MUTEX_RELEASED: 'GENERATION_MUTEX_RELEASED',
};
/**
 * @typedef {object} GenerationMutexEvent
 * @property {string} extension_name - the name of the extension that captures the mutex
 */

let capturedBy = NO_CAPTURES;

/**
 * @return {void}
 */
export function registerGenerationMutexListeners() {
    eventSource.on(generationMutexEvents.MUTEX_CAPTURED, onGenerationMutexCaptured);
    eventSource.on(generationMutexEvents.MUTEX_RELEASED, onGenerationMutexReleased);
}

/**
 * @return {boolean}
 */
export async function generationCaptured() {
    if (capturedBy === extensionName) {
        return true;
    }

    if (capturedBy === NO_CAPTURES) {
        await eventSource.emit(generationMutexEvents.MUTEX_CAPTURED, { extension_name: extensionName });
        return true;
    }

    return false;
}

/**
 * @return {void}
 */
export async function releaseGeneration() {
    await eventSource.emit(generationMutexEvents.MUTEX_RELEASED);
}

/**
 * @param {GenerationMutexEvent} event
 * @return {void}
 */
function onGenerationMutexCaptured(event) {
    capturedBy = event.extension_name;
    log('Generation mutex captured by', capturedBy);
}

/**
 * @return {void}
 */
function onGenerationMutexReleased() {
    // Hide the thought message as soon as it finished generating
    // TODO: Make it better. Still not as good as the div observer.
    if (capturedBy === 'st-stepped-thinking') {
        $('#chat').find('.last_mes').css('display', 'none');
        debug('Last Message', $('#chat').find('.last_mes').attr('mesid'));
    }
    log('Generation mutex released', capturedBy);
    capturedBy = NO_CAPTURES;
}