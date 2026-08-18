/* Тесты калькулятора «Пикадон vs керен каспит».
   Запуск: node scripts/test_pikadon_calc.js

   Логика вынимается ИЗ САМОЙ СТРАНИЦЫ, а не переписывается здесь заново —
   иначе тесты проверяли бы копию, а не то, что видит человек.
*/
"use strict";
var fs = require("fs"), path = require("path");

var PAGE = path.join(__dirname, "..", "pikadon-vs-keren.html");

/* ---------- загрузка функции calc() из страницы ---------- */
function loadCalc() {
  var html = fs.readFileSync(PAGE, "utf8");
  var i = html.indexOf("var DEP_TAX");
  var j = html.indexOf("['amount','months'", i);
  if (i < 0 || j < 0) throw new Error("не нашёл блок расчёта в pikadon-vs-keren.html");
  var body = html.slice(i, j);

  // Заглушки DOM: поля ввода и элементы вывода.
  var values = {};
  var out = {};
  function stub(id) {
    // ВАЖНО: textContent и innerHTML пишутся в одно хранилище, но чтение
    // должно возвращать последнее записанное значение любым из способов —
    // страница для одних блоков использует textContent, для других innerHTML.
    return {
      get value() { return values[id]; },
      set value(v) { values[id] = v; },
      set textContent(v) { out[id] = v; },
      get textContent() { return out[id] === undefined ? "" : out[id]; },
      set innerHTML(v) { out[id] = v; },
      get innerHTML() { return out[id] === undefined ? "" : out[id]; },
      style: {}, classList: { toggle: function () {}, add: function () {}, remove: function () {} },
      addEventListener: function () {}
    };
  }
  var els = {};
  global.document = {
    getElementById: function (id) { return els[id] || (els[id] = stub(id)); }
  };

  var fn = new Function(body + "\nreturn {calc:calc};");
  var api = fn();

  return function run(p) {
    values.amount = p.amount;
    values.months = p.months;
    values.depRate = p.depRate;
    values.fundRate = p.fundRate;
    values.fee = p.fee;
    values.infl = p.infl;
    api.calc();
    // Снимок значений на момент вызова: сам out переиспользуется между
    // прогонами, и без копии тесты читали бы состояние от следующего сценария.
    var snapshot = {};
    Object.keys(out).forEach(function (k) { snapshot[k] = out[k]; });
    return {
      out: snapshot,
      // числа обратно из отформатированного текста
      depNet: parseMoney(out.depNet),
      fundNet: parseMoney(out.fundNet),
      depTax: parseMoney(out.depTax),
      fundTax: parseMoney(out.fundTax),
      depGross: parseMoney(out.depGross),
      fundGross: parseMoney(out.fundGross),
      who: out.who
    };
  };
}
function parseMoney(s) {
  if (s === undefined || s === null) return NaN;
  var neg = /−|-/.test(String(s).trim().charAt(0));
  var n = parseFloat(String(s).replace(/[^\d.,]/g, "").replace(/\s/g, "").replace(",", "."));
  return neg ? -n : n;
}

/* ---------- мини-фреймворк ---------- */
var ok = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { ok++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra ? "  → " + extra : "")); }
}
function near(a, b, eps) { return Math.abs(a - b) <= (eps === undefined ? 1 : eps); }

var calc = loadCalc();

