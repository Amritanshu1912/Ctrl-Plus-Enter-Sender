// ==UserScript==
// @name         ChatGPT Ctrl+Enter to Send
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enter inserts a newline, Ctrl+Enter sends the message on ChatGPT
// @author       Amritanshu Singh
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function handleCtrlEnter(event) {
        // Only process trusted, keyboard-originated events
        if (!event.isTrusted) return;
        if (event.code !== "Enter") return;

        const isOnlyEnter  = !event.ctrlKey && !event.metaKey && !event.shiftKey;
        const isCtrlEnter  = event.ctrlKey  && !event.metaKey && !event.shiftKey;
        const isPromptArea = event.target.id === "prompt-textarea";

        // ── Main prompt box ──────────────────────────────────────
        if (isPromptArea) {
            if (isOnlyEnter) {
                // Insert a newline instead of sending
                event.preventDefault();
                event.target.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "Enter", code: "Enter",
                    bubbles: true, cancelable: true,
                    shiftKey: true,             // Shift+Enter = line break in ChatGPT
                    ctrlKey: false, metaKey: false,
                }));
            } else if (isCtrlEnter) {
                // Send the message
                event.preventDefault();
                event.target.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "Enter", code: "Enter",
                    bubbles: true, cancelable: true,
                    metaKey: true,              // ChatGPT ignores Ctrl+Enter; Meta+Enter reliably submits
                    ctrlKey: false, shiftKey: false,
                }));
            }
            return;
        }

        // ── Edit-mode textareas (when editing a previous message) ─
        if (event.target.tagName === "TEXTAREA") {
            if (isOnlyEnter) {
                // Stop ChatGPT from submitting on plain Enter in edit mode
                event.stopPropagation();
            } else if (isCtrlEnter) {
                // Submit the edit — convert Ctrl to Meta so it works on Windows too
                event.preventDefault();
                event.target.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "Enter", code: "Enter",
                    bubbles: true, cancelable: true,
                    metaKey: true,
                    ctrlKey: false, shiftKey: false,
                }));
            }
        }
    }

    // Attach at capture phase so we intercept before ChatGPT's own handlers
    document.addEventListener("keydown", handleCtrlEnter, { capture: true });

})();
