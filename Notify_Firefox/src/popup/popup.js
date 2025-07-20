document.addEventListener("DOMContentLoaded", function () {
	const endpointInput = document.getElementById("endpoint");
	const saveButton = document.getElementById("save");
	const testButton = document.getElementById("test");

	// Load saved endpoint URL
	browser.storage.local.get(["notifyEndpoint"]).then((data) => {
		if (data.notifyEndpoint) {
			endpointInput.value = data.notifyEndpoint;
		}
	});

	// Show feedback message
	function showFeedback(message, isError = false) {
		const existingFeedback = document.querySelector(".feedback");
		if (existingFeedback) {
			existingFeedback.remove();
		}

		const feedback = document.createElement("div");
		feedback.className = "feedback";
		feedback.textContent = message;
		feedback.style.marginTop = "10px";
		feedback.style.padding = "8px";
		feedback.style.borderRadius = "4px";
		feedback.style.fontSize = "0.9em";

		if (isError) {
			feedback.style.backgroundColor = "#f8d7da";
			feedback.style.color = "#721c24";
			feedback.style.border = "1px solid #f5c6cb";
		} else {
			feedback.style.backgroundColor = "#d4edda";
			feedback.style.color = "#155724";
			feedback.style.border = "1px solid #c3e6cb";
		}

		document.querySelector(".container").appendChild(feedback);

		setTimeout(() => {
			feedback.remove();
		}, 3000);
	}

	// Test endpoint connection
	testButton.addEventListener("click", async function () {
		const endpoint = endpointInput.value.trim();

		if (!endpoint) {
			showFeedback("Please enter an endpoint URL.", true);
			return;
		}

		testButton.disabled = true;
		testButton.textContent = "Testing...";

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "Notify Test",
					message: "Test message from Notify extension",
					priority: 5,
				}),
			});

			if (response.ok) {
				showFeedback("Connection successful! Test message sent.");
			} else {
				showFeedback(
					`Connection failed: HTTP ${response.status}`,
					true
				);
			}
		} catch (error) {
			showFeedback(`Connection failed: ${error.message}`, true);
		} finally {
			testButton.disabled = false;
			testButton.textContent = "Test";
		}
	});

	// Save endpoint URL
	saveButton.addEventListener("click", function () {
		const endpoint = endpointInput.value.trim();

		if (!endpoint) {
			showFeedback("Please enter an endpoint URL.", true);
			return;
		}

		browser.storage.local
			.set({ notifyEndpoint: endpoint })
			.then(() => {
				showFeedback("Endpoint URL saved successfully!");
			})
			.catch((error) => {
				showFeedback("Failed to save endpoint URL.", true);
			});
	});

	// Real-time URL validation
	endpointInput.addEventListener("input", function () {
		const url = endpointInput.value.trim();
		if (url) {
			endpointInput.style.borderColor = "#dc3545";
		} else {
			endpointInput.style.borderColor = "#ccc";
		}
	});
});
