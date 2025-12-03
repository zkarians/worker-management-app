"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var prisma = new client_1.PrismaClient();
function importData(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, parsedData, data, attendances, leaveRequests, rosters, dailyLogs, announcements, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    console.log('📥 Importing data to database...');
                    console.log("\uD83D\uDCC1 Reading from: ".concat(filename));
                    _m.label = 1;
                case 1:
                    _m.trys.push([1, 36, 37, 39]);
                    fileContent = fs.readFileSync(filename, 'utf-8');
                    parsedData = JSON.parse(fileContent);
                    data = parsedData.data || parsedData;
                    console.log('\n⚠️  WARNING: This will replace all existing data!');
                    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
                    // Wait 5 seconds before proceeding
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })
                        // Clear existing data (in reverse order of dependencies)
                    ];
                case 2:
                    // Wait 5 seconds before proceeding
                    _m.sent();
                    // Clear existing data (in reverse order of dependencies)
                    console.log('🗑️  Clearing existing data...');
                    return [4 /*yield*/, prisma.rosterAssignment.deleteMany()];
                case 3:
                    _m.sent();
                    return [4 /*yield*/, prisma.roster.deleteMany()];
                case 4:
                    _m.sent();
                    return [4 /*yield*/, prisma.attendance.deleteMany()];
                case 5:
                    _m.sent();
                    return [4 /*yield*/, prisma.leaveRequest.deleteMany()];
                case 6:
                    _m.sent();
                    return [4 /*yield*/, prisma.dailyLog.deleteMany()];
                case 7:
                    _m.sent();
                    return [4 /*yield*/, prisma.announcement.deleteMany()];
                case 8:
                    _m.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 9:
                    _m.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 10:
                    _m.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 11:
                    _m.sent();
                    return [4 /*yield*/, prisma.team.deleteMany()];
                case 12:
                    _m.sent();
                    return [4 /*yield*/, prisma.company.deleteMany()];
                case 13:
                    _m.sent();
                    console.log('✅ Existing data cleared\n');
                    // Import data (in order of dependencies)
                    console.log('📝 Importing new data...');
                    if (!(((_a = data.companies) === null || _a === void 0 ? void 0 : _a.length) > 0)) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.company.createMany({ data: data.companies })];
                case 14:
                    _m.sent();
                    console.log("  \u2713 Companies: ".concat(data.companies.length));
                    _m.label = 15;
                case 15:
                    if (!(((_b = data.teams) === null || _b === void 0 ? void 0 : _b.length) > 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.team.createMany({ data: data.teams })];
                case 16:
                    _m.sent();
                    console.log("  \u2713 Teams: ".concat(data.teams.length));
                    _m.label = 17;
                case 17:
                    if (!(((_c = data.users) === null || _c === void 0 ? void 0 : _c.length) > 0)) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.user.createMany({ data: data.users })];
                case 18:
                    _m.sent();
                    console.log("  \u2713 Users: ".concat(data.users.length));
                    _m.label = 19;
                case 19:
                    if (!(((_d = data.categories) === null || _d === void 0 ? void 0 : _d.length) > 0)) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.category.createMany({ data: data.categories })];
                case 20:
                    _m.sent();
                    console.log("  \u2713 Categories: ".concat(data.categories.length));
                    _m.label = 21;
                case 21:
                    if (!(((_e = data.products) === null || _e === void 0 ? void 0 : _e.length) > 0)) return [3 /*break*/, 23];
                    return [4 /*yield*/, prisma.product.createMany({ data: data.products })];
                case 22:
                    _m.sent();
                    console.log("  \u2713 Products: ".concat(data.products.length));
                    _m.label = 23;
                case 23:
                    if (!(((_f = data.attendances) === null || _f === void 0 ? void 0 : _f.length) > 0)) return [3 /*break*/, 25];
                    attendances = data.attendances.map(function (a) { return (__assign(__assign({}, a), { date: new Date(a.date) })); });
                    return [4 /*yield*/, prisma.attendance.createMany({ data: attendances })];
                case 24:
                    _m.sent();
                    console.log("  \u2713 Attendances: ".concat(data.attendances.length));
                    _m.label = 25;
                case 25:
                    if (!(((_g = data.leaveRequests) === null || _g === void 0 ? void 0 : _g.length) > 0)) return [3 /*break*/, 27];
                    leaveRequests = data.leaveRequests.map(function (lr) { return (__assign(__assign({}, lr), { startDate: new Date(lr.startDate), endDate: new Date(lr.endDate), createdAt: new Date(lr.createdAt) })); });
                    return [4 /*yield*/, prisma.leaveRequest.createMany({ data: leaveRequests })];
                case 26:
                    _m.sent();
                    console.log("  \u2713 Leave Requests: ".concat(data.leaveRequests.length));
                    _m.label = 27;
                case 27:
                    if (!(((_h = data.rosters) === null || _h === void 0 ? void 0 : _h.length) > 0)) return [3 /*break*/, 29];
                    rosters = data.rosters.map(function (r) { return (__assign(__assign({}, r), { date: new Date(r.date) })); });
                    return [4 /*yield*/, prisma.roster.createMany({ data: rosters })];
                case 28:
                    _m.sent();
                    console.log("  \u2713 Rosters: ".concat(data.rosters.length));
                    _m.label = 29;
                case 29:
                    if (!(((_j = data.rosterAssignments) === null || _j === void 0 ? void 0 : _j.length) > 0)) return [3 /*break*/, 31];
                    return [4 /*yield*/, prisma.rosterAssignment.createMany({ data: data.rosterAssignments })];
                case 30:
                    _m.sent();
                    console.log("  \u2713 Roster Assignments: ".concat(data.rosterAssignments.length));
                    _m.label = 31;
                case 31:
                    if (!(((_k = data.dailyLogs) === null || _k === void 0 ? void 0 : _k.length) > 0)) return [3 /*break*/, 33];
                    dailyLogs = data.dailyLogs.map(function (dl) { return (__assign(__assign({}, dl), { date: new Date(dl.date) })); });
                    return [4 /*yield*/, prisma.dailyLog.createMany({ data: dailyLogs })];
                case 32:
                    _m.sent();
                    console.log("  \u2713 Daily Logs: ".concat(data.dailyLogs.length));
                    _m.label = 33;
                case 33:
                    if (!(((_l = data.announcements) === null || _l === void 0 ? void 0 : _l.length) > 0)) return [3 /*break*/, 35];
                    announcements = data.announcements.map(function (a) { return (__assign(__assign({}, a), { createdAt: new Date(a.createdAt) })); });
                    return [4 /*yield*/, prisma.announcement.createMany({ data: announcements })];
                case 34:
                    _m.sent();
                    console.log("  \u2713 Announcements: ".concat(data.announcements.length));
                    _m.label = 35;
                case 35:
                    console.log('\n✅ Data imported successfully!');
                    return [3 /*break*/, 39];
                case 36:
                    error_1 = _m.sent();
                    console.error('❌ Error importing data:', error_1);
                    throw error_1;
                case 37: return [4 /*yield*/, prisma.$disconnect()];
                case 38:
                    _m.sent();
                    return [7 /*endfinally*/];
                case 39: return [2 /*return*/];
            }
        });
    });
}
// Get filename from command line argument
var filename = process.argv[2];
if (!filename) {
    console.error('❌ Please provide a filename as an argument');
    console.log('Usage: npm run db:import <filename>');
    process.exit(1);
}
var fullPath = path.isAbsolute(filename)
    ? filename
    : path.join(process.cwd(), filename);
if (!fs.existsSync(fullPath)) {
    console.error("\u274C File not found: ".concat(fullPath));
    process.exit(1);
}
importData(fullPath)
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
