import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RefreshJwtGuard } from "@/common/guard/refresh-jwt.guard";
import { IRequest } from "@/common/interfaces/request.interface";
import { ValidationPipe } from "@/common/pipes/validation.pipe";
import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterPatientDto,
} from "./dto/auth.dto";
import { RefreshTokenUser } from "./refresh-jwt.strategy";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Public patient self-registration" })
  registerPatient(@Body(new ValidationPipe()) dto: RegisterPatientDto) {
    return this.authService.registerPatient(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({ summary: "Login with phone + password" })
  login(@Body(new ValidationPipe()) dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  // RefreshJwtGuard verifies the refresh token from the body first.
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  @UseGuards(RefreshJwtGuard)
  @ApiOperation({
    summary: "Rotate the refresh token and get a new access token",
  })
  refresh(
    @Body(new ValidationPipe()) _dto: RefreshTokenDto,
    @Req() req: IRequest,
  ) {
    return this.authService.refresh(
      req.user as unknown as RefreshTokenUser,
      _dto.refreshToken,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  @ApiOperation({ summary: "Log out the current device" })
  logout(
    @Body(new ValidationPipe()) dto: RefreshTokenDto,
    @Req() req: IRequest,
  ) {
    const bearer = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i);
    return this.authService.logout(dto.refreshToken, bearer?.[1]);
  }

  @HttpCode(HttpStatus.OK)
  @Post("change-password")
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change own password" })
  changePassword(
    @Body(new ValidationPipe()) dto: ChangePasswordDto,
    @Req() req: IRequest,
  ) {
    return this.authService.changePassword(this.currentUser(req), dto);
  }

  @Get("me")
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Who am I? (needs a valid access token)" })
  getCurrentUser(@Req() req: IRequest) {
    const user = this.currentUser(req);
    return { id: user.id, role: user.role, roles: user.roles };
  }

  private currentUser(req: IRequest) {
    if (!req.user) throw new UnauthorizedException("User not authenticated");
    return req.user;
  }
}

