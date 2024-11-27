export const defaultSettings = {
    enabled: true,
    extractRegex: '```md\\s*(.*?)\\s*```',
    embeddedThoughtsTemplate: `<details type="executing" open="">
<summary style="font-size: smaller; font-family: var(--mainFontFamily);">Thoughts 💭</summary>
{{thoughs}}
</details>`,
    embeddedThoughtTemplate: `<div>
{{thought}}
</div>
<hr></hr>`,
    parsingEnabled: false,
    plistRegex: '{{char}}\'s ([^:]+):\s*([^;\]]+)(?:;|\])',
    plistEmbeddedThoughtTemplate: `<div class="thought_attribute">{{attribute}}</div>
<div class="thought_value">{{value}}</div>`,

    debugMode: false,
    debugVisualizer: false,
};