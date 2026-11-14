// ================== NIVELES ==================
const LEVELS=[null,
  {range:'1–5',max:4},{range:'5–15',max:4},{range:'15–35',max:3},{range:'35–50',max:2},
  {range:'50–100',max:2},{range:'100–200',max:2},{range:'200–400',max:2}];
const lvlFor=n=>n<=5?1:n<=15?2:n<=35?3:n<=50?4:n<=100?5:n<=200?6:7;
const BAG_FROM=50;
