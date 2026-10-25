/* ==========================================================================
 * 英文原文（USMLE 风格变式题）：window.ML_TRANSLATIONS["<id>"] = {...}
 * 来源：data/q-ext-usmle.js（usm-201 ~ usm-230，共 30 题）
 *       + data/q-ext.js 中 3 道 USMLE 风格题（ext-usm-001 ~ ext-usm-003）
 * 说明：按 USMLE 命题语言撰写；options 与中文一一对应、顺序一致（各 5 项）
 *       仅病例题带 caseText；answer 不在此文件内，题库答案仍以中文文件为准
 * ========================================================================== */
window.ML_TRANSLATIONS = window.ML_TRANSLATIONS || {};

/* ====================== Step 2 CK 病例题（A2） ====================== */

window.ML_TRANSLATIONS["usm-201"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate initial step in management?",
  options: [
    "Give oral nitroglycerin and discharge the patient home for observation, with a follow-up ECG in 1 week",
    "Start dual antiplatelet therapy and anticoagulation, and proceed to coronary angiography guided by risk stratification",
    "Administer immediate intravenous thrombolysis",
    "Perform immediate exercise treadmill testing to define the extent of ischemia",
    "Give a statin alone and discharge the patient once troponin has normalized"
  ],
  explain: "The patient has recurrent angina at rest with episodes lasting longer than 20 minutes, ST-segment depression and T-wave inversion without ST-segment elevation, and an elevated troponin I, findings consistent with non-ST-elevation myocardial infarction (NSTEMI). Management is early dual antiplatelet therapy plus anticoagulation, followed by coronary angiography and revascularization guided by risk stratification. Thrombolysis is indicated only for ST-elevation myocardial infarction; in NSTEMI it offers no benefit and increases the risk of bleeding. Exercise treadmill testing during the acute phase can precipitate infarction and is contraindicated. Treating with nitroglycerin and sending the patient home would miss a high-risk presentation. A statin alone neither inhibits thrombosis nor relieves ischemia, and normalization of troponin does not indicate clinical stability.",
  caseText: "A 64-year-old man is admitted for 3 days of recurrent chest tightness that worsened 2 hours ago. Over the past 3 days he has had recurrent substernal pressure at rest, each episode lasting 5 to 10 minutes and relieved by rest; 2 hours ago the chest pain became persistent and unrelieved. He has an 8-year history of hypertension and a 5-year history of type 2 diabetes, and he has smoked for 30 years. Physical examination: BP 150/85 mmHg, HR 88/min, no crackles on lung auscultation, normal heart sounds, no murmurs. ECG: horizontal ST-segment depression of 0.2 mV in leads V3 through V6 with T-wave inversion, and no ST-segment elevation in any lead. Laboratory studies: cardiac troponin I is elevated.",
  tip: "Check the ST segment first: elevation favors thrombolysis, whereas no elevation calls for antithrombotic therapy plus an invasive strategy"
};

window.ML_TRANSLATIONS["usm-202"] = {
  lang: "en",
  stem: "Which of the following is the most likely diagnosis for this patient's exertional dyspnea?",
  options: [
    "Heart failure with preserved ejection fraction (HFpEF)",
    "Heart failure with reduced ejection fraction (HFrEF)",
    "Acute exacerbation of chronic obstructive pulmonary disease",
    "Constrictive pericarditis",
    "Chronic cor pulmonale"
  ],
  explain: "An older woman with a long history of hypertension and diabetes presents with exertional dyspnea, orthopnea requiring extra pillows, bibasilar crackles, and lower-extremity edema, with an elevated B-type natriuretic peptide (BNP). Her left ventricular ejection fraction (LVEF) is 62%, indicating heart failure with preserved ejection fraction (HFpEF), which is driven by left ventricular diastolic dysfunction and elevated left atrial pressure. HFrEF requires a substantially reduced ejection fraction and is not supported here. An acute exacerbation of chronic obstructive pulmonary disease (COPD) would show airflow limitation and evidence of infection, and would not explain the elevated BNP or left atrial enlargement. Constrictive pericarditis usually follows tuberculosis or pericarditis and shows pericardial thickening and impaired ventricular filling on echocardiography, rather than predominant left ventricular wall thickening. Chronic cor pulmonale is characterized by right ventricular enlargement and pulmonary hypertension, whereas this patient's disease is primarily left-sided.",
  caseText: "A 72-year-old woman presents with 1 year of exertional dyspnea that has worsened over the past 2 weeks; she now needs to sleep with extra pillows, but she has had no episodes of paroxysmal nocturnal dyspnea with pink frothy sputum. She has a 15-year history of hypertension and a 10-year history of type 2 diabetes, with no history of coronary artery disease or myocardial infarction. Physical examination: BP 158/88 mmHg, a few crackles at both lung bases, the cardiac apex displaced downward and to the left, HR 76/min and regular, no significant murmurs, and mild pitting edema of both lower extremities. Echocardiography: left ventricular ejection fraction (LVEF) 62%, left ventricular wall thickening, left atrial enlargement, an elevated ratio of mitral E-wave velocity to tissue Doppler e-prime velocity, and no significant valvular stenosis or regurgitation. B-type natriuretic peptide (BNP) is elevated.",
  tip: "Normal ejection fraction plus congestion and an elevated BNP means HFpEF"
};

window.ML_TRANSLATIONS["usm-203"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate next step in management at this time?",
  options: [
    "Immediate synchronized direct-current cardioversion",
    "Attempt vagal maneuvers first (such as the Valsalva maneuver), and give intravenous adenosine if these fail",
    "Give intravenous verapamil immediately as the first-line agent",
    "Give intravenous amiodarone immediately",
    "Start oral metoprolol and arrange outpatient follow-up"
  ],
  explain: "A young woman with palpitations that start and stop abruptly has a narrow-complex tachycardia with a regular R-R interval and visible retrograde P waves, consistent with paroxysmal supraventricular tachycardia (PSVT). Because she is hemodynamically stable, with a normal blood pressure and intact consciousness, termination should begin with vagal maneuvers (Valsalva maneuver, carotid sinus massage), followed by intravenous adenosine or adenosine triphosphate if these fail. Synchronized direct-current cardioversion is reserved for hemodynamically unstable patients and is not first-line here. Verapamil is a reasonable option, but its onset and safety profile are inferior to those of adenosine, so it is a second choice. Amiodarone is used mainly for ventricular arrhythmias and atrial fibrillation. Oral metoprolol acts too slowly for acute termination.",
  caseText: "A 26-year-old woman presents with palpitations that began suddenly 40 minutes ago. The episodes start and stop abruptly; she has had similar episodes that terminated spontaneously after tens of minutes, without amaurosis or syncope. Physical examination: BP 105/68 mmHg, alert, HR 186/min and regular, no murmurs, clear breath sounds, warm extremities. ECG: narrow-complex tachycardia with a regular R-R interval, sinus P waves not clearly identifiable, and inverted P waves visible after the QRS complexes.",
  tip: "Narrow QRS, regular rhythm, stable blood pressure: vagal maneuvers first, then adenosine"
};

