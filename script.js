const firebaseConfig = {
  apiKey: "AIzaSyD5hYcYpCJmcnlKs_R7EJ_DmD2HoLfM1xI",
  authDomain: "habittrackeros.firebaseapp.com",
  projectId: "habittrackeros",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const start = new Date(2026, 1, 7); // Feb 7 2026
const end = new Date(2027, 1, 7);   // Feb 7 2027

function buildGrid(name, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const weeksContainer = document.createElement("div");
  weeksContainer.className = "weeks";
  container.appendChild(weeksContainer);

  // Prepare all days, skipping Feb 6 2026
  const allDates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip Feb 6 2026
    if (d.getFullYear() === 2026 && d.getMonth() === 1 && d.getDate() === 6) continue;
    allDates.push(new Date(d));
  }

  // Group into weeks (Sunday start)
  const weeks = [];
  let week = [];
  const firstDay = new Date(start);
  // Fill initial empty days to align with Sunday
  for (let i = 0; i < firstDay.getDay(); i++) week.push(null);

  allDates.forEach(day => {
    week.push(day);
    if (day.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  // Render week columns
  weeks.forEach(weekDaysArr => {
    const weekCol = document.createElement("div");
    weekCol.className = "week-column";

    for (let i = 0; i < 7; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const day = weekDaysArr[i];
      if (day) {
        const dateStr = day.toISOString().slice(0, 10);
        dayDiv.title = dateStr;

        const ref = db.collection("habits").doc(name + "_" + dateStr);
        ref.onSnapshot(doc => {
          if (doc.exists && doc.data().done) dayDiv.classList.add("done");
          else dayDiv.classList.remove("done");
        });

        dayDiv.onclick = async () => {
          const snap = await ref.get();
          const current = snap.exists ? snap.data().done : false;
          ref.set({ done: !current });
        };
      } else {
        dayDiv.style.visibility = "hidden";
      }

      weekCol.appendChild(dayDiv);
    }

    weeksContainer.appendChild(weekCol);
  });
}

// Build grids
buildGrid("omar", "omar");
buildGrid("samarth", "samarth");
