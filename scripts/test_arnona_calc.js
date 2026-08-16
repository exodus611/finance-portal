/* Тесты расчётов модуля «Скидка на арнону». Запуск: node tests/test_calc.js */
"use strict";

var fs = require("fs");
var path = require("path");

/* Загружаем модуль в поддельном окружении браузера */
function loadModule() {
  var src = fs.readFileSync(path.join(__dirname, "..", "arnona.js"), "utf8");
  var module_ = { exports: {} };
  var fakeDoc = {
    readyState: "complete",
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    createElement: function () { return { style: {}, appendChild: function () {}, setAttribute: function () {} }; },
    addEventListener: function () {}
  };
  var fn = new Function("module", "document", "window", src + "\nreturn module.exports;");
  return fn(module_, fakeDoc, {});
}

var M = loadModule();

var passed = 0, failed = 0;
function eq(actual, expected, name) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { passed++; console.log("  ok   " + name); }
  else { failed++; console.log("  FAIL " + name + "\n         ждали: " + JSON.stringify(expected) + "\n         вышло: " + JSON.stringify(actual)); }
}
function close(actual, expected, name, eps) {
  eps = eps || 0.01;
  var ok = Math.abs(actual - expected) < eps;
  if (ok) { passed++; console.log("  ok   " + name); }
  else { failed++; console.log("  FAIL " + name + "\n         ждали: " + expected + "\n         вышло: " + actual); }
}

console.log("\n--- Доля площади в пределах льготируемых ста метров ---");
eq(M.areaShare(70, 100), 1, "квартира 70 м² при пределе 100 — весь счёт");
eq(M.areaShare(100, 100), 1, "ровно 100 м² — весь счёт");
eq(M.areaShare(200, 100), 0.5, "200 м² — половина счёта");
close(M.areaShare(150, 100), 0.6667, "150 м² — две трети счёта");
eq(M.areaShare(NaN, 100), 1, "площадь не указана — считаем весь счёт");
eq(M.areaShare(0, 100), 1, "нулевая площадь — считаем весь счёт");

console.log("\n--- Расчёт предельной экономии ---");
var r1 = M.calcYear(900, 2, 90, 1, 12);
close(r1.perMonth, 450, "счёт 900 за два месяца — это 450 в месяц");
close(r1.saveMonth, 405, "предел скидки за месяц при девяноста процентах");
close(r1.payMonth, 45, "к оплате остаётся десятая часть");
close(r1.savePeriod, 4860, "за все двенадцать месяцев");

var r2 = M.calcYear(600, 1, 90, 1, 12);
close(r2.perMonth, 600, "счёт за один месяц берётся как есть");
close(r2.savePeriod, 6480, "годовой предел при счёте шестьсот в месяц");

var r3 = M.calcYear(7200, 12, 90, 1, 12);
close(r3.perMonth, 600, "годовой счёт делится на двенадцать");
close(r3.savePeriod, 6480, "результат совпадает с помесячным вводом");

var r4 = M.calcYear(1000, 2, 90, 0.5, 12);
close(r4.eligiblePerMonth, 250, "при площади вдвое больше предела льготируется половина");
close(r4.saveMonth, 225, "скидка считается только с льготируемой части");

var r5 = M.calcYear(500, 2, 25, 1, 12);
close(r5.saveMonth, 62.5, "другой предел — двадцать пять процентов");

eq(M.calcYear(0, 2, 90, 1, 12), null, "нулевой счёт — расчёта нет");
eq(M.calcYear(-100, 2, 90, 1, 12), null, "отрицательный счёт — расчёта нет");
eq(M.calcYear(900, 0, 90, 1, 12), null, "нулевой период — расчёта нет");
eq(M.calcYear(NaN, 2, 90, 1, 12), null, "пустое поле — расчёта нет");

console.log("\n--- Срок обращения для репатрианта ---");
var today = new Date("2026-08-04");
var a1 = M.monthsLeft("2026-02-04", today, 24, 12);
eq(a1.state, "active", "полгода назад — срок идёт");
eq(a1.passed, 6, "прошло шесть месяцев");
eq(a1.windowLeft, 18, "остаётся восемнадцать месяцев окна");
eq(a1.left, 12, "полных двенадцать месяцев скидки ещё доступны");

var a2 = M.monthsLeft("2024-08-04", today, 24, 12);
eq(a2.state, "expired", "два года назад — срок прошёл");
eq(a2.left, 0, "скидки как репатрианту уже нет");

var a3 = M.monthsLeft("2024-09-04", today, 24, 12);
eq(a3.state, "active", "без одного месяца два года — ещё успевает");
eq(a3.windowLeft, 1, "остаётся один месяц");
eq(a3.left, 1, "и получить можно только за один месяц");

var a4 = M.monthsLeft("2025-02-04", today, 24, 12);
eq(a4.passed, 18, "прошло восемнадцать месяцев");
eq(a4.left, 6, "остаток окна меньше двенадцати, значит шесть");

var a5 = M.monthsLeft("2027-01-01", today, 24, 12);
eq(a5.state, "future", "дата в будущем распознаётся");

eq(M.monthsLeft("не дата", today, 24, 12), null, "мусор вместо даты не ломает расчёт");

var a6 = M.monthsLeft("2026-08-20", today, 24, 12);
eq(a6.state, "future", "дата этого месяца, но позже сегодняшнего дня");

console.log("\n--- Склонение слова «месяц» ---");
eq(M.pluralRu(1, "месяц", "месяца", "месяцев"), "месяц", "один месяц");
eq(M.pluralRu(2, "месяц", "месяца", "месяцев"), "месяца", "два месяца");
eq(M.pluralRu(5, "месяц", "месяца", "месяцев"), "месяцев", "пять месяцев");
eq(M.pluralRu(11, "месяц", "месяца", "месяцев"), "месяцев", "одиннадцать месяцев");
eq(M.pluralRu(12, "месяц", "месяца", "месяцев"), "месяцев", "двенадцать месяцев");
eq(M.pluralRu(21, "месяц", "месяца", "месяцев"), "месяц", "двадцать один месяц");
eq(M.pluralRu(22, "месяц", "месяца", "месяцев"), "месяца", "двадцать два месяца");
eq(M.pluralRu(0, "месяц", "месяца", "месяцев"), "месяцев", "ноль месяцев");

console.log("\n=========================================");
console.log("  Успешно: " + passed + ", с ошибкой: " + failed);
console.log("=========================================\n");
process.exit(failed === 0 ? 0 : 1);