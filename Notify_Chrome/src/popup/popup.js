document.addEventListener("DOMContentLoaded", function () {
	const endpointInput = document.getElementById("endpoint");
	const saveButton = document.getElementById("save");

	// Load saved endpoint URL
	chrome.storage.local.get(["notifyEndpoint"], (data) => {
		if (data.notifyEndpoint) {
			endpointInput.value = data.notifyEndpoint;
		}
	});

	// Save endpoint URL
	saveButton.addEventListener("click", function () {
		const endpoint = endpointInput.value;
		if (endpoint) {
			chrome.storage.local.set({ notifyEndpoint: endpoint }, () => {
				const notification = document.createElement("span");
				notification.textContent = "Endpoint URL saved!";
				notification.style.marginLeft = "10px";
				notification.style.fontSize = "0.9em";
				notification.style.color = "#333";
				saveButton.parentNode.appendChild(notification);
				setTimeout(() => {
					notification.remove();
				}, 2000);
			});
		}
	});
});
