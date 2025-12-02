export function removeArrayElements(mainArray, elementsToRemove) {
  // console.log(elementsToRemove);
  return mainArray.filter((item) => !elementsToRemove.includes(item));
}

export function dynamicDirection(ele) {
  if (ele.target.value === "") {
    ele.target.style.direction = "ltr";
    ele.target.style.textAlign = "left";
    return;
  }
  const firstChar = ele.target.value.trim().charAt(0);
  const targetElement = ele.target;
  if (/[\u0600-\u06FF]/.test(firstChar)) {
    targetElement.style.direction = "rtl";
    targetElement.style.textAlign = "right";
  } else {
    targetElement.style.direction = "ltr";
    targetElement.style.textAlign = "left";
  }
}

export function getElementByTextContent(text) {
  const elements = document.querySelectorAll("*"); // Select all elements
  return Array.from(elements).find((el) => el.textContent.trim() === text);
}

export function generateArabicNumberDuplicates(keywords) {
  const englishToArabic = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };

  const containsArabicLetters = (str) => /[\u0600-\u06FF]/.test(str);
  const containsEnglishNumbers = (str) => /[0-9]/.test(str);

  const convertToArabicNumbers = (str) =>
    str.replace(/[0-9]/g, (n) => englishToArabic[n]);

  const result = new Set();

  keywords.forEach((keyword) => {
    result.add(keyword);

    // شرطك: لازم يكون فيها أرقام إنجليزية + حروف عربية
    if (containsEnglishNumbers(keyword) && containsArabicLetters(keyword)) {
      result.add(convertToArabicNumbers(keyword));
    }
  });

  return Array.from(result);
}

export function generateCpuKeywords(cpuName) {
  cpuName = cpuName.replace(/®|™/g, "").replace(/\s+/g, " ").trim();

  const suffixMap = {
    U: "يو",
    F: "اف",
    G: "جي",
    K: "كي",
    H: "اتش",
    HS: "اتش اس",
    HX: "اتش اكس",
    X: "اكس",
    P: "بي",
  };

  // استخراج معلومات المعالج
  const info = parseCpuInfo(cpuName);

  // مجموعة الكلمات النهائية
  const keywords = new Set();

  // 1. الصيغة الرسمية الكاملة
  keywords.add(cpuName.toLowerCase());

  // 2. أنماط البحث الشائعة
  addCommonSearchPatterns(keywords, info, suffixMap);

  // 3. أخطاء إملائية شائعة
  addCommonTypos(keywords, info);

  // 4. اختصارات طبيعية
  addNaturalAbbreviations(keywords, info, suffixMap);

  return Array.from(keywords).filter(Boolean);
}

// استخراج معلومات المعالج
function parseCpuInfo(cpuName) {
  const info = {
    brand: "",
    series: "",
    model: "",
    suffix: "",
    generation: "",
  };

  // تحديد Intel أو AMD أو Qualcomm أو MediaTek
  if (/intel|core/i.test(cpuName)) {
    info.brand = "intel";

    // السلسلة (i3, i5, i7, i9, Ultra, Pentium)
    const seriesMatch = cpuName.match(/(core\s*ultra|i[3579]|pentium|xeon)/i);
    info.series = seriesMatch
      ? seriesMatch[0].toLowerCase().replace(/\s+/g, " ")
      : "";
  } else if (/amd|ryzen/i.test(cpuName)) {
    info.brand = "amd";

    // السلسلة (Ryzen 3, 5, 7, 9)
    const seriesMatch = cpuName.match(/ryzen\s*[3579]/i);
    info.series = seriesMatch ? seriesMatch[0].toLowerCase() : "";
  } else if (/qualcomm|snapdragon/i.test(cpuName)) {
    info.brand = "qualcomm";

    // السلسلة (Snapdragon)
    const seriesMatch = cpuName.match(/snapdragon/i);
    info.series = seriesMatch ? seriesMatch[0].toLowerCase() : "snapdragon";
  } else if (/mediatek|dimensity|helio/i.test(cpuName)) {
    info.brand = "mediatek";

    // السلسلة (Dimensity أو Helio)
    const seriesMatch = cpuName.match(/(dimensity|helio)/i);
    info.series = seriesMatch ? seriesMatch[0].toLowerCase() : "";
  }

  // رقم الموديل
  let modelMatch;
  if (info.brand === "qualcomm") {
    // Snapdragon: "8 Gen 3" أو "7+ Gen 2" أو "888" أو "870"
    modelMatch = cpuName.match(/(\d+\+?\s*gen\s*\d+|\d{3,4}[a-z]*)/i);
  } else if (info.brand === "mediatek") {
    // MediaTek: "9200" أو "G99" أو "P90"
    modelMatch = cpuName.match(/([a-z]\d{2,4}|\d{3,4})/i);
  } else {
    // Intel/AMD: أرقام عادية
    modelMatch = cpuName.match(/(\d{3,5})/);
  }
  info.model = modelMatch ? modelMatch[1] : "";

  // الجيل (أول رقم من الموديل - فقط Intel/AMD)
  if (info.brand === "intel" || info.brand === "amd") {
    info.generation = info.model ? info.model[0] : "";
  }

  // اللاحقة
  const suffixMatch = cpuName.match(/(\d{3,5})([A-Z]{1,2})\b/i);
  info.suffix = suffixMatch ? suffixMatch[2].toUpperCase() : "";

  return info;
}

