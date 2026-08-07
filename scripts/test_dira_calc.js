/* Тесты модуля «Дира бе-ханаха». Запуск: node tests/test_calc.js */
"use strict";
var fs = require("fs"), path = require("path");

function load() {
  var src = fs.readFileSync(path.join(__dirname, "..", "dira.js"), "utf8");
  var m = { exports: {} };
  var doc = {
    readyState: "complete",
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    createElement: function () { return { style: {}, appendChild: function () {}, setAttribute: function () {} }; },
    addEventListener: function () {}
  };
  return new Function("module", "document", "window", src + "\nreturn module.exports;")(m, doc, {});
}
var M = load();
var DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "dira.json"), "utf8"));

var ok = 0, bad = 0;
function eq(a, e, n) {
  if (JSON.stringify(a) === JSON.stringify(e)) { ok++; console.log("  ok   " + n); }
  else { bad++; console.log("  FAIL " + n + "\n         ждали: " + JSON.stringify(e) + "\n         вышло: " + JSON.stringify(a)); }
}

var D = DATA.status.dates;

console.log("\n--- Определение фазы розыгрыша ---");
eq(M.detectPhase(D, new Date("2026-03-01")), "before", "до объявления");
eq(M.detectPhase(D, new Date("2026-04-01")), "before", "объявлен, запись не открыта");
eq(M.detectPhase(D, new Date("2026-04-15")), "open", "первый день записи");
eq(M.detectPhase(D, new Date("2026-05-20")), "open", "запись идёт");
eq(M.detectPhase(D, new Date("2026-06-22")), "closed", "день закрытия записи");
eq(M.detectPhase(D, new Date("2026-07-10")), "closed", "ждём розыгрыша");
eq(M.detectPhase(D, new Date("2026-07-26")), "draw", "день розыгрыша");
eq(M.detectPhase(D, new Date("2026-07-30")), "draw", "после розыгрыша, до рассылки");
eq(M.detectPhase(D, new Date("2026-08-02")), "notify", "начало рассылки");
eq(M.detectPhase(D, new Date("2026-08-04")), "notify", "сегодня — рассылка идёт");
eq(M.detectPhase(D, new Date("2026-09-15")), "notify", "последний день этапа");
eq(M.detectPhase(D, new Date("2026-09-16")), "done", "этап завершён");
eq(M.detectPhase(D, new Date("2027-01-01")), "done", "далёкое будущее — завершён");

console.log("\n--- У каждой фазы есть описание ---");
var phases = ["before", "open", "closed", "draw", "notify", "done"];
phases.forEach(function (p) {
  eq(!!(DATA.status.states[p] && DATA.status.states[p].title), true, "описание фазы «" + p + "»");
});

console.log("\n--- Состояние шага ленты ---");
eq(M.stepState("2026-08-04", new Date("2026-08-04")).cls, "now", "сегодняшний шаг");
eq(M.stepState("2026-07-26", new Date("2026-08-04")).cls, "past", "прошедший шаг");
eq(M.stepState("2026-09-15", new Date("2026-08-04")).cls, "next", "будущий шаг");
eq(M.stepState("2026-08-01", new Date("2026-08-04")).tail, "3 дня назад", "подпись прошедшего");
eq(M.stepState("2026-08-05", new Date("2026-08-04")).tail, "через 1 день", "подпись будущего");
eq(M.stepState("2026-08-04", new Date("2026-08-04")).tail, "сегодня", "подпись сегодняшнего");

console.log("\n--- Формат даты ---");
eq(M.fmtDate("2026-08-04"), "04.08.2026", "дата в привычном виде");
eq(M.fmtDate("2026-12-31"), "31.12.2026", "конец года");

console.log("\n--- Склонение ---");
eq(M.pluralRu(1, "день", "дня", "дней"), "день", "один день");
eq(M.pluralRu(3, "день", "дня", "дней"), "дня", "три дня");
eq(M.pluralRu(11, "день", "дня", "дней"), "дней", "одиннадцать дней");
eq(M.pluralRu(42, "день", "дня", "дней"), "дня", "сорок два дня");
eq(M.pluralRu(0, "день", "дня", "дней"), "дней", "ноль дней");

console.log("\n--- Целостность данных ---");
eq(DATA.future.cities.length > 0, true, "список будущих городов не пуст");
eq(DATA.archive.cities.length > 0, true, "архив городов не пуст");
eq(DATA.archive.years.length, 5, "архив ровно за пять лет");
var sumU = DATA.future.cities.reduce(function (s, c) { return s + c.units; }, 0);
eq(sumU, DATA.future.total_units, "сумма квартир сходится с итогом");
var sumP = DATA.future.cities.reduce(function (s, c) { return s + c.projects; }, 0);
eq(sumP, DATA.future.total_projects, "сумма проектов сходится с итогом");
eq(DATA.future.cities.length, DATA.future.total_cities, "число городов сходится");
var noPer = DATA.archive.cities.filter(function (c) { return !c.per_unit; });
eq(noPer.length, 0, "у каждого города посчитана нагрузка");
var badYear = DATA.archive.years.filter(function (y) { return y.year < 2021 || y.year > 2025; });
eq(badYear.length, 0, "годы только с 2021 по 2025");

console.log("\n--- Разброс между городами ---");
var per = DATA.archive.cities.map(function (c) { return c.per_unit; });
var mn = Math.min.apply(null, per), mx = Math.max.apply(null, per);
eq(mx > mn * 10, true, "разброс превышает десятикратный");
console.log("       минимум " + mn + ", максимум " + mx + ", отношение " + Math.round(mx / mn));

console.log("\n--- Цвет тепловой шкалы ---");
eq(M.heatColor(0, 0, 10).indexOf("hsl(145") === 0, true, "минимум зелёный");
eq(M.heatColor(10, 0, 10).indexOf("hsl(0") === 0, true, "максимум красный");
eq(typeof M.heatColor(5, 0, 10), "string", "середина возвращает цвет");

console.log("\n=========================================");
console.log("  Успешно: " + ok + ", с ошибкой: " + bad);
console.log("=========================================\n");
process.exit(bad === 0 ? 0 : 1);