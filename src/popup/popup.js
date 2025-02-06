document.addEventListener("DOMContentLoaded", function () {
	const endpointInput = document.getElementById("endpoint");
	const saveButton = document.getElementById("save");

	// Load saved endpoint URL
	chrome.storage.local.get(["gotifyEndpoint"], (data) => {
		if (data.gotifyEndpoint) {
			endpointInput.value = data.gotifyEndpoint;
		}
	});

	// Save endpoint URL
	saveButton.addEventListener("click", function () {
		const endpoint = endpointInput.value;
		if (endpoint) {
			chrome.storage.local.set({ gotifyEndpoint: endpoint }, () => {
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
