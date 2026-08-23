const cryptoUtil = require("./crypto");

let db = null;
let firebaseApp = null;
let firestore = null;

function loadFirebase() {
    try {
        if (!firebaseApp) {
            firebaseApp = require("firebase/app");
        }
        if (!firestore) {
            firestore = require("firebase/firestore");
        }
        return { ...firebaseApp, ...firestore };
    } catch (e) {
        throw new Error(
            "Firebase is not installed. To use Firebase functionality, please install it manually: npm i firebase"
        );
    }
}

module.exports = {
    connect: async function (settings, Password) {
        const { initializeApp, getFirestore } = loadFirebase();
        if (Password) cryptoUtil.updateKey(Password);
        const app = initializeApp(settings);
        db = getFirestore(app);
    },
    isconnected: function () {
        return db != null;
    },
    addTestVM: async function (object) {
        if (!db) throw new Error("Firebase is not connected. Call runship.connect() first.");
        const { collection, addDoc } = loadFirebase();
        try {
            const encryptedObject = cryptoUtil.encryptObject(object);
            await addDoc(collection(db, "vms"), encryptedObject);
        } catch (e) { }
    },
    getAllVMs: async function () {
        if (!db) return [];
        const { collection, getDocs } = loadFirebase();
        const vms = [];
        const querySnapshot = await getDocs(collection(db, "vms"));
        querySnapshot.forEach((doc) => {
            const decryptedData = {};
            const encryptedData = doc.data();
            for (const key in encryptedData) {
                if (encryptedData.hasOwnProperty(key)) {
                    decryptedData[key] = cryptoUtil.decrypt(encryptedData[key]);
                }
            }
            vms.push(decryptedData);
        });
        return vms;
    }
};