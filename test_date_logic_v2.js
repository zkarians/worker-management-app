const date = "2024-02-12"; // Dashboard Date (Target: Feb 12)
const resignationISO = "2024-02-10T00:00:00.000Z"; // User Resigned Feb 10 (Target: Should be Excluded)

function check(u, date) {
    if (u.resignationDate) {
        console.log(`\nInput Resign: ${u.resignationDate}`);
        console.log(`Input Date:   ${date}`);

        const resignDate = new Date(u.resignationDate);
        const currentDate = new Date(date);

        // Before setHours
        console.log(`Resign Object (Before):  ${resignDate.toString()}`);
        console.log(`Current Object (Before): ${currentDate.toString()}`);

        resignDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        console.log(`Resign Object (After):   ${resignDate.toString()} (${resignDate.getTime()})`);
        console.log(`Current Object (After):  ${currentDate.toString()} (${currentDate.getTime()})`);

        const result = currentDate < resignDate;
        console.log(`current < resign: ${result}`);

        if (result) console.log("=> User is INCLUDED (Working)");
        else console.log("=> User is EXCLUDED (Resigned)");

        return result;
    }
    return true;
}

console.log("--- Test 1: Dashboard is AFTER Resignation (Should be Excluded) ---");
check({ resignationDate: resignationISO }, date);

console.log("\n--- Test 2: Dashboard is BEFORE Resignation (Should be Included) ---");
check({ resignationDate: resignationISO }, "2024-02-08");
