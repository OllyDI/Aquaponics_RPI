const schedule = require('node-schedule');
const mysql = require('mysql');
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);

module.exports = function(options, local_options) {
    const db = mysql.createConnection(options);
    const local_db = mysql.createConnection(local_options);
    rule = '0 0/5 * * * *';
    let device_id;

    local_db.query('select local_id from local_device;', 
        function(err, data) {
            if (err) console.log('device is null');
            else device_id = data[0].local_id;
        }
    )
    schedule.scheduleJob(rule, async() => {
        db.query('select max(time) as time from envir;', 
            function(err, data) {
                if (err) console.log('db max time select error');
                else {
                    const max_time = data[0].time;
                    local_db.query('select * from local_envir where time > (?);', [max_time],
                        function(err, data) {
                            if (err) console.log('db local_envir data select error');
                            else {
                                if (data.length != 0) {
                                    $.each(data, function(i, v) {
                                        data[i].device = Number(device_id);
                                        if (data.length - 1 == i) {
                                            var insData = [];

                                            $.each(data, function(i, v) {
                                                insData.push([
                                                    v.device == null ? 0 : v.device,
                                                    v.ex_temp == null ? 0 : v.ex_temp,
                                                    v.water_temp == null ? 0 : v.water_temp,
                                                    v.hum == null ? 0 : v.hum,
                                                    v.illum == null ? 0 : v.illum,
                                                    v.motor == null ? 0 : v.motor,
                                                    v.bubble == null ? 0 : v.bubble,
                                                    v.led == null ? 0 : v.led,
                                                    v.ec == null ? 0 : v.ec,
                                                    v.ph == null ? 0 : v.ph,
                                                    v.do == null ? 0 : v.do,
                                                    v.time == null ? 0 : v.time
                                                ])
                                                if (data.length - 1 == i) {
                                                    db.query('insert into envir (device, ex_temp, water_temp, hum, illum, motor, bubble, led, ec, ph, do, time) values ?', [insData],
                                                        function(err, data) {
                                                            if (err) console.log('schedule: db envir data insert error');
                                                            else console.log('schedule: db envir data insert success');
                                                        }
                                                    )
                                                }
                                            })
                                        }
                                    })
                                } else console.log('schedule: db envir data insert null');
                            }
                        }
                    )
                }
            }
        )
    })
}