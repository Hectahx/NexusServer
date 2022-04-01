const bcrypt = require("bcrypt");
const { guid } = require("./guid");
const saltRounds = 10;

function signup(result, websocketCon) {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    bcrypt.hash(result.password, saltRounds, function (err, hash) {
      var guidString = guid();
      connection.query(
        `SELECT * from users where email = '${result.email}' OR user_name = '${result.username}'`,
        (err, rows) => {
          connection.release();
          if (rows.length == 0) {
            connection.query(
              `INSERT INTO users (id, email, user_name, password, clientId, time) VALUES (NULL, '${result.email}', '${result.username}', '${hash}', '${guidString}', CURRENT_TIMESTAMP)`,
              (err, rows) => {
                connection.release(); // return the connection to pool
                if (!err) {
                  console.log(rows);
                } else {
                  console.log(err);
                }
              }
            );
          }
          else{
            console.log("This email is taken");
          }
        }
      );
    });
  });
}

module.exports = { signup };
