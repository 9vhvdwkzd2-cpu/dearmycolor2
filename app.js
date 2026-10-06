(function () {
  const form = document.getElementById("applicationForm");
  const formView = document.getElementById("formView");
  const resultView = document.getElementById("resultView");
  const summary = document.getElementById("summary");
  const submitButton = form.querySelector(".submit");
  const submitError = document.getElementById("submitError");
  const restartButton = document.getElementById("restartButton");
  const phoneInput = document.getElementById("phone");
  const endpoint = (window.APP_CONFIG && window.APP_CONFIG.SHEET_ENDPOINT) || "";

  // 연락처 자동 하이픈 (010-1234-5678)
  phoneInput.addEventListener("input", function () {
    const d = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (d.length < 4) phoneInput.value = d;
    else if (d.length < 8) phoneInput.value = d.slice(0, 3) + "-" + d.slice(3);
    else phoneInput.value = d.slice(0, 3) + "-" + d.slice(3, d.length - 4) + "-" + d.slice(-4);
  });

  function checked(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (el) {
      return el.value;
    });
  }

  function collect() {
    return {
      name: form.name.value.trim(),
      age: form.age.value.trim(),
      gender: checked("gender")[0] || "",
      area: form.area.value.trim(),
      phone: form.phone.value.trim(),
      days: checked("days"),
      times: checked("times"),
      website: form.website.value // 스팸 방지용 숨김 필드
    };
  }

  function getRules(data) {
    return {
      nameField: data.name.length > 0,
      ageField: /^\d+$/.test(data.age) && +data.age >= 10 && +data.age <= 99,
      genderField: data.gender !== "",
      areaField: data.area.length > 0,
      phoneField: /^01\d-?\d{3,4}-?\d{4}$/.test(data.phone),
      daysField: data.days.length > 0,
      timesField: data.times.length > 0
    };
  }

  // 필수 항목을 모두 채웠을 때만 신청 버튼을 활성 색으로 표시
  const submitHint = document.getElementById("submitHint");
  function updateSubmitState() {
    const rules = getRules(collect());
    const complete = Object.keys(rules).every(function (id) { return rules[id]; });
    submitButton.classList.toggle("incomplete", !complete);
    submitHint.hidden = complete;
  }

  function validate(data) {
    const rules = getRules(data);
    let firstInvalid = null;
    Object.keys(rules).forEach(function (id) {
      const field = document.getElementById(id);
      field.classList.toggle("invalid", !rules[id]);
      if (!rules[id] && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return !firstInvalid;
  }

  function renderSummary(data) {
    summary.textContent = [
      "이름: " + data.name,
      "나이: " + data.age,
      "성별: " + data.gender,
      "거주 지역: " + data.area,
      "연락처: " + data.phone,
      "가능 요일: " + data.days.join(", "),
      "가능 시간대: " + data.times.join(", ")
    ].join("\n");
  }

  function setLoading(on) {
    submitButton.disabled = on;
    submitButton.textContent = on ? "신청 중..." : "신청하기";
  }

  form.addEventListener("input", function (e) {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("invalid");
    updateSubmitState();
  });
  form.addEventListener("change", updateSubmitState);
  updateSubmitState();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    submitError.textContent = "";
    const data = collect();
    if (!validate(data)) return;

    if (!endpoint) {
      submitError.textContent = "config.js에 SHEET_ENDPOINT가 설정되지 않았습니다.";
      return;
    }

    setLoading(true);
    try {
      // text/plain으로 보내야 Apps Script에서 CORS 사전요청 없이 받을 수 있습니다.
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "저장 실패");

      renderSummary(data);
      formView.style.display = "none";
      resultView.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      submitError.textContent = "신청 전송에 실패했어요. 잠시 후 다시 시도해 주세요.";
    } finally {
      setLoading(false);
    }
  });

  restartButton.addEventListener("click", function () {
    form.reset();
    updateSubmitState();
    resultView.style.display = "none";
    formView.style.display = "block";
    document.getElementById("pageToggle").checked = false;
    window.scrollTo({ top: 0 });
  });
})();
