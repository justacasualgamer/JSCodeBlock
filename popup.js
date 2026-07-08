async function evaluateCodeOnWebsite(javascriptStringCode) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const outputElement = document.getElementById("output-32yncr712yrcbn24cvr");
    const targetDebug = { tabId: tab.id };

    try {
        if (outputElement) outputElement.textContent = "Connecting to tab debugger...";

        // 1. Attach the debugger to the active browser tab
        // Use "1.3" as the universal DevTools protocol version layer
        await chrome.debugger.attach(targetDebug, "1.3");

        // 2. Use the DevTools protocol to evaluate the string directly on the page.
        // This is 100% immune to both webpage CSP, Trusted Types, and MV3 blocks!
        chrome.debugger.sendCommand(targetDebug, "Runtime.evaluate", {
            expression: javascriptStringCode,
            returnByValue: true // Tells Chrome to return the actual data output values
        }, async (response) => {
            
            // 3. Always detach immediately when done to keep the browser clean
            await chrome.debugger.detach(targetDebug);

            if (!outputElement) return;

            // 4. Handle runtime failures or display successful outputs
            if (response && response.exceptionDetails) {
                outputElement.textContent = `Error: ${response.exceptionDetails.exception.description}`;
            } else if (response && response.result) {
                const value = response.result.value;
                outputElement.textContent = value !== undefined ? String(value) : "Executed successfully.";
            }
        });

    } catch (error) {
        // Handles cases where a debugger is already open or attached
        if (outputElement) outputElement.textContent = `Error: ${error.message}`;
        // Safe fallback cleanup attempt
        try { await chrome.debugger.detach(targetDebug); } catch(e) {}
    }
}

async function getAllCodeBlocks() {
    const allEntries = await chrome.storage.local.get(null);
    let selectOptions = "<option value=\"\">Select a Code block.</option>";
    
    for (const key in allEntries) {
        if (key.startsWith("SuperEpicExtension1.")) {
            selectOptions += `<option value="${key}">${key.slice(20)}</option>`;
        }
    }
    
    const dropdown = document.getElementById("codeblocks-urbgc6r8tc812ct7r");
    if (dropdown) dropdown.innerHTML = selectOptions;
}

async function saveCodeBlock(keyname, codeblock) {
    document.getElementById("output-32yncr712yrcbn24cvr").textContent = `SuperEpicExtension1.${keyname}: ${codeblock}`
    await chrome.storage.local.set({
        ["SuperEpicExtension1." + keyname]: codeblock
    });
    getAllCodeBlocks();
}

async function deleteCodeBlock(keyname) {
    await chrome.storage.local.remove(keyname);
    getAllCodeBlocks();
}

document.getElementById("run-43yu2hc432m").addEventListener("click", async () => {
    if (document.getElementById("hqwercby283765").value.trim() !== "") {
        await evaluateCodeOnWebsite(document.getElementById("hqwercby283765").value);
    } else if (document.getElementById("codeblocks-urbgc6r8tc812ct7r").value !== "") {
        const targetKey = document.getElementById("codeblocks-urbgc6r8tc812ct7r").value;
        let inputCode = await chrome.storage.local.get(targetKey);
        await evaluateCodeOnWebsite(inputCode[targetKey]);
    } else {
        document.getElementById("output-32yncr712yrcbn24cvr").textContent = "Select a code block or type a JS code to run."
    }
});

document.getElementById("save-2h6542h6u3").addEventListener("click", async () => {
    if (document.getElementById("afenuiwefug8hwerg").value.trim() !== "") {
        await saveCodeBlock(document.getElementById("afenuiwefug8hwerg").value, document.getElementById("hqwercby283765").value);
    } else {
        document.getElementById("output-32yncr712yrcbn24cvr").textContent = "Codeblock name blank."
    }
});

document.getElementById("del-2h5g82yng58").addEventListener("click", async () => {
    if (document.getElementById("codeblocks-urbgc6r8tc812ct7r").value !== "") {
        await deleteCodeBlock(document.getElementById("codeblocks-urbgc6r8tc812ct7r").value)
    } else {
        document.getElementById("output-32yncr712yrcbn24cvr").textContent = "Select a code block to delete."
    }
});

document.getElementById("chkval-n45y3427gt9b38").addEventListener("click", async () => {
    if (document.getElementById("codeblocks-urbgc6r8tc812ct7r").value !== "") {
        const targetKey = document.getElementById("codeblocks-urbgc6r8tc812ct7r").value;
        let inputCode = await chrome.storage.local.get(targetKey);
        document.getElementById("output-32yncr712yrcbn24cvr").textContent = inputCode[targetKey];
    } else {
        document.getElementById("output-32yncr712yrcbn24cvr").textContent = "Select a code block to check."
    }
});

getAllCodeBlocks()
