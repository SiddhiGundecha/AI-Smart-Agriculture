/* ==========================================================
   SMART PLANT HEALTH ASSISTANT — SCRIPT
   Connects to an existing FastAPI backend at
   http://127.0.0.1:8000/predict
   ========================================================== */

(function () {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================

  const API_URL = "http://127.0.0.1:8000/predict";
  const ASSISTANT_API_URL = "http://127.0.0.1:8000/assistant";
  const TRANSLATE_API_URL = "http://127.0.0.1:8000/translate";
const GEOCODE_API_URL =
  "http://127.0.0.1:8000/geocode";

const WEATHER_RISK_API_URL =
  "http://127.0.0.1:8000/weather-risk";
const DECISION_PLAN_API_URL = "http://127.0.0.1:8000/decision-plan";
const SIMILAR_CASES_API_URL = "http://127.0.0.1:8000/similar-cases";
  const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const HISTORY_KEY = "plantHealthScanHistory";
  const HISTORY_LIMIT = 20;

  const RING_CIRCUMFERENCE = 2 * Math.PI * 30;




.
  const translations = {
    en: {
      brand_name: "AI Smart Agriculture", home: "Home", diagnose: "Diagnose", crop_health: "Crop Health", environment: "Environment", assistant: "Assistant", history: "History",
      hero_eyebrow: "Leaf-level diagnostics, powered by a trained vision model", hero_title: "Detect. Understand. Protect.",
      hero_sub: "Upload a plant leaf image and the model identifies possible diseases, shows exactly where it looked to make that call, and hands you practical, disease-specific care guidance.",
      analyze_plant: "Analyze a plant", talk_assistant: "Talk to the assistant", hero_value: "From leaf analysis to environmental context and practical care — key plant-health insights, together in one place.",
      diagnose_leaf: "Diagnose a leaf", diagnose_help: "Upload a clear photo of a single leaf. Good lighting and a leaf that fills most of the frame gives the model the best chance of a confident read.",
      drop_image: "Drag and drop a leaf image", browse_image: "or click to browse · JPG, PNG, WEBP", change_image: "Choose a different image", image_quality: "Image quality", analyze_leaf: "Analyze Leaf", analyzing: "Analyzing your plant…",
      analysis_overview: "Analysis overview", overview_help: "Diagnosis, model attention, and practical care — presented together before the supporting analysis.", crop: "Crop", diagnosis: "Diagnosis", confidence: "confidence", diagnosis_confidence: "Diagnosis confidence", top_gap: "Top-1 vs Top-2",
      explainable_ai: "Explainable AI", where_model_looked: "Where the model looked", original: "Original", gradcam: "Grad-CAM", gradcam_note: "Highlights the leaf regions that contributed most to the model's prediction.", guidance: "Guidance", care_prevention: "Care & prevention", recommended_actions: "Recommended actions", about_condition: "About this condition", symptoms: "Symptoms", prevention: "Prevention",
      prediction_comparison: "Prediction comparison", comparison_help: "Compare the model's leading predictions when more than one possibility is relevant.", model_comparison: "Model comparison", top_predictions: "Top predictions",
      environmental_context: "Environmental context", environmental_risk: "Environmental risk", weather_help: "Check current weather conditions and see whether they are environmentally favorable for the detected condition.", detected_condition: "Detected condition", analyze_first: "Analyze a leaf first", weather_placeholder: "City or location, e.g. Pune", check_risk: "Check risk", use_location: "Use my location", location: "Location", temperature: "Temperature", humidity: "Humidity", rain: "Rain", current: "Current", next_24: "Next 24 hours", next_7: "Next 7 days", why_risk: "Why this risk level?", risk_drivers: "Risk drivers", weather_disclaimer: "This is an environmental risk advisory based on weather conditions. It does not predict that the disease will develop and does not replace field inspection or expert advice.", weather_data: "Weather data:",
      crop_health_hub: "Crop health hub", crop_hub_help: "Browse the supported crops and the diseases or healthy conditions the vision model can identify for each.", select_crop: "Select a crop", crop_help: "Browse the conditions covered by the vision model for that crop. This section is a model-coverage reference, not a separate diagnosis.", choose_crop: "Choose a crop", bell_pepper: "Bell Pepper", crop_overview: "Crop overview",
      ai_assistance: "AI assistance", smart_assistant: "Smart AI Assistant", assistant_help: "Ask questions about your plant and the detected condition.", ask_question_label: "Ask a question about your plant", ask_placeholder: "Ask about your plant...", send: "Send",
      scan_history: "Scan history", history_help: "Your most recent scans, stored locally on this device.", show_all: "Show all", clear_history: "Clear history", no_scans: "No scans yet. Analyzed leaves will appear here.", footer_text: "AI Smart Agriculture — Plant Health Assistant",
      decision_support: "Decision support", action_plan: "Priority action plan", decision_support_desc: "Turn the model result and environmental context into a practical sequence of next steps.", action_priority: "Action priority", immediate_actions: "Immediate", monitoring_actions: "Monitor", verification: "Verification", case_retrieval: "Case retrieval", similar_cases: "Similar leaf cases", similar_cases_desc: "Retrieve visually similar cases from the indexed reference dataset to support comparison with the current prediction.", similar_cases_waiting: "Analyze a leaf to retrieve similar cases.", similar_cases_unavailable: "Similar-case retrieval is not available yet. Build the reference index first.", similar_cases_none: "No similar reference cases were found.", similar_cases_found: "similar reference cases", similar_percent: "similar", same_condition: "Same predicted condition", alternative_case: "Alternative reference case", high_confidence: "High confidence", moderate_confidence: "Moderate confidence", low_confidence: "Low confidence", healthy_condition: "Healthy condition", possible_disease: "Possible disease", no_weather_drivers: "No major weather risk drivers identified.",
      checking_weather: "Checking local weather conditions...", weather_unable: "Unable to calculate weather risk.", weather_failed: "Could not retrieve weather risk. Please try again.", enter_location: "Enter a city or location first.", finding_location: "Finding location...", location_search_failed: "Location search failed.", location_not_found: "Location not found.", weather_completed: "Weather-based environmental risk assessment completed.", weather_calculated: "Weather risk assessment updated.",
      analyzing_leaf: "Analyzing leaf image...", server_process_error: "The server could not process the image.", prediction_server_unreachable: "Could not connect to the plant disease prediction server.", assistant_first: "Please analyze a plant image first. I need the current model prediction before I can answer questions about that plant.", thinking: "Thinking…", comparison_empty: "Analyze a plant image first to compare the model\'s top-3 predictions.", crop_empty: "Select a crop to explore its supported conditions."
    },
    hi: {
      brand_name: "AI स्मार्ट एग्रीकल्चर", home: "होम", diagnose: "जांच", crop_health: "फसल स्वास्थ्य", environment: "पर्यावरण", assistant: "सहायक", history: "इतिहास",
      hero_eyebrow: "पत्ती के स्तर पर पौधे की जांच, प्रशिक्षित विज़न मॉडल द्वारा", hero_title: "पहचानें। समझें। बचाएं।",
      hero_sub: "पौधे की पत्ती की तस्वीर अपलोड करें। मॉडल संभावित रोगों की पहचान करता है, बताता है कि उसने पत्ती के किस हिस्से पर ध्यान दिया और रोग के अनुसार देखभाल की सलाह देता है।",
      analyze_plant: "पौधे की जांच करें", talk_assistant: "सहायक से पूछें", hero_value: "पत्ती की जांच से लेकर मौसम की स्थिति और व्यावहारिक देखभाल तक — पौधे के स्वास्थ्य की जरूरी जानकारी एक ही जगह।",
      diagnose_leaf: "पत्ती की जांच करें", diagnose_help: "एक साफ पत्ती की तस्वीर अपलोड करें। अच्छी रोशनी और फ्रेम में पत्ती का बड़ा हिस्सा होने से बेहतर परिणाम मिलते हैं।",
      drop_image: "पत्ती की तस्वीर यहाँ खींचकर छोड़ें", browse_image: "या ब्राउज़ करने के लिए क्लिक करें · JPG, PNG, WEBP", change_image: "दूसरी तस्वीर चुनें", image_quality: "तस्वीर की गुणवत्ता", analyze_leaf: "पत्ती की जांच करें", analyzing: "पौधे की जांच हो रही है…",
      analysis_overview: "विश्लेषण का सार", overview_help: "निदान, मॉडल का ध्यान और देखभाल की सलाह — आगे की विस्तृत जानकारी से पहले एक साथ।", crop: "फसल", diagnosis: "निदान", confidence: "विश्वास", diagnosis_confidence: "निदान का विश्वास स्तर", top_gap: "पहले और दूसरे परिणाम का अंतर",
      explainable_ai: "AI विश्लेषण", where_model_looked: "मॉडल ने कहाँ ध्यान दिया", original: "मूल तस्वीर", gradcam: "Grad-CAM", gradcam_note: "यह पत्ती के उन हिस्सों को दिखाता है जिन पर मॉडल ने अपने परिणाम के लिए सबसे अधिक ध्यान दिया।", guidance: "मार्गदर्शन", care_prevention: "देखभाल और बचाव", recommended_actions: "सुझाए गए उपाय", about_condition: "इस स्थिति के बारे में", symptoms: "लक्षण", prevention: "बचाव",
      prediction_comparison: "संभावित परिणामों की तुलना", comparison_help: "जब एक से अधिक संभावनाएँ हों, तब मॉडल के प्रमुख परिणामों की तुलना करें।", model_comparison: "मॉडल तुलना", top_predictions: "प्रमुख परिणाम",
      environmental_context: "पर्यावरणीय संदर्भ", environmental_risk: "पर्यावरणीय जोखिम", weather_help: "मौजूदा मौसम की स्थिति देखें और जानें कि वे पहचानी गई स्थिति के लिए कितनी अनुकूल हैं।", detected_condition: "पहचानी गई स्थिति", analyze_first: "पहले पत्ती की जांच करें", weather_placeholder: "शहर या स्थान, जैसे पुणे", check_risk: "जोखिम जांचें", use_location: "मेरी लोकेशन इस्तेमाल करें", location: "स्थान", temperature: "तापमान", humidity: "नमी", rain: "बारिश", current: "अभी", next_24: "अगले 24 घंटे", next_7: "अगले 7 दिन", why_risk: "यह जोखिम स्तर क्यों?", risk_drivers: "जोखिम के कारण", weather_disclaimer: "यह मौसम की स्थिति पर आधारित पर्यावरणीय जोखिम सलाह है। यह यह नहीं बताती कि रोग निश्चित रूप से विकसित होगा और खेत की जांच या विशेषज्ञ सलाह का विकल्प नहीं है।", weather_data: "मौसम का डेटा:",
      crop_health_hub: "फसल स्वास्थ्य केंद्र", crop_hub_help: "उन फसलों और स्वस्थ या रोगग्रस्त स्थितियों को देखें जिन्हें विज़न मॉडल पहचान सकता है।", select_crop: "फसल चुनें", crop_help: "इस फसल के लिए मॉडल द्वारा कवर की गई स्थितियाँ देखें। यह मॉडल की कवरेज जानकारी है, अलग निदान नहीं।", choose_crop: "फसल चुनें", bell_pepper: "शिमला मिर्च", crop_overview: "फसल का अवलोकन",
      ai_assistance: "AI सहायता", smart_assistant: "स्मार्ट AI सहायक", assistant_help: "अपने पौधे और पहचानी गई स्थिति के बारे में सवाल पूछें।", ask_question_label: "अपने पौधे के बारे में सवाल पूछें", ask_placeholder: "अपने पौधे के बारे में पूछें...", send: "भेजें",
      scan_history: "जांच इतिहास", history_help: "इस डिवाइस पर सेव की गई आपकी हाल की जांच।", show_all: "सभी देखें", clear_history: "इतिहास साफ करें", no_scans: "अभी कोई जांच नहीं है। विश्लेषित पत्तियाँ यहाँ दिखाई देंगी।", footer_text: "AI स्मार्ट एग्रीकल्चर — पौधों के स्वास्थ्य का सहायक",
      decision_support: "निर्णय सहायता", action_plan: "प्राथमिकता कार्य योजना", decision_support_desc: "मॉडल के परिणाम और पर्यावरणीय स्थिति को अगले व्यावहारिक कदमों में बदलें।", action_priority: "कार्रवाई की प्राथमिकता", immediate_actions: "तुरंत", monitoring_actions: "निगरानी", verification: "सत्यापन", case_retrieval: "मामला तुलना", similar_cases: "मिलते-जुलते पत्ती मामले", similar_cases_desc: "वर्तमान परिणाम की तुलना के लिए संदर्भ डेटासेट से दिखने में मिलते-जुलते पत्ती के मामले देखें।", similar_cases_waiting: "मिलते-जुलते मामले देखने के लिए पहले पत्ती की जांच करें।", similar_cases_unavailable: "मिलते-जुलते मामलों की सुविधा अभी उपलब्ध नहीं है। पहले संदर्भ इंडेक्स बनाएं।", similar_cases_none: "कोई मिलते-जुलते संदर्भ मामले नहीं मिले।", similar_cases_found: "मिलते-जुलते संदर्भ मामले", similar_percent: "मिलान", same_condition: "वही अनुमानित स्थिति", alternative_case: "वैकल्पिक संदर्भ मामला", high_confidence: "उच्च विश्वास", moderate_confidence: "मध्यम विश्वास", low_confidence: "कम विश्वास", healthy_condition: "स्वस्थ स्थिति", possible_disease: "संभावित रोग", no_weather_drivers: "मौसम से जुड़े कोई प्रमुख जोखिम कारण नहीं मिले।",
      checking_weather: "स्थानीय मौसम की स्थिति जांची जा रही है...", weather_unable: "मौसम जोखिम की गणना नहीं हो सकी।", weather_failed: "मौसम जोखिम प्राप्त नहीं हो सका। कृपया फिर कोशिश करें।", enter_location: "पहले शहर या स्थान दर्ज करें।", finding_location: "स्थान खोजा जा रहा है...", location_search_failed: "स्थान खोज असफल रही।", location_not_found: "स्थान नहीं मिला।", weather_completed: "मौसम आधारित पर्यावरणीय जोखिम का आकलन पूरा हुआ।", weather_calculated: "मौसम जोखिम का आकलन अपडेट हो गया।",
      analyzing_leaf: "पत्ती की तस्वीर का विश्लेषण हो रहा है...", server_process_error: "सर्वर तस्वीर को प्रोसेस नहीं कर सका।", prediction_server_unreachable: "पौधे के रोग पहचान सर्वर से कनेक्ट नहीं हो सका।", assistant_first: "पहले पौधे की तस्वीर का विश्लेषण करें। इसके बाद मैं उस पौधे की स्थिति के बारे में जवाब दे सकता हूँ।", thinking: "सोचा जा रहा है…", comparison_empty: "मॉडल के शीर्ष 3 परिणामों की तुलना करने के लिए पहले पौधे की तस्वीर का विश्लेषण करें।", crop_empty: "समर्थित स्थितियाँ देखने के लिए एक फसल चुनें."
    },
    mr: {
      brand_name: "AI स्मार्ट अॅग्रीकल्चर", home: "मुख्यपृष्ठ", diagnose: "तपासणी", crop_health: "पिकाचे आरोग्य", environment: "पर्यावरण", assistant: "सहाय्यक", history: "इतिहास",
      hero_eyebrow: "प्रशिक्षित व्हिजन मॉडेलद्वारे पानाच्या पातळीवर तपासणी", hero_title: "ओळखा. समजा. जपा.",
      hero_sub: "पिकाच्या पानाचा फोटो अपलोड करा. मॉडेल संभाव्य रोग ओळखते, त्याने पानाच्या कोणत्या भागाकडे लक्ष दिले ते दाखवते आणि रोगानुसार काळजीचे मार्गदर्शन देते.",
      analyze_plant: "पिकाची तपासणी करा", talk_assistant: "सहाय्यकाशी विचारा", hero_value: "पानाच्या तपासणीपासून हवामानाच्या संदर्भापर्यंत आणि व्यावहारिक काळजीपर्यंत — पिकाच्या आरोग्याची महत्त्वाची माहिती एकाच ठिकाणी.",
      diagnose_leaf: "पानाची तपासणी करा", diagnose_help: "एका स्वच्छ पानाचा फोटो अपलोड करा. चांगला प्रकाश आणि फ्रेममध्ये पानाचा मोठा भाग असल्यास चांगला परिणाम मिळतो.",
      drop_image: "पानाचा फोटो येथे ड्रॅग आणि ड्रॉप करा", browse_image: "किंवा ब्राउझ करण्यासाठी क्लिक करा · JPG, PNG, WEBP", change_image: "दुसरा फोटो निवडा", image_quality: "फोटोची गुणवत्ता", analyze_leaf: "पानाची तपासणी करा", analyzing: "पिकाची तपासणी होत आहे…",
      analysis_overview: "विश्लेषणाचा आढावा", overview_help: "निदान, मॉडेलचे लक्ष आणि काळजीचे मार्गदर्शन — सविस्तर विश्लेषणापूर्वी एकत्र दाखवले आहे.", crop: "पीक", diagnosis: "निदान", confidence: "विश्वास", diagnosis_confidence: "निदानावरील विश्वास", top_gap: "पहिल्या आणि दुसऱ्या निकालातील फरक",
      explainable_ai: "AI विश्लेषण", where_model_looked: "मॉडेलने कुठे लक्ष दिले", original: "मूळ फोटो", gradcam: "Grad-CAM", gradcam_note: "मॉडेलच्या निकालासाठी पानाच्या कोणत्या भागांवर जास्त लक्ष दिले गेले ते दाखवते.", guidance: "मार्गदर्शन", care_prevention: "काळजी आणि प्रतिबंध", recommended_actions: "शिफारस केलेले उपाय", about_condition: "या स्थितीबद्दल", symptoms: "लक्षणे", prevention: "प्रतिबंध",
      prediction_comparison: "संभाव्य निकालांची तुलना", comparison_help: "एकापेक्षा जास्त शक्यता असल्यास मॉडेलच्या प्रमुख निकालांची तुलना करा.", model_comparison: "मॉडेल तुलना", top_predictions: "प्रमुख निकाल",
      environmental_context: "पर्यावरणीय संदर्भ", environmental_risk: "पर्यावरणीय धोका", weather_help: "सध्याचे हवामान तपासा आणि ते ओळखलेल्या स्थितीसाठी किती अनुकूल आहे ते पहा.", detected_condition: "ओळखलेली स्थिती", analyze_first: "प्रथम पानाची तपासणी करा", weather_placeholder: "शहर किंवा ठिकाण, उदा. पुणे", check_risk: "धोका तपासा", use_location: "माझे स्थान वापरा", location: "स्थान", temperature: "तापमान", humidity: "आर्द्रता", rain: "पाऊस", current: "सध्या", next_24: "पुढील 24 तास", next_7: "पुढील 7 दिवस", why_risk: "हा धोका का?", risk_drivers: "धोक्याचे कारण", weather_disclaimer: "हा हवामानाच्या परिस्थितीवर आधारित पर्यावरणीय धोका सल्ला आहे. रोग निश्चितपणे होईल असे तो सांगत नाही आणि शेतातील तपासणी किंवा तज्ज्ञांच्या सल्ल्याचा पर्याय नाही.", weather_data: "हवामान डेटा:",
      crop_health_hub: "पिक आरोग्य केंद्र", crop_hub_help: "व्हिजन मॉडेल कोणती पिके आणि त्यांच्याशी संबंधित निरोगी किंवा रोगग्रस्त स्थिती ओळखू शकते ते पहा.", select_crop: "पीक निवडा", crop_help: "या पिकासाठी मॉडेलमध्ये समाविष्ट असलेल्या स्थिती पहा. हा मॉडेल कव्हरेज संदर्भ आहे, स्वतंत्र निदान नाही.", choose_crop: "पीक निवडा", bell_pepper: "ढोबळी मिरची", crop_overview: "पिकाचा आढावा",
      ai_assistance: "AI सहाय्य", smart_assistant: "स्मार्ट AI सहाय्यक", assistant_help: "तुमच्या पिकाबद्दल आणि ओळखलेल्या स्थितीबद्दल प्रश्न विचारा.", ask_question_label: "तुमच्या पिकाबद्दल प्रश्न विचारा", ask_placeholder: "तुमच्या पिकाबद्दल विचारा...", send: "पाठवा",
      scan_history: "तपासणी इतिहास", history_help: "या डिव्हाइसवर जतन केलेल्या तुमच्या अलीकडील तपासण्या.", show_all: "सर्व पहा", clear_history: "इतिहास साफ करा", no_scans: "अजून तपासण्या नाहीत. विश्लेषित पाने येथे दिसतील.", footer_text: "AI स्मार्ट अॅग्रीकल्चर — पिकाच्या आरोग्याचा सहाय्यक",
      decision_support: "निर्णय सहाय्य", action_plan: "प्राधान्य कृती योजना", decision_support_desc: "मॉडेलचा निकाल आणि पर्यावरणीय परिस्थिती पुढील व्यावहारिक पायऱ्यांमध्ये बदला.", action_priority: "कृतीचे प्राधान्य", immediate_actions: "तात्काळ", monitoring_actions: "निरीक्षण", verification: "पडताळणी", case_retrieval: "प्रकरण तुलना", similar_cases: "समान पानांची प्रकरणे", similar_cases_desc: "सध्याच्या निकालाशी तुलना करण्यासाठी संदर्भ डेटासेटमधील दिसायला समान पानांची प्रकरणे मिळवा.", similar_cases_waiting: "समान प्रकरणे पाहण्यासाठी प्रथम पानाची तपासणी करा.", similar_cases_unavailable: "समान प्रकरणांची सुविधा अद्याप उपलब्ध नाही. प्रथम संदर्भ इंडेक्स तयार करा.", similar_cases_none: "समान संदर्भ प्रकरणे सापडली नाहीत.", similar_cases_found: "समान संदर्भ प्रकरणे", similar_percent: "साम्य", same_condition: "समान अंदाजित स्थिती", alternative_case: "पर्यायी संदर्भ प्रकरण", high_confidence: "उच्च विश्वास", moderate_confidence: "मध्यम विश्वास", low_confidence: "कमी विश्वास", healthy_condition: "निरोगी स्थिती", possible_disease: "संभाव्य रोग", no_weather_drivers: "हवामानाशी संबंधित प्रमुख धोका कारणे आढळली नाहीत.",
      checking_weather: "स्थानिक हवामान तपासले जात आहे...", weather_unable: "हवामान धोक्याची गणना करता आली नाही.", weather_failed: "हवामान धोका मिळवता आला नाही. पुन्हा प्रयत्न करा.", enter_location: "प्रथम शहर किंवा ठिकाण भरा.", finding_location: "स्थान शोधले जात आहे...", location_search_failed: "स्थान शोध अयशस्वी झाला.", location_not_found: "स्थान सापडले नाही.", weather_completed: "हवामानावर आधारित पर्यावरणीय धोका मूल्यांकन पूर्ण झाले.", weather_calculated: "हवामान धोका मूल्यांकन अपडेट झाले.",
      analyzing_leaf: "पानाच्या फोटोचे विश्लेषण होत आहे...", server_process_error: "सर्व्हर फोटो प्रक्रिया करू शकला नाही.", prediction_server_unreachable: "पिकाच्या रोग ओळख सर्व्हरशी कनेक्ट होता आले नाही.", assistant_first: "प्रथम पिकाच्या पानाच्या फोटोचे विश्लेषण करा. त्यानंतर मी त्या पिकाच्या स्थितीबद्दल उत्तर देऊ शकतो.", thinking: "विचार केला जात आहे…", comparison_empty: "मॉडेलच्या शीर्ष 3 निकालांची तुलना करण्यासाठी प्रथम पिकाच्या फोटोचे विश्लेषण करा.", crop_empty: "समाविष्ट स्थिती पाहण्यासाठी एक पीक निवडा."
    }
  };

  let currentLanguage = localStorage.getItem("aiSmartAgricultureLanguage") || "en";
  let languageRequestToken = 0;

  function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key;
  }

  

  const TRANSLATION_CACHE_KEY =
    "aiSmartAgricultureMyMemoryTranslationsV1";

  let translationCache = {};
  try {
    translationCache = JSON.parse(
      localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}"
    );
  } catch (_) {
    translationCache = {};
  }

  function saveTranslationCache() {
    try {
      localStorage.setItem(
        TRANSLATION_CACHE_KEY,
        JSON.stringify(translationCache)
      );
    } catch (_) {}
  }

  async function translateBatch(texts, language) {
    const sourceTexts = texts.map((text) =>
      text === null || text === undefined ? "" : String(text).trim()
    );

    if (language === "en") {
      return sourceTexts;
    }

    const cache = translationCache[language] || {};
    const missing = [...new Set(
      sourceTexts.filter(
        (text) =>
          text &&
          !Object.prototype.hasOwnProperty.call(cache, text)
      )
    )];

    if (missing.length) {
      const response = await fetch(
        TRANSLATE_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            texts: missing,
            target_language: language
          })
        }
      );

      if (!response.ok) {
        let message = "Translation service unavailable.";

        try {
          const errorData = await response.json();
          message = errorData.detail || message;
        } catch (_) {}

        throw new Error(message);
      }

      const data = await response.json();
      const translated = Array.isArray(data.translations)
        ? data.translations
        : [];

      missing.forEach((source, index) => {
        cache[source] = translated[index] || source;
      });

      translationCache[language] = cache;
      saveTranslationCache();
    }

    
    return sourceTexts.map((text) =>
      text ? cache[text] || text : ""
    );
  }

  function applyLocalLanguageFallback(language) {
    document
      .querySelectorAll("[data-i18n]")
      .forEach((el) => {
        const value =
          (translations[language] &&
            translations[language][el.dataset.i18n]) ||
          translations.en[el.dataset.i18n] ||
          el.textContent;

        if (value) {
          el.textContent = value;
        }
      });

    document
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach((el) => {
        const value =
          (translations[language] &&
            translations[language][el.dataset.i18nPlaceholder]) ||
          translations.en[el.dataset.i18nPlaceholder] ||
          el.getAttribute("placeholder") ||
          "";

        if (value) {
          el.setAttribute("placeholder", value);
        }
      });
  }

  async function applyRemoteLanguage(language) {
    if (language === "en") {
      applyLocalLanguageFallback("en");
      return;
    }

    const elements = Array.from(
      document.querySelectorAll("[data-i18n]")
    );

    const placeholders = Array.from(
      document.querySelectorAll("[data-i18n-placeholder]")
    );

    const sourceTexts = [
      ...elements.map(
        (el) => translations.en[el.dataset.i18n] || ""
      ),
      ...placeholders.map(
        (el) =>
          translations.en[
            el.dataset.i18nPlaceholder
          ] || ""
      )
    ];

    const translatedTexts =
      await translateBatch(
        sourceTexts,
        language
      );

    elements.forEach((el, index) => {
      if (translatedTexts[index]) {
        el.textContent =
          translatedTexts[index];
      }
    });

    placeholders.forEach((el, index) => {
      const translated =
        translatedTexts[
          elements.length + index
        ];

      if (translated) {
        el.setAttribute(
          "placeholder",
          translated
        );
      }
    });

    const title =
      document.getElementById("pageTitle");

    if (title) {
      title.textContent =
        language === "hi"
          ? "AI स्मार्ट एग्रीकल्चर — पौधों के स्वास्थ्य का सहायक"
          : "AI स्मार्ट अॅग्रीकल्चर — पिकाच्या आरोग्याचा सहाय्यक";
    }
  }

  async function applyLanguage(language) {
    if (!translations[language]) {
      language = "en";
    }

    const requestToken = ++languageRequestToken;
    currentLanguage = language;

    document.documentElement.lang = language;
    localStorage.setItem("aiSmartAgricultureLanguage", language);

    // Apply the complete local UI immediately. This keeps the language
    // switch instant and does not wait for any network translation call.
    applyLocalLanguageFallback(language);

    if (languageSelect) {
      languageSelect.value = language;
    }

    // English needs no remote work.
    if (language === "en") {
      if (window.currentWeatherRiskData) {
        translateVisibleWeatherLabels(window.currentWeatherRiskData);
      }
      return;
    }

    // Dynamic content is translated in the background. The user can
    // continue using the page while MyMemory/FastAPI responds.
    const predictionData = window.currentPredictionData;
    const weatherData = window.currentWeatherRiskData;

    if (weatherData) {
      translateVisibleWeatherContent(weatherData, requestToken).catch((error) => {
        console.warn("Dynamic weather translation failed.", error);
      });
    }

    if (predictionData) {
      translateCurrentDynamicContent(predictionData, requestToken).catch((error) => {
        console.warn("Dynamic recommendation translation failed.", error);
      });
    }
  }

  function translateVisibleWeatherLabels(risk) {
    if (!risk) return;

    const translateLevel = (level) => {
      if (currentLanguage === "hi") {
        return {
          Low: "कम",
          Moderate: "मध्यम",
          High: "उच्च",
          "Very High": "बहुत अधिक"
        }[level] || level;
      }

      if (currentLanguage === "mr") {
        return {
          Low: "कमी",
          Moderate: "मध्यम",
          High: "उच्च",
          "Very High": "खूप जास्त"
        }[level] || level;
      }

      return level;
    };

    [
      ["weatherCurrentRisk", risk.current_level, risk.current_score],
      ["weather24Risk", risk.next_24h_level, risk.next_24h_score],
      ["weather7Risk", risk.next_7d_level, risk.next_7d_score]
    ].forEach(([id, level, score]) => {
      const el = document.getElementById(id);

      if (el && level) {
        el.textContent =
          `${translateLevel(level)} (${Number(score).toFixed(0)}/100)`;
      }
    });
  }

  async function translateVisibleWeatherContent(risk, requestToken = languageRequestToken) {
    if (!risk || currentLanguage === "en" || requestToken !== languageRequestToken) {
      translateVisibleWeatherLabels(risk);
      return;
    }

    const drivers = Array.isArray(risk.drivers)
      ? risk.drivers
      : [];

    const sourceTexts = [
      ...drivers,
      risk.explanation || "",
      "Risk assessment calculated from the selected location's weather conditions."
    ];

    try {
      const languageAtRequest = currentLanguage;
      const translated =
        await translateBatch(
          sourceTexts,
          languageAtRequest
        );

      if (requestToken !== languageRequestToken || languageAtRequest !== currentLanguage) {
        return;
      }

      if (weatherDrivers) {
        weatherDrivers.innerHTML = "";

        if (drivers.length) {
          drivers.forEach((_, index) => {
            const li =
              document.createElement("li");

            li.textContent =
              translated[index] ||
              drivers[index];

            weatherDrivers.appendChild(li);
          });
        } else {
          const li =
            document.createElement("li");

          li.textContent =
            t("no_weather_drivers");

          weatherDrivers.appendChild(li);
        }
      }

      if (weatherExplanation) {
        weatherExplanation.textContent =
          translated[drivers.length] ||
          risk.explanation ||
          t("weather_completed");
      }

      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          translated[drivers.length + 1] ||
          "Risk assessment calculated from the selected location's weather conditions.";
      }
    } catch (error) {
      console.warn(
        "Dynamic weather translation failed.",
        error
      );
    }

    translateVisibleWeatherLabels(risk);
  }

  if (languageSelect) {
    languageSelect.addEventListener(
      "change",
      () => {
        applyLanguage(
          languageSelect.value
        );
      }
    );
  }

  // =========================================================
  // DOM REFERENCES
  // =========================================================

  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const dropzoneContent =
    document.getElementById("dropzoneContent");

  const previewContent =
    document.getElementById("previewContent");

  const previewImageEl =
    document.getElementById("previewImage");

  const changeImageBtn =
    document.getElementById("changeImageBtn");

  const uploadError =
    document.getElementById("uploadError");

  const apiError =
    document.getElementById("apiError");

  const analyzeBtn =
    document.getElementById("analyzeBtn");

  const loadingRow =
    document.getElementById("loadingRow");

  const loadingText =
    document.getElementById("loadingText");


  // =========================================================
  // IMAGE QUALITY
  // =========================================================

  const imageQualityCard =
    document.getElementById("imageQualityCard");

  const qualityStatus =
    document.getElementById("qualityStatus");

  const qualityMessage =
    document.getElementById("qualityMessage");

  const qualityStatusDot =
    document.getElementById("qualityStatusDot");

  const qualityDetails =
    document.getElementById("qualityDetails");


  // =========================================================
  // RESULT REFERENCES
  // =========================================================

  const resultsPanel =
    document.getElementById("resultsPanel");

  const resultCropLabel =
    document.getElementById("resultCropLabel");

  const resultDiseaseName =
    document.getElementById("resultDiseaseName");

  const resultTechnicalName =
    document.getElementById("resultTechnicalName");

  const confidenceValue =
    document.getElementById("confidenceValue");

  const confidenceRing =
    document.getElementById("confidenceRing");



  // =========================================================
  // CONFIDENCE / UNCERTAINTY
  // =========================================================

  const confidenceAssessment =
    document.getElementById("confidenceAssessment");

  const confidenceStatus =
    document.getElementById("confidenceStatus");

  const confidenceMessage =
    document.getElementById("confidenceMessage");

  const confidenceGap =
    document.getElementById("confidenceGap");

  const confidenceStatusDot =
    document.getElementById("confidenceStatusDot");


  // =========================================================
  // TOP-3 PREDICTIONS
  // =========================================================

  

  const topPredictionsBlock =
    document.getElementById("topPredictionsBlock") ||
    document.querySelector(".top-predictions-section");

  const topPredictions =
    document.getElementById("topPredictions");


  // =========================================================
  // GRAD-CAM
  // =========================================================

  const originalImageEl =
    document.getElementById("originalImage");

  const gradcamImageEl =
    document.getElementById("gradcamImage");

  const imageCompare =
    document.getElementById("imageCompare");


  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const descriptionBlock =
    document.getElementById("descriptionBlock");

  const descriptionText =
    document.getElementById("descriptionText");

  const symptomsBlock =
    document.getElementById("symptomsBlock");

  const symptomsList =
    document.getElementById("symptomsList");

  const actionsBlock =
    document.getElementById("actionsBlock");

  const actionsList =
    document.getElementById("actionsList");

  const preventionBlock =
    document.getElementById("preventionBlock");

  const preventionList =
    document.getElementById("preventionList");


  // =========================================================
  // AI ASSISTANT
  // =========================================================

  const chatForm =
    document.getElementById("chatForm");

  const chatInput =
    document.getElementById("chatInput");

  const assistantDrawer =
    document.getElementById("assistant");

  const assistantOverlay =
    document.getElementById("assistantOverlay");

  const assistantCloseBtn =
    document.getElementById("assistantCloseBtn");