// إضافة أنماط البحث الشائعة
function addCommonSearchPatterns(keywords, info, suffixMap) {
  const { brand, series, model, suffix } = info;

  if (!model) return;

  // Intel patterns
  if (brand === "intel") {
    // i5 1235u
    keywords.add(`${series} ${model}${suffix}`.toLowerCase());
    keywords.add(`${series} ${model} ${suffix}`.toLowerCase());

    // انتل i5 1235u
    keywords.add(`انتل ${series} ${model}${suffix}`.toLowerCase());
    keywords.add(`انتل ${series} ${model} ${suffix}`.toLowerCase());

    // معالج i5 1235u
    keywords.add(`معالج ${series} ${model}${suffix}`.toLowerCase());

    // core i5 1235u
    keywords.add(`core ${series} ${model}${suffix}`.toLowerCase());

    // انتل كور i5
    keywords.add(`انتل كور ${series} ${model}${suffix}`.toLowerCase());

    // بروسيسور i5 1235u
    keywords.add(`بروسيسور ${series} ${model}${suffix}`.toLowerCase());

    // بدون لاحقة (كثير من الناس لا يكتبونها)
    keywords.add(`${series} ${model}`.toLowerCase());
    keywords.add(`انتل ${series} ${model}`.toLowerCase());
    keywords.add(`معالج ${series} ${model}`.toLowerCase());

    // مع اللاحقة بالعربي
    if (suffixMap[suffix]) {
      keywords.add(`${series} ${model} ${suffixMap[suffix]}`.toLowerCase());
      keywords.add(
        `انتل ${series} ${model} ${suffixMap[suffix]}`.toLowerCase()
      );
    }

    // الجيل (i5 gen 12)
    if (info.generation) {
      keywords.add(`${series} جيل ${info.generation}`.toLowerCase());
      keywords.add(`${series} generation ${info.generation}`.toLowerCase());
    }
  }

  // AMD patterns
  if (brand === "amd") {
    // ryzen 5 5500u
    keywords.add(`${series} ${model}${suffix}`.toLowerCase());
    keywords.add(`${series} ${model} ${suffix}`.toLowerCase());

    // amd ryzen 5 5500u
    keywords.add(`amd ${series} ${model}${suffix}`.toLowerCase());
    keywords.add(`amd ${series} ${model} ${suffix}`.toLowerCase());

    // رايزن 5 5500u
    keywords.add(
      `رايزن ${series
        .replace("ryzen", "")
        .trim()} ${model}${suffix}`.toLowerCase()
    );

    // معالج رايزن 5
    keywords.add(
      `معالج رايزن ${series
        .replace("ryzen", "")
        .trim()} ${model}${suffix}`.toLowerCase()
    );

    // ايه ام دي رايزن
    keywords.add(
      `ايه ام دي رايزن ${series
        .replace("ryzen", "")
        .trim()} ${model}${suffix}`.toLowerCase()
    );

    // بروسيسور amd
    keywords.add(`بروسيسور amd ${series} ${model}${suffix}`.toLowerCase());

    // بدون لاحقة
    keywords.add(`${series} ${model}`.toLowerCase());
    keywords.add(`amd ${series} ${model}`.toLowerCase());
    keywords.add(
      `رايزن ${series.replace("ryzen", "").trim()} ${model}`.toLowerCase()
    );

    // مع اللاحقة بالعربي
    if (suffixMap[suffix]) {
      keywords.add(
        `رايزن ${series.replace("ryzen", "").trim()} ${model} ${
          suffixMap[suffix]
        }`.toLowerCase()
      );
    }
  }

  // Qualcomm Snapdragon patterns
  if (brand === "qualcomm") {
    // snapdragon 8 gen 3
    keywords.add(`snapdragon ${model}`.toLowerCase());
    keywords.add(`${series} ${model}`.toLowerCase());

    // كوالكوم سناب دراجون
    keywords.add(`كوالكوم ${model}`.toLowerCase());
    keywords.add(`كوالكوم سناب دراجون ${model}`.toLowerCase());
    keywords.add(`سناب دراجون ${model}`.toLowerCase());
    keywords.add(`سنابدراجون ${model}`.toLowerCase());

    // معالج snapdragon
    keywords.add(`معالج snapdragon ${model}`.toLowerCase());
    keywords.add(`معالج سناب دراجون ${model}`.toLowerCase());
    keywords.add(`معالج كوالكوم ${model}`.toLowerCase());

    // qualcomm snapdragon
    keywords.add(`qualcomm snapdragon ${model}`.toLowerCase());
    keywords.add(`qualcomm ${model}`.toLowerCase());

    // بروسيسور snapdragon
    keywords.add(`بروسيسور snapdragon ${model}`.toLowerCase());
    keywords.add(`بروسيسور كوالكوم ${model}`.toLowerCase());

    // اختصارات شائعة (SD 8 Gen 3)
    const shortModel = model.replace(/\s+/g, "");
    keywords.add(`sd ${shortModel}`.toLowerCase());
    keywords.add(`sd${shortModel}`.toLowerCase());

    // إصدارات Gen بدون مسافات
    if (model.includes("gen")) {
      keywords.add(model.replace(/\s+/g, "").toLowerCase());
      keywords.add(`snapdragon${model.replace(/\s+/g, "")}`.toLowerCase());
    }
  }

  // MediaTek patterns
  if (brand === "mediatek") {
    const chipset = series; // dimensity أو helio

    // dimensity 9200
    keywords.add(`${chipset} ${model}`.toLowerCase());
    keywords.add(`mediatek ${chipset} ${model}`.toLowerCase());

    // ميدياتك ديمنسيتي
    if (chipset === "dimensity") {
      keywords.add(`ديمنسيتي ${model}`.toLowerCase());
      keywords.add(`ميدياتك ديمنسيتي ${model}`.toLowerCase());
      keywords.add(`mediatek dimensity ${model}`.toLowerCase());
      keywords.add(`معالج ديمنسيتي ${model}`.toLowerCase());
      keywords.add(`معالج dimensity ${model}`.toLowerCase());

      // اختصار شائع
      keywords.add(`d${model}`.toLowerCase());
    }

    // ميدياتك هيليو
    if (chipset === "helio") {
      keywords.add(`هيليو ${model}`.toLowerCase());
      keywords.add(`ميدياتك هيليو ${model}`.toLowerCase());
      keywords.add(`mediatek helio ${model}`.toLowerCase());
      keywords.add(`معالج هيليو ${model}`.toLowerCase());
      keywords.add(`معالج helio ${model}`.toLowerCase());
    }

    // معالج mediatek
    keywords.add(`معالج mediatek ${model}`.toLowerCase());
    keywords.add(`معالج ميدياتك ${model}`.toLowerCase());
    keywords.add(`بروسيسور mediatek ${model}`.toLowerCase());

    // بدون اسم السلسلة
    keywords.add(`mediatek ${model}`.toLowerCase());
    keywords.add(`ميدياتك ${model}`.toLowerCase());
  }
}

