import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
console.log(process.env.JWT_SECRETKEY, "sec");

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRETKEY,
    });
  }

  // validate token
  async validate(payload: any) {
    console.log(payload, 'payload???????');

    const user = await this.userService.findById({ _id: payload.id });
    console.log(user, 'user????????????');


    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