// =========================================================
// WEATHER RISK
// =========================================================

const weatherDetectedDisease =
  document.getElementById("weatherDetectedDisease");

const weatherLocationInput =
  document.getElementById("weatherLocationInput");

const weatherCheckBtn =
  document.getElementById("weatherCheckBtn");

const weatherLocationBtn =
  document.getElementById("weatherLocationBtn");

const weatherLocationStatus =
  document.getElementById("weatherLocationStatus");

const weatherRiskResult =
  document.getElementById("weatherRiskResult");

const weatherLocationName =
  document.getElementById("weatherLocationName");

const weatherTemperature =
  document.getElementById("weatherTemperature");

const weatherHumidity =
  document.getElementById("weatherHumidity");

const weatherRain =
  document.getElementById("weatherRain");

const weatherCurrentRisk =
  document.getElementById("weatherCurrentRisk");

const weather24Risk =
  document.getElementById("weather24Risk");

const weather7Risk =
  document.getElementById("weather7Risk");

const weatherDrivers =
  document.getElementById("weatherDrivers");

const weatherExplanation =
  document.getElementById("weatherExplanation");

const weatherChoice =
  document.getElementById("weatherChoice");

const weatherCheckChoiceBtn =
  document.getElementById("weatherCheckChoiceBtn");

