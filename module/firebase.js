const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs } = require("firebase/firestore");
const cryptoUtil = require("./crypto");

let db = null;

module.exports = {
    connect: async function (settings,Password) {
        cryptoUtil.updateKey(Password);
        const app = initializeApp(settings);
        db = getFirestore(app);
    },
    addTestVM: async function (object) {
        try {
            const encryptedObject = cryptoUtil.encryptObject(object);
            await addDoc(collection(db, "vms"), encryptedObject);
        } catch (e) { }
    },
    getAllVMs: async function () {
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
}