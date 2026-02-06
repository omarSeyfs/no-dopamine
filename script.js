const firebaseConfig = {
  apiKey: "AIzaSyD5hYcYpCJmcnlKs_R7EJ_DmD2HoLfM1xI",
  authDomain: "habittrackeros.firebaseapp.com",
  projectId: "habittrackeros",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const start = new Date(2026, 1, 7); // Feb 7 2026
const end = new Date(2027, 1, 7);   // Feb 7 2027

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildGrid(name, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Month labels container
  const monthLabels = document.createElement("div");
  monthLabels.className = "month-labels";
  container.appendChild(monthLabels);

  // Weeks container
  const weeksContainer = document.createElement("div");
  weeksContainer.className = "weeks";
  weeksContainer.style.display = "flex";
  container.appendChild(weeksContainer);

  // Create a map of month to its first day column
  const allDates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  const weeks = [];
  let week = [];
  allDates.forEach(day => {
    week.push(day);
    if (day.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  // Render week columns
  weeks.forEach((weekDaysArr, weekIndex) => {
    const weekCol = document.createElement("div");
    weekCol.className = "week-column";

    for (let i = 0; i < 7; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const day = weekDaysArr.find(d => d && d.getDay() === i);
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

  // Month labels
  const monthPositions = {};
  allDates.forEach((date, idx) => {
    const month = date.getMonth();
    if (!(month in monthPositions)) monthPositions[month] = idx;
  });

  const weekWidth = 18; // width of a week column in px
  Object.entries(monthPositions).forEach(([month, dayIdx]) => {
    const weekIndex = Math.floor(dayIdx / 7);
    const label = document.createElement("div");
    label.className = "month-label";
    label.textContent = monthNames[month];
    label.style.position = "absolute";
    label.style.left = weekIndex * (weekWidth + 4) + 20 + "px"; // offset 20px for day labels
    monthLabels.appendChild(label);
  });

  monthLabels.style.position = "relative";
}