const weatherSkipBtn =
  document.getElementById("weatherSkipBtn");

const weatherControls =
  document.getElementById("weatherControls");

  // =========================================================
  // CROP HEALTH HUB
  // =========================================================

  const cropSelector =
    document.getElementById("cropSelector");

  const cropHealthContent =
    document.getElementById("cropHealthContent");

  const cropHealthEmpty =
    document.getElementById("cropHealthEmpty");

  const selectedCropName =
    document.getElementById("selectedCropName");

  const cropDiseaseCount =
    document.getElementById("cropDiseaseCount");

  const cropDiseaseGrid =
    document.getElementById("cropDiseaseGrid");


  // =========================================================
  // DISEASE COMPARISON
  // =========================================================

  const comparisonEmpty =
    document.getElementById("comparisonEmpty");

  const comparisonContent =
    document.getElementById("comparisonContent");

  const comparisonNote =
    document.getElementById("comparisonNote");

  const comparisonCards =
    document.getElementById("comparisonCards");

  const decisionPriority = document.getElementById("decisionPriority");
  const decisionRationale = document.getElementById("decisionRationale");
  const decisionImmediate = document.getElementById("decisionImmediate");
  const decisionMonitoring = document.getElementById("decisionMonitoring");
  const decisionVerification = document.getElementById("decisionVerification");
  const decisionVerificationColumn = document.getElementById("decisionVerificationColumn");
  const decisionBasis = document.getElementById("decisionBasis");
  const similarCasesStatus = document.getElementById("similarCasesStatus");
  const similarCasesGrid = document.getElementById("similarCasesGrid");


  // =========================================================
  // HISTORY
  // =========================================================

  const historyList =
    document.getElementById("historyList");

  const historyEmpty =
    document.getElementById("historyEmpty");

  const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");

  const historyToggleBtn =
    document.getElementById("historyToggleBtn");

  const descriptionDetail =
    document.getElementById("descriptionDetail");

  const symptomsDetail =
    document.getElementById("symptomsDetail");

  const preventionDetail =
    document.getElementById("preventionDetail");


  // =========================================================
  // STATE
  // =========================================================

  let selectedFile = null;
  let currentPrediction = null;

 

  let qualityCheckToken = 0;


  // =========================================================
  // NAVIGATION
  // =========================================================

  if (navToggle && navbar) {
    navToggle.addEventListener("click", () => {
      const isOpen =
        navbar.classList.toggle("nav-open");

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }


  document
    .querySelectorAll(".nav-links-mobile a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (navbar) {
          navbar.classList.remove("nav-open");
        }

        if (navToggle) {
          navToggle.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      });
    });


  // =========================================================
  // FILE SELECTION
  // =========================================================

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => {
      fileInput.click();
    });


    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  }


  if (changeImageBtn && fileInput) {
    changeImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }


  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file =
        e.target.files && e.target.files[0];

      handleFileSelection(file);
    });
  }


  // =========================================================
  // DRAG AND DROP
  // =========================================================

  if (dropzone) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });


    ["dragleave", "drop"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });


    dropzone.addEventListener("drop", (e) => {
      const file =
        e.dataTransfer.files &&
        e.dataTransfer.files[0];

      handleFileSelection(file);
    });
  }


  // =========================================================
  // HANDLE FILE SELECTION
  // =========================================================

  function handleFileSelection(file) {
    clearMessages();

    if (!file) {
      return;
    }


    if (!ACCEPTED_TYPES.includes(file.type)) {
      showUploadError(
        "Please select a JPG, PNG, or WEBP image."
      );

      resetSelection();
      return;
    }


    selectedFile = file;

    if (analyzeBtn) {
      analyzeBtn.disabled = false;
    }


    previewImage(file);

    resetResults();


    // -------------------------------------------------------
    // Client-side image quality check
    // -------------------------------------------------------

    const token = ++qualityCheckToken;

    hideImageQuality();

    checkImageQuality(file).then((quality) => {
      if (token === qualityCheckToken) {
        displayImageQuality(quality);
      }
    });
  }


  // =========================================================
  // PREVIEW IMAGE
  // =========================================================

  function previewImage(file) {
    if (!previewImageEl) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      previewImageEl.src = e.target.result;

      if (dropzoneContent) {
        dropzoneContent.classList.add("hidden");
      }

      if (previewContent) {
        previewContent.classList.remove("hidden");
      }
    };

    reader.readAsDataURL(file);
  }


  // =========================================================
  // IMAGE QUALITY CHECK
  // =========================================================

  function checkImageQuality(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();


      reader.onload = (e) => {
        const img = new Image();


        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;


          // -------------------------------------------------
          // Resolution
          // -------------------------------------------------

          if (width < 224 || height < 224) {
            resolve({
              status: "Poor quality",
              level: "poor-quality",

              message:
                "The image resolution is too low. Please upload a larger, clearer leaf image.",

              details: [
                `Resolution: ${width} × ${height}`,
                "Recommended: at least 224 × 224 pixels"
              ]
            });

            return;
          }


          // -------------------------------------------------
          // Resize for faster browser processing
          // -------------------------------------------------

          const maxSize = 500;

          const scale = Math.min(
            1,
            maxSize / Math.max(width, height)
          );


          const canvas =
            document.createElement("canvas");

          canvas.width = Math.max(
            1,
            Math.round(width * scale)
          );

          canvas.height = Math.max(
            1,
            Math.round(height * scale)
          );


          const ctx =
            canvas.getContext(
              "2d",
              {
                willReadFrequently: true
              }
            );


          if (!ctx) {
            resolve({
              status: "Quality check skipped",
              level: "needs-improvement",

              message:
                "The image quality could not be analyzed in this browser. You can still run the diagnosis.",

              details: [
                `Resolution: ${width} × ${height}`
              ]
            });

            return;
          }


          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );


          let imageData;


          try {
            imageData =
              ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
          } catch (err) {
            resolve({
              status: "Quality check skipped",
              level: "needs-improvement",

              message:
                "The image quality could not be analyzed in this browser. You can still run the diagnosis.",

              details: [
                `Resolution: ${width} × ${height}`
              ]
            });

            return;
          }


          const pixels = imageData.data;

          const w = canvas.width;
          const h = canvas.height;


          // -------------------------------------------------
          // Grayscale image for sharpness calculation
          // -------------------------------------------------

          const grayscale =
            new Float32Array(w * h);

          let brightnessSum = 0;


          for (
            let i = 0, p = 0;
            i < pixels.length;
            i += 4, p += 1
          ) {
            const gray =
              0.299 * pixels[i] +
              0.587 * pixels[i + 1] +
              0.114 * pixels[i + 2];

            grayscale[p] = gray;

            brightnessSum += gray;
          }


          const averageBrightness =
            brightnessSum / grayscale.length;


          // -------------------------------------------------
          // Laplacian variance
          // Used as a simple blur indicator
          // -------------------------------------------------

          let laplacianSum = 0;
          let laplacianSquaredSum = 0;
          let laplacianCount = 0;


          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

              const center =
                grayscale[y * w + x];

              const top =
                grayscale[(y - 1) * w + x];

              const bottom =
                grayscale[(y + 1) * w + x];

              const left =
                grayscale[y * w + (x - 1)];

              const right =
                grayscale[y * w + (x + 1)];


              const laplacian =
                top +
                bottom +
                left +
                right -
                4 * center;


              laplacianSum += laplacian;

              laplacianSquaredSum +=
                laplacian * laplacian;

              laplacianCount++;
            }
          }


          const laplacianMean =
            laplacianSum /
            laplacianCount;


          const blurVariance =
            laplacianSquaredSum /
            laplacianCount -
            laplacianMean *
            laplacianMean;


          // -------------------------------------------------
          // Detect issues
          // -------------------------------------------------

          const issues = [];


          if (averageBrightness < 45) {
            issues.push("Image is too dark");
          } else if (averageBrightness > 215) {
            issues.push("Image is too bright");
          }


          if (blurVariance < 40) {
            issues.push("Image may be blurry");
          }


          const details = [
            `Resolution: ${width} × ${height}`,
            `Brightness: ${averageBrightness.toFixed(0)}/255`,
            `Sharpness: ${blurVariance.toFixed(0)}`
          ];


          let result;


          if (issues.length >= 2) {

            result = {
              status: "Poor quality",
              level: "poor-quality",

              message:
                "The image quality may affect the reliability of the diagnosis. Consider uploading a clearer leaf image.",

              details: [
                ...details,
                ...issues
              ]
            };


          } else if (issues.length === 1) {

            result = {
              status: "Needs improvement",
              level: "needs-improvement",

              message:
                "The image can be analyzed, but improving the image quality may produce a more reliable result.",

              details: [
                ...details,
                issues[0]
              ]
            };


          } else {

            result = {
              status: "Good quality",
              level: "good-quality",

              message:
                "The image quality is suitable for analysis.",

              details
            };
          }


          resolve(result);
        };


        img.onerror = () => {
          resolve({
            status: "Quality check failed",
            level: "needs-improvement",

            message:
              "The image could not be analyzed for quality. You can still try the diagnosis.",

            details: []
          });
        };


        img.src = e.target.result;
      };


      reader.onerror = () => {
        resolve({
          status: "Quality check failed",
          level: "needs-improvement",

          message:
            "The image could not be analyzed for quality. You can still try the diagnosis.",

          details: []
        });
      };


      reader.readAsDataURL(file);
    });
  }


  // =========================================================
  // DISPLAY IMAGE QUALITY
  // =========================================================

  function displayImageQuality(quality) {
    if (!imageQualityCard || !quality) {
      return;
    }


    imageQualityCard.classList.remove(
      "good-quality",
      "needs-improvement",
      "poor-quality"
    );


    imageQualityCard.classList.add(
      quality.level
    );


    imageQualityCard.classList.remove(
      "hidden"
    );


    if (qualityStatus) {
      qualityStatus.textContent =
        quality.status;
    }


    if (qualityMessage) {
      qualityMessage.textContent =
        quality.message;
    }


    if (qualityStatusDot) {
      qualityStatusDot.className =
        "quality-status-dot " +
        quality.level;
    }


    if (qualityDetails) {
      qualityDetails.innerHTML = "";

      (quality.details || []).forEach(
        (detail) => {

          const li =
            document.createElement("li");

          li.textContent = detail;

          qualityDetails.appendChild(li);
        }
      );
    }
  }


  // =========================================================
  // HIDE IMAGE QUALITY
  // =========================================================

  function hideImageQuality() {
    if (!imageQualityCard) {
      return;
    }


    imageQualityCard.classList.add(
      "hidden"
    );


    imageQualityCard.classList.remove(
      "good-quality",
      "needs-improvement",
      "poor-quality"
    );


    if (qualityDetails) {
      qualityDetails.innerHTML = "";
    }
  }


  // =========================================================
  // RESET SELECTION
  // =========================================================

  function resetSelection() {
    selectedFile = null;

    currentPrediction = null;


    if (analyzeBtn) {
      analyzeBtn.disabled = true;
    }


    if (fileInput) {
      fileInput.value = "";
    }


    if (dropzoneContent) {
      dropzoneContent.classList.remove("hidden");
    }


    if (previewContent) {
      previewContent.classList.add("hidden");
    }


    hideImageQuality();
  }


  // =========================================================
  // ERROR HANDLING
  // =========================================================

  function showUploadError(message) {
    if (!uploadError) {
      return;
    }


    uploadError.textContent = message;

    uploadError.classList.remove(
      "hidden"
    );
  }


  function showApiError(message) {
    if (!apiError) {
      return;
    }


    apiError.textContent = message;

    apiError.classList.remove(
      "hidden"
    );
  }


  function clearMessages() {
    if (uploadError) {
      uploadError.classList.add("hidden");
      uploadError.textContent = "";
    }


    if (apiError) {
      apiError.classList.add("hidden");
      apiError.textContent = "";
    }
  }


  // =========================================================
  // RESET RESULTS
  // =========================================================

  function resetResults() {

    if (resultsPanel) {
      resultsPanel.classList.add("hidden");
    }


    if (topPredictions) {
      topPredictions.innerHTML = "";
    }


    if (topPredictionsBlock) {
      topPredictionsBlock.classList.add("hidden");
    }


    if (comparisonContent) {
      comparisonContent.classList.add("hidden");
    }


    if (comparisonEmpty) {
      comparisonEmpty.classList.remove("hidden");
    }


    if (comparisonCards) {
      comparisonCards.innerHTML = "";
    }


    if (comparisonNote) {
      comparisonNote.textContent = "";
    }


    if (confidenceAssessment) {
      confidenceAssessment.classList.add("hidden");
    }




    if (originalImageEl) {
      originalImageEl.removeAttribute("src");
    }


    if (gradcamImageEl) {
      gradcamImageEl.removeAttribute("src");
    }


    if (imageCompare) {
      imageCompare.classList.add("hidden");
    }


    [
      descriptionBlock,
      symptomsBlock,
      actionsBlock,
      preventionBlock
    ].forEach((block) => {
      if (block) {
        block.classList.add("hidden");
      }
    });


    if (descriptionText) {
      descriptionText.textContent = "";
    }


    if (symptomsList) {
      symptomsList.innerHTML = "";
    }


    if (actionsList) {
      actionsList.innerHTML = "";
    }


    if (preventionList) {
      preventionList.innerHTML = "";
    }
  }


  // =========================================================
  // WEATHER-AWARE DISEASE RISK
  // =========================================================

  function getCurrentDiseaseForWeather() {
    if (!currentPrediction) {
      return null;
    }

    return (
      currentPrediction.prediction ||
      currentPrediction.disease ||
      currentPrediction.label ||
      null
    );
  }


  function resetWeatherUI() {

  if (weatherDetectedDisease) {
    weatherDetectedDisease.textContent =
      "Analyze a leaf first";
  }
    if (weatherChoice) {
      weatherChoice.classList.remove("hidden");
    }

    if (weatherControls) {
      weatherControls.classList.add("hidden");
    }

    if (weatherRiskResult) {
      weatherRiskResult.classList.add("hidden");
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent = "";
    }

    if (weatherLocationInput) {
      weatherLocationInput.value = "";
    }
  }


  function openWeatherControls() {
    if (!getCurrentDiseaseForWeather()) {
      return;
    }

    if (weatherChoice) {
      weatherChoice.classList.add("hidden");
    }

    if (weatherControls) {
      weatherControls.classList.remove("hidden");
    }

    if (weatherLocationInput) {
      weatherLocationInput.focus();
    }
  }


  function skipWeatherCheck() {
    if (weatherChoice) {
      weatherChoice.classList.add("hidden");
    }

    if (weatherControls) {
      weatherControls.classList.add("hidden");
    }

    if (weatherRiskResult) {
      weatherRiskResult.classList.add("hidden");
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent = "";
    }
  }


  async function fetchWeatherRisk(
    latitude,
    longitude,
    locationName
  ) {
    const disease = getCurrentDiseaseForWeather();

    if (!disease) {
      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          "Please analyze a plant image first.";
      }
      return;
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent =
        t("checking_weather");
    }

    if (weatherRiskResult) {
      weatherRiskResult.classList.add("hidden");
    }

    try {
      const response = await fetch(
        WEATHER_RISK_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            disease: disease,
            latitude: latitude,
            longitude: longitude
          })
        }
      );

      if (!response.ok) {
        let message =
          t("weather_unable");

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            message = errorData.detail;
          }
        } catch (error) {
          // Keep default message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      displayWeatherRisk(
        data,
        locationName
      );

    } catch (error) {
      console.error(
        "Weather risk error:",
        error
      );

      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          t("weather_failed");
      }
    }
  }


  async function searchWeatherLocation() {
    const location =
      weatherLocationInput
        ? weatherLocationInput.value.trim()
        : "";

    if (!location) {
      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          t("enter_location");
      }
      return;
    }

    if (!getCurrentDiseaseForWeather()) {
      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          "Please analyze a plant image first.";
      }
      return;
    }

    if (weatherCheckBtn) {
      weatherCheckBtn.disabled = true;
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent =
        t("finding_location");
    }

    try {
      const response = await fetch(
        `${GEOCODE_API_URL}?location=${encodeURIComponent(location)}`
      );

      if (!response.ok) {
        throw new Error(
          t("location_search_failed")
        );
      }

      const data = await response.json();
      const result = data.results?.[0];

      if (
        !result ||
        result.latitude === undefined ||
        result.longitude === undefined
      ) {
        throw new Error(
          t("location_not_found")
        );
      }

      const resolvedName =
        result.name ||
        location;

      await fetchWeatherRisk(
        result.latitude,
        result.longitude,
        resolvedName
      );

    } catch (error) {
      console.error(
        "Geocoding error:",
        error
      );

      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          "Location not found. Try another city.";
      }
    } finally {
      if (weatherCheckBtn) {
        weatherCheckBtn.disabled = false;
      }
    }
  }


  function useBrowserLocation() {
    if (!navigator.geolocation) {
      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          "Location services are not supported by this browser.";
      }
      return;
    }

    if (!getCurrentDiseaseForWeather()) {
      if (weatherLocationStatus) {
        weatherLocationStatus.textContent =
          "Please analyze a plant image first.";
      }
      return;
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent =
        "Getting your location...";
    }

    if (weatherLocationBtn) {
      weatherLocationBtn.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetchWeatherRisk(
            position.coords.latitude,
            position.coords.longitude,
            "Your Location"
          );
        } finally {
          if (weatherLocationBtn) {
            weatherLocationBtn.disabled = false;
          }
        }
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        if (weatherLocationStatus) {
          weatherLocationStatus.textContent =
            "Could not access your location. Enter a city manually.";
        }

        if (weatherLocationBtn) {
          weatherLocationBtn.disabled = false;
        }
      }
    );
  }


  function displayWeatherRisk(
    data,
    locationName
  ) {
    if (!data || !data.risk) {
      throw new Error(
        "Invalid weather risk response."
      );
    }

    const weather =
      data.current_weather || {};

    const risk =
      data.risk || {};

    if (weatherDetectedDisease) {
      weatherDetectedDisease.textContent =
        getCurrentDiseaseForWeather() ||
        "Detected condition";
    }

    if (weatherLocationName) {
      weatherLocationName.textContent =
        locationName ||
        "Selected Location";
    }

    if (weatherTemperature) {
      weatherTemperature.textContent =
        weather.temperature_c !== undefined
          ? `${Number(weather.temperature_c).toFixed(1)} °C`
          : "—";
    }

    if (weatherHumidity) {
      weatherHumidity.textContent =
        weather.humidity_percent !== undefined
          ? `${Number(weather.humidity_percent).toFixed(0)}%`
          : "—";
    }

    if (weatherRain) {
      weatherRain.textContent =
        weather.precipitation_mm !== undefined
          ? `${Number(weather.precipitation_mm).toFixed(1)} mm`
          : "—";
    }

    if (weatherCurrentRisk) {
      weatherCurrentRisk.textContent =
        formatWeatherRisk(
          risk.current_level,
          risk.current_score
        );
    }

    if (weather24Risk) {
      weather24Risk.textContent =
        formatWeatherRisk(
          risk.next_24h_level,
          risk.next_24h_score
        );
    }

    if (weather7Risk) {
      weather7Risk.textContent =
        formatWeatherRisk(
          risk.next_7d_level,
          risk.next_7d_score
        );
    }

    if (weatherDrivers) {
      weatherDrivers.innerHTML = "";

      const drivers =
        Array.isArray(risk.drivers)
          ? risk.drivers
          : [];

      drivers.forEach((driver) => {
        const li =
          document.createElement("li");

        li.textContent = driver;
        weatherDrivers.appendChild(li);
      });

      if (!drivers.length) {
        const li =
          document.createElement("li");

        li.textContent =
          t("no_weather_drivers");

        weatherDrivers.appendChild(li);
      }
    }

    if (weatherExplanation) {
      weatherExplanation.textContent =
        risk.explanation ||
        t("weather_completed");
    }

    if (weatherLocationStatus) {
      weatherLocationStatus.textContent =
        "Risk assessment calculated from the selected location's weather conditions.";
    }

    if (weatherChoice) {
      weatherChoice.classList.add("hidden");
    }

    if (weatherControls) {
      weatherControls.classList.remove("hidden");
    }

    if (weatherRiskResult) {
      weatherRiskResult.classList.remove("hidden");
    }

    if (window.currentPredictionData) {
      refreshDecisionPlan(window.currentPredictionData, Number(risk.next_24h_score));
    }
  }


  function formatWeatherRisk(
    level,
    score
  ) {
    if (!level) {
      return "—";
    }

    if (score === undefined || score === null) {
      return level;
    }

    const translated = currentLanguage === "hi"
      ? ({Low:"कम", Moderate:"मध्यम", High:"उच्च", "Very High":"बहुत अधिक"}[level] || level)
      : currentLanguage === "mr"
        ? ({Low:"कमी", Moderate:"मध्यम", High:"उच्च", "Very High":"खूप जास्त"}[level] || level)
        : level;
    return `${translated} (${Number(score).toFixed(0)}/100)`;
  }


  // =========================================================
  // WEATHER EVENTS
  // =========================================================

  if (weatherCheckChoiceBtn) {
    weatherCheckChoiceBtn.addEventListener(
      "click",
      openWeatherControls
    );
  }

  if (weatherSkipBtn) {
    weatherSkipBtn.addEventListener(
      "click",
      skipWeatherCheck
    );
  }

  if (weatherCheckBtn) {
    weatherCheckBtn.addEventListener(
      "click",
      searchWeatherLocation
    );
  }

  if (weatherLocationInput) {
    weatherLocationInput.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          searchWeatherLocation();
        }
      }
    );
  }

  if (weatherLocationBtn) {
    weatherLocationBtn.addEventListener(
      "click",
      useBrowserLocation
    );
  }


  // =========================================================
  // ANALYZE IMAGE
  // =========================================================

  if (analyzeBtn) {
    analyzeBtn.addEventListener(
      "click",
      analyzeImage
    );
  }


  async function analyzeImage() {

    if (!selectedFile) {
      showUploadError(
        "Please select an image first."
      );
      return;
    }


    clearMessages();


    if (analyzeBtn) {
      analyzeBtn.disabled = true;
    }


    if (loadingRow) {
      loadingRow.classList.remove("hidden");
    }


    if (loadingText) {
      loadingText.textContent =
        t("analyzing_leaf");
    }


    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response =
        await fetch(
          API_URL,
          {
            method: "POST",
            body: formData
          }
        );


      if (!response.ok) {

        let errorMessage =
          t("server_process_error");

        try {
          const errorData =
            await response.json();

          if (errorData.detail) {
            errorMessage =
              errorData.detail;
          }
        } catch (err) {
          // Keep default error message.
        }

        throw new Error(
          errorMessage
        );
      }


      const data =
        await response.json();


      currentPrediction = data;

      window.currentPrediction =
        data;


      displayResults(data);

      saveToHistory(data);


    } catch (error) {

      console.error(
        "Prediction error:",
        error
      );


      showApiError(
        error.message ||
        t("prediction_server_unreachable")
      );

    } finally {

      if (loadingRow) {
        loadingRow.classList.add("hidden");
      }


      if (analyzeBtn) {
        analyzeBtn.disabled =
          !selectedFile;
      }
    }
  }
  // =========================================================
