var admin = require("firebase-admin");

var serviceAccount = require("../config/textme-312ad-firebase-adminsdk-ho0u0-50beee19eb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://textme-312ad.firebaseio.com"
});
