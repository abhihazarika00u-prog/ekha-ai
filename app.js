
(function () {
"use strict";

/* =====================================
   EKHA AI - HYBRID KNOWLEDGE BRAIN 1.0
   Offline First + Online Search Fallback
===================================== */

var chat = document.getElementById("chat");
var input = document.getElementById("userInput");
var statusEl = document.getElementById("status");
var core = document.getElementById("core");
var panel = document.getElementById("panel");
var panelBody = document.getElementById("panelBody");
var composer = document.getElementById("composer");
var micBtn = document.getElementById("micBtn");
var clearBtn = document.getElementById("clearBtn");

if (!chat || !input || !statusEl || !composer || !micBtn) return;

/* STORAGE */

function loadArray(key) {
    try {
        var v = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(v) ? v : [];
    } catch (e) {
        return [];
    }
}

var notes = loadArray("ekha_notes");
var reminders = loadArray("ekha_reminders");

var lastAnswer = "";
var recognition = null;
var isListening = false;

/* SETTINGS */

var SETTINGS = {
    language: "both",
    offlineFirst: true,
    onlineFallback: true,
    voiceRate: 0.95
};

/* STATUS */

function setStatus(t) {
    statusEl.textContent = t;
}

/* CHAT */

function addMessage(t, who) {
    var el = document.createElement("div");
    el.className = "message " + who;
    el.textContent = String(t);
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
}

function saveHistory() {
    var arr = [];
    var nodes = chat.querySelectorAll(".message");

    for (var i = Math.max(0, nodes.length - 50);
         i < nodes.length; i++) {

        arr.push({
            text: nodes[i].textContent,
            who: nodes[i].classList.contains("user")
                ? "user" : "bot"
        });
    }

    try {
        localStorage.setItem(
            "ekha_history",
            JSON.stringify(arr)
        );
    } catch (e) {}
}

/* VOICE OUTPUT */

function speak(text) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    var u = new SpeechSynthesisUtterance(String(text));

    u.lang = "en-IN";
    u.rate = SETTINGS.voiceRate;
    u.pitch = 1;
    u.volume = 1;

    u.onstart = function () {
        setStatus("EKHA SPEAKING...");
    };

    u.onend = function () {
        setStatus("SYSTEM ONLINE · HYBRID MODE");
    };

    u.onerror = function () {
        setStatus("VOICE OUTPUT ERROR");
    };

    window.speechSynthesis.speak(u);
}

/* RESPONSE ENGINE */

function reply(text, voice) {
    lastAnswer = String(text);

    addMessage(lastAnswer, "bot");
    saveHistory();

    setStatus("RESPONSE READY");

    if (voice !== false) {
        speak(lastAnswer);
    }
}

/* OPEN WEBSITE */

function openUrl(url) {
    var w = window.open(url, "_blank");

    if (!w) {
        window.location.href = url;
    }
}

/* =====================================
   QUESTION NORMALIZATION
===================================== */

function normalize(text) {

    var s = String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[.!?,।?]+$/g, "")
        .replace(/\s+/g, " ");

    var rules = [
        [/^(ओपन\s*)?(यूट्यूब|यु ट्यूब)(\s*(खोलो|खोल दो|खोलिए|ओपन करो))?$/, "open youtube"],
        [/^(ओपन\s*)?गूगल(\s*(खोलो|खोल दो|ओपन करो))?$/, "open google"],
        [/^(समय क्या हुआ|अभी कितने बजे हैं|कितने बजे हैं|टाइम क्या हुआ)$/, "time"],
        [/^(आज की तारीख|आज कौन सा दिन है|आज की डेट)$/, "date"],
        [/^(रिमाइंडर बंद|रिमाइंडर बंद करो|सारे रिमाइंडर बंद करो|रिमाइंडर हटाओ)$/, "reminder off"],
        [/^(दोबारा बोलो|फिर से बोलो)$/, "repeat answer"],
        [/^(चुप हो जाओ|आवाज बंद करो|आवाज़ बंद करो)$/, "stop speaking"],
        [/^(मदद|कमांड बताओ)$/, "help"],
        [/^(हेलो|हाय|नमस्ते|नमस्कार)$/, "hello"]
    ];

    for (var i = 0; i < rules.length; i++) {
        if (rules[i][0].test(s)) {
            return rules[i][1];
        }
    }

    return s;
}

/* ENGLISH DISPLAY FOR KNOWN HINDI COMMANDS */

function displayText(raw, command) {

    if (/[\u0900-\u097F]/.test(raw)) {

        var translations = {
            "open youtube": "Open YouTube",
            "open google": "Open Google",
            "time": "What time is it?",
            "date": "What is today's date?",
            "reminder off": "Turn off reminders",
            "repeat answer": "Repeat answer",
            "stop speaking": "Stop speaking",
            "help": "Help",
            "hello": "Hello"
        };

        if (translations[command]) {
            return translations[command];
        }
    }

    return raw;
}

/* =====================================
   KNOWLEDGE DATABASE
   English + Hindi
===================================== */