// ANALYZE ERROR
// =========================================================

function handleAnalyzeError(error) {

  const message =
    error && error.message
      ? error.message
      : "";


  if (message === "HTTP_ERROR") {

    showApiError(
      "The AI server returned an error while analyzing this image. Please try again."
    );

  } else if (
    message === "INVALID_JSON" ||
    message === "INVALID_RESPONSE"
  ) {

    showApiError(
      "The AI server sent an unexpected response. Please try again."
    );

  } else {

    showApiError(
      "Unable to connect to the AI server. Please make sure the FastAPI backend is running."
    );
  }
}


// =========================================================
// FORMAT DISEASE LABEL
// =========================================================

function formatDiseaseLabel(rawLabel) {

  if (!rawLabel) {
    return "";
  }


  let label =
    String(rawLabel)
      .replace(/___/g, " ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  const replacements = {
    "Apple Apple Scab":
      "Apple Scab",

    "Apple Black Rot":
      "Apple Black Rot",

    "Apple Cedar Apple Rust":
      "Cedar Apple Rust",

    "Apple Healthy":
      "Apple Healthy",

    "Blueberry Healthy":
      "Blueberry Healthy",

    "Cherry Including Sour Powdery Mildew":
      "Cherry Powdery Mildew",

    "Cherry Including Sour Healthy":
      "Cherry Healthy",

    "Corn Maize Cercospora Leaf Spot Gray Leaf Spot":
      "Corn Gray Leaf Spot",

    "Corn Maize Common Rust":
      "Corn Common Rust",

    "Corn Maize Northern Leaf Blight":
      "Corn Northern Leaf Blight",

    "Corn Maize Healthy":
      "Corn Healthy",

    "Grape Black Rot":
      "Grape Black Rot",

    "Grape Esca Black Measles":
      "Grape Esca (Black Measles)",

    "Grape Leaf Blight Isariopsis Leaf Spot":
      "Grape Leaf Blight",

    "Grape Healthy":
      "Grape Healthy",

    "Orange Haunglongbing Citrus Greening":
      "Orange Citrus Greening",

    "Peach Bacterial Spot":
      "Peach Bacterial Spot",

    "Peach Healthy":
      "Peach Healthy",

    "Pepper Bell Bacterial Spot":
      "Bell Pepper Bacterial Spot",

    "Pepper Bell Healthy":
      "Bell Pepper Healthy",

    "Potato Early Blight":
      "Potato Early Blight",

    "Potato Late Blight":
      "Potato Late Blight",

    "Potato Healthy":
      "Potato Healthy",

    "Raspberry Healthy":
      "Raspberry Healthy",

    "Soybean Healthy":
      "Soybean Healthy",

    "Squash Powdery Mildew":
      "Squash Powdery Mildew",

    "Strawberry Leaf Scorch":
      "Strawberry Leaf Scorch",

    "Strawberry Healthy":
      "Strawberry Healthy",

    "Tomato Bacterial Spot":
      "Tomato Bacterial Spot",

    "Tomato Early Blight":
      "Tomato Early Blight",

    "Tomato Late Blight":
      "Tomato Late Blight",

    "Tomato Leaf Mold":
      "Tomato Leaf Mold",

    "Tomato Septoria Leaf Spot":
      "Tomato Septoria Leaf Spot",

    "Tomato Spider Mites Two Spotted Spider Mite":
      "Tomato Spider Mites",

    "Tomato Target Spot":
      "Tomato Target Spot",

    "Tomato Tomato Yellow Leaf Curl Virus":
      "Tomato Yellow Leaf Curl Virus",

    "Tomato Tomato Mosaic Virus":
      "Tomato Mosaic Virus",

    "Tomato Healthy":
      "Tomato Healthy"
  };


  if (replacements[label]) {
    return replacements[label];
  }


  return label
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}