window.ML_TRANSLATIONS["usm-204"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate management for this patient during the stable phase?",
  options: [
    "Long-term domiciliary oxygen therapy for at least 15 hours per day",
    "Long-term maintenance oral corticosteroids",
    "Long-term prophylactic oral antibiotics to prevent acute exacerbations",
    "Intermittent high-concentration oxygen three times daily for 30 minutes each",
    "Prolonged bed rest with avoidance of physical activity"
  ],
  explain: "The patient has severe chronic obstructive pulmonary disease (COPD), and his resting PaO2 of 52 mmHg while stable meets the indication for long-term domiciliary oxygen therapy: low-flow continuous oxygen for at least 15 hours per day improves survival. Intermittent high-concentration oxygen does not improve outcomes and may worsen carbon dioxide retention. Long-term oral corticosteroids do not improve outcomes in stable COPD and increase the risk of osteoporosis and infection. Long-term prophylactic oral antibiotics are considered only in selected patients with repeated exacerbations and are not a routine measure. Prolonged bed rest aggravates muscle wasting and the decline in pulmonary function; pulmonary rehabilitation should be encouraged instead.",
  caseText: "A 68-year-old man has smoked for 45 years and has had chronic cough and sputum production for 25 years and exertional dyspnea for 8 years. In the past 2 years he has been hospitalized three times for acute exacerbations of chronic obstructive pulmonary disease. He is currently in the stable phase, without fever or an increase in purulent sputum. Physical examination: barrel chest, diminished breath sounds bilaterally, no obvious wheezing, mild cyanosis of the lips, no lower-extremity edema. Pulmonary function tests: post-bronchodilator FEV1/FVC 52%, FEV1 48% of predicted. Arterial blood gas on room air at rest: PaO2 52 mmHg, PaCO2 46 mmHg.",
  tip: "In stable COPD, only long-term oxygen therapy has been shown to prolong survival"
};

window.ML_TRANSLATIONS["usm-205"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate next step to improve asthma control?",
  options: [
    "Add long-term oral corticosteroids immediately",
    "Correct the inhaler technique, verify adherence, and reduce allergen exposure, and consider stepping up therapy only if control remains poor",
    "Stop the inhaled corticosteroid and switch to a long-acting beta-2 agonist alone",
    "Escalate directly to biologic therapy",
    "Increase the inhaled corticosteroid to the maximal dose without assessing other factors"
  ],
  explain: "Despite taking the prescribed medication, the patient has frequent nocturnal symptoms and frequent need for rescue medication, indicating uncontrolled asthma. The first step in evaluating poorly controlled asthma is to verify adherence, inhaler technique, and environmental triggers; this patient has correctable factors, including actuation out of phase with inhalation and exposure to cats. Therapy should be stepped up only if control remains inadequate after these factors are addressed. A long-acting beta-2 agonist (LABA) used alone increases the risk of asthma-related death and is contraindicated. Long-term oral corticosteroids have substantial adverse effects and are reserved for severe refractory asthma. Biologics are indicated for severe eosinophilic or allergic asthma only after optimized inhaled therapy has been evaluated. Simply maximizing the inhaled corticosteroid dose without correcting inhaler technique is unlikely to improve control.",
  caseText: "A 28-year-old woman has a 10-year history of bronchial asthma. Despite regular use of inhaled budesonide/formoterol as prescribed over the past 3 months, she still awakens at night three times per week and uses a short-acting beta-2 agonist four to five times per week, with no history of severe acute exacerbation. Physical examination: clear breath sounds bilaterally without wheezing. Pulmonary function tests: FEV1 84% of predicted with a positive bronchodilator response; fractional exhaled nitric oxide is elevated. She has never smoked and keeps two cats at home. At this follow-up visit she is observed not to shake the pressurized metered-dose inhaler adequately and to actuate it out of phase with inhalation.",
  tip: "When asthma is poorly controlled, check three things first: adherence, inhaler technique, and triggers"
};

window.ML_TRANSLATIONS["usm-206"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate respiratory support strategy for this patient?",
  options: [
    "Endotracheal intubation and mechanical ventilation with a low-tidal-volume lung-protective strategy plus applied positive end-expiratory pressure (PEEP)",
    "High-dose intravenous diuretics to reduce pulmonary edema",
    "Immediate inhaled nitric oxide with emergency transfer for surgery",
    "Continue increasing the nasal cannula oxygen flow to 10 L/min and observe",
    "High-dose intravenous corticosteroids as the primary treatment"
  ],
  explain: "Acute progressive hypoxemia with diffuse bilateral infiltrates after severe acute pancreatitis, together with normal left ventricular systolic function on echocardiography that excludes cardiogenic pulmonary edema, is consistent with acute respiratory distress syndrome (ARDS). The cornerstone of management is early endotracheal intubation and mechanical ventilation using a low-tidal-volume lung-protective strategy with adequate positive end-expiratory pressure (PEEP) to recruit alveoli, improve oxygenation, and limit ventilator-induced lung injury. High-dose diuretics are appropriate for cardiogenic pulmonary edema and would worsen hemodynamic instability here. Inhaled nitric oxide is not standard first-line therapy, and there is no indication for emergency surgery. Further increasing the nasal cannula flow cannot correct intrapulmonary shunt. Corticosteroids are not a primary treatment for ARDS.",
  caseText: "A 42-year-old man is on day 3 of admission for severe acute pancreatitis. Over the past 12 hours he has developed progressive dyspnea, and his oxygenation remains difficult to maintain despite oxygen at 5 L/min by nasal cannula. Physical examination: respiratory rate 38/min, cyanosis of the lips, scattered crackles bilaterally, no jugular venous distention, no lower-extremity edema. Chest CT: diffuse ground-glass opacities and consolidation in both lungs, without pleural effusion. Arterial blood gas on supplemental oxygen: PaO2 52 mmHg, PaCO2 33 mmHg, pH 7.45. Echocardiography: normal left ventricular systolic function, no significant valvular disease.",
  tip: "ARDS triad: acute onset, bilateral infiltrates, and edema not explained by heart failure; treat with lung-protective ventilation"
};

window.ML_TRANSLATIONS["usm-207"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate management at this time?",
  options: [
    "Stop lactulose immediately and switch to a high-protein diet to improve nutrition",
    "Remove precipitating factors (correct the hypokalemia and adjust diuretics), restrict protein intake briefly, and give lactulose orally or as an enema",
    "Perform hemodialysis immediately to remove ammonia",
    "Infuse intravenous albumin and perform large-volume paracentesis",
    "Give intravenous diazepam as first-line treatment for the agitation"
  ],
  explain: "A patient with cirrhosis develops impaired consciousness and asterixis with elevated blood ammonia after a large protein-rich meal, in the setting of hypokalemia and diuretic use, findings consistent with hepatic encephalopathy. Management centers on removing precipitating factors: correct the hypokalemia, hold or adjust diuretics, and treat infection and bleeding, while briefly restricting protein intake and giving lactulose orally or as an enema to acidify the colon and reduce ammonia absorption; rifaximin may be added if needed. Sedatives such as diazepam aggravate central nervous system depression and should be avoided. Hemodialysis is not a routine treatment for hepatic encephalopathy. Large-volume paracentesis can worsen hypokalemia and encephalopathy, and albumin infusion alone does not clear ammonia. Continuing a high-protein diet would raise blood ammonia further.",
  caseText: "A 55-year-old man has a 10-year history of hepatitis B-related cirrhosis. Three days ago, after eating a large amount of braised pork and eggs, he developed daytime somnolence, nighttime agitation, and slowed responses to questions. He has recently been taking furosemide for ascites. Physical examination: stigmata of chronic liver disease, palmar erythema, spider angiomas, positive asterixis, no lower-extremity edema, no shifting dullness. Laboratory studies: elevated blood ammonia, serum albumin 30 g/L, mildly elevated total bilirubin, serum potassium 3.3 mmol/L. Head CT is unremarkable.",
  tip: "In hepatic encephalopathy, look for precipitants first: high protein intake, hypokalemia, diuretics, infection, and bleeding"
};

