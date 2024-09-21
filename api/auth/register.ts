import type { VercelRequest, VercelResponse } from '@vercel/node'
// import { connect } from '../../database/config';
const connnect = require('../../database/config');
import { sendMail } from '../../mail/config';
import { validateEmail } from '../../utils/validator/email';
import { generateCode } from '../../utils/code';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// User Database
import { User } from '../../database/models/user/model';
import { UserPending } from '../../database/models/user/pending';
import { UserBin } from '../../database/models/user/bin';

// Code Database
import { Code } from '../../database/models/code/model';
import { CodeBin } from '../../database/models/code/bin';

connnect();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const {
            first_name,
            last_name,
            email,
            country_code,
            contact_no,
            password,
            date_of_birth
        } = req.query;

        if (!first_name) return res.status(400).json({ error: 'First name is required' });
        if (!last_name) return res.status(400).json({ error: 'Last name is required' });
        if (!email) return res.status(400).json({ error: 'Email is required' });
        if (!password) return res.status(400).json({ error: 'Password is required' });
        if (!country_code) return res.status(400).json({ error: 'Country code is required' });
        if (!contact_no) return res.status(400).json({ error: 'Phone number is required' });
        if (!date_of_birth) return res.status(400).json({ error: 'Date of birth is required' });
        if (!date_of_birth) return res.status(400).json({ error: 'Date of birth is required' });
        if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email address' });

        let existUser = await User.findOne({ email: email }).lean();
        let existPendingUser = await UserPending.findOne({ email: email }).lean();
        let existBinUser = await UserBin.findOne({ email: email }).lean();
        if (existUser || existBinUser) return res.status(400).json({ error: 'User with this email exist' });

        const hashedPassword = await bcrypt.hash(password, 10);
        let user;
        let otp;

        if (existPendingUser) {
            const userData = {
                first_name,
                last_name,
                email,
                country_code,
                contact_no,
                password: hashedPassword,
                date_of_birth,
                status: false,
                admin: false,
                verified: false,
            };


            await UserPending.updateOne({ email: email }, userData);
            user = await UserPending.findOne({ email: email }).lean();
            otp = {
                user_id: user._id,
                email: user.email,
                verification_code: await generateCode(),
                created_time: new Date()
            }
            await Code.updateOne({ user_id: user._id }, otp);
        } else {
            user = new UserPending({
                first_name,
                last_name,
                email,
                country_code,
                contact_no,
                password: hashedPassword,
                date_of_birth,
                status: false,
                admin: false,
                verified: false,
            });

            await user.save();

            otp = new Code({
                user_id: user._id,
                email: user.email,
                verification_code: await generateCode(),
                created_time: new Date()
            });

            await otp.save();
        }

        sendMail({
            from: '"Grovix Lab" <noreply@grovixlab.com>',
            to: email,
            subject: "OTP Verification for Your Grovix Lab Account",
            text: `Hello,
            
            We received a request to verify your email address. Please use the following OTP to complete the verification process:
            
            OTP: ${otp.verification_code}
            
            This OTP is valid for 5 minutes. If you did not request this, please ignore this email.
            
            Thank you for using our services.`,
            html: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Grovix OTP Verification</title>
            </head>
            <body style="margin:0;padding:0" dir="ltr" bgcolor="#ffffff">
              <table border="0" cellspacing="0" cellpadding="0" align="center" id="email_table" style="border-collapse:collapse">
                <tbody>
                  <tr>
                    <td id="email_content" style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;background:#ffffff">
                      <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                        <tbody>
                          <tr>
                            <td height="20" style="line-height:20px"></td>
                          </tr>
                          <tr>
                            <td>
                              <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;text-align:center;width:100%">
                                <tbody>
                                  <tr>
                                    <td width="15px" style="width:15px"></td>
                                    <td style="line-height:0px;max-width:600px;padding:0 0 15px 0">
                                    </td>
                                    <td width="15px" style="width:15px"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table border="0" width="430" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 auto 0 auto">
                                <tbody>
                                  <tr>
                                    <td>
                                      <table border="0" width="430px" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 auto 0 auto;width:430px">
                                        <tbody>
                                          <tr>
                                            <td width="15" style="display:block;width:15px"></td>
                                          </tr>
                                          <tr>
                                            <td>
                                              <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                                                <tbody>
                                                  <tr>
                                                    <td>
                                                      <table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                                                        <tbody>
                                                          <tr>
                                                            <td width="20" style="display:block;width:20px"></td>
                                                            <td>
                                                              <table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                                                                <tbody>
                                                                  <tr>
                                                                    <td>
                                                                      <p style="margin:10px 0 10px 0;color:#565a5c;font-size:18px">Dear User,</p>
                                                                      <p style="margin:10px 0 10px 0;color:#565a5c;font-size:18px">We received a request to verify your email address. Please use the OTP below to complete the verification process:</p>
                                                                      <p style="margin:10px 0 10px 0;color:#565a5c;font-size:24px;font-weight:bold;text-align:center">${otp.verification_code}</p>
                                                                      <p style="margin:10px 0 10px 0;color:#565a5c;font-size:18px">This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                                                                      <p style="margin:10px 0 10px 0;color:#565a5c;font-size:18px">Thank you for using our services.</p>
                                                                    </td>
                                                                  </tr>
                                                                  <tr>
                                                                    <td height="20" style="line-height:20px"></td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td height="10" style="line-height:10px"></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 auto 0 auto;width:100%;max-width:600px">
                                <tbody>
                                  <tr>
                                    <td height="4" style="line-height:4px"></td>
                                  </tr>
                                  <tr>
                                    <td width="15px" style="width:15px"></td>
                                    <td width="20" style="display:block;width:20px"></td>
                                    <td style="text-align:center">
                                      <div style="padding-top:10px;display:flex">
                                        <div style="margin:auto"><img src="https://grovixlab.com/img/grovix-lab.png" height="20" alt=""></div><br>
                                      </div>
                                      <div style="height:10px"></div>
                                      <div style="color:#abadae;font-size:11px;margin:0 auto 5px auto">© Grovix. All rights reserved.<br></div>
                                    </td>
                                    <td width="20" style="display:block;width:20px"></td>
                                    <td width="15px" style="width:15px"></td>
                                  </tr>
                                  <tr> 
                                    <td height="32" style="line-height:32px"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td height="20" style="line-height:20px"></td>
                          </tr>
                        </tbody>
                      </table>
                      <span><img src="https://grovixlab.com/img/grovix-lab.png" style="border:0;width:1px;height:1px"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </body>
            </html>`
        });


        return res.status(201).json({ message: 'User registered successfully', user: { first_name, last_name, email, user_id: user._id } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
}
