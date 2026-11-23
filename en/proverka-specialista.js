
    const specialists = [
      {
        title: "Advocate", he: "עורך דין", icon: "⚖️", cat: "legal", mode: "official",
        status: "Official search", statusClass: "redirect",
        url: "https://www.israelbar.org.il/lawyer_list.asp",
        altUrl: "https://www.israelbar.org.il/english_lawyer_list.asp?menu=2",
        source: "Israel Bar Association / לשכת עורכי הדין",
        desc: "Checking a lawyer in the register of the Bar Association. Can be searched by name, license number, district and sometimes area of ​​practice.<br><br><b>Important:</b> in Israel, lawyers do NOT have a separate state license for a narrow specialization (like, for example, doctors). One general license - the right to practice law in general. A 'specialization' (real estate, family law, criminal law, labor law, etc.) is just the focus of a particular lawyer, not a separate verifiable certificate. The registry only confirms that the person is licensed as a lawyer at all - experience in your specific field must be clarified separately, directly with the lawyer.",
        can: ["check lawyer status", "find a lawyer by area/parameters", "check license number", "use the terms below to accurately name the required area to the lawyer on the first call (the official registry itself does not filter by narrow specialization)"],
        terms: [["שם", "Name"], ["מספר רישיון", "license number"], ["מחוז", "district/district"], ["דיני משפחה", "family law (divorce, custody, alimony)"], ["מקרקעין", "real estate"], ["דיני עבודה", "labor law"], ["פלילי", "criminal law"], ["ירושות וצוואות", "inheritance and wills"], ["ליטיגציה אזרחית ומסחרית", "civil/commercial disputes"]],
        keywords: "lawyer lawyer עורך דין עורכי דין israelbar"
      },
      {
        title: "Broker/realtor", he: "מתווך מקרקעין", icon: "🏠", cat: "realestate", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/metavhim",
        source: "Ministry of Justice / data.gov.il",
        desc: "Register of licensed brokers. Useful before signing an agreement for mediation when buying/renting real estate.",
        can: ["check the broker\'s license", "find by name", "search by city specified in the registry"],
        terms: [["מס רשיון", "license number"], ["שם המתווך", "broker name"], ["עיר מגורים", "city ​​of residence"]],
        keywords: "broker realtor broker real estate מתווך מקרקעין דירה"
      },
      {
        title: "Real Estate Appraiser", he: "שמאי מקרקעין", icon: "📐", cat: "realestate", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/shamaim",
        source: "Ministry of Justice / data.gov.il",
        desc: "Register of real estate appraisers. Useful when buying an apartment, arguing about value, taxes and checking bank valuations.",
        can: ["find an appraiser by city", "check license number", "check the name in the official register"],
        terms: [["שם שמאי", "appraiser name"], ["מספר רשיון", "license number"], ["עיר", "city"]],
        keywords: "real estate appraiser"
      },
      {
        title: "Notary", he: "נוטריון", icon: "🖋️", cat: "legal", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/notary",
        source: "Ministry of Justice / data.gov.il",
        desc: "Register of active notaries. Often needed for power of attorney, translation, certification of documents and apostille.",
        can: ["find a notary by city", "check activity", "see languages, if specified"],
        terms: [["שם", "Name"], ["ישוב", "populated area"], ["שפות", "languages"]],
        keywords: "notary נוטריון power of attorney translation apostille ייפוי כוח"
      },
      {
        title: "Accountant/CPA", he: "רואה חשבון", icon: "🧾", cat: "finance", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/cpalist",
        source: "Ministry of Justice / data.gov.il",
        desc: "Register of accountants. Be sure to look at the “status” field: a specialist may be on the list, but not actively engage in the profession.",
        can: ["find a CPA by city", "check license number", "check status"],
        terms: [["שם פרטי", "Name"], ["שם משפחה", "surname"], ["סטטוס", "status"]],
        keywords: "accountant CPA רואה חשבון tax report דוח שנתי"
      },
      {
        title: "Tax consultant", he: "יועץ מס", icon: "💼", cat: "finance", mode: "official",
        status: "Official website", statusClass: "redirect",
        url: "https://www.tac.gov.il/",
        source: "Мועצת יועצי המס בישראל",
        desc: "On the website of the Council of Tax Advisors, look for the section “חיפוש יועץ”. Suitable for checking/finding a tax consultant.",
        can: ["find a tax consultant", "check through the official website", "search by name or city, if available"],
        terms: [["חיפוש יועץ", "search for a consultant"], ["שם", "Name"], ["עיר", "city"]],
        keywords: "tax consultant יועץ מס taxes מס הכנסה מעמ"
      },
      {
        title: "Investment specialist", he: "יועץ / משווק / מנהל תיקים", icon: "📈", cat: "finance", mode: "official",
        status: "Official ISA Search", statusClass: "redirect",
        url: "https://www.investors.isa.gov.il/page/search-advisor",
        altUrl: "https://www.new.isa.gov.il/page/entities-search",
        source: "Israel Securities Authority / רשות ניירות ערך",
        desc: "Screening of investment advisors, marketers, portfolio managers and licensed companies. Before investing, be sure to check.",
        can: ["check the consultant\'s license", "find an ISA regulated company", "distinguish between a consultant and a marketer"],
        terms: [["יועץ השקעות", "investment consultant"], ["משווק השקעות", "investment marketer"], ["מנהל תיקים", "portfolio manager"]],
        keywords: "investments"
      },
      {
        title: "Pension consultant/agent/marketer", he: "יועץ פנסיוני / סוכן פנסיוני / משווק פנסיוני", icon: "🛡️", cat: "finance", mode: "official",
        status: "gov.il search", statusClass: "redirect",
        url: "https://www.gov.il/he/service/agents_and_consultants_search",
        source: "רשות שוק ההון, ביטוח וחיסכון / gov.il",
        desc: "Important: all three undergo the SAME training and the same exam from Rashut HaShuk HaHon (Capital Markets Authority) plus a six-month internship. But by law their POWERS ARE DIFFERENT - it is not about who 'understands better': for some this activity is outright prohibited by law, for others it is an obligation.<br><br><b>Pension consultant</b> (Hebrew: <span dir=\"rtl\" lang=\"he\">יועץ פנסיוני</span>, transcription: yoets pensioni) - independent, works and receives payment ONLY from the client, and not from companies (except for the “distribution commission” that is the same for everyone). Gives an objective recommendation on the entire market: any funds, any companies. <b>By law, he is PROHIBITED from completing the purchase of the product himself.</b> — only a recommendation, issued by the client himself or through an agent. There are about 1000 of them in the country, of which only about 100 are independent private ones (the rest are consultants in banks).<br><br><b>Pension/Insurance Agent</b> (Hebrew: <span dir=\"rtl\" lang=\"he\">סוכן ביטוח פנסיוני</span>, transcription: sokhen bituakh pensioni) - works under contracts with several companies, these companies pay him a commission. <b>It is the agent who actually issues the</b> purchasing/transferring a product is something a consultant should not do. <b>Important: an agent is PROHIBITED by law from calling himself a “consultant” or using the word “ייעוץ”</b> — which is why agents are often called “retirement planners” (this is what causes confusion, see table of unregulated titles above).<br><br><b>Pension Marketer</b> (Hebrew: <span dir=\"rtl\" lang=\"he\">משווק פנסיוני</span>, transcription: meshavek pensioni) - a full-time employee of one specific company (Menorah, Phoenix, Altshuler-Shaham, etc.), sells and processes only its products - the biggest conflict of interest of the three.<br><br><b>An important clarification that we have corrected:</b> the licenses of a consultant and an agent are MUTUALLY EXCLUSIVE; they cannot be held simultaneously (this directly follows from the fact that a consultant, by definition, is prohibited from any connection with companies, and an agent, by definition, works under contracts with them).<br><br><b>But about the moment of retirement (for example, you turned 67):</b> basic form - <span dir=\"rtl\" lang=\"he\">טופס 161</span> (tófes 161, notice of retirement) - required by law to be completed by your employer. But the most important decision here is the form. <span dir=\"rtl\" lang=\"he\">161ד</span> (tofes 161-dalet, statement of fixation of tax rights) is an IRREVERSIBLE decision on tax exemption, and it is dealt with <b>accountant (rohe heshbon) or authorized tax consultant (yoetz mas musmah)</b> is neither an employer nor a pension advisor/agent. Neither a consultant, nor an agent, nor a marketer has the right to represent you before the tax office or Bituach Leumi - only an accountant, tax consultant or lawyer does this.<br><br><b>Conclusion for you:</b> objective advice on “where to invest” - consultant. Physically open/change product - agent. Tax Forms for Retirement (161-dalet, fixation of tax rights) - an accountant or a tax consultant; this is a separate profession, not a pension license at all.",
        can: ["search by first/last name", "search by city", "find out the exact type of license: consultant, agent or marketer", "understand whether the specialist has permission to deal with pension products at all", "if you only need objective advice on the route, look for a consultant (you cannot hold an agent’s license at the same time)", "if you need to physically register a product/submit documents, look for an agent", "for Form 161-D and tax issues upon retirement - look for an accountant (rohe heshbon) or an authorized tax consultant (yoets mas musmah), this is a separate profession", "ask directly: what company do you work for and how do you receive compensation?"],
        terms: [["יועץ פנסיוני", "pension consultant - independent"], ["סוכן פנסיוני", "pension agent - represents the insurance company"], ["סוכן ביטוח", "insurance agent"], ["משווק פנסיוני", "pension marketer - only one employer company"], ["סוג רישיון", "license type"], ["זיקה", "financial interest/attachment"]],
        keywords: "pension consultant pension agent marketer pension פנסיוני"
      },
      {
        title: "Retirement planning/financial planner", he: "מתכנן פרישה / מתכנן פיננסי", icon: "🌅", cat: "finance", mode: "checklist",
        status: "The title is not licensed", statusClass: "warn",
        url: "#retirement-checklist",
        source: "Officially, such a profession/license does not exist in Israel.",
        desc: "It\'s important to understand: <b>“retirement planning” and “financial planner” are NOT government regulated titles.</b> The license “metakhnen parisha” simply does not exist - anyone can call themselves that, including an accountant, an insurance agent, or a person without a license at all.<br><br>Only the ACTION ITSELF is really regulated: in order to legally perform a pension operation (transfer savings, arrange a payment, etc.), you need ONE of the three licenses above (consultant/agent/marketer). Certifications like CFP/EFP are professional qualifications and not a state license.<br><br>Bottom line: a person can 'plan' everything perfectly on paper without any license - but only someone who actually holds the license can execute the plan.",
        can: ["ask directly: what state license do you have - consultant, agent or marketer?", "do not confuse the certificate/title (CFP, “financial planner”) with a state license", "if taxes are discussed, check separately with a CPA or tax consultant", "if investments are discussed, check the ISA license separately", "ask for a written disclosure of fees and conflicts of interest"],
        terms: [["תכנון פרישה", "retirement planning - not licensed"], ["יועץ פרישה", "retirement consultant - not licensed, sounds similar to the real license \"יועץ פנסיוני\""], ["מתכנן פיננסי", "financial planner - not licensed"], ["קיבוע זכויות", "fixation of tax rights"], ["מענק פרישה", "severance pay"], ["פטור ממס", "tax exemption"]],
        keywords: "retirement financial planner retirement financial planner מענק פרישה פטור ממס"
      },
      {
        title: "Patent attorney", he: "עורך פטנטים", icon: "💡", cat: "business", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/justice-patent-attorneys",
        source: "Ministry of Justice / רשות הפטנטים / data.gov.il",
        desc: "Register of patent attorneys. Useful for inventions, patents, trademarks and IP issues.",
        can: ["check license", "find by name", "see city/contacts, if indicated"],
        terms: [["מספר רישיון", "license number"], ["שם פרטי", "Name"], ["יישוב", "city"]],
        keywords: "patent attorney עורך פטנטים patent trademark IP"
      },
      {
        title: "Doctor/health worker", he: "רופא / מקצועות בריאות", icon: "🩺", cat: "business", mode: "official",
        status: "gov.il search", statusClass: "redirect",
        url: "https://www.gov.il/en/service/licensed-medical-practitioners",
        altUrl: "https://practitioners.health.gov.il/Practitioners",
        source: "Ministry of Health / gov.il",
        desc: "Screening of licensed physicians, dentists, pharmacists, psychologists and other health professions.",
        can: ["check license", "search by name", "search by profession/specialization"],
        terms: [["רופא", "doctor"], ["רישיון", "license"], ["התמחות", "specialization"]],
        keywords: "doctor רופא medicine license healthcare doctor psychologist pharmacist"
      },
      {
        title: "Company/supplier", he: "חברה", icon: "🏢", cat: "business", mode: "direct",
        status: "Open data", statusClass: "full",
        url: "https://data.gov.il/dataset/ica_companies",
        source: "Register of Companies / Ministry of Justice / data.gov.il",
        desc: "Checking the status of the company: whether it is active, number, address and other information from the register.",
        can: ["check the company before the contract", "check company number", "see status"],
        terms: [["מספר תאגיד", "company number"], ["שם תאגיד", "Name"], ["סטטוס", "status"]],
        keywords: "company supplier חברה רשם החברות ח.פ supplier"
      },
      {
        title: "Mortgage consultant", he: "יועץ משכנתאות", icon: "🏦", cat: "warning", mode: "checklist",
        status: "Checklist instead of registry", statusClass: "warn",
        url: "#mortgage-checklist",
        source: "There is no full-fledged public state register of licenses for quick verification",
        desc: "For mortgage consultants, the same stable state registry of licenses has not been found as for lawyers, CPAs or insurance agents. Use a checklist of questions.",
        can: ["check conflict of interest", "ask for a written contract", "ask if the consultant receives a commission from the bank"],
        terms: [["עמלה", "commission"], ["הסכם", "agreement"], ["ניגוד עניינים", "conflict of interest"]],
        keywords: "mortgage consultant"
      }
    ];

    const dictionary = [
      ["חיפוש", "search"], ["שם", "name/title"], ["שם פרטי", "Name"], ["שם משפחה", "surname"],
      ["מספר רישיון", "license number"], ["מס רשיון", "license number"], ["עיר", "city"], ["יישוב / ישוב", "populated area"],
      ["עיר מגורים", "city ​​of residence"], ["סוג רישיון", "license type"], ["יועץ פנסיוני", "pension consultant"], ["סוכן פנסיוני", "pension agent"],
      ["תכנון פנסיוני", "retirement planning"], ["תכנון פרישה", "retirement planning"], ["יועץ פרישה", "retirement consultant"], ["קיבוע זכויות", "fixation of tax rights"],
      ["סנן / סינון", "filter"], ["נקה סננים", "clear filters"],
      ["תוצאות", "results"], ["בתוקף", "valid"], ["פעיל", "active"], ["לא פעיל", "inactive"],
      ["הותלה", "suspended"], ["בוטל", "canceled"], ["חברה", "company"], ["יחיד", "individual"],
      ["כתובת", "address"], ["טלפון", "telephone"], ["דואר אלקטרוני", "email"], ["שפות", "languages"],
      ["לכניסה למערכת", "Sign in"], ["יצא לקובץ", "export to file"]
    ];

    // Общее языковое правило для всех промптов: русский + иврит в скобках,
    // английского быть не должно. Раньше правила не было вообще, и нейросети
    // подставляли в скобки английский вместо ивритского оригинала.
    const LANG_RULE = ` ЯЗЫК ОТВЕТА — СТРОГОЕ ПРАВИЛО. Пиши живым, естественным русским языком, как пишет человек, а не машинный перевод. Английского языка в ответе быть НЕ ДОЛЖНО вообще — ни слов, ни названий, ни пояснений в скобках. Названия учреждений, полей формы, улиц, статусов и должностей давай так: понятный русский перевод, а сразу за ним в скобках ОРИГИНАЛ НА ИВРИТЕ — например «номер лицензии (מספר רישיון)», «действующая (בתוקף)», «улица Герцль 73 (רחוב הרצל 73)». Никогда не подставляй в скобки английский вместо иврита. Не смешивай буквы разных алфавитов внутри одного слова. Если точного написания на иврите не знаешь — просто не ставь скобки.`;

    const copyTexts = {
      "ai-general": `I use the official Israeli website to check a specialist\'s license. Explain to me in Russian what the Hebrew fields mean and what steps to follow. Don\'t ask me for a passport, teudat zehut, bank details, passwords, SMS codes or personal documents. If I send a screenshot, only explain the interface and don\'t save sensitive data.` + LANG_RULE,
      "ai-screenshot": `I will send a screenshot of the official Israeli website. Translate the interface from Hebrew into Russian and explain what to click to find a specialist or check a license. Do not process or ask for personal documents, passwords, banking information, ID numbers or SMS codes.` + LANG_RULE,
      "dictionary": dictionary.map(([he, ru]) => `${he} = ${ru}`).join("\n")
    };

    function cardPrompt(item, city) {
      const cityLine = city ? `Looking for in city/region: 0 .` : '';
      return `Найди специалистов в Израиле: ${item.title} / ${item.he}. ${cityLine}Официальный сайт для поиска: ${item.url}. ВАЖНО: если у тебя есть доступ к интернету — САМ зайди на сайт, выполни поиск и ВЫПИШИ ПРЯМО В ОТВЕТЕ конкретные имена, номера лицензий и контакты, которые нашёл — не отправляй меня «зайдите на сайт сами», я не понимаю иврит. Если доступа к интернету none — объясни, какие поля на иврите что означают, чтобы я сам мог заполнить форму, а результат пришлю тебе скриншотом для перевода. Мне нужен список подходящих специалистов, а не проверка одного уже известного имени. Ключевые слова: ${item.terms.map(t => t[0] + ' = ' + t[1]).join('; ')}. Не проси и не обрабатывай личные документы, пароли, банковские данные or SMS-коды.` + LANG_RULE;
    }

    function renderCards() {
      const q = document.getElementById('search').value.trim().toLowerCase();
      const cat = document.getElementById('category').value;
      const mode = document.getElementById('mode').value;
      const cards = document.getElementById('cards');
      cards.innerHTML = '';
      const filtered = specialists.filter(item => {
        const hay = `${item.title} ${item.he} ${item.desc} ${item.keywords} ${item.source}`.toLowerCase();
        const okQ = !q || hay.includes(q);
        const okCat = cat === 'all' || item.cat === cat;
        const okMode = mode === 'all' || (mode === 'direct' && item.mode === 'direct') || (mode === 'official' && item.mode === 'official') || (mode === 'checklist' && item.mode === 'checklist');
        return okQ && okCat && okMode;
      });

      if (!filtered.length) {
        cards.innerHTML = `<div class="card" style="grid-column: 1 / -1; min-height: auto"><h3>Nothing found</h3><p class="muted">Try another word: “tax”, “insurance”, “lawyer”, “notary”, “השקעות”.</p></div>`;
        return;
      }

      for (const item of filtered) {
        const el = document.createElement('article');
        el.className = 'card';
        const checklist = item.mode === 'checklist';
        el.innerHTML = `
          <div class="card-top">
            <div>
              <div class="icon">${item.icon}</div>
            </div>
            <span class="status ${item.statusClass}">${item.status}</span>
          </div>
          <h3>${item.title}</h3>
          <div class="subtitle he">${item.he}</div>
          <details class="card-acc">
            <summary>More details - what it is and how to use it ▸</summary>
            <p class="muted" style="margin-top:10px">${item.desc}</p>
            <ul>${item.can.map(x => `<li>${x}</li>`).join('')}</ul>
            <div class="terms">${item.terms.map(([he, ru]) => `<div class="term"><b class="he">${he}</b><span>${ru}</span></div>`).join('')}</div>
            <p class="small muted"><b>Source:</b> ${item.source}</p>
          </details>
          ${!checklist ? `
          <div style="margin-top:10px">
            <label style="font-size:12px;font-weight:700;color:var(--muted,#5d6675);display:block;margin-bottom:4px">Search city or area (optional):</label>
            <input type="text" class="city-input" placeholder="for example: Haifa, Sharon, Tel Aviv" style="width:100%;padding:8px 10px;border:1px solid #dcdfe6;border-radius:8px;font-size:13px;box-sizing:border-box">
          </div>` : ''}
          <div class="card-actions">
            ${checklist ? `<a class="btn primary" href="#mortgage-checklist">Checklist</a>` : `<a class="btn primary" href="${item.url}" target="_blank" rel="noopener noreferrer">Official website</a>`}
            ${(!checklist && item.altUrl) ? `<a class="btn" href="${item.altUrl}" target="_blank" rel="noopener noreferrer">Add. link</a>` : ''}
            ${(!checklist) ? `<a class="btn" href="#translate-help">How to translate?</a>` : ''}
            <button class="btn" data-card-copy="${encodeURIComponent(item.title)}">Prompt</button>
          </div>
        `;
        const cityInput = el.querySelector('.city-input');
        el.querySelector('[data-card-copy]').addEventListener('click', () => copyToClipboard(cardPrompt(item, cityInput ? cityInput.value.trim() : '')));
        cards.appendChild(el);
      }
    }

    function renderDict() {
      const d = document.getElementById('dict');
      d.innerHTML = dictionary.map(([he, ru]) => `<div class="dict-item"><div class="he">${he}</div><div class="ru">${ru}</div></div>`).join('');
    }

    function copyToClipboard(text, btn) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast(btn));
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        showToast(btn);
      }
    }

    function showToast(btn) {
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      if (btn) {
        const old = btn.textContent;
        btn.classList.add('copy-done');
        btn.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('copy-done'); btn.textContent = old; }, 1400);
      }
      setTimeout(() => toast.classList.remove('show'), 1400);
    }

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      const key = btn.getAttribute('data-copy');
      copyToClipboard(copyTexts[key] || '', btn);
    });

    document.getElementById('search').addEventListener('input', renderCards);
    document.getElementById('category').addEventListener('change', renderCards);
    document.getElementById('mode').addEventListener('change', renderCards);

    renderCards();
    renderDict();
  