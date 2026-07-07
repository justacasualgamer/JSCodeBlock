async function evaluateCodeOnWebsite(javascriptStringCode) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: chrome.scripting.ExecutionWorld.MAIN,
        args: [javascriptStringCode],
        func: (codeToRun) => {
            try {
                const cleanRunner = new Function(codeToRun);
                return { success: true, data: cleanRunner() };
            } catch (error) {
                return { success: false, data: error.message };
            }
        }
    });

    const executionResult = results[0].result;
    
    const outputElement = document.getElementById("output-32yncr712yrcbn24cvr");
    if (outputElement) {
        if (executionResult.data === undefined) {
            outputElement.textContent = "Executed successfully (No return value)";
        } else {
            outputElement.textContent = executionResult.data;
        }
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