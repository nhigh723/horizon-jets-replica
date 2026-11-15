document.addEventListener("DOMContentLoaded", function () {
  const builderScope = document.querySelector(".jet-card-page");
  let latestRetail = 0;
  let latestCost = 0;
  if (!builderScope) return;

  // Elements
  const cardHolderInput = document.getElementById("card_holder");
  const flightHoursInput = document.getElementById("flight_hours");
  const jetCategoryInput = document.getElementById("jet_category");
  const specialRequestInput = document.getElementById("special_request");

  const previewHolder = document.getElementById("preview-holder");
  const previewHours = document.getElementById("preview-hours");
  const previewCategory = document.getElementById("preview-category");
  const previewPerks = document.getElementById("preview-perks");
  const previewRequests = document.getElementById("preview-requests");

  const perksInputs = document.querySelectorAll(".custom-multiselect input[type='checkbox']");
  const retailDisplay = document.getElementById("estimated-retail");
  const costDisplay = document.getElementById("estimated-cost");

  const hourlyRetail = {
    "Very Light Jet": 6500,
    "Light Jet": 8000,
    "Midsize Jet": 9500,
    "Super Midsize Jet": 11250,
    "Heavy Jet": 13750,
    "Ultra Long Range": 16250,
    "Bizliner": 19000
  };

  const hourlyCost = {
    "Very Light Jet": 3600,
    "Light Jet": 4200,
    "Midsize Jet": 5300,
    "Super Midsize Jet": 6600,
    "Heavy Jet": 8100,
    "Ultra Long Range": 9900,
    "Bizliner": 12000
  };

  const perkPricing = {
    "De-icing Included": { retail: 10000, cost: 8000 },
    "WiFi Included": { retail: 3500, cost: 2500 },
    "Catering": { retail: 2500, cost: 1800 },
    "Carbon Offset": { retail: 2000, cost: 1000 },
    "Chauffeur Service": { retail: 3500, cost: 2500 }
  };

  function updateCardPreview() {
    if (previewHolder) previewHolder.textContent = cardHolderInput?.value.trim() || "—";
    if (previewHours) previewHours.textContent = flightHoursInput?.value.trim() || "—";
    if (previewCategory) previewCategory.textContent = jetCategoryInput?.value.trim() || "—";

    const requestValue = specialRequestInput?.value.trim() || "";
    if (previewRequests) {
      previewRequests.textContent = requestValue || "—";
      previewRequests.classList.toggle("long", requestValue.length > 45);
    }

    const selectedPerks = Array.from(perksInputs)
      .filter(cb => cb.checked)
      .map(cb => cb.value.trim());

    const perkText = selectedPerks.join(", ");
    if (previewPerks) {
      previewPerks.textContent = perkText || "—";
      previewPerks.classList.toggle("long", perkText.length > 40);
    }
  }

  function updateEstimate() {
    const category = jetCategoryInput?.value || "";
    const hours = parseFloat(flightHoursInput?.value || "0");

    let retail = (hourlyRetail[category] || 0) * hours;
    let cost = (hourlyCost[category] || 0) * hours;

    perksInputs.forEach(cb => {
      if (cb.checked && perkPricing[cb.value]) {
        retail += perkPricing[cb.value].retail;
        cost += perkPricing[cb.value].cost;
      }
    });

    latestRetail = retail;
    latestCost = cost;

    if (retailDisplay) retailDisplay.textContent = retail.toLocaleString("en-US", { style: "currency", currency: "USD" });
    if (costDisplay) costDisplay.textContent = cost.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  // Attach listeners to update everything on input
  [cardHolderInput, flightHoursInput, jetCategoryInput, specialRequestInput, ...perksInputs].forEach(el => {
    if (!el) return;
    el.addEventListener("input", () => {
      updateCardPreview();
      updateEstimate();
    });
    el.addEventListener("change", () => {
      updateCardPreview();
      updateEstimate();
    });
  });

  // Initial load
  updateCardPreview();
  updateEstimate();

  // HubSpot form submission
  const crmForm = document.getElementById("jet-card-crm-form");
  if (crmForm) {
    crmForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateEstimate();

      const data = {
        fields: [
          { name: "firstname", value: document.getElementById("first_name")?.value || "" },
          { name: "lastname", value: document.getElementById("last_name")?.value || "" },
          { name: "email", value: document.getElementById("email")?.value || "" },
          { name: "phone", value: document.getElementById("phone")?.value || "" },
          { name: "preferred_contact", value: Array.from(document.querySelectorAll("input[name='preferred_contact']:checked")).map(cb => cb.value).join(", ") },
          { name: "card_holder", value: cardHolderInput?.value || "" },
          { name: "flight_hours", value: flightHoursInput?.value || "" },
          { name: "jet_category", value: jetCategoryInput?.value || "" },
          { name: "jet_card_perks", value: Array.from(perksInputs).filter(cb => cb.checked).map(cb => cb.value).join(", ") },
          { name: "special_request", value: specialRequestInput?.value || "" },
          { name: "internal_cost", value: latestCost.toFixed(2) },
          { name: "retail_total", value: latestRetail.toFixed(2) }
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };

      fetch("https://api.hsforms.com/submissions/v3/integration/submit/242890389/e5ee7f06-1028-4aab-b3b9-ebd8e9de4def", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.ok) {
          window.location.href = "https://horizonjets.com/thank-you/";
        } else {
          alert("Submission failed. Please try again.");
        }
      }).catch(err => {
        console.error("HubSpot error:", err);
        alert("Error sending data to CRM.");
      });
    });
  }
});