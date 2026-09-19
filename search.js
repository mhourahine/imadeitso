(function () {
	function escapeHtml(str) {
		return str.replace(/[&<>"]/g, function (c) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
		});
	}

	function runSearch() {
		var params = new URLSearchParams(window.location.search);
		var q = (params.get("s") || params.get("q") || "").trim();
		var status = document.getElementById("search-status");
		var list = document.getElementById("search-results-list");
		if (!status || !list) return;

		if (!q) {
			status.textContent = "Enter a search term above.";
			return;
		}

		status.textContent = "Searching for “" + q + "”…";

		fetch("/search-index.json")
			.then(function (r) { return r.json(); })
			.then(function (index) {
				var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
				var results = index.filter(function (item) {
					var haystack = (item.title + " " + item.excerpt).toLowerCase();
					return terms.every(function (t) { return haystack.indexOf(t) !== -1; });
				});

				if (results.length === 0) {
					status.textContent = "Nothing found for “" + q + "”.";
					return;
				}

				status.textContent = results.length + " result" + (results.length === 1 ? "" : "s") + " for “" + q + "”:";
				var html = "";
				results.forEach(function (item) {
					html += '<div class="search-result">' +
						'<h2 class="entry-title"><a href="' + item.url + '">' + escapeHtml(item.title) + "</a></h2>" +
						"<p>" + escapeHtml(item.excerpt) + "</p>" +
						"</div>";
				});
				list.innerHTML = html;
			})
			.catch(function () {
				status.textContent = "Search is unavailable right now.";
			});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", runSearch);
	} else {
		runSearch();
	}
})();
