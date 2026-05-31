import React, { useState, useEffect } from 'react';
import { 
  Activity, Heart, Shield, Award, Settings, LogOut, 
  MessageSquare, Upload, Calendar, Volume2, Mic, 
  Moon, Sun, AlertTriangle, Cpu, FileText, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, 
  Tooltip, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK CONSTANTS & ENUMS ---
const MOCK_DOCTORS = [
  { id: "1", name: "Dr. Elena Vance", spec: "Cardiologist", hospital: "Metro Heart Institute", fee: 150, rating: 4.9 },
  { id: "2", name: "Dr. Arthur Pendelton", spec: "Endocrinologist", hospital: "MediSense Clinic", fee: 120, rating: 4.8 },
  { id: "3", name: "Dr. Clara Oswald", spec: "Neurologist", hospital: "Cerebral Health Center", fee: 180, rating: 5.0 },
  { id: "4", name: "Dr. Marcus Brody", spec: "Nephrologist", hospital: "Renal Specialty Hospital", fee: 140, rating: 4.7 }
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Auth state
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'otp' | 'authenticated'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [otpInput, setOtpInput] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predictions' | 'cnn' | 'reports' | 'chat' | 'doctors' | 'admin'>('dashboard');

  // Wearables state
  const [wearableData, setWearableData] = useState({
    heart_rate: 74,
    steps: 8420,
    calories_burned: 2150,
    sleep_duration_minutes: 460,
    blood_oxygen_level: 98.4
  });
  const [healthScore, setHealthScore] = useState(88);

  // Tabular predictions form state
  const [selectedDisease, setSelectedDisease] = useState<'heart' | 'diabetes' | 'ckd' | 'liver'>('heart');
  const [tabularInputs, setTabularInputs] = useState<any>({
    age: 52,
    sex: 1, // Male
    cp: 2,  // Chest Pain Type
    trestbps: 130,
    chol: 240,
    fbs: 0,
    restecg: 1,
    thalach: 152,
    // Diabetes specific
    glucose: 140,
    blood_pressure: 80,
    bmi: 28.5,
    insulin: 110,
    // CKD specific
    specific_gravity: 1.015,
    albumin: 1.0,
    sugar: 0.0,
    blood_urea: 42.0,
    creatinine: 1.1,
    // Liver specific
    gender: 1,
    total_bilirubin: 1.4,
    direct_bilirubin: 0.6,
    alkaline_phosphotase: 220,
    alamine_aminotransferase: 45,
    aspartate_aminotransferase: 50,
    total_proteins: 6.8,
    albumin_liver: 3.2
  });

  const [lastPredictionResult, setLastPredictionResult] = useState<any>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);

  // CNN scan state
  const [cnnScanType, setCnnScanType] = useState<'pneumonia' | 'brain_tumor'>('pneumonia');
  const [uploadedScanFile, setUploadedScanFile] = useState<File | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: 'ai', text: "Hello! I am your MediSense Clinical AI Assistant. Describe any symptoms you are experiencing, and I'll help analyze risk factors.", time: 'Just now' }
  ]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isWhisperActive, setIsWhisperActive] = useState(false);

  // Reports state
  const [uploadedReportFile, setUploadedReportFile] = useState<File | null>(null);
  const [parsedReportResult, setParsedReportResult] = useState<any>(null);
  const [reportsList, setReportsList] = useState<any[]>([]);

  // Doctors & Appointments
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentsList, setAppointmentsList] = useState<any[]>([
    { id: 1, doctor_name: "Dr. Elena Vance", appointment_time: "2026-06-03 at 10:30 AM", status: "CONFIRMED", reason: "Follow-up on cardiovascular values" }
  ]);
  const [symptomSearchText, setSymptomSearchText] = useState('');
  const [specialistRecommendations, setSpecialistRecommendations] = useState<any[]>([]);

  // --- HOOKS & SIDE-EFFECTS ---
  useEffect(() => {
    // Sync dark mode class with HTML tag
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Tabular Inputs change
  const handleInputChange = (field: string, val: any) => {
    setTabularInputs((prev: any) => ({
      ...prev,
      [field]: val
    }));
  };

  // --- AUTH ROUTINES ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    
    // Simulate API query and login verification
    // For demo/validation, if it's correct we transition
    const userRole = authEmail.includes('doctor') ? 'DOCTOR' : authEmail.includes('admin') ? 'ADMIN' : 'PATIENT';
    const parsedUser = {
      email: authEmail,
      full_name: authName || authEmail.split('@')[0].toUpperCase(),
      role: userRole
    };
    
    setCurrentUser(parsedUser);
    setAuthStep('authenticated');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) return;
    setAuthStep('otp');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === '123456' || otpInput.length === 6) {
      const parsedUser = {
        email: authEmail,
        full_name: authName,
        role: authRole
      };
      setCurrentUser(parsedUser);
      setAuthStep('authenticated');
    } else {
      alert("Invalid verification token. Use the demo code: 123456");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthStep('login');
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  // --- ML PREDICTION ROUTINES ---
  const executeTabularPrediction = () => {
    // Generate coefficients weights based on config to render real math
    let score = 50;
    let prob = 0.5;
    let shap: any[] = [];
    
    if (selectedDisease === 'heart') {
      const { age, sex, cp, trestbps, chol, fbs, restecg, thalach } = tabularInputs;
      const logodds = -3.5 + (age * 0.04) + (sex * 0.8) + (cp * 0.9) + (trestbps * 0.015) + (chol * 0.005) + (fbs * 0.3) + (restecg * 0.2) + (thalach * -0.03);
      prob = 1 / (1 + Math.exp(-logodds));
      score = Math.round(prob * 100);
      shap = [
        { feature: "Chest Pain (cp)", impact: cp * 0.9, positive: true },
        { feature: "Sex (sex)", impact: sex * 0.8, positive: true },
        { feature: "Resting BP (trestbps)", impact: trestbps * 0.015, positive: true },
        { feature: "Age (age)", impact: age * 0.04, positive: true },
        { feature: "Fasting Sugar (fbs)", impact: fbs * 0.3, positive: true },
        { feature: "Cholesterol (chol)", impact: chol * 0.005, positive: true },
        { feature: "Resting ECG (restecg)", impact: restecg * 0.2, positive: true },
        { feature: "Max Heart Rate (thalach)", impact: thalach * -0.03, positive: false }
      ];
    } else if (selectedDisease === 'diabetes') {
      const { glucose, blood_pressure, bmi, insulin, age } = tabularInputs;
      const logodds = -8.0 + (glucose * 0.05) + (blood_pressure * 0.01) + (bmi * 0.12) + (insulin * 0.002) + (age * 0.03);
      prob = 1 / (1 + Math.exp(-logodds));
      score = Math.round(prob * 100);
      shap = [
        { feature: "Glucose Level", impact: glucose * 0.05, positive: true },
        { feature: "Body Mass Index (BMI)", impact: bmi * 0.12, positive: true },
        { feature: "Patient Age", impact: age * 0.03, positive: true },
        { feature: "Insulin Serum", impact: insulin * 0.002, positive: true },
        { feature: "Blood Pressure", impact: blood_pressure * 0.01, positive: true }
      ];
    } else {
      // General mock
      prob = 0.35;
      score = 35;
      shap = [
        { feature: "Biomarker Level A", impact: 1.2, positive: true },
        { feature: "Age Demographics", impact: 0.8, positive: true },
        { feature: "Relative Body Weight", impact: -0.4, positive: false }
      ];
    }

    const level = score < 30 ? "LOW" : score < 70 ? "MODERATE" : "HIGH";
    
    // Sort shap values by impact absolute
    shap.sort((a,b) => Math.abs(b.impact) - Math.abs(a.impact));

    const result = {
      type: selectedDisease.toUpperCase(),
      score,
      level,
      probability: prob,
      shap,
      date: new Date().toLocaleTimeString()
    };

    setLastPredictionResult(result);
    setPredictionHistory(prev => [result, ...prev]);
    
    // Adjust unified health score based on newest prediction
    setHealthScore(Math.max(10, Math.min(100, 95 - Math.round(score * 0.25))));
  };

  // --- COMPUTER VISION PROCESSOR ---
  const handleCnnFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedScanFile(file);
      setScanPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const triggerCnnScan = () => {
    if (!uploadedScanFile) return;
    setIsScanning(true);
    
    // Simulate advanced ResNet/EfficientNet convolution passes
    setTimeout(() => {
      setIsScanning(false);
      const isNormal = uploadedScanFile.name.toLowerCase().includes('normal') || Math.random() > 0.5;
      const prob = isNormal ? 0.14 : 0.88;
      const score = Math.round(prob * 100);
      
      setScanResult({
        type: cnnScanType.toUpperCase() === 'PNEUMONIA' ? 'Chest X-Ray Pneumonia' : 'Brain MRI Tumor',
        filename: uploadedScanFile.name,
        probability: prob,
        score,
        level: score < 35 ? "NORMAL" : "HIGH RISK",
        explanation: cnnScanType.toUpperCase() === 'PNEUMONIA' 
          ? "Dense consolidations detected in lower-left lung segments indicating structural consolidation." 
          : "T2-weighted scan presents hyperintense lesions within frontal brain lobe lobes.",
        coordinates: { x: 140, y: 190, radius: 80 }
      });
      
      setHealthScore(prev => Math.max(10, Math.min(100, prev - (isNormal ? 0 : 15))));
    }, 2500);
  };

  // --- CHAT DIALOGUE ---
  const handleSendMessage = () => {
    if (!currentMessageInput.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: currentMessageInput, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    
    const query = currentMessageInput.toLowerCase();
    setCurrentMessageInput('');

    // Process matching diagnostic responses
    setTimeout(() => {
      let aiText = "I have recorded those symptoms. To view detailed risk indicators, please submit your vitals in our Tabular Predictions or upload diagnostics to our CNN screen.";
      
      if (query.includes('chest') || query.includes('heart') || query.includes('breath')) {
        aiText = "⚠️ CLINICAL WARNING: Chest pain or cardiovascular discomfort detected. I recommend running a comprehensive Heart Disease Risk test in the prediction module immediately.";
      } else if (query.includes('sugar') || query.includes('glucose') || query.includes('diabetes')) {
        aiText = "Increased glucose levels suggest potential metabolic variations. I advise inputting your metrics in the Diabetes Prediction page for an active SHAP analysis.";
      } else if (query.includes('kidney') || query.includes('urea') || query.includes('urine')) {
        aiText = "Urinary anomalies or high creatinine scores are critical parameters. Run the Chronic Kidney Disease diagnostic in predictions.";
      }

      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        time: 'Just now'
      }]);
    }, 1000);
  };

  // Whisper speech transcript simulator
  const handleMicTrigger = () => {
    setIsWhisperActive(true);
    setTimeout(() => {
      setIsWhisperActive(false);
      setCurrentMessageInput("I have been having chronic exhaustion, chest pressure, and a high resting heart rate of 98 bpm.");
    }, 2000);
  };

  // --- REPORTS PARSER ---
  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedReportFile(file);
      
      // Simulating optical character extraction
      setTimeout(() => {
        const report = {
          id: Date.now(),
          filename: file.name,
          date: new Date().toLocaleDateString(),
          summary: "Clinical Chemistry Panel displays elevated fasting blood glucose (158 mg/dL) alongside borderline high systolic arterial pressure (135 mmHg). Total cholesterol sits at 215 mg/dL.",
          anomalies: [
            "Hyperglycemic threshold crossed: Vitals represent 158 mg/dL (Reference margin < 100 mg/dL)",
            "Systemic Arterial Pressure: 135/85 mmHg (Indicative of Stage-1 Hypertension)"
          ]
        };
        setParsedReportResult(report);
        setReportsList(prev => [report, ...prev]);
      }, 1500);
    }
  };

  // --- APPOINTMENTS BOOKING ---
  const handleDoctorSearch = () => {
    if (!symptomSearchText) return;
    const txt = symptomSearchText.toLowerCase();
    let matches = [MOCK_DOCTORS[0]]; // Default cardiologists
    
    if (txt.includes('glucose') || txt.includes('sugar') || txt.includes('diabetes')) {
      matches = [MOCK_DOCTORS[1]];
    } else if (txt.includes('head') || txt.includes('brain') || txt.includes('dizzy')) {
      matches = [MOCK_DOCTORS[2]];
    } else if (txt.includes('kidney') || txt.includes('urine')) {
      matches = [MOCK_DOCTORS[3]];
    }
    
    setSpecialistRecommendations(matches);
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !appointmentReason) return;
    const booking = {
      id: Date.now(),
      doctor_name: selectedDoctor.name,
      appointment_time: "Scheduled for next Tuesday at 2:00 PM",
      status: "CONFIRMED",
      reason: appointmentReason
    };
    setAppointmentsList(prev => [booking, ...prev]);
    setSelectedDoctor(null);
    setAppointmentReason('');
    alert("Appointment successfully confirmed!");
  };

  // Mock Wearable Sync
  const triggerWearableSync = () => {
    const updated = {
      heart_rate: 68 + Math.floor(Math.random() * 15),
      steps: wearableData.steps + 850,
      calories_burned: wearableData.calories_burned + 60,
      sleep_duration_minutes: 480,
      blood_oxygen_level: 98.6
    };
    setWearableData(updated);
    // Dynamically update score
    setHealthScore(Math.min(100, Math.max(20, healthScore + 2)));
  };

  // Render Authentication screen
  if (authStep !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
        <div className="glass-panel w-full max-w-md p-8 border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-900" />}
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3">
              <Activity className="w-9 h-9 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-glow-brand text-slate-800 dark:text-white">MediSense AI</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Intelligent Clinical Decision Support Platform</p>
          </div>

          {authStep === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinical Email Address</label>
                <input 
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. physician@medisense.ai" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access PIN / Password</label>
                <input 
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-slate-800"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-[0.98]"
              >
                Authenticate Session
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setAuthStep('register')} 
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Request Vitals Registration Account
                </button>
              </div>
            </form>
          ) : authStep === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Clinical Name</label>
                <input 
                  type="text" 
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Vance" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinical Role</label>
                <select 
                  value={authRole}
                  onChange={(e: any) => setAuthRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white dark:bg-slate-950"
                >
                  <option value="PATIENT">Patient (Vitals diagnostic portal)</option>
                  <option value="DOCTOR">Doctor (Specialist Clinical Portal)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Secure Email Address</label>
                <input 
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. arthur.vance@medisense.ai" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access Password</label>
                <input 
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold rounded-xl transition-all hover:opacity-90 shadow-md shadow-cyan-500/10"
              >
                Request OTP Token
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setAuthStep('login')} 
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Return to Authentication Console
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="p-4 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl mb-4 text-center">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Demo OTP Code sent to clinical registers. Use secret code below:</p>
                <p className="text-xl font-bold tracking-widest text-cyan-600 dark:text-cyan-400 mt-1">123456</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6} 
                  placeholder="e.g. 123456" 
                  className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-slate-800"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 shadow-md shadow-cyan-500/10"
              >
                Validate OTP & Initialize Session
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Synchronized telemetry history for Fitbit syncer
  const FitbitChartData = [
    { name: 'Mon', steps: 6200, heart: 72, sleep: 7.2 },
    { name: 'Tue', steps: 7100, heart: 75, sleep: 6.8 },
    { name: 'Wed', steps: 8300, heart: 74, sleep: 8.0 },
    { name: 'Thu', steps: 6000, heart: 71, sleep: 7.5 },
    { name: 'Fri', steps: 7800, heart: 73, sleep: 7.1 },
    { name: 'Sat', steps: wearableData.steps - 1000, heart: wearableData.heart_rate - 2, sleep: 7.8 },
    { name: 'Sun', steps: wearableData.steps, heart: wearableData.heart_rate, sleep: 8.1 }
  ];

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100">
      
      {/* --- SIDE PANEL NAVIGATION --- */}
      <aside className="w-64 glass-panel border-r border-slate-200/30 dark:border-slate-800/30 flex flex-col p-4 m-4 mr-0 rounded-3xl h-[calc(100vh-2rem)] sticky top-4 shrink-0">
        <div className="flex items-center space-x-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow shadow-cyan-500/10">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-none text-glow-brand">MediSense AI</h2>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Clinical Support</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('predictions')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'predictions' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <Heart className="w-4 h-4" />
            <span>Tabular Diagnostics</span>
          </button>

          <button 
            onClick={() => setActiveTab('cnn')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'cnn' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Computer Vision (CNN)</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Medical Vault (OCR)</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Clinical AI Assistant</span>
          </button>

          <button 
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'doctors' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Doctor Network</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'admin' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin Analytics</span>
            </button>
          )}
        </nav>

        {/* --- USER ACCOUNT INFO FOOTER --- */}
        <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800/30 flex flex-col space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 flex items-center justify-center text-cyan-500 font-semibold text-xs border border-cyan-500/25">
              {currentUser?.full_name.slice(0,2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate leading-tight">{currentUser?.full_name}</p>
              <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 tracking-wider block uppercase mt-0.5">{currentUser?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 p-4 overflow-y-auto max-h-screen">
        
        {/* --- TOP ROW CONFIG & HEADER --- */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clinical Control Panel</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent clinical assessment algorithms online</p>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-3 rounded-2xl glass-panel glass-panel-hover flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-900" />}
            </button>

            <div className="p-1 px-3 glass-panel flex items-center space-x-2 text-xs font-semibold text-emerald-500 bg-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Model Core Active</span>
            </div>
          </div>
        </header>

        {/* --- TAB VIEWPORTS --- */}
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Health Score and Wearable telemetry cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Apple-grade Animated Radial Health Score */}
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Unified AI Health Score</h3>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Outer glowing track */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="8" fill="none"/>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="url(#healthGrad)" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9"/>
                        <stop offset="100%" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">{healthScore}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Optimal</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Synthesized dynamically from <strong>{predictionHistory.length} predictions</strong> and wearable trends.
                </p>
              </div>

              {/* Fitbit Telemetry Sync Display */}
              <div className="glass-panel p-6 col-span-2 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Wearable Device Telemetry</h3>
                    <p className="text-lg font-bold mt-1">Fitbit Active Sync</p>
                  </div>
                  <button 
                    onClick={triggerWearableSync}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center space-x-2"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Trigger Active Sync</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Heart Rate</span>
                    <p className="text-xl font-bold mt-1 flex items-baseline space-x-1">
                      <span className="text-rose-500">{wearableData.heart_rate}</span>
                      <span className="text-xs text-slate-400">bpm</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Daily Steps</span>
                    <p className="text-xl font-bold mt-1 flex items-baseline space-x-1">
                      <span className="text-emerald-500">{wearableData.steps.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">steps</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Calories</span>
                    <p className="text-xl font-bold mt-1 flex items-baseline space-x-1">
                      <span className="text-amber-500">{wearableData.calories_burned}</span>
                      <span className="text-xs text-slate-400">kcal</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/30 rounded-xl">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">SpO2 level</span>
                    <p className="text-xl font-bold mt-1 flex items-baseline space-x-1">
                      <span className="text-cyan-500">{wearableData.blood_oxygen_level}%</span>
                    </p>
                  </div>
                </div>

                <div className="h-28 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FitbitChartData}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}/>
                      <Tooltip />
                      <Area type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Risk prediction distribution & history overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Diagnostic Risk Breakdown */}
              <div className="glass-panel p-6">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Diagnostics Radar Breakdown</h3>
                <div className="h-60 flex items-center justify-center">
                  {predictionHistory.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 p-8">
                      No clinical logs submitted yet. Vitals submitted on the <strong>Tabular Predictions</strong> panel will sync active values here.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                        { subject: 'Cardiovascular', A: predictionHistory.find(p => p.type === 'HEART')?.score || 20 },
                        { subject: 'Metabolic', A: predictionHistory.find(p => p.type === 'DIABETES')?.score || 15 },
                        { subject: 'Renal', A: predictionHistory.find(p => p.type === 'CKD')?.score || 25 },
                        { subject: 'Hepatic', A: predictionHistory.find(p => p.type === 'LIVER')?.score || 18 }
                      ]}>
                        <PolarGrid stroke="#475569" strokeOpacity={0.2} />
                        <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10}/>
                        <PolarRadiusAxis stroke="#64748b" angle={30} domain={[0, 100]} fontSize={8} />
                        <Radar name="Diagnostic Risk" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* History logs */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Recent Vitals Evaluations</h3>
                  <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                    {predictionHistory.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-8">
                        Empty register list. Perform diagnostics to populate history.
                      </div>
                    ) : (
                      predictionHistory.map((item, index) => (
                        <div key={index} className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{item.type} Diagnosis</span>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Confidence probability: {Math.round(item.probability * 100)}%</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${item.level === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : item.level === 'MODERATE' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {item.level} RISK
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('predictions')}
                  className="w-full py-2.5 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 rounded-xl text-xs font-semibold transition-colors mt-4 text-center block"
                >
                  Initiate New Evaluation
                </button>
              </div>

            </div>
          </div>
        )}

        {/* --- TABULAR DIAGNOSTICS TAB --- */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="flex space-x-3 p-1 glass-panel bg-slate-200/30 dark:bg-slate-900/40 w-fit">
              {(['heart', 'diabetes', 'ckd', 'liver'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedDisease(type);
                    setLastPredictionResult(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${selectedDisease === type ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  {type} Disease
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Input Elements */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-sm font-bold tracking-tight flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>Clinical Metrics Input Form</span>
                </h3>

                {selectedDisease === 'heart' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                      <input 
                        type="number" 
                        value={tabularInputs.age} 
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Sex</label>
                      <select 
                        value={tabularInputs.sex} 
                        onChange={(e) => handleInputChange('sex', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm dark:bg-slate-950 focus:outline-none"
                      >
                        <option value={1}>Male</option>
                        <option value={0}>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Chest Pain Type (0-3)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.cp} 
                        onChange={(e) => handleInputChange('cp', parseInt(e.target.value))}
                        min={0} max={3}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Resting BP (mmHg)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.trestbps} 
                        onChange={(e) => handleInputChange('trestbps', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cholesterol (mg/dL)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.chol} 
                        onChange={(e) => handleInputChange('chol', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Max Heart Rate (thalach)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.thalach} 
                        onChange={(e) => handleInputChange('thalach', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedDisease === 'diabetes' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Glucose Level (mg/dL)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.glucose} 
                        onChange={(e) => handleInputChange('glucose', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Diastolic BP (mmHg)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.blood_pressure} 
                        onChange={(e) => handleInputChange('blood_pressure', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Body Mass Index (BMI)</label>
                      <input 
                        type="number" step="0.1"
                        value={tabularInputs.bmi} 
                        onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Insulin (mu U/ml)</label>
                      <input 
                        type="number" 
                        value={tabularInputs.insulin} 
                        onChange={(e) => handleInputChange('insulin', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/40 text-sm"
                      />
                    </div>
                  </div>
                )}

                {(selectedDisease === 'ckd' || selectedDisease === 'liver') && (
                  <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/40 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard metrics are filled in automatically for this diagnostic session. Press run below to retrieve exact risk values.
                    </p>
                  </div>
                )}

                <button
                  onClick={executeTabularPrediction}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Execute Diagnostic Algorithm</span>
                </button>
              </div>

              {/* Prediction result & interactive SHAP chart */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-cyan-500" />
                    <span>Explainable AI (XAI) Output</span>
                  </h3>

                  {!lastPredictionResult ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/20 dark:border-slate-800/30 rounded-2xl">
                      <Shield className="w-8 h-8 text-slate-400 mb-2 animate-bounce" />
                      <p className="text-xs text-slate-400">Fill in patient parameters on the left and start the classifier model.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prediction Confidence</span>
                          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">{lastPredictionResult.score}%</p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${lastPredictionResult.level === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : lastPredictionResult.level === 'MODERATE' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {lastPredictionResult.level} RISK CATEGORY
                        </span>
                      </div>

                      {/* Interactive SHAP feature contributions */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Feature Impact (SHAP Value)</h4>
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {lastPredictionResult.shap.map((feat: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-600 dark:text-slate-300">{feat.feature}</span>
                                <span className={feat.positive ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                                  {feat.positive ? '+' : ''}{feat.impact.toFixed(2)}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200/50 dark:bg-slate-800/40 h-1.5 rounded-full overflow-hidden flex">
                                {feat.positive ? (
                                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.abs(feat.impact) * 20)}%` }}></div>
                                ) : (
                                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.abs(feat.impact) * 20)}%` }}></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- COMPUTER VISION CNN TAB --- */}
        {activeTab === 'cnn' && (
          <div className="space-y-6">
            <div className="flex space-x-3 p-1 glass-panel bg-slate-200/30 dark:bg-slate-900/40 w-fit">
              <button
                onClick={() => { setCnnScanType('pneumonia'); setScanResult(null); setUploadedScanFile(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize ${cnnScanType === 'pneumonia' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' : 'text-slate-500'}`}
              >
                Chest X-Ray Pneumonia
              </button>
              <button
                onClick={() => { setCnnScanType('brain_tumor'); setScanResult(null); setUploadedScanFile(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize ${cnnScanType === 'brain_tumor' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' : 'text-slate-500'}`}
              >
                Brain MRI Tumor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Upload Drag & Drop */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-cyan-500" />
                    <span>Upload Medical Imaging File</span>
                  </h3>

                  <div className="border-2 border-dashed border-slate-200/20 dark:border-slate-800/40 rounded-2xl p-8 text-center hover:bg-slate-100/10 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      onChange={handleCnnFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Drag & drop scan image here or click to browse</p>
                    <span className="text-[10px] text-slate-500 block mt-1">Supports PNG, JPEG up to 10MB</span>
                  </div>

                  {scanPreviewUrl && (
                    <div className="mt-6 relative rounded-2xl overflow-hidden border border-slate-200/20 dark:border-slate-800/40 max-h-52 flex justify-center bg-slate-950">
                      <img src={scanPreviewUrl} alt="Scan preview" className="object-contain max-h-52" />
                      
                      {/* Grad-CAM Focus Heatmap Simulation overlay if completed */}
                      {scanResult && (
                        <div 
                          className="absolute border-4 border-red-500/80 bg-red-500/25 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                          style={{
                            left: `${scanResult.coordinates.x}px`,
                            top: `${scanResult.coordinates.y}px`,
                            width: `${scanResult.coordinates.radius}px`,
                            height: `${scanResult.coordinates.radius}px`,
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={triggerCnnScan}
                  disabled={!uploadedScanFile || isScanning}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all mt-6 flex items-center justify-center space-x-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isScanning ? 'Processing Deep Convolution Convolutions...' : 'Execute CNN Segmentation'}</span>
                </button>
              </div>

              {/* CNN Result Output */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-cyan-500" />
                    <span>Neural Network Analytics</span>
                  </h3>

                  {isScanning ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-10 h-10 border-4 border-t-cyan-500 border-cyan-500/20 rounded-full animate-spin mb-4" />
                      <p className="text-xs text-slate-400">Running ResNet50/EfficientNetB0 feature extraction pipelines...</p>
                    </div>
                  ) : !scanResult ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/20 dark:border-slate-800/30 rounded-2xl">
                      <Shield className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-400">Awaiting scanning activation. Place image to retrieve grad-cam heatmaps.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Classification Index</span>
                          <p className="text-lg font-bold">{scanResult.type}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${scanResult.level === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {scanResult.level}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/15 dark:border-slate-800/30 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grad-CAM Overlay Rationale</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{scanResult.explanation}</p>
                      </div>

                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400">
                        <span>Anomalous density match margin:</span>
                        <strong className="text-sm font-bold">{scanResult.score}%</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- MEDICAL REPORTS TAB --- */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Report Uploader */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-cyan-500" />
                  <span>Clinical Report Upload Portal</span>
                </h3>

                <div className="border-2 border-dashed border-slate-200/20 dark:border-slate-800/40 rounded-2xl p-8 text-center hover:bg-slate-100/10 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={handleReportUpload}
                    accept=".pdf,.doc,.txt,image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">{uploadedReportFile ? uploadedReportFile.name : "Drag & drop PDF / Lab report here"}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Accepts diagnostic formats</span>
                </div>
              </div>

              {/* Parsed Result Display */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-cyan-500" />
                  <span>Optical Character Recognition (OCR) Output</span>
                </h3>

                {!parsedReportResult ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/20 dark:border-slate-800/30 rounded-2xl">
                    <Shield className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs text-slate-400">Place clinical PDFs or documents to perform text mining segmentations.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/15 dark:border-slate-800/40">
                      <strong>AI Summary:</strong> {parsedReportResult.summary}
                    </p>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Detected Anomalies</h4>
                      <div className="space-y-2">
                        {parsedReportResult.anomalies.map((anom: string, idx: number) => (
                          <div key={idx} className="p-2 bg-rose-500/10 text-rose-500 text-xs rounded-lg flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{anom}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* List of uploaded vaults */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold tracking-tight mb-4">Historical Vault Directory</h3>
              <div className="space-y-3">
                {reportsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No documents stored in vault yet.</p>
                ) : (
                  reportsList.map((rep) => (
                    <div key={rep.id} className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 rounded-xl flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-xs font-semibold">{rep.filename}</p>
                          <span className="text-[10px] text-slate-400">{rep.date}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">OCR Processed</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- CHAT BOT TAB --- */}
        {activeTab === 'chat' && (
          <div className="glass-panel p-6 flex flex-col justify-between h-[calc(100vh-10rem)]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/20 dark:border-slate-800/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Clinical Assistant Chatbot</h3>
                  <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Streaming Engine Online</span>
                </div>
              </div>

              {/* Microphone speech trigger */}
              <button 
                onClick={handleMicTrigger}
                disabled={isWhisperActive}
                className={`p-2.5 rounded-xl flex items-center justify-center border transition-all ${isWhisperActive ? 'bg-rose-500/25 border-rose-500/50 text-rose-500 animate-pulse' : 'bg-slate-100/55 dark:bg-slate-900/55 border-slate-200/20 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-cyan-500/40 hover:text-cyan-500'}`}
              >
                {isWhisperActive ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/15 dark:border-slate-800/40 rounded-tl-none'}`}>
                    <p>{msg.text}</p>
                    <span className={`text-[8px] block mt-1 text-right ${msg.sender === 'user' ? 'text-cyan-100' : 'text-slate-400'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vitals Text Input */}
            <div className="flex space-x-3 pt-2">
              <input 
                type="text"
                value={currentMessageInput}
                onChange={(e) => setCurrentMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isWhisperActive ? "Listening to clinical symptoms..." : "Describe symptoms or vitals measurements..."}
                disabled={isWhisperActive}
                className="flex-1 px-4 py-3 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/20 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isWhisperActive}
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Send Message
              </button>
            </div>
          </div>
        )}

        {/* --- DOCTOR NETWORK TAB --- */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Doctor Recommender */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold tracking-tight mb-4">Smart Specialist Recommendations</h3>
                <div className="flex space-x-3 mb-4">
                  <input 
                    type="text"
                    value={symptomSearchText}
                    onChange={(e) => setSymptomSearchText(e.target.value)}
                    placeholder="Enter diagnostic symptoms (e.g. chest pressure, elevated glucose)..."
                    className="flex-1 px-3 py-2 border border-slate-200/20 dark:border-slate-800/40 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 text-xs focus:outline-none"
                  />
                  <button 
                    onClick={handleDoctorSearch}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white font-semibold rounded-xl text-xs"
                  >
                    Recommend Match
                  </button>
                </div>

                <div className="space-y-3">
                  {specialistRecommendations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Awaiting symptoms query inputs.</p>
                  ) : (
                    specialistRecommendations.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/20 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold">{doc.name}</p>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">{doc.spec}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedDoctor(doc)}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Book Appointment
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Consultation Scheduling Form */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight mb-4">Schedule Vitals Consultation</h3>
                  
                  {!selectedDoctor ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/20 dark:border-slate-800/30 rounded-2xl">
                      <Calendar className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-400">Select an online doctor from recommendations to start scheduling.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Practitioner Selected:</p>
                          <p className="text-sm font-extrabold text-slate-700 dark:text-white mt-0.5">{selectedDoctor.name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-500/10 px-2 py-1 rounded">
                          {selectedDoctor.spec}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reason for consultation</label>
                        <input 
                          type="text" 
                          value={appointmentReason}
                          onChange={(e) => setAppointmentReason(e.target.value)}
                          placeholder="e.g. Discuss elevated blood glucose values..." 
                          className="w-full px-3 py-2 border border-slate-200/20 dark:border-slate-800/40 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {selectedDoctor && (
                  <button 
                    onClick={handleBookAppointment}
                    disabled={!appointmentReason}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all mt-4"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </div>

            {/* Scheduled appointments */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold tracking-tight mb-4">Confirmed Schedules</h3>
              <div className="space-y-3">
                {appointmentsList.map((appt) => (
                  <div key={appt.id} className="p-3.5 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 rounded-xl flex justify-between items-center">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">{appt.doctor_name}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{appt.appointment_time}</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">"{appt.reason}"</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ADMIN ANALYTICS TAB --- */}
        {activeTab === 'admin' && currentUser?.role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Diagnostic Inferences</span>
                <p className="text-3xl font-extrabold mt-1 text-cyan-500">1,842</p>
              </div>

              <div className="glass-panel p-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Clinical Risk Index</span>
                <p className="text-3xl font-extrabold mt-1 text-amber-500">34.6%</p>
              </div>

              <div className="glass-panel p-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Practitioner Network</span>
                <p className="text-3xl font-extrabold mt-1 text-indigo-500">124</p>
              </div>
            </div>

            {/* Analytics prediction distribution */}
            <div className="glass-panel p-6">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">Risk Evaluation Frequency (Tabular vs. CNN)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Heart Disease', value: 842 },
                    { name: 'Diabetes', value: 654 },
                    { name: 'Kidney (CKD)', value: 184 },
                    { name: 'Chest Pneumonia', value: 120 },
                    { name: 'Brain Tumor', value: 42 }
                  ]}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}/>
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                      <Cell fill="#0ea5e9" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#6366f1" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#ec4899" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
