var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql')
var express = require('express')
var app = express();
var indexRouter = require('./routes/index');
var crypto = require('crypto');
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
var requestIp = require('request-ip');
// const { exec } = require('child_process');
equire("dotenv").config({ path: "lib/settings.env" })


// DB 설정
const options = {
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT,
  user: process.env.DB_ID,
  password: process.env.DB_PW,
  database: process.env.DB_NAME
}
const local_options = {
  host: process.env.LOCAL_DB_HOST, 
  port: process.env.LOCAL_DB_PORT,
  user: process.env.LOCAL_DB_ID,
  password: process.env.LOCAL_DB_PW,
  database: process.env.LOCAL_DB_NAME
}
const db = mysql.createConnection(options);
const local_db = mysql.createConnection(local_options);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.listen(3003, '0.0.0.0');

app.use('/', indexRouter);


// var Stream = require('node-rtsp-stream')
// const streamUrl = '';
// var stream = new Stream({
// 	name: 'name',
// 	streamUrl: streamUrl,
// 	wsPort: 9999,
// 	ffmpegOptions: { // options ffmpeg flags
// 		'-stats': '', // an option with no neccessary value uses a blank string
// 		'-r': 30 // options with required values specify the value after the key
// 	}
// })


// 스트리밍
// app.post('/get_stream', function(req, res) {
//   var stream = new Stream({
//     name: 'name',
//     streamUrl: 'rtsp://{aqufarm}:{aqufarm6552}@',
//     wsPort: 9999,
//     ffmpegOptions: { // options ffmpeg flags
//       '-stats': '', // an option with no neccessary value uses a blank string
//       '-r': 30 // options with required values specify the value after the key
//     }
//   })

//   res.send(stream);
// })


app.post('/get_local_device', function(req, res) {
  local_db.query('select * from local_device',
    function(err, data) {
      if (err) throw(err);
      else {
        if (data.length == 0) {
          res.send({ ok: false })
        }
        else {
          res.send({
            ok: true,
            service: data[0].service,
            device_name: data[0].name,
            device_id: data[0].local_did
          })
        }
      }
    }
  )
})

app.post('/insert_device', function(req, res) {
  const dname = req.body.device_name;
  const wname = req.body.wifi_name;
  const wpw = req.body.wifi_pw;
  const uid = req.body.uid;
  const service = req.body.service;
  const clientIp = requestIp.getClientIp(req);
  let today = new Date();
  let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time = date + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var ok = [0, 0, 0, 0];
  let msg = '';

  exec(`sudo nmcli device wifi connect ${wname} password ${wpw}`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      res.send({ ok: false, msg: '와이파이명 또는 비밀번호를 확인해주세요.' });
      return;
    }
  
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    
  db.query('insert into devices (wifi_id, wifi_pw, name, date, service, ip) values (?, ?, ?, ?, ?, ?)', [wname, wpw, dname, date, service, clientIp],
    function(err, data) {
      if (err) msg = '기기 설정에 실패했습니다.';
      else {
        const device_id=data.insertId

        local_db.query('delete from local_device', function(err) { if(err) throw(err); })
        local_db.query('insert into local_device (local_id, name, wifi_id, wifi_pw, service) values (?, ?, ?, ?, ?)', [device_id, dname, wname, wpw, service],
          function(err, data) {
            if (err) msg = '기기 설정에 실패했습니다.';
            else {
              ok[0] = 1;
              console.log('local_device');
            }
          }
        )

        local_db.query('insert into local_sensor (sd_id, motor, bubble, led) values (?, ?, ?, ?)', [device_id, 1, 0, 0],
          function(err, data) {
            if (err) msg = '센서 설정에 실패했습니다.';
            else {
              ok[1] = 1;
              console.log('local_sensor');
            }
          }
        )

        db.query('insert into link (name, user_id, device_id, time, link_level) values (?, ?, ?, ?, ?)', [dname, uid, device_id, time, 2], 
          function(err, data) {
            if (err) {  msg = '입력한 사용자가 존재하지 않습니다.'; }
            else {
              ok[2] = 1;
              console.log('server_link');
            }
          }
        )
        db.query('insert into sensor (sd_id, motor, bubble, led) values (?, ?, ?, ?)', [device_id, 1, 0, 0],
          function(err, data) {
            if (err) msg = '센서 설정에 실패했습니다.';
            else {
              ok[3] = 1;
              console.log('server_sensor');
            }
          }
        )

        if (ok[0] == ok[1] == ok[2] == ok[3] == 1) {
          console.log(ok);
          res.send({ ok: true, msg: '기기 설정이 완료되었습니다.' });
        } else {
          res.send({ ok: false, msg: msg });
        }
      }
    }
  ) 
  });

})


app.post('/get_local_device', function(req, res) {
  db.query('select * from local_device', 
    function(err, data) {
      if (err) throw(err);
      else {
        if (data.length == 0) res.send({ ok: false });
        else {
          res.send({
            ok: true,
            service: data[0].service,
            device_name: data[0].name,
            device_id: data[0].device_id,
          });
        }
      }
    }
  )
})


// 환경정보 데이터
app.post('/search_envir', function(req, res) {
  const start = req.body.start;
  const end = req.body.end;
  let sql = '';
  sql = 'select * from local_envir'
  if (start == end) sql += ` where time='${end}'`
  else if (start != '' && start != undefined) sql += ` and time between str_to_date('${start}', '%Y-%m-%d %H:%i:%s') and str_to_date('${end}', '%Y-%m-%d %H:%i:%s')`
  local_db.query(sql, function(err, data) {
    if (err) throw(err);
    else {
      if (data.length == 0) res.send();
      else {
        data = data.sort(function(a, b) { return new Date(a.time) - new Date(b.time); })
        res.send(data);
      }
    }
  })
})


// 온오프 센서 제어
app.get('/get_sensor', function(req, res) {
  const device_id = req.query.device_id;

  db.query('select * from sensor where sd_id=?', [Number(device_id)],
    function(err, data) {
      if (err) throw(err);
      res.send(data);
    }
  )
})
app.get('/update_sensor', function(req, res) {
  const device_id = req.query.device_id;
  const sensor = req.query.sensor;
  const val = req.query.val;

  db.query(`update sensor set ${sensor}=? where sd_id=?`, [Number(val), Number(device_id)], 
    function(err, data) {
      if (err) throw(err);
      res.send();
    }
  )
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