// =========================================================
// HEALTHY PREDICTION
// =========================================================

function isHealthyPrediction(rawLabel) {

  return (
    typeof rawLabel === "string" &&
    rawLabel
      .toLowerCase()
      .includes("healthy")
  );
}


// =========================================================
  // DYNAMIC CONTENT TRANSLATION
  // =========================================================

  async function translateCurrentDynamicContent(data) {
    if (!data || currentLanguage === "en") {
      return;
    }

    const recommendation = data.recommendation || {};

    const actions = Array.isArray(recommendation.actions)
      ? recommendation.actions
      : Array.isArray(recommendation.recommended_actions)
        ? recommendation.recommended_actions
        : [];

    const symptoms = Array.isArray(recommendation.symptoms)
      ? recommendation.symptoms
      : [];

    const prevention = Array.isArray(recommendation.prevention)
      ? recommendation.prevention
      : [];

    const topPredictions = Array.isArray(data.top_predictions)
      ? data.top_predictions.slice(0, 3)
      : [];

    const sourceTexts = [];
    const add = (text) => {
      const index = sourceTexts.length;
      sourceTexts.push(text || "");
      return index;
    };

    const cropIndex = add(recommendation.crop);
    const diseaseIndex = add(recommendation.disease);
    const descriptionIndex = add(
      recommendation.description || recommendation.summary
    );

    const arrayEntries = (items) =>
      items.map((item) => {
        if (typeof item === "string") {
          return { type: "string", index: add(item) };
        }

        if (item && typeof item === "object") {
          return {
            type: "object",
            item,
            titleIndex: item.title ? add(item.title) : null,
            descriptionIndex: item.description ? add(item.description) : null,
            textIndex: item.text ? add(item.text) : null
          };
        }

        return { type: "string", index: add(String(item ?? "")) };
      });

    const symptomEntries = arrayEntries(symptoms);
    const actionEntries = arrayEntries(actions);
    const preventionEntries = arrayEntries(prevention);

    const topPredictionEntries = topPredictions.map((item) =>
      add(
        formatDiseaseLabel(
          item && (item.class || item.label || item.name)
        )
      )
    );

    const moderateIndex = add(
      "The model has a leading prediction, but some uncertainty remains."
    );
    const lowIndex = add(
      "The top predictions are relatively close. Consider uploading a clearer leaf image or using additional expert verification."
    );
    const healthyIndex = add(
      "The model predicts a healthy leaf. Continue regular monitoring and good crop-care practices."
    );

    try {
      const languageAtRequest = currentLanguage;
      const translated = await translateBatch(
        sourceTexts,
        languageAtRequest
      );

      // Ignore a slow response if the user switched language again meanwhile.
      if (requestToken !== languageRequestToken || languageAtRequest !== currentLanguage) {
        return;
      }

      const translatedItemArray = (items, entries) =>
        entries.map((entry) => {
          if (entry.type === "string") {
            return translated[entry.index] || "";
          }

          const item = { ...entry.item };

          if (entry.titleIndex !== null) {
            item.title = translated[entry.titleIndex] || item.title;
          }
          if (entry.descriptionIndex !== null) {
            item.description =
              translated[entry.descriptionIndex] || item.description;
          }
          if (entry.textIndex !== null) {
            item.text = translated[entry.textIndex] || item.text;
          }

          return item;
        });

      const translatedRecommendation = {
        ...recommendation,
        crop: translated[cropIndex] || recommendation.crop || "",
        disease: translated[diseaseIndex] || recommendation.disease || "",
        description:
          translated[descriptionIndex] ||
          recommendation.description ||
          recommendation.summary ||
          "",
        symptoms: translatedItemArray(symptoms, symptomEntries),
        actions: translatedItemArray(actions, actionEntries),
        prevention: translatedItemArray(prevention, preventionEntries)
      };

      displayRecommendation(
        translatedRecommendation,
        isHealthyPrediction(data.prediction)
      );

      // Update comparison cards and top prediction names.
      const translatedTopPredictions = topPredictions.map((item, index) => ({
        ...item,
        translatedClass:
          translated[topPredictionEntries[index]] ||
          formatDiseaseLabel(item && (item.class || item.label || item.name))
      }));

      if (comparisonCards) {
        const names = comparisonCards.querySelectorAll(".comparison-card h4");
        translatedTopPredictions.forEach((item, index) => {
          if (names[index]) {
            names[index].textContent = item.translatedClass;
          }
        });
      }

      if (topPredictions) {
        const names = topPredictions.querySelectorAll(".prediction-name");
        translatedTopPredictions.forEach((item, index) => {
          if (names[index]) {
            names[index].textContent = item.translatedClass;
          }
        });
      }

      if (confidenceMessage) {
        if (
          confidenceAssessment &&
          confidenceAssessment.classList.contains("moderate-confidence")
        ) {
          confidenceMessage.textContent =
            translated[moderateIndex] ||
            "The model has a leading prediction, but some uncertainty remains.";
        } else if (
          confidenceAssessment &&
          confidenceAssessment.classList.contains("low-confidence")
        ) {
          confidenceMessage.textContent =
            translated[lowIndex] ||
            "The top predictions are relatively close. Consider uploading a clearer leaf image or using additional expert verification.";
        } else if (
          confidenceAssessment &&
          confidenceAssessment.classList.contains("high-confidence")
        ) {
          confidenceMessage.textContent =
            translated[healthyIndex] ||
            "The model predicts a healthy leaf. Continue regular monitoring and good crop-care practices.";
        }
      }

      if (resultCropLabel) {
        resultCropLabel.textContent =
          translatedRecommendation.crop || t("crop");
      }

      if (resultDiseaseName) {
        resultDiseaseName.textContent =
          translatedRecommendation.disease ||
          formatDiseaseLabel(data.prediction);
      }

      if (weatherDetectedDisease) {
        weatherDetectedDisease.textContent =
          translatedRecommendation.disease ||
          formatDiseaseLabel(data.prediction);
      }
    } catch (error) {
      console.warn("Dynamic recommendation translation failed.", error);
    }
  }