window.ML_TRANSLATIONS["usm-208"] = {
  lang: "en",
  stem: "Which of the following is the most likely diagnosis for this patient's sudden severe abdominal pain?",
  options: [
    "Acute pancreatitis",
    "Acute perforation of a peptic ulcer",
    "Acute cholecystitis",
    "Acute mesenteric ischemia",
    "Spontaneous esophageal rupture"
  ],
  explain: "A long history of duodenal ulcer disease followed by sudden knife-like epigastric pain after alcohol intake that rapidly spreads across the whole abdomen, with board-like rigidity, diminished liver dullness, absent bowel sounds, and crescent-shaped free air under both hemidiaphragms on an upright abdominal radiograph, is the classic picture of acute perforation of a peptic ulcer. Acute pancreatitis typically causes continuous epigastric pain radiating to the back, with elevated serum amylase and no subdiaphragmatic free air. Acute cholecystitis causes pain localized to the right upper quadrant with a positive Murphy sign. Acute mesenteric ischemia usually occurs in patients with atrial fibrillation and causes severe pain with relatively mild abdominal findings. Spontaneous esophageal rupture typically follows forceful vomiting and presents with pneumomediastinum and pleural effusion.",
  caseText: "A 38-year-old man has a 3-year history of duodenal ulcer disease, has taken omeprazole intermittently, and has not kept regular follow-up appointments. Two hours ago, after drinking alcohol, he developed sudden knife-like epigastric pain that rapidly spread across the entire abdomen. Physical examination: temperature 37.8 degrees C, BP 110/70 mmHg, HR 108/min, generalized tenderness with rebound tenderness, board-like abdominal muscle rigidity, diminished liver dullness, and absent bowel sounds. Upright abdominal radiograph: crescent-shaped free air under both hemidiaphragms.",
  tip: "Board-like abdomen plus loss of liver dullness and subdiaphragmatic free air means a perforated ulcer"
};

window.ML_TRANSLATIONS["usm-209"] = {
  lang: "en",
  stem: "Which of the following is the most likely histologic type of this child's renal lesion?",
  options: [
    "Minimal change disease",
    "Membranous nephropathy",
    "Membranoproliferative glomerulonephritis",
    "Focal segmental glomerulosclerosis",
    "Mesangioproliferative glomerulonephritis"
  ],
  explain: "A 6-year-old boy develops edema and oliguria after a recent upper respiratory infection, with massive proteinuria, hypoalbuminemia, and hypercholesterolemia but a normal blood pressure, normal complement C3 and antistreptolysin O titers, and no significant red cells in the urine sediment, findings consistent with uncomplicated primary nephrotic syndrome. Minimal change disease is the most common cause of primary nephrotic syndrome in children, so it is the most likely histologic type. Membranous nephropathy occurs mainly in middle-aged and older adults and is often associated with anti-phospholipase A2 receptor antibodies. Membranoproliferative glomerulonephritis usually shows persistently low complement C3 and hematuria. Focal segmental glomerulosclerosis is often accompanied by hypertension, hematuria, and steroid resistance. Mesangioproliferative glomerulonephritis usually presents with microscopic hematuria.",
  caseText: "A 6-year-old boy presents with periorbital edema for 5 days and decreased urine output for 2 days. He had an upper respiratory infection 2 weeks ago. Physical examination: BP 100/65 mmHg, pitting edema of both eyelids and lower extremities, soft abdomen without shifting dullness, clear breath sounds. Laboratory studies: urine protein 4+, markedly elevated 24-hour urinary protein excretion, serum albumin 18 g/L, elevated total cholesterol, normal serum creatinine, normal complement C3, normal antistreptolysin O titer. Urine sediment: no significant red blood cells.",
  tip: "Childhood uncomplicated nephrotic syndrome: treat as minimal change disease first, because the steroid response rate is high"
};

window.ML_TRANSLATIONS["usm-210"] = {
  lang: "en",
  stem: "Which of the following is the most likely diagnosis for this patient's impaired consciousness?",
  options: [
    "Hyperosmolar hyperglycemic state (HHS)",
    "Diabetic ketoacidosis (DKA)",
    "Lactic acidosis",
    "Hypoglycemic coma",
    "Acute cerebrovascular disease"
  ],
  explain: "An older man with type 2 diabetes develops lethargy in the setting of a pulmonary infection and reduced fluid intake, with extreme hyperglycemia, hypernatremia, and markedly elevated plasma osmolality, but negative serum ketones and near-normal arterial pH and bicarbonate, findings consistent with hyperosmolar hyperglycemic state (HHS). Diabetic ketoacidosis (DKA) is characterized by ketosis and metabolic acidosis and occurs mainly in type 1 diabetes and younger patients. Lactic acidosis is associated with metformin, but it would not produce such extreme hyperglycemia, and the pH would be markedly reduced. Hypoglycemic coma causes low rather than high blood glucose. Acute cerebrovascular disease does not explain the extreme hyperglycemia and hyperosmolality and would be expected to produce focal neurologic signs.",
  caseText: "A 74-year-old man has had type 2 diabetes for 12 years and takes oral metformin and gliclazide with poor glycemic control. One week ago, after a pulmonary infection, his appetite and fluid intake decreased, and over the past 2 days he has become somnolent and slow to respond. Physical examination: temperature 38.2 degrees C, BP 96/60 mmHg, HR 112/min, dry skin with poor turgor, crackles at both lung bases, no obvious limb paralysis. Laboratory studies: blood glucose 42 mmol/L, serum sodium 152 mmol/L, negative serum ketones, arterial pH 7.38, serum bicarbonate 24 mmol/L, markedly elevated plasma osmolality, elevated serum creatinine.",
  tip: "Extreme hyperglycemia plus hypernatremia, high osmolality, and negative ketones means HHS"
};

window.ML_TRANSLATIONS["usm-211"] = {
  lang: "en",
  stem: "With effective treatment, which of the following laboratory parameters changes first?",
  options: [
    "An increase in the hemoglobin concentration",
    "An increase in the reticulocyte count",
    "Normalization of serum ferritin",
    "Normalization of the mean corpuscular volume",
    "Normalization of serum iron"
  ],
  explain: "This patient has iron deficiency anemia due to menorrhagia, and oral iron restores erythropoiesis. The reticulocyte count begins to rise 5 to 10 days after therapy is started and is the earliest indicator of response. Hemoglobin typically begins to rise at about 2 weeks, later than the reticulocyte count. Normalization of the mean corpuscular volume takes weeks to months. Serum iron rises soon after a dose but fluctuates widely and is not a reliable measure of response. Serum ferritin reflects iron stores and normalizes last, usually requiring several more months of iron therapy to replete stores.",
  caseText: "A 32-year-old woman presents with 6 months of fatigue and dizziness. Her menstrual periods are heavy and last 8 to 10 days. Physical examination: pallor, brittle nails with koilonychia, and angular cheilitis. Laboratory studies: Hb 82 g/L, MCV 72 fL, MCH 24 pg, MCHC 300 g/L, reticulocyte percentage at the low end of normal, serum ferritin 8 micrograms/L, low serum iron, and elevated total iron-binding capacity. Fecal occult blood is negative. Oral ferrous sulfate has been started, and the cause of her menorrhagia is being investigated.",
  tip: "Response to iron: reticulocytes rise first, hemoglobin follows, and ferritin normalizes last"
};