var knowledge = [

/* GENERAL KNOWLEDGE */

{
keys:["ai","artificial intelligence","artificial intelligence meaning"],
en:"AI stands for Artificial Intelligence. It is technology that allows computers to perform tasks that normally require human intelligence.",
hi:"AI का पूरा नाम Artificial Intelligence है। यह ऐसी तकनीक है जिससे कंप्यूटर इंसानों जैसी बुद्धिमत्ता वाले काम कर सकते हैं।"
},

{
keys:["machine learning","ml"],
en:"Machine Learning is a branch of AI that allows computers to learn patterns from data and improve their performance.",
hi:"Machine Learning, AI का एक हिस्सा है। इसमें कंप्यूटर डेटा से पैटर्न सीखते हैं और अपना प्रदर्शन बेहतर बनाते हैं।"
},

{
keys:["computer","what is computer"],
en:"A computer is an electronic device that processes data and produces useful information.",
hi:"कंप्यूटर एक इलेक्ट्रॉनिक उपकरण है जो डेटा को प्रोसेस करके उपयोगी जानकारी देता है।"
},

{
keys:["internet","what is internet"],
en:"The Internet is a worldwide network that connects computers and devices to share information.",
hi:"इंटरनेट दुनिया भर के कंप्यूटर और डिवाइस को जोड़ने वाला नेटवर्क है।"
},

{
keys:["world population","population of world"],
en:"The world's population is over 8 billion people. The exact number changes continuously.",
hi:"दुनिया की जनसंख्या 8 अरब से अधिक है। यह संख्या लगातार बदलती रहती है।"
},

{
keys:["capital of india","india capital"],
en:"New Delhi is the capital of India.",
hi:"नई दिल्ली भारत की राजधानी है।"
},

{
keys:["capital of usa","capital of united states"],
en:"Washington, D.C. is the capital of the United States.",
hi:"वॉशिंगटन डी.सी. अमेरिका की राजधानी है।"
},

{
keys:["largest planet","biggest planet"],
en:"Jupiter is the largest planet in our solar system.",
hi:"बृहस्पति हमारे सौरमंडल का सबसे बड़ा ग्रह है।"
},

{
keys:["smallest planet"],
en:"Mercury is the smallest planet in our solar system.",
hi:"बुध हमारे सौरमंडल का सबसे छोटा ग्रह है।"
},

{
keys:["red planet","mars"],
en:"Mars is known as the Red Planet because iron minerals on its surface give it a reddish appearance.",
hi:"मंगल ग्रह को लाल ग्रह कहा जाता है क्योंकि इसकी सतह पर मौजूद लौह खनिज इसे लाल रंग देते हैं।"
},

{
keys:["earth","planet earth"],
en:"Earth is the third planet from the Sun and the only known planet with life.",
hi:"पृथ्वी सूर्य से तीसरा ग्रह है और अभी तक जीवन वाला ज्ञात एकमात्र ग्रह है।"
},

{
keys:["moon","earth moon"],
en:"The Moon is Earth's natural satellite.",
hi:"चंद्रमा पृथ्वी का प्राकृतिक उपग्रह है।"
},

{
keys:["sun","what is sun"],
en:"The Sun is a star at the centre of our solar system. It provides light and heat to Earth.",
hi:"सूर्य हमारे सौरमंडल के केंद्र में स्थित एक तारा है। यह पृथ्वी को प्रकाश और गर्मी देता है।"
},

{
keys:["solar system"],
en:"Our solar system contains the Sun, eight planets, moons, dwarf planets, asteroids and comets.",
hi:"हमारे सौरमंडल में सूर्य, आठ ग्रह, चंद्रमा, बौने ग्रह, क्षुद्रग्रह और धूमकेतु शामिल हैं।"
},

{
keys:["speed of light","light speed"],
en:"Light travels in a vacuum at approximately 299,792 kilometres per second.",
hi:"प्रकाश निर्वात में लगभग 299,792 किलोमीटर प्रति सेकंड की गति से चलता है।"
},

{
keys:["water formula","chemical formula of water"],
en:"The chemical formula of water is H2O. Each molecule contains two hydrogen atoms and one oxygen atom.",
hi:"पानी का रासायनिक सूत्र H2O है। इसके एक अणु में दो हाइड्रोजन और एक ऑक्सीजन परमाणु होते हैं।"
},

{
keys:["gravity","what is gravity"],
en:"Gravity is the force of attraction between objects that have mass.",
hi:"गुरुत्वाकर्षण वह बल है जो द्रव्यमान वाली वस्तुओं को एक-दूसरे की ओर आकर्षित करता है।"
},

{
keys:["photosynthesis"],
en:"Photosynthesis is the process by which green plants use sunlight, water and carbon dioxide to make food.",
hi:"प्रकाश संश्लेषण वह प्रक्रिया है जिसमें हरे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड से भोजन बनाते हैं।"
},

{
keys:["human body","body systems"],
en:"The human body is made up of cells, tissues, organs and organ systems that work together.",
hi:"मानव शरीर कोशिकाओं, ऊतकों, अंगों और अंग-तंत्रों से बना है जो मिलकर काम करते हैं।"
},

{
keys:["heart","human heart"],
en:"The heart is a muscular organ that pumps blood throughout the body.",
hi:"हृदय एक मांसपेशीय अंग है जो पूरे शरीर में रक्त पंप करता है।"
},

{
keys:["brain","human brain"],
en:"The brain is the main control centre of the nervous system. It helps us think, learn and remember.",
hi:"मस्तिष्क तंत्रिका तंत्र का मुख्य नियंत्रण केंद्र है। यह सोचने, सीखने और याद रखने में मदद करता है।"
},

{
keys:["oxygen"],
en:"Oxygen is a chemical element with the symbol O. It is essential for human respiration.",
hi:"ऑक्सीजन का रासायनिक प्रतीक O है। यह मनुष्य के श्वसन के लिए आवश्यक है।"
},

{
keys:["carbon dioxide"],
en:"Carbon dioxide is a gas with the chemical formula CO2. Plants use it during photosynthesis.",
hi:"कार्बन डाइऑक्साइड का रासायनिक सूत्र CO2 है। पौधे प्रकाश संश्लेषण में इसका उपयोग करते हैं।"
},

{
keys:["boiling point of water"],
en:"Pure water boils at 100 degrees Celsius at standard atmospheric pressure.",
hi:"सामान्य वायुमंडलीय दबाव पर शुद्ध पानी 100 डिग्री सेल्सियस पर उबलता है।"
},

{
keys:["freezing point of water"],
en:"Pure water freezes at 0 degrees Celsius at standard atmospheric pressure.",
hi:"सामान्य वायुमंडलीय दबाव पर शुद्ध पानी 0 डिग्री सेल्सियस पर जमता है।"
},

/* TECHNOLOGY */

{
keys:["what is android","android operating system"],
en:"Android is a mobile operating system developed by Google and based on the Linux kernel.",
hi:"Android एक मोबाइल ऑपरेटिंग सिस्टम है जिसे Google ने विकसित किया है।"
},

{
keys:["what is javascript","javascript"],
en:"JavaScript is a programming language commonly used to make websites interactive and build applications.",
hi:"JavaScript एक प्रोग्रामिंग भाषा है जिसका उपयोग वेबसाइट और एप्लिकेशन को इंटरैक्टिव बनाने में किया जाता है।"
},

{
keys:["what is html","html"],
en:"HTML stands for HyperText Markup Language. It provides the structure of web pages.",
hi:"HTML का पूरा नाम HyperText Markup Language है। यह वेब पेज का ढांचा तैयार करता है।"
},

{
keys:["what is css","css"],
en:"CSS stands for Cascading Style Sheets. It controls the appearance and layout of web pages.",
hi:"CSS का पूरा नाम Cascading Style Sheets है। यह वेबसाइट का डिजाइन और लेआउट नियंत्रित करता है।"
},

{
keys:["what is wifi","wi-fi"],
en:"Wi-Fi is a wireless networking technology that allows devices to connect to a local network.",
hi:"Wi-Fi एक वायरलेस नेटवर्क तकनीक है जिससे डिवाइस बिना तार के नेटवर्क से जुड़ते हैं।"
},

{
keys:["what is bluetooth","bluetooth"],
en:"Bluetooth is a short-range wireless technology used to exchange data between nearby devices.",
hi:"Bluetooth एक कम दूरी की वायरलेस तकनीक है जिसका उपयोग पास के डिवाइस के बीच डेटा भेजने में होता है।"
},

{
keys:["what is cpu","cpu"],
en:"CPU stands for Central Processing Unit. It executes instructions and performs calculations in a computer.",
hi:"CPU का पूरा नाम Central Processing Unit है। यह कंप्यूटर के निर्देशों को चलाता है और गणना करता है।"
},

{
keys:["what is ram","ram"],
en:"RAM stands for Random Access Memory. It temporarily stores data that a device is actively using.",
hi:"RAM का पूरा नाम Random Access Memory है। इसमें डिवाइस के वर्तमान काम का डेटा अस्थायी रूप से रहता है।"
},

{
keys:["what is rom","rom"],
en:"ROM stands for Read Only Memory. It stores information that is designed to remain available without regular power.",
hi:"ROM का पूरा नाम Read Only Memory है। इसमें ऐसी जानकारी रखी जाती है जो सामान्यतः स्थायी रहती है।"
},

{
keys:["what is software","software"],
en:"Software is a collection of programs and instructions that tell a computer what to do.",
hi:"सॉफ्टवेयर प्रोग्राम और निर्देशों का समूह है जो कंप्यूटर को काम करने के लिए बताता है।"
},

{
keys:["what is hardware","hardware"],
en:"Hardware refers to the physical parts of a computer, such as its screen, keyboard and processor.",
hi:"हार्डवेयर कंप्यूटर के भौतिक हिस्सों को कहते हैं, जैसे स्क्रीन, कीबोर्ड और प्रोसेसर।"
},

{
keys:["what is browser","web browser"],
en:"A web browser is an application used to access and view websites on the Internet.",
hi:"वेब ब्राउज़र एक एप्लिकेशन है जिसका उपयोग इंटरनेट पर वेबसाइट देखने के लिए होता है।"
},

{
keys:["what is cybersecurity","cyber security"],
en:"Cybersecurity is the practice of protecting computers, networks and data from digital threats.",
hi:"साइबर सुरक्षा कंप्यूटर, नेटवर्क और डेटा को डिजिटल खतरों से बचाने की प्रक्रिया है।"
},

{
keys:["what is robot","robotics"],
en:"A robot is a programmable machine that can perform tasks automatically or with human guidance.",
hi:"रोबोट एक प्रोग्राम की गई मशीन है जो अपने आप या इंसानी निर्देशों से काम कर सकती है।"
},

/* FINANCE */

{
keys:["what is money","money"],
en:"Money is a medium of exchange used to buy goods and services and measure value.",
hi:"पैसा वस्तुओं और सेवाओं को खरीदने तथा उनके मूल्य को मापने का माध्यम है।"
},

{
keys:["what is bank","bank"],
en:"A bank is a financial institution that accepts deposits, provides loans and offers payment services.",
hi:"बैंक एक वित्तीय संस्था है जो जमा स्वीकार करती है, ऋण देती है और भुगतान सेवाएं प्रदान करती है।"
},

{
keys:["what is saving","savings"],
en:"Saving means keeping part of your income for future needs instead of spending all of it.",
hi:"बचत का मतलब अपनी आय का कुछ हिस्सा भविष्य की जरूरतों के लिए सुरक्षित रखना है।"
},

{
keys:["what is investment","investing"],
en:"Investment means putting money into assets with the aim of growing its value over time. Returns are not guaranteed.",
hi:"निवेश का अर्थ पैसे को ऐसी संपत्तियों में लगाना है जिनसे समय के साथ मूल्य बढ़ सकता है। लाभ की गारंटी नहीं होती।"
},

{
keys:["what is stock market","stock market"],
en:"The stock market is a marketplace where shares of companies and other financial securities are bought and sold.",
hi:"शेयर बाजार वह जगह है जहां कंपनियों के शेयर और अन्य वित्तीय साधन खरीदे और बेचे जाते हैं।"
},

{
keys:["what is share","shares"],
en:"A share represents a unit of ownership in a company.",
hi:"शेयर किसी कंपनी में स्वामित्व की एक छोटी इकाई को दर्शाता है।"
},

{
keys:["what is sip","systematic investment plan"],
en:"SIP stands for Systematic Investment Plan. It allows investors to invest a fixed amount regularly in a mutual fund.",
hi:"SIP का पूरा नाम Systematic Investment Plan है। इसमें निवेशक नियमित रूप से म्यूचुअल फंड में एक निश्चित राशि लगाते हैं।"
},

{
keys:["what is mutual fund","mutual funds"],
en:"A mutual fund pools money from multiple investors and invests it in assets such as stocks and bonds.",
hi:"म्यूचुअल फंड कई निवेशकों का पैसा इकट्ठा करके शेयर और बॉन्ड जैसी संपत्तियों में निवेश करता है।"
},

{
keys:["what is inflation","inflation"],
en:"Inflation is the general increase in prices over time, which reduces the purchasing power of money.",
hi:"महंगाई समय के साथ वस्तुओं और सेवाओं की कीमतों में सामान्य वृद्धि है। इससे पैसे की खरीदने की क्षमता घटती है।"
},

{
keys:["what is trading","trading"],
en:"Trading means buying and selling financial assets. It involves risk and prices can move in either direction.",
hi:"ट्रेडिंग का मतलब वित्तीय संपत्तियों को खरीदना और बेचना है। इसमें जोखिम होता है और कीमतें ऊपर या नीचे जा सकती हैं।"
},

{
keys:["what is forex","forex trading"],
en:"Forex is the foreign exchange market where currencies are exchanged. Currency trading carries significant risk.",
hi:"Forex वह बाजार है जहां अलग-अलग देशों की मुद्राओं का आदान-प्रदान होता है। इसमें काफी जोखिम हो सकता है।"
},

{
keys:["what is gold","gold"],
en:"Gold is a chemical element with the symbol Au. It is used in jewellery, electronics and as an investment asset.",
hi:"सोना एक रासायनिक तत्व है जिसका प्रतीक Au है। इसका उपयोग आभूषण, इलेक्ट्रॉनिक्स और निवेश में होता है।"
},

/* EDUCATION */

{
keys:["what is mathematics","maths"],
en:"Mathematics is the study of numbers, quantities, shapes, patterns and logical relationships.",
hi:"गणित संख्याओं, मात्राओं, आकृतियों, पैटर्न और तार्किक संबंधों का अध्ययन है।"
},

{
keys:["what is physics","physics"],
en:"Physics is the branch of science that studies matter, energy, motion and their interactions.",
hi:"भौतिक विज्ञान पदार्थ, ऊर्जा, गति और उनके आपसी संबंधों का अध्ययन करता है।"
},

{
keys:["what is chemistry","chemistry"],
en:"Chemistry is the branch of science that studies matter, its properties and how substances change.",
hi:"रसायन विज्ञान पदार्थ, उसके गुणों और पदार्थों में होने वाले परिवर्तनों का अध्ययन है।"
},

{
keys:["what is biology","biology"],
en:"Biology is the scientific study of living organisms.",
hi:"जीव विज्ञान जीवित प्राणियों का वैज्ञानिक अध्ययन है।"
},

{
keys:["what is history","history"],
en:"History is the study of past events, people and societies.",
hi:"इतिहास अतीत की घटनाओं, लोगों और समाजों का अध्ययन है।"
},

{
keys:["what is geography","geography"],
en:"Geography is the study of Earth's places, environments and the relationship between people and their surroundings.",
hi:"भूगोल पृथ्वी के स्थानों, पर्यावरण और मनुष्यों तथा उनके परिवेश के संबंधों का अध्ययन है।"
},

{
keys:["what is democracy","democracy"],
en:"Democracy is a system of government in which people have the power to choose their representatives.",
hi:"लोकतंत्र शासन की ऐसी व्यवस्था है जिसमें लोगों को अपने प्रतिनिधि चुनने का अधिकार होता है।"
},

{
keys:["what is constitution","constitution"],
en:"A constitution is the fundamental set of principles and laws according to which a country is governed.",
hi:"संविधान उन मूल सिद्धांतों और कानूनों का समूह है जिनके अनुसार देश का शासन चलता है।"
},

{
keys:["what is education","education"],
en:"Education is the process of gaining knowledge, skills, values and understanding.",
hi:"शिक्षा ज्ञान, कौशल, मूल्यों और समझ को प्राप्त करने की प्रक्रिया है।"
},

{
keys:["what is english grammar","grammar"],
en:"Grammar is the set of rules that explains how words are arranged to form meaningful sentences.",
hi:"व्याकरण उन नियमों का समूह है जो बताते हैं कि शब्दों को सही वाक्य में कैसे व्यवस्थित किया जाता है।"
},

/* SPACE */

{
keys:["what is galaxy","galaxy"],
en:"A galaxy is a huge collection of stars, gas, dust and dark matter held together by gravity.",
hi:"आकाशगंगा तारों, गैस, धूल और डार्क मैटर का विशाल समूह है जो गुरुत्वाकर्षण से जुड़ा होता है।"
},

{
keys:["what is black hole","black hole"],
en:"A black hole is a region of space where gravity is so strong that nothing, not even light, can escape from within its event horizon.",
hi:"ब्लैक होल अंतरिक्ष का ऐसा क्षेत्र है जहां गुरुत्वाकर्षण इतना शक्तिशाली होता है कि घटना क्षितिज के अंदर से प्रकाश भी बाहर नहीं निकल सकता।"
},

{
keys:["what is astronaut","astronaut"],
en:"An astronaut is a person trained to travel and work in space.",
hi:"अंतरिक्ष यात्री वह व्यक्ति होता है जिसे अंतरिक्ष में यात्रा और काम करने के लिए प्रशिक्षित किया जाता है।"
},

{
keys:["what is nasa","nasa"],
en:"NASA is the United States government agency responsible for civilian space exploration and aeronautics research.",
hi:"NASA अमेरिका की सरकारी संस्था है जो अंतरिक्ष अनुसंधान और एयरोनॉटिक्स पर काम करती है।"
},

{
keys:["what is satellite","satellite"],
en:"A satellite is an object that orbits a planet or another larger object. Satellites can be natural or artificial.",
hi:"उपग्रह वह वस्तु है जो किसी ग्रह या बड़े पिंड की परिक्रमा करती है। उपग्रह प्राकृतिक या कृत्रिम हो सकते हैं।"
},

/* EVERYDAY KNOWLEDGE */

{
keys:["what is time","time meaning"],
en:"Time is the continuous progression of events from the past through the present into the future.",
hi:"समय घटनाओं के अतीत से वर्तमान और भविष्य की ओर बढ़ने का क्रम है।"
},

{
keys:["what is energy","energy"],
en:"Energy is the ability to do work or cause change.",
hi:"ऊर्जा काम करने या परिवर्तन लाने की क्षमता है।"
},

{
keys:["what is electricity","electricity"],
en:"Electricity is associated with the presence and movement of electric charges.",
hi:"बिजली विद्युत आवेशों की उपस्थिति और गति से संबंधित ऊर्जा का रूप है।"
},

{
keys:["what is temperature","temperature"],
en:"Temperature is a measure of how hot or cold something is.",
hi:"तापमान यह मापता है कि कोई वस्तु कितनी गर्म या ठंडी है।"
},

{
keys:["what is environment","environment"],
en:"The environment includes the living and non-living things that surround us.",
hi:"पर्यावरण में हमारे आसपास की सभी सजीव और निर्जीव चीजें शामिल होती हैं।"
},

{
keys:["what is pollution","pollution"],
en:"Pollution is the introduction of harmful substances or energy into the environment.",
hi:"प्रदूषण पर्यावरण में हानिकारक पदार्थों या ऊर्जा के प्रवेश को कहते हैं।"
},

{
keys:["what is renewable energy","renewable energy"],
en:"Renewable energy comes from sources that naturally replenish, such as sunlight, wind and flowing water.",
hi:"नवीकरणीय ऊर्जा ऐसे स्रोतों से आती है जो प्राकृतिक रूप से दोबारा उपलब्ध होते हैं, जैसे सूर्य, हवा और बहता पानी।"
}

];

