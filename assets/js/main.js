// EcoRide Hub - Main Application Script

document.addEventListener("DOMContentLoaded", () => {
  // 1. RTL & THEME TOGGLE CONTROLS (WORKS ON EVERY PAGE)
  const rtlToggle = document.querySelector("#rtl-toggle");
  const rtlText = document.querySelector("#rtl-text");
  const themeToggle = document.querySelector("#theme-toggle");
  const themeIcon = document.querySelector("#theme-icon");
  const themeText = document.querySelector("#theme-text");

  const syncThemeUI = (theme) => {
    const isDark = theme === "dark";
    if (themeIcon) themeIcon.textContent = isDark ? "\u2600\uFE0F" : "\uD83C\uDF19";
    if (themeText) themeText.textContent = isDark ? "Light" : "Dark";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.title = isDark ? "Switch to light theme" : "Switch to dark theme";
      themeToggle.classList.toggle("active", isDark);
    }
  };

  const syncRtlUI = (dir) => {
    const isRtl = dir === "rtl";
    if (rtlText) rtlText.textContent = isRtl ? "LTR" : "RTL";
    if (rtlToggle) {
      rtlToggle.setAttribute("aria-label", isRtl ? "Switch to LTR layout" : "Switch to RTL layout");
      rtlToggle.title = isRtl ? "Switch to Left-to-Right layout" : "Switch to Right-to-Left layout";
      rtlToggle.classList.toggle("active", isRtl);
    }
  };

  const activeTheme = localStorage.getItem("ecoride_theme") || document.documentElement.getAttribute("data-theme") || "light";
  const activeDir = localStorage.getItem("ecoride_dir") || document.documentElement.getAttribute("dir") || "ltr";

  document.documentElement.setAttribute("data-theme", activeTheme);
  document.documentElement.setAttribute("dir", activeDir);
  syncThemeUI(activeTheme);
  syncRtlUI(activeDir);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("ecoride_theme", nextTheme);
      syncThemeUI(nextTheme);
    });
  }

  if (rtlToggle) {
    rtlToggle.addEventListener("click", () => {
      const nextDir = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      document.documentElement.setAttribute("dir", nextDir);
      localStorage.setItem("ecoride_dir", nextDir);
      syncRtlUI(nextDir);
    });
  }

  // 2. STICKY NAVBAR SCROLL ELEVATION
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add("scrolled");
      } else {
        siteHeader.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // 2. MOBILE NAVIGATION TOGGLE
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close on nav link click
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target) && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2B. HOME DROPDOWN TOGGLE (HOME 1 & HOME 2)
  const navDropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownToggle = document.querySelector("[data-dropdown-toggle]");

  if (navDropdown && dropdownToggle) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navDropdown.classList.toggle("is-open");
      dropdownToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (!navDropdown.contains(e.target) && navDropdown.classList.contains("is-open")) {
        navDropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navDropdown.classList.contains("is-open")) {
        navDropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 3. PRODUCT CATALOG FILTERS (PRODUCTS.HTML)
  const filterButtons = document.querySelectorAll("[data-filter]");
  const productCards = document.querySelectorAll("[data-category]");

  if (filterButtons.length && productCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        let visibleCount = 0;
        productCards.forEach((card) => {
          const category = card.dataset.category;
          const range = card.dataset.range;
          const shouldShow =
            filter === "all" || category === filter || range === filter;

          card.classList.toggle("hidden", !shouldShow);
          if (shouldShow) visibleCount++;
        });

        const countBadge = document.querySelector("[data-product-count]");
        if (countBadge) {
          countBadge.textContent = `${visibleCount} model${visibleCount === 1 ? '' : 's'} available`;
        }
      });
    });
  }

  // 4. INTERACTIVE SAVINGS CALCULATOR IN RUPEES (COMPARE.HTML)
  const distSlider = document.querySelector("#calc-dist");
  const fuelSlider = document.querySelector("#calc-fuel");
  const daysSelect = document.querySelector("#calc-days");

  if (distSlider && fuelSlider) {
    const distVal = document.querySelector("#calc-dist-val");
    const fuelVal = document.querySelector("#calc-fuel-val");
    const monthlySaveEl = document.querySelector("#calc-monthly-savings");
    const annualSaveEl = document.querySelector("#calc-annual-savings");
    const co2SaveEl = document.querySelector("#calc-co2-savings");
    const paybackEl = document.querySelector("#calc-payback");

    const updateCalculator = () => {
      const dailyKm = parseFloat(distSlider.value);
      const fuelCostPerLitre = parseFloat(fuelSlider.value);
      const daysPerWeek = daysSelect ? parseFloat(daysSelect.value) : 5;

      if (distVal) distVal.textContent = `${dailyKm} km`;
      if (fuelVal) fuelVal.textContent = `\u20B9${fuelCostPerLitre.toFixed(0)}/L`;

      // Calculations in Indian Rupees (Rs / INR):
      // Average petrol scooter mileage: ~35 km/L
      // Electric scooter power consumption: ~0.024 kWh/km
      // Domestic electricity tariff: ~Rs 8.00 / kWh
      const daysPerMonth = (daysPerWeek * 52) / 12;
      const monthlyKm = dailyKm * daysPerMonth;

      const monthlyPetrolCost = (monthlyKm / 35) * fuelCostPerLitre;
      const monthlyEvCost = monthlyKm * 0.024 * 8.0;
      const monthlySavings = Math.max(0, monthlyPetrolCost - monthlyEvCost);
      const annualSavings = monthlySavings * 12;

      // Carbon savings: ~110g CO2 per km saved vs petrol engine
      const annualCo2Kg = Math.round((monthlyKm * 12 * 0.11));

      // Payback months for an average Rs 85,000 electric scooter:
      const paybackMonths = annualSavings > 0 ? (85000 / monthlySavings).toFixed(1) : "\u2014";

      if (monthlySaveEl) monthlySaveEl.textContent = `\u20B9${Math.round(monthlySavings).toLocaleString('en-IN')}`;
      if (annualSaveEl) annualSaveEl.textContent = `\u20B9${Math.round(annualSavings).toLocaleString('en-IN')}`;
      if (co2SaveEl) co2SaveEl.textContent = `${annualCo2Kg} kg`;
      if (paybackEl) paybackEl.textContent = `${paybackMonths} mo`;
    };

    distSlider.addEventListener("input", updateCalculator);
    fuelSlider.addEventListener("input", updateCalculator);
    if (daysSelect) daysSelect.addEventListener("change", updateCalculator);
    updateCalculator();
  }

  // 5. FORM SUBMISSION VALIDATION & FIELD-LEVEL ENFORCEMENT
  // A. Strict Live Input Filtering: Names accept letters only; Phones accept numbers only
  const nameInputs = document.querySelectorAll('input[name="name"], input[id*="name"]');
  nameInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      // Strip any numbers or special characters other than letters, spaces, hyphens, and apostrophes
      const cleaned = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
      if (input.classList.contains("is-invalid") && cleaned.trim().length >= 2) {
        input.classList.remove("is-invalid");
      }
    });

    input.addEventListener("blur", () => {
      const val = input.value.trim();
      if (val && (val.length < 2 || /[^a-zA-Z\s'-]/.test(val))) {
        input.classList.add("is-invalid");
      } else if (val) {
        input.classList.remove("is-invalid");
      }
    });
  });

  const phoneInputs = document.querySelectorAll('input[name="phone"], input[type="tel"], input[id*="phone"]');
  phoneInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      // Numbers alone: strip any non-digit character and cap at 10 digits
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
      if (e.target.value !== digitsOnly) {
        e.target.value = digitsOnly;
      }
      if (input.classList.contains("is-invalid") && digitsOnly.length === 10) {
        input.classList.remove("is-invalid");
      }
    });

    input.addEventListener("blur", () => {
      const digits = input.value.replace(/\D/g, "");
      if (digits && digits.length !== 10) {
        input.classList.add("is-invalid");
      } else if (digits) {
        input.classList.remove("is-invalid");
      }
    });
  });

  // B. Comprehensive Form Submission Validation
  const forms = document.querySelectorAll("[data-form]");

  forms.forEach((form) => {
    const messageBox = form.querySelector("[data-form-message]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formName = form.dataset.form;
      const allInputs = form.querySelectorAll("input, select, textarea");
      let firstInvalidField = null;
      let errorMessage = "";

      // Clear previous error states
      allInputs.forEach((f) => f.classList.remove("is-invalid"));

      // 1. Check required fields
      const requiredFields = form.querySelectorAll("[required]");
      for (const field of requiredFields) {
        if (field.type === "checkbox") {
          if (!field.checked) {
            field.classList.add("is-invalid");
            if (!firstInvalidField) {
              firstInvalidField = field;
              errorMessage = "Please accept the required consent terms before submitting.";
            }
          }
        } else if (!field.value.trim()) {
          field.classList.add("is-invalid");
          if (!firstInvalidField) {
            firstInvalidField = field;
            const label = form.querySelector(`label[for="${field.id}"]`);
            const labelText = label ? label.textContent.replace("*", "").trim() : "required fields";
            errorMessage = `Please fill out the "${labelText}" field.`;
          }
        }
      }

      // 2. Validate Name fields specifically: letters and spaces only
      const formNameInput = form.querySelector('input[name="name"], input[id*="name"]');
      if (formNameInput && formNameInput.value.trim()) {
        const nameVal = formNameInput.value.trim();
        if (nameVal.length < 2) {
          formNameInput.classList.add("is-invalid");
          if (!firstInvalidField) {
            firstInvalidField = formNameInput;
            errorMessage = "Name error: Full name must be at least 2 characters long.";
          }
        } else if (/[^a-zA-Z\s'-]/.test(nameVal)) {
          formNameInput.classList.add("is-invalid");
          if (!firstInvalidField) {
            firstInvalidField = formNameInput;
            errorMessage = "Name error: Name should contain letters only (numbers and symbols are not allowed).";
          }
        }
      }

      // 3. Validate Phone fields specifically: 10 digits only, numbers alone
      const formPhoneInput = form.querySelector('input[name="phone"], input[type="tel"], input[id*="phone"]');
      if (formPhoneInput && formPhoneInput.value.trim()) {
        const phoneDigits = formPhoneInput.value.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          formPhoneInput.classList.add("is-invalid");
          if (!firstInvalidField) {
            firstInvalidField = formPhoneInput;
            errorMessage = "Contact error: Phone number should contain numbers alone (must be exactly 10 digits).";
          }
        }
      }

      // 4. Validate Email if present
      const formEmailInput = form.querySelector('input[type="email"], input[name="email"]');
      if (formEmailInput && formEmailInput.value.trim()) {
        const emailVal = formEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
          formEmailInput.classList.add("is-invalid");
          if (!firstInvalidField) {
            firstInvalidField = formEmailInput;
            errorMessage = "Email error: Please enter a valid email address (e.g. name@example.com).";
          }
        }
      }

      if (!messageBox) return;

      if (firstInvalidField) {
        messageBox.className = "message-box is-visible error";
        messageBox.textContent = errorMessage || "Please correct the highlighted errors before submitting.";
        firstInvalidField.focus();
        messageBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      // If valid, generate confirmation reference and display success
      const randomCode = "ECO-" + Math.floor(10000 + Math.random() * 90000);
      let successMessage = "";
      if (formName === "booking") {
        successMessage = `\u2713 Test ride reservation confirmed! Your booking reference is #${randomCode}. Our showroom concierge will contact you by SMS/call to finalize your preferred time slot.`;
      } else if (formName === "service") {
        successMessage = `\u2713 Service appointment confirmed! Your service token is #${randomCode}. Our workshop service manager will contact you with bay confirmation and arrival details.`;
      } else {
        successMessage = `\u2713 Thank you! Your enquiry has been routed to our specialist team. We respond within 4 business hours with custom advice and pricing.`;
      }

      messageBox.className = "message-box is-visible success";
      messageBox.textContent = successMessage;
      form.reset();

      // Clear any remaining validation classes
      allInputs.forEach((f) => f.classList.remove("is-invalid", "is-valid"));

      messageBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  // 6. CURRENT YEAR FOOTER
  const yearElements = document.querySelectorAll("[data-current-year]");
  yearElements.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // 7. CUSTOM CURVED SELECT DROPDOWNS (CONTACT, BOOKING & COMPARE)
  const initCustomSelects = () => {
    const selects = document.querySelectorAll("select");
    selects.forEach((select) => {
      if (select.dataset.customized === "true") return;
      select.dataset.customized = "true";

      const wrapper = document.createElement("div");
      wrapper.className = "custom-select-box";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const labelSpan = document.createElement("span");
      labelSpan.className = "custom-select-label";
      const currentOpt = select.options[select.selectedIndex] || select.options[0];
      labelSpan.textContent = currentOpt ? currentOpt.textContent : "";
      if (currentOpt) trigger.title = currentOpt.textContent;

      const arrowSpan = document.createElement("span");
      arrowSpan.className = "custom-select-arrow";
      arrowSpan.innerHTML = "&#9662;";

      trigger.appendChild(labelSpan);
      trigger.appendChild(arrowSpan);

      const dropdown = document.createElement("div");
      dropdown.className = "custom-select-dropdown";
      dropdown.setAttribute("role", "listbox");

      const refreshOptions = () => {
        dropdown.innerHTML = "";
        Array.from(select.options).forEach((opt, idx) => {
          const optEl = document.createElement("div");
          optEl.className =
            "custom-select-option" + (idx === select.selectedIndex ? " is-selected" : "");
          optEl.setAttribute("role", "option");
          optEl.textContent = opt.textContent;

          optEl.addEventListener("click", (e) => {
            e.stopPropagation();
            select.selectedIndex = idx;
            labelSpan.textContent = opt.textContent;
            trigger.title = opt.textContent;
            dropdown
              .querySelectorAll(".custom-select-option")
              .forEach((o) => o.classList.remove("is-selected"));
            optEl.classList.add("is-selected");
            wrapper.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");

            select.dispatchEvent(new Event("change", { bubbles: true }));
            select.dispatchEvent(new Event("input", { bubbles: true }));
          });

          dropdown.appendChild(optEl);
        });
      };

      refreshOptions();

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));

        // Close any other open custom selects
        document.querySelectorAll(".custom-select-box.is-open").forEach((other) => {
          if (other !== wrapper) {
            other.classList.remove("is-open");
            const otherTrig = other.querySelector(".custom-select-trigger");
            if (otherTrig) otherTrig.setAttribute("aria-expanded", "false");
          }
        });
      });

      // Synchronize when native select changes externally or resets
      select.addEventListener("change", () => {
        const sel = select.options[select.selectedIndex];
        if (sel) {
          labelSpan.textContent = sel.textContent;
          trigger.title = sel.textContent;
          dropdown.querySelectorAll(".custom-select-option").forEach((o, i) => {
            o.classList.toggle("is-selected", i === select.selectedIndex);
          });
        }
      });

      const parentForm = select.closest("form");
      if (parentForm) {
        parentForm.addEventListener("reset", () => {
          setTimeout(() => {
            const first = select.options[select.selectedIndex] || select.options[0];
            if (first) {
              labelSpan.textContent = first.textContent;
              trigger.title = first.textContent;
              dropdown.querySelectorAll(".custom-select-option").forEach((o, i) => {
                o.classList.toggle("is-selected", i === select.selectedIndex);
              });
            }
          }, 10);
        });
      }

      // Insert wrapper into DOM
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(trigger);
      wrapper.appendChild(dropdown);
      wrapper.appendChild(select);
      select.classList.add("visually-hidden-select");
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".custom-select-box.is-open").forEach((box) => {
        if (!box.contains(e.target)) {
          box.classList.remove("is-open");
          const t = box.querySelector(".custom-select-trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".custom-select-box.is-open").forEach((box) => {
          box.classList.remove("is-open");
          const t = box.querySelector(".custom-select-trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
      }
    });
  };

  initCustomSelects();
});
