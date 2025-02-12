import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetNewTokenRequestDto } from './dto/access-token.dto';
import { SigninRequestDTO, SigninResponseDTO, SignupRequestDTO, SignupResponseDTO } from './dto';

@Controller('/auth')
@ApiTags('Authentication And Authorization')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiOkResponse({ type: SignupResponseDTO, description: 'User successfully signed up' })
  async signupUser(@Body() body: SignupRequestDTO) {
    return await this.authService.signup(body);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user and obtain new tokens' })
  @ApiOkResponse({ type: SigninResponseDTO, description: 'User successfully signed in' })
  async loginUser(@Body() body: SigninRequestDTO) {
    return await this.authService.signin(body);
  }

  @Post('/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew access token using a refresh token' })
  @ApiOkResponse({ type: SigninResponseDTO, description: 'New access token generated' })
  async renewAccessToken(@Body() body: GetNewTokenRequestDto) {
    return this.authService.getNewTokens(body);
  }
}