/* =====================================
   KNOWLEDGE MATCHING ENGINE
===================================== */

function findKnowledge(question) {

    var q = normalize(question);

    /* Remove common question phrases */

    var cleaned = q
        .replace(/^(what is|what are|who is|who are|tell me about|explain|define|describe|can you explain|please explain)\s+/i, "")
        .replace(/^(kya hai|kaun hai|batao|samjhao)\s+/i, "")
        .replace(/[?]/g, "")
        .trim();

    var best = null;
    var bestScore = 0;

    for (var i = 0; i < knowledge.length; i++) {

        var item = knowledge[i];

        for (var j = 0; j < item.keys.length; j++) {

            var key = item.keys[j].toLowerCase();

            var score = 0;

            if (q === key || cleaned === key) {
                score = 100;
            } else if (q.indexOf(key) !== -1) {
                score = key.length + 10;
            } else if (key.indexOf(cleaned) !== -1 &&
                       cleaned.length >= 4) {
                score = cleaned.length;
            }

            if (score > bestScore) {
                bestScore = score;
                best = item;
            }
        }
    }

    return best;
}

/* BILINGUAL ANSWERS */

function formatAnswer(item) {

    if (SETTINGS.language === "english") {
        return item.en;
    }

    if (SETTINGS.language === "hindi") {
        return item.hi;
    }

    return item.en + "\n\nHindi: " + item.hi;
}

