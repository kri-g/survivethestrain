// Survive the Strain - Immersive Malaria Crisis Simulation
// Advanced game mechanics with storytelling and progressive complexity

class MalariaSimulation {
    constructor() {
        // Core game state
        this.week = 1;
        this.day = 1;
        this.budget = 150; // More realistic starting budget
        this.reputation = 50;
        this.resistance = 0;
        this.totalPatients = 0;
        this.savedLives = 0;
        this.lostLives = 0;

        // Village states (0-100)
        this.villages = {
            north: { health: 80, cases: 5, outbreak: false, trust: 70 },
            center: { health: 85, cases: 3, outbreak: false, trust: 80 },
            south: { health: 75, cases: 8, outbreak: false, trust: 60 }
        };

        // Inventory system
        this.inventory = {
            rdt_tests: 20,
            act_full: 15,
            act_child: 8,
            artemisinin: 5,
            nets: 25,
            spray_bottles: 3
        };

        // Game progression
        this.currentScenario = null;
        this.eventQueue = [];
        this.achievements = [];
        this.decisionHistory = [];
        this.tutorialStep = 0;
        this.gamePhase = 'intro';

        // Realistic patient database with African names and contexts
        this.patientDatabase = this.initializePatientDatabase();
        this.usedPatientNames = new Set();

        // Scenario templates for procedural generation
        this.scenarioTemplates = this.initializeScenarios();

        this.init();
    }

    init() {
        this.bindEvents();
        this.startIntroSequence();
    }

    initializePatientDatabase() {
        return [
            {
                names: ["Amara Kone", "Fatou Diallo", "Aisha Traore", "Mariama Camara"],
                ages: ["32-year-old market vendor", "28-year-old teacher", "25-year-old nurse", "35-year-old shopkeeper"],
                portraits: ["👩", "👩‍🏫", "👩‍⚕️", "👩‍💼"],
                stories: [
                    "walks 5km daily to sell vegetables at the market",
                    "teaches at the local primary school",
                    "works at the district clinic",
                    "runs a small pharmacy"
                ]
            },
            {
                names: ["Kwame Asante", "Samuel Mensah", "Ibrahim Kone", "Joseph Banda"],
                ages: ["45-year-old farmer", "38-year-old fisherman", "29-year-old carpenter", "41-year-old driver"],
                portraits: ["👨‍🌾", "🎣", "🔨", "🚗"],
                stories: [
                    "cultivates rice in the wetlands near the river",
                    "fishes on Lake Victoria to support his family",
                    "builds furniture for the community",
                    "transports people between villages"
                ]
            },
            {
                names: ["Kemi Okafor", "Adama Sissoko", "Nana Yeboah", "Grace Mwangi"],
                ages: ["19-year-old student", "42-year-old mother of four", "67-year-old grandmother", "31-year-old midwife"],
                portraits: ["👩‍🎓", "👩‍👧‍👦", "👵", "👩‍⚕️"],
                stories: [
                    "studies medicine at the regional university",
                    "raises four children while managing a small farm",
                    "cares for 12 grandchildren in her compound",
                    "delivers babies and provides prenatal care"
                ]
            }
        ];
    }

    initializeScenarios() {
        return {
            routine_morning: {
                title: "Morning Rounds",
                description: "You begin your daily rounds. The clinic is already filling with patients.",
                actions: ["See patients", "Check supplies", "Review overnight reports"],
                outcomes: ["patient_queue", "inventory_check", "emergency_call"]
            },
            outbreak_warning: {
                title: "Outbreak Alert",
                description: "Radio crackles: 'Doctor, we have multiple fever cases in the north village.'",
                actions: ["Rush to outbreak site", "Request backup", "Gather more information"],
                outcomes: ["outbreak_response", "resource_strain", "investigation"]
            },
            supply_shortage: {
                title: "Critical Shortage",
                description: "Your last RDT test is used. No resupply truck for 3 days.",
                actions: ["Ration remaining supplies", "Send for emergency supplies", "Use presumptive treatment"],
                outcomes: ["resource_management", "budget_strain", "diagnostic_challenge"]
            },
            community_meeting: {
                title: "Village Council Meeting",
                description: "Community leaders want to discuss the malaria situation in their villages.",
                actions: ["Attend meeting", "Send representative", "Focus on clinical work"],
                outcomes: ["community_relations", "education_opportunity", "missed_connections"]
            }
        };
    }

    bindEvents() {
        document.getElementById('beginMissionBtn')?.addEventListener('click', () => {
            this.startGame();
        });

        // Tab switching
        window.showTab = (tabName) => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        };

        // Log toggle
        window.toggleLog = () => {
            const log = document.querySelector('.events-log');
            log.classList.toggle('collapsed');
            const toggle = document.querySelector('.log-toggle');
            toggle.textContent = log.classList.contains('collapsed') ? '⬆️' : '⬇️';
        };