window.ML_TRANSLATIONS["usm-212"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate next step in management?",
  options: [
    "The blood pressure is within the normal range, so no intervention is needed now; reassess in 2 hours",
    "Begin prompt fluid resuscitation while identifying and controlling the source of infection and starting antimicrobials early",
    "Give a bolus of norepinephrine alone to raise the blood pressure to the patient's usual level",
    "Give intravenous furosemide to increase urine output",
    "Transfuse packed red blood cells to improve oxygen-carrying capacity"
  ],
  explain: "Although the blood pressure is within the normal range for the general population, it is well below this patient's baseline, and the combination of tachycardia, cold clammy extremities, prolonged capillary refill, oliguria, elevated lactate, and low central venous pressure indicates tissue hypoperfusion, an early compensated stage of septic shock. Observation is therefore inappropriate despite a seemingly normal blood pressure. Management is prompt fluid resuscitation together with early identification and control of the infection source and early antimicrobial therapy. Vasopressors are indicated when hypotension persists after adequate fluid resuscitation, and norepinephrine is the preferred agent; starting a pressor alone is not appropriate. Diuretics would further reduce the effective circulating volume. Transfusion is not beneficial in the absence of significant anemia.",
  caseText: "A 58-year-old woman is admitted with severe pneumonia. Physical examination: temperature 39.0 degrees C, BP 112/68 mmHg (her usual blood pressure is about 145/85 mmHg), HR 118/min, respiratory rate 26/min, cold clammy extremities, capillary refill time prolonged to 4 seconds, urine output 20 mL/h. Laboratory studies: blood lactate 4.2 mmol/L, WBC 18 x 10(9)/L, markedly elevated procalcitonin. Central venous pressure 4 cmH2O.",
  tip: "A normal blood pressure does not mean normal perfusion: check lactate, urine output, and extremity temperature"
};

window.ML_TRANSLATIONS["usm-213"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate first-line treatment?",
  options: [
    "Give intravenous calcium gluconate immediately to stabilize the myocardial cell membrane",
    "Give intravenous insulin plus glucose immediately to shift potassium into cells",
    "Give an oral potassium-binding resin immediately",
    "Arrange hemodialysis immediately",
    "Give intravenous furosemide immediately to promote potassium excretion"
  ],
  explain: "In a patient with chronic renal failure, high-potassium foods and herbal medicine raise the serum potassium to 6.9 mmol/L, and the ECG shows tall peaked T waves with a narrow base, flattened P waves, and QRS widening, indicating hyperkalemia that threatens cardiac conduction and may progress to ventricular fibrillation or asystole. The first priority is intravenous calcium gluconate, which directly stabilizes the myocardial cell membrane and antagonizes the cardiotoxic effects of potassium; it does not lower the serum potassium but rapidly eliminates the risk of a lethal arrhythmia. Insulin with glucose is then given to shift potassium into cells, together with an oral potassium binder or dialysis to remove potassium. Hemodialysis is the most effective way to remove potassium, but preparation is time-consuming and it cannot be the first step. Furosemide is ineffective for potassium excretion in renal failure.",
  caseText: "A 62-year-old man has a 5-year history of chronic renal failure and is not on dialysis. Over the past 2 days, while taking a self-prescribed herbal decoction for a cold and eating large amounts of oranges, he developed limb weakness and palpitations. Physical examination: BP 150/90 mmHg, HR 52/min and regular, mild lower-extremity edema. ECG: tall peaked T waves with a narrow base, flattened P waves, and QRS widening. Laboratory studies: serum potassium 6.9 mmol/L, markedly elevated serum creatinine, blood pH 7.28.",
  tip: "Hyperkalemia with ECG changes: give calcium first to protect the heart, then lower the potassium"
};

window.ML_TRANSLATIONS["usm-214"] = {
  lang: "en",
  stem: "In addition to supportive care with antimicrobials and fluids, which of the following is the most appropriate management?",
  options: [
    "Emergency cholecystostomy",
    "Endoscopic retrograde cholangiopancreatography (ERCP) with stone extraction and nasobiliary drainage",
    "Observation alone until the jaundice resolves spontaneously",
    "Immediate choledochojejunostomy",
    "Oral ursodeoxycholic acid for stone dissolution"
  ],
  explain: "Right upper quadrant colicky pain, rigors, high fever, and jaundice constitute Charcot triad, and laboratory studies show obstructive jaundice with predominantly direct hyperbilirubinemia and elevated biliary enzymes; ultrasonography shows a dilated common bile duct containing a stone. The diagnosis is choledocholithiasis complicated by acute cholangitis. The key to treatment is prompt relief of biliary obstruction and drainage of infected bile; endoscopic retrograde cholangiopancreatography (ERCP) with stone extraction and nasobiliary drainage is the preferred approach because it is minimally invasive and achieves decompression rapidly. Observation alone may progress to acute obstructive suppurative cholangitis. Cholecystostomy addresses only the gallbladder and does not relieve common bile duct obstruction. Choledochojejunostomy is reserved for the later management of biliary strictures or stones that cannot be cleared and is inappropriate during acute infection. Ursodeoxycholic acid is ineffective for common bile duct stones and acts far too slowly.",
  caseText: "A 58-year-old woman presents with 1 day of paroxysmal right upper quadrant colicky pain, followed by rigors, high fever, and then yellow discoloration of the skin and sclerae. Physical examination: temperature 39.2 degrees C, BP 118/72 mmHg, alert, right upper quadrant tenderness, positive Murphy sign. Laboratory studies: WBC 16 x 10(9)/L, elevated total and direct bilirubin, markedly elevated alkaline phosphatase and gamma-glutamyl transpeptidase. Abdominal ultrasonography: dilated common bile duct with a hyperechoic stone and acoustic shadowing, and thickening of the gallbladder wall.",
  tip: "Charcot triad plus a common bile duct stone: drainage (ERCP) is required along with antimicrobial therapy"
};

window.ML_TRANSLATIONS["usm-215"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate next step in management for this child?",
  options: [
    "Immediate air (or barium) enema reduction",
    "Immediate emergency exploratory laparotomy",
    "Oral laxatives to promote bowel movement",
    "Intravenous anisodamine for antispasmodic relief, then discharge home for observation",
    "Immediate upper endoscopy"
  ],
  explain: "A 2-year-old child with paroxysmal crying, vomiting, and a single passage of currant-jelly stool, with a tender sausage-shaped mass in the right upper quadrant, an empty right lower quadrant, and a target sign on transverse ultrasonography, has the classic presentation of acute intussusception. Because symptoms began within 48 hours and there are no signs of peritonitis or of bowel necrosis and perforation, air (or barium) enema reduction is the first-line treatment and is both diagnostic and therapeutic. Emergency laparotomy is reserved for failed enema reduction, suspected bowel necrosis or perforation, or a prolonged course. Oral laxatives may worsen the intussusception and precipitate perforation. Antispasmodics followed by discharge home would delay reduction. Upper endoscopy has no diagnostic or therapeutic role in intussusception.",
  caseText: "A 2-year-old boy is brought for 1 day of paroxysmal crying and three episodes of vomiting. His parents report that he cries for a period of time about every 20 minutes, drawing his legs up, and is quiet between episodes; he passed one currant-jelly mucus-containing stool in the past 6 hours. Physical examination: temperature 37.5 degrees C, slightly lethargic, a tender sausage-shaped mass palpable in the right upper quadrant, an empty right lower quadrant on palpation, and hyperactive bowel sounds. Abdominal ultrasonography: a target sign on the transverse view.",
  tip: "Paroxysmal crying plus currant-jelly stool and a sausage-shaped mass means intussusception; an enema is both diagnostic and therapeutic"
};