// =========================================================
// DECISION SUPPORT + SIMILAR CASES
// =========================================================
function renderDecisionList(element, items) {
  if (!element) return;
  element.innerHTML = "";
  (Array.isArray(items) ? items : []).forEach((item) => {
    const li = document.createElement("li"); li.textContent = item; element.appendChild(li);
  });
}
function displayDecisionPlan(plan) {
  if (!plan) return;
  if (decisionPriority) decisionPriority.textContent = plan.priority || "—";
  if (decisionRationale) decisionRationale.textContent = plan.rationale || "";
  renderDecisionList(decisionImmediate, plan.immediate_actions);
  renderDecisionList(decisionMonitoring, plan.monitoring);
  renderDecisionList(decisionVerification, plan.verification);
  if (decisionVerificationColumn) decisionVerificationColumn.classList.toggle("hidden", !(plan.verification && plan.verification.length));
  if (decisionBasis && plan.basis) {
    const c=Number(plan.basis.model_confidence||0).toFixed(1), w=plan.basis.weather_score;
    decisionBasis.textContent=`Decision-support basis: model confidence ${c}%`+(w==null?"":` · environmental risk score ${Number(w).toFixed(0)}/100`);
  }
}
async function refreshDecisionPlan(data, weatherScore=null) {
  if (!data) return;
  try {
    const r=await fetch(DECISION_PLAN_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({disease:data.prediction,confidence:Number(data.confidence||0)/100,weather_score:weatherScore})});
    if(!r.ok) throw new Error("Decision plan unavailable");
    const plan=await r.json(); if(data!==window.currentPredictionData) return;
    displayDecisionPlan(plan); window.currentDecisionPlan=plan;
    if(currentLanguage!=="en") translateDecisionPlan(plan);
  } catch(e) { console.warn("Decision plan error:",e); displayDecisionPlan(data.decision_plan); }
}
async function translateDecisionPlan(plan) {
  if(!plan || currentLanguage==="en") return;
  const texts=[plan.priority||"",plan.rationale||"",...(plan.immediate_actions||[]),...(plan.monitoring||[]),...(plan.verification||[])].filter(Boolean);
  try {
    const tr=await translateBatch(texts,currentLanguage); let i=0;
    const next={...plan,priority:tr[i++]||plan.priority,rationale:tr[i++]||plan.rationale};
    next.immediate_actions=(plan.immediate_actions||[]).map(x=>tr[i++]||x);
    next.monitoring=(plan.monitoring||[]).map(x=>tr[i++]||x);
    next.verification=(plan.verification||[]).map(x=>tr[i++]||x);
    if(window.currentPredictionData) displayDecisionPlan(next);
  } catch(e) { console.warn("Decision plan translation failed:",e); }
}
function clearSimilarCases() { if(similarCasesGrid) similarCasesGrid.innerHTML=""; if(similarCasesStatus) similarCasesStatus.textContent=t("similar_cases_waiting"); }
async function fetchSimilarCases(data) {
  if(!selectedFile || !data) return;
  if(similarCasesStatus) similarCasesStatus.textContent="Finding visually similar cases…";
  try {
    const fd=new FormData(); fd.append("file",selectedFile);
    const r=await fetch(`${SIMILAR_CASES_API_URL}?predicted_class=${encodeURIComponent(data.prediction||"")}`,{method:"POST",body:fd});
    if(!r.ok) throw new Error("Similarity service unavailable");
    const result=await r.json(); if(data!==window.currentPredictionData) return;
    if(!result.available){if(similarCasesStatus) similarCasesStatus.textContent=t("similar_cases_unavailable");return;}
    renderSimilarCases(result.cases||[]);
  } catch(e){console.warn("Similar-case retrieval error:",e);if(similarCasesStatus) similarCasesStatus.textContent=t("similar_cases_unavailable");}
}
async function renderSimilarCases(cases) {
  if(!similarCasesGrid) return; similarCasesGrid.innerHTML="";
  if(!cases.length){if(similarCasesStatus) similarCasesStatus.textContent=t("similar_cases_none");return;}
  if(similarCasesStatus) similarCasesStatus.textContent=`${cases.length} ${t("similar_cases_found")}`;
  const labels=cases.map(x=>x.label||"Unknown"); let tr=labels; try{tr=await translateBatch(labels,currentLanguage);}catch(_){ }
  cases.forEach((item,i)=>{
    const card=document.createElement("article");card.className="similar-case";
    if(item.thumbnail){const img=document.createElement("img");img.src=item.thumbnail;img.alt="Similar reference leaf";img.loading="lazy";card.appendChild(img);}
    const body=document.createElement("div");body.className="similar-case-body";
    const title=document.createElement("h3");title.className="similar-case-title";title.textContent=tr[i]||labels[i];
    const meta=document.createElement("div");meta.className="similar-case-meta";meta.innerHTML=`<span>${Number(item.similarity||0).toFixed(1)}% ${t("similar_percent")}</span><span>#${i+1}</span>`;
    const match=document.createElement("div");match.className="similar-match";match.textContent=item.same_condition?t("same_condition"):t("alternative_case");
    body.append(title,meta,match);card.appendChild(body);similarCasesGrid.appendChild(card);
  });
}

// =========================================================
// DISPLAY RESULTS
// =========================================================

async function displayResults(data) {

  if (!data) {
    return;
  }

  resetWeatherUI();


  window.currentPredictionData = data;

  const recommendation =
    data.recommendation || {};


  const readableLabel =
    formatDiseaseLabel(
      data.prediction
    );


  const healthy =
    isHealthyPrediction(
      data.prediction
    );

  if (weatherDetectedDisease) {
    weatherDetectedDisease.textContent =
      recommendation.disease ||
      readableLabel ||
      "Detected condition";
  }


  // ---------------------------------------------------------
  // Crop
  // ---------------------------------------------------------

  if (resultCropLabel) {

    resultCropLabel.textContent =
      recommendation.crop ||
      "Detected Crop";
  }


  // ---------------------------------------------------------
  // Disease
  // ---------------------------------------------------------

  if (resultDiseaseName) {

    resultDiseaseName.textContent =
      recommendation.disease ||
      readableLabel ||
      "Unknown Condition";


    resultDiseaseName.classList.toggle(
      "is-healthy",
      healthy
    );
  }


  // ---------------------------------------------------------
  // Technical model class
  // ---------------------------------------------------------

  if (resultTechnicalName) {
    resultTechnicalName.textContent = "";
  }


  // ---------------------------------------------------------
  // Confidence
  // ---------------------------------------------------------

  const confidence =
    Math.max(
      0,
      Math.min(
        100,
        Number(data.confidence) || 0
      )
    );


  if (confidenceValue) {

    confidenceValue.textContent =
      `${confidence.toFixed(1)}%`;
  }


  if (confidenceRing) {

    const offset =
      RING_CIRCUMFERENCE *
      (1 - confidence / 100);


    confidenceRing.style.strokeDashoffset =
      String(offset);
  }


  // ---------------------------------------------------------
  // Confidence assessment
  // ---------------------------------------------------------

  displayConfidenceAssessment(
    data.top_predictions
  );


  // ---------------------------------------------------------
  // Prediction comparison
  // ---------------------------------------------------------

  displayPredictionComparison(
    data.top_predictions
  );


  // ---------------------------------------------------------
  // Original image
  // ---------------------------------------------------------

  if (
    originalImageEl &&
    previewImageEl &&
    previewImageEl.src
  ) {

    originalImageEl.src =
      previewImageEl.src;
  }


  // ---------------------------------------------------------
  // Grad-CAM
  // ---------------------------------------------------------

  if (data.gradcam) {

    if (gradcamImageEl) {

      gradcamImageEl.src =
        "data:image/jpeg;base64," +
        data.gradcam;
    }


    if (imageCompare) {

      imageCompare.classList.remove(
        "hidden"
      );
    }



  } else {

    if (imageCompare) {

      imageCompare.classList.add(
        "hidden"
      );
    }

  }


  // ---------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------

  displayRecommendation(
    recommendation,
    healthy
  );

  displayDecisionPlan(data.decision_plan);
  refreshDecisionPlan(data);
  clearSimilarCases();
  fetchSimilarCases(data);

  if (currentLanguage !== "en") {
    // Do not block the result screen on translation. Show the diagnosis
    // immediately and translate dynamic text in the background.
    translateCurrentDynamicContent(data).catch((error) => {
      console.warn("Background dynamic translation failed.", error);
    });
  }


  // ---------------------------------------------------------
  // Show results
  // ---------------------------------------------------------

  if (resultsPanel) {

    resultsPanel.classList.remove(
      "hidden"
    );


    resultsPanel.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
}


// =========================================================
// TOP-3 PREDICTIONS
// =========================================================

function displayTopPredictions(
  rawTopPredictions
) {

  if (!topPredictions) {
    return;
  }


  topPredictions.innerHTML = "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length === 0
  ) {

    if (topPredictionsBlock) {

      topPredictionsBlock.classList.add(
        "hidden"
      );
    }

    return;
  }


  rawTopPredictions
    .slice(0, 3)
    .forEach(
      (item, index) => {

        const confidence =
          Math.max(
            0,
            Math.min(
              100,
              Number(
                item &&
                item.confidence
              ) || 0
            )
          );


        const rawName =
          item &&
          (
            item.class ||
            item.label ||
            item.name
          )
            ? (
                item.class ||
                item.label ||
                item.name
              )
            : "";


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "top-prediction-item";


        const rank =
          document.createElement(
            "div"
          );


        rank.className =
          "prediction-rank";


        rank.textContent =
          `#${index + 1}`;


        const details =
          document.createElement(
            "div"
          );


        details.className =
          "prediction-details";


        const name =
          document.createElement(
            "div"
          );


        name.className =
          "prediction-name";


        name.textContent =
          formatDiseaseLabel(
            rawName
          );


        const bar =
          document.createElement(
            "div"
          );


        bar.className =
          "prediction-bar";


        const fill =
          document.createElement(
            "div"
          );


        fill.className =
          "prediction-fill";


        fill.style.width =
          `${confidence}%`;


        bar.appendChild(
          fill
        );


        details.appendChild(
          name
        );


        details.appendChild(
          bar
        );


        const confidenceLabel =
          document.createElement(
            "div"
          );


        confidenceLabel.className =
          "prediction-confidence";


        confidenceLabel.textContent =
          `${confidence.toFixed(1)}%`;


        row.appendChild(
          rank
        );


        row.appendChild(
          details
        );


        row.appendChild(
          confidenceLabel
        );


        topPredictions.appendChild(
          row
        );
      }
    );


  if (topPredictionsBlock) {

    topPredictionsBlock.classList.remove(
      "hidden"
    );
  }
}


// =========================================================
// CONFIDENCE ASSESSMENT
// =========================================================

function displayConfidenceAssessment(
  rawTopPredictions
) {

  if (!confidenceAssessment) {
    return;
  }


  confidenceAssessment.classList.remove(
    "hidden",
    "high-confidence",
    "moderate-confidence",
    "low-confidence"
  );


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length === 0
  ) {

    confidenceAssessment.classList.add(
      "low-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        "Limited confidence";
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The model did not provide enough prediction information to assess confidence.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot low-confidence";
    }


    return;
  }


  const first =
    Number(
      rawTopPredictions[0] &&
      rawTopPredictions[0].confidence
    ) || 0;


  const second =
    Number(
      rawTopPredictions[1] &&
      rawTopPredictions[1].confidence
    ) || 0;


  const gap =
    first - second;


  if (confidenceGap) {

    confidenceGap.textContent =
      `Top-1 vs Top-2 gap: ${gap.toFixed(1)}%`;
  }


  if (
    first >= 80 &&
    gap >= 20
  ) {

    confidenceAssessment.classList.add(
      "high-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        t("high_confidence");
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The leading prediction is substantially ahead of the other predictions.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot high-confidence";
    }


  } else if (
    first >= 60 ||
    gap >= 10
  ) {

    confidenceAssessment.classList.add(
      "moderate-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        t("moderate_confidence");
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The model has a leading prediction, but some uncertainty remains.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot moderate-confidence";
    }


  } else {

    confidenceAssessment.classList.add(
      "low-confidence"
    );


    if (confidenceStatus) {

      confidenceStatus.textContent =
        t("low_confidence");
    }


    if (confidenceMessage) {

      confidenceMessage.textContent =
        "The top predictions are relatively close. Consider uploading a clearer leaf image or using additional expert verification.";
    }


    if (confidenceStatusDot) {

      confidenceStatusDot.className =
        "confidence-status-dot low-confidence";
    }
  }
}


// =========================================================
// RECOMMENDATIONS
// =========================================================

function displayRecommendation(
  recommendation,
  healthy
) {

  recommendation =
    recommendation || {};


  const description =
    recommendation.description ||
    recommendation.summary ||
    "";


  if (descriptionText) {
    descriptionText.textContent =
      description;
  }

  if (descriptionDetail) {
    descriptionDetail.classList.toggle("hidden", !description);
    descriptionDetail.open = false;
  }


  const symptoms =
    Array.isArray(
      recommendation.symptoms
    )
      ? recommendation.symptoms
      : [];


  displayListBlock(
    symptomsBlock,
    symptomsList,
    symptoms
  );

  if (symptomsDetail) {
    symptomsDetail.classList.toggle("hidden", symptoms.length === 0);
    symptomsDetail.open = false;
  }


  const actions =
    Array.isArray(
      recommendation.actions
    )
      ? recommendation.actions
      : Array.isArray(
          recommendation.recommended_actions
        )
        ? recommendation.recommended_actions
        : [];


  displayListBlock(
    actionsBlock,
    actionsList,
    actions
  );


  const prevention =
    Array.isArray(
      recommendation.prevention
    )
      ? recommendation.prevention
      : [];


  displayListBlock(
    preventionBlock,
    preventionList,
    prevention
  );

  if (preventionDetail) {
    preventionDetail.classList.toggle("hidden", prevention.length === 0);
    preventionDetail.open = false;
  }


  if (
    healthy &&
    !description &&
    symptoms.length === 0 &&
    actions.length === 0 &&
    prevention.length === 0
  ) {

    if (descriptionBlock) {

      descriptionBlock.classList.remove(
        "hidden"
      );
    }


    if (descriptionText) {

      descriptionText.textContent =
        "The model predicts a healthy leaf. Continue regular monitoring and good crop-care practices.";

      if (descriptionDetail) {
        descriptionDetail.classList.remove("hidden");
      }
    }
  }
}


