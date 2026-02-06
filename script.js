const firebaseConfig = {
  apiKey: "AIzaSyD5hYcYpCJmcnlKs_R7EJ_DmD2HoLfM1xI",
  authDomain: "habittrackeros.firebaseapp.com",
  projectId: "habittrackeros",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const start = new Date(2026, 1, 7); // Feb 7 2026
const end   = new Date(2027, 1, 7); // Feb 7 2027

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildGrid(name, containerId) {
  const container = document.getElementById(containerId);

  // 1. Add month headers row
  const monthsRow = document.createElement("div");
  monthsRow.className = "grid";
  
  // Empty top-left cell for alignment
  const emptyCell = document.createElement("div");
  emptyCell.style.width = "40px";
  monthsRow.appendChild(emptyCell);

  // Create month columns
  const totalDays = Math.ceil((end - start)/(1000*60*60*24));
  let currentMonth = start.getMonth();
  let dayCount = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDate() === 1 || dayCount === 0) {
      const monthDiv = document.createElement("div");
      monthDiv.className = "month-label";
      monthDiv.style.gridColumnStart = dayCount + 2; // offset by day labels
      monthDiv.textContent = monthNames[d.getMonth()];
      monthsRow.appendChild(monthDiv);
    }
    dayCount++;
  }
  container.appendChild(monthsRow);

  // 2. Add day rows
  for (let wd = 0; wd < 7; wd++) {
    const row = document.createElement("div");
    row.className = "grid";

    // Day label
    const dayLabel = document.createElement("div");
    dayLabel.className = "day-label";
    dayLabel.textContent = weekDays[wd];
    row.appendChild(dayLabel);

    // Fill each day
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== wd) continue;

      const dateStr = d.toISOString().slice(0,10);
      const box = document.createElement("div");
      box.className = "day";
      box.title = dateStr;

      const ref = db.collection("habits").doc(name + "_" + dateStr);

      ref.onSnapshot(doc => {
        if (doc.exists && doc.data().done) {
          box.classList.add("done");
        } else {
          box.classList.remove("done");
        }
      });

      box.onclick = async () => {
        const snap = await ref.get();
        const current = snap.exists ? snap.data().done : false;
        ref.set({ done: !current });
      };

      row.appendChild(box);
    }

    container.appendChild(row);
  }
}

// Build grids for each person
buildGrid("omar", "omar");
buildGrid("samarth", "samarth");
