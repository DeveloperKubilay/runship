# Auto-Deploy 🚀

## Demo 🎥
Örnek videoyu izleyin:
https://youtu.be/Y0v-qoW07jI

Auto-Deploy, uygulamaları birden fazla sanal makineye (VM) dağıtma sürecini kolaylaştırmak için tasarlanmış Node.js tabanlı bir dağıtım otomasyon aracıdır. Firebase'i VM yönetimi ve SSH'yi güvenli iletişim için kullanır.

## Özellikler 🌟
- **Firebase Entegrasyonu**: VM'leri güvenli bir şekilde Firebase Firestore ile yönetin.
- **Şifreleme**: Hassas veriler AES-256-CBC kullanılarak şifrelenir.
- **Toplu Dağıtım**: Birden fazla VM'ye paralel olarak dağıtım yapın.
- **Özelleştirilebilir Komutlar**: Esnek dağıtım iş akışları için yükleme öncesi ve çalışma öncesi komutlar çalıştırın.

## Kurulum 🛠️
1. Paketi yükleyin:
   ```bash
   npm install runship
   ```

## Yapılandırma ⚙️
`config.json` dosyasını Firebase yapılandırmanız ve şifreleme şifrenizle güncelleyin:
```json
{
  "firebaseConfig": {
    "apiKey": "<API_ANAHTARINIZ>",
    "authDomain": "<AUTH_DOMAIN>",
    "projectId": "<PROJE_ID>",
    "storageBucket": "<DEPOLAMA_BUCKET>",
    "messagingSenderId": "<MESAJLAŞMA_GÖNDEREN_ID>",
    "appId": "<APP_ID>"
  },
  "Password": "<ŞİFRELEME_ŞİFRENİZ>"
}
```

## Kullanım 🚀
### Uygulama Dağıtımı
1. `index.js` dosyasını dağıtım yapılandırmanızla güncelleyin:
   ```javascript
   const runship = require("runship");
   runship.connect(require("./config.json").firebaseConfig);

   runship.deploy({
       uploadFolder: "example-folder",
       serviceName: "example.service",
       multiply: 5,
       verbose: true,
       beforeUpload: "mv data.json ../data.json",
       beforeRun: "echo hi > test.txt && mv ../data.json data.json && /usr/bin/npm i",
   });
   ```

### VM Ekleme
1. `addVM.js` dosyasını VM detaylarınızla güncelleyin:
   ```javascript
   const runship = require("runship");
   runship.connect(require("./config.json").firebaseConfig);

   runship.addTestVM({
       host: "<VM_HOST>",
       username: "<KULLANICI_ADI>",
       password: null,
       port: 22,
       path: "/home/user/module",
       privateKey: fs.readFileSync("path/to/private/key", 'utf8'),
   });
   ```

### Servis Oluşturma ve Başlatma
1. `services.js` dosyasını servis yapılandırmanızla güncelleyin:
   ```javascript
   const runship = require("runship");
   const config = require("./config.json");

   async function main() {
       runship.json("./settings.json");

       await runship.createService({
           name: "example-service",
           execStart: "/usr/bin/node index.js",
       });

       await runship.startService({
           name: "example-service",
       });

       process.exit(0);
   }

   main();
   ```