// إضافة أخطاء إملائية شائعة
function addCommonTypos(keywords, info) {
  const typos = new Set();

  keywords.forEach((kw) => {
    // أخطاء عربية شائعة - Intel/AMD
    typos.add(kw.replace(/انتل/g, "انتيل"));
    typos.add(kw.replace(/انتل/g, "أنتل"));
    typos.add(kw.replace(/بروسيسور/g, "بروسسور"));
    typos.add(kw.replace(/بروسيسور/g, "برسيسور"));
    typos.add(kw.replace(/معالج/g, "معالج"));
    typos.add(kw.replace(/رايزن/g, "رايزين"));
    typos.add(kw.replace(/رايزن/g, "ريزن"));
    typos.add(kw.replace(/ايه ام دي/g, "اي ام دي"));

    // أخطاء Qualcomm
    typos.add(kw.replace(/كوالكوم/g, "كوالكم"));
    typos.add(kw.replace(/كوالكوم/g, "كولكوم"));
    typos.add(kw.replace(/سناب دراجون/g, "سنابدراجون"));
    typos.add(kw.replace(/سناب دراجون/g, "سناب دراقون"));
    typos.add(kw.replace(/سناب دراجون/g, "snap dragon"));
    typos.add(kw.replace(/snapdragon/g, "snap dragon"));

    // أخطاء MediaTek
    typos.add(kw.replace(/ميدياتك/g, "ميدياتيك"));
    typos.add(kw.replace(/ميدياتك/g, "ميديا تك"));
    typos.add(kw.replace(/ديمنسيتي/g, "ديمينسيتي"));
    typos.add(kw.replace(/ديمنسيتي/g, "دايمنسيتي"));
    typos.add(kw.replace(/هيليو/g, "هليو"));
    typos.add(kw.replace(/mediatek/g, "media tek"));

    // نسيان المسافات
    if (kw.includes(" ")) {
      typos.add(kw.replace(/ /g, ""));
    }
  });

  typos.forEach((t) => keywords.add(t));
}