/* =====================================
   ONLINE FALLBACK
===================================== */

function onlineSearch(question) {

    reply(
        "I do not have this information in my offline knowledge database. I am opening an online search for you."
    );

    openUrl(
        "https://www.google.com/search?q=" +
        encodeURIComponent(question)
    );
}

/* =====================================
   MAIN COMMAND ENGINE
===================================== */

function handle(raw) {

    var original = String(raw || "").trim();

    if (!original) return;

    var s = normalize(original);
    var shown = displayText(original, s);

    addMessage(shown, "user");
    saveHistory();

    input.value = "";

    var match;

    /* STOP SPEAKING */

    if ([
        "stop speaking",
        "stop voice",
        "chup",
        "awaaz band",
        "voice band"
    ].indexOf(s) !== -1) {

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        lastAnswer = "Voice stopped.";

        addMessage(lastAnswer, "bot");
        saveHistory();

        setStatus("VOICE STOPPED");
        return;
    }

    /* REPEAT */

    if (s === "repeat" || s === "repeat answer") {

        if (lastAnswer) {
            speak(lastAnswer);
        } else {
            reply("There is no previous answer to repeat.");
        }

        return;
    }

    /* GREETING */

    if (/^(hi|hello|hey|namaste|namaskar|hello ekha|hi ekha)$/.test(s)) {

        reply(
            "Hello. I am EKHA, your personal AI assistant. How can I help you today?\n\nनमस्ते। मैं EKHA हूं। बताइए, मैं आपकी क्या मदद कर सकती हूं?"
        );

        return;
    }

    /* HELP */

    if (s === "help" || s === "commands") {

        reply(
            "EKHA COMMANDS:\n\n" +
            "Time - Current time\n" +
            "Date - Today's date\n" +
            "Open YouTube - Open YouTube\n" +
            "Open Google - Open Google\n" +
            "Search [topic] - Search online\n" +
            "Note [text] - Save a note\n" +
            "Remind me in 10 minutes to [task]\n" +
            "Reminder off - Cancel reminders\n" +
            "Repeat answer - Repeat last response\n" +
            "Stop speaking - Stop voice"
        );

        return;
    }

    /* TIME */

    if (s === "time" ||
        /\b(time|samay|kitne baje)\b/.test(s)) {

        reply(
            "The current time is " +
            new Date().toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit"
            })
        );

        return;
    }

    /* DATE */

    if (s === "date" ||
        /\b(date|today|tarikh)\b/.test(s)) {

        reply(
            "Today's date is " +
            new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            })
        );

        return;
    }

    /* YOUTUBE */

    if (/^(youtube|yt|open youtube|youtube kholo|youtube khol do)$/.test(s)) {

        reply("Opening YouTube.");

        openUrl("https://m.youtube.com");

        return;
    }

    /* GOOGLE */

    if (/^(google|open google|google kholo|google khol do)$/.test(s)) {

        reply("Opening Google.");

        openUrl("https://www.google.com");

        return;
    }

    /* SEARCH */

    match = s.match(/^(search|google)\s+(.+)/);

    if (match) {

        reply("Searching Google.");

        openUrl(
            "https://www.google.com/search?q=" +
            encodeURIComponent(match[2])
        );

        return;
    }

    /* OPEN WEBSITE */

    match = s.match(/^(open|khol|kholo)\s+(.+)/);

    if (match) {

        var site = match[2].replace(/\s+/g, "");

        if (site.indexOf(".") === -1) {
            site += ".com";
        }

        if (!/^https?:\/\//i.test(site)) {
            site = "https://" + site;
        }

        reply("Opening website.");

        openUrl(site);

        return;
    }

    /* WEATHER */

    if (/\b(weather|mausam)\b/.test(s)) {

        reply("Opening weather search.");

        openUrl(
            "https://www.google.com/search?q=" +
            encodeURIComponent(s + " weather")
        );

        return;
    }

    /* NOTES */

    var noteMatch = original.match(
        /^(note:|save note |note )(.+)/i
    );

    if (noteMatch) {

        notes.unshift({
            text: noteMatch[2].trim(),
            at: new Date().toLocaleString()
        });

        localStorage.setItem(
            "ekha_notes",
            JSON.stringify(notes)
        );

        reply("Your note has been saved.");

        return;
    }

    /* CANCEL REMINDERS */

    if ([
        "reminder off",
        "reminders off",
        "turn off reminders",
        "stop reminders",
        "cancel reminders",
        "delete all reminders",
        "clear reminders",
        "reminder band",
        "reminders band",
        "saare reminder band karo",
        "sab reminders hatao"
    ].indexOf(s) !== -1) {

        reminders = [];

        localStorage.setItem(
            "ekha_reminders",
            JSON.stringify(reminders)
        );

        reply("All reminders have been cancelled.");

        if (panel && !panel.classList.contains("hidden")) {
            showPanel("reminders");
        }

        return;
    }

    /* CREATE REMINDER */

    match = s.match(
        /(?:remind me in|reminder in)\s+(\d+)\s+(minute|minutes|min|hour|hours|hr)\s+to\s+(.+)/
    );

    if (match) {

        var amount = Number(match[1]);

        var mins = /hour|hr/.test(match[2])
            ? amount * 60 : amount;

        reminders.push({
            text: match[3],
            at: Date.now() + mins * 60000
        });

        localStorage.setItem(
            "ekha_reminders",
            JSON.stringify(reminders)
        );

        reply(
            "Reminder saved successfully. Keep EKHA open until the reminder time."
        );

        return;
    }

    /* CALCULATOR */

    if (/^[0-9+\-*/().% x÷]+$/i.test(original)) {

        try {

            var expression = original
                .replace(/x/gi, "*")
                .replace(/÷/g, "/");

            if (/^[0-9+\-*/().%\s]+$/.test(expression)) {

                var result = Function(
                    '"use strict"; return (' + expression + ')'
                )();

                if (typeof result === "number" &&
                    isFinite(result)) {

                    reply("The result is " + result);

                    return;
                }
            }

        } catch (e) {}
    }

    /* =================================
       OFFLINE KNOWLEDGE SEARCH
    ================================= */

    var found = findKnowledge(original);

    if (found) {

        setStatus("OFFLINE KNOWLEDGE FOUND");

        reply(formatAnswer(found));

        return;
    }

    /* =================================
       ONLINE HYBRID FALLBACK
    ================================= */

    if (SETTINGS.onlineFallback) {

        onlineSearch(original);

        return;
    }

    /* DEFAULT */

    reply(
        "I do not know the answer yet. My knowledge database needs an update."
    );
}