window.ML_TRANSLATIONS["usm-216"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate management?",
  options: [
    "Stop methimazole immediately and manage as agranulocytosis with infection (protective isolation, broad-spectrum antimicrobials, and colony-stimulating factor)",
    "Continue methimazole at the current dose and add oral antibiotics",
    "Increase the methimazole dose to control the hyperthyroidism more rapidly",
    "Proceed immediately to subtotal thyroidectomy",
    "Switch to oral propylthiouracil and continue antithyroid therapy"
  ],
  explain: "Two months after starting methimazole, the patient develops fever and a sore throat with marked neutropenia, indicating antithyroid drug-induced agranulocytosis, the most dangerous adverse effect of these agents, which usually occurs during the first 2 to 3 months of therapy. Methimazole should be stopped immediately, and the patient should be managed as agranulocytosis with infection: protective isolation, broad-spectrum antimicrobials, and granulocyte colony-stimulating factor. Continuing or increasing the dose would aggravate marrow suppression. Propylthiouracil is also a thionamide and can cause the same reaction, so it should not be substituted immediately. Subtotal thyroidectomy must be deferred until hyperthyroidism is controlled and the infection has resolved.",
  caseText: "A 30-year-old woman with Graves disease started oral methimazole 2 months ago, with gradual dose adjustment. Three days ago she developed a sore throat and fever that did not improve with self-administered acetaminophen. Physical examination: temperature 38.9 degrees C, pharyngeal erythema, tonsillar enlargement with purulent exudate, a soft diffusely enlarged thyroid gland, HR 106/min. Laboratory studies: WBC 1.6 x 10(9)/L, absolute neutrophil count 0.3 x 10(9)/L.",
  tip: "Fever and sore throat during antithyroid therapy: check the CBC and think of agranulocytosis"
};

window.ML_TRANSLATIONS["usm-217"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate management for this patient?",
  options: [
    "Reduce the exposed fracture end immediately, apply a pressure dressing, and send the patient to the operating room for elective surgery",
    "Emergency debridement and fracture fixation, with early intravenous antimicrobials and tetanus prophylaxis",
    "Apply a dressing only and wait about 1 week for the swelling to subside before surgery",
    "Suture the wound in the emergency department immediately without debridement",
    "Irrigate continuously with large volumes of hydrogen peroxide for 3 days, then debride"
  ],
  explain: "This is an open fracture of the right tibia with an exposed bone end and a contaminated wound. The principles of management are emergency debridement and fracture fixation with early intravenous antimicrobials and tetanus prophylaxis, to reduce the risk of deep infection and osteomyelitis. The exposed bone end should not be reduced in the field, because doing so would carry contaminants into deep tissues; therefore, immediate reduction followed by elective surgery is incorrect. Delaying surgery for 1 week allows a contaminated wound to become infected. Suturing the wound without debridement seals contaminants and necrotic tissue in deep spaces. Prolonged continuous irrigation does not substitute for thorough debridement, and repeated hydrogen peroxide irrigation also damages tissue.",
  caseText: "A 30-year-old man falls from a motorcycle and presents with right lower leg pain and bleeding for 2 hours. Physical examination: BP 125/75 mmHg, HR 96/min, a 6-cm wound over the anteromedial aspect of the mid-right lower leg with the fracture end exposed and dirt and gravel within the wound; the dorsalis pedis pulse is palpable, and toe movement and sensation are normal. Radiograph: transverse fracture of the midshaft of the right tibia with mild displacement.",
  tip: "Open fracture: debridement, fixation, antimicrobials, and tetanus prophylaxis; do not push the exposed bone end back in the field"
};

window.ML_TRANSLATIONS["usm-218"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate management for this patient?",
  options: [
    "Immediate ureterolithotomy",
    "Antispasmodic analgesia and generous fluid intake, with an alpha-1 blocker as an adjunct to facilitate stone passage, and periodic follow-up",
    "Immediate extracorporeal shock wave lithotripsy",
    "Immediate intravenous high-dose antimicrobials",
    "Immediate percutaneous nephrostomy"
  ],
  explain: "Sudden knife-like flank pain radiating to the perineum, microscopic hematuria, and costovertebral angle tenderness, with CT confirming a ureteral stone, indicate renal colic caused by a ureteral calculus. The stone is about 5 mm in diameter, there is no fever or evidence of infection, and hydronephrosis is mild, so it is likely to pass spontaneously. First-line management is antispasmodic analgesia and generous fluid intake, with an alpha-1 blocker to relax the distal ureter and facilitate passage, plus periodic imaging follow-up. Extracorporeal shock wave lithotripsy (ESWL) is generally used for larger stones or when conservative therapy fails. Ureterolithotomy is reserved for impacted or large stones or for obstruction complicated by infection. High-dose antimicrobials are of no benefit without evidence of infection. Percutaneous nephrostomy is used for obstruction with pyonephrosis or infection that is difficult to control.",
  caseText: "A 38-year-old man presents with 3 hours of sudden knife-like left flank pain radiating to the left lower abdomen and perineum, with nausea and vomiting and meat-wash-colored urine. Physical examination: temperature 36.8 degrees C, left costovertebral angle tenderness, mild left lower quadrant tenderness without rebound tenderness, no lower-extremity edema. Laboratory studies: urine microscopy shows red cells in every field and a few white cells; the blood leukocyte count is normal. Urinary tract CT: a stone about 5 mm in diameter in the upper left ureter with mild left hydronephrosis.",
  tip: "Small stone, no infection, mild hydronephrosis: analgesia and stone passage first, not lithotripsy or surgery"
};

window.ML_TRANSLATIONS["usm-219"] = {
  lang: "en",
  stem: "Which of the following is the most likely pathologic basis of this patient's cerebral infarction?",
  options: [
    "Rupture of an atherosclerotic carotid plaque with superimposed thrombosis and embolization of debris to intracranial arteries",
    "Cardioembolism due to atrial fibrillation",
    "Rupture of a microaneurysm formed by hypertensive arteriolosclerosis",
    "Inflammatory stenosis of an intracranial artery",
    "Vessel rupture due to cerebral amyloid angiopathy"
  ],
  explain: "An older man with atherosclerotic risk factors (hypertension, diabetes, and smoking) develops sudden focal neurologic deficits, and head CT excludes hemorrhage, indicating ischemic stroke. Carotid ultrasonography shows an irregular plaque with surface ulceration at the origin of the left internal carotid artery, suggesting plaque rupture with local thrombosis or detachment of cholesterol crystals that embolize to intracranial arteries, the most likely pathologic basis of the infarction in this patient. The ECG shows sinus rhythm, which argues against cardioembolism from atrial fibrillation. Rupture of a microaneurysm caused by hypertensive arteriolosclerosis produces intracerebral hemorrhage, which is inconsistent with the CT findings. Inflammatory intracranial arteritis occurs mainly in young women or in the setting of infections such as syphilis. Cerebral amyloid angiopathy typically causes lobar hemorrhage in older adults.",
  caseText: "A 66-year-old man presents with 6 hours of sudden right-sided weakness and slurred speech. He has a 12-year history of hypertension, an 8-year history of type 2 diabetes, and a 40-year history of smoking, with no history of atrial fibrillation. Physical examination: BP 168/92 mmHg, alert, motor aphasia, right central facial and lingual palsy, right upper limb strength grade 2 and right lower limb strength grade 3, right Babinski sign positive. Head CT shows no hemorrhage and a hypodensity in the territory of the left middle cerebral artery. Carotid ultrasonography: an irregular plaque with surface ulceration at the origin of the left internal carotid artery. ECG: sinus rhythm.",
  tip: "Ulcerated carotid plaque with sinus rhythm: think artery-to-artery embolism"
};

