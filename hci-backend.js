const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
/* 使用bodyParser中间件让express能处理post请求 */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/* 
接口设计
auth/loginUser
- get:获取loginUser
- post:
  - 验证账号密码并设置loginUser
  - type:add(添加users到数据库)
*/
app.get("/", function (req, res) {
  fs.readFile("./database/currentUser.json", (err, data) => {
    if (err) {
      console.error(err);
    }
    console.log("有人访问了,我们返回一个", JSON.parse(data.toString()));
    res.send(JSON.parse(data.toString()));
  });
});

//设置currentUser
app.post("/", function (req, res) {
  const { userName, password } = req.body;
  fs.readFile("./database/users.json", (err, data) => {
    if (err) {
      console.error(err);
    }
    const users = JSON.parse(data.toString());
    const matchedAccount = users.find((cur) => {
      if (cur.userName === userName && cur.password === password) {
        return true;
      }
      return false;
    });
    if (matchedAccount) {
      //写currentUser文件
      const content = JSON.stringify(matchedAccount);
      fs.writeFile("./database/currentUser.json", content, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //文件写入成功。
      });
    }
    res.send(matchedAccount);
  });
});
app.post("/register", function (req, res) {
  const { userName, password, type } = req.body;
  fs.readFile("./database/users.json", (err, data) => {
    if (err) {
      console.error(err);
    }
    const users = JSON.parse(data.toString());
    const hasUser = users.some((cur) => {
      if (cur.userName === userName) {
        return true;
      }
      return false;
    });
    if (hasUser) {
      res.send("false");
    } else {
      res.send("true");
      //写currentUser文件
      const content = JSON.stringify([
        ...users,
        {
          userName,
          password,
          type,
        },
      ]);
      fs.writeFile("./database/users.json", content, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  });
});

let server = app.listen(8081, "localhost", function () {
  const { address, port } = server.address();
  console.log(server.address());
  console.log("应用实例，访问地址为 http://%s:%s", address, port);
});