// إضافة اختصارات طبيعية
function addNaturalAbbreviations(keywords, info, suffixMap) {
  const { brand, series, model, suffix } = info;

  if (!model) return;

  // Intel
  if (brand === "intel") {
    // فقط رقم السلسلة: i5-1235u
    keywords.add(`${series}-${model}${suffix}`.toLowerCase());

    // بدون شرطة: i51235u
    keywords.add(`${series}${model}${suffix}`.toLowerCase());
  }

  // AMD
  if (brand === "amd") {
    // r5 5500u (اختصار شائع)
    const seriesNum = series.match(/\d/);
    if (seriesNum) {
      keywords.add(`r${seriesNum[0]} ${model}${suffix}`.toLowerCase());
      keywords.add(`r${seriesNum[0]}${model}${suffix}`.toLowerCase());
    }
  }

  // Qualcomm
  if (brand === "qualcomm") {
    // sd 8gen3 (اختصار شائع جداً)
    const shortModel = model.replace(/\s+/g, "");
    keywords.add(`sd${shortModel}`.toLowerCase());
    keywords.add(`sd ${model}`.toLowerCase());

    // 8gen3 فقط
    if (model.includes("gen")) {
      keywords.add(shortModel.toLowerCase());
    }
  }

  // MediaTek
  if (brand === "mediatek") {
    // mtk 9200 (اختصار MediaTek)
    keywords.add(`mtk ${model}`.toLowerCase());
    keywords.add(`mtk${model}`.toLowerCase());

    // اختصار dimensity: d9200
    if (series === "dimensity") {
      keywords.add(`d${model}`.toLowerCase());
      keywords.add(`d ${model}`.toLowerCase());
    }
  }
}

// ============= اختبار =============

// قائمة معالجات للاختبار
const testCpus = [
  // Intel
  "Intel Core i5-1235U", // Intel جيل 12
  "Intel Core i7-13700H", // Intel جيل 13
  "Intel Core i9-14900K", // Intel Gaming/Desktop
  "Intel Core Ultra 7 155H", // Intel الجيل الجديد

  // AMD
  "AMD Ryzen 5 5500U", // AMD Ryzen 5000
  "AMD Ryzen 7 7730U", // AMD Ryzen 7000
  "AMD Ryzen 9 7940HS", // AMD High Performance

  // Qualcomm Snapdragon
  "Qualcomm Snapdragon 8 Gen 3", // Snapdragon جيل 8
  "Snapdragon 888", // Snapdragon 800 series
  "Qualcomm Snapdragon 7+ Gen 2", // Snapdragon جيل 7+

  // MediaTek
  "MediaTek Dimensity 9200", // Dimensity Flagship
  "MediaTek Dimensity 8200", // Dimensity Mid-range
  "MediaTek Helio G99", // Helio Gaming
];

console.log("🔍 اختبار المعالجات المختلفة:\n");

testCpus.forEach((cpu) => {
  const keywords = generateCpuKeywords(cpu);
  console.log(`\n=== ${cpu} ===`);
  console.log(`📊 عدد الكلمات: ${keywords.length}`);
  console.log("🔑 أول 10 كلمات:");
  console.log(
    keywords
      .slice(0, 10)
      .map((k, i) => `  ${i + 1}. ${k}`)
      .join("\n")
  );
});

// تصدير الدالة
if (typeof module !== "undefined" && module.exports) {
  module.exports = generateCpuKeywords;
}