window.ML_TRANSLATIONS["usm-220"] = {
  lang: "en",
  stem: "Which of the following is the most likely diagnosis of this patient's renal lesion?",
  options: [
    "Membranous nephropathy",
    "Minimal change disease",
    "Membranoproliferative glomerulonephritis",
    "Acute diffuse proliferative glomerulonephritis",
    "IgA nephropathy"
  ],
  explain: "A middle-aged man presents with nephrotic syndrome and is positive for anti-phospholipase A2 receptor (PLA2R) antibodies. Kidney biopsy shows diffuse thickening of the glomerular basement membrane with spike formation on silver stain and fine granular IgG and C3 deposition along the basement membrane on immunofluorescence, findings diagnostic of membranous nephropathy. Minimal change disease shows essentially normal glomeruli on light microscopy, with foot process effacement and no immune complex deposition on electron microscopy. Membranoproliferative glomerulonephritis shows mesangial proliferation and double-contour basement membranes, often with low complement C3. Acute diffuse proliferative glomerulonephritis follows streptococcal infection and shows low complement with subepithelial humps. IgA nephropathy is characterized by mesangial IgA deposition and recurrent hematuria.",
  caseText: "A 56-year-old man presents with 2 months of lower-extremity edema and frothy urine. Physical examination: BP 138/82 mmHg, moderate pitting edema of both lower extremities, clear breath sounds. Laboratory studies: 24-hour urinary protein 6.8 g, serum albumin 22 g/L, elevated total cholesterol, normal serum creatinine, normal complement C3; serum anti-phospholipase A2 receptor (PLA2R) antibody is positive. Kidney biopsy light microscopy: diffuse thickening of the glomerular basement membrane with spike formation on silver stain; immunofluorescence: fine granular IgG and C3 deposition along the basement membrane.",
  tip: "Older adult with nephrotic syndrome, positive anti-PLA2R, and spikes on silver stain means membranous nephropathy"
};

/* ====================== Step 1 机制题（A1） ====================== */

window.ML_TRANSLATIONS["usm-221"] = {
  lang: "en",
  stem: "In an animal experiment, intravenous injection of norepinephrine markedly raises the blood pressure, but the heart rate slows instead. Which of the following is the most likely mechanism of the bradycardia?",
  options: [
    "Norepinephrine directly suppresses the automaticity of the sinoatrial node",
    "The rise in blood pressure activates the baroreceptor reflex of the carotid sinus and aortic arch, increasing cardiac vagal tone and decreasing cardiac sympathetic tone",
    "Norepinephrine stimulates cardiac beta-1 receptors, which slows the heart rate",
    "The rise in blood pressure directly inhibits the medullary cardiovascular center",
    "Activation of the renin-angiotensin system slows the heart rate"
  ],
  explain: "Intravenous norepinephrine acts mainly on vascular alpha-1 receptors, increasing peripheral resistance and raising blood pressure. The rise in pressure stretches the baroreceptors of the carotid sinus and aortic arch, and afferent impulses travel through the sinus nerve and vagus nerve to the medulla, increasing cardiac vagal tone and reducing cardiac sympathetic tone, so the heart rate slows; this is the negative-feedback regulation of the baroreceptor reflex. The direct effect of norepinephrine on cardiac beta-1 receptors is to accelerate the heart rate, but this is masked by the reflex bradycardia. Norepinephrine does not directly suppress sinoatrial node automaticity. The rise in blood pressure acts through the baroreceptor reflex rather than by directly inhibiting the medullary cardiovascular center. Activation of the renin-angiotensin system mainly causes vasoconstriction and aldosterone secretion and is not the principal mechanism of the bradycardia.",
  tip: "Bradycardia after a pressor agent: the baroreceptor reflex is applying the brakes"
};

window.ML_TRANSLATIONS["usm-222"] = {
  lang: "en",
  stem: "In an animal experiment, bilateral vagotomy causes breathing to become deeper and slower. Which of the following is the most direct explanation for this change?",
  options: [
    "The rhythmic activity of the medullary respiratory center is destroyed",
    "Afferent input from the pulmonary stretch reflex is interrupted, so the inhibition of inspiration by lung expansion during inspiration is lost",
    "The arterial partial pressure of carbon dioxide falls markedly",
    "Carotid body chemoreceptors lose their afferent input",
    "Efferent impulses in the phrenic nerve are blocked"
  ],
  explain: "Bilateral vagotomy interrupts the afferent limb of the pulmonary stretch reflex. During normal inspiration, lung expansion stretches receptors in the walls of the bronchi and bronchioles, and impulses travel through the vagus nerve to the medulla, inhibiting inspiratory neurons so that inspiration switches to expiration in a timely fashion. When this reflex is interrupted, inspiration is prolonged, so breathing becomes deeper and slower. The medullary respiratory center itself is not destroyed. Arterial carbon dioxide tension does not fall markedly as a result, and carbon dioxide acts mainly through central chemoreceptors. Carotid body afferents travel in the sinus nerve, a branch of the glossopharyngeal nerve, and were not cut; aortic body afferents do travel in the vagus nerve, but they play only a minor role during quiet breathing. The phrenic nerve is the efferent nerve to the diaphragm and was not cut in this experiment.",
  tip: "The vagus nerve carries the afferent limb of the pulmonary stretch reflex; after vagotomy, inspiration is prolonged and breathing becomes deep and slow"
};

window.ML_TRANSLATIONS["usm-223"] = {
  lang: "en",
  stem: "After intravenous furosemide is given for acute pulmonary edema, urine output increases markedly, but urine osmolality is close to that of plasma. Which of the following is the most likely site of action of this drug?",
  options: [
    "Inhibition of the sodium-glucose cotransporter in proximal tubule epithelial cells",
    "Inhibition of the sodium-potassium-2 chloride cotransporter in the luminal membrane of the thick ascending limb of the loop of Henle, so that the medullary osmotic gradient cannot be established",
    "Blockade of antidiuretic hormone receptors on collecting duct epithelial cells",
    "Inhibition of sodium-potassium exchange in the distal convoluted tubule and collecting duct",
    "Inhibition of carbonic anhydrase, reducing bicarbonate reabsorption"
  ],
  explain: "Furosemide inhibits the sodium-potassium-2 chloride cotransporter in the luminal membrane of the thick ascending limb of the loop of Henle, blocking sodium chloride reabsorption so that the renal medullary osmotic gradient cannot be established. The collecting duct then lacks the driving force for water reabsorption, and a large volume of nearly isosmotic urine is excreted, with a urine osmolality close to that of plasma. Inhibition of the proximal tubular sodium-glucose cotransporter is the mechanism of sodium-glucose cotransporter 2 inhibitors. Blockade of antidiuretic hormone receptors in the collecting duct is the mechanism of tolvaptan. Inhibition of sodium-potassium exchange in the distal convoluted tubule and collecting duct is the mechanism of potassium-sparing diuretics such as spironolactone and triamterene. Inhibition of carbonic anhydrase is the mechanism of acetazolamide.",
  tip: "Loop diuretics abolish the medullary osmotic gradient, so the urine cannot be concentrated"
};

