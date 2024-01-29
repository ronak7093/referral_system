import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { ISignUpDto } from "./dto/create-User.dto";
import { User } from "src/models/user.schema";
import { MESSAGE_CONSTANT } from "src/constant/message";
import * as bcrypt from "bcrypt";
import { UserMeta } from "src/models/userMeta.schema";
// import { S3Init } from "../s3/s3";
import { S3Service } from "src/s3/s3.service";
import { ISignInDto } from "./dto/login.dto";
import { ReferralsDto } from "./dto/refferals.dto";
import { Referral } from "src/models/referral.schema";
import { UpdateReferralsDto } from "./dto/updare-ref.dto";
import { ReferralMeta } from "src/models/referralMeta.schema";
import { ObjectId } from "mongodb";
import { EmailService } from "src/email/email.service";
import { FileMeta } from "src/models/file.schema";
import { UserDeviceInformation } from "src/models/user.deviceinformation.schema";
import { ILogoutDto } from "./dto/logout.dto";
import { AuthService } from "src/auth/auth.service";
import { IChangePasswordDto } from "./dto/change-password.dto";
import { url } from "inspector";

@Injectable()
export class UserService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    @InjectModel("User") private userModel: mongoose.Model<User>,
    @InjectModel("UserMeta") private userMetaModel: mongoose.Model<UserMeta>,
    @InjectModel("Referral") private referralModel: mongoose.Model<Referral>,
    @InjectModel("ReferralMeta")
    private referralMetaModel: mongoose.Model<ReferralMeta>,
    @InjectModel("FileMeta")
    private fileMetaModel: mongoose.Model<FileMeta>,
    @InjectModel("UserDeviceInformation")
    private userDeviceModel: mongoose.Model<UserDeviceInformation>
  ) { }

  async findById(id): Promise<User> {
    let record = await this.userModel.findOne({ _id: id });
    console.log(record, 'record????');

    return record;
  }

  async SignUp(req: ISignUpDto, file) {
    let exist = await this.userModel.findOne({ email: req.email });

    if (exist) {
      return {
        message: MESSAGE_CONSTANT.EMAIL_ALREADY_IN_USE,
        code: 400,
      };
    }

    const hashPassword = await bcrypt.hash(req.password, 10);
    const newUser = new this.userModel({
      firstName: req.firstName,
      lastName: req.lastName,
      businessName: req.businessName,
      email: req.email,
      password: hashPassword,
      smsNumber: req.smsNumber,
      // headShort: file.originalname,
      website: req.website,
      businessType: req.businessType,
      aboutMyBusiness: req.aboutMyBusiness,
      myPerfectClient: req.myPerfectClient,
    });
    let data = await newUser.save();
    let result;
    let url;
    let key =
      "referral-systems/" + "profile/" + data._id + Date.now().toString();

    if (file) {
      let imageData = await this.s3Service.uploadFileToS3(
        process.env.AWS_BUCKET,
        key,
        file.buffer
      );

      url = await this.s3Service.doGetSignedUrl(key);

      let imageRecord = new this.userMetaModel({
        headShort: file.originalname,
        mineType: file.mimetype,
        size: file.size,
        bucket: process.env.AWS_BUCKET,
        key: key,
        //@ts-ignore
        location: imageData.location,
        user: data._id,
      });
      result = await imageRecord.save();
      result.location = url;
    }

    if (req.deviceId) {
      let userDeviceInformation = await this.userDeviceModel.findOne({
        user: data.id,
      });

      if (!userDeviceInformation) {
        let udi = new this.userDeviceModel({
          deviceId: req.deviceId,
          user: data,
        });
        await udi.save();
      }
    }

    return {
      code: 200,
      data: { data, location: url },
      message: MESSAGE_CONSTANT.USER_REGISTER_SUCCESSFULLY,
    };
  }

  async SignIN(req: ISignInDto) {
    let record = await this.userModel.findOne({ email: req.email });

    if (!record) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }
    // if (!record.password) {
    //   return {
    //     message: MESSAGE_CONSTANT.INVALID_EMAIL_OR_PASSWORD,
    //     code: 404,
    //   };
    // }

    const isMatched = bcrypt.compareSync(req.password, record.password);

    if (!isMatched) {
      return {
        message: MESSAGE_CONSTANT.INVALID_PASSWORD,
        code: 404,
      };
    }

    // const payload = { sub: record.id, username: record.firstName };
    // const accessToken = await this.jwtServices.sign(
    //   { id: record.id, email: record.email },
    //   { secret: "dSUNYPjdhqSqRrowcRuR30uSiHNw" }
    // );

    let accessToken = await this.authService.login(record);

    // return { access_token: accessToken };

    if (req.deviceId) {
      let userDeviceInformation = await this.userDeviceModel.findOne({
        user: record.id,
      });

      if (!userDeviceInformation) {
        let udi = new this.userDeviceModel({
          deviceId: req.deviceId,
          user: record,
        });
        await udi.save();
      }
    }
    return {
      data: accessToken,
      message: MESSAGE_CONSTANT.USER_LOGIN_SUCCESSFULLY,
      code: 200,
    };
  }

  async ChangePassword(userId, userData: IChangePasswordDto) {
    let userRecord = await this.userModel.findById(userId);

    if (!userRecord) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }

    // check new password and confirm password same
    if (userData.new_password !== userData.confirm_Password) {
      return {
        message:
          MESSAGE_CONSTANT.CONFIRM_PASSWORD_AND_NEW_PASSWORD_MUST_BE_SAME,
        code: 422,
      };
    }

    // check new password and old password different
    if (userData.new_password === userData.old_password) {
      return {
        message:
          MESSAGE_CONSTANT.NEW_PASSWORD_AND_OLD_PASSWORD_MUST_BE_DIFFERENT,
        code: 422,
      };
    }

    //check old password and user password same or not
    const isMatched = bcrypt.compareSync(
      userData.old_password,
      userRecord.password
    );
    if (!isMatched) {
      return {
        message: MESSAGE_CONSTANT.INVALID_OLD_PASSWORD,
        code: 422,
      };
    }

    // bcrypt the new password  and update the password
    const hashedPassword = await bcrypt.hash(userData.new_password, 10);

    const filterUser = { _id: new ObjectId(userId) };
    const updateFields = {
      password: hashedPassword,
    };
    await this.userModel.updateOne(filterUser, updateFields);

    return {
      message: MESSAGE_CONSTANT.PASSWORD_CHANGED_SUCCESSFULLY,
      code: 200,
    };
  }

  async SignOff(id, payload: ILogoutDto) {

    let record = await this.userModel
      .findOne({ _id: id })
      .populate({ path: "UserDeviceInformation", select: "deviceId" });

    if (!record) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }
    //@ts-ignore
    if (record.UserDeviceInformation[0].deviceId == payload.deviceId) {
      await this.userDeviceModel.deleteOne({
        deviceId: payload.deviceId,
      });
    }
    return {
      message: MESSAGE_CONSTANT.LOGOUT_SUCCESSFULLY,
      code: 200,
    };
  }

  async UserProfile(id) {
    let userRecord = await this.userModel
      .findOne({
        _id: id,
      })
      .populate({
        path: "UserMeta",
        select: "headShort bucket key location",
      })
      .populate({
        path: "FileMeta",
        match: { isDeleted: false },
        select: "originalName",
      })
      .exec();

    const url = await this.s3Service.doGetSignedUrl(
      //@ts-ignore
      userRecord.UserMeta[0].key
    );

    let element;
    //@ts-ignore
    for (let i = 0; i < userRecord.FileMeta.length; i++) {
      //@ts-ignore
      element = userRecord.FileMeta[i];
    }

    let responsePayload = {
      name: userRecord.firstName + " " + userRecord.lastName,
      email: userRecord.email,
      smsNumber: userRecord.smsNumber,
      website: userRecord.website,
      aboutMyBusiness: userRecord.aboutMyBusiness,
      myPerfectClient: userRecord.myPerfectClient,
      pdfName: element?.originalName ? element?.originalName : "null",
      //@ts-ignore
      profileUrl: url,
    };

    return {
      data: responsePayload,
      code: 200,
    };
  }

  async Update(updateUser, loginPayload, file) {
    let { _id } = loginPayload;

    let userRecord = await this.userModel.findById(_id).populate("UserMeta");

    if (!userRecord) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }

    userRecord.firstName = updateUser.firstName;
    userRecord.lastName = updateUser.lastName;
    userRecord.businessName = updateUser.businessName;
    userRecord.smsNumber = updateUser.smsNumber;
    userRecord.website = updateUser.website;
    userRecord.businessType = updateUser.businessType;
    userRecord.aboutMyBusiness = updateUser.aboutMyBusiness;
    userRecord.myPerfectClient = updateUser.myPerfectClient;
    let userData = await this.userModel.findByIdAndUpdate(
      { _id: userRecord?._id },
      { $set: userRecord }
    );

    let key =
      "referral-systems/" + "profile/" + userRecord._id + Date.now().toString();
    let url;
    if (file) {

      let imageData = await this.s3Service.uploadFileToS3(
        process.env.AWS_BUCKET,
        key,
        file.buffer
      );

      url = await this.s3Service.doGetSignedUrl(key);

      let element;
      //@ts-ignore
      for (let i = 0; i < userRecord.UserMeta.length; i++) {
        //@ts-ignore
        element = userRecord.UserMeta[i];
        element.headShort = file.originalname;
        (element.mineType = file.mimetype),
          (element.size = file.size),
          (element.bucket = process.env.AWS_BUCKET),
          (element.key = key),
          //@ts-ignore
          (element.location = imageData.location),
          (element.user = userRecord._id);
        let filterUserMeta = { _id: new ObjectId(element._id) };
        let updateUserMetaDoc = { $set: element };

        await this.userMetaModel.updateOne(filterUserMeta, updateUserMetaDoc);
      }
    }

    return {
      code: 200,
      data: { userData, location: url },
      message: MESSAGE_CONSTANT.UPDATE_USER_PROFILE,
    };
  }

  async searchUser(limit: number, page: number, searchtext, loginPayload) {
    if (page == 0) {
      page = 1;
    }

    let skip = (page - 1) * limit;
    let data = await this.userModel
      .find({
        $or: [
          {
            firstName: {
              $regex: searchtext,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchtext,
              $options: "i",
            },
          },
        ],
      })
      .select(
        "firstName lastName businessName email smsNumber website businessType aboutMyBusiness myPerfectClient"
      )
      .populate({ path: "UserMeta", select: "location" })
      .limit(limit)
      .skip(skip)
      .exec();

    let countData = await this.userModel
      .find({
        $or: [
          {
            firstName: {
              $regex: searchtext,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchtext,
              $options: "i",
            },
          },
        ],
      })
      .count();

    const totalPages = Math.ceil(countData / limit);
    const currentPage = page;
    const currentPageRecords = data.length;

    let isLastPage = true;
    if (countData / limit > page) {
      isLastPage = false;
    }

    let resData = {
      data: data,
      totalPages: totalPages,
      currentPage: currentPage,
      currentPageRecords: currentPageRecords,
      isLastPage,
    };
    return {
      data: resData,
      code: 200,
    };
  }

  async AddReferrals(_id, payload: ReferralsDto) {
    let record = await this.userModel.findById(_id);

    if (!record) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }

    const newUser = new this.referralModel({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      reason: payload.reason,
      role: payload.role,
      user: record.id,
    });
    let result = await newUser.save();

    let resData = {
      Name:
        result.firstName.charAt(0).toUpperCase() +
        result.firstName.slice(1) +
        " " +
        result.lastName.charAt(0).toUpperCase() +
        result.lastName.slice(1),
      businessType: result.role,
      cellPhoneNumber: result.phoneNumber,
      email: result.email,
      Why: result.reason,
    };

    return {
      data: resData,
      message: MESSAGE_CONSTANT.ADD_REFERRAL_SUCCESSFULLY,
      code: 200,
    };
  }

  async GetRefDetails(limit, page, loginPayload) {
    if (page == 0) {
      page = 1;
    }
    let skip = (page - 1) * limit;

    let { id } = loginPayload;

    let refData = await this.referralModel
      .find({ user: id })
      .select("firstName lastName email phoneNumber role reason createdAt")
      .limit(limit)
      .skip(skip)
      .exec();

    let finalRefData = [];
    for (let i = 0; i < refData.length; i++) {
      const element = refData[i];

      //time difference
      // let m1 = new Date("2023-10-31T12:24:54.939Z");
      let m1 = new Date(element.createdAt);

      let m2 = new Date();

      let seconds = Math.abs((m2.getTime() - m1.getTime()) / 1000);
      // console.log(seconds, "seconds");

      let d = Number(seconds);

      // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let h = Math.floor(d / 3600);
      // console.log(h, "h");
      let m = Math.floor((d % 3600) / 60);
      console.log(m, "m");
      let s = Math.floor((d % 3600) % 60);
      console.log(s, "s");

      const diffDays = Math.ceil(d / (60 * 60 * 24));

      // let hDisplay = h > 0 ? h + (h == 1 ? "h" : "h") : "00h";
      // let mDisplay = m > 0 ? m + (m == 1 ? "m" : "m") : "00m";
      // const diffTime = Math.abs(m2.getTime() - m1.getTime());
      // console.log(diffTime + " milliseconds");
      // console.log(diffDays + " days");
      // let sDisplay = s > 0 ? s + (s == 1 ? "s " : "s ") : "00s";
      // let duration = `${hDisplay}`;
      // console.log(duration, "duration");

      let hourDisplay =
        // check day
        h > 23
          ? diffDays + " " + " days ago"
          : // second data
          m === 0 && s < 60
            ? "less than a minute"
            : // minute data
            h === 0 && m < 60
              ? m + " " + "min ago"
              : // hrs
              h + " " + "hrs ago";

      let resData = {
        Name:
          element.firstName.charAt(0).toUpperCase() +
          element.firstName.slice(1) +
          " " +
          element.lastName.charAt(0).toUpperCase() +
          element.lastName.slice(1),
        businessType: element.role,
        cellPhoneNumber: element.phoneNumber,
        email: element.email,
        Why: element.reason,
        time: hourDisplay,
      };
      finalRefData.push(resData);
    }

    let refCount = await this.referralModel.find({ user: id }).count();

    const totalPages = Math.ceil(refCount / limit);
    const currentPage = page;
    const currentPageRecords = finalRefData.length;

    let isLastPage = true;
    if (refCount / limit > page) {
      isLastPage = false;
    }

    let resData = {
      data: finalRefData,
      totalPages: totalPages,
      currentPage: currentPage,
      currentPageRecords: currentPageRecords,
      isLastPage,
    };
    return {
      data: resData,
      code: 200,
    };
  }

  async UpdateRef(refId, loginPayload, payload: UpdateReferralsDto) {
    let { id } = loginPayload.userRecord;

    let referralData = await this.referralModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(refId),
        },
      },
      {
        $lookup: {
          from: "referralmetas",
          localField: "_id",
          foreignField: "referral",
          as: "referralData",
        },
      },
    ]);

    if (referralData.length === 0) {
      return {
        message: MESSAGE_CONSTANT.REFERRAL_NOT_FOUND,
        code: 404,
      };
    }

    await this.referralMetaModel.updateOne(
      {
        referral: referralData[0].referralData[0].referral,
      },
      {
        $set: { dealValue: payload.dealValue, status: payload.status },
      },
      { upsert: true }
    );

    let Name =
      loginPayload.userRecord.firstName.charAt(0).toUpperCase() +
      loginPayload.userRecord.firstName.slice(1) +
      " " +
      loginPayload.userRecord.lastName.charAt(0).toUpperCase() +
      loginPayload.userRecord.lastName.slice(1);

    let refName =
      referralData[0].firstName.charAt(0).toUpperCase() +
      referralData[0].firstName.slice(1) +
      " " +
      referralData[0].lastName.charAt(0).toUpperCase() +
      referralData[0].lastName.slice(1);
    await this.emailService.sendMail(
      referralData[0].email,
      "referral feedback",
      { referralName: refName, name: Name, Note: payload.note }
    );
    return {
      message: MESSAGE_CONSTANT.REFERRAL_UPDATE_SUCCESSFULLY,
      code: 200,
    };
  }

  async RefList(loginPayload) {
    let { id } = loginPayload;

    let record = await this.userModel.findOne({ _id: id });

    if (!record) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }
    let currentMonth = new Date().getMonth() + 1;

    let refData = await this.referralModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
            $lt: new Date(new Date().getFullYear(), currentMonth, 1),
          },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "user",
          foreignField: "_id",
          as: "referrals",
        },
      },
      {
        $group: {
          _id: { firstName: "$firstName", lastName: "$lastName" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $project: {
          _id: 0,
          firstName: "$_id.firstName",
          lastName: "$_id.lastName",
          count: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);
    let totalCount = [];
    for (let i = 0; i < refData.length; i++) {
      const element = refData[i];

      if (i == 0) {
        let referralFormate =
          "in" +
          " " +
          (i + 1) +
          "st" +
          " " +
          "place this month is " +
          (element.firstName.charAt(0).toUpperCase() +
            element.firstName.slice(1)) +
          " " +
          (element.lastName.charAt(0).toUpperCase() +
            element.lastName.slice(1)) +
          " " +
          "with" +
          " " +
          element.count +
          " " +
          "referrals!";
        totalCount.push(referralFormate);
      } else {
        let allReferralFormate =
          element.firstName.charAt(0).toUpperCase() +
          element.firstName.slice(1) +
          " " +
          (element.lastName.charAt(0).toUpperCase() +
            element.lastName.slice(1)) +
          " " +
          "has" +
          " " +
          "referred" +
          " " +
          element.count;
        totalCount.push(allReferralFormate);
      }
    }
    return {
      data: totalCount,
      code: 200,
    };
  }

  // let RefData = await this.referralModel.aggregate([
  //   {
  //     $lookup: {
  //       from: "user",
  //       localField: "_id",
  //       foreignField: "user",
  //       as: "referrals",
  //     },
  //   },
  //   {
  //     $limit: 2,
  //   },
  //   {
  //     $addFields: {
  //       refCount: { $size: "$referrals" },
  //     },
  //   },
  //   {
  //     $sort: {
  //       refCount: -1,
  //     },
  //   },
  // ]);
  // console.log(RefData, "RefData");

  // let result = [];
  // for (let i = 0; i < RefData.length; i++) {
  //   let element = RefData[i];

  //   let monthData = moment(element.createdAt).format("MM");
  //   console.log(typeof monthData, "monthData");

  //   console.log(typeof parseInt(monthData), "mo");
  //   let currentMonth = moment().format("MM");
  //   console.log(typeof currentMonth, "currnt");

  //   console.log(typeof parseInt(currentMonth), "cmo");
  //   console.log(monthData === currentMonth, "log");

  //   if (monthData === currentMonth) {
  //     let type =
  //       i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : i + 1 === 3 ? "rd" : "th";
  //     console.log(
  //       "in" +
  //         " " +
  //         (i + 1) +
  //         type +
  //         " " +
  //         "place this month is " +
  //         (element.firstName.charAt(0).toUpperCase() +
  //           element.firstName.slice(1)) +
  //         " " +
  //         (element.lastName.charAt(0).toUpperCase() +
  //           element.lastName.slice(1)) +
  //         " " +
  //         "with" +
  //         " " +
  //         element.refCount +
  //         " " +
  //         "referrals!"
  //     );

  //     result.push(
  //       "in" +
  //         " " +
  //         (i + 1) +
  //         type +
  //         " " +
  //         "place this month is " +
  //         (element.firstName.charAt(0).toUpperCase() +
  //           element.firstName.slice(1)) +
  //         " " +
  //         (element.lastName.charAt(0).toUpperCase() +
  //           element.lastName.slice(1)) +
  //         " " +
  //         "with" +
  //         " " +
  //         (element.refCount + 1) +
  //         " " +
  //         "referrals!"
  //     );
  //   }
  // }
  // return result;

  async doUploadFile(loginPayload, file) {
    let { _id } = loginPayload;
    let userRecord = await this.userModel.findById(_id);

    if (!userRecord) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }

    var pdfKey =
      "referral-systems-pdf/" +
      "user/" +
      userRecord._id +
      Date.now().toString();
    let imageData = await this.s3Service.uploadFileToS3(
      process.env.AWS_BUCKET,
      pdfKey,
      file.buffer
    );

    let url = await this.s3Service.doGetSignedUrl(pdfKey);
    console.log(url, "url");

    const newUploadFile = new this.fileMetaModel({
      originalName: file.originalname,
      mineType: file.mimetype,
      size: file.size,
      bucket: process.env.AWS_BUCKET,
      key: pdfKey,
      //@ts-ignore
      location: imageData.Location,
      isDeleted: false,
      user: userRecord._id,
    });
    let data = await newUploadFile.save();

    return {
      data: MESSAGE_CONSTANT.PDF_ADDED_SUCCESSFULLY,
      code: 200,
    };
  }

  async doDeleteFile(loginPayload) {
    let { _id } = loginPayload;
    let userRecord = await this.fileMetaModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "user",
          foreignField: "_id",
          as: "pdfData",
        },
      },
    ]);
    if (!userRecord) {
      return {
        message: MESSAGE_CONSTANT.USER_NOT_FOUND,
        code: 404,
      };
    }

    let element;
    for (let i = 0; i < userRecord.length; i++) {
      element = userRecord[i];
      element.isDeleted = true;
      element.user = _id;

      let filterUserMeta = { _id: new ObjectId(element._id) };
      let updateUserMetaDoc = { $set: element };

      await this.fileMetaModel.updateOne(filterUserMeta, updateUserMetaDoc);
    }
    return {
      message: MESSAGE_CONSTANT.PDF_DELETED_SUCCESSFULLY,
      code: 200,
    };
  }
}
