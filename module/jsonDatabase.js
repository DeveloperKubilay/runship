const kubitdb = require("kubitdb");

let db = null;

module.exports = {
    json: async function (path) {
        db = new kubitdb(path);
    },
    addTestVM: async function (object) {
        db.push("vms", object);
    },
    getAllVMs: async function () {
        return db.get("vms");
    }
}