window.ML_TRANSLATIONS["usm-224"] = {
  lang: "en",
  stem: "After accidental ingestion of a substance containing strychnine, a patient develops rigid muscle spasms, and even minor stimuli provoke generalized convulsions, yet consciousness is preserved. Which of the following is the most likely site of action of this toxin?",
  options: [
    "Blockade of the inhibitory effect of glycine released by spinal Renshaw cells on motor neurons",
    "Blockade of acetylcholine receptors on the endplate membrane of the neuromuscular junction",
    "Increased release of acetylcholine from the presynaptic membrane",
    "Blockade of the synthesis of the central inhibitory transmitter gamma-aminobutyric acid (GABA)",
    "Direct inhibition of anterior horn motor neurons in the spinal cord"
  ],
  explain: "Strychnine selectively blocks glycine receptors in the spinal cord and brainstem. Renshaw cells are inhibitory interneurons in the anterior horn of the spinal cord whose axon terminals release glycine and produce recurrent inhibition of anterior horn motor neurons. Strychnine prevents glycine from generating inhibitory postsynaptic potentials (IPSPs), so motor neurons lose inhibition and become hyperexcitable, and even minor stimuli trigger generalized tetanic spasms. Consciousness is preserved because the drug does not act on the cerebral cortex. Blockade of endplate acetylcholine receptors is the mechanism of neuromuscular blocking agents such as tubocurarine, which cause flaccid paralysis. Increased acetylcholine release is unrelated to strychnine, whereas botulinum toxin inhibits release. Blockade of GABA synthesis is not its mechanism. Direct inhibition of motor neurons would cause muscle weakness rather than spasm.",
  tip: "Strychnine blocks glycine receptors, so IPSPs disappear and tetanic convulsions develop"
};

window.ML_TRANSLATIONS["usm-225"] = {
  lang: "en",
  stem: "An infant is brought for recurrent lethargy and tachypnea with fasting hypoglycemia, and blood lactate and alanine are elevated; genetic testing confirms pyruvate carboxylase deficiency. Which of the following is the most direct cause of the persistently elevated lactate?",
  options: [
    "Pyruvate cannot be carboxylated to oxaloacetate, the tricarboxylic acid cycle is blocked by oxaloacetate deficiency, and pyruvate is diverted to lactate production",
    "Phosphoenolpyruvate carboxykinase activity increases and gluconeogenesis is enhanced",
    "Pyruvate dehydrogenase complex activity increases and acetyl coenzyme A production rises",
    "The mitochondrial electron transport chain is inhibited and oxygen cannot be used",
    "Hexokinase, a key glycolytic enzyme, has reduced activity and glucose utilization decreases"
  ],
  explain: "Pyruvate carboxylase, which requires biotin as a coenzyme, catalyzes the carboxylation of pyruvate to oxaloacetate, both providing the starting substrate for gluconeogenesis and replenishing tricarboxylic acid (TCA) cycle intermediates. When the enzyme is deficient, oxaloacetate is insufficient, acetyl coenzyme A cannot enter the TCA cycle, and pyruvate accumulates and is largely reduced to lactate, so lactate remains persistently elevated; gluconeogenesis is also impaired, so fasting hypoglycemia occurs readily. The elevated alanine results from increased transamination of the accumulated pyruvate. Increased phosphoenolpyruvate carboxykinase activity would promote gluconeogenesis rather than raise lactate. Increased pyruvate dehydrogenase complex activity would accelerate pyruvate oxidation and reduce lactate formation. Inhibition of the electron transport chain occurs in hypoxia or cyanide poisoning. Reduced hexokinase activity decreases glucose utilization and does not cause marked lactate accumulation.",
  tip: "Pyruvate carboxylase is the anaplerotic exit for pyruvate; without it, lactate accumulates and glucose falls"
};

window.ML_TRANSLATIONS["usm-226"] = {
  lang: "en",
  stem: "A patient with hyperthyroidism has a markedly elevated basal metabolic rate, heat intolerance, diaphoresis, and weight loss, yet the coupling efficiency of mitochondrial oxidative phosphorylation is unchanged. Which of the following is the most likely mechanism of the increased oxygen consumption?",
  options: [
    "Thyroid hormone induces increased synthesis of sodium-potassium-ATPase, increased ATP consumption raises the ADP/ATP ratio, and oxidative phosphorylation accelerates",
    "Thyroid hormone increases the permeability of the inner mitochondrial membrane to protons, uncoupling oxidation from phosphorylation",
    "Thyroid hormone directly inhibits ATP synthase and reduces ATP production",
    "Thyroid hormone inhibits the electron transport chain and reduces oxygen utilization",
    "Thyroid hormone decreases phosphocreatine breakdown and increases ATP reserves"
  ],
  explain: "Thyroid hormone induces increased synthesis of sodium-potassium-ATPase in tissue cell membranes, so more ATP is hydrolyzed to ADP and phosphate and the intracellular ADP/ATP ratio rises. ADP is the phosphorylation-controlled stimulus to the respiratory chain, so oxidative phosphorylation accelerates, with a corresponding increase in oxygen consumption and heat production that manifests as an elevated basal metabolic rate, heat intolerance, diaphoresis, and weight loss. In this process, oxidation and phosphorylation remain tightly coupled. Uncoupling of oxidation from phosphorylation is caused by 2,4-dinitrophenol. Inhibition of ATP synthase is caused by oligomycin. Inhibition of the electron transport chain by cyanide or rotenone, in contrast, reduces oxygen utilization. Thyroid hormone does not decrease phosphocreatine breakdown.",
  tip: "Hyperthyroidism generates heat by burning more ATP: more ADP accelerates the respiratory chain while coupling remains intact"
};

window.ML_TRANSLATIONS["usm-227"] = {
  lang: "en",
  stem: "A patient with cirrhosis develops impaired consciousness as blood ammonia rises. Which of the following is the most likely mechanism of ammonia toxicity in the central nervous system?",
  options: [
    "Ammonia combines with alpha-ketoglutarate in the brain to form glutamate, depleting tricarboxylic acid cycle intermediates and reducing ATP production in the brain",
    "Ammonia directly inhibits the sodium-potassium pump and causes rapid neuronal necrosis",
    "Ammonia binds hemoglobin and causes cerebral hypoxia",
    "Ammonia inhibits cholinesterase and causes acetylcholine accumulation",
    "Ammonia directly blocks postsynaptic acetylcholine receptors"
  ],
  explain: "When blood ammonia rises, ammonia in the brain combines with alpha-ketoglutarate to form glutamate and then combines with glutamate to form glutamine. Because alpha-ketoglutarate is a tricarboxylic acid (TCA) cycle intermediate, its depletion weakens the TCA cycle and reduces ATP production in the brain, causing central nervous system depression and impaired consciousness. Glutamate is itself an excitatory transmitter, and its depletion also affects neurotransmission. Ammonia also promotes the entry of aromatic amino acids into the brain, generating false neurotransmitters. Ammonia does not bind hemoglobin; that is the mechanism of carbon monoxide poisoning. Inhibition of cholinesterase is caused by organophosphate pesticides. Blockade of postsynaptic acetylcholine receptors is caused by agents such as tubocurarine. Ammonia does affect membrane potentials, but direct inhibition of the sodium-potassium pump with rapid neuronal necrosis is not the principal mechanism of ammonia-induced encephalopathy.",
  tip: "Ammonia depletes alpha-ketoglutarate, the TCA cycle stalls, and brain ATP falls"
};

window.ML_TRANSLATIONS["usm-228"] = {
  lang: "en",
  stem: "After replication of linear eukaryotic chromosomes, the newly synthesized 5-prime ends are shortened because the RNA primer is removed. Which of the following is the most likely mechanism by which cells solve this end-replication problem?",
  options: [
    "Telomerase uses its own RNA as a template and, by reverse transcription, extends the 3-prime end of the chromosome",
    "DNA polymerase alpha uses DNA as a template to fill the 5-prime gap directly",
    "DNA ligase joins the chromosome end to an adjacent chromosome",
    "Helicase folds the 5-prime end back into a hairpin so that it extends itself",
    "RNA polymerase synthesizes a new RNA primer at the end, which is retained permanently"
  ],
  explain: "Telomerase consists of an RNA component and a reverse transcriptase. Its RNA fragment serves as a template, and reverse transcription synthesizes telomeric repeat sequences at the 3-prime end of the chromosome, lengthening the 3-prime end; primase and DNA polymerase then use the extended 3-prime end as a template to complete the other strand, compensating for end shortening during replication. DNA polymerase can only extend in the 5-prime to 3-prime direction and requires a primer, so it cannot directly fill the 5-prime gap using DNA as a template. DNA ligase only seals nicks and does not synthesize new DNA. Hairpin extension is not the mechanism of human telomeres. Newly synthesized RNA primers are eventually removed and therefore cannot solve the problem of end shortening.",
  tip: "Telomerase is a reverse transcriptase that carries its own RNA template; it extends the 3-prime end"
};

