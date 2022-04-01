const bcrypt = require("bcrypt");
const saltRounds = 10;

function login(result, websocketCon) {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      `SELECT * from users WHERE email='${result.email}'`,
      (err, rows) => {
        connection.release(); // return the connection to pool
        if (!err) {
          let databasePassword;
          try {
            databasePassword = rows[0].password;
          } catch (error) {
            console.log("no match!");
            return;
          }

          bcrypt.compare(
            result.password,
            databasePassword,
            function (err, same) {
              if (same) {
                console.log("its a match");
                console.log(rows[0].clientId);
                clients[rows[0].clientId] = {
                  connection: websocketCon,
                  isUser: true
                };
                const payload = {
                  method: "loggedIn",
                  clientId: rows[0].clientId,
                  username: rows[0].user_name 
                };
                websocketCon.send(JSON.stringify(payload))
              } else {
                console.log("no match");
              }
            }
          );
        } else {
          console.log(err);
        }
      }
    );
  });
}

module.exports = { login };
