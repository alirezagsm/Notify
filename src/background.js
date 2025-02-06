chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "gotifyShare",
		title: "GotifyShare",
		contexts: ["selection", "page", "image", "link"], // Added "link" context
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	chrome.storage.local.get(["gotifyEndpoint"], (data) => {
		const endpoint = data.gotifyEndpoint;
		if (!endpoint) {
			chrome.action.openPopup();
			return;
		}

		const title = `${tab.title}`;
		let message = "";
		if (info.mediaType) {
			message = info.srcUrl;
		} else if (info.linkUrl) {
			message = info.linkUrl;
		} else if (info.selectionText) {
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					function: getSelectionWithLineBreaks,
				},
				(results) => {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						return;
					}

					if (results && results[0] && results[0].result) {
						const selectedText = results[0].result;
						message = `${tab.url}\n\n${selectedText}`;
						sendMessage(endpoint, title, message);
					} else {
						console.log("Could not retrieve selected text");
						message = tab.url;
						sendMessage(endpoint, title, message);
					}
				}
			);
			return;
		} else {
			message = tab.url;
		}

		sendMessage(endpoint, title, message);
	});
});

function getSelectionWithLineBreaks() {
	return window.getSelection().toString();
}

function sendMessage(endpoint, title, message) {
	fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			title: title,
			message: message,
			priority: 7,
		}),
	})
		.then((response) => {
			if (!response.ok) {
				console.error("Error sending message:", response.status);
			}
		})
		.catch((error) => {
			console.error("Error sending message:", error);
		});
}