window.ML_TRANSLATIONS["usm-229"] = {
  lang: "en",
  stem: "Furuncles usually form well-demarcated abscesses, whereas subcutaneous cellulitis is diffuse with indistinct borders. Which of the following is the most direct explanation for the difference in the extent of these lesions?",
  options: [
    "Staphylococcus aureus produces coagulase, which converts fibrinogen to fibrin and localizes the lesion, whereas Streptococcus pyogenes produces hyaluronidase and other enzymes that allow spread along tissue planes",
    "Staphylococcus aureus is gram-positive, whereas Streptococcus pyogenes is gram-negative",
    "Staphylococcus aureus causes fibrinous inflammation, whereas Streptococcus pyogenes causes serous inflammation",
    "Staphylococcus aureus usually spreads hematogenously, whereas Streptococcus pyogenes usually spreads via lymphatics",
    "The difference in extent depends mainly on host immune status, not on bacterial products"
  ],
  explain: "Staphylococcus aureus produces coagulase, which converts plasma fibrinogen to fibrin and forms a fibrin barrier around the lesion, localizing the inflammation and producing a well-demarcated abscess. Streptococcus pyogenes produces hyaluronidase, streptokinase, and DNase, which degrade connective tissue matrix and fibrin and allow the lesion to spread rapidly along tissue planes, producing diffuse cellulitis. Both organisms are gram-positive cocci, so the statement about staining characteristics is incorrect. Cellulitis is a diffuse suppurative inflammation of loose connective tissue and is distinct from fibrinous and serous inflammation. Differences in route of spread are not the direct cause of the difference in extent. Host immune status contributes to some degree, but bacterial products are the determining factor.",
  tip: "S. aureus clots the lesion into an abscess, whereas streptococci dissolve tissue into cellulitis"
};

window.ML_TRANSLATIONS["usm-230"] = {
  lang: "en",
  stem: "Which of the following is the most critical histologic criterion for determining that an epithelial tumor has progressed from carcinoma in situ to invasive carcinoma?",
  options: [
    "Whether tumor cells penetrate the basement membrane and invade the underlying stroma",
    "The degree of cytologic atypia",
    "The number of mitotic figures",
    "The size of the tumor",
    "The presence of necrosis and hemorrhage"
  ],
  explain: "Carcinoma in situ is defined by dysplastic cells involving the full thickness of the epithelium with an intact basement membrane and no invasion of the underlying stroma; once tumor cells penetrate the basement membrane and invade the stroma, the lesion is an invasive carcinoma and acquires the capacity for lymphatic and hematogenous metastasis. The critical criterion for progression to invasive carcinoma is therefore whether the basement membrane is intact and whether stromal invasion is present. The degree of cytologic atypia, the number of mitotic figures, tumor size, and the presence of necrosis and hemorrhage can all be seen in carcinoma in situ and reflect only the grade of malignancy or the level of proliferative activity, not the presence of invasion.",
  tip: "There is only one dividing line between carcinoma in situ and invasive carcinoma: the basement membrane"
};

/* ====================== q-ext.js 中的 3 道 USMLE 风格题 ====================== */

window.ML_TRANSLATIONS["ext-usm-001"] = {
  lang: "en",
  stem: "Which of the following is the most appropriate next step in management?",
  options: [
    "Give aspirin and refer the patient to an outpatient clinic",
    "Emergency coronary angiography with primary percutaneous coronary intervention",
    "Perform exercise stress testing first to define the extent of ischemia",
    "Give intravenous thrombolysis, observe for 24 hours, and then repeat the ECG",
    "Give intravenous furosemide immediately"
  ],
  explain: "ST-segment elevation in the inferior leads (II, III, and aVF) with 2 hours of continuous chest pain indicates an acute inferior ST-elevation myocardial infarction; primary percutaneous coronary intervention (PCI) within 12 hours of symptom onset is the preferred reperfusion strategy. Thrombolysis is reserved for situations in which timely PCI is unavailable. Stress testing is contraindicated in the acute phase. The patient's blood pressure is low, and inferior infarction is often accompanied by right ventricular involvement with preload dependence, so aggressive diuresis would lower the blood pressure further and is not the first choice.",
  caseText: "A 58-year-old man presents with 2 hours of continuous crushing substernal chest pain accompanied by diaphoresis and nausea. He has a 10-year history of hypertension and a 30-year history of smoking. Physical examination: BP 90/60 mmHg, HR 102/min, a few crackles at both lung bases. ECG: ST-segment elevation of 0.3 mV in leads II, III, and aVF.",
  tip: "The inferior leads are II, III, and aVF; with hypotension, think of right ventricular involvement"
};

window.ML_TRANSLATIONS["ext-usm-002"] = {
  lang: "en",
  stem: "After smoke inhalation, a patient develops severe lactic acidosis, and testing shows that cytochrome c oxidase (complex IV) is inhibited. Which of the following is the most direct cause of the rapid fall in intracellular ATP production?",
  options: [
    "NADH and FADH2 cannot transfer electrons to oxygen, so the electron transport chain is interrupted",
    "Key glycolytic enzymes are directly inhibited by cyanide",
    "The permeability of the inner mitochondrial membrane to protons decreases, so protons cannot be pumped out",
    "The tricarboxylic acid cycle stops because oxaloacetate is depleted",
    "Fatty acid beta-oxidation is blocked by carnitine deficiency"
  ],
  explain: "When complex IV is inhibited, electrons cannot be transferred to oxygen, NADH and FADH2 cannot be oxidized, the proton pumps stop working, and the proton gradient across the inner mitochondrial membrane collapses, so ATP synthase stops. Cells then depend on glycolysis, and inadequate NAD+ regeneration diverts pyruvate to lactate, producing lactic acidosis. Glycolytic enzymes are not the direct target of cyanide.",
  tip: "Complex IV is the final step that transfers electrons to oxygen"
};

window.ML_TRANSLATIONS["ext-usm-003"] = {
  lang: "en",
  stem: "Serum from a patient with Graves disease contains a stimulating antibody directed against the thyrotropin receptor (TSI). Which of the following is the closest description of the pathogenic mechanism of this antibody?",
  options: [
    "Antibody-mediated cytotoxicity with destruction of thyroid follicular cells",
    "Immune complex deposition in thyroid vessel walls with complement activation",
    "The antibody binds the receptor and mimics the ligand, causing sustained receptor activation",
    "T cells directly infiltrate and kill thyroid cells",
    "The antibody blocks the receptor, decreasing thyroid hormone synthesis"
  ],
  explain: "TSI binds the thyrotropin (TSH) receptor and mimics TSH, persistently activating adenylate cyclase and increasing thyroid hormone synthesis and secretion; this is the receptor-stimulating form of a type II hypersensitivity reaction. The cytotoxic type, as in autoimmune hemolytic anemia, destroys cells; immune complex disease is type III; T-cell-mediated disease is type IV; and receptor-blocking antibodies occur in some forms of hypothyroidism.",
  tip: "TSI mimics TSH; it does not destroy the cell"
};
