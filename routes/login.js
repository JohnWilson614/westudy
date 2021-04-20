const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const emailConfigPath = path.join(__dirname, 'email.json');
const emailConfig = JSON.parse(fs.readFileSync(emailConfigPath));
const transporter = nodemailer.createTransport(emailConfig);

const router = express.Router();

const axios = require('axios');

const Emails = {};

class Email {
  constructor(email) {
    this.email = email;
    this.code = this.generateCode();
  }

  // 生成[minNum, maxNum]之间的验证码
  static randomNum(minNum, maxNum) {
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
  }

  generateCode() {
    return this.randomNum(100000, 999999);
  }

  sendEmail() {
    const from = emailConfig.auth.user;
    const mailOptions = {
      from,
      to: `${this.email}`,
      cc: from,
      subject: 'WeStudy 登陆验证码',
      text: `Hi!\n This is following verification code：\n${this.code}`,
    };

    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
  }
}

// 生成邮箱验证码
// 需要参数
// email
router.post('/login/code', (req, res, next) => {
  const email = new Email(req.body.email);
  Email[email.email] = email;
  email.sendEmail();
  res.json({
    status: 0,
    msg: 'ok',
    results: {},
  });
});

// 登陆验证
// 需要参数
// 邮箱 验证码
router.post('/login', (req, res, next) => {
  const { email } = req.body;
  const { code } = req.body;
  if (!Email[email] || !Email[email].code || Email[email].code !== code) {
    res.json({
      status: 1,
      msg: 'err',
      results: 'code is not correct.',
    });
  } else {
    res.json({
      status: 0,
      msg: 'ok',
      results: {},
    });
    req.session.email = email;
  }
});

module.exports = router;
