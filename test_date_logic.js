const date = "2024-02-12"; // Dashboard Date
const resignationISO = "2024-02-10T00:00:00.000Z"; // Resignation in DB

const u = { resignationDate: resignationISO };

function check(u, date) {
    if (u.resignationDate) {
        const resignDate = new Date(u.resignationDate);
        const currentDate = new Date(date);

        console.log(`Resign Raw: ${u.resignationDate}`);
        console.log(`Current Raw: ${date}`);
        console.log(`Resign Object: ${resignDate.toString()}`);
        console.log(`Current Object: ${currentDate.toString()}`);

        resignDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        console.log(`Resign SetHours: ${resignDate.toString()} (${resignDate.getTime()})`);
        console.log(`Current SetHours: ${currentDate.toString()} (${currentDate.getTime()})`);

        const result = currentDate < resignDate;
        console.log(`Result (Included?): ${result}`);
        return result;
    }
    return true;
}

console.log("--- Test 1: Past Resignation ---");
check(u, date);

console.log("\n--- Test 2: Same Day ---");
check({ resignationDate: "2024-02-12T00:00:00.000Z" }, "2024-02-12");

console.log("\n--- Test 3: Future Resignation ---");
check({ resignationDate: "2024-02-20T00:00:00.000Z" }, "2024-02-12");