/* =====================================
   TEXT INPUT
===================================== */

composer.addEventListener("submit", function (e) {

    e.preventDefault();

    handle(input.value);
});

/* QUICK BUTTONS */

Array.prototype.forEach.call(
    document.querySelectorAll("[data-cmd]"),
    function (btn) {

        btn.addEventListener("click", function () {

            handle(btn.getAttribute("data-cmd"));

        });

    }
);

/* CLEAR CHAT */

if (clearBtn) {

    clearBtn.addEventListener("click", function () {

        chat.innerHTML = "";

        localStorage.removeItem("ekha_history");

        lastAnswer = "";

        reply("Chat cleared.");

    });

}

/* =====================================
   SPEECH RECOGNITION
===================================== */

function startRecognition() {

    var API = window.SpeechRecognition ||
              window.webkitSpeechRecognition;

    if (!API) {

        reply(
            "Voice recognition is not supported in this browser. Please try Chrome."
        );

        return;
    }

    if (isListening) return;

    recognition = new API();

    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = function () {

        isListening = true;

        setStatus("LISTENING... SPEAK NOW");

        if (core) {
            core.classList.add("listening");
        }

    };

    recognition.onresult = function (event) {

        var result =
            event.results[event.results.length - 1];

        var transcript = result[0].transcript || "";

        if (transcript.trim()) {

            setStatus("VOICE COMMAND RECEIVED");

            handle(transcript);

        } else {

            reply(
                "I could not hear you clearly. Please try again."
            );

        }

    };

    recognition.onerror = function (event) {

        isListening = false;

        if (core) {
            core.classList.remove("listening");
        }

        var code = event.error || "unknown";

        setStatus("MIC ERROR: " + code);

        var errors = {

            "not-allowed":
                "Microphone permission is blocked. Allow microphone access in Chrome settings.",

            "service-not-allowed":
                "Speech service is blocked.",

            "audio-capture":
                "Microphone was not detected.",

            "no-speech":
                "No speech detected. Please try again.",

            "network":
                "Check your internet connection.",

            "language-not-supported":
                "Hindi speech recognition is unavailable.",

            "aborted":
                "Listening stopped."

        };

        if (code !== "aborted") {

            reply(
                errors[code] ||
                "Microphone error: " + code
            );

        }

    };

    recognition.onend = function () {

        isListening = false;

        if (core) {
            core.classList.remove("listening");
        }

        if (statusEl.textContent.indexOf("MIC ERROR:") !== 0) {

            setStatus("SYSTEM ONLINE · HYBRID MODE");

        }

    };

    try {

        recognition.start();

    } catch (e) {

        isListening = false;

        setStatus("MIC START FAILED");

    }

}

