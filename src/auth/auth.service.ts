import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // generate the token
  async login(user: any) {
    const payload = { id: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: "dSUNYPjdhqSqRrowcRuR30uSiHNw",
        expiresIn: "1w",
      }),
    };
  }
}
