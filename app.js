const steps = [
  { name: "理解问题与口径", detail: "将“昨天”解析为数据日期 2026-09-15；华北包含北京、天津、河北；销售额采用支付口径。", tool: "读取：指标定义" },
  { name: "检索业务上下文", detail: "找到区域映射、活动日历和 T+1 新鲜度说明，仅保留与本题相关的三段上下文。", tool: "检索：业务文档" },
  { name: "查询区域销售额", detail: "主查询确认华北从 120 万降至 96 万，环比 -20.0%，变化超过日常波动阈值。", tool: "调用：region_sales" },
  { name: "拆解城市与漏斗", detail: "北京贡献 54.2% 的降幅；访问量下降 18.0%，支付转化率由 4.6% 降至 4.2%。", tool: "调用：city_funnel" },
  { name: "核对事件与替代解释", detail: "北京促销活动在前日结束；退款率变化小，其他区域未出现同步异常。", tool: "调用：event_and_refund_check" },
  { name: "验证证据并交付", detail: "量级、结构与事件三类证据一致。保留“主要原因”表述，不把共现写成唯一因果。", tool: "规则：evidence_gate" }
];

const evidence = {
  region: "华北销售额由 120 万降至 96 万；北京减少 13 万，占总降幅 54.2%。天津与河北的变化不足以单独解释整体下降。",
  funnel: "北京访问量下降 18.0%，支付转化率由 4.6% 降至 4.2%；两个环节同时回落，与销售额方向一致。",
  check: "退款率仅轻微变化，数据已完成 T+1 校验；华东与华南没有同步波动，排除全站数据故障这一替代解释。"
};

const stepList = document.querySelector("#stepList");
const stepDetail = document.querySelector("#stepDetail");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const replayButton = document.querySelector("#replayButton");
const evidenceDetail = document.querySelector("#evidenceDetail");
let visibleSteps = steps.length;
let timer;

function selectStep(index) {
  document.querySelectorAll(".step").forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === index));
  const step = steps[index];
  stepDetail.innerHTML = `<h4>${String(index + 1).padStart(2, "0")} · ${step.name}</h4><p>${step.detail}</p><span class="tool-tag">${step.tool}</span>`;
}

function renderSteps() {
  stepList.innerHTML = steps.map((step, index) => {
    const pending = index >= visibleSteps;
    return `<button class="step ${pending ? "pending" : ""}" type="button" data-step="${index}" ${pending ? "disabled" : ""}>
      <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="step-name">${step.name}</span>
      <span class="status">${pending ? "等待" : "通过"}</span>
    </button>`;
  }).join("");
  progressText.textContent = `${visibleSteps} / ${steps.length} 已完成`;
  progressBar.style.width = `${visibleSteps / steps.length * 100}%`;
  document.querySelectorAll(".step:not(.pending)").forEach(button => {
    button.addEventListener("click", () => selectStep(Number(button.dataset.step)));
  });
  if (visibleSteps > 0) selectStep(visibleSteps - 1);
}

function replay() {
  clearInterval(timer);
  visibleSteps = 0;
  stepDetail.innerHTML = "<h4>正在准备上下文</h4><p>从问题定义开始，逐步开放完成的分析节点。</p>";
  renderSteps();
  timer = setInterval(() => {
    visibleSteps += 1;
    renderSteps();
    if (visibleSteps === steps.length) clearInterval(timer);
  }, 520);
}

document.querySelectorAll("[data-evidence]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-evidence]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    evidenceDetail.textContent = evidence[button.dataset.evidence];
  });
});

replayButton.addEventListener("click", replay);
renderSteps();
