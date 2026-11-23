import { PubSimulator } from "/simulator.js";
import { renderChoices, renderSnapshot } from "/renderer-2d.js";

const simulator = new PubSimulator();
const root = document;
let sessionId;

function showMessage(message) {
  root.querySelector("#message").textContent = message;
}

function renderAudit() {
  const list = root.querySelector("#event-list");
  const status = root.querySelector("#audit-status");
  if (!sessionId) return;
  const receipt = simulator.getReceipt(sessionId);
  list.replaceChildren(...receipt.events.map(event => {
    const row = document.createElement("li");
    const sequence = document.createElement("span");
    const type = document.createElement("span");
    const hash = document.createElement("span");
    sequence.textContent = String(event.sequence).padStart(2, "0");
    type.textContent = event.type;
    hash.className = "hash";
    hash.textContent = `${event.hash.slice(0, 10)}…`;
    row.append(sequence, type, hash);
    return row;
  }));
  status.textContent = `${receipt.events.length} event${receipt.events.length === 1 ? "" : "s"} · schema v${receipt.schemaVersion}`;
}

async function update(snapshot, message) {
  renderSnapshot(root, snapshot);
  renderAudit();
  root.querySelector("#enter").disabled = snapshot.active;
  if (message) showMessage(message);
}

root.querySelector("#consent").addEventListener("change", event => {
  root.querySelector("#enter").disabled = Boolean(sessionId && simulator.getSnapshot(sessionId).active);
  if (!event.currentTarget.checked) showMessage("Consent is optional and can be refused.");
});

root.querySelector("#enter").addEventListener("click", async () => {
  const seed = Number(root.querySelector("#seed").value);
  try {
    const snapshot = await simulator.startSession({
      participantId: "participant-1",
      observerId: "observer-1",
      consent: root.querySelector("#consent").checked,
      durationTicks: Number(root.querySelector("#duration").value),
      seed
    });
    sessionId = snapshot.sessionId;
    await update(snapshot, snapshot.active ? "Session started. Modulation is zero by default." : "Session refused; nothing was started.");
  } catch {
    showMessage("Invalid setup. Use the bounded tick and seed values shown.");
  }
});

root.querySelector("#modulation").addEventListener("input", event => {
  root.querySelector("#modulation-value").value = `${event.currentTarget.value}%`;
});

root.querySelector("#apply").addEventListener("click", async () => {
  const level = Number(root.querySelector("#modulation").value) / 100;
  const result = await simulator.setModulation(sessionId, { level });
  if (result.accepted) await update(result.snapshot, "Simulated presentation changed; canonical state is unchanged.");
});

root.querySelector("#choices").addEventListener("click", async () => {
  renderChoices(root, await simulator.presentChoices(sessionId));
  renderAudit();
});

root.querySelector("#recover").addEventListener("click", async () => {
  await update(await simulator.recover(sessionId), "Recovery verified at baseline; the session remains opt-in and local.");
});

root.querySelector("#tick").addEventListener("click", async () => {
  await update(await simulator.advanceTicks(sessionId, 1), "Advanced one simulated tick.");
});

for (const [id, action, message] of [
  ["cancel", "cancel", "Participation cancelled; baseline restored."],
  ["disconnect", "disconnect", "Disconnect path simulated; baseline restored."],
  ["reset", "emergencyReset", "Emergency reset verified."]
]) {
  root.querySelector(`#${id}`).addEventListener("click", async () => {
    await update(await simulator[action](sessionId), message);
    root.querySelector("#enter").disabled = false;
  });
}