        // Alert dismissal
        window.dismissAlert = () => {
            document.getElementById('alertBanner').style.display = 'none';
        };
    }

    startIntroSequence() {
        // Animate the story text typing effect
        const storyElement = document.getElementById('storyText');
        const stories = [
            "The radio crackles to life at 6 AM. Another report of fever cases from the outskirts.",
            "Three villages depend on you. Each decision ripples through the community.",
            "Drug resistance is rising. Resources are limited. Lives hang in the balance."
        ];

        let currentStory = 0;

        const typeStory = () => {
            if (currentStory < stories.length) {
                this.typeText(storyElement, stories[currentStory], 50, () => {
                    setTimeout(() => {
                        currentStory++;
                        typeStory();
                    }, 2000);
                });
            }
        };

        setTimeout(typeStory, 1000);
    }

    typeText(element, text, speed, callback) {
        element.innerHTML = '<p></p>';
        const paragraph = element.querySelector('p');
        let i = 0;

        const typeChar = () => {
            if (i < text.length) {
                paragraph.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else if (callback) {
                setTimeout(callback, 500);
            }
        };

        typeChar();
    }

    startGame() {
        this.gamePhase = 'playing';
        this.showScreen('game-screen');
        this.updateDisplay();
        this.addLogEntry("Started mission in Kibera District");

        // Start with tutorial if first time
        if (this.tutorialStep === 0) {
            this.showTutorial("Welcome to your clinic. Check your Actions tab to see what you can do.", "actions");
        }

        // Generate first scenario
        setTimeout(() => {
            this.generateScenario();
        }, 2000);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    generateScenario() {
        // Progressive difficulty based on week
        const availableTemplates = Object.keys(this.scenarioTemplates);
        let templateKey;

        if (this.week === 1) {
            templateKey = 'routine_morning';
        } else if (this.resistance > 30) {
            templateKey = 'supply_shortage';
        } else if (Math.random() > 0.7) {
            templateKey = 'outbreak_warning';
        } else {
            templateKey = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        }

        const template = this.scenarioTemplates[templateKey];
        this.currentScenario = {
            ...template,
            id: Date.now(),
            templateKey
        };

        this.displayScenario();
    }

    displayScenario() {
        const scenario = this.currentScenario;

        document.getElementById('situationTitle').textContent = scenario.title;
        document.getElementById('timeIndicator').textContent = `🌅 Week ${this.week}, Day ${this.day}`;

        // Create immersive situation description
        const situationContent = document.getElementById('situationContent');
        situationContent.innerHTML = `
            <div class="scenario-story">
                <p class="scenario-description">${scenario.description}</p>
                <div class="environmental-details" id="environmentalDetails">
                    ${this.generateEnvironmentalDetails()}
                </div>
            </div>
        `;

        // Generate contextual actions
        this.generateActions();

        // Add some scenarios require quick decisions
        if (scenario.templateKey === 'outbreak_warning') {
            this.startDecisionTimer(30);
        }
    }

    generateEnvironmentalDetails() {
        const details = [
            "☀️ Temperature: 32°C, humidity rising",
            "🌧️ Recent rains have created breeding sites",
            "📻 Radio reports: 15 new cases this week",
            "🏠 Villages report: families sleeping without nets",
            "🦟 Mosquito activity: high in evening hours"
        ];

        // Select 2-3 relevant details based on current situation
        const relevantDetails = [];

        if (this.week <= 2) {
            relevantDetails.push(details[0], details[1]);
        } else {
            relevantDetails.push(...details.slice(Math.floor(Math.random() * 2), Math.floor(Math.random() * 2) + 3));
        }

        return relevantDetails.map(detail => `<div class="detail-item">${detail}</div>`).join('');
    }

    generateActions() {
        const actionsList = document.getElementById('actionsList');
        actionsList.innerHTML = '';

        // Always available actions
        const baseActions = [
            {
                id: 'see_patient',
                title: 'See Next Patient',
                cost: 0,
                description: 'Examine a patient from the waiting room',
                icon: '👤',
                enabled: true
            }
        ];

        // Context-specific actions based on current scenario
        const contextActions = this.getContextualActions();

        // Resource-dependent actions
        const resourceActions = this.getResourceActions();

        const allActions = [...baseActions, ...contextActions, ...resourceActions];

        allActions.forEach(action => {
            const actionCard = document.createElement('div');
            actionCard.className = `action-card ${action.enabled ? '' : 'disabled'}`;

            actionCard.innerHTML = `
                <div class="action-header">
                    <span class="action-title">${action.icon} ${action.title}</span>
                    ${action.cost > 0 ? `<span class="action-cost">$${action.cost}</span>` : ''}
                </div>
                <div class="action-description">${action.description}</div>
            `;

            if (action.enabled) {
                actionCard.addEventListener('click', () => {
                    this.executeAction(action);
                });
            }

            actionsList.appendChild(actionCard);
        });
    }

    getContextualActions() {
        const scenario = this.currentScenario;
        const actions = [];

        switch (scenario.templateKey) {
            case 'outbreak_warning':
                actions.push({
                    id: 'investigate_outbreak',
                    title: 'Investigate Outbreak',
                    cost: 20,
                    description: 'Travel to affected village for field investigation',
                    icon: '🔍',
                    enabled: this.budget >= 20
                });
                break;

            case 'supply_shortage':
                actions.push({
                    id: 'emergency_order',
                    title: 'Emergency Supply Order',
                    cost: 80,
                    description: 'Expedite supply delivery via emergency transport',
                    icon: '📦',
                    enabled: this.budget >= 80
                });
                break;

            case 'community_meeting':
                actions.push({
                    id: 'education_campaign',
                    title: 'Launch Education Campaign',
                    cost: 35,
                    description: 'Organize community health education sessions',
                    icon: '📢',
                    enabled: this.budget >= 35
                });
                break;
        }

        return actions;
    }

    getResourceActions() {
        const actions = [];

        // Net distribution
        if (this.inventory.nets > 0) {
            actions.push({
                id: 'distribute_nets',
                title: 'Distribute Bed Nets',
                cost: 15,
                description: `Distribute nets to families (${this.inventory.nets} available)`,
                icon: '🛏️',
                enabled: this.budget >= 15 && this.inventory.nets > 0
            });
        }

        // Indoor spraying
        if (this.inventory.spray_bottles > 0) {
            actions.push({
                id: 'indoor_spraying',
                title: 'Indoor Residual Spraying',
                cost: 25,
                description: `Spray high-risk homes (${this.inventory.spray_bottles} bottles)`,
                icon: '💨',
                enabled: this.budget >= 25 && this.inventory.spray_bottles > 0
            });
        }

        return actions;
    }

    executeAction(action) {
        this.budget -= action.cost;
        this.addLogEntry(`${action.title} - Cost: $${action.cost}`);

        switch (action.id) {
            case 'see_patient':
                this.generatePatientEncounter();
                break;
            case 'investigate_outbreak':
                this.handleOutbreakInvestigation();
                break;
            case 'emergency_order':
                this.handleEmergencyOrder();
                break;
            case 'education_campaign':
                this.handleEducationCampaign();
                break;
            case 'distribute_nets':
                this.handleNetDistribution();
                break;
            case 'indoor_spraying':
                this.handleIndoorSpraying();
                break;
        }

        this.updateDisplay();
    }

    generatePatientEncounter() {
        // Create realistic patient with African context
        const patientGroup = this.patientDatabase[Math.floor(Math.random() * this.patientDatabase.length)];

        let availableNames = patientGroup.names.filter(name => !this.usedPatientNames.has(name));
        if (availableNames.length === 0) {
            // Reset if all names used
            this.usedPatientNames.clear();
            availableNames = patientGroup.names;
        }

        const nameIndex = Math.floor(Math.random() * availableNames.length);
        const name = availableNames[nameIndex];
        this.usedPatientNames.add(name);

        // Generate patient presentation based on epidemiology
        const patient = this.createRealisticPatient(name, patientGroup, nameIndex);

        this.showPatientModal(patient);
    }

    createRealisticPatient(name, patientGroup, index) {
        // Realistic malaria presentations based on WHO case definitions
        const presentations = [
            {
                type: 'uncomplicated_malaria',
                symptoms: 'High fever (39.1°C), severe chills, headache, muscle aches, nausea',
                history: 'Symptoms started 2 days ago, no bed net use, lives near stagnant water',
                rdtResult: true,
                parasitemia: 'moderate',
                severity: 'moderate',
                probability: 0.4
            },
            {
                type: 'severe_malaria',
                symptoms: 'High fever (40.2°C), confusion, difficulty breathing, dark urine, extreme weakness',
                history: 'Delayed treatment, symptoms for 5 days, previous incomplete treatment',
                rdtResult: true,
                parasitemia: 'high',
                severity: 'severe',
                probability: 0.1
            },
            {
                type: 'non_malaria_fever',
                symptoms: 'Mild fever (38.2°C), cough, runny nose, sore throat',
                history: 'Recent contact with sick family members, viral-like symptoms',
                rdtResult: false,
                parasitemia: 'none',
                severity: 'mild',
                probability: 0.35
            },
            {
                type: 'suspected_malaria',
                symptoms: 'Intermittent fever (38.5°C), fatigue, loss of appetite, headache',
                history: 'Works in rice fields, inconsistent net use, family history of malaria',
                rdtResult: Math.random() > 0.3, // 70% positive
                parasitemia: 'low',
                severity: 'mild',
                probability: 0.15
            }
        ];

        // Select presentation based on probabilities
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedPresentation = presentations[0];

        for (const presentation of presentations) {
            cumulativeProbability += presentation.probability;
            if (random <= cumulativeProbability) {
                selectedPresentation = presentation;
                break;
            }
        }

        return {
            name,
            age: patientGroup.ages[index],
            portrait: patientGroup.portraits[index],
            occupation: patientGroup.stories[index],
            ...selectedPresentation,
            id: Date.now() + Math.random(),
            village: ['north', 'center', 'south'][Math.floor(Math.random() * 3)]
        };
    }

    showPatientModal(patient) {
        const modal = document.getElementById('patientModal');

        // Patient info
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientAge').textContent = patient.age;
        document.getElementById('patientOccupation').textContent = `Occupation: ${patient.occupation}`;
        document.getElementById('patientPortrait').textContent = patient.portrait;

        // Urgency indicator
        const urgencyElement = document.getElementById('patientUrgency');
        switch (patient.severity) {
            case 'severe':
                urgencyElement.textContent = '🚨 CRITICAL';
                urgencyElement.style.background = 'var(--danger-red)';
                break;
            case 'moderate':
                urgencyElement.textContent = '⚠️ URGENT';
                urgencyElement.style.background = 'var(--warning-amber)';
                break;
            default:
                urgencyElement.textContent = '✅ STABLE';
                urgencyElement.style.background = 'var(--success-emerald)';
        }

        // Patient story with immersive details
        document.getElementById('patientStory').innerHTML = `
            <h4>Patient Presentation</h4>
            <div class="patient-symptoms">
                <strong>Symptoms:</strong> ${patient.symptoms}
            </div>
            <div class="patient-history">
                <strong>History:</strong> ${patient.history}
            </div>
            <div class="patient-context">
                <strong>Context:</strong> ${patient.name} ${patient.occupation} from ${patient.village} village.
            </div>
        `;

        // Show diagnostic options
        this.showDiagnosticOptions(patient);

        modal.classList.add('active');
        this.currentPatient = patient;
    }

    showDiagnosticOptions(patient) {
        const optionsDiv = document.getElementById('diagnosticOptions');
        optionsDiv.innerHTML = `
            <h4>Diagnostic Approach</h4>
            <div class="diagnostic-choices">
                <div class="diagnostic-choice ${this.inventory.rdt_tests > 0 && this.budget >= 5 ? '' : 'disabled'}" 
                     onclick="${this.inventory.rdt_tests > 0 && this.budget >= 5 ? 'game.conductRDT()' : ''}">
                    <div class="choice-header">
                        <span class="choice-title">🔬 Rapid Diagnostic Test</span>
                        <span class="choice-cost">$5</span>
                    </div>
                    <div class="choice-description">
                        95% accuracy, requires test kit (${this.inventory.rdt_tests} available)
                    </div>
                </div>

                <div class="diagnostic-choice" onclick="game.conductClinicalDiagnosis()">
                    <div class="choice-header">
                        <span class="choice-title">🩺 Clinical Diagnosis</span>
                        <span class="choice-cost">Free</span>
                    </div>
                    <div class="choice-description">
                        Based on symptoms only, 60-70% accuracy depending on experience
                    </div>
                </div>

                <div class="diagnostic-choice ${this.budget >= 15 ? '' : 'disabled'}" 
                     onclick="${this.budget >= 15 ? 'game.referPatient()' : ''}">
                    <div class="choice-header">
                        <span class="choice-title">🏥 Refer to District Hospital</span>
                        <span class="choice-cost">$15</span>
                    </div>
                    <div class="choice-description">
                        Send patient for advanced diagnostics and treatment
                    </div>
                </div>
            </div>
        `;

        // Make game instance globally accessible
        window.game = this;
    }

    conductRDT() {
        if (this.inventory.rdt_tests <= 0 || this.budget < 5) return;

        this.inventory.rdt_tests--;
        this.budget -= 5;

        const patient = this.currentPatient;

        // RDT accuracy simulation
        let result = patient.rdtResult;
        if (Math.random() > 0.95) {
            result = !result; // 5% false positive/negative rate
        }

        this.showDiagnosticResult('RDT', result, patient);
    }

    conductClinicalDiagnosis() {
        const patient = this.currentPatient;

        // Clinical diagnosis accuracy varies by presentation
        let accuracy = 0.6; // Base accuracy

        if (patient.type === 'severe_malaria') accuracy = 0.8; // More obvious
        if (patient.type === 'non_malaria_fever') accuracy = 0.4; // Often misdiagnosed

        const result = Math.random() < accuracy ? patient.rdtResult : !patient.rdtResult;

        this.showDiagnosticResult('Clinical', result, patient);
    }

    referPatient() {
        if (this.budget < 15) return;

        this.budget -= 15;
        const patient = this.currentPatient;

        // Referral outcomes
        const outcomes = [
            `${patient.name} was successfully treated at the district hospital.`,
            `${patient.name} received advanced care and recovered fully.`,
            `Transportation delays complicated ${patient.name}'s condition.`
        ];

        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

        document.getElementById('patientOutcome').innerHTML = `
            <h4>Referral Outcome</h4>
            <div class="outcome-message">${outcome}</div>
        `;

        document.getElementById('patientOutcome').style.display = 'block';
        document.getElementById('continueBtn').style.display = 'block';

        if (outcome.includes('successfully') || outcome.includes('recovered')) {
            this.savedLives++;
            this.reputation += 2;
        }

        this.totalPatients++;
        this.addLogEntry(`Referred ${patient.name} to district hospital`);
    }

    showDiagnosticResult(method, result, patient) {
        const resultDiv = document.getElementById('diagnosticResult');

        resultDiv.innerHTML = `
            <h4>${method} Result</h4>
            <div class="diagnostic-outcome ${result ? 'positive' : 'negative'}">
                <strong>${result ? '⚠️ POSITIVE' : '✅ NEGATIVE'} for Plasmodium falciparum</strong>
            </div>
            <div class="result-details">
                ${method === 'RDT' ? 
                  `High confidence result. ${result ? 'Malaria parasites detected.' : 'No malaria parasites detected.'}` :
                  `Clinical assessment based on symptoms. ${result ? 'Consistent with malaria.' : 'Likely non-malarial fever.'}`
                }
            </div>
        `;

        resultDiv.style.display = 'block';

        setTimeout(() => {
            this.showTreatmentOptions(result, patient);
        }, 1500);
    }

    showTreatmentOptions(malariaPositive, patient) {
        const optionsDiv = document.getElementById('treatmentOptions');

        if (malariaPositive) {
            optionsDiv.innerHTML = `
                <h4>Malaria Treatment Options</h4>
                <div class="treatment-choices">
                    <div class="treatment-choice ${this.inventory.act_full > 0 && this.budget >= 12 ? '' : 'disabled'}" 
                         onclick="${this.inventory.act_full > 0 && this.budget >= 12 ? 'game.treatWithFullACT()' : ''}">
                        <div class="choice-header">
                            <span class="choice-title">💊 Complete ACT Course (3 days)</span>
                            <span class="choice-cost">$12</span>
                        </div>
                        <div class="choice-description">
                            Gold standard WHO treatment, prevents resistance (${this.inventory.act_full} available)
                        </div>
                    </div>

                    <div class="treatment-choice ${this.inventory.artemisinin > 0 && this.budget >= 8 ? '' : 'disabled'}" 
                         onclick="${this.inventory.artemisinin > 0 && this.budget >= 8 ? 'game.treatWithArtemisinin()' : ''}">
                        <div class="choice-header">
                            <span class="choice-title">🧪 Artemisinin Monotherapy</span>
                            <span class="choice-cost">$8</span>
                        </div>
                        <div class="choice-description">
                            Single drug treatment - increases resistance risk (${this.inventory.artemisinin} available)
                        </div>
                    </div>

                    <div class="treatment-choice" onclick="game.provideSupportiveCare()">
                        <div class="choice-header">
                            <span class="choice-title">🌡️ Supportive Care Only</span>
                            <span class="choice-cost">$3</span>
                        </div>
                        <div class="choice-description">
                            Pain relief and hydration - not recommended for confirmed malaria
                        </div>
                    </div>
                </div>
            `;
        } else {
            optionsDiv.innerHTML = `
                <h4>Non-Malaria Treatment</h4>
                <div class="treatment-choices">
                    <div class="treatment-choice" onclick="game.provideSupportiveCare()">
                        <div class="choice-header">
                            <span class="choice-title">🌡️ Supportive Care</span>
                            <span class="choice-cost">$3</span>
                        </div>
                        <div class="choice-description">
                            Appropriate care for viral fever - pain relief, hydration
                        </div>
                    </div>

                    <div class="treatment-choice ${this.inventory.act_full > 0 && this.budget >= 12 ? '' : 'disabled'}" 
                         onclick="${this.inventory.act_full > 0 && this.budget >= 12 ? 'game.treatWithUnnecessaryACT()' : ''}">
                        <div class="choice-header">
                            <span class="choice-title">💊 ACT Despite Negative Test</span>
                            <span class="choice-cost">$12</span>
                        </div>
                        <div class="choice-description">
                            Not recommended - contributes to resistance without benefit
                        </div>
                    </div>
                </div>
            `;
        }

        optionsDiv.style.display = 'block';
    }

    treatWithFullACT() {
        if (this.inventory.act_full <= 0 || this.budget < 12) return;

        this.inventory.act_full--;
        this.budget -= 12;

        const patient = this.currentPatient;
        const success = Math.random() > 0.05; // 95% success rate

        this.showTreatmentOutcome(success, 'ACT', patient);

        // Reduce resistance slightly with proper treatment
        this.resistance = Math.max(0, this.resistance - 0.5);
    }

    treatWithArtemisinin() {
        if (this.inventory.artemisinin <= 0 || this.budget < 8) return;

        this.inventory.artemisinin--;
        this.budget -= 8;

        const patient = this.currentPatient;
        const success = Math.random() > 0.25; // 75% success rate

        this.showTreatmentOutcome(success, 'Artemisinin Monotherapy', patient);

        // Increase resistance with monotherapy
        this.resistance = Math.min(100, this.resistance + 3);

        if (this.resistance > 30) {
            this.showAlert('⚠️ Drug resistance is increasing due to monotherapy use!');
        }
    }

    treatWithUnnecessaryACT() {
        if (this.inventory.act_full <= 0 || this.budget < 12) return;

        this.inventory.act_full--;
        this.budget -= 12;

        const patient = this.currentPatient;

        this.showTreatmentOutcome(false, 'Unnecessary ACT', patient);

        // Increase resistance with unnecessary use
        this.resistance = Math.min(100, this.resistance + 2);
    }

    provideSupportiveCare() {
        if (this.budget < 3) return;

        this.budget -= 3;
        const patient = this.currentPatient;

        // Supportive care outcome depends on actual condition
        const success = !patient.rdtResult; // Good for non-malaria, bad for malaria

        this.showTreatmentOutcome(success, 'Supportive Care', patient);
    }

    showTreatmentOutcome(success, treatment, patient) {
        const outcomeDiv = document.getElementById('patientOutcome');

        let outcomeMessage = '';
        let impactMessage = '';

        if (success) {
            outcomeMessage = `✅ ${patient.name} responded well to ${treatment}.`;
            impactMessage = 'Full recovery expected within 3-5 days. Patient educated on prevention.';
            this.savedLives++;
            this.reputation += 1;

            // Improve village health
            this.villages[patient.village].health = Math.min(100, this.villages[patient.village].health + 2);
            this.villages[patient.village].cases = Math.max(0, this.villages[patient.village].cases - 1);
        } else {
            if (patient.rdtResult && treatment === 'Supportive Care') {
                outcomeMessage = `❌ ${patient.name}'s condition worsened without antimalarial treatment.`;
                impactMessage = 'Patient required emergency referral. Family lost trust in clinic.';
                this.lostLives++;
                this.reputation -= 3;
                this.villages[patient.village].trust -= 5;
            } else if (!patient.rdtResult && treatment.includes('ACT')) {
                outcomeMessage = `⚠️ ${patient.name} received unnecessary antimalarial treatment.`;
                impactMessage = 'No clinical benefit, contributes to drug resistance. Resources wasted.';
                this.reputation -= 1;
            } else {
                outcomeMessage = `❌ ${patient.name} did not respond to ${treatment}.`;
                impactMessage = 'Treatment failure. May indicate drug resistance or severe disease.';
                this.lostLives++;
                this.reputation -= 2;
                this.villages[patient.village].trust -= 3;
            }

            // Worsen village health
            this.villages[patient.village].health = Math.max(0, this.villages[patient.village].health - 3);
            this.villages[patient.village].cases += 1;
        }

        outcomeDiv.innerHTML = `
            <h4>Treatment Outcome</h4>
            <div class="outcome-message ${success ? 'success' : 'failure'}">
                ${outcomeMessage}
            </div>
            <div class="outcome-impact">
                ${impactMessage}
            </div>
            <div class="outcome-stats">
                <small>Reputation: ${this.reputation > 0 ? '+' : ''}${success ? '+1' : (patient.rdtResult && treatment === 'Supportive Care' ? '-3' : '-1')} | 
                Village trust: ${patient.village} village ${success ? '+2' : '-3'}</small>
            </div>
        `;

        outcomeDiv.style.display = 'block';
        document.getElementById('continueBtn').style.display = 'block';

        this.totalPatients++;
        this.addLogEntry(`${patient.name}: ${treatment} - ${success ? 'Success' : 'Failed'}`);

        // Store decision for end game analysis
        this.decisionHistory.push({
            patient: patient.name,
            diagnosis: patient.rdtResult ? 'Malaria' : 'Non-malaria',
            treatment,
            outcome: success ? 'Success' : 'Failure',
            week: this.week,
            day: this.day
        });

        document.getElementById('continueBtn').onclick = () => {
            this.closePatientModal();
        };
    }

    closePatientModal() {
        document.getElementById('patientModal').classList.remove('active');
        this.currentPatient = null;

        // Progress day/week
        this.day++;
        if (this.day > 7) {
            this.day = 1;
            this.week++;
            this.weeklyProgressions();
        }

        this.updateDisplay();

        // Check for game end conditions
        if (this.checkGameEnd()) {
            return;
        }

        // Generate next scenario after brief delay
        setTimeout(() => {
            this.generateScenario();
        }, 2000);
    }

    weeklyProgressions() {
        // Weekly supply delivery
        this.budget += 60; // Weekly stipend
        this.inventory.rdt_tests += 10;
        this.inventory.act_full += 8;
        this.inventory.act_child += 5;

        // Natural disease progression
        Object.keys(this.villages).forEach(village => {
            const v = this.villages[village];

            // Cases spread if health is poor
            if (v.health < 60) {
                v.cases += Math.floor(Math.random() * 3) + 1;
            }

            // Random events
            if (Math.random() > 0.8) {
                v.cases += Math.floor(Math.random() * 2) + 1;
                this.showAlert(`📈 New cases reported in ${village} village`);
            }
        });

        this.addLogEntry(`Week ${this.week} begins - Supplies restocked`);

        // Check for achievement unlocks
        this.checkAchievements();
    }

    checkGameEnd() {
        // Win conditions
        if (this.week > 12) {
            if (this.savedLives > this.lostLives && this.resistance < 50 && this.reputation > 30) {
                this.showGameEnd(true, 'mission_accomplished');
                return true;
            } else {
                this.showGameEnd(false, 'mission_failed');
                return true;
            }
        }

        // Lose conditions
        if (this.resistance >= 80) {
            this.showGameEnd(false, 'resistance_crisis');
            return true;
        }

        if (this.reputation <= -20) {
            this.showGameEnd(false, 'lost_trust');
            return true;
        }

        if (Object.values(this.villages).every(v => v.health < 30)) {
            this.showGameEnd(false, 'health_collapse');
            return true;
        }

        return false;
    }

    showGameEnd(won, reason) {
        const modal = document.getElementById('gameOverModal');
        const titleElement = document.getElementById('gameOverTitle');
        const iconElement = document.getElementById('resultIcon');
        const reportElement = document.getElementById('finalReport');

        if (won) {
            titleElement.textContent = 'Mission Accomplished';
            iconElement.textContent = '🎉';
            reportElement.innerHTML = `
                <h3>Outstanding Service to the Community</h3>
                <p>Dr. Mwangi, your dedication has saved countless lives and prevented a resistance crisis.</p>
                <div class="final-stats">
                    <div class="stat">Lives Saved: <strong>${this.savedLives}</strong></div>
                    <div class="stat">Lives Lost: <strong>${this.lostLives}</strong></div>
                    <div class="stat">Total Patients: <strong>${this.totalPatients}</strong></div>
                    <div class="stat">Final Reputation: <strong>${this.reputation}</strong></div>
                    <div class="stat">Drug Resistance: <strong>${Math.round(this.resistance)}%</strong></div>
                </div>
                <p><strong>Your legacy:</strong> The community trusts the clinic, drug resistance remains low, and families sleep safely under bed nets you distributed.</p>
            `;
        } else {
            let title, icon, description;

            switch (reason) {
                case 'resistance_crisis':
                    title = 'Drug Resistance Crisis';
                    icon = '🧬';
                    description = 'Resistance reached critical levels. First-line treatments are no longer effective.';
                    break;
                case 'lost_trust':
                    title = 'Community Trust Lost';
                    icon = '💔';
                    description = 'Poor decisions damaged your reputation. The community no longer trusts the clinic.';
                    break;
                case 'health_collapse':
                    title = 'Public Health Emergency';
                    icon = '🚨';
                    description = 'All villages are in health crisis. The situation requires emergency intervention.';
                    break;
                default:
                    title = 'Mission Not Accomplished';
                    icon = '😞';
                    description = 'While you helped some patients, the overall mission objectives were not met.';
            }

            titleElement.textContent = title;
            iconElement.textContent = icon;
            reportElement.innerHTML = `
                <h3>${description}</h3>
                <div class="final-stats">
                    <div class="stat">Lives Saved: <strong>${this.savedLives}</strong></div>
                    <div class="stat">Lives Lost: <strong>${this.lostLives}</strong></div>
                    <div class="stat">Total Patients: <strong>${this.totalPatients}</strong></div>
                    <div class="stat">Final Reputation: <strong>${this.reputation}</strong></div>
                    <div class="stat">Drug Resistance: <strong>${Math.round(this.resistance)}%</strong></div>
                </div>
                <p><strong>Reflection:</strong> Each decision in healthcare ripples through the community. Consider how different choices might have led to better outcomes.</p>
            `;
        }

        // Show achievements
        this.displayAchievements();

        modal.classList.add('active');

        // Bind restart button
        document.getElementById('playAgainBtn').onclick = () => {
            this.resetGame();
        };
    }

    resetGame() {
        // Reset all game state
        this.week = 1;
        this.day = 1;
        this.budget = 150;
        this.reputation = 50;
        this.resistance = 0;
        this.totalPatients = 0;
        this.savedLives = 0;
        this.lostLives = 0;

        this.villages = {
            north: { health: 80, cases: 5, outbreak: false, trust: 70 },
            center: { health: 85, cases: 3, outbreak: false, trust: 80 },
            south: { health: 75, cases: 8, outbreak: false, trust: 60 }
        };

        this.inventory = {
            rdt_tests: 20,
            act_full: 15,
            act_child: 8,
            artemisinin: 5,
            nets: 25,
            spray_bottles: 3
        };

        this.currentScenario = null;
        this.eventQueue = [];
        this.achievements = [];
        this.decisionHistory = [];
        this.usedPatientNames.clear();
        this.gamePhase = 'intro';

        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));

        // Return to intro
        this.showScreen('intro-screen');
        this.startIntroSequence();
    }

    // Helper methods for UI updates and game progression
    updateDisplay() {
        document.getElementById('weekDisplay').textContent = this.week;
        document.getElementById('budgetDisplay').textContent = this.budget;

        // Update village indicators
        Object.keys(this.villages).forEach((village, index) => {
            const indicator = document.getElementById(`village${index + 1}`);
            const v = this.villages[village];

            if (v.health < 30) {
                indicator.className = 'village-indicator critical';
            } else if (v.health < 60) {
                indicator.className = 'village-indicator sick';
            } else {
                indicator.className = 'village-indicator';
            }
        });

        // Update resistance meter
        document.getElementById('resistanceMeter').style.width = `${this.resistance}%`;

        let resistanceText = 'Low Risk';
        if (this.resistance > 60) resistanceText = 'Critical Risk';
        else if (this.resistance > 30) resistanceText = 'High Risk';
        else if (this.resistance > 10) resistanceText = 'Moderate Risk';

        document.getElementById('resistanceText').textContent = `${resistanceText} (${Math.round(this.resistance)}%)`;

        // Update transmission map
        document.querySelectorAll('.map-cell').forEach((cell, index) => {
            const village = Object.values(this.villages)[index];

            cell.className = 'map-cell';
            if (village.cases > 15) {
                cell.classList.add('high-risk');
            } else if (village.cases > 8) {
                cell.classList.add('medium-risk');
            }
        });

        // Update inventory
        this.updateInventoryDisplay();
    }

    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.innerHTML = '';

        const items = [
            { key: 'rdt_tests', name: 'RDT Tests', icon: '🔬' },
            { key: 'act_full', name: 'ACT (Adult)', icon: '💊' },
            { key: 'act_child', name: 'ACT (Child)', icon: '🧒' },
            { key: 'artemisinin', name: 'Artemisinin', icon: '🧪' },
            { key: 'nets', name: 'Bed Nets', icon: '🛏️' },
            { key: 'spray_bottles', name: 'Insecticide', icon: '💨' }
        ];

        items.forEach(item => {
            const count = this.inventory[item.key];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';

            itemDiv.innerHTML = `
                <div class="inventory-icon">${item.icon}</div>
                <div class="inventory-name">${item.name}</div>
                <div class="inventory-count ${count < 5 ? 'low' : ''}">${count}</div>
            `;

            inventoryGrid.appendChild(itemDiv);
        });
    }

    addLogEntry(message) {
        const logContent = document.getElementById('eventLog');
        const entry = document.createElement('div');
        entry.className = 'log-entry';

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });

        entry.innerHTML = `
            <span class="log-time">${timeStr}</span>
            <span class="log-message">${message}</span>
        `;

        logContent.insertBefore(entry, logContent.firstChild);

        // Keep only last 10 entries
        while (logContent.children.length > 10) {
            logContent.removeChild(logContent.lastChild);
        }
    }

    showAlert(message) {
        const alertBanner = document.getElementById('alertBanner');
        document.getElementById('alertText').textContent = message;
        alertBanner.style.display = 'block';

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertBanner.style.display = 'none';
        }, 5000);
    }

    showTutorial(message, targetTab) {
        if (this.tutorialStep > 5) return; // Limit tutorial

        const overlay = document.getElementById('tutorialOverlay');
        document.getElementById('tutorialText').textContent = message;
        overlay.style.display = 'flex';

        if (targetTab) {
            // Highlight the target tab
            setTimeout(() => {
                const targetElement = document.querySelector(`[onclick="showTab('${targetTab}')"]`);
                if (targetElement) {
                    targetElement.style.animation = 'pulse 1s infinite';
                }
            }, 500);
        }

        document.getElementById('tutorialNextBtn').onclick = () => {
            overlay.style.display = 'none';
            this.tutorialStep++;

            // Remove highlight
            if (targetTab) {
                const targetElement = document.querySelector(`[onclick="showTab('${targetTab}')"]`);
                if (targetElement) {
                    targetElement.style.animation = '';
                }
            }
        };
    }

    startDecisionTimer(seconds) {
        const timerDiv = document.getElementById('decisionTimer');
        const timerFill = document.getElementById('timerFill');
        const timerText = document.getElementById('timerText');

        timerDiv.style.display = 'block';
        timerFill.style.width = '100%';

        let timeRemaining = seconds;

        const countdown = setInterval(() => {
            timeRemaining--;
            timerText.textContent = `${timeRemaining}s`;
            timerFill.style.width = `${(timeRemaining / seconds) * 100}%`;

            if (timeRemaining <= 0) {
                clearInterval(countdown);
                timerDiv.style.display = 'none';
                this.showAlert('⏰ Decision time expired - using default action');

                // Default action for urgent scenarios
                if (this.currentScenario?.templateKey === 'outbreak_warning') {
                    this.handleOutbreakInvestigation();
                }
            }
        }, 1000);
    }

    // Additional scenario handlers
    handleOutbreakInvestigation() {
        this.addLogEntry('Investigating outbreak in affected village');
        this.showAlert('🔍 Outbreak investigation revealed contaminated water source');

        // Improve village health through investigation
        this.villages.north.cases = Math.max(0, this.villages.north.cases - 3);
        this.villages.north.health = Math.min(100, this.villages.north.health + 5);
        this.reputation += 3;

        setTimeout(() => this.generateScenario(), 3000);
    }

    handleEmergencyOrder() {
        this.addLogEntry('Emergency supplies ordered via air transport');

        // Receive additional supplies
        this.inventory.rdt_tests += 15;
        this.inventory.act_full += 10;
        this.reputation += 2;

        this.showAlert('📦 Emergency supplies delivered successfully');
        setTimeout(() => this.generateScenario(), 2000);
    }

    handleEducationCampaign() {
        this.addLogEntry('Community education campaign launched');

        // Improve village trust and awareness
        Object.keys(this.villages).forEach(village => {
            this.villages[village].trust = Math.min(100, this.villages[village].trust + 8);
        });

        this.reputation += 4;
        this.showAlert('📢 Community responded positively to education campaign');

        setTimeout(() => this.generateScenario(), 3000);
    }

    handleNetDistribution() {
        this.inventory.nets = Math.max(0, this.inventory.nets - 5);
        this.addLogEntry('Distributed bed nets to high-risk families');

        // Reduce transmission in villages
        Object.keys(this.villages).forEach(village => {
            this.villages[village].cases = Math.max(0, this.villages[village].cases - 2);
        });

        setTimeout(() => this.generateScenario(), 2000);
    }

    handleIndoorSpraying() {
        this.inventory.spray_bottles = Math.max(0, this.inventory.spray_bottles - 1);
        this.addLogEntry('Indoor residual spraying conducted in high-risk homes');

        // Significantly reduce transmission
        Object.keys(this.villages).forEach(village => {
            this.villages[village].cases = Math.max(0, this.villages[village].cases - 3);
        });

        setTimeout(() => this.generateScenario(), 2000);
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_save',
                title: 'First Life Saved',
                description: 'Successfully treated your first patient',
                condition: () => this.savedLives >= 1
            },
            {
                id: 'resistance_fighter',
                title: 'Resistance Fighter',
                description: 'Kept drug resistance below 20% for 8 weeks',
                condition: () => this.week >= 8 && this.resistance < 20
            },
            {
                id: 'community_hero',
                title: 'Community Hero',
                description: 'Achieved high reputation (50+) and village trust',
                condition: () => this.reputation >= 50 && Object.values(this.villages).every(v => v.trust >= 70)
            }
        ];

        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAlert(`🏆 Achievement Unlocked: ${achievement.title}`);
            }
        });
    }

    displayAchievements() {
        const achievementsList = document.getElementById('achievementsList');

        if (this.achievements.length === 0) {
            achievementsList.innerHTML = '<p>No achievements earned this mission.</p>';
            return;
        }

        const achievementData = {
            first_save: { title: 'First Life Saved', icon: '❤️' },
            resistance_fighter: { title: 'Resistance Fighter', icon: '🛡️' },
            community_hero: { title: 'Community Hero', icon: '👑' }
        };

        achievementsList.innerHTML = `
            <h3>🏆 Achievements Earned</h3>
            <div class="achievements-grid">
                ${this.achievements.map(id => `
                    <div class="achievement-item">
                        <span class="achievement-icon">${achievementData[id].icon}</span>
                        <span class="achievement-title">${achievementData[id].title}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MalariaSimulation();
});