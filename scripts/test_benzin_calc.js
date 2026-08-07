/* Тесты расчётов модуля «Цена на бензин». Запуск: node tests/test_calc.js */
"use strict";
var fs = require("fs"), path = require("path");

function load() {
  var src = fs.readFileSync(path.join(__dirname, "..", "benzin.js"), "utf8");
  var m = { exports: {} };
  var doc = {
    readyState: "complete",
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    createElement: function () { return { style: {}, appendChild: function () {}, setAttribute: function () {} }; },
    createElementNS: function () { return { style: {}, appendChild: function () {}, setAttribute: function () {} }; },
    addEventListener: function () {}
  };
  return new Function("module", "document", "window", src + "\nreturn module.exports;")(m, doc, { setTimeout: function () {} });
}
var M = load();

var ok = 0, bad = 0;
function eq(a, e, n) {
  if (JSON.stringify(a) === JSON.stringify(e)) { ok++; console.log("  ok   " + n); }
  else { bad++; console.log("  FAIL " + n + "\n         ждали: " + JSON.stringify(e) + "\n         вышло: " + JSON.stringify(a)); }
}
function close(a, e, n, eps) {
  eps = eps || 0.01;
  if (Math.abs(a - e) < eps) { ok++; console.log("  ok   " + n); }
  else { bad++; console.log("  FAIL " + n + "\n         ждали: " + e + "\n         вышло: " + a); }
}

var BD = {
  items: [
    { name: "топливо", val: 2.60, pct: 32, gov: false },
    { name: "акциз", val: 3.61, pct: 45, gov: true },
    { name: "налог", val: 1.24, pct: 15, gov: true },
    { name: "сбыт", val: 0.64, pct: 8, gov: false }
  ]
};

console.log("\n--- Стоимость бака ---");
close(M.tankCost(52, 8.09), 420.68, "бак 52 литра по цене августа");
close(M.tankCost(40, 8.09), 323.60, "бак 40 литров");
close(M.tankCost(1, 8.09), 8.09, "один литр равен цене литра");
eq(M.tankCost(0, 8.09), null, "нулевой бак — расчёта нет");
eq(M.tankCost(-5, 8.09), null, "отрицательный объём — расчёта нет");
eq(M.tankCost(52, 0), null, "нулевая цена — расчёта нет");
eq(M.tankCost(NaN, 8.09), null, "пустое поле — расчёта нет");

console.log("\n--- Доля государства ---");
close(M.govShare(52, BD), 252.20, "акциз и налог с бака 52 литра");
close(M.govShare(1, BD), 4.85, "с одного литра государству");
eq(M.govShare(0, BD), null, "нулевой объём — расчёта нет");
var totalPct = BD.items.reduce(function (s, i) { return s + i.pct; }, 0);
eq(totalPct, 100, "доли составляющих дают ровно сто процентов");
var totalVal = BD.items.reduce(function (s, i) { return s + i.val; }, 0);
close(totalVal, 8.09, "сумма составляющих совпадает с ценой литра");

console.log("\n--- Расходы за год ---");
close(M.yearCost(52, 2, 8.09), 10096.32, "два бака в месяц за год");
close(M.yearCost(52, 4, 8.09), 20192.64, "четыре бака в месяц вдвое дороже");
close(M.yearCost(52, 1, 8.09), 5048.16, "один бак в месяц");
eq(M.yearCost(52, 0, 8.09), null, "ноль заправок — расчёта нет");
eq(M.yearCost(0, 2, 8.09), null, "нулевой бак — расчёта нет");

console.log("\n--- Изменение к прошлому месяцу ---");
close(M.diffVsPrev(52, 8.09, 7.48), 31.72, "бак подорожал за месяц");
close(M.diffVsPrev(52, 7.48, 8.09), -31.72, "при снижении цены результат отрицательный");
close(M.diffVsPrev(52, 8.09, 8.09), 0, "цена не менялась — ноль");
eq(M.diffVsPrev(0, 8.09, 7.48), null, "нулевой бак — расчёта нет");

console.log("\n--- Связки значений ---");
var one = M.tankCost(52, 8.09), gov = M.govShare(52, BD);
close(gov / one * 100, 59.95, "доля государства около шестидесяти процентов", 0.1);
close(M.yearCost(52, 2, 8.09), one * 24, "год равен двадцати четырём бакам");

console.log("\n=========================================");
console.log("  Успешно: " + ok + ", с ошибкой: " + bad);
console.log("=========================================\n");
process.exit(bad === 0 ? 0 : 1);