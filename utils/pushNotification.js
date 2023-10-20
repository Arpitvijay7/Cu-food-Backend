const fs = require("fs");
const path = require("path");
let FCM = require("fcm-node");

const PushNotification = require("../models/PushNotification");

exports.sendPushNotification = async (userId, message ,body) => {
  try {
    console.log("User Id:- " + userId);
    console.log("message:- " + message);

    fs.readFile(
      path.join(__dirname, "../FireBaseConfig.json"),
      "utf8",
      async (err, jsonString) => {
        if (err) {
          console.log("Error reading file from disk:", err);
          return err;
        }
        try {
          //firebase push notification send
          const data = JSON.parse(jsonString);
          let serverKey = data.SERVER_KEY;
          let fcm = new FCM(serverKey);

          let push_tokens = await PushNotification.find({
            user: userId,
          });

          let reg_ids = [];
          push_tokens.forEach((token) => {
            reg_ids.push(token.fcm_token);
          });

          if (reg_ids.length > 0) {
            let pushMessage = {
              //this may lety according to the message type (single recipient, multicast, topic, et cetera)
              registration_ids: reg_ids,
              content_available: true,
              mutable_content: true,
              notification: {
                title: message,
                body: body,
                click_action: "https://vendor.cufoodz.com",
                icon: "myicon", //Default Icon
                // sound: "mySound", //Default sound
                vibrate: [200, 100, 200] //default vibration
                // badge: badgeCount, example:1 or 2 or 3 or etc....
              },
              // data: {
              //   notification_type: 5,
              //   conversation_id:inputs.user_id,
              // }
            };

            fcm.send(pushMessage, function (err, response) {
              if (err) {
                console.log("Something has gone wrong!", err);
              } else {
                console.log("Push notification sent.", response);
              }
            });
          }
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