// =========================================================
// DISPLAY LIST BLOCK
// =========================================================

function displayListBlock(
  block,
  listElement,
  items
) {

  if (!listElement) {
    return;
  }


  listElement.innerHTML = "";


  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    if (block) {
      block.classList.add(
        "hidden"
      );
    }

    return;
  }


  items.forEach(
    (item) => {

      const li =
        document.createElement(
          "li"
        );


      if (
        typeof item ===
        "string"
      ) {

        li.textContent =
          item;


      } else if (
        item &&
        typeof item ===
        "object"
      ) {

        if (item.title) {

          const title =
            document.createElement(
              "strong"
            );


          title.textContent =
            item.title;


          li.appendChild(
            title
          );


          if (item.description) {

            const text =
              document.createElement(
                "span"
              );


            text.textContent =
              ` ${item.description}`;


            li.appendChild(
              text
            );
          }


        } else if (item.text) {

          li.textContent =
            item.text;


        } else {

          li.textContent =
            JSON.stringify(
              item
            );
        }


      } else {

        li.textContent =
          String(item);
      }


      listElement.appendChild(
        li
      );
    }
  );


  if (block) {
    block.classList.remove(
      "hidden"
    );
  }
}


// =========================================================
// RESET RESULTS
// =========================================================

function clearResultSections() {

  if (topPredictions) {
    topPredictions.innerHTML = "";
  }


  if (topPredictionsBlock) {

    topPredictionsBlock.classList.add(
      "hidden"
    );
  }


  if (confidenceAssessment) {

    confidenceAssessment.classList.add(
      "hidden"
    );
  }



  if (imageCompare) {

    imageCompare.classList.add(
      "hidden"
    );
  }


  if (comparisonCards) {

    comparisonCards.innerHTML = "";
  }


  if (comparisonContent) {

    comparisonContent.classList.add(
      "hidden"
    );
  }


  if (comparisonEmpty) {

    comparisonEmpty.classList.remove(
      "hidden"
    );
  }


  if (comparisonNote) {

    comparisonNote.textContent = "";
  }


  [
    descriptionBlock,
    symptomsBlock,
    actionsBlock,
    preventionBlock
  ].forEach(
    (block) => {

      if (block) {
        block.classList.add(
          "hidden"
        );
      }
    }
  );


  if (descriptionText) {
    descriptionText.textContent = "";
  }

  [descriptionDetail, symptomsDetail, preventionDetail].forEach((detail) => {
    if (detail) {
      detail.classList.add("hidden");
      detail.open = false;
    }
  });


  if (symptomsList) {
    symptomsList.innerHTML = "";
  }


  if (actionsList) {
    actionsList.innerHTML = "";
  }


  if (preventionList) {
    preventionList.innerHTML = "";
  }
}


// =========================================================
// RESET RESULTS
// =========================================================

function resetResults() {

  currentPrediction =
    null;

  resetWeatherUI();


  window.currentPrediction =
    null;


  clearResultSections();


  if (resultsPanel) {

    resultsPanel.classList.add(
      "hidden"
    );
  }


  if (originalImageEl) {

    originalImageEl.removeAttribute(
      "src"
    );
  }


  if (gradcamImageEl) {

    gradcamImageEl.removeAttribute(
      "src"
    );
  }


  if (confidenceValue) {

    confidenceValue.textContent =
      "0.0%";
  }


  if (confidenceRing) {

    confidenceRing.style.strokeDashoffset =
      String(RING_CIRCUMFERENCE);
  }
}


// =========================================================
// PREDICTION COMPARISON
// =========================================================

function getPredictionName(item) {

  if (!item) {
    return "";
  }


  return formatDiseaseLabel(
    item.class ||
    item.label ||
    item.name ||
    ""
  );
}


function getComparisonType(
  rawName
) {

  if (
    isHealthyPrediction(
      rawName
    )
  ) {
    return t("healthy_condition");
  }


  return t("possible_disease");
}


function displayPredictionComparison(
  rawTopPredictions
) {

  if (
    !comparisonContent ||
    !comparisonEmpty ||
    !comparisonCards
  ) {
    return;
  }


  comparisonCards.innerHTML =
    "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length < 2
  ) {

    comparisonContent.classList.add(
      "hidden"
    );


    comparisonEmpty.classList.remove(
      "hidden"
    );


    comparisonEmpty.textContent =
      "At least two model predictions are required for comparison.";


    return;
  }


  const predictions =
    rawTopPredictions.slice(
      0,
      3
    );


  comparisonEmpty.classList.add(
    "hidden"
  );


  comparisonContent.classList.remove(
    "hidden"
  );


  if (comparisonNote) {

    comparisonNote.textContent =
      `${predictions.length} predictions compared`;
  }


  predictions.forEach(
    (item, index) => {

      const rawName =
        item.class ||
        item.label ||
        item.name ||
        "";


      const readableName =
        getPredictionName(
          item
        );


      const confidence =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              item.confidence
            ) || 0
          )
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "comparison-card";


      if (index === 0) {

        card.classList.add(
          "comparison-leading"
        );
      }


      const rank =
        document.createElement(
          "div"
        );


      rank.className =
        "comparison-rank";


      rank.textContent =
        `#${index + 1}`;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        readableName;


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "comparison-type";


      type.textContent =
        getComparisonType(
          rawName
        );


      const confidenceLabel =
        document.createElement(
          "div"
        );


      confidenceLabel.className =
        "comparison-confidence";


      confidenceLabel.textContent =
        `${confidence.toFixed(1)}%`;


      const bar =
        document.createElement(
          "div"
        );


      bar.className =
        "comparison-bar";


      const fill =
        document.createElement(
          "div"
        );


      fill.className =
        "comparison-fill";


      fill.style.width =
        `${confidence}%`;


      bar.appendChild(
        fill
      );


      card.appendChild(
        rank
      );


      card.appendChild(
        title
      );


      card.appendChild(
        type
      );


      card.appendChild(
        confidenceLabel
      );


      card.appendChild(
        bar
      );


      comparisonCards.appendChild(
        card
      );
    }
  );
}


// =========================================================
// CROP HEALTH HUB DATA
// =========================================================

const cropHealthData = {

  Apple: [
    {
      name: "Apple Scab",
      className:
        "Apple___Apple_scab",
      type: "Disease"
    },
    {
      name: "Apple Black Rot",
      className:
        "Apple___Black_rot",
      type: "Disease"
    },
    {
      name: "Cedar Apple Rust",
      className:
        "Apple___Cedar_apple_rust",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Apple___healthy",
      type: "Healthy"
    }
  ],


  Blueberry: [
    {
      name: "Healthy",
      className:
        "Blueberry___healthy",
      type: "Healthy"
    }
  ],


  Cherry: [
    {
      name: "Powdery Mildew",
      className:
        "Cherry_(including_sour)___Powdery_mildew",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Cherry_(including_sour)___healthy",
      type: "Healthy"
    }
  ],


  Corn: [
    {
      name:
        "Cercospora Leaf Spot / Gray Leaf Spot",
      className:
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
      type: "Disease"
    },
    {
      name: "Common Rust",
      className:
        "Corn_(maize)___Common_rust_",
      type: "Disease"
    },
    {
      name: "Northern Leaf Blight",
      className:
        "Corn_(maize)___Northern_Leaf_Blight",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Corn_(maize)___healthy",
      type: "Healthy"
    }
  ],


  Grape: [
    {
      name: "Black Rot",
      className:
        "Grape___Black_rot",
      type: "Disease"
    },
    {
      name:
        "Esca / Black Measles",
      className:
        "Grape___Esca_(Black_Measles)",
      type: "Disease"
    },
    {
      name: "Leaf Blight",
      className:
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Grape___healthy",
      type: "Healthy"
    }
  ],


  Orange: [
    {
      name:
        "Huanglongbing / Citrus Greening",
      className:
        "Orange___Haunglongbing_(Citrus_greening)",
      type: "Disease"
    }
  ],


  Peach: [
    {
      name: "Bacterial Spot",
      className:
        "Peach___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Peach___healthy",
      type: "Healthy"
    }
  ],


  Pepper: [
    {
      name: "Bacterial Spot",
      className:
        "Pepper,_bell___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Pepper,_bell___healthy",
      type: "Healthy"
    }
  ],


  Potato: [
    {
      name: "Early Blight",
      className:
        "Potato___Early_blight",
      type: "Disease"
    },
    {
      name: "Late Blight",
      className:
        "Potato___Late_blight",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Potato___healthy",
      type: "Healthy"
    }
  ],


  Raspberry: [
    {
      name: "Healthy",
      className:
        "Raspberry___healthy",
      type: "Healthy"
    }
  ],


  Soybean: [
    {
      name: "Healthy",
      className:
        "Soybean___healthy",
      type: "Healthy"
    }
  ],


  Squash: [
    {
      name: "Powdery Mildew",
      className:
        "Squash___Powdery_mildew",
      type: "Disease"
    }
  ],


  Strawberry: [
    {
      name: "Leaf Scorch",
      className:
        "Strawberry___Leaf_scorch",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Strawberry___healthy",
      type: "Healthy"
    }
  ],


  Tomato: [
    {
      name: "Bacterial Spot",
      className:
        "Tomato___Bacterial_spot",
      type: "Disease"
    },
    {
      name: "Early Blight",
      className:
        "Tomato___Early_blight",
      type: "Disease"
    },
    {
      name: "Late Blight",
      className:
        "Tomato___Late_blight",
      type: "Disease"
    },
    {
      name: "Leaf Mold",
      className:
        "Tomato___Leaf_Mold",
      type: "Disease"
    },
    {
      name: "Septoria Leaf Spot",
      className:
        "Tomato___Septoria_leaf_spot",
      type: "Disease"
    },
    {
      name: "Spider Mites",
      className:
        "Tomato___Spider_mites Two-spotted_spider_mite",
      type: "Disease"
    },
    {
      name: "Target Spot",
      className:
        "Tomato___Target_Spot",
      type: "Disease"
    },
    {
      name:
        "Tomato Yellow Leaf Curl Virus",
      className:
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
      type: "Disease"
    },
    {
      name:
        "Tomato Mosaic Virus",
      className:
        "Tomato___Tomato_mosaic_virus",
      type: "Disease"
    },
    {
      name: "Healthy",
      className:
        "Tomato___healthy",
      type: "Healthy"
    }
  ]
};


// =========================================================
// DISPLAY CROP HEALTH HUB
// =========================================================

function displayCropHealth(
  crop
) {

  if (
    !cropHealthContent ||
    !cropHealthEmpty ||
    !cropDiseaseGrid
  ) {
    return;
  }


  const diseases =
    cropHealthData[crop];


  cropDiseaseGrid.innerHTML =
    "";


  if (
    !diseases ||
    diseases.length === 0
  ) {

    cropHealthContent.classList.add(
      "hidden"
    );


    cropHealthEmpty.classList.remove(
      "hidden"
    );


    cropHealthEmpty.textContent =
      "No supported conditions found for this crop.";


    return;
  }


  cropHealthEmpty.classList.add(
    "hidden"
  );


  cropHealthContent.classList.remove(
    "hidden"
  );


  if (selectedCropName) {

    selectedCropName.textContent =
      crop;
  }


  if (cropDiseaseCount) {

    cropDiseaseCount.textContent =
      `${diseases.length} condition${
        diseases.length === 1
          ? ""
          : "s"
      }`;
  }


  diseases.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "crop-disease-card";


      if (
        item.type ===
        "Healthy"
      ) {

        card.classList.add(
          "healthy-condition"
        );
      }


      const badge =
        document.createElement(
          "span"
        );


      badge.className =
        "crop-condition-badge";


      badge.textContent =
        item.type;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        item.name;


      const modelClass =
        document.createElement(
          "p"
        );


      modelClass.className =
        "crop-model-class";


      modelClass.textContent =
        item.className;


      card.appendChild(
        badge
      );


      card.appendChild(
        title
      );


      card.appendChild(
        modelClass
      );


      cropDiseaseGrid.appendChild(
        card
      );
    }
  );
}


// =========================================================
// CROP SELECTOR
// =========================================================

if (cropSelector) {

  cropSelector.addEventListener(
    "change",
    () => {

      const crop =
        cropSelector.value;


      if (!crop) {

        if (cropHealthContent) {

          cropHealthContent.classList.add(
            "hidden"
          );
        }


        if (cropHealthEmpty) {

          cropHealthEmpty.classList.remove(
            "hidden"
          );


          cropHealthEmpty.textContent =
            "Select a crop to explore its supported conditions.";
        }


        return;
      }


      displayCropHealth(
        crop
      );
    }
  );


  if (cropSelector.value) {

    displayCropHealth(
      cropSelector.value
    );
  }
}
// =========================================================
// DISEASE COMPARISON
// =========================================================

function getPredictionName(item) {

  if (!item) {
    return "";
  }

  return formatDiseaseLabel(
    item.class ||
    item.label ||
    item.name ||
    ""
  );
}


function getComparisonType(rawName) {

  if (
    isHealthyPrediction(rawName)
  ) {
    return t("healthy_condition");
  }

  return t("possible_disease");
}


