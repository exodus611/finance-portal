
    const specialists = [
      {
        title: "Avocat", he: "עורך דין", icon: "⚖️", cat: "legal", mode: "official",
        status: "Recherche officielle", statusClass: "redirect",
        url: "https://www.israelbar.org.il/lawyer_list.asp",
        altUrl: "https://www.israelbar.org.il/english_lawyer_list.asp?menu=2",
        source: "Ordre des avocats d'Israël (Israel Bar Association) / לשכת עורכי הדין",
        desc: "Vérification d'un avocat dans le registre de l'Ordre des avocats. Recherche possible par nom, numéro de licence, district et parfois domaine d'activité.<br><br><b>Important :</b> en Israël, les avocats n'ont PAS de licence d'État distincte pour une spécialisation étroite (comme, par exemple, les médecins). Une seule licence générale : le droit d'exercer le droit en général. Une « spécialisation » (immobilier, droit de la famille, pénal, droit du travail, etc.) n'est que le centre d'activité d'un avocat donné, pas un certificat vérifiable distinct. Le registre confirme seulement que la personne est bien avocate — l'expérience dans votre domaine précis doit être clarifiée séparément, directement avec l'avocat.",
        can: ["vérifier le statut d'un avocat", "trouver un avocat par district/paramètres", "vérifier le numéro de licence", "utiliser les termes ci-dessous pour nommer précisément le domaine requis à l'avocat dès le premier appel (le registre officiel lui-même ne filtre pas par spécialisation étroite)"],
        terms: [["שם", "Nom"], ["מספר רישיון", "numéro de licence"], ["מחוז", "district / circonscription"], ["דיני משפחה", "droit de la famille (divorce, garde, pension alimentaire)"], ["מקרקעין", "immobilier"], ["דיני עבודה", "droit du travail"], ["פלילי", "droit pénal"], ["ירושות וצוואות", "successions et testaments"], ["ליטיגציה אזרחית ומסחרית", "litiges civils / commerciaux"]],
        keywords: "avocat lawyer lawyer עורך דין עורכי דין israelbar"
      },
      {
        title: "Courtier / agent immobilier", he: "מתווך מקרקעין", icon: "🏠", cat: "realestate", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/metavhim",
        source: "Ministère de la Justice / data.gov.il",
        desc: "Registre des courtiers agréés. Utile avant de signer un accord de courtage pour un achat ou une location immobilière.",
        can: ["vérifier la licence du courtier", "trouver par nom", "chercher par la ville indiquée au registre"],
        terms: [["מס רשיון", "numéro de licence"], ["שם המתווך", "nom du courtier"], ["עיר מגורים", "ville de résidence"]],
        keywords: "courtier agent immobilier broker realtor מתווך מקרקעין דירה appartement"
      },
      {
        title: "Expert immobilier", he: "שמאי מקרקעין", icon: "📐", cat: "realestate", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/shamaim",
        source: "Ministère de la Justice / data.gov.il",
        desc: "Registre des experts immobiliers. Utile pour l'achat d'un appartement, les litiges sur la valeur, les impôts et la vérification des estimations bancaires.",
        can: ["trouver un expert par ville", "vérifier le numéro de licence", "vérifier le nom dans le registre officiel"],
        terms: [["שם שמאי", "nom de l'expert"], ["מספר רשיון", "numéro de licence"], ["עיר", "ville"]],
        keywords: "expert immobilier שמאי מקרקעין estimation"
      },
      {
        title: "Notaire", he: "נוטריון", icon: "🖋️", cat: "legal", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/notary",
        source: "Ministère de la Justice / data.gov.il",
        desc: "Registre des notaires en activité. Souvent nécessaire pour une procuration, une traduction, la certification de documents et l'apostille.",
        can: ["trouver un notaire par ville", "vérifier l'activité", "voir les langues, si elles sont indiquées"],
        terms: [["שם", "Nom"], ["ישוב", "localité"], ["שפות", "langues"]],
        keywords: "notaire notary נוטריון procuration traduction apostille ייפוי כוח"
      },
      {
        title: "Expert-comptable (CPA)", he: "רואה חשבון", icon: "🧾", cat: "finance", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/cpalist",
        source: "Ministère de la Justice / data.gov.il",
        desc: "Registre des experts-comptables. Regardez bien le champ « statut » : un spécialiste peut figurer sur la liste sans exercer activement la profession.",
        can: ["trouver un CPA par ville", "vérifier le numéro de licence", "vérifier le statut"],
        terms: [["שם פרטי", "Prénom"], ["שם משפחה", "Nom"], ["סטטוס", "statut"]],
        keywords: "expert-comptable comptable CPA רואה חשבון impôts rapport annuel דוח שנתי"
      },
      {
        title: "Conseiller fiscal", he: "יועץ מס", icon: "💼", cat: "finance", mode: "official",
        status: "Site officiel", statusClass: "redirect",
        url: "https://www.tac.gov.il/",
        source: "מועצת יועצי המס בישראל",
        desc: "Sur le site du Conseil des conseillers fiscaux, cherchez la section « חיפוש יועץ ». Convient pour vérifier ou trouver un conseiller fiscal.",
        can: ["trouver un conseiller fiscal", "vérifier via le site officiel", "chercher par nom ou par ville, si disponible"],
        terms: [["חיפוש יועץ", "recherche d'un conseiller"], ["שם", "Nom"], ["עיר", "ville"]],
        keywords: "conseiller fiscal tax consultant יועץ מס impôts מס הכנסה מעמ"
      },
      {
        title: "Spécialiste investissement", he: "יועץ / משווק / מנהל תיקים", icon: "📈", cat: "finance", mode: "official",
        status: "Recherche officielle ISA", statusClass: "redirect",
        url: "https://www.investors.isa.gov.il/page/search-advisor",
        altUrl: "https://www.new.isa.gov.il/page/entities-search",
        source: "Autorité des marchés financiers d'Israël (ISA) / רשות ניירות ערך",
        desc: "Vérification des conseillers en investissement, marketeurs, gestionnaires de portefeuille et sociétés agréées. À vérifier impérativement avant d'investir.",
        can: ["vérifier la licence du conseiller", "trouver une société régulée par l'ISA", "distinguer un conseiller d'un marketeur"],
        terms: [["יועץ השקעות", "conseiller en investissement"], ["משווק השקעות", "marketeur en investissement"], ["מנהל תיקים", "gestionnaire de portefeuille"]],
        keywords: "investissement investissements יועץ השקעות placements bourse"
      },
      {
        title: "Conseiller / agent / marketeur pension", he: "יועץ פנסיוני / סוכן פנסיוני / משווק פנסיוני", icon: "🛡️", cat: "finance", mode: "official",
        status: "Recherche gov.il", statusClass: "redirect",
        url: "https://www.gov.il/he/service/agents_and_consultants_search",
        source: "רשות שוק ההון, ביטוח וחיסכון / gov.il",
        desc: "Important : tous trois suivent la MÊME formation et le même examen auprès de la Rashut Shuk HaHon (Autorité des marchés de capitaux), plus un stage de six mois. Mais la loi leur donne des POUVOIRS DIFFÉRENTS — il ne s'agit pas de savoir qui « comprend mieux » : pour certains, telle activité est tout simplement interdite par la loi, pour d'autres c'est une obligation.<br><br><b>Conseiller pension</b> (en hébreu : <span dir=\"rtl\" lang=\"he\">יועץ פנסיוני</span>, transcription : yoets pensioni) — indépendant, travaille et n'est payé QUE par le client, et non par les sociétés (à l'exception de la « commission de distribution » identique pour tous). Il donne une recommandation objective sur tout le marché : tous fonds, toutes sociétés. <b>La loi lui INTERDIT de finaliser lui-même l'achat du produit</b> — seulement une recommandation, mise en œuvre par le client lui-même ou via un agent. Il y en a environ 1 000 dans le pays, dont seulement une centaine d'indépendants privés (les autres sont des conseillers en banque).<br><br><b>Agent pension/assurance</b> (en hébreu : <span dir=\"rtl\" lang=\"he\">סוכן ביטוח פנסיוני</span>, transcription : sokhen bitouakh pensioni) — travaille sous contrat avec plusieurs sociétés, qui le paient par commission. <b>C'est l'agent qui émet effectivement</b> l'achat / le transfert d'un produit — ce qu'un conseiller n'a pas le droit de faire. <b>Important : la loi INTERDIT à un agent de se dire « conseiller » ou d'utiliser le mot « ייעוץ »</b> — c'est pourquoi les agents sont souvent appelés « planificateurs de retraite » (d'où la confusion, voir le tableau des titres non régulés ci-dessus).<br><br><b>Marketeur pension</b> (en hébreu : <span dir=\"rtl\" lang=\"he\">משווק פנסיוני</span>, transcription : meshavek pensioni) — salarié à plein temps d'une seule société (Menora, Phoenix, Altshuler Shaham, etc.), il vend et traite uniquement ses produits : le plus gros conflit d'intérêts des trois.<br><br><b>Précision importante que nous avons corrigée :</b> les licences de conseiller et d'agent sont MUTUELLEMENT EXCLUSIVES ; on ne peut pas les détenir en même temps (cela découle directement du fait qu'un conseiller, par définition, n'a droit à aucun lien avec les sociétés, et qu'un agent, par définition, travaille sous contrat avec elles).<br><br><b>Quant au moment du départ à la retraite (par exemple à 67 ans) :</b> le formulaire de base — <span dir=\"rtl\" lang=\"he\">טופס 161</span> (tofes 161, avis de départ à la retraite) — doit légalement être rempli par votre employeur. Mais la décision la plus importante ici est le formulaire <span dir=\"rtl\" lang=\"he\">161ד</span> (tofes 161-dalet, déclaration de fixation des droits fiscaux) : c'est une décision IRRÉVERSIBLE d'exonération fiscale, qui relève de <b>l'expert-comptable (roe heshbon) ou du conseiller fiscal agréé (yoets mas mousmakh)</b> — ni l'employeur, ni un conseiller/agent pension. Ni un conseiller, ni un agent, ni un marketeur n'a le droit de vous représenter devant l'administration fiscale ou le Bitouakh Léoumi : seuls un expert-comptable, un conseiller fiscal ou un avocat le peuvent.<br><br><b>Conclusion pour vous :</b> un avis objectif sur « où placer » — le conseiller. Ouvrir/modifier physiquement un produit — l'agent. Les formulaires fiscaux du départ à la retraite (161-dalet, fixation des droits fiscaux) — un expert-comptable ou un conseiller fiscal ; c'est une profession distincte, pas une licence pension.",
        can: ["chercher par prénom/nom", "chercher par ville", "connaître le type exact de licence : conseiller, agent ou marketeur", "comprendre si le spécialiste est autorisé à traiter des produits de pension", "si vous voulez seulement un avis objectif sur le parcours, cherchez un conseiller (on ne peut pas détenir en même temps une licence d'agent)", "s'il faut enregistrer physiquement un produit / soumettre des documents, cherchez un agent", "pour le formulaire 161-D et les questions fiscales au départ à la retraite — cherchez un expert-comptable (roe heshbon) ou un conseiller fiscal agréé (yoets mas mousmakh), c'est une profession distincte", "demander directement : pour quelle société travaillez-vous et comment êtes-vous rémunéré ?"],
        terms: [["יועץ פנסיוני", "conseiller pension — indépendant"], ["סוכן פנסיוני", "agent pension — représente la société d'assurance"], ["סוכן ביטוח", "agent d'assurance"], ["משווק פנסיוני", "marketeur pension — une seule société employeur"], ["סוג רישיון", "type de licence"], ["זיקה", "intérêt financier / rattachement"]],
        keywords: "pension retraite conseiller pension agent marketeur פנסיוני assurance"
      },
      {
        title: "Planification retraite / planificateur financier", he: "מתכנן פרישה / מתכנן פיננסי", icon: "🌅", cat: "finance", mode: "checklist",
        status: "Titre non agréé", statusClass: "warn",
        url: "#retirement-checklist",
        source: "Officiellement, une telle profession/licence n'existe pas en Israël.",
        desc: "Il est important de comprendre : <b>« planification retraite » et « planificateur financier » ne sont PAS des titres régulés par l'État.</b> La licence « metakhnen prisha » n'existe tout simplement pas — n'importe qui peut se dire ainsi, y compris un expert-comptable, un agent d'assurance, ou une personne sans aucune licence.<br><br>Seule l'ACTION elle-même est réellement régulée : pour effectuer légalement une opération de pension (transférer une épargne, mettre en place un versement, etc.), il faut L'UNE des trois licences ci-dessus (conseiller/agent/marketeur). Des certifications comme CFP/EFP sont des qualifications professionnelles, pas une licence d'État.<br><br>En résumé : une personne peut « planifier » parfaitement tout sur le papier sans aucune licence — mais seul le titulaire effectif de la licence peut exécuter le plan.",
        can: ["demander directement : quelle licence d'État avez-vous — conseiller, agent ou marketeur ?", "ne pas confondre un certificat/titre (CFP, « planificateur financier ») avec une licence d'État", "si l'on parle d'impôts, vérifier séparément auprès d'un CPA ou d'un conseiller fiscal", "si l'on parle d'investissements, vérifier séparément la licence ISA", "demander une déclaration écrite des honoraires et des conflits d'intérêts"],
        terms: [["תכנון פרישה", "planification du départ à la retraite — non agréé"], ["יועץ פרישה", "conseiller départ à la retraite — non agréé, ressemble à la vraie licence « יועץ פנסיוני »"], ["מתכנן פיננסי", "planificateur financier — non agréé"], ["קיבוע זכויות", "fixation des droits fiscaux"], ["מענק פרישה", "indemnité de départ à la retraite"], ["פטור ממס", "exonération fiscale"]],
        keywords: "retraite planificateur financier retirement מענק פרישה פטור ממס"
      },
      {
        title: "Mandataire en brevets", he: "עורך פטנטים", icon: "💡", cat: "business", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/justice-patent-attorneys",
        source: "Ministère de la Justice / רשות הפטנטים / data.gov.il",
        desc: "Registre des mandataires en brevets. Utile pour les inventions, brevets, marques et questions de propriété intellectuelle.",
        can: ["vérifier la licence", "trouver par nom", "voir ville/contacts, si indiqués"],
        terms: [["מספר רישיון", "numéro de licence"], ["שם פרטי", "Prénom"], ["יישוב", "ville"]],
        keywords: "brevet patent attorney עורך פטנטים marque propriété intellectuelle IP"
      },
      {
        title: "Médecin / profession de santé", he: "רופא / מקצועות בריאות", icon: "🩺", cat: "business", mode: "official",
        status: "Recherche gov.il", statusClass: "redirect",
        url: "https://www.gov.il/en/service/licensed-medical-practitioners",
        altUrl: "https://practitioners.health.gov.il/Practitioners",
        source: "Ministère de la Santé / gov.il",
        desc: "Vérification des médecins, dentistes, pharmaciens, psychologues et autres professions de santé agréés.",
        can: ["vérifier la licence", "chercher par nom", "chercher par profession/spécialisation"],
        terms: [["רופא", "médecin"], ["רישיון", "licence"], ["התמחות", "spécialisation"]],
        keywords: "médecin doctor רופא médecine licence santé psychologue pharmacien"
      },
      {
        title: "Société / fournisseur", he: "חברה", icon: "🏢", cat: "business", mode: "direct",
        status: "Données ouvertes", statusClass: "full",
        url: "https://data.gov.il/dataset/ica_companies",
        source: "Registre des sociétés / ministère de la Justice / data.gov.il",
        desc: "Vérification du statut d'une société : est-elle active, son numéro, son adresse et d'autres informations du registre.",
        can: ["vérifier la société avant le contrat", "vérifier le numéro de société", "voir le statut"],
        terms: [["מספר תאגיד", "numéro de société"], ["שם תאגיד", "nom de la société"], ["סטטוס", "statut"]],
        keywords: "société entreprise fournisseur חברה רשם החברות ח.פ supplier company"
      },
      {
        title: "Conseiller en mashkanta", he: "יועץ משכנתאות", icon: "🏦", cat: "warning", mode: "checklist",
        status: "Liste de contrôle au lieu de registre", statusClass: "warn",
        url: "#mortgage-checklist",
        source: "Il n'existe pas de registre public d'État complet des licences pour une vérification rapide",
        desc: "Pour les conseillers en mashkanta, on n'a pas trouvé de registre d'État des licences aussi stable que pour les avocats, experts-comptables ou agents d'assurance. Utilisez une liste de questions.",
        can: ["vérifier les conflits d'intérêts", "demander un contrat écrit", "demander si le conseiller touche une commission de la banque"],
        terms: [["עמלה", "commission"], ["הסכם", "contrat"], ["ניגוד עניינים", "conflit d'intérêts"]],
        keywords: "conseiller mashkanta mortgage consultant יועץ משכנתאות"
      }
    ];

    const dictionary = [
      ["חיפוש", "recherche"], ["שם", "nom / titre"], ["שם פרטי", "Prénom"], ["שם משפחה", "Nom"],
      ["מספר רישיון", "numéro de licence"], ["מס רשיון", "numéro de licence"], ["עיר", "ville"], ["יישוב / ישוב", "localité"],
      ["עיר מגורים", "ville de résidence"], ["סוג רישיון", "type de licence"], ["יועץ פנסיוני", "conseiller pension"], ["סוכן פנסיוני", "agent pension"],
      ["תכנון פנסיוני", "planification pension"], ["תכנון פרישה", "planification du départ à la retraite"], ["יועץ פרישה", "conseiller départ à la retraite"], ["קיבוע זכויות", "fixation des droits fiscaux"],
      ["סנן / סינון", "filtrer / filtre"], ["נקה סננים", "effacer les filtres"],
      ["תוצאות", "résultats"], ["בתוקף", "valide / en vigueur"], ["פעיל", "actif"], ["לא פעיל", "inactif"],
      ["הותלה", "suspendu"], ["בוטל", "annulé"], ["חברה", "société"], ["יחיד", "particulier"],
      ["כתובת", "adresse"], ["טלפון", "téléphone"], ["דואר אלקטרוני", "e-mail"], ["שפות", "langues"],
      ["לכניסה למערכת", "se connecter"], ["יצא לקובץ", "exporter vers un fichier"]
    ];

    // Règle de langue commune à tous les prompts : français + hébreu entre
    // parenthèses, et aucun anglais. Avant, il n'y avait aucune règle, et les
    // IA mettaient de l'anglais entre parenthèses au lieu de l'original hébreu.
    const LANG_RULE = ` RÈGLE DE LANGUE DE RÉPONSE — STRICTE. Écris en français vivant et naturel, comme une personne, pas en traduction automatique. Donne les noms d'institutions, champs de formulaire, rues, statuts et titres de poste ainsi : une traduction claire en français, suivie entre parenthèses de l'ORIGINAL EN HÉBREU — par exemple « numéro de licence (מספר רישיון) », « valide (בתוקף) », « 73 rue Herzl (רחוב הרצל 73) ». Ne mélange jamais des lettres d'alphabets différents dans un même mot. Si tu ne connais pas l'orthographe hébraïque exacte, omet simplement les parenthèses.`;

    const copyTexts = {
      "ai-general": `J'utilise le site officiel israélien pour vérifier la licence d'un spécialiste. Explique-moi en français ce que signifient les champs en hébreu et quelles étapes suivre. Ne me demande ni passeport, ni teudat zehut, ni coordonnées bancaires, ni mots de passe, ni codes SMS, ni documents personnels. Si je t'envoie une capture d'écran, explique seulement l'interface et ne conserve pas de données sensibles.` + LANG_RULE,
      "ai-screenshot": `Je vais t'envoyer une capture d'écran du site officiel israélien. Traduis l'interface de l'hébreu vers le français et explique sur quoi cliquer pour trouver un spécialiste ou vérifier une licence. Ne traite pas et ne demande pas de documents personnels, mots de passe, informations bancaires, numéros d'identité ou codes SMS.` + LANG_RULE,
      "dictionary": dictionary.map(([he, fr]) => `${he} = ${fr}`).join("\n")
    };

    function cardPrompt(item, city) {
      const cityLine = city ? `Je cherche dans la ville/région : ${city}. ` : '';
      return `Trouve des spécialistes en Israël : ${item.title} / ${item.he}. ${cityLine}Site officiel de recherche : ${item.url}. IMPORTANT : si tu as accès à Internet, va TOI-MÊME sur le site, lance la recherche et ÉCRIS DANS TA RÉPONSE les noms précis, numéros de licence et contacts que tu as trouvés — ne me renvoie pas « visiter le site toi-même », je ne comprends pas l'hébreu. Si tu n'as pas d'accès Internet, explique ce que signifient les champs en hébreu pour que je puisse remplir le formulaire moi-même, et je t'enverrai le résultat en capture d'écran pour traduction. Il me faut une liste de spécialistes adaptés, pas la vérification d'un nom déjà connu. Mots-clés : ${item.terms.map(t => t[0] + ' = ' + t[1]).join('; ')}. Ne demande pas et ne traite pas de documents personnels, mots de passe, coordonnées bancaires ou codes SMS.` + LANG_RULE;
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
        cards.innerHTML = `<div class="card" style="grid-column: 1 / -1; min-height: auto"><h3>Rien trouvé</h3><p class="muted">Essayez un autre mot : « impôts », « assurance », « avocat », « notaire », « השקעות ».</p></div>`;
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
            <summary>Plus de détails — ce que c'est et comment l'utiliser ▸</summary>
            <p class="muted" style="margin-top:10px">${item.desc}</p>
            <ul>${item.can.map(x => `<li>${x}</li>`).join('')}</ul>
            <div class="terms">${item.terms.map(([he, fr]) => `<div class="term"><b class="he">${he}</b><span>${fr}</span></div>`).join('')}</div>
            <p class="small muted"><b>Source :</b> ${item.source}</p>
          </details>
          ${!checklist ? `
          <div style="margin-top:10px">
            <label style="font-size:12px;font-weight:700;color:var(--muted,#5d6675);display:block;margin-bottom:4px">Ville ou région de recherche (facultatif) :</label>
            <input type="text" class="city-input" placeholder="par exemple : Haïfa, la Sharon, Tel Aviv" style="width:100%;padding:8px 10px;border:1px solid #dcdfe6;border-radius:8px;font-size:13px;box-sizing:border-box">
          </div>` : ''}
          <div class="card-actions">
            ${checklist ? `<a class="btn primary" href="#mortgage-checklist">Liste de contrôle</a>` : `<a class="btn primary" href="${item.url}" target="_blank" rel="noopener noreferrer">Site officiel</a>`}
            ${(!checklist && item.altUrl) ? `<a class="btn" href="${item.altUrl}" target="_blank" rel="noopener noreferrer">Lien suppl.</a>` : ''}
            ${(!checklist) ? `<a class="btn" href="#translate-help">Comment traduire ?</a>` : ''}
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
      d.innerHTML = dictionary.map(([he, fr]) => `<div class="dict-item"><div class="he">${he}</div><div class="ru">${fr}</div></div>`).join('');
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
        btn.textContent = 'Copié';
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