console.log("\n=== 1. Базовая арифметика: сложный процент и налог ===");
{
  // 100 000 ₪, год, пикадон 4.5%: прибыль 4500, налог 15% = 675, чистыми 3825
  var r = calc({ amount: 100000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  check("пикадон: начислено 4 500 ₪", near(r.depGross, 4500), r.depGross);
  check("пикадон: налог 15% = 675 ₪", near(Math.abs(r.depTax), 675), r.depTax);
  check("пикадон: чистыми 3 825 ₪", near(r.depNet, 3825), r.depNet);

  // фонд: 3.5% - 0.15% комиссии = 3.35% -> 3350; инфляция 1.5% -> 1500
  // реальная прибыль 1850, налог 25% = 462.5, чистыми 3350-462.5 = 2887.5
  check("фонд: заработано после комиссии 3 350 ₪", near(r.fundGross, 3350), r.fundGross);
  check("фонд: налог 25% с реальной прибыли ≈ 463 ₪", near(Math.abs(r.fundTax), 463, 1), r.fundTax);
  check("фонд: чистыми ≈ 2 888 ₪", near(r.fundNet, 2888, 1), r.fundNet);
  check("вердикт — выгоднее пикадон", /пикадон/i.test(r.who), r.who);
}

console.log("\n=== 2. Ответ на вопрос из группы (4,5% банк против 3,5% фонд) ===");
{
  var a = calc({ amount: 100000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  check("при инфляции 1,5% побеждает банк", a.depNet > a.fundNet, a.depNet + " vs " + a.fundNet);
  var b = calc({ amount: 100000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 6 });
  check("при инфляции 6% налог фонда обнуляется", Math.abs(b.fundTax) === 0, b.fundTax);
  check("но банк всё равно впереди (разрыв ставок велик)", b.depNet > b.fundNet, b.depNet + " vs " + b.fundNet);
  check("при росте инфляции фонд догоняет", b.fundNet > a.fundNet, a.fundNet + " -> " + b.fundNet);
  check("а пикадон не реагирует на инфляцию", near(a.depNet, b.depNet), a.depNet + " vs " + b.depNet);
}

console.log("\n=== 3. Ключевой эффект: равные ставки, разный налог ===");
{
  // При равной доходности фонд должен выигрывать, пока есть инфляция:
  // он платит налог только с реальной части.
  var r = calc({ amount: 100000, months: 12, depRate: 4, fundRate: 4, fee: 0.15, infl: 3 });
  check("при равных 4% и инфляции 3% выгоднее фонд", r.fundNet > r.depNet, r.fundNet + " vs " + r.depNet);
  check("вердикт называет керен каспит", /керен|каспит/i.test(r.who), r.who);

  // При нулевой инфляции фонд облагается 25% против 15% -> проигрывает
  var z = calc({ amount: 100000, months: 12, depRate: 4, fundRate: 4, fee: 0, infl: 0 });
  check("при нулевой инфляции и равных ставках выгоднее пикадон", z.depNet > z.fundNet, z.depNet + " vs " + z.fundNet);
  check("налог фонда ровно 25% от прибыли", near(Math.abs(z.fundTax), z.fundGross * 0.25, 1), z.fundTax);
  check("налог пикадона ровно 15% от прибыли", near(Math.abs(z.depTax), z.depGross * 0.15, 1), z.depTax);
}

console.log("\n=== 4. Комиссия фонда вычитается из доходности ===");
{
  var no = calc({ amount: 100000, months: 12, depRate: 4, fundRate: 4, fee: 0, infl: 2 });
  var hi = calc({ amount: 100000, months: 12, depRate: 4, fundRate: 4, fee: 0.5, infl: 2 });
  check("комиссия 0,5% уменьшает результат фонда", hi.fundNet < no.fundNet, no.fundNet + " -> " + hi.fundNet);
  check("комиссия не влияет на пикадон", near(no.depNet, hi.depNet), no.depNet + " vs " + hi.depNet);
  // 4% - 0.5% = 3.5% -> 3500
  check("доходность фонда = ставка минус комиссия", near(hi.fundGross, 3500, 1), hi.fundGross);
}

console.log("\n=== 5. Дефляция: налог не должен превышать номинальную прибыль ===");
{
  // При отрицательном мададе закон считает номинальную прибыль реальной,
  // а НЕ раздувает базу на величину дефляции.
  var r = calc({ amount: 100000, months: 12, depRate: 3, fundRate: 3, fee: 0, infl: -2 });
  var maxTax = r.fundGross * 0.25;
  check("налог фонда не больше 25% номинальной прибыли", Math.abs(r.fundTax) <= maxTax + 1,
        "налог " + r.fundTax + ", максимум " + maxTax.toFixed(0));
  check("налог фонда = 25% от 3 000 ₪ = 750 ₪", near(Math.abs(r.fundTax), 750, 1), r.fundTax);
  check("чистая прибыль фонда положительна", r.fundNet > 0, r.fundNet);
  check("чистое не превышает валовое", r.fundNet <= r.fundGross + 0.5, r.fundNet + " vs " + r.fundGross);
}

console.log("\n=== 6. Налог никогда не отрицательный и не съедает больше прибыли ===");
{
  var cases = [
    { amount: 100000, months: 12, depRate: 0, fundRate: 0, fee: 0, infl: 0 },
    { amount: 100000, months: 12, depRate: 0, fundRate: 0, fee: 0.2, infl: 3 },
    { amount: 100000, months: 6, depRate: 1, fundRate: 10, fee: 0, infl: 12 },
    { amount: 500, months: 1, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 },
    { amount: 5000000, months: 120, depRate: 5, fundRate: 4, fee: 0.1, infl: 2 }
  ];
  var allOk = true, detail = "";
  cases.forEach(function (c, i) {
    var r = calc(c);
    if (Math.abs(r.depTax) < -0.001 || Math.abs(r.fundTax) < -0.001) { allOk = false; detail = "отрицательный налог в кейсе " + i; }
    if (r.depNet > r.depGross + 0.5) { allOk = false; detail = "пикадон: чистое > валового, кейс " + i; }
    if (r.fundNet > r.fundGross + 0.5) { allOk = false; detail = "фонд: чистое > валового, кейс " + i; }
    if (r.fundGross > 0 && Math.abs(r.fundTax) > r.fundGross * 0.2500001 + 1) { allOk = false; detail = "фонд: налог >25% прибыли, кейс " + i; }
    if (r.depGross > 0 && Math.abs(r.depTax) > r.depGross * 0.1500001 + 1) { allOk = false; detail = "пикадон: налог >15% прибыли, кейс " + i; }
  });
  check("на 5 разных наборах: налог в границах, чистое ≤ валового", allOk, detail);

  var zero = calc({ amount: 100000, months: 12, depRate: 0, fundRate: 0, fee: 0, infl: 0 });
  check("нулевые ставки -> нулевая прибыль и нулевой налог",
        near(zero.depNet, 0) && near(zero.fundNet, 0) && near(Math.abs(zero.depTax), 0), JSON.stringify(zero.out.depNet));
}

console.log("\n=== 7. Срок: сложный процент, а не простое умножение ===");
{
  var y1 = calc({ amount: 100000, months: 12, depRate: 5, fundRate: 5, fee: 0, infl: 0 });
  var y2 = calc({ amount: 100000, months: 24, depRate: 5, fundRate: 5, fee: 0, infl: 0 });
  // за 2 года 5% сложных = 10.25%, а не 10%
  check("за 2 года начислено 10 250 ₪ (сложный процент)", near(y2.depGross, 10250, 1), y2.depGross);
  check("это больше, чем удвоенный год", y2.depGross > y1.depGross * 2, y2.depGross + " > " + y1.depGross * 2);

  var half = calc({ amount: 100000, months: 6, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  var full = calc({ amount: 100000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  check("полгода даёт меньше года", half.depNet < full.depNet, half.depNet + " < " + full.depNet);
  check("полгода — примерно половина (сложный процент чуть меньше)",
        half.depGross > full.depGross * 0.48 && half.depGross < full.depGross * 0.51, half.depGross);
}

console.log("\n=== 8. Масштабируемость: результат пропорционален сумме ===");
{
  var small = calc({ amount: 10000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  var big = calc({ amount: 1000000, months: 12, depRate: 4.5, fundRate: 3.5, fee: 0.15, infl: 1.5 });
  // Суммы на экране округлены до целого шекеля, поэтому сравниваем с допуском,
  // пропорциональным масштабу (иначе ловим не ошибку расчёта, а округление вывода).
  check("в 100 раз больше сумма -> в ~100 раз больше доход",
        near(big.depNet, small.depNet * 100, 100), small.depNet + " * 100 vs " + big.depNet);
  check("вердикт не зависит от суммы", small.who === big.who, small.who + " / " + big.who);
}

console.log("\n=== 9. Точка перелома по инфляции ===");
{
  // Ищем инфляцию, при которой победитель меняется, и сверяем с тем,
  // что показывает сама страница в блоке «Точка перелома».
  var params = { amount: 100000, months: 12, depRate: 4, fundRate: 4, fee: 0.1 };
  var lowInfl = calc(Object.assign({}, params, { infl: 0 }));
  var highInfl = calc(Object.assign({}, params, { infl: 5 }));
  check("при 0% инфляции выгоднее пикадон", lowInfl.depNet > lowInfl.fundNet, lowInfl.depNet + " vs " + lowInfl.fundNet);
  check("при 5% инфляции выгоднее фонд", highInfl.fundNet > highInfl.depNet, highInfl.fundNet + " vs " + highInfl.depNet);
  check("страница сообщает о точке перелома", /точк[аи] перелома/i.test(lowInfl.out.flip || ""), (lowInfl.out.flip || "").slice(0, 80));
}

console.log("\n=== 10. Согласованность вывода на экране ===");
{
  var r = calc({ amount: 250000, months: 18, depRate: 4.2, fundRate: 3.6, fee: 0.12, infl: 2.4 });
  check("валовое − налог = чистое (пикадон)",
        near(r.depGross - Math.abs(r.depTax), r.depNet, 1), r.depGross + " - " + Math.abs(r.depTax) + " ≠ " + r.depNet);
  check("валовое − налог = чистое (фонд)",
        near(r.fundGross - Math.abs(r.fundTax), r.fundNet, 1), r.fundGross + " - " + Math.abs(r.fundTax) + " ≠ " + r.fundNet);
  check("вердикт соответствует числам",
        (r.depNet > r.fundNet) === /пикадон/i.test(r.who) || /поровну/i.test(r.who), r.who);
  // Внимание: в JS \w — это только латиница, кириллицу он не ловит.
  check("блок покупательной способности заполнен", /покупательн[а-яё]+ способност/i.test(r.out.realNote || ""),
        String(r.out.realNote || "").slice(0, 60));
  check("сумма и проценты выводятся с ₪", /₪/.test(r.out.depNet), r.out.depNet);
}

console.log("\n=========================================");
console.log("  Успешно: " + ok + ", с ошибкой: " + fail);
console.log("=========================================\n");
process.exit(fail ? 1 : 0);