function displayPredictionComparison(
  rawTopPredictions
) {

  if (
    !comparisonContent ||
    !comparisonEmpty ||
    !comparisonCards
  ) {
    return;
  }

  comparisonCards.innerHTML = "";


  if (
    !Array.isArray(
      rawTopPredictions
    ) ||
    rawTopPredictions.length < 2
  ) {

    comparisonContent.classList.add(
      "hidden"
    );

    comparisonEmpty.classList.remove(
      "hidden"
    );

    comparisonEmpty.textContent =
      "At least two model predictions are required for comparison.";

    return;
  }


  const predictions =
    rawTopPredictions.slice(
      0,
      3
    );


  comparisonEmpty.classList.add(
    "hidden"
  );

  comparisonContent.classList.remove(
    "hidden"
  );


  if (comparisonNote) {

    comparisonNote.textContent =
      `${predictions.length} predictions compared`;
  }


  predictions.forEach(
    (item, index) => {

      const rawName =
        item.class ||
        item.label ||
        item.name ||
        "";


      const readableName =
        getPredictionName(item);


      const confidence =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              item.confidence
            ) || 0
          )
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "comparison-card";


      if (index === 0) {

        card.classList.add(
          "comparison-leading"
        );
      }


      const rank =
        document.createElement(
          "div"
        );


      rank.className =
        "comparison-rank";


      rank.textContent =
        `#${index + 1}`;


      const title =
        document.createElement(
          "h4"
        );


      title.textContent =
        readableName;


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "comparison-type";


      type.textContent =
        getComparisonType(
          rawName
        );


      const confidenceLabel =
        document.createElement(
          "div"
        );


      confidenceLabel.className =
        "comparison-confidence";


      confidenceLabel.textContent =
        `${confidence.toFixed(1)}%`;


      const bar =
        document.createElement(
          "div"
        );


      bar.className =
        "comparison-bar";


      const fill =
        document.createElement(
          "div"
        );


      fill.className =
        "comparison-fill";


      fill.style.width =
        `${confidence}%`;


      bar.appendChild(
        fill
      );


      card.appendChild(
        rank
      );

      card.appendChild(
        title
      );

      card.appendChild(
        type
      );

      card.appendChild(
        confidenceLabel
      );

      card.appendChild(
        bar
      );


      comparisonCards.appendChild(
        card
      );
    }
  );
}


// =========================================================
// AI ASSISTANT MESSAGE CONTAINER
// =========================================================

function getAssistantMessagesContainer() {

  return (
    document.getElementById(
      "assistantMessages"
    ) ||

    document.getElementById(
      "chatMessages"
    ) ||

    document.querySelector(
      ".assistant-messages"
    ) ||

    document.querySelector(
      ".chat-messages"
    ) ||

    document.querySelector(
      ".chat-body"
    )
  );
}


// =========================================================
// ADD AI ASSISTANT MESSAGE
// =========================================================

function addAssistantMessage(
  message,
  role = "assistant"
) {

  const container =
    getAssistantMessagesContainer();


  if (!container) {

    console.warn(
      "AI Assistant message container not found."
    );

    return null;
  }


  const messageEl =
    document.createElement(
      "div"
    );


  messageEl.className =
    role === "user"
      ? "chat-message user-message"
      : "chat-message assistant-message";


  messageEl.dataset.role =
    role;


  const textEl =
    document.createElement(
      "div"
    );


  textEl.className =
    "chat-message-text";


  textEl.textContent =
    message;


  messageEl.appendChild(
    textEl
  );


  container.appendChild(
    messageEl
  );


  container.scrollTop =
    container.scrollHeight;


  return messageEl;
}


// =========================================================
// REMOVE AI ASSISTANT MESSAGE
// =========================================================

function removeAssistantMessage(
  messageEl
) {

  if (
    messageEl &&
    messageEl.parentNode
  ) {

    messageEl.parentNode.removeChild(
      messageEl
    );
  }
}


// =========================================================
// AI ASSISTANT
// =========================================================

if (chatForm) {

  chatForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const question =
        chatInput
          ? chatInput.value.trim()
          : "";


      if (!question) {
        return;
      }


      // -------------------------------------------------------
      // Require prediction
      // -------------------------------------------------------

      if (!currentPrediction) {

        addAssistantMessage(
          t("assistant_first"),
          "assistant"
        );

        return;
      }


      // -------------------------------------------------------
      // Show user message
      // -------------------------------------------------------

      addAssistantMessage(
        question,
        "user"
      );


      // Clear input AFTER reading it
      if (chatInput) {

        chatInput.value = "";
      }


      // -------------------------------------------------------
      // Submit button
      // -------------------------------------------------------

      const submitButton =
        chatForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;
      }


      // -------------------------------------------------------
      // Thinking
      // -------------------------------------------------------

      const thinkingMessage =
        addAssistantMessage(
          t("thinking"),
          "assistant"
        );


      try {

        const topPredictions =
          Array.isArray(
            currentPrediction.top_predictions
          )
            ? currentPrediction.top_predictions
            : [];


        const payload = {

          disease:
            currentPrediction.prediction,

          confidence:
            Number(
              currentPrediction.confidence
            ) || 0,

          top_predictions:
            topPredictions,

          question:
            question
        };


        const response =
          await fetch(
            ASSISTANT_API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );


        // -----------------------------------------------------
        // Parse response
        // -----------------------------------------------------

        let result = null;


        try {

          result =
            await response.json();

        } catch (jsonError) {

          throw new Error(
            "The AI Assistant returned an invalid response."
          );
        }


        // -----------------------------------------------------
        // Remove thinking message
        // -----------------------------------------------------

        removeAssistantMessage(
          thinkingMessage
        );


        if (!response.ok) {

          throw new Error(
            result &&
            (
              result.detail ||
              result.message
            )
              ? (
                  result.detail ||
                  result.message
                )
              : "The AI Assistant server returned an error."
          );
        }


        const answer =
          result &&
          typeof result.answer ===
            "string"
            ? result.answer.trim()
            : "";


        if (!answer) {

          throw new Error(
            "The AI Assistant returned an empty answer."
          );
        }


        // -----------------------------------------------------
        // Display answer
        // -----------------------------------------------------

        addAssistantMessage(
          answer,
          "assistant"
        );


      } catch (error) {

        removeAssistantMessage(
          thinkingMessage
        );


        console.error(
          "AI Assistant error:",
          error
        );


        addAssistantMessage(
          error &&
          error.message
            ? error.message
            : "Unable to reach the AI Assistant. Please make sure the FastAPI backend is running.",
          "assistant"
        );


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;
        }


        if (chatInput) {

          chatInput.focus();
        }
      }
    }
  );
}


// =========================================================
// ENTER KEY SUPPORT
// =========================================================

if (chatInput) {

  chatInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();


        if (chatForm) {

          if (
            typeof chatForm.requestSubmit ===
            "function"
          ) {

            chatForm.requestSubmit();

          } else {

            chatForm.dispatchEvent(
              new Event(
                "submit",
                {
                  bubbles: true,
                  cancelable: true
                }
              )
            );
          }
        }
      }
    }
  );
}


// =========================================================
// HISTORY
// =========================================================

function getHistory() {

  try {

    const stored =
      localStorage.getItem(
        HISTORY_KEY
      );


    if (!stored) {
      return [];
    }


    const parsed =
      JSON.parse(
        stored
      );


    return Array.isArray(
      parsed
    )
      ? parsed
      : [];


  } catch (error) {

    console.warn(
      "Unable to read scan history:",
      error
    );


    return [];
  }
}


// =========================================================
// SAVE HISTORY
// =========================================================

function saveToHistory(
  data
) {

  if (!data) {
    return;
  }


  const history =
    getHistory();


  const item = {

    id:
      Date.now(),

    prediction:
      data.prediction ||
      "",

    confidence:
      Number(
        data.confidence
      ) || 0,

    top_predictions:
      Array.isArray(
        data.top_predictions
      )
        ? data.top_predictions
        : [],

    recommendation:
      data.recommendation ||
      {},

    timestamp:
      new Date().toISOString()
  };


  history.unshift(
    item
  );


  const limited =
    history.slice(
      0,
      HISTORY_LIMIT
    );


  try {

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        limited
      )
    );

  } catch (error) {

    console.warn(
      "Unable to save scan history:",
      error
    );
  }


  renderHistory();
}


// =========================================================
// RENDER HISTORY
// =========================================================

function renderHistory() {

  if (!historyList) {
    return;
  }


  const history =
    getHistory();

  const expanded =
    historyList.dataset.expanded === "true";

  historyList.innerHTML =
    "";


  if (historyEmpty) {

    historyEmpty.classList.toggle(
      "hidden",
      history.length !== 0
    );
  }


  if (
    history.length === 0
  ) {
    if (historyToggleBtn) {
      historyToggleBtn.classList.add("hidden");
    }
    return;
  }

  if (historyToggleBtn) {
    historyToggleBtn.classList.toggle("hidden", history.length <= 3);
    historyToggleBtn.textContent = expanded ? "Show less" : `Show all (${history.length})`;
  }

  const visibleHistory = expanded ? history : history.slice(0, 3);

  visibleHistory.forEach(
    (item) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "history-item";


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "history-item-content";


      const disease =
        document.createElement(
          "div"
        );


      disease.className =
        "history-item-disease";


      disease.textContent =
        item.recommendation &&
        item.recommendation.disease
          ? item.recommendation.disease
          : formatDiseaseLabel(
              item.prediction
            );


      const confidence =
        document.createElement(
          "div"
        );


      confidence.className =
        "history-item-confidence";


      confidence.textContent =
        `${Number(
          item.confidence
        ).toFixed(1)}% confidence`;


      const date =
        document.createElement(
          "div"
        );


      date.className =
        "history-item-date";


      date.textContent =
        formatHistoryDate(
          item.timestamp
        );


      content.appendChild(
        disease
      );


      content.appendChild(
        confidence
      );


      content.appendChild(
        date
      );


      const viewButton =
        document.createElement(
          "button"
        );


      viewButton.type =
        "button";


      viewButton.className =
        "history-view-btn";


      viewButton.textContent =
        "View";


      viewButton.addEventListener(
        "click",
        () => {

          restoreHistoryItem(
            item
          );
        }
      );


      card.appendChild(
        content
      );


      card.appendChild(
        viewButton
      );


      historyList.appendChild(
        card
      );
    }
  );
}


// =========================================================
// FORMAT HISTORY DATE
// =========================================================

function formatHistoryDate(
  timestamp
) {

  if (!timestamp) {
    return "";
  }


  const date =
    new Date(
      timestamp
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );
}


// =========================================================
// RESTORE HISTORY ITEM
// =========================================================

function restoreHistoryItem(
  item
) {

  if (!item) {
    return;
  }


  currentPrediction =
    item;


  window.currentPrediction =
    item;


  displayResults(
    item
  );


  if (resultsPanel) {

    resultsPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


// =========================================================
// CLEAR HISTORY
// =========================================================

if (clearHistoryBtn) {

  clearHistoryBtn.addEventListener(
    "click",
    () => {

      try {

        localStorage.removeItem(
          HISTORY_KEY
        );

      } catch (error) {

        console.warn(
          "Unable to clear scan history:",
          error
        );
      }


      renderHistory();
    }
  );
}


// =========================================================
// HISTORY VIEW TOGGLE
// =========================================================

if (historyToggleBtn) {
  historyToggleBtn.addEventListener("click", () => {
    if (!historyList) {
      return;
    }

    historyList.dataset.expanded =
      historyList.dataset.expanded === "true" ? "false" : "true";

    renderHistory();
  });
}


applyLanguage(currentLanguage);


// =========================================================
// INITIAL HISTORY LOAD
// =========================================================

renderHistory();


// =========================================================
// INITIAL UI STATE
// =========================================================

if (analyzeBtn) {

  analyzeBtn.disabled =
    !selectedFile;
}


// =========================================================
// AI ASSISTANT DRAWER CONTROLS
// =========================================================

function openAssistantDrawer() {

  if (!assistantDrawer) {
    return;
  }

  assistantDrawer.classList.add("assistant-open");
  assistantDrawer.setAttribute("aria-hidden", "false");

  if (assistantOverlay) {
    assistantOverlay.classList.remove("hidden");
  }

  document.body.classList.add("assistant-is-open");

  if (navbar) {
    navbar.classList.remove("nav-open");
  }

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
  }

  window.setTimeout(() => {
    if (chatInput) {
      chatInput.focus();
    }
  }, 220);
}

function closeAssistantDrawer() {

  if (!assistantDrawer) {
    return;
  }

  assistantDrawer.classList.remove("assistant-open");
  assistantDrawer.setAttribute("aria-hidden", "true");

  if (assistantOverlay) {
    assistantOverlay.classList.add("hidden");
  }

  document.body.classList.remove("assistant-is-open");
}

if (assistantCloseBtn) {
  assistantCloseBtn.addEventListener(
    "click",
    closeAssistantDrawer
  );
}

if (assistantOverlay) {
  assistantOverlay.addEventListener(
    "click",
    closeAssistantDrawer
  );
}

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape" && assistantDrawer && assistantDrawer.classList.contains("assistant-open")) {
      closeAssistantDrawer();
    }
  }
);

/*
 * Intercept existing Assistant navigation links before the generic
 * anchor-navigation handler runs. The original href remains intact.
 */
document.addEventListener(
  "click",
  (event) => {
    const trigger = event.target.closest('a[href="#assistant"]');

    if (!trigger) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    openAssistantDrawer();
  },
  true
);


// =========================================================
// SMOOTH NAVIGATION
// =========================================================

document
  .querySelectorAll(
    'a[href^="#"]'
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href ||
            href === "#"
          ) {

            return;
          }


          let target = null;


          try {

            target =
              document.querySelector(
                href
              );

          } catch (error) {

            return;
          }


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    }
  );


// =========================================================
// WINDOW RESIZE
// =========================================================

window.addEventListener(
  "resize",
  () => {

    if (
      window.innerWidth > 900 &&
      navbar
    ) {

      navbar.classList.remove(
        "nav-open"
      );


      if (navToggle) {

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  }
);


// =========================================================
// EXPOSE CURRENT PREDICTION
// =========================================================

window.getCurrentPlantPrediction =
  function () {

    return currentPrediction;
  };


// =========================================================
// DEBUG INFORMATION
// =========================================================

console.log(
  "Smart Plant Health Assistant loaded."
);


console.log(
  "Prediction API:",
  API_URL
);


console.log(
  "AI Assistant API:",
  ASSISTANT_API_URL
);


// =========================================================
// END
// =========================================================

})();
