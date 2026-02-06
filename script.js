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
  container.innerHTML = ""; // clear

  // Create month labels container
  const monthLabelsContainer = document.createElement("div");
  monthLabelsContainer.className = "month-labels";
  container.appendChild(monthLabelsContainer);

  // Create a container for the weeks
  const weeksContainer = document.createElement("div");
  weeksContainer.style.display = "flex";
  container.appendChild(weeksContainer);

  // Prepare days
  const allDates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  // Group days by week (starting on Sunday)
  const weeks = [];
  let week = [];
  for (let i = 0; i < allDates.length; i++) {
    const day = allDates[i];
    if (day.getDay() === 0 && week.length > 0) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  }
  if (week.length > 0) weeks.push(week);

  // Render month labels
  weeks.forEach((weekDaysArr, weekIndex) => {
    const firstDay = weekDaysArr[0];
    const monthDiv = document.createElement("div");
    monthDiv.className = "month-label";

    // Only put label if first day of month
    if (firstDay.getDate() <= 7) {
      monthDiv.textContent = monthNames[firstDay.getMonth()];
      monthDiv.style.width = (weekDaysArr.length * 18) + "px"; // approximate width
      monthLabelsContainer.appendChild(monthDiv);
    } else {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.width = (weekDaysArr.length * 18) + "px";
      monthLabelsContainer.appendChild(emptyDiv);
    }
  });

  // Render week columns
  weeks.forEach(weekDaysArr => {
    const weekCol = document.createElement("div");
    weekCol.className = "week-column";

    // Fill 7 days
    for (let i = 0; i < 7; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const day = weekDaysArr.find(d => d.getDay() === i);
      if (day) {
        const dateStr = day.toISOString().slice(0,10);
        dayDiv.title = dateStr;

        const ref = db.collection("habits").doc(name + "_" + dateStr);
        ref.onSnapshot(doc => {
          if (doc.exists && doc.data().done) {
            dayDiv.classList.add("done");
          } else {
            dayDiv.classList.remove("done");
          }
        });

        dayDiv.onclick = async () => {
          const snap = await ref.get();
          const current = snap.exists ? snap.data().done : false;
          ref.set({ done: !current });
        };
      } else {
        dayDiv.style.visibility = "hidden"; // empty cell for alignment
      }

      weekCol.appendChild(dayDiv);
    }

    weeksContainer.appendChild(weekCol);
  });
}

// Build grids
buildGrid("omar", "omar");
buildGrid("samarth", "samarth");