micBtn.addEventListener("click", function () {

    if (isListening && recognition) {

        recognition.stop();

        return;

    }

    startRecognition();

});

/* =====================================
   PANELS
===================================== */

Array.prototype.forEach.call(
    document.querySelectorAll("[data-panel]"),
    function (btn) {

        btn.addEventListener("click", function () {

            showPanel(btn.getAttribute("data-panel"));

        });

    }
);

var closePanel = document.getElementById("closePanel");

if (closePanel) {

    closePanel.addEventListener("click", function () {

        if (panel) {
            panel.classList.add("hidden");
        }

    });

}

/* PANEL DISPLAY */

function showPanel(which) {

    if (!panel || !panelBody) return;

    panel.classList.remove("hidden");

    panelBody.innerHTML = "";

    var title = document.getElementById("panelTitle");

    if (title) {
        title.textContent = which.toUpperCase();
    }

    /* NOTES */

    if (which === "notes") {

        var area = document.createElement("textarea");

        area.placeholder = "Write a note...";

        var save = document.createElement("button");

        save.className = "action";
        save.textContent = "SAVE NOTE";

        save.onclick = function () {

            if (!area.value.trim()) return;

            notes.unshift({
                text: area.value.trim(),
                at: new Date().toLocaleString()
            });

            localStorage.setItem(
                "ekha_notes",
                JSON.stringify(notes)
            );

            showPanel("notes");

        };

        panelBody.appendChild(area);
        panelBody.appendChild(save);

        notes.forEach(function (n) {

            var item = document.createElement("div");

            item.className = "note-item";

            item.textContent =
                n.at + " · " + n.text;

            panelBody.appendChild(item);

        });

    }

    /* REMINDERS */

    else if (which === "reminders") {

        var info = document.createElement("p");

        info.textContent =
            "Example: remind me in 10 minutes to drink water";

        panelBody.appendChild(info);

        var clear = document.createElement("button");

        clear.className = "action";

        clear.textContent =
            "TURN OFF / CLEAR ALL REMINDERS";

        clear.onclick = function () {

            reminders = [];

            localStorage.setItem(
                "ekha_reminders",
                JSON.stringify(reminders)
            );

            showPanel("reminders");

            reply("All reminders have been cancelled.");

        };

        panelBody.appendChild(clear);

        if (!reminders.length) {

            var empty = document.createElement("p");

            empty.textContent = "No active reminders.";

            panelBody.appendChild(empty);

        }

        reminders.forEach(function (r) {

            var item = document.createElement("div");

            item.className = "note-item";

            item.textContent =
                new Date(r.at).toLocaleString() +
                " · " + r.text;

            panelBody.appendChild(item);

        });

    }

    /* SYSTEM PANEL */

    else {

        var desc = document.createElement("p");

        desc.textContent =
            "EKHA Hybrid Brain: Offline knowledge database with online Google search fallback. Voice recognition requires browser support, microphone permission and internet.";

        panelBody.appendChild(desc);

        var stop = document.createElement("button");

        stop.className = "action";

        stop.textContent = "STOP SPEAKING";

        stop.onclick = function () {

            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }

            setStatus("VOICE STOPPED");

        };

        panelBody.appendChild(stop);

    }

}

