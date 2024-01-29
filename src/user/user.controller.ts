import {
  Body,
  Controller,
  HttpException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Get,
  Put,
  Param,
  Query,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ISignUpDto } from "./dto/create-User.dto";
import { UserService } from "./user.service";
import { ISignInDto } from "./dto/login.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { IUpdateUserDto } from "./dto/update-User.dto";
import { ReferralsDto } from "./dto/refferals.dto";
import { UpdateReferralsDto } from "./dto/updare-ref.dto";
import { ILogoutDto } from "./dto/logout.dto";
import { IChangePasswordDto } from "./dto/change-password.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // user signup
  @Post("/signup")
  @UseInterceptors(FileInterceptor("file"))
  async createUser(@Body() body: ISignUpDto, @UploadedFile() file) {
    try {
      let response = await this.userService.SignUp(body, file);
      return {
        data: response,
      };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  // user sign-in
  @Post("/sign-in")
  async loginUser(@Body() body: ISignInDto) {
    try {
      let response = await this.userService.SignIN(body);
      return { data: response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // change password
  @Put("/change-password")
  @UseGuards(JwtAuthGuard)
  async editPassword(
    @Body() body: IChangePasswordDto,
    @Request() req
  ): Promise<any> {
    try {
      let response = await this.userService.ChangePassword(req.user.id, body);
      return { data: response };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  // user profile
  @Get("/profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      let response = await this.userService.UserProfile(req.user.id);
      return {
        data: response,
      };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // update the user
  @Put("/updateuser")
  @UseInterceptors(FileInterceptor("image"))
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Body() updateUser: IUpdateUserDto,
    @Request() req,
    @UploadedFile() image
  ) {
    try {
      let response = await this.userService.Update(
        // id,
        updateUser,
        req.user,
        image
      );
      return response;
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  //search the people
  @Get("/search")
  @UseGuards(JwtAuthGuard)
  async findUser(@Query() query, @Request() req) {
    try {
      let { limit, page, searchtext } = query;
      let response = await this.userService.searchUser(
        parseInt(limit),
        parseInt(page),
        searchtext,
        req.user
      );
      return { data: response };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  // add referral api
  @Post("/add-ref")
  @UseGuards(JwtAuthGuard)
  async addRef(@Request() req, @Body() body: ReferralsDto) {
    try {
      let response = await this.userService.AddReferrals(req.user._id, body);
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // retrieve referral  data
  @Get("/retrieve/ref")
  @UseGuards(JwtAuthGuard)
  async getRef(@Request() req) {
    try {
      let { limit, page } = req.query;
      let response = await this.userService.GetRefDetails(
        parseInt(limit),
        parseInt(page),
        req.user
      );
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // update the referrals metadata
  @Put("/update/ref/:id")
  @UseGuards(JwtAuthGuard)
  async updateRef(
    @Param("id") id: number,
    @Request() req,
    @Body() body: UpdateReferralsDto
  ) {
    try {
      let response = await this.userService.UpdateRef(id, req.user, body);
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // this api use for top 10 list  this month
  @Get("/ref-list")
  @UseGuards(JwtAuthGuard)
  async topList(@Request() req) {
    try {
      let response = await this.userService.RefList(req.user);
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // upload user pdf
  @Post("/upload-file")
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(JwtAuthGuard)
  async uploadFile(@Request() req, @UploadedFile() file) {
    try {
      let response = await this.userService.doUploadFile(req.user, file);
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // delete pdf
  @Delete("/removepdf")
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Request() req) {
    try {
      let response = await this.userService.doDeleteFile(req.user);
      return { response };
    } catch (error) {
      console.log(error, "error");
      throw new HttpException(error, 400);
    }
  }

  // logout the user
  @Post("/logout")
  @UseGuards(JwtAuthGuard)
  async logoutUser(@Request() req, @Body() body: ILogoutDto) {
    try {
      let response = await this.userService.SignOff(req.user.id, body);
      return {
        data: response,
      };
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
