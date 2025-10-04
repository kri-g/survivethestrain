// Survive the Strain - Malaria Strategy Game
// Scientific accuracy based on WHO and CDC guidelines

class MalariaGame {
    constructor() {
        this.currentWeek = 1;
        this.totalWeeks = 12;
        this.budget = 100;
        this.weeklyBudget = 80;
        this.cases = 0;
        this.resistance = 0;
        this.difficulty = 'medium';
        this.currentPatientIndex = 0;
        this.weeklyPatients = [];
        this.gameState = 'welcome';
        this.weeklyStats = {
            patientstreated: 0,
            correctDiagnoses: 0,
            properTreatments: 0,
            rdtUsed: 0,
            actCompleted: 0
        };

        this.interventions = {
            bedNets: { active: 0, cost: 12, effect: 15, duration: 4 },
            irs: { active: 0, cost: 25, effect: 25, duration: 6 },
            education: { active: 0, cost: 18, effect: 12, duration: 3 },
            vectorControl: { active: 0, cost: 10, effect: 8, duration: 2 }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Welcome screen
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.difficulty = e.currentTarget.dataset.difficulty;
            });
        });

        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Game controls
        document.getElementById('rdtBtn').addEventListener('click', () => {
            this.conductDiagnostic('rdt');
        });

        document.getElementById('presumptiveBtn').addEventListener('click', () => {
            this.conductDiagnostic('presumptive');
        });

        document.getElementById('nextPatientBtn').addEventListener('click', () => {
            this.nextPatient();
        });

        document.getElementById('endWeekBtn').addEventListener('click', () => {
            this.endWeek();
        });

        document.getElementById('confirmAllocationBtn').addEventListener('click', () => {
            this.confirmResourceAllocation();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });
    }

    startGame() {
        this.applyDifficultySettings();
        this.generateWeeklyPatients();
        this.showScreen('game-screen');
        this.gameState = 'playing';
        this.updateDisplay();
        this.showCurrentPatient();
    }

    applyDifficultySettings() {
        const settings = {
            easy: { budgetMultiplier: 1.4, caseReduction: 0.7, resistanceSlowdown: 0.6 },
            medium: { budgetMultiplier: 1.0, caseReduction: 1.0, resistanceSlowdown: 1.0 },
            hard: { budgetMultiplier: 0.8, caseReduction: 1.3, resistanceSlowdown: 1.4 }
        };

        const config = settings[this.difficulty];
        this.budget *= config.budgetMultiplier;
        this.weeklyBudget *= config.budgetMultiplier;
        this.difficultyConfig = config;
    }

    generateWeeklyPatients() {
        this.weeklyPatients = [];
        const numPatients = 4 + Math.floor(Math.random() * 3); // 4-6 patients per week

        // Patient types with scientifically accurate presentations
        const patientTypes = [
            {
                type: 'confirmedMalaria',
                symptoms: 'High fever (39.2°C), severe chills, headache, muscle aches',
                history: 'Lives in endemic area, no bed net use, symptoms for 2 days',
                rdtResult: true,
                severity: 'moderate',
                age: '25-year-old farmer',
                weight: 35
            },
            {
                type: 'pediatricMalaria',
                symptoms: 'Fever (38.8°C), irritability, poor feeding, vomiting',
                history: '3-year-old child, mother reports intermittent fever, family uses bed net occasionally',
                rdtResult: true,
                severity: 'moderate',
                age: '3-year-old child',
                weight: 8
            },
            {
                type: 'severeMalaria',
                symptoms: 'High fever (40.1°C), confusion, difficulty breathing, dark urine',
                history: 'Delayed treatment, symptoms for 5 days, previous incomplete treatment',
                rdtResult: true,
                severity: 'severe',
                age: '42-year-old teacher',
                weight: 20
            },
            {
                type: 'nonMalariaFever',
                symptoms: 'Mild fever (37.8°C), cough, runny nose, sore throat',
                history: 'Recent contact with sick family member, no travel to endemic areas recently',
                rdtResult: false,
                severity: 'mild',
                age: '16-year-old student',
                weight: 15
            },
            {
                type: 'pregnantMalaria',
                symptoms: 'Fever (38.5°C), nausea, fatigue, headache',
                history: '6-months pregnant, lives near water source, husband is fisherman',
                rdtResult: true,
                severity: 'moderate',
                age: '28-year-old pregnant woman',
                weight: 25
            },
            {
                type: 'suspectedMalaria',
                symptoms: 'Intermittent fever (38.3°C), weakness, loss of appetite',
                history: 'Returning from trip to high-transmission area 1 week ago',
                rdtResult: Math.random() > 0.4, // 60% chance positive
                severity: 'mild',
                age: '35-year-old merchant',
                weight: 30
            }
        ];

        // Generate patients with weighted selection based on epidemiology
        for (let i = 0; i < numPatients; i++) {
            const weights = [25, 20, 5, 30, 10, 15]; // Realistic distribution
            const selectedType = this.weightedRandomSelect(patientTypes, weights);

            this.weeklyPatients.push({
                id: i + 1,
                name: this.generatePatientName(),
                ...selectedType,
                diagnosed: false,
                treated: false,
                outcome: null
            });
        }

        this.currentPatientIndex = 0;
        this.updatePatientQueue();
    }

    weightedRandomSelect(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return { ...items[i] };
            }
        }
        return { ...items[0] };
    }

    generatePatientName() {
        const firstNames = ['Amara', 'Kwame', 'Fatou', 'Joseph', 'Aisha', 'Samuel', 'Mama', 'Ibrahim', 'Kemi', 'Moses'];
        const lastNames = ['Okonkwo', 'Diallo', 'Mensah', 'Banda', 'Traore', 'Kamara', 'Sesay', 'Conteh'];
        return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' +
               lastNames[Math.floor(Math.random() * lastNames.length)];
    }

    showCurrentPatient() {
        if (this.currentPatientIndex >= this.weeklyPatients.length) {
            this.endWeekPrompt();
            return;
        }

        const patient = this.weeklyPatients[this.currentPatientIndex];

        // Update patient display
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientAge').textContent = patient.age;
        document.getElementById('patientSymptoms').textContent = `Symptoms: ${patient.symptoms}`;
        document.getElementById('patientHistory').textContent = `History: ${patient.history}`;

        // Reset phases
        this.showPhase('diagnostic');
        this.clearPatientOutcome();

        // Update RDT button affordability
        const rdtBtn = document.getElementById('rdtBtn');
        if (this.budget < 5) {
            rdtBtn.disabled = true;
            rdtBtn.querySelector('.action-desc').textContent = 'Insufficient budget';
        } else {
            rdtBtn.disabled = false;
            rdtBtn.querySelector('.action-desc').textContent = '95% accuracy, definitive diagnosis';
        }

        this.updatePatientQueue();
    }

    conductDiagnostic(method) {
        const patient = this.weeklyPatients[this.currentPatientIndex];
        let result, accuracy, cost = 0;

        if (method === 'rdt') {
            cost = 5;
            if (this.budget < cost) {
                this.showEducationalModal('Insufficient Budget', 
                    'RDT tests cost $5 each. Consider budgeting for diagnostics or using presumptive diagnosis based on clinical symptoms.',
                    'WHO Treatment Guidelines 2023');
                return;
            }

            this.budget -= cost;
            accuracy = 0.95;

            // RDT accuracy simulation
            if (Math.random() < accuracy) {
                result = patient.rdtResult;
            } else {
                result = !patient.rdtResult; // False positive/negative
            }

            this.weeklyStats.rdtUsed++;

        } else {
            // Presumptive diagnosis
            accuracy = 0.65;
            result = Math.random() < 0.7; // Tends to over-diagnose malaria
        }

        patient.diagnosisMethod = method;
        patient.diagnosisResult = result;
        patient.diagnosed = true;

        if ((result && patient.rdtResult) || (!result && !patient.rdtResult)) {
            this.weeklyStats.correctDiagnoses++;
        }

        // Show result
        this.showDiagnosticResult(method, result, accuracy);
        this.showTreatmentOptions(result, patient);
        this.updateDisplay();
    }

    showDiagnosticResult(method, result, accuracy) {
        const resultDiv = document.getElementById('diagnosticResult');
        const methodName = method === 'rdt' ? 'Rapid Diagnostic Test' : 'Presumptive Diagnosis';

        resultDiv.innerHTML = `
            <strong>${methodName} Result:</strong><br>
            <span class="font-weight-bold ${result ? 'text-danger' : 'text-success'}">
                ${result ? 'POSITIVE for P. falciparum' : 'NEGATIVE for malaria'}
            </span><br>
            <small>Diagnostic accuracy: ${Math.round(accuracy * 100)}%</small>
        `;

        resultDiv.className = `diagnostic-result ${result ? 'positive' : 'negative'}`;
    }

    showTreatmentOptions(malariaPositive, patient) {
        const treatmentDiv = document.getElementById('treatmentOptions');
        treatmentDiv.innerHTML = '';

        if (malariaPositive) {
            // Malaria treatment options
            const treatments = this.getMalariatreatments(patient);
            treatments.forEach(treatment => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.innerHTML = `
                    <div class="action-header">
                        <span class="action-title">${treatment.name}</span>
                        <span class="action-cost">$${treatment.cost}</span>
                    </div>
                    <div class="action-desc">${treatment.description}</div>
                `;

                if (this.budget < treatment.cost) {
                    btn.disabled = true;
                    btn.querySelector('.action-desc').textContent += ' (Insufficient budget)';
                }

                btn.addEventListener('click', () => {
                    this.provideTreatment(treatment, patient);
                });

                treatmentDiv.appendChild(btn);
            });
        } else {
            // Non-malaria treatment options
            const supportiveBtn = document.createElement('button');
            supportiveBtn.className = 'action-btn';
            supportiveBtn.innerHTML = `
                <div class="action-header">
                    <span class="action-title">Supportive Care</span>
                    <span class="action-cost">$2</span>
                </div>
                <div class="action-desc">Pain relief, hydration, symptom management</div>
            `;

            supportiveBtn.addEventListener('click', () => {
                this.provideTreatment({
                    id: 'supportive',
                    name: 'Supportive Care',
                    cost: 2,
                    effectiveness: 95,
                    resistanceImpact: 0
                }, patient);
            });

            treatmentDiv.appendChild(supportiveBtn);

            // Option to treat with antimalarials anyway (common mistake)
            const antimalarialBtn = document.createElement('button');
            antimalarialBtn.className = 'action-btn';
            antimalarialBtn.innerHTML = `
                <div class="action-header">
                    <span class="action-title">Treat with ACT Anyway</span>
                    <span class="action-cost">$15</span>
                </div>
                <div class="action-desc">Use antimalarials despite negative test</div>
            `;

            antimalarialBtn.addEventListener('click', () => {
                this.provideTreatment({
                    id: 'unnecessary_act',
                    name: 'Unnecessary ACT',
                    cost: 15,
                    effectiveness: 0,
                    resistanceImpact: 8
                }, patient);
            });

            treatmentDiv.appendChild(antimalarialBtn);
        }

        this.showPhase('treatment');
    }

    getMalariatreatments(patient) {
        const baseACT = {
            id: 'full_act',
            name: 'Complete ACT Course (3 days)',
            cost: 15,
            description: 'Artemisinin-based Combination Therapy - WHO gold standard',
            effectiveness: 95,
            resistanceImpact: -2
        };

        const partialACT = {
            id: 'partial_act',
            name: 'Single-dose ACT',
            cost: 8,
            description: 'Partial treatment - lower cost but incomplete',
            effectiveness: 45,
            resistanceImpact: 12
        };

        const monotherapy = {
            id: 'monotherapy',
            name: 'Artemisinin Monotherapy',
            cost: 6,
            description: 'Single drug - NOT recommended by WHO',
            effectiveness: 60,
            resistanceImpact: 20
        };

        let treatments = [baseACT, partialACT];

        // Add inappropriate options that players might choose
        if (this.resistance < 50) {
            treatments.push(monotherapy);
        }

        // Severe malaria needs immediate referral
        if (patient.severity === 'severe') {
            treatments = [{
                id: 'referral',
                name: 'Immediate Referral + IV Artesunate',
                cost: 35,
                description: 'Emergency treatment for severe malaria',
                effectiveness: 85,
                resistanceImpact: -1
            }, ...treatments];
        }

        // Pregnancy considerations
        if (patient.type === 'pregnantMalaria') {
            baseACT.description += ' (Safe for pregnancy after first trimester)';
            baseACT.effectiveness = 90;
        }

        // Pediatric dosing
        if (patient.type === 'pediatricMalaria') {
            baseACT.name = 'Weight-based ACT Course';
            baseACT.description = 'Pediatric dosing based on weight (15mg/kg)';
        }

        return treatments;
    }

    provideTreatment(treatment, patient) {
        if (this.budget < treatment.cost) {
            this.showEducationalModal('Insufficient Budget', 
                `Treatment costs $${treatment.cost} but you only have $${this.budget} remaining.`,
                'Resource Management');
            return;
        }

        this.budget -= treatment.cost;
        patient.treated = true;
        patient.treatment = treatment;

        // Calculate outcome
        const outcome = this.calculateTreatmentOutcome(treatment, patient);
        patient.outcome = outcome;

        // Update statistics
        this.weeklyStats.patientstreated++;
        if (treatment.id === 'full_act' || treatment.id === 'referral') {
            this.weeklyStats.properTreatments++;
            this.weeklyStats.actCompleted++;
        }

        // Update resistance based on treatment choice
        this.updateResistance(treatment, patient);

        // Show outcome
        this.showPatientOutcome(outcome, treatment, patient);

        // Enable next patient button
        document.getElementById('nextPatientBtn').style.display = 'block';

        this.updateDisplay();
    }

    calculateTreatmentOutcome(treatment, patient) {
        let success = Math.random() < (treatment.effectiveness / 100);

        // Modify based on resistance level
        if (patient.rdtResult && this.resistance > 30) {
            const resistanceReduction = this.resistance / 100 * 0.4;
            success = Math.random() < ((treatment.effectiveness / 100) * (1 - resistanceReduction));
        }

        // Severe cases are more challenging
        if (patient.severity === 'severe' && treatment.id !== 'referral') {
            success = Math.random() < 0.3;
        }

        // Wrong treatment for non-malaria
        if (!patient.rdtResult && treatment.id !== 'supportive') {
            success = false;
        }

        return {
            success: success,
            recoveryTime: success ? (2 + Math.floor(Math.random() * 3)) : null,
            complications: !success && patient.severity !== 'mild'
        };
    }

    updateResistance(treatment, patient) {
        let resistanceChange = treatment.resistanceImpact || 0;

        // Amplify resistance impact based on current level
        if (this.resistance > 50) {
            resistanceChange *= 1.3;
        }

        // Incomplete diagnosis increases resistance risk
        if (patient.diagnosisMethod === 'presumptive' && patient.rdtResult) {
            resistanceChange += 3;
        }

        // Apply difficulty modifier
        resistanceChange *= this.difficultyConfig.resistanceSlowdown;

        this.resistance = Math.max(0, Math.min(100, this.resistance + resistanceChange));

        // Show educational modal for significant resistance increases
        if (resistanceChange > 10) {
            this.showEducationalModal('Drug Resistance Alert', 
                `Poor treatment choices increase drug resistance. Incomplete treatment allows resistant parasites to survive and multiply.`,
                'WHO Antimalarial Drug Resistance Report 2023');
        }
    }

    showPatientOutcome(outcome, treatment, patient) {
        const outcomeDiv = document.getElementById('patientOutcome');
        let content = '';
        let cssClass = '';

        if (outcome.success) {
            cssClass = 'outcome-success';
            content = `<strong>✅ Treatment Successful</strong><br>`;
            content += `${patient.name} recovered in ${outcome.recoveryTime} days. `;

            if (treatment.id === 'full_act') {
                content += 'Complete ACT course eliminated parasites and reduced resistance risk.';
            } else if (treatment.id === 'supportive') {
                content += 'Supportive care addressed symptoms without unnecessary antimalarial use.';
            }
        } else {
            if (patient.rdtResult) {
                cssClass = 'outcome-danger';
                content = `<strong>❌ Treatment Failed</strong><br>`;
                content += `${patient.name} did not respond to treatment. `;

                if (treatment.id === 'partial_act') {
                    content += 'Incomplete ACT course allowed resistant parasites to survive.';
                } else if (treatment.id === 'monotherapy') {
                    content += 'Monotherapy is no longer effective due to resistance.';
                } else if (this.resistance > 60) {
                    content += 'High resistance levels reduced treatment effectiveness.';
                }

                if (outcome.complications) {
                    content += ' Patient requires emergency referral.';
                    this.cases += 2; // Complicated cases count more
                }
            } else {
                cssClass = 'outcome-warning';
                content = `<strong>⚠️ Unnecessary Treatment</strong><br>`;
                content += `${patient.name} was treated for malaria despite negative test. This contributes to drug resistance without clinical benefit.`;
            }
        }

        outcomeDiv.innerHTML = content;
        outcomeDiv.className = `patient-outcome ${cssClass}`;
        outcomeDiv.style.display = 'block';

        // Update case count
        if (patient.rdtResult && !outcome.success) {
            this.cases += 1;
        }
    }

    nextPatient() {
        this.currentPatientIndex++;
        document.getElementById('nextPatientBtn').style.display = 'none';

        if (this.currentPatientIndex >= this.weeklyPatients.length) {
            this.endWeekPrompt();
        } else {
            this.showCurrentPatient();
        }
    }

    endWeekPrompt() {
        document.getElementById('endWeekBtn').style.display = 'block';
    }

    endWeek() {
        this.showScreen('resource-screen');
        this.showWeeklySummary();
        this.showResourceOptions();
    }

    showWeeklySummary() {
        const summaryDiv = document.getElementById('weekSummary');
        const stats = this.weeklyStats;

        const accuracy = stats.patientsSelected > 0 ? Math.round((stats.correctDiagnoses / stats.patientsSelected) * 100) : 0;
        const properTreatment = stats.patientsSelected > 0 ? Math.round((stats.properTreatments / stats.patientsSelected) * 100) : 0;

        summaryDiv.innerHTML = `
            <h3>Week ${this.currentWeek} Summary</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">Patients Treated:</span>
                    <span class="stat-value">${stats.patientsSelected}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Diagnostic Accuracy:</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Proper Treatment:</span>
                    <span class="stat-value">${properTreatment}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">RDT Tests Used:</span>
                    <span class="stat-value">${stats.rdtUsed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Complete ACT Courses:</span>
                    <span class="stat-value">${stats.actCompleted}</span>
                </div>
            </div>
        `;
    }

    showResourceOptions() {
        const preventionGrid = document.getElementById('preventionGrid');
        const programGrid = document.getElementById('programGrid');

        preventionGrid.innerHTML = '';
        programGrid.innerHTML = '';

        // Prevention interventions
        const preventions = [
            {
                id: 'bedNets',
                name: 'Long-Lasting Insecticidal Nets (LLINs)',
                cost: 12,
                effect: '15% transmission reduction',
                duration: '4 weeks effectiveness',
                description: 'Distribute bed nets to high-risk households'
            },
            {
                id: 'irs',
                name: 'Indoor Residual Spraying (IRS)',
                cost: 25,
                effect: '25% transmission reduction',
                duration: '6 weeks effectiveness',
                description: 'Spray insecticide in homes and buildings'
            },
            {
                id: 'vectorControl',
                name: 'Larval Source Management',
                cost: 10,
                effect: '8% transmission reduction',
                duration: '2 weeks effectiveness',
                description: 'Drain standing water, eliminate breeding sites'
            }
        ];

        // Community programs
        const programs = [
            {
                id: 'education',
                name: 'Community Education Campaign',
                cost: 18,
                effect: '12% treatment adherence improvement',
                duration: '3 weeks effectiveness',
                description: 'Train community health workers, distribute materials'
            },
            {
                id: 'surveillance',
                name: 'Enhanced Surveillance System',
                cost: 22,
                effect: 'Earlier case detection',
                duration: '4 weeks effectiveness',
                description: 'Active case finding and contact tracing'
            }
        ];

        [...preventions, ...programs].forEach(intervention => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerHTML = `
                <h4>${intervention.name}</h4>
                <div class="resource-cost">Cost: $${intervention.cost}</div>
                <div class="resource-effect">Effect: ${intervention.effect}</div>
                <div class="resource-duration">Duration: ${intervention.duration}</div>
                <div class="resource-description">${intervention.description}</div>
            `;

            if (this.budget < intervention.cost) {
                div.style.opacity = '0.5';
                div.innerHTML += '<div class="text-danger">Insufficient Budget</div>';
            } else {
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    if (div.classList.contains('selected')) {
                        div.classList.remove('selected');
                        this.budget += intervention.cost;
                    } else if (this.budget >= intervention.cost) {
                        div.classList.add('selected');
                        this.budget -= intervention.cost;
                    }
                    this.updateRemainingBudget();
                });
            }

            const targetGrid = preventions.includes(intervention) ? preventionGrid : programGrid;
            targetGrid.appendChild(div);
        });

        this.updateRemainingBudget();
    }

    updateRemainingBudget() {
        document.getElementById('remainingBudget').textContent = this.budget;
    }

    confirmResourceAllocation() {
        // Apply intervention effects
        document.querySelectorAll('.resource-item.selected').forEach(item => {
            const name = item.querySelector('h4').textContent;

            if (name.includes('Nets')) {
                this.interventions.bedNets.active = 4;
            } else if (name.includes('Spraying')) {
                this.interventions.irs.active = 6;
            } else if (name.includes('Education')) {
                this.interventions.education.active = 3;
            } else if (name.includes('Source')) {
                this.interventions.vectorControl.active = 2;
            }
        });

        this.nextWeek();
    }

    nextWeek() {
        this.currentWeek++;
        this.budget += this.weeklyBudget;

        // Apply intervention effects
        this.applyInterventionEffects();

        // Natural disease progression
        this.updateNaturalProgression();

        // Check win/lose conditions
        if (this.checkGameEnd()) {
            return;
        }

        // Reset weekly stats
        this.weeklyStats = {
            patientsSelected: 0,
            correctDiagnoses: 0,
            properTreatments: 0,
            rdtUsed: 0,
            actCompleted: 0
        };

        // Generate new patients
        this.generateWeeklyPatients();

        // Return to game screen
        this.showScreen('game-screen');
        this.showCurrentPatient();
        this.updateDisplay();
    }

    applyInterventionEffects() {
        let transmissionReduction = 0;

        // Calculate transmission reduction from interventions
        Object.values(this.interventions).forEach(intervention => {
            if (intervention.active > 0) {
                intervention.active--;
                transmissionReduction += intervention.effect;
            }
        });

        // Apply effects
        this.cases = Math.max(0, this.cases - transmissionReduction * 0.3);

        // Slow resistance increase with good interventions
        if (transmissionReduction > 30) {
            this.resistance = Math.max(0, this.resistance - 1);
        }
    }

    updateNaturalProgression() {
        // Natural case increase based on transmission
        const baseIncrease = 8 * this.difficultyConfig.caseReduction;
        const resistanceMultiplier = 1 + (this.resistance / 100);

        this.cases += baseIncrease * resistanceMultiplier;

        // Resistance naturally increases slightly due to drug pressure
        this.resistance += 0.5 * this.difficultyConfig.resistanceSlowdown;

        // Cap values
        this.cases = Math.max(0, Math.min(100, this.cases));
        this.resistance = Math.max(0, Math.min(100, this.resistance));
    }

    checkGameEnd() {
        // Win condition
        if (this.currentWeek > this.totalWeeks) {
            if (this.cases < 50 && this.resistance < 70) {
                this.showGameEnd(true);
                return true;
            }
        }

        // Lose conditions
        if (this.resistance >= 90) {
            this.showGameEnd(false, 'resistance');
            return true;
        }

        if (this.cases >= 90) {
            this.showGameEnd(false, 'cases');
            return true;
        }

        return false;
    }

    showGameEnd(won, loseReason = null) {
        this.showScreen('game-over-screen');

        const resultDiv = document.getElementById('gameResult');
        const statsDiv = document.getElementById('finalStats');
        const reflectionDiv = document.getElementById('educationalReflection');

        if (won) {
            resultDiv.innerHTML = `
                <h2 class="text-success">🎉 Mission Accomplished!</h2>
                <p>You successfully managed malaria control for 12 weeks while keeping cases and resistance under control.</p>
            `;
        } else {
            let message = '';
            if (loseReason === 'resistance') {
                message = `<h2 class="text-danger">💊 Drug Resistance Crisis</h2>
                          <p>Resistance levels reached critical levels (${Math.round(this.resistance)}%), making treatment largely ineffective.</p>`;
            } else if (loseReason === 'cases') {
                message = `<h2 class="text-danger">🏥 Healthcare System Overwhelmed</h2>
                          <p>Case numbers exceeded capacity (${Math.round(this.cases)} cases), overwhelming healthcare resources.</p>`;
            }
            resultDiv.innerHTML = message;
        }

        // Final statistics
        statsDiv.innerHTML = `
            <h3>Final Statistics</h3>
            <div class="stats-grid">
                <div>Total Weeks Completed: ${this.currentWeek - 1}</div>
                <div>Final Case Count: ${Math.round(this.cases)}</div>
                <div>Final Resistance Level: ${Math.round(this.resistance)}%</div>
                <div>Budget Remaining: $${this.budget}</div>
            </div>
        `;

        // Educational reflection
        reflectionDiv.innerHTML = `
            <h3>Real-World Impact</h3>
            <p>Your decisions mirror the challenges faced by public health officials worldwide. 
            ${won ? 'Successful malaria control requires balancing immediate patient care with long-term resistance prevention.' : 
                    'This simulation demonstrates how individual treatment decisions affect community health outcomes.'}</p>
            <p><strong>Key Learning Points:</strong></p>
            <ul>
                <li>Proper diagnosis before treatment reduces unnecessary antibiotic use</li>
                <li>Complete ACT courses prevent resistance development</li>
                <li>Prevention interventions reduce overall disease burden</li>
                <li>Resource allocation requires strategic planning</li>
            </ul>
        `;
    }

    showPhase(phase) {
        document.querySelectorAll('.action-phase').forEach(p => p.classList.remove('active'));
        document.getElementById(`${phase}Phase`).classList.add('active');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    clearPatientOutcome() {
        document.getElementById('patientOutcome').style.display = 'none';
    }

    updatePatientQueue() {
        const queueDiv = document.getElementById('queueList');
        queueDiv.innerHTML = '';

        this.weeklyPatients.forEach((patient, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';

            if (index === this.currentPatientIndex) {
                item.classList.add('current');
            } else if (index < this.currentPatientIndex) {
                item.classList.add('completed');
            }

            item.textContent = `${patient.name} (${patient.age.split('-')[0]})`;
            queueDiv.appendChild(item);
        });
    }

    updateDisplay() {
        // Update header displays
        document.getElementById('currentWeek').textContent = this.currentWeek;
        document.getElementById('currentBudget').textContent = this.budget;
        document.getElementById('casesValue').textContent = Math.round(this.cases);
        document.getElementById('resistanceValue').textContent = Math.round(this.resistance) + '%';

        // Update meter fills
        document.getElementById('casesFill').style.width = `${Math.min(this.cases, 100)}%`;
        document.getElementById('resistanceFill').style.width = `${this.resistance}%`;
    }

    showEducationalModal(title, content, source) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalSource').textContent = `Source: ${source}`;
        document.getElementById('educationalModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('educationalModal').classList.remove('active');
    }

    resetGame() {
        // Reset all game state
        this.currentWeek = 1;
        this.budget = 100;
        this.cases = 0;
        this.resistance = 0;
        this.currentPatientIndex = 0;
        this.weeklyPatients = [];
        this.gameState = 'welcome';

        // Reset interventions
        Object.keys(this.interventions).forEach(key => {
            this.interventions[key].active = 0;
        });

        // Reset weekly stats
        this.weeklyStats = {
            patientsSelected: 0,
            correctDiagnoses: 0,
            properTreatments: 0,
            rdtUsed: 0,
            actCompleted: 0
        };

        // Show welcome screen
        this.showScreen('welcome-screen');
        this.updateDisplay();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MalariaGame();
});