/* =====================================
   REMINDER CHECKER
===================================== */

function checkReminders() {

    var now = Date.now();

    var remaining = [];

    reminders.forEach(function (r) {

        if (Number(r.at) <= now) {

            reply("Reminder: " + r.text);

            if ("Notification" in window &&
                Notification.permission === "granted") {

                try {

                    new Notification("EKHA Reminder", {
                        body: r.text
                    });

                } catch (e) {}

            }

        } else {

            remaining.push(r);

        }

    });

    reminders = remaining;

    localStorage.setItem(
        "ekha_reminders",
        JSON.stringify(reminders)
    );

}

window.setInterval(checkReminders, 15000);

/* =====================================
   RESTORE CHAT HISTORY
===================================== */

try {

    var history = JSON.parse(
        localStorage.getItem("ekha_history") || "[]"
    );

    if (Array.isArray(history) && history.length) {

        chat.innerHTML = "";

        history.forEach(function (item) {

            if (item && typeof item.text === "string") {

                addMessage(
                    item.text,
                    item.who === "user" ? "user" : "bot"
                );

            }

        });

    }

} catch (e) {}

/* =====================================
   INITIALIZE EKHA
===================================== */

setStatus("SYSTEM ONLINE · HYBRID MODE");

console.log("EKHA Hybrid Knowledge Brain 1.0 loaded.");

console.log(
    "Offline knowledge topics: " + knowledge.length
);

})();
