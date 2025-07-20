browser.runtime.onInstalled.addListener(() => {
	browser.contextMenus.create({
		id: "Notify",
		title: "Notify",
		contexts: ["selection", "page", "image", "link"],
	});
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
	try {
		const data = await browser.storage.local.get("notifyEndpoint");
		const endpoint = data.notifyEndpoint;

		if (!endpoint) {
			browser.notifications.create({
				type: "basic",
				iconUrl: "images/Notify.png",
				title: "Notify",
				message:
					"Please configure your endpoint first by clicking the extension icon.",
			});
			return;
		}

		const title = `${tab.title}`;
		let message = "";

		if (info.mediaType) {
			message = info.srcUrl;
		} else if (info.linkUrl) {
			message = info.linkUrl;
		} else if (info.selectionText) {
			try {
				const results = await browser.scripting.executeScript({
					target: { tabId: tab.id },
					func: getSelectionWithLineBreaks,
				});

				if (results && results[0] && results[0].result) {
					const selectedText = results[0].result;
					message = `${tab.url}\n\n${selectedText}`;
				} else {
					console.log("Could not retrieve selected text");
					message = tab.url;
				}
			} catch (error) {
				console.error("Error executing script:", error);
				message = tab.url;
			}
		} else {
			message = tab.url;
		}

		await sendMessage(endpoint, title, message, tab.id);
	} catch (error) {
		console.error("Error in context menu handler:", error);
		browser.notifications.create({
			type: "basic",
			iconUrl: "images/Notify.png",
			title: "Notify Error",
			message: `Failed to send message: ${error.message}`,
		});
	}
});

function getSelectionWithLineBreaks() {
	return window.getSelection().toString();
}

async function sendMessage(endpoint, title, message, tabId) {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			title: title,
			message: message,
			priority: 7,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}